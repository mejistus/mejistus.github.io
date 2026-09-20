// Smoke tests for the site: `npm test` (or `node tests/smoke.mjs`).
//
// Serves the repository over http and drives it with a headless browser, so
// the checks exercise the real renderer, editor and pre-rendered TikZ images.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/markdown; charset=utf-8',
  '.tex': 'text/plain; charset=utf-8', '.css': 'text/css; charset=utf-8',
};

function serve() {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    let file = join(ROOT, normalize(rel).replace(/^(\.\.[/\\])+/, ''));
    if (rel === '' || rel.endsWith('/')) file = join(file, 'index.html');
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise(resolve => server.listen(0, () => resolve({ server, port: server.address().port })));
}

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? '  ok  ' : 'FAIL  '}${name}${ok || !detail ? '' : ` — ${detail}`}`);
  if (!ok) failures++;
}

// Every pre-rendered TikZ image should belong to a picture some post still has.
async function checkTikzImages() {
  globalThis.window = globalThis;
  await import('../assets/tikz-nn.js');
  await import('../assets/latex.js');
  const walk = async (dir) => (await readdir(dir, { withFileTypes: true }))
    .reduce(async (acc, e) => (await acc).concat(e.isDirectory()
      ? await walk(join(dir, e.name)) : [join(dir, e.name)]), Promise.resolve([]));
  const posts = (await walk(join(ROOT, 'notes'))).filter(f => f.endsWith('.tex'));
  const used = new Set();
  for (const post of posts) {
    const html = window.parseLatex(await readFile(post, 'utf8'));
    for (const m of html.matchAll(/data-tikz-hash="(\w+)"/g)) used.add(m[1]);
  }
  const stored = existsSync(join(ROOT, 'notes/tikz'))
    ? (await readdir(join(ROOT, 'notes/tikz'))).filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4))
    : [];
  check('every TikZ picture has a pre-rendered SVG', [...used].every(h => stored.includes(h)),
    [...used].filter(h => !stored.includes(h)).join(', '));
  check('no orphaned TikZ SVGs', stored.every(h => used.has(h)),
    stored.filter(h => !used.has(h)).join(', '));
}

// Reference import: BibTeX in, \bibitem out.
async function checkBib() {
  globalThis.window = globalThis;
  await import('../assets/bib.js');
  const [entry] = window.Bib.parse(
    '@inproceedings{ho2020denoising, title={Denoising Diffusion Probabilistic Models},' +
    ' author={Ho, Jonathan and Jain, Ajay and Abbeel, Pieter}, booktitle={NeurIPS}, year={2020}}');
  check('BibTeX parses', entry && entry.fields.year === '2020');
  check('bibitem is formatted', window.Bib.format(entry) ===
    '\\bibitem{ho2020denoising} J. Ho, A. Jain, P. Abbeel. Denoising Diffusion Probabilistic Models. In \\emph{NeurIPS}, 2020.',
    window.Bib.format(entry));
  const [arxiv] = window.Bib.parse('@misc{https://doi.org/10.48550/arxiv.2006.11239, doi={10.48550/ARXIV.2006.11239},' +
    ' author={Ho, Jonathan}, title={Denoising Diffusion Probabilistic Models}, publisher={arXiv}, year={2020}}');
  check('arXiv entries get a readable key', window.Bib.key(arxiv) === 'ho2020denoising', window.Bib.key(arxiv));
  check('arXiv entries cite the preprint id', window.Bib.format(arxiv).includes('arXiv:2006.11239'));
  check('DOIs and arXiv links are recognised',
    window.Bib.isLookup('https://arxiv.org/abs/2006.11239') && window.Bib.isLookup('10.1145/3422622') &&
    !window.Bib.isLookup('@article{x, title={y}}'));
}

const { server, port } = await serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

try {
  await checkTikzImages();
  await checkBib();

  await page.goto(`http://localhost:${port}/`);
  await page.waitForFunction(() => typeof blogs !== 'undefined' && blogs.length > 0, null, { timeout: 20000 });
  check('home page lists posts', (await page.evaluate(() => blogs.length)) > 0);
  check('projects and poems load', (await page.evaluate(() => projects.length && poems.length)) > 0);

  // The example post exercises most of the renderer.
  const example = await page.evaluate(() => blogs.findIndex(b => /Example\//.test(b.file || '')));
  check('example post is present', example >= 0);
  if (example >= 0) {
    await page.evaluate(async (i) => { await openBlogPanel(i); }, example);
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const c = document.getElementById('blogPanelContent');
      const refs = [...c.querySelectorAll('a[href^="#tex"]')];
      return {
        tables: c.querySelectorAll('table.latex-table').length,
        figures: c.querySelectorAll('figure.latex-float').length,
        bib: c.querySelectorAll('.latex-bib li').length,
        alg: c.querySelectorAll('.latex-alg-line').length,
        tikz: [...c.querySelectorAll('.latex-tikz')].map(x => x.dataset.tikzState),
        brokenRefs: refs.filter(a => !c.querySelector('#' + CSS.escape(a.getAttribute('href').slice(1)))).length,
        rawLatex: /\\(begin|section|textbf)\b/.test(c.textContent.replace(/\\(verb|texttt)/g, '')),
        toc: document.querySelectorAll('.blog-toc-item').length,
      };
    });
    check('tables render', r.tables >= 2, `got ${r.tables}`);
    check('figures render', r.figures >= 5, `got ${r.figures}`);
    check('bibliography renders', r.bib === 4, `got ${r.bib}`);
    check('pseudocode renders', r.alg > 5, `got ${r.alg}`);
    check('cross-references resolve', r.brokenRefs === 0, `${r.brokenRefs} dangling`);
    check('TikZ pictures come from stored SVGs', r.tikz.length > 0 && r.tikz.every(s => s === 'static'), r.tikz.join(','));
    check('contents lists sections', r.toc >= 3, `got ${r.toc}`);
  }

  // Editor: mode lock, compiling, and a clean lint for the example post.
  await page.evaluate(() => { sessionStorage.setItem('gh_token', 'test'); sessionStorage.setItem('gh_user', 'test'); });
  await page.reload();
  await page.waitForFunction(() => typeof blogs !== 'undefined' && blogs.length > 0, null, { timeout: 20000 });
  await page.evaluate(async (i) => { await openBlogPanel(i); openEditor(); }, example);
  await page.waitForTimeout(1200);
  const ed = await page.evaluate(async () => {
    await runLint();
    const sw = document.getElementById('editorModeSwitch');
    return {
      mode: editorMode,
      locked: sw.classList.contains('locked'),
      problems: problems.map(p => `L${p.line} ${p.message}`),
      gutter: document.querySelectorAll('.editor-gutter-line').length,
      highlighted: document.querySelectorAll('#editorHighlight .token').length,
    };
  });
  check('saved .tex opens locked in LaTeX mode', ed.mode === 'latex' && ed.locked);
  check('line numbers render', ed.gutter > 50, `got ${ed.gutter}`);
  check('syntax highlighting runs', ed.highlighted > 50, `got ${ed.highlighted}`);
  check('example post lints clean', ed.problems.length === 0, ed.problems.join(' | '));

  check('no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  server.close();
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
