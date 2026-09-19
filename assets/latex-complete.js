// LaTeX autocompletion for the blog editor's <textarea>.
//
//   \tex…        → commands (snippets put the caret in the first argument)
//   \begin{fi…   → environments, inserted with their \end and a body template
//   \ref{…       → \label keys found in the document (also \eqref, \autoref, \cref)
//   \cite{a, …   → \bibitem keys found in the document
//   Enter right after a hand-typed \begin{env} closes it with \end{env}.
//
// Usage: LatexComplete.attach(textarea, { isActive, replace })
//   isActive()                 → whether completion should run (LaTeX mode)
//   replace(start, end, text)  → undo-friendly text replacement
(function () {
  'use strict';

  const CARET = '¦';

  // [name, snippet (after the backslash), hint]
  const COMMANDS = [
    ['textbf', 'textbf{¦}', 'bold'], ['textit', 'textit{¦}', 'italic'], ['emph', 'emph{¦}', 'emphasis'],
    ['underline', 'underline{¦}', 'underline'], ['texttt', 'texttt{¦}', 'monospace'], ['textsc', 'textsc{¦}', 'small caps'],
    ['sout', 'sout{¦}', 'strike-through'], ['hl', 'hl{¦}', 'highlight'], ['textcolor', 'textcolor{¦}{}', 'coloured text'],
    ['href', 'href{¦}{}', 'link'], ['url', 'url{¦}', 'bare URL'], ['footnote', 'footnote{¦}', 'footnote'],
    ['cite', 'cite{¦}', 'citation'], ['ref', 'ref{¦}', 'reference'], ['eqref', 'eqref{¦}', '(equation ref)'],
    ['autoref', 'autoref{¦}', 'typed reference'], ['label', 'label{¦}', 'label'],
    ['section', 'section{¦}', 'numbered section'], ['section*', 'section*{¦}', 'unnumbered section'],
    ['subsection', 'subsection{¦}', ''], ['subsubsection', 'subsubsection{¦}', ''], ['paragraph', 'paragraph{¦}', 'run-in heading'],
    ['caption', 'caption{¦}', 'float caption'], ['includegraphics', 'includegraphics[width=0.8\\linewidth]{¦}', 'image'],
    ['centering', 'centering', ''], ['item', 'item ¦', 'list item'], ['begin', 'begin{¦}', 'environment'],
    ['multicolumn', 'multicolumn{¦}{c}{}', 'span columns'], ['multirow', 'multirow{¦}{*}{}', 'span rows'],
    ['toprule', 'toprule', 'booktabs'], ['midrule', 'midrule', 'booktabs'], ['bottomrule', 'bottomrule', 'booktabs'],
    ['cmidrule', 'cmidrule(lr){¦}', 'partial rule'], ['hline', 'hline', 'rule'], ['cline', 'cline{¦}', 'partial rule'],
    ['rowcolor', 'rowcolor{¦}', 'row shading'], ['cellcolor', 'cellcolor{¦}', 'cell shading'],
    ['resizebox', 'resizebox{\\linewidth}{!}{¦}', 'fit to width'],
    ['newcommand', 'newcommand{\\¦}{}', 'define macro'], ['definecolor', 'definecolor{¦}{HTML}{}', 'define colour'],
    ['newtheorem', 'newtheorem{¦}{}', 'theorem-like env'], ['usetikzlibrary', 'usetikzlibrary{¦}', 'TikZ libraries'],
    ['bibitem', 'bibitem{¦}', 'bibliography entry'], ['verb', 'verb|¦|', 'inline verbatim'],
    ['LaTeX', 'LaTeX{}', 'logo'], ['TeX', 'TeX{}', 'logo'], ['ldots', 'ldots', '…'], ['quad', 'quad', 'space'],
    ['qquad', 'qquad', 'space'], ['noindent', 'noindent', ''], ['newline', 'newline', 'line break'],
    ['hfill', 'hfill', 'fill space'], ['vspace', 'vspace{¦}', ''], ['today', 'today', 'date'],
    // math
    ['frac', 'frac{¦}{}', 'fraction'], ['dfrac', 'dfrac{¦}{}', 'display fraction'], ['sqrt', 'sqrt{¦}', 'root'],
    ['sum', 'sum_{¦}^{}', 'Σ'], ['prod', 'prod_{¦}^{}', 'Π'], ['int', 'int_{¦}^{}', '∫'], ['oint', 'oint', '∮'],
    ['lim', 'lim_{¦}', 'limit'], ['max', 'max_{¦}', ''], ['min', 'min_{¦}', ''], ['arg', 'arg', ''],
    ['argmax', 'operatorname*{arg\\,max}_{¦}', 'arg max'], ['argmin', 'operatorname*{arg\\,min}_{¦}', 'arg min'],
    ['log', 'log', ''], ['exp', 'exp', ''], ['sin', 'sin', ''], ['cos', 'cos', ''], ['operatorname', 'operatorname{¦}', ''],
    ['mathbb', 'mathbb{¦}', 'ℝ ℕ 𝔼'], ['mathcal', 'mathcal{¦}', '𝒩 ℒ'], ['mathrm', 'mathrm{¦}', 'upright'],
    ['mathbf', 'mathbf{¦}', 'bold'], ['boldsymbol', 'boldsymbol{¦}', 'bold symbol'], ['mathscr', 'mathscr{¦}', ''],
    ['text', 'text{¦}', 'text in math'], ['left(', 'left( ¦ \\right)', '( )'], ['left[', 'left[ ¦ \\right]', '[ ]'],
    ['left\\{', 'left\\{ ¦ \\right\\}', '{ }'], ['left|', 'left| ¦ \\right|', '| |'], ['left\\|', 'left\\| ¦ \\right\\|', '‖ ‖'],
    ['hat', 'hat{¦}', 'x̂'], ['bar', 'bar{¦}', 'x̄'], ['tilde', 'tilde{¦}', 'x̃'], ['vec', 'vec{¦}', 'x⃗'], ['dot', 'dot{¦}', 'ẋ'],
    ['overline', 'overline{¦}', ''], ['underbrace', 'underbrace{¦}_{}', ''], ['overbrace', 'overbrace{¦}^{}', ''],
    ['cdot', 'cdot', '·'], ['cdots', 'cdots', '⋯'], ['times', 'times', '×'], ['div', 'div', '÷'], ['pm', 'pm', '±'],
    ['leq', 'leq', '≤'], ['geq', 'geq', '≥'], ['neq', 'neq', '≠'], ['approx', 'approx', '≈'], ['equiv', 'equiv', '≡'],
    ['sim', 'sim', '∼'], ['propto', 'propto', '∝'], ['ll', 'll', '≪'], ['gg', 'gg', '≫'],
    ['in', 'in', '∈'], ['notin', 'notin', '∉'], ['subset', 'subset', '⊂'], ['subseteq', 'subseteq', '⊆'],
    ['cup', 'cup', '∪'], ['cap', 'cap', '∩'], ['emptyset', 'emptyset', '∅'], ['forall', 'forall', '∀'], ['exists', 'exists', '∃'],
    ['partial', 'partial', '∂'], ['nabla', 'nabla', '∇'], ['infty', 'infty', '∞'], ['mid', 'mid', '∣'],
    ['to', 'to', '→'], ['rightarrow', 'rightarrow', '→'], ['leftarrow', 'leftarrow', '←'], ['Rightarrow', 'Rightarrow', '⇒'],
    ['Leftrightarrow', 'Leftrightarrow', '⇔'], ['mapsto', 'mapsto', '↦'], ['top', 'top', '⊤'], ['odot', 'odot', '⊙'],
    ['otimes', 'otimes', '⊗'], ['oplus', 'oplus', '⊕'], ['langle', 'langle ¦ \\rangle', '⟨ ⟩'], ['nonumber', 'nonumber', 'no eq. number'],
    ['tag', 'tag{¦}', 'eq. tag'],
    ['alpha', 'alpha', 'α'], ['beta', 'beta', 'β'], ['gamma', 'gamma', 'γ'], ['delta', 'delta', 'δ'], ['epsilon', 'epsilon', 'ϵ'],
    ['varepsilon', 'varepsilon', 'ε'], ['zeta', 'zeta', 'ζ'], ['eta', 'eta', 'η'], ['theta', 'theta', 'θ'], ['iota', 'iota', 'ι'],
    ['kappa', 'kappa', 'κ'], ['lambda', 'lambda', 'λ'], ['mu', 'mu', 'μ'], ['nu', 'nu', 'ν'], ['xi', 'xi', 'ξ'], ['pi', 'pi', 'π'],
    ['rho', 'rho', 'ρ'], ['sigma', 'sigma', 'σ'], ['tau', 'tau', 'τ'], ['phi', 'phi', 'ϕ'], ['varphi', 'varphi', 'φ'],
    ['chi', 'chi', 'χ'], ['psi', 'psi', 'ψ'], ['omega', 'omega', 'ω'], ['Gamma', 'Gamma', 'Γ'], ['Delta', 'Delta', 'Δ'],
    ['Theta', 'Theta', 'Θ'], ['Lambda', 'Lambda', 'Λ'], ['Sigma', 'Sigma', 'Σ'], ['Phi', 'Phi', 'Φ'], ['Psi', 'Psi', 'Ψ'], ['Omega', 'Omega', 'Ω'],
    // tikz
    ['draw', 'draw ¦;', 'TikZ path'], ['node', 'node[¦] {};', 'TikZ node'], ['fill', 'fill ¦;', 'TikZ fill'], ['addplot', 'addplot[¦] {};', 'pgfplots'],
  ];

  // [name, body (indented, between \begin and \end), hint, arguments after \begin{name}]
  const ENVIRONMENTS = [
    ['itemize', '\\item ¦', 'bullet list'], ['enumerate', '\\item ¦', 'numbered list'],
    ['description', '\\item[¦] ', 'labelled list'],
    ['figure', '\\centering\n\\includegraphics[width=0.8\\linewidth]{¦}\n\\caption{}\\label{fig:}', 'image + caption', '[htbp]'],
    ['table', '\\centering\n\\caption{¦}\\label{tab:}\n\\begin{tabular}{lcc}\n  \\toprule\n  Header & Header & Header \\\\\n  \\midrule\n  cell & cell & cell \\\\\n  \\bottomrule\n\\end{tabular}', 'booktabs table', '[htbp]'],
    ['tabular', '\\toprule\n¦ &  \\\\\n\\midrule\n &  \\\\\n\\bottomrule', 'table body', '{lc}'],
    ['subfigure', '\\includegraphics[width=\\linewidth]{¦}\n\\caption{}\\label{fig:}', 'sub-figure (a)', '[b]{0.45\\linewidth}'],
    ['minipage', '¦', 'side-by-side box', '{0.45\\linewidth}'],
    ['equation', '¦', 'numbered equation'], ['equation*', '¦', 'unnumbered equation'],
    ['align', '¦ &=  \\\\\n  &= ', 'aligned equations'], ['align*', '¦ &= ', 'aligned, unnumbered'],
    ['gather', '¦', 'centred equations'], ['cases', '¦ & \\text{if } \\\\\n & \\text{otherwise}', 'piecewise (in math)'],
    ['pmatrix', '¦ &  \\\\\n & ', '( matrix )'], ['bmatrix', '¦ &  \\\\\n & ', '[ matrix ]'],
    ['theorem', '¦', 'theorem'], ['lemma', '¦', 'lemma'], ['definition', '¦', 'definition'], ['corollary', '¦', 'corollary'],
    ['proposition', '¦', 'proposition'], ['remark', '¦', 'remark'], ['example', '¦', 'example'], ['proof', '¦', 'proof ∎'],
    ['quote', '¦', 'block quote'], ['center', '¦', 'centred'], ['abstract', '¦', 'abstract'],
    ['lstlisting', '¦', 'code block', '[language=python]'], ['verbatim', '¦', 'verbatim text'],
    ['tikzpicture', '\\draw ¦;', 'TikZ picture'], ['axis', '\\addplot[¦] {};', 'pgfplots axis', '[xlabel={}, ylabel={}]'],
    ['tikzcd', '¦ \\arrow[r] & ', 'commutative diagram'], ['thebibliography', '\\bibitem{¦} ', 'references', '{9}'],
  ];

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Pixel position of the caret inside a textarea (mirror-div technique).
  function caretRect(ta) {
    const cs = getComputedStyle(ta);
    const div = document.createElement('div');
    ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'tabSize', 'paddingTop', 'paddingRight',
      'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'boxSizing', 'textIndent', 'wordSpacing'].forEach(p => { div.style[p] = cs[p]; });
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.width = ta.clientWidth + 'px';
    div.textContent = ta.value.slice(0, ta.selectionStart);
    const mark = document.createElement('span');
    mark.textContent = '\u200b';
    div.appendChild(mark);
    document.body.appendChild(div);
    const r = ta.getBoundingClientRect();
    const top = r.top + mark.offsetTop - ta.scrollTop;
    const left = r.left + mark.offsetLeft - ta.scrollLeft;
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    document.body.removeChild(div);
    return { top, left, bottom: top + lh };
  }

  // Things defined in the document itself.
  function scanDocument(text) {
    const labels = [], bib = [], macros = [], theorems = [];
    for (let m, re = /\\label\{([^}]+)\}/g; (m = re.exec(text));) {
      const lineStart = text.lastIndexOf('\n', m.index) + 1;
      const ctx = text.slice(lineStart, m.index).replace(/\\label\{[^}]*\}/g, '').trim();
      labels.push([m[1], ctx.length > 42 ? ctx.slice(0, 42) + '…' : ctx]);
    }
    for (let m, re = /\\bibitem\s*(?:\[[^\]]*\])?\{([^}]+)\}([^\n]*)/g; (m = re.exec(text));) {
      const t = m[2].trim();
      bib.push([m[1], t.length > 48 ? t.slice(0, 48) + '…' : t]);
    }
    for (let m, re = /\\(?:newcommand|renewcommand|DeclareMathOperator)\*?\s*\{?\\([a-zA-Z]+)\}?\s*(?:\[(\d)\])?/g; (m = re.exec(text));) {
      const n = +(m[2] || 0);
      macros.push([m[1], m[1] + (n ? '{¦}' + '{}'.repeat(n - 1) : ''), 'defined here']);
    }
    for (let m, re = /\\def\\([a-zA-Z]+)/g; (m = re.exec(text));) macros.push([m[1], m[1], 'defined here']);
    for (let m, re = /\\newtheorem\*?\{([^}]+)\}\{([^}]*)\}/g; (m = re.exec(text));) theorems.push([m[1], '¦', m[2]]);
    return { labels, bib, macros, theorems };
  }

  // Exact-case prefix matches first, then any-case prefix, then substring;
  // within each group the lists' own order (most common first) is kept.
  function rank(items, prefix, key) {
    const p = prefix.toLowerCase();
    const exact = [], starts = [], contains = [];
    items.forEach(it => {
      const k = key(it);
      if (k === prefix) exact.push(it);
      else if (k.startsWith(prefix)) starts.push(it);
      else if (k.toLowerCase().startsWith(p)) contains.push(it);
      else if (p && k.toLowerCase().includes(p)) contains.push(it);
    });
    return exact.concat(starts, contains).slice(0, 12);
  }

  function attach(ta, opts) {
    const box = document.createElement('div');
    box.className = 'latex-complete';
    box.hidden = true;
    document.body.appendChild(box);

    let state = null; // { start, end, items: [{label, hint, insert}], active }

    function close() {
      state = null;
      box.hidden = true;
    }

    function render() {
      box.innerHTML = state.items.map((it, i) =>
        `<div class="latex-complete-item${i === state.active ? ' active' : ''}" data-i="${i}">` +
        `<span class="latex-complete-label">${escHtml(it.label)}</span>` +
        (it.hint ? `<span class="latex-complete-hint">${escHtml(it.hint)}</span>` : '') + '</div>'
      ).join('');
      const r = caretRect(ta);
      box.hidden = false;
      const h = box.offsetHeight, w = box.offsetWidth;
      const below = r.bottom + 4 + h < window.innerHeight;
      box.style.top = (below ? r.bottom + 4 : r.top - h - 4) + 'px';
      box.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
      const act = box.children[state.active];
      if (act) act.scrollIntoView({ block: 'nearest' });
    }

    function accept(i) {
      const it = state && state.items[i];
      if (!it) return;
      const { start, end } = state;
      close();
      let text = it.insert;
      const caret = text.indexOf(CARET);
      text = text.replace(CARET, '');
      opts.replace(start, end, text);
      const pos = start + (caret >= 0 ? caret : text.length);
      ta.selectionStart = ta.selectionEnd = pos;
      ta.focus();
      // A snippet may open another completion right away (e.g. \begin{).
      setTimeout(update, 0);
    }

    function indentAt(pos) {
      const lineStart = ta.value.lastIndexOf('\n', pos - 1) + 1;
      return /^[ \t]*/.exec(ta.value.slice(lineStart))[0];
    }

    function envSnippet(name, body, args, indent) {
      const inner = body.split('\n').map(l => indent + '  ' + l).join('\n');
      return `\\begin{${name}}${args || ''}\n${inner}\n${indent}\\end{${name}}`;
    }

    function update() {
      if (!opts.isActive() || ta.selectionStart !== ta.selectionEnd) { close(); return; }
      const pos = ta.selectionStart;
      const before = ta.value.slice(Math.max(0, pos - 300), pos);
      const doc = scanDocument(ta.value);
      let m, items = [], start = pos;

      if ((m = /\\(?:ref|eqref|autoref|cref|Cref|pageref)\{([^{}\s]*)$/.exec(before))) {
        start = pos - m[1].length;
        items = rank(doc.labels, m[1], x => x[0]).map(([k, hint]) => ({ label: k, hint, insert: k }));
      } else if ((m = /\\(?:cite|citep|citet|parencite|textcite|autocite)(?:\[[^\]]*\])*\{(?:[^{}]*,\s*)?([^,{}\s]*)$/.exec(before))) {
        start = pos - m[1].length;
        items = rank(doc.bib, m[1], x => x[0]).map(([k, hint]) => ({ label: k, hint, insert: k }));
      } else if ((m = /\\begin\{([a-zA-Z*]*)$/.exec(before))) {
        start = pos - m[0].length;
        // Swallow a "}" the user already typed after the caret.
        const end = ta.value[pos] === '}' ? pos + 1 : pos;
        const indent = indentAt(start);
        const envs = ENVIRONMENTS.concat(doc.theorems);
        items = rank(envs, m[1], x => x[0]).map(([name, body, hint, args]) => ({
          label: name, hint, insert: envSnippet(name, body, args, indent),
        }));
        state = items.length ? { start, end, items, active: 0 } : null;
        if (state) render(); else close();
        return;
      } else if ((m = /(?:^|[^\\])\\([a-zA-Z]+\*?)$/.exec(before))) {
        start = pos - m[1].length - 1;
        const cmds = doc.macros.concat(COMMANDS);
        const seen = new Set();
        items = rank(cmds, m[1], x => x[0]).filter(x => !seen.has(x[0]) && seen.add(x[0]))
          .map(([name, snip, hint]) => ({ label: '\\' + name, hint, insert: '\\' + snip }));
        // Nothing to add when the word is already complete and unique.
        if (items.length === 1 && items[0].label === '\\' + m[1] && !items[0].insert.includes(CARET)) items = [];
      }

      if (!items.length) { close(); return; }
      const keep = state && state.start === start ? Math.min(state.active, items.length - 1) : 0;
      state = { start, end: pos, items, active: keep };
      render();
    }

    ta.addEventListener('input', update);
    ta.addEventListener('click', close);
    ta.addEventListener('blur', () => setTimeout(close, 150));
    ta.addEventListener('scroll', close);
    window.addEventListener('resize', close);
    box.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.latex-complete-item');
      if (!item) return;
      e.preventDefault();
      accept(+item.dataset.i);
    });

    // Capture phase, so these win over the editor's own Tab handler.
    ta.addEventListener('keydown', (e) => {
      if (state) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const n = state.items.length;
          state.active = (state.active + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
          render();
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          e.stopImmediatePropagation();
          accept(state.active);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          close();
          return;
        }
      }
      // Enter at the end of a hand-typed "\begin{env}" line closes the environment.
      if (e.key === 'Enter' && opts.isActive() && !e.shiftKey && ta.selectionStart === ta.selectionEnd) {
        const pos = ta.selectionStart;
        const lineStart = ta.value.lastIndexOf('\n', pos - 1) + 1;
        const lineEnd = ta.value.indexOf('\n', pos);
        const rest = ta.value.slice(pos, lineEnd < 0 ? ta.value.length : lineEnd);
        const m = /^([ \t]*)\\begin\{([^}]+)\}(?:\[[^\]]*\]|\{[^}]*\})*\s*$/.exec(ta.value.slice(lineStart, pos));
        if (m && !rest.trim()) {
          const name = m[2];
          const count = (re) => (ta.value.match(re) || []).length;
          const q = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (count(new RegExp('\\\\begin\\{' + q + '\\}', 'g')) > count(new RegExp('\\\\end\\{' + q + '\\}', 'g'))) {
            e.preventDefault();
            const text = `\n${m[1]}  \n${m[1]}\\end{${name}}`;
            opts.replace(pos, pos, text);
            ta.selectionStart = ta.selectionEnd = pos + m[1].length + 3;
          }
        }
      }
    }, true);
  }

  window.LatexComplete = { attach, caretRect };
})();
