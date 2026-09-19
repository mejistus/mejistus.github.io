// LaTeX → HTML renderer for blog posts.
//
// Covers the article-level subset people actually write in posts: sections,
// lists, tabular (booktabs / \hline / \multicolumn / \multirow), figures and
// tables with captions, theorem-like environments, footnotes, \label/\ref,
// \newcommand, verbatim/lstlisting/minted. Math goes to KaTeX, code to Prism.
// Unknown commands degrade to their argument text instead of failing.
//
// Exposes window.parseLatex(source) → HTML string.
(function () {
  'use strict';

  const MATH_ENVS = [
    'equation', 'equation*', 'align', 'align*', 'gather', 'gather*',
    'multline', 'multline*', 'eqnarray', 'eqnarray*', 'alignat', 'alignat*',
    'flalign', 'flalign*', 'displaymath', 'math',
  ];
  const TABULAR_ENVS = ['tabular', 'tabular*', 'tabularx', 'tabulary', 'longtable', 'longtable*'];
  const FLOAT_ENVS = {
    figure: 'figure', 'figure*': 'figure', wrapfigure: 'figure', subfigure: 'figure',
    table: 'table', 'table*': 'table',
  };
  const LIST_ENVS = { itemize: 'ul', enumerate: 'ol', description: 'dl' };
  const QUOTE_ENVS = ['quote', 'quotation', 'verse'];

  const NAMES = {
    en: {
      figure: 'Figure', table: 'Table', abstract: 'Abstract', proof: 'Proof',
      theorem: 'Theorem', lemma: 'Lemma', corollary: 'Corollary', proposition: 'Proposition',
      definition: 'Definition', remark: 'Remark', example: 'Example', section: 'Section', equation: 'Equation',
      references: 'References',
    },
    zh: {
      figure: '图', table: '表', abstract: '摘要', proof: '证明',
      theorem: '定理', lemma: '引理', corollary: '推论', proposition: '命题',
      definition: '定义', remark: '注', example: '例', section: '节', equation: '式',
      references: '参考文献',
    },
  };

  const SIZES = {
    tiny: 0.6, scriptsize: 0.7, footnotesize: 0.8, small: 0.9, normalsize: 1,
    large: 1.2, Large: 1.44, LARGE: 1.73, huge: 2.07, Huge: 2.49,
  };
  const DECLARATIONS = {
    bf: ['<strong>', '</strong>'], bfseries: ['<strong>', '</strong>'],
    it: ['<em>', '</em>'], itshape: ['<em>', '</em>'], em: ['<em>', '</em>'],
    sl: ['<em>', '</em>'], slshape: ['<em>', '</em>'],
    tt: ['<code class="latex-tt">', '</code>'], ttfamily: ['<code class="latex-tt">', '</code>'],
    sc: ['<span class="latex-sc">', '</span>'], scshape: ['<span class="latex-sc">', '</span>'],
    sf: ['<span class="latex-sf">', '</span>'], sffamily: ['<span class="latex-sf">', '</span>'],
    rm: ['', ''], rmfamily: ['', ''], upshape: ['', ''], mdseries: ['', ''], normalfont: ['', ''],
  };
  const WRAPPERS = {
    textbf: ['<strong>', '</strong>'], textit: ['<em>', '</em>'], emph: ['<em>', '</em>'],
    textsl: ['<em>', '</em>'], underline: ['<u>', '</u>'], uline: ['<u>', '</u>'],
    texttt: ['<code class="latex-tt">', '</code>'], textsc: ['<span class="latex-sc">', '</span>'],
    textsf: ['<span class="latex-sf">', '</span>'], sout: ['<s>', '</s>'], st: ['<s>', '</s>'],
    hl: ['<mark>', '</mark>'], textsuperscript: ['<sup>', '</sup>'], textsubscript: ['<sub>', '</sub>'],
    textrm: ['', ''], textup: ['', ''], textmd: ['', ''], textnormal: ['', ''],
    mbox: ['', ''], hbox: ['', ''], text: ['', ''], fbox: ['<span class="latex-fbox">', '</span>'],
  };
  const SYMBOLS = {
    ldots: '…', dots: '…', textellipsis: '…', textbackslash: '\\', textasciitilde: '~',
    textasciicircum: '^', textbar: '|', textless: '&lt;', textgreater: '&gt;', textbullet: '•',
    textendash: '–', textemdash: '—', textquoteleft: '‘', textquoteright: '’',
    textquotedblleft: '“', textquotedblright: '”', copyright: '©', textcopyright: '©',
    textregistered: '®', texttrademark: '™', S: '§', P: '¶', dag: '†', ddag: '‡',
    pounds: '£', euro: '€', texteuro: '€', textdegree: '°', textperiodcentered: '·',
    quad: '&emsp;', qquad: '&emsp;&emsp;', enspace: '&ensp;', thinspace: '&thinsp;',
    newline: '<br>', linebreak: '<br>', par: ' ', hfill: ' ', hfil: ' ', indent: '',
    noindent: '', centering: '', raggedright: '', raggedleft: '', nolinebreak: '',
    maketitle: '', tableofcontents: '', newpage: '', clearpage: '', cleardoublepage: '',
    bigskip: '', medskip: '', smallskip: '', protect: '', relax: '', null: '',
    appendix: '', frontmatter: '', mainmatter: '', backmatter: '', item: '',
    TeX: '<span class="latex-logo">T<span class="e">e</span>X</span>',
    LaTeX: '<span class="latex-logo">L<span class="a">a</span>T<span class="e">e</span>X</span>',
    LaTeXe: '<span class="latex-logo">L<span class="a">a</span>T<span class="e">e</span>X&thinsp;2<sub>ε</sub></span>',
    XeTeX: '<span class="latex-logo">X<span class="e">Ǝ</span>T<span class="e">e</span>X</span>',
  };
  // Commands whose arguments are consumed and dropped (preamble / layout noise).
  const DROP_ARGS = {
    title: 1, author: 1, date: 1, thanks: 1, vspace: 1, 'vspace*': 1, hspace: 1, 'hspace*': 1,
    pagestyle: 1, thispagestyle: 1, pagenumbering: 1, setlength: 2, addtolength: 2,
    setcounter: 2, addtocounter: 2, stepcounter: 1, bibliographystyle: 1, bibliography: 1,
    graphicspath: 1, hypersetup: 1, geometry: 1, captionsetup: 1, lstset: 1, setminted: 1,
    usetikzlibrary: 1, addbibresource: 1, printbibliography: 0, phantom: 1,
    vskip: 0, kern: 0, index: 1, nocite: 1, input: 1, include: 1, usepackage: 1,
    documentclass: 1, newenvironment: 3, renewenvironment: 3, linespread: 1, color: 1,
  };
  const ACCENTS = {
    "'": '́', '`': '̀', '^': '̂', '"': '̈', '~': '̃',
    '=': '̄', '.': '̇', u: '̆', v: '̌', H: '̋', c: '̧', r: '̊',
  };

  const CJK = /[　-〿぀-ヿ㐀-鿿＀-￯]/;
  const SLOT = '\u0001';
  const REF = '\u0002';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Low-level scanning helpers ──

  // Read a balanced {...} group starting at or after i (skipping whitespace).
  function readGroup(s, i) {
    let j = i;
    while (j < s.length && /[ \t\n]/.test(s[j])) j++;
    if (s[j] !== '{') return null;
    let depth = 0;
    for (let k = j; k < s.length; k++) {
      const c = s[k];
      if (c === '\\') { k++; continue; }
      if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return { content: s.slice(j + 1, k), end: k + 1 };
    }
    return { content: s.slice(j + 1), end: s.length };
  }

  // Read an optional [...] argument (brace-aware) at or after i.
  function readOptional(s, i) {
    let j = i;
    while (j < s.length && /[ \t]/.test(s[j])) j++;
    if (s[j] !== '[') return null;
    let depth = 0;
    for (let k = j + 1; k < s.length; k++) {
      const c = s[k];
      if (c === '\\') { k++; continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === ']' && depth === 0) return { content: s.slice(j + 1, k), end: k + 1 };
    }
    return null;
  }

  // Read a mandatory argument: a {group} or a single token.
  function readArg(s, i) {
    const g = readGroup(s, i);
    if (g) return g;
    let j = i;
    while (j < s.length && /[ \t\n]/.test(s[j])) j++;
    if (j >= s.length) return { content: '', end: j };
    if (s[j] === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(j));
      return { content: m[0], end: j + m[0].length };
    }
    return { content: s[j], end: j + 1 };
  }

  // Find the \end{name} matching a \begin{name} whose body starts at i.
  function findEnd(s, name, i) {
    const b = '\\begin{' + name + '}', e = '\\end{' + name + '}';
    let depth = 1, k = i;
    while (k < s.length) {
      const nb = s.indexOf(b, k), ne = s.indexOf(e, k);
      if (ne < 0) break;
      if (nb >= 0 && nb < ne) { depth++; k = nb + b.length; continue; }
      if (--depth === 0) return { bodyEnd: ne, end: ne + e.length };
      k = ne + e.length;
    }
    return { bodyEnd: s.length, end: s.length };
  }

  // Split s at top-level occurrences of a separator matcher, ignoring
  // anything inside braces or nested environments.
  function splitTopLevel(s, matchAt) {
    const parts = [];
    let depth = 0, envDepth = 0, last = 0;
    for (let k = 0; k < s.length; k++) {
      const c = s[k];
      if (c === '{') { depth++; continue; }
      if (c === '}') { depth--; continue; }
      if (c === '\\') {
        if (s.startsWith('\\begin{', k)) { envDepth++; k += 6; continue; }
        if (s.startsWith('\\end{', k)) { envDepth--; k += 4; continue; }
      }
      if (depth === 0 && envDepth === 0) {
        const len = matchAt(s, k);
        if (len) {
          parts.push(s.slice(last, k));
          last = k + len;
          k = last - 1;
          continue;
        }
      }
      if (c === '\\') k++;
    }
    parts.push(s.slice(last));
    return parts;
  }

  // ── Renderer ──

  function parseLatex(source) {
    const ctx = {
      uid: 'tex' + Math.random().toString(36).slice(2, 8),
      slots: [],
      footnotes: [],
      labels: {},
      macros: {},
      katexMacros: {},
      theorems: {
        theorem: { name: 'theorem', counter: 'theorem' }, lemma: { name: 'lemma', counter: 'lemma' },
        corollary: { name: 'corollary', counter: 'corollary' }, proposition: { name: 'proposition', counter: 'proposition' },
        definition: { name: 'definition', counter: 'definition' }, remark: { name: 'remark', counter: 'remark' },
        example: { name: 'example', counter: 'example' }, proof: { name: 'proof', counter: null },
      },
      counters: { section: 0, subsection: 0, subsubsection: 0, figure: 0, table: 0, equation: 0 },
      bib: {},
      currentRef: null,
      listDepth: 0,
      names: NAMES.en,
    };

    let s = String(source || '').replace(/\r\n?/g, '\n');
    if (CJK.test(s)) ctx.names = NAMES.zh;

    // 1. Verbatim-like content first, before comments or math touch it.
    s = s.replace(/\\begin\{(verbatim\*?|lstlisting|minted)\}([\s\S]*?)\\end\{\1\}/g, (m, env, body) => {
      let lang = '';
      if (env === 'lstlisting') {
        const opt = /^\s*\[([^\]]*)\]/.exec(body);
        if (opt) {
          body = body.slice(opt[0].length);
          const l = /language\s*=\s*\{?([\w+#-]+)/i.exec(opt[1]);
          if (l) lang = l[1];
        }
      } else if (env === 'minted') {
        const opt = /^\s*(\[[^\]]*\])?\s*\{([^}]*)\}/.exec(body);
        if (opt) { body = body.slice(opt[0].length); lang = opt[2]; }
      }
      return slot(ctx, codeBlock(body.replace(/^[ \t]*\n/, '').replace(/\n[ \t]*$/, ''), lang), true);
    });
    s = s.replace(/\\(?:verb\*?|lstinline)([^a-zA-Z\s{])([\s\S]*?)\1/g, (m, d, code) =>
      slot(ctx, '<code>' + esc(code) + '</code>', false));
    s = s.replace(/\\mintinline\{[^}]*\}\{([^}]*)\}/g, (m, code) => slot(ctx, '<code>' + esc(code) + '</code>', false));

    // 2. Comments (this also removes the "% ---" front matter block).
    s = s.replace(/(^|[^\\])%.*$/gm, '$1');

    // \definecolor{name}{HTML|rgb|RGB}{value}
    userColors = {};
    s = s.replace(/\\definecolor\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/g, (m, name, model, val) => {
      const v = val.split(',').map(x => parseFloat(x));
      if (/^html$/i.test(model.trim())) userColors[name.trim()] = '#' + val.trim();
      else if (model.trim() === 'rgb' && v.length === 3) userColors[name.trim()] = `rgb(${v.map(x => Math.round(x * 255)).join(',')})`;
      else if (model.trim() === 'RGB' && v.length === 3) userColors[name.trim()] = `rgb(${v.join(',')})`;
      return '';
    });

    // Bibliography numbers are needed before any \cite is rendered.
    const bibRe = /\\bibitem\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}/g;
    for (let b; (b = bibRe.exec(s));) {
      const key = b[1].trim();
      if (!ctx.bib[key]) ctx.bib[key] = Object.keys(ctx.bib).length + 1;
    }

    // 3. Preamble: keep only the document body when there is one.
    const docStart = s.indexOf('\\begin{document}');
    if (docStart >= 0) {
      collectDefinitions(ctx, s.slice(0, docStart));
      const bodyStart = docStart + '\\begin{document}'.length;
      const docEnd = s.indexOf('\\end{document}', bodyStart);
      s = s.slice(bodyStart, docEnd < 0 ? s.length : docEnd);
    }
    s = collectDefinitions(ctx, s);

    // 4. Math → KaTeX slots.
    s = extractMath(ctx, s);

    // 5. Line breaks between CJK characters vanish, as with ctex.
    s = s.replace(new RegExp('(' + CJK.source + ')[ \\t]*\\n[ \\t]*(?=' + CJK.source + ')', 'g'), '$1');

    // Scaling wrappers around tables/figures only matter on paper.
    s = unwrapBoxes(s);

    // 6. Blocks + inline.
    let html = renderBlocks(ctx, s);

    if (ctx.footnotes.length) {
      html += '<section class="latex-footnotes"><ol>' + ctx.footnotes.map((fn, n) =>
        `<li id="${ctx.uid}-fn${n + 1}">${fn} <a href="#${ctx.uid}-fnref${n + 1}" class="latex-fn-back">↩</a></li>`
      ).join('') + '</ol></section>';
    }

    // Resolve slots (they may nest) then cross-references.
    for (let pass = 0; pass < 4 && html.includes(SLOT); pass++) {
      html = html.replace(/\u0001(\d+)\u0001/g, (m, n) => ctx.slots[+n].html);
    }
    html = html.replace(/\u0002([^\u0002]*)\u0002/g, (m, key) => {
      // \autoref / \cref put "@type:key" in front of the number for the type word.
      if (key.startsWith('@type:')) {
        const l = ctx.labels[key.slice(6)];
        const word = l && (ctx.names[l.type] || (ctx.theorems[l.type] && ctx.theorems[l.type].title));
        return word ? esc(word) + '&nbsp;' : '';
      }
      const l = ctx.labels[key];
      return l ? esc(l.num) : '??';
    });
    return html;
  }

  // \resizebox{w}{h}{X}, \scalebox{s}{X}, \adjustbox{opts}{X}, \rotatebox{a}{X} → X
  function unwrapBoxes(s) {
    const re = /\\(resizebox\*?|scalebox|adjustbox|rotatebox)(?![a-zA-Z])/g;
    const skip = { resizebox: 2, 'resizebox*': 2, scalebox: 1, adjustbox: 1, rotatebox: 1 };
    let m;
    while ((m = re.exec(s))) {
      let i = m.index + m[0].length;
      const o = readOptional(s, i); if (o) i = o.end;
      for (let k = 0; k < skip[m[1]]; k++) { const g = readGroup(s, i); if (!g) break; i = g.end; }
      const body = readGroup(s, i);
      if (!body) continue;
      const fit = m[1].startsWith('resizebox') || m[1] === 'adjustbox';
      s = s.slice(0, m.index) +
        (fit ? '\\begin{latexfit}' + body.content + '\\end{latexfit}' : body.content) + s.slice(body.end);
      re.lastIndex = m.index;
    }
    return s;
  }

  function slot(ctx, html, block) {
    ctx.slots.push({ html, block });
    return SLOT + (ctx.slots.length - 1) + SLOT;
  }

  function codeBlock(code, lang) {
    lang = String(lang || '').toLowerCase();
    const P = window.Prism;
    const grammar = P && P.languages[lang];
    const body = grammar ? P.highlight(code, grammar, lang) : esc(code);
    const cls = 'language-' + (grammar ? lang : 'plaintext');
    return `<pre class="${cls}"><code class="${cls}">${body}</code></pre>`;
  }

  // \newcommand / \def / \DeclareMathOperator / \newtheorem → registries.
  function collectDefinitions(ctx, s) {
    const re = /\\(newcommand|renewcommand|providecommand|DeclareMathOperator|def|newtheorem)(\*?)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(s))) {
      let i = m.index + m[0].length;
      const kind = m[1];
      if (kind === 'newtheorem') {
        const env = readGroup(s, i); if (!env) continue;
        i = env.end;
        const shared = readOptional(s, i); if (shared) i = shared.end;
        const title = readGroup(s, i); if (!title) continue;
        i = title.end;
        const within = readOptional(s, i); if (within) i = within.end;
        ctx.theorems[env.content.trim()] = {
          title: title.content.trim(),
          counter: m[2] ? null : (shared ? shared.content.trim() : env.content.trim()),
        };
      } else {
        let name;
        if (kind === 'def') {
          const nm = /^\s*\\([a-zA-Z]+)/.exec(s.slice(i)); if (!nm) continue;
          name = nm[1]; i += nm[0].length;
          while (s[i] && s[i] !== '{') i++;
        } else {
          const g = readArg(s, i); if (!g) continue;
          name = g.content.trim().replace(/^\\/, ''); i = g.end;
        }
        let nargs = 0;
        const n = readOptional(s, i);
        if (n && /^\d$/.test(n.content.trim())) { nargs = +n.content.trim(); i = n.end; }
        const dflt = readOptional(s, i); if (dflt) i = dflt.end;
        const body = readGroup(s, i); if (!body) continue;
        i = body.end;
        const expansion = kind === 'DeclareMathOperator'
          ? `\\operatorname${m[2] ? '*' : ''}{${body.content}}` : body.content;
        ctx.macros[name] = { nargs, body: expansion };
        ctx.katexMacros['\\' + name] = expansion;
      }
      out += s.slice(last, m.index);
      last = i;
      re.lastIndex = i;
    }
    return out + s.slice(last);
  }

  function renderMath(ctx, tex, display) {
    const K = window.katex;
    if (!K) return '<code>' + esc(tex) + '</code>';
    try {
      return K.renderToString(tex, { displayMode: display, throwOnError: false, macros: ctx.katexMacros });
    } catch (e) {
      return '<code>' + esc(tex) + '</code>';
    }
  }

  function extractMath(ctx, s) {
    // Numbered display environments: record \label → equation number.
    const envRe = new RegExp('\\\\begin\\{(' + MATH_ENVS.map(e => e.replace('*', '\\*')).join('|') + ')\\}([\\s\\S]*?)\\\\end\\{\\1\\}', 'g');
    s = s.replace(envRe, (m, env, body) => {
      const numbered = !env.endsWith('*') && env !== 'displaymath' && env !== 'math';
      const rows = /^(multline|equation)$/.test(env) ? [body] : body.split(/\\\\/);
      rows.forEach(row => {
        const isNumbered = numbered && !/\\(nonumber|notag)\b/.test(row);
        if (isNumbered) ctx.counters.equation++;
        const lbl = /\\label\{([^}]*)\}/.exec(row);
        if (lbl && isNumbered) ctx.labels[lbl[1].trim()] = { num: String(ctx.counters.equation), type: 'equation' };
      });
      body = body.replace(/\\label\{[^}]*\}/g, '');
      let tex;
      if (env === 'math') return slot(ctx, renderMath(ctx, body, false), false);
      if (env === 'displaymath') tex = body;
      else if (env.startsWith('eqnarray')) tex = `\\begin{array}{rcl}${body}\\end{array}`;
      else tex = `\\begin{${env}}${body}\\end{${env}}`;
      return slot(ctx, renderMath(ctx, tex, true), false);
    });

    // \[..\], \(..\), $$..$$, $..$ — scanned so that \$ is left alone.
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '\\' && (s[i + 1] === '[' || s[i + 1] === '(')) {
        const close = s[i + 1] === '[' ? '\\]' : '\\)';
        const j = s.indexOf(close, i + 2);
        if (j >= 0) {
          const tex = s.slice(i + 2, j).replace(/\\label\{[^}]*\}/g, '');
          out += slot(ctx, renderMath(ctx, tex, s[i + 1] === '['), false);
          i = j + 1;
          continue;
        }
      }
      if (c === '\\') { out += c + (s[i + 1] || ''); i++; continue; }
      if (c === '$') {
        const display = s[i + 1] === '$';
        const open = display ? 2 : 1;
        let j = i + open;
        while (j < s.length) {
          if (s[j] === '\\') { j += 2; continue; }
          if (s[j] === '$' && (!display || s[j + 1] === '$')) break;
          j++;
        }
        if (j < s.length) {
          out += slot(ctx, renderMath(ctx, s.slice(i + open, j), display), false);
          i = j + open - 1;
          continue;
        }
      }
      out += c;
    }
    return out;
  }

  // ── Block level ──

  const BLOCK_RE = /\\begin\{([^}]+)\}|\\(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)(\*?)|\n[ \t]*\n|\\par\b|\\(?:hrule|noindent|maketitle|tableofcontents|newpage|clearpage)\b|\\rule\s*(?:\[[^\]]*\])?\s*\{[^}]*\}\s*\{[^}]*\}/g;

  function renderBlocks(ctx, s) {
    let out = '', para = '';
    const flush = () => {
      const text = para.trim();
      para = '';
      if (!text) return;
      // A paragraph made only of block-level slots is emitted bare.
      const onlySlots = /^(\u0001\d+\u0001\s*)+$/.test(text) &&
        text.match(/\u0001(\d+)\u0001/g).every(t => ctx.slots[+t.slice(1, -1)].block);
      if (onlySlots) { out += text; return; }
      const html = renderInline(ctx, text).trim();
      if (html.replace(/<(?!img|hr|br|\u0001)[^>]*>/g, '').trim()) out += '<p>' + html + '</p>';
    };

    const re = new RegExp(BLOCK_RE.source, 'g');
    let last = 0, m;
    while ((m = re.exec(s))) {
      para += s.slice(last, m.index);
      last = re.lastIndex;
      const tok = m[0];
      if (m[1]) {
        const env = m[1].trim();
        const { bodyEnd, end } = findEnd(s, env, re.lastIndex);
        const body = s.slice(re.lastIndex, bodyEnd);
        flush();
        out += renderEnvironment(ctx, env, body);
        last = end;
        re.lastIndex = end;
      } else if (m[2]) {
        let i = re.lastIndex;
        const short = readOptional(s, i); if (short) i = short.end;
        const title = readGroup(s, i);
        if (!title) continue;
        last = re.lastIndex = title.end;
        if (m[2] === 'paragraph' || m[2] === 'subparagraph') {
          para += slot(ctx, '<strong class="latex-paragraph">' + renderInline(ctx, title.content) + '</strong> ', false);
          continue;
        }
        flush();
        out += renderHeading(ctx, m[2], !!m[3], title.content, s.slice(last));
      } else if (/^\\(hrule|rule)/.test(tok)) {
        flush();
        out += '<hr class="latex-rule">';
      } else if (/^\n|^\\par/.test(tok)) {
        flush();
      }
      // \noindent, \maketitle, ... are dropped.
    }
    para += s.slice(last);
    flush();
    return out;
  }

  function renderHeading(ctx, kind, starred, title, rest) {
    const level = { part: 2, chapter: 2, section: 2, subsection: 3, subsubsection: 4 }[kind];
    let num = '';
    if (!starred && /section$/.test(kind)) {
      const c = ctx.counters;
      if (kind === 'section') { c.section++; c.subsection = 0; c.subsubsection = 0; num = `${c.section}`; }
      if (kind === 'subsection') { c.subsection++; c.subsubsection = 0; num = `${c.section}.${c.subsection}`; }
      if (kind === 'subsubsection') { c.subsubsection++; num = `${c.section}.${c.subsection}.${c.subsubsection}`; }
    }
    // A \label right after the heading names it.
    const lbl = /^\s*\\label\{([^}]*)\}/.exec(rest);
    const id = lbl ? `${ctx.uid}-${lbl[1].trim()}` : '';
    if (lbl && num) ctx.labels[lbl[1].trim()] = { num, type: 'section' };
    ctx.currentRef = num ? { num, type: 'section' } : null;
    return `<h${level}${id ? ` id="${esc(id)}"` : ''}>` +
      (num ? `<span class="latex-secnum">${num}</span>` : '') +
      renderInline(ctx, title) + `</h${level}>`;
  }

  function renderEnvironment(ctx, env, body) {
    const base = env.replace(/\*$/, '');
    if (LIST_ENVS[env]) return renderList(ctx, env, body);
    if (TABULAR_ENVS.includes(env)) return renderTabular(ctx, env, body, null);
    if (FLOAT_ENVS[env]) return renderFloat(ctx, FLOAT_ENVS[env], env, body);
    if (QUOTE_ENVS.includes(env)) return '<blockquote class="latex-quote">' + renderBlocks(ctx, body) + '</blockquote>';
    if (env === 'center') return '<div class="latex-center">' + renderBlocks(ctx, body) + '</div>';
    if (env === 'flushright') return '<div class="latex-right">' + renderBlocks(ctx, body) + '</div>';
    if (env === 'flushleft') return '<div>' + renderBlocks(ctx, body) + '</div>';
    if (env === 'abstract') {
      return '<div class="latex-abstract"><p class="latex-abstract-title">' + ctx.names.abstract + '</p>' +
        renderBlocks(ctx, body) + '</div>';
    }
    if (env === 'thebibliography') return renderBibliography(ctx, body);
    if (env === 'adjustbox') {
      const g = readGroup(body, 0);
      return '<div class="latex-fit"><div>' + renderBlocks(ctx, g ? body.slice(g.end) : body) + '</div></div>';
    }
    if (env === 'latexfit') return '<div class="latex-fit"><div>' + renderBlocks(ctx, body) + '</div></div>';
    if (env === 'minipage') {
      const opt = readOptional(body, 0);
      const w = readGroup(body, opt ? opt.end : 0);
      return '<div class="latex-minipage">' + renderBlocks(ctx, w ? body.slice(w.end) : body) + '</div>';
    }
    if (ctx.theorems[env] || ctx.theorems[base]) return renderTheorem(ctx, ctx.theorems[env] || ctx.theorems[base], env, body);
    // document, unknown environments, ...: just their content.
    return renderBlocks(ctx, body);
  }

  function renderList(ctx, env, body) {
    const tag = LIST_ENVS[env];
    const items = splitTopLevel(body, (s, k) => {
      if (!s.startsWith('\\item', k) || /[a-zA-Z]/.test(s[k + 5] || '')) return 0;
      return 5;
    }).slice(1);
    ctx.listDepth++;
    const types = ['1', 'a', 'i', 'A'];
    const inner = items.map(raw => {
      let label = null;
      const opt = readOptional(raw, 0);
      if (opt) { label = opt.content; raw = raw.slice(opt.end); }
      let html = renderBlocks(ctx, raw);
      // A single paragraph stays tight inside its list item.
      if (/^<p>[\s\S]*<\/p>$/.test(html) && html.indexOf('<p>', 1) < 0) html = html.slice(3, -4);
      if (tag === 'dl') return `<dt>${label != null ? renderInline(ctx, label) : ''}</dt><dd>${html}</dd>`;
      if (label != null) return `<li class="latex-custom-label"><span class="latex-item-label">${renderInline(ctx, label)}</span>${html}</li>`;
      return `<li>${html}</li>`;
    }).join('');
    ctx.listDepth--;
    const type = tag === 'ol' ? ` type="${types[ctx.listDepth % 4]}"` : '';
    return `<${tag} class="latex-list"${type}>${inner}</${tag}>`;
  }

  function renderFloat(ctx, kind, env, body) {
    const n = ++ctx.counters[kind];
    const prev = ctx.currentRef;
    ctx.currentRef = { num: String(n), type: kind };
    let id = '';
    // Captions are rendered where they appear (above or below), so they become block slots.
    body = body.replace(/\\caption\*?\s*(?:\[[^\]]*\])?\s*(?=\{)/g, '\\caption');
    let out = '', i = 0, k;
    while ((k = body.indexOf('\\caption', i)) >= 0) {
      const g = readGroup(body, k + 8);
      if (!g) break;
      out += body.slice(i, k);
      const cap = `<figcaption><span class="latex-cap-label">${ctx.names[kind]} ${n}${ctx.names === NAMES.zh ? '' : ':'}</span> ` +
        renderInline(ctx, g.content) + '</figcaption>';
      out += '\n\n' + slot(ctx, cap, true) + '\n\n';
      i = g.end;
    }
    body = out + body.slice(i);
    body = body.replace(/\\label\{([^}]*)\}/g, (m, key) => {
      key = key.trim();
      ctx.labels[key] = { num: String(n), type: kind };
      if (!id) id = `${ctx.uid}-${key}`;
      return '';
    });
    // wrapfigure / subfigure carry placement/width arguments first.
    if (env === 'wrapfigure' || env === 'subfigure') {
      const o = readOptional(body, 0);
      let j = o ? o.end : 0;
      const a = readGroup(body, j); if (a) j = a.end;
      if (env === 'wrapfigure') { const b = readGroup(body, j); if (b) j = b.end; }
      body = body.slice(j);
    } else {
      const o = readOptional(body, 0); // placement like [htbp]
      if (o && /^[!htbpH]*$/.test(o.content.trim())) body = body.slice(o.end);
    }
    const html = renderBlocks(ctx, body);
    ctx.currentRef = prev;
    return `<figure class="latex-float latex-float-${kind}"${id ? ` id="${esc(id)}"` : ''}>${html}</figure>`;
  }

  function renderBibliography(ctx, body) {
    const w = readGroup(body, 0); // widest-label argument
    const items = splitTopLevel(w ? body.slice(w.end) : body, (s, k) =>
      s.startsWith('\\bibitem', k) && !/[a-zA-Z]/.test(s[k + 8] || '') ? 8 : 0).slice(1);
    const lis = items.map(raw => {
      const o = readOptional(raw, 0);
      const key = readGroup(raw, o ? o.end : 0);
      if (!key) return '';
      const k = key.content.trim();
      return `<li id="${esc(ctx.uid + '-bib-' + k)}"><span class="latex-bib-num">[${ctx.bib[k]}]</span>` +
        renderInline(ctx, raw.slice(key.end).trim()) + '</li>';
    }).join('');
    return `<section class="latex-bib"><h2>${ctx.names.references}</h2><ol>${lis}</ol></section>`;
  }

  function renderTheorem(ctx, def, env, body) {
    const key = env.replace(/\*$/, '');
    const title = def.title || ctx.names[def.name || key] || key;
    let num = '';
    if (def.counter && !env.endsWith('*')) {
      ctx.counters['thm-' + def.counter] = (ctx.counters['thm-' + def.counter] || 0) + 1;
      num = String(ctx.counters['thm-' + def.counter]);
    }
    let note = '';
    const opt = readOptional(body, 0);
    if (opt) { note = opt.content; body = body.slice(opt.end); }
    let id = '';
    body = body.replace(/\\label\{([^}]*)\}/, (m, k) => {
      k = k.trim();
      if (num) ctx.labels[k] = { num, type: key };
      id = `${ctx.uid}-${k}`;
      return '';
    });
    const isProof = key === 'proof';
    const head = `<span class="latex-thm-head">${esc(title)}${num ? ' ' + num : ''}` +
      (note ? ` <span class="latex-thm-note">(${renderInline(ctx, note)})</span>` : '') +
      (isProof ? '.' : (ctx.names === NAMES.zh ? '' : '.')) + '</span> ';
    let html = renderBlocks(ctx, body);
    html = html.replace(/^<p>/, '<p>' + head);
    if (!html.startsWith('<p>' + head)) html = '<p>' + head + '</p>' + html;
    if (isProof) {
      const qed = '<span class="latex-qed">∎</span>';
      html = html.endsWith('</p>') ? html.slice(0, -4) + qed + '</p>' : html + qed;
    }
    return `<div class="latex-theorem latex-${isProof ? 'proof' : 'thm'}"${id ? ` id="${esc(id)}"` : ''}>${html}</div>`;
  }

  // ── Tables ──

  function parseColumnSpec(spec) {
    const cols = [];
    let pendingLeftRule = false;
    for (let i = 0; i < spec.length; i++) {
      const c = spec[i];
      if (c === '|') {
        if (cols.length && !pendingLeftRule) cols[cols.length - 1].right = true;
        else pendingLeftRule = true;
        if (!cols.length) pendingLeftRule = true;
        continue;
      }
      if (c === '@' || c === '!' || c === '>' || c === '<') {
        const g = readGroup(spec, i + 1); if (g) i = g.end - 1;
        continue;
      }
      if (c === '*') {
        const n = readGroup(spec, i + 1); if (!n) continue;
        const sub = readGroup(spec, n.end); if (!sub) continue;
        const rep = sub.content.repeat(Math.max(0, parseInt(n.content, 10) || 0));
        spec = spec.slice(0, i) + rep + spec.slice(sub.end);
        i--;
        continue;
      }
      let align = null;
      if (c === 'l' || c === 'L') align = 'left';
      else if (c === 'c' || c === 'C') align = 'center';
      else if (c === 'r' || c === 'R' || c === 'S') align = 'right';
      else if (c === 'p' || c === 'm' || c === 'b') {
        align = 'left';
        const g = readGroup(spec, i + 1); if (g) i = g.end - 1;
      } else if (c === 'X' || c === 'J') align = 'left';
      if (align) {
        cols.push({ align, left: pendingLeftRule, right: false });
        pendingLeftRule = false;
      }
    }
    return cols;
  }

  const RULE_RE = /^\s*\\(hline|toprule|midrule|bottomrule|cline|cmidrule|specialrule|addlinespace|morecmidrules|endhead|endfirsthead|endfoot|endlastfoot)\b/;

  function renderTabular(ctx, env, body, captionHtml) {
    let i = 0;
    if (env.startsWith('tabular*') || env === 'tabularx' || env === 'tabulary') {
      const w = readGroup(body, i); if (w) i = w.end;
    }
    const pos = readOptional(body, i); if (pos) i = pos.end;
    const specG = readGroup(body, i);
    const cols = parseColumnSpec(specG ? specG.content : '');
    body = specG ? body.slice(specG.end) : body.slice(i);

    // longtable may carry its own caption.
    body = body.replace(/\\caption\*?\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}\s*(\\\\)?/, (m, cap) => {
      const n = ++ctx.counters.table;
      captionHtml = `<figcaption><span class="latex-cap-label">${ctx.names.table} ${n}${ctx.names === NAMES.zh ? '' : ':'}</span> ${renderInline(ctx, cap)}</figcaption>`;
      return '';
    });

    const rawRows = splitTopLevel(body, (s, k) => {
      if (s.startsWith('\\\\', k)) {
        const opt = /^\\\\\*?\s*(\[[^\]]*\])?/.exec(s.slice(k));
        return opt[0].length;
      }
      if (s.startsWith('\\tabularnewline', k)) return 15;
      return 0;
    });

    const rows = [];
    let pending = [];
    rawRows.forEach(raw => {
      let rest = raw;
      let m;
      while ((m = RULE_RE.exec(rest))) {
        let j = m[0].length;
        const kind = m[1];
        let trim = '';
        if (kind === 'cmidrule') {
          const t = /^\s*\(([^)]*)\)/.exec(rest.slice(j));
          if (t) { j += t[0].length; trim = t[1]; }
        }
        let range = null;
        if (kind === 'cline' || kind === 'cmidrule') {
          const g = readGroup(rest, j);
          if (g) { j = g.end; const r = /(\d+)\s*-\s*(\d+)/.exec(g.content); if (r) range = [+r[1], +r[2]]; }
        }
        if (kind === 'specialrule') { for (let a = 0; a < 3; a++) { const g = readGroup(rest, j); if (g) j = g.end; } }
        if (kind === 'addlinespace') { const o = readOptional(rest, j); if (o) j = o.end; }
        if (!/^(addlinespace|endhead|endfirsthead|endfoot|endlastfoot|morecmidrules)$/.test(kind)) pending.push({ kind, range, trim });
        rest = rest.slice(j);
      }
      // \rowcolor must open the row.
      let bg = null;
      const rc = /^\s*\\rowcolor\s*(?:\[([^\]]*)\])?\s*\{([^}]*)\}/.exec(rest);
      if (rc) { bg = safeColor(rc[2], rc[1]); rest = rest.slice(rc[0].length); }
      if (rest.trim()) {
        rows.push({ cells: splitTopLevel(rest, (s, k) => (s[k] === '&' ? 1 : 0)), rules: pending, bg });
        pending = [];
      }
    });
    const bottomRules = pending;

    // Header rows: everything before the first \midrule, or the first row
    // when the table opens with a rule and has one right after row 1.
    let headerCount = 0;
    const mid = rows.findIndex((r, k) => k > 0 && r.rules.some(x => x.kind === 'midrule'));
    if (mid > 0) headerCount = mid;
    else if (rows.length > 1 && rows[0].rules.length && rows[1].rules.some(x => x.kind === 'hline' || x.kind === 'midrule')) headerCount = 1;

    const rowspanLeft = [];
    const trHtml = rows.map((row, r) => {
      const isHead = r < headerCount;
      const tag = isHead ? 'th' : 'td';
      const topClass = ruleClass(row.rules);
      const partial = row.rules.filter(x => x.range);
      let col = 0;
      const cells = [];
      row.cells.forEach(raw => {
        while (rowspanLeft[col] > 0 && !raw.trim()) { rowspanLeft[col]--; col++; return; }
        let span = 1, rowspan = 1, align = cols[col] ? cols[col].align : 'left', content = raw.trim();
        let colSpec = cols[col];
        const mc = /^\\multicolumn\s*\{(\d+)\}\s*/.exec(content);
        if (mc) {
          span = +mc[1];
          const spec = readGroup(content, mc[0].length);
          const inner = spec && readGroup(content, spec.end);
          if (spec) {
            const c = parseColumnSpec(spec.content)[0];
            if (c) { align = c.align; colSpec = { ...c, left: c.left, right: spec.content.trim().endsWith('|') }; }
          }
          content = inner ? inner.content : '';
        }
        const mr = /^\\multirow\s*(?:\[[^\]]*\])?\s*\{(\d+)\}\s*/.exec(content);
        if (mr) {
          rowspan = +mr[1];
          const w = readGroup(content, mr[0].length);
          const inner = w && readGroup(content, w.end);
          content = inner ? inner.content : '';
          for (let k = 0; k < span; k++) rowspanLeft[col + k] = rowspan - 1;
        }
        let cellBg = null;
        content = content.replace(/\\cellcolor\s*(?:\[([^\]]*)\])?\s*\{([^}]*)\}/, (m, model, c) => {
          cellBg = safeColor(c, model);
          return '';
        }).trim();
        const cls = [];
        if (colSpec && colSpec.left) cls.push('vl');
        const lastCol = cols[col + span - 1];
        if ((mc ? colSpec && colSpec.right : lastCol && lastCol.right)) cls.push('vr');
        // \cmidrule(lr) is trimmed only at the ends of its range.
        const cl = partial.find(p => col + 1 <= p.range[1] && col + span >= p.range[0]);
        if (cl) {
          cls.push('cline');
          if (cl.trim && cl.trim.includes('l') && col + 1 <= cl.range[0]) cls.push('cl-l');
          if (cl.trim && cl.trim.includes('r') && col + span >= cl.range[1]) cls.push('cl-r');
        }
        if (align !== 'left') cls.push('a-' + align);
        cells.push(`<${tag}${span > 1 ? ` colspan="${span}"` : ''}${rowspan > 1 ? ` rowspan="${rowspan}"` : ''}` +
          `${cls.length ? ` class="${cls.join(' ')}"` : ''}${cellBg ? ` style="background-color:${cellBg}"` : ''}>` +
          `${renderInline(ctx, content)}</${tag}>`);
        col += span;
      });
      return `<tr${topClass ? ` class="${topClass}"` : ''}${row.bg ? ` style="background-color:${row.bg}"` : ''}>${cells.join('')}</tr>`;
    });

    const bottom = ruleClass(bottomRules).replace(/rule-top/g, 'rule-bottom');
    const head = trHtml.slice(0, headerCount).join('');
    const bodyRows = trHtml.slice(headerCount);
    if (bottom && bodyRows.length) bodyRows[bodyRows.length - 1] = bodyRows[bodyRows.length - 1].replace(/^<tr( class="([^"]*)")?/, (m, a, c) => `<tr class="${c ? c + ' ' : ''}${bottom}"`);
    const table = '<div class="latex-table-wrap"><table class="latex-table">' +
      (head ? '<thead>' + head + '</thead>' : '') + '<tbody>' + bodyRows.join('') + '</tbody></table></div>';
    return captionHtml ? `<figure class="latex-float latex-table-float">${captionHtml}${table}</figure>` : table;
  }

  function ruleClass(rules) {
    const full = rules.filter(x => !x.range);
    if (!full.length) return '';
    const heavy = full.some(x => x.kind === 'toprule' || x.kind === 'bottomrule' || x.kind === 'specialrule');
    const double = full.length > 1;
    return 'rule-top' + (heavy ? ' rule-heavy' : '') + (double ? ' rule-double' : '');
  }

  // ── Inline ──

  function renderInline(ctx, s) {
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === SLOT) {
        const j = s.indexOf(SLOT, i + 1);
        out += s.slice(i, j + 1);
        i = j;
        continue;
      }
      if (c === '\\') {
        const r = renderCommand(ctx, s, i);
        if (r.rest != null) return out + r.html + renderInline(ctx, r.rest) + r.close;
        out += r.html;
        i = r.end - 1;
        continue;
      }
      if (c === '{') {
        const g = readGroup(s, i);
        out += renderInline(ctx, g.content);
        i = g.end - 1;
        continue;
      }
      if (c === '}') continue;
      if (c === '~') { out += '&nbsp;'; continue; }
      if (c === '-' && s[i + 1] === '-') {
        if (s[i + 2] === '-') { out += '—'; i += 2; } else { out += '–'; i += 1; }
        continue;
      }
      if (c === '`') { if (s[i + 1] === '`') { out += '“'; i++; } else out += '‘'; continue; }
      if (c === "'") { if (s[i + 1] === "'") { out += '”'; i++; } else out += '’'; continue; }
      if (c === '\n') { out += ' '; continue; }
      if (c === '&') { out += '&amp;'; continue; }
      if (c === '<') { out += '&lt;'; continue; }
      if (c === '>') { out += '&gt;'; continue; }
      if (c === '"') { out += '&quot;'; continue; }
      out += c;
    }
    return out;
  }

  // Returns { html, end } or, for declarations like \bfseries that affect
  // the rest of the group, { html, rest, close }.
  function renderCommand(ctx, s, i) {
    const m = /^\\([a-zA-Z]+\*?|.)/.exec(s.slice(i));
    if (!m) return { html: '\\', end: i + 1 };
    const name = m[1];
    let end = i + m[0].length;

    // Control symbols.
    if (name.length === 1 && !/[a-zA-Z]/.test(name)) {
      if (name === '\\') {
        const opt = /^\*?\s*\[[^\]]*\]/.exec(s.slice(end));
        return { html: '<br>', end: end + (opt ? opt[0].length : 0) };
      }
      if (ACCENTS[name]) {
        const a = readArg(s, end);
        return { html: esc((a.content + ACCENTS[name]).normalize('NFC')), end: a.end };
      }
      const map = { ',': '&thinsp;', ';': '&ensp;', ':': '&ensp;', '!': '', ' ': ' ', '\n': ' ', '-': '', '/': '', '@': '', '&': '&amp;', '%': '%', '$': '$', '#': '#', '_': '_', '{': '{', '}': '}' };
      return { html: map[name] != null ? map[name] : esc(name), end };
    }

    // Letter accents like \c{c}, \v{s}.
    if (ACCENTS[name] && name.length === 1) {
      const a = readArg(s, end);
      return { html: esc((a.content + ACCENTS[name]).normalize('NFC')), end: a.end };
    }

    if (DECLARATIONS[name]) {
      const [open, close] = DECLARATIONS[name];
      return { html: open, rest: s.slice(end), close };
    }
    if (SIZES[name] != null) {
      return { html: `<span style="font-size:${SIZES[name]}em">`, rest: s.slice(end), close: '</span>' };
    }
    if (name === 'color') {
      const g = readGroup(s, end);
      if (g) return { html: `<span style="color:${safeColor(g.content)}">`, rest: s.slice(g.end), close: '</span>' };
    }

    if (WRAPPERS[name]) {
      const a = readArg(s, end);
      const [open, close] = WRAPPERS[name];
      return { html: open + renderInline(ctx, a.content) + close, end: a.end };
    }
    if (SYMBOLS[name] != null) {
      // TeX drops the spaces after a control word: "\textbackslash hline" → "\hline".
      if (/[a-zA-Z]$/.test(name)) while (s[end] === ' ' || s[end] === '\t') end++;
      return { html: SYMBOLS[name], end };
    }
    if (name === 'today') {
      return { html: esc(new Date().toLocaleDateString(ctx.names === NAMES.zh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })), end };
    }

    switch (name) {
      case 'textcolor': {
        const o = readOptional(s, end); if (o) end = o.end;
        const col = readGroup(s, end); const txt = col && readArg(s, col.end);
        if (!txt) break;
        return { html: `<span style="color:${safeColor(col.content, o && o.content)}">${renderInline(ctx, txt.content)}</span>`, end: txt.end };
      }
      case 'colorbox': {
        const col = readGroup(s, end); const txt = col && readArg(s, col.end);
        if (!txt) break;
        return { html: `<span class="latex-colorbox" style="background:${safeColor(col.content)}">${renderInline(ctx, txt.content)}</span>`, end: txt.end };
      }
      case 'href': {
        const u = readGroup(s, end); const t = u && readArg(s, u.end);
        if (!t) break;
        return { html: `<a href="${esc(unescapeUrl(u.content))}">${renderInline(ctx, t.content)}</a>`, end: t.end };
      }
      case 'url': {
        const u = readGroup(s, end); if (!u) break;
        const url = unescapeUrl(u.content);
        return { html: `<a href="${esc(url)}" class="latex-url">${esc(url)}</a>`, end: u.end };
      }
      case 'footnote': {
        const o = readOptional(s, end); if (o) end = o.end;
        const a = readArg(s, end);
        ctx.footnotes.push(renderInline(ctx, a.content));
        const n = ctx.footnotes.length;
        return { html: `<sup class="latex-fn-ref" id="${ctx.uid}-fnref${n}"><a href="#${ctx.uid}-fn${n}">${n}</a></sup>`, end: a.end };
      }
      case 'includegraphics':
      case 'includegraphics*': {
        const o = readOptional(s, end); if (o) end = o.end;
        const p = readGroup(s, end); if (!p) break;
        return { html: imageTag(p.content.trim(), o ? o.content : ''), end: p.end };
      }
      case 'label': {
        const a = readGroup(s, end); if (!a) break;
        const key = a.content.trim();
        if (ctx.currentRef && !ctx.labels[key]) ctx.labels[key] = { ...ctx.currentRef };
        return { html: `<span id="${esc(ctx.uid + '-' + key)}"></span>`, end: a.end };
      }
      case 'ref': case 'eqref': case 'autoref': case 'cref': case 'Cref': case 'pageref': case 'nameref': {
        const a = readGroup(s, end); if (!a) break;
        const keys = a.content.split(',').map(k => k.trim()).filter(Boolean);
        const html = keys.map(key => {
          const link = `<a class="latex-ref" href="#${esc(ctx.uid + '-' + key)}">${REF}${key}${REF}</a>`;
          if (name === 'eqref') return `(${link})`;
          if (name === 'ref' || name === 'pageref' || name === 'nameref') return link;
          return `${REF}@type:${key}${REF}${link}`;
        }).join(', ');
        return { html, end: a.end };
      }
      case 'cite': case 'citep': case 'citet': case 'parencite': case 'textcite': case 'autocite': {
        const o = readOptional(s, end); if (o) end = o.end;
        const o2 = readOptional(s, end); if (o2) end = o2.end;
        const a = readGroup(s, end); if (!a) break;
        const links = a.content.split(',').map(k => k.trim()).filter(Boolean).map(k =>
          `<a class="latex-cite-link" href="#${esc(ctx.uid + '-bib-' + k)}">${ctx.bib[k] || esc(k)}</a>`).join(', ');
        const note = (o2 || o) && (o2 || o).content.trim() ? ', ' + renderInline(ctx, (o2 || o).content) : '';
        return { html: `<span class="latex-cite">[${links}${note}]</span>`, end: a.end };
      }
      case 'caption': {
        const a = readArg(s, end);
        return { html: renderInline(ctx, a.content), end: a.end };
      }
      case 'begin': {
        // Inline environment (e.g. tabular inside a paragraph or cell).
        const g = readGroup(s, end); if (!g) break;
        const env = g.content.trim();
        const { bodyEnd, end: e } = findEnd(s, env, g.end);
        return { html: renderEnvironment(ctx, env, s.slice(g.end, bodyEnd)), end: e };
      }
      case 'end': {
        const g = readGroup(s, end);
        return { html: '', end: g ? g.end : end };
      }
    }

    // User macros from \newcommand / \def.
    const macro = ctx.macros[name];
    if (macro) {
      let body = macro.body;
      for (let k = 1; k <= macro.nargs; k++) {
        const a = readArg(s, end);
        body = body.split('#' + k).join(a.content);
        end = a.end;
      }
      return { html: renderInline(ctx, body), end };
    }

    if (DROP_ARGS[name] != null) {
      const o = readOptional(s, end); if (o) end = o.end;
      for (let k = 0; k < DROP_ARGS[name]; k++) {
        const g = readGroup(s, end); if (!g) break;
        end = g.end;
      }
      return { html: '', end };
    }

    // Unknown: keep the text of any immediately following {arguments}.
    let html = '';
    const o = readOptional(s, end);
    if (o && s[end] === '[') end = o.end;
    while (s[end] === '{') {
      const g = readGroup(s, end);
      html += renderInline(ctx, g.content);
      end = g.end;
    }
    return { html, end };
  }

  function unescapeUrl(u) {
    return u.trim().replace(/\\([#%&_~$])/g, '$1');
  }

  let userColors = {};
  function safeColor(c, model) {
    c = String(c || '').trim();
    if (model && /html/i.test(model) && /^[0-9a-fA-F]{6}$/.test(c)) return '#' + c;
    const named = (n) => userColors[n] || (/^[a-zA-Z]+$/.test(n) ? n : null);
    const mix = /^([a-zA-Z0-9]+)!(\d+)/.exec(c); // xcolor "red!60"
    if (mix && named(mix[1])) return `color-mix(in srgb, ${named(mix[1])} ${mix[2]}%, white)`;
    return named(c) || 'inherit';
  }

  function imageTag(path, opts) {
    const style = [];
    const width = /(?:^|,)\s*width\s*=\s*([\d.]*)\s*\\(linewidth|textwidth|columnwidth|hsize)/.exec(opts);
    if (width) style.push(`width:${Math.round((parseFloat(width[1] || '1')) * 100)}%`);
    else {
      const abs = /(?:^|,)\s*width\s*=\s*([\d.]+)\s*(cm|mm|in|pt|em|px)/.exec(opts);
      if (abs) style.push(`width:${abs[1]}${abs[2]}`);
    }
    const height = /(?:^|,)\s*height\s*=\s*([\d.]+)\s*(cm|mm|in|pt|em|px)/.exec(opts);
    if (height) style.push(`height:${height[1]}${height[2]}`);
    const scale = /(?:^|,)\s*scale\s*=\s*([\d.]+)/.exec(opts);
    if (scale && !width) style.push(`width:${Math.min(100, Math.round(parseFloat(scale[1]) * 100))}%`);
    const alt = path.split('/').pop();
    return `<img class="latex-img" src="${esc(path)}" alt="${esc(alt)}" loading="lazy"${style.length ? ` style="${style.join(';')}"` : ''}>`;
  }

  window.parseLatex = parseLatex;
})();
