// Vim keybindings for a <textarea>.
//
// Modes: normal, insert, visual (v), visual line (V), plus a ":" / "/" command line.
// Motions   h j k l  w b e  W B E  0 ^ $  gg G  { }  f t F T ; ,  %   (with counts)
// Operators d c y > <  + any motion, a text object (iw aw i( a( i{ i[ i" i' i$ …)
//           or doubled for whole lines (dd cc yy >> <<)
// Commands  x X s S D C Y p P r J ~ o O i a I A u Ctrl-r . v V / ? n N :
// Ex        :w :q :wq :x :<line> :s/a/b/g :%s/a/b/g
//
// All edits go through opts.replace (execCommand-based), so u / Ctrl-r use the
// browser's own undo stack and stay in sync with Cmd-Z.
//
// Usage: TextareaVim.attach(textarea, {
//   replace(start, end, text), statusEl, cmdlineEl (an <input>),
//   onWrite(), onQuit(), onWriteQuit(), onLeaveInsert() })
//   → { setEnabled(bool), enabled(), mode() }
(function () {
  'use strict';

  const isSpace = (c) => c === ' ' || c === '\t' || c === '\n' || c === '\r';
  // 0 = blank, 1 = word, 2 = punctuation; "big" (WORD) merges 1 and 2.
  function cls(c, big) {
    if (c === undefined || isSpace(c)) return 0;
    if (big) return 1;
    return /[\p{L}\p{N}_]/u.test(c) ? 1 : 2;
  }
  const PAIRS = { '(': ')', '[': ']', '{': '}', ')': '(', ']': '[', '}': '{' };

  function attach(ta, opts) {
    let enabled = false;
    let mode = 'normal';
    let cur = 0;            // cursor offset (normal / visual)
    let anchor = 0;         // visual start
    let wantCol = null;     // column kept by j / k
    let keys = '';          // pending normal-mode keys
    let reg = { text: '', linewise: false };
    let lastFind = null;    // { cmd: 'f', ch }
    let lastSearch = null;  // { re, back }
    let lastChange = null;  // { keys, insert }
    let changeKeys = null;  // keys of the change being made
    let insertFrom = 0;
    let internal = 0;       // >0 while we edit, so beforeinput lets it through
    let replaying = false;

    const text = () => ta.value;
    const lineStart = (p) => text().lastIndexOf('\n', p - 1) + 1;
    const lineEnd = (p) => { const i = text().indexOf('\n', p); return i < 0 ? text().length : i; };
    const lastCharOfLine = (p) => Math.max(lineStart(p), lineEnd(p) - 1);
    const firstNonBlank = (p) => {
      let i = lineStart(p);
      const e = lineEnd(p);
      while (i < e && (text()[i] === ' ' || text()[i] === '\t')) i++;
      return i;
    };
    const lineIndex = (p) => text().slice(0, p).split('\n').length - 1;
    const offsetOfLine = (n) => {
      const lines = text().split('\n');
      n = Math.max(0, Math.min(n, lines.length - 1));
      let o = 0;
      for (let i = 0; i < n; i++) o += lines[i].length + 1;
      return o;
    };

    function edit(start, end, str) {
      internal++;
      try { opts.replace(start, end, str); } finally { internal--; }
    }

    function setStatus(extra) {
      if (!opts.statusEl) return;
      const names = { normal: 'NORMAL', insert: '-- INSERT --', visual: '-- VISUAL --', vline: '-- VISUAL LINE --', cmdline: '' };
      opts.statusEl.textContent = enabled ? (extra || names[mode] || '') + (keys ? '  ' + keys : '') : '';
      opts.statusEl.hidden = !enabled;
    }

    // Normal mode shows a block cursor by selecting the character under it.
    function render() {
      const v = text();
      if (mode === 'normal') {
        cur = Math.max(0, Math.min(cur, v.length));
        if (cur > lastCharOfLine(cur) && lineEnd(cur) > lineStart(cur)) cur = lastCharOfLine(cur);
        const block = cur < v.length && v[cur] !== '\n' ? 1 : 0;
        ta.setSelectionRange(cur, cur + block);
      } else if (mode === 'visual') {
        const a = Math.min(anchor, cur), b = Math.max(anchor, cur);
        ta.setSelectionRange(a, Math.min(v.length, b + 1), cur < anchor ? 'backward' : 'forward');
      } else if (mode === 'vline') {
        const a = lineStart(Math.min(anchor, cur)), b = lineEnd(Math.max(anchor, cur));
        ta.setSelectionRange(a, b, cur < anchor ? 'backward' : 'forward');
      }
      setStatus();
    }

    function setMode(m) {
      mode = m;
      if (m === 'insert') {
        ta.setSelectionRange(cur, cur);
        insertFrom = cur;
      }
      render();
    }

    // ── motions: return { pos, inclusive, linewise } or null ──
    function wordForward(p, big, n) {
      const v = text();
      for (let k = 0; k < n; k++) {
        const c0 = cls(v[p], big);
        if (c0) while (p < v.length && cls(v[p], big) === c0) p++;
        while (p < v.length && isSpace(v[p])) {
          // An empty line counts as a word.
          if (v[p] === '\n' && v[p + 1] === '\n' && k < n - 1) { p++; break; }
          p++;
        }
      }
      return p;
    }
    function wordEnd(p, big, n) {
      const v = text();
      for (let k = 0; k < n; k++) {
        p++;
        while (p < v.length && isSpace(v[p])) p++;
        const c0 = cls(v[p], big);
        while (p + 1 < v.length && cls(v[p + 1], big) === c0) p++;
      }
      return Math.min(p, v.length - 1);
    }
    function wordBack(p, big, n) {
      const v = text();
      for (let k = 0; k < n; k++) {
        p--;
        while (p > 0 && isSpace(v[p])) p--;
        const c0 = cls(v[p], big);
        while (p > 0 && cls(v[p - 1], big) === c0) p--;
      }
      return Math.max(0, p);
    }
    function paragraph(p, dir, n) {
      const v = text();
      for (let k = 0; k < n; k++) {
        // skip blank lines, then run to the next blank line
        let ls = lineStart(p);
        const blank = (s) => lineEnd(s) === s;
        while (dir > 0 ? lineEnd(ls) < v.length && blank(ls) : ls > 0 && blank(ls)) ls = dir > 0 ? lineEnd(ls) + 1 : lineStart(ls - 1);
        while (dir > 0 ? lineEnd(ls) < v.length && !blank(ls) : ls > 0 && !blank(ls)) ls = dir > 0 ? lineEnd(ls) + 1 : lineStart(ls - 1);
        p = ls;
      }
      return dir > 0 && lineEnd(p) === text().length && lineEnd(p) !== p ? text().length : p;
    }
    function matchBracket(p) {
      const v = text();
      let i = p;
      const e = lineEnd(p);
      while (i < e && !'()[]{}'.includes(v[i])) i++;
      if (i >= e) return null;
      const open = '([{'.includes(v[i]);
      const c = v[i], m = PAIRS[c];
      let depth = 0;
      for (let j = i; open ? j < v.length : j >= 0; j += open ? 1 : -1) {
        if (v[j] === c) depth++;
        else if (v[j] === m && --depth === 0) return j;
      }
      return null;
    }
    function findChar(cmd, ch, p, n) {
      const v = text();
      const ls = lineStart(p), le = lineEnd(p);
      let i = p;
      for (let k = 0; k < n; k++) {
        if (cmd === 'f' || cmd === 't') {
          i = v.indexOf(ch, i + 1 + (cmd === 't' && k === 0 && v[i + 1] === ch ? 1 : 0));
          if (i < 0 || i >= le) return null;
        } else {
          i = v.lastIndexOf(ch, i - 1 - (cmd === 'T' && k === 0 && v[i - 1] === ch ? 1 : 0));
          if (i < ls) return null;
        }
      }
      if (cmd === 't') i--;
      if (cmd === 'T') i++;
      return i;
    }

    function motion(m, n, arg) {
      const v = text();
      switch (m) {
        case 'h': case 'ArrowLeft': case 'Backspace': return { pos: Math.max(lineStart(cur), cur - n) };
        case 'l': case 'ArrowRight': case ' ': return { pos: Math.min(mode === 'normal' ? lastCharOfLine(cur) + (keys.length > 1 ? 1 : 0) : lineEnd(cur), cur + n) };
        case 'j': case 'ArrowDown': case 'k': case 'ArrowUp': {
          const down = m === 'j' || m === 'ArrowDown';
          const col = wantCol != null ? wantCol : cur - lineStart(cur);
          const line = lineIndex(cur) + (down ? n : -n);
          const total = v.split('\n').length;
          if (line < 0 || line >= total) return null;
          const s = offsetOfLine(line);
          wantCol = col;
          return { pos: Math.min(s + col, Math.max(s, lineEnd(s) - (mode === 'insert' ? 0 : 1))), linewise: true, keepCol: true };
        }
        case 'w': case 'W': {
          let p = wordForward(cur, m === 'W', n);
          return { pos: p };
        }
        case 'e': case 'E': return { pos: wordEnd(cur, m === 'E', n), inclusive: true };
        case 'b': case 'B': return { pos: wordBack(cur, m === 'B', n) };
        case '0': case 'Home': return { pos: lineStart(cur) };
        case '^': return { pos: firstNonBlank(cur) };
        case '$': case 'End': {
          const target = n > 1 ? offsetOfLine(lineIndex(cur) + n - 1) : cur;
          return { pos: lastCharOfLine(target), inclusive: true };
        }
        case 'gg': return { pos: firstNonBlank(offsetOfLine((arg || 1) - 1)), linewise: true };
        case 'G': return { pos: firstNonBlank(offsetOfLine(arg ? arg - 1 : v.split('\n').length - 1)), linewise: true };
        case '}': return { pos: paragraph(cur, 1, n) };
        case '{': return { pos: paragraph(cur, -1, n) };
        case '%': { const p = matchBracket(cur); return p == null ? null : { pos: p, inclusive: true }; }
        case 'f': case 't': case 'F': case 'T': {
          const p = findChar(m, arg, cur, n);
          if (p == null) return null;
          lastFind = { cmd: m, ch: arg };
          return { pos: p, inclusive: m === 'f' || m === 't' };
        }
        case ';': case ',': {
          if (!lastFind) return null;
          const flip = { f: 'F', F: 'f', t: 'T', T: 't' };
          const c = m === ';' ? lastFind.cmd : flip[lastFind.cmd];
          const p = findChar(c, lastFind.ch, cur, n);
          return p == null ? null : { pos: p, inclusive: c === 'f' || c === 't' };
        }
        case 'n': case 'N': {
          const p = searchFrom(cur, m === 'N');
          return p == null ? null : { pos: p };
        }
      }
      return null;
    }

    // ── text objects: return [from, to) or null ──
    function textObject(kind, obj) {
      const v = text();
      if (obj === 'w' || obj === 'W') {
        const big = obj === 'W';
        const c0 = cls(v[cur], big);
        let a = cur, b = cur;
        while (a > 0 && cls(v[a - 1], big) === c0 && v[a - 1] !== '\n') a--;
        while (b < v.length && cls(v[b], big) === c0 && v[b] !== '\n') b++;
        if (kind === 'a') {
          let e = b;
          while (e < v.length && (v[e] === ' ' || v[e] === '\t')) e++;
          if (e > b) b = e;
          else while (a > lineStart(cur) && (v[a - 1] === ' ' || v[a - 1] === '\t')) a--;
        }
        return [a, b];
      }
      const open = { '(': '(', ')': '(', b: '(', '[': '[', ']': '[', '{': '{', '}': '{', B: '{', '<': '<', '>': '<' }[obj];
      if (open) {
        const close = open === '<' ? '>' : PAIRS[open];
        let depth = 0, a = -1;
        for (let i = cur; i >= 0; i--) {
          if (v[i] === close && i !== cur) depth++;
          else if (v[i] === open) { if (depth === 0) { a = i; break; } depth--; }
        }
        if (a < 0) return null;
        depth = 0;
        for (let i = a + 1; i < v.length; i++) {
          if (v[i] === open) depth++;
          else if (v[i] === close) {
            if (depth === 0) return kind === 'i' ? [a + 1, i] : [a, i + 1];
            depth--;
          }
        }
        return null;
      }
      if (obj === '"' || obj === "'" || obj === '`' || obj === '$') {
        const ls = lineStart(cur), le = lineEnd(cur);
        const line = v.slice(ls, le);
        const at = cur - ls;
        const idx = [];
        for (let i = 0; i < line.length; i++) if (line[i] === obj && line[i - 1] !== '\\') idx.push(i);
        for (let k = 0; k + 1 < idx.length; k += 2) {
          if (at >= idx[k] && at <= idx[k + 1]) {
            return kind === 'i' ? [ls + idx[k] + 1, ls + idx[k + 1]] : [ls + idx[k], ls + idx[k + 1] + 1];
          }
        }
        return null;
      }
      return null;
    }

    // ── operators ──
    function applyOperator(op, from, to, linewise) {
      const v = text();
      if (linewise) {
        from = lineStart(from);
        to = lineEnd(Math.max(from, to - 1));
        if (op === '>' || op === '<') { indentLines(from, to, op === '>'); return; }
        const body = v.slice(from, to);
        reg = { text: body + '\n', linewise: true };
        if (op === 'y') { copyToClipboard(reg.text); cur = from; setMode('normal'); return; }
        if (op === 'c') {
          const indent = /^[ \t]*/.exec(body)[0];
          edit(from, to, indent);
          cur = from + indent.length;
          setMode('insert');
          return;
        }
        // d: take the line break too (the one before, on the last line)
        let a = from, b = to;
        if (b < v.length) b++;
        else if (a > 0) a--;
        edit(a, b, '');
        cur = firstNonBlank(Math.min(a, text().length));
        setMode('normal');
        return;
      }
      if (op === '>' || op === '<') { indentLines(from, to, op === '>'); return; }
      if (to <= from) { setMode('normal'); return; }
      reg = { text: v.slice(from, to), linewise: false };
      if (op === 'y') { copyToClipboard(reg.text); cur = from; setMode('normal'); return; }
      if (op === '~' || op === 'u' || op === 'U') {
        const s = v.slice(from, to);
        const t = op === 'u' ? s.toLowerCase() : op === 'U' ? s.toUpperCase()
          : [...s].map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');
        edit(from, to, t);
        cur = from;
        setMode('normal');
        return;
      }
      edit(from, to, '');
      cur = from;
      setMode(op === 'c' ? 'insert' : 'normal');
    }

    function indentLines(from, to, right) {
      const v = text();
      const a = lineStart(from), b = lineEnd(to);
      const out = v.slice(a, b).split('\n').map(l => (right ? (l ? '  ' + l : l) : l.replace(/^( {1,2}|\t)/, ''))).join('\n');
      edit(a, b, out);
      cur = firstNonBlank(a);
      setMode('normal');
    }

    function copyToClipboard(s) {
      try { navigator.clipboard && navigator.clipboard.writeText(s).catch(() => {}); } catch (_) {}
    }

    function paste(before, n) {
      if (!reg.text) return;
      const body = reg.text.repeat(n);
      const v = text();
      if (reg.linewise) {
        let at = before ? lineStart(cur) : lineEnd(cur) + 1;
        let ins = body;
        if (at > v.length) { at = v.length; ins = '\n' + body.replace(/\n$/, ''); }
        edit(at, at, ins);
        cur = firstNonBlank(at + (ins[0] === '\n' ? 1 : 0));
      } else {
        const at = before || v[cur] === '\n' || cur >= v.length ? cur : cur + 1;
        edit(at, at, body);
        cur = at + body.length - 1;
      }
      setMode('normal');
    }

    // ── search ──
    function searchFrom(p, reverse) {
      if (!lastSearch) return null;
      const v = text();
      const back = lastSearch.back !== reverse;
      const re = new RegExp(lastSearch.re.source, lastSearch.re.flags.replace('g', '') + 'g');
      const hits = [];
      for (let m; (m = re.exec(v));) { hits.push(m.index); if (!m[0]) re.lastIndex++; }
      if (!hits.length) { setStatus('Pattern not found'); return null; }
      if (back) { for (let i = hits.length - 1; i >= 0; i--) if (hits[i] < p) return hits[i]; return hits[hits.length - 1]; }
      for (const h of hits) if (h > p) return h;
      return hits[0];
    }

    // ── command line (":" and "/") ──
    let cmdPrefix = '';
    function openCmdline(prefix) {
      if (!opts.cmdlineEl) return;
      cmdPrefix = prefix;
      mode = 'cmdline';
      opts.cmdlineEl.hidden = false;
      opts.cmdlineEl.value = prefix;
      opts.cmdlineEl.focus();
      setStatus('');
    }
    function closeCmdline() {
      opts.cmdlineEl.hidden = true;
      mode = 'normal';
      ta.focus();
      render();
    }
    if (opts.cmdlineEl) {
      opts.cmdlineEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || (e.key === 'Backspace' && opts.cmdlineEl.value.length <= 1)) {
          e.preventDefault();
          e.stopPropagation();
          closeCmdline();
          return;
        }
        if (e.key !== 'Enter') return;
        e.preventDefault();
        e.stopPropagation();
        const line = opts.cmdlineEl.value;
        closeCmdline();
        runCmdline(line);
      });
      opts.cmdlineEl.addEventListener('blur', () => { if (mode === 'cmdline') closeCmdline(); });
    }

    function runCmdline(line) {
      const prefix = line[0], body = line.slice(1);
      if (prefix === '/' || prefix === '?') {
        if (body) {
          try { lastSearch = { re: new RegExp(body.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), /[A-Z]/.test(body) ? '' : 'i'), back: prefix === '?' }; } catch (_) { return; }
        }
        const p = searchFrom(cur, false);
        if (p != null) { cur = p; render(); }
        return;
      }
      const cmd = body.trim();
      if (/^\d+$/.test(cmd)) { cur = firstNonBlank(offsetOfLine(+cmd - 1)); render(); return; }
      if (cmd === 'w') { opts.onWrite && opts.onWrite(); return; }
      if (cmd === 'wq' || cmd === 'x') { opts.onWriteQuit && opts.onWriteQuit(); return; }
      if (cmd === 'q' || cmd === 'q!') { opts.onQuit && opts.onQuit(); return; }
      if (cmd === 'noh' || cmd === 'nohlsearch') { lastSearch = null; return; }
      const sub = /^(%)?s(.)(.*?)\2(.*?)(?:\2([gi]*))?$/.exec(cmd);
      if (sub) {
        const [, all, , pat, rep, flags = ''] = sub;
        let re;
        try { re = new RegExp(pat, (flags.includes('g') ? 'g' : '') + (flags.includes('i') ? 'i' : '')); } catch (_) { setStatus('Bad pattern'); return; }
        const v = text();
        const a = all ? 0 : lineStart(cur), b = all ? v.length : lineEnd(cur);
        const region = v.slice(a, b);
        const out = all ? region.split('\n').map(l => l.replace(re, rep)).join('\n') : region.replace(re, rep);
        if (out !== region) edit(a, b, out);
        cur = Math.min(cur, text().length);
        render();
        return;
      }
      setStatus('Not an editor command: ' + cmd);
    }

    // ── key dispatch ──
    function enterInsert(where) {
      const v = text();
      switch (where) {
        case 'i': break;
        case 'a': if (cur < v.length && v[cur] !== '\n') cur++; break;
        case 'I': cur = firstNonBlank(cur); break;
        case 'A': cur = lineEnd(cur); break;
        case 'o': case 'O': {
          const indent = /^[ \t]*/.exec(v.slice(lineStart(cur)))[0];
          if (where === 'o') { const e = lineEnd(cur); edit(e, e, '\n' + indent); cur = e + 1 + indent.length; }
          else { const s = lineStart(cur); edit(s, s, indent + '\n'); cur = s + indent.length; }
          break;
        }
      }
      setMode('insert');
    }

    // Parse and run the pending keys. Returns true when they formed a command
    // (or are invalid and were dropped), false when more keys are needed.
    function run() {
      const m = /^(\d*)(.*)$/.exec(keys);
      let count = m[1] && m[1] !== '0' ? +m[1] : null;
      let rest = m[1] === '0' ? '0' + m[2] : m[2];
      if (m[1] && m[1][0] === '0') { count = null; rest = keys; }
      if (!rest) return false;
      const n = count || 1;
      const visual = mode === 'visual' || mode === 'vline';
      const k = rest[0];

      const MOTIONS = 'hjklwWbBeE0^$G{}%;,nN ';
      const moveTo = (mm, arg) => {
        const r = motion(mm, n, arg != null ? arg : count);
        if (!r) return true;
        if (!r.keepCol) wantCol = null;
        cur = r.pos;
        render();
        return true;
      };

      // multi-key motions
      if (k === 'g') {
        if (rest.length < 2) return false;
        if (rest[1] === 'g') return moveTo('gg', count || 1);
        if (!visual && (rest[1] === 'u' || rest[1] === 'U' || rest[1] === '~')) {
          if (rest.length < 3) return false;
          return operatorWith(rest[1], rest.slice(2), n);
        }
        return true;
      }
      if ('fFtT'.includes(k)) { if (rest.length < 2) return false; return moveTo(k, rest[1]); }
      if (MOTIONS.includes(k) || k.startsWith('Arrow') || k === 'Home' || k === 'End' || k === 'Backspace') {
        return moveTo(rest.length > 1 && (k.startsWith('Arrow') || k === 'Home' || k === 'End' || k === 'Backspace') ? rest : k,
          k === 'G' ? count : undefined);
      }

      // visual-mode operations on the selection
      if (visual) {
        const a = Math.min(anchor, cur), b = Math.max(anchor, cur);
        const lw = mode === 'vline';
        const opFor = { d: 'd', x: 'd', y: 'y', c: 'c', s: 'c', '>': '>', '<': '<', '~': '~', u: 'u', U: 'U', D: 'd', X: 'd', Y: 'y' };
        if (k === 'o') { const t = anchor; anchor = cur; cur = t; render(); return true; }
        if (k === 'i' || k === 'a') {
          if (rest.length < 2) return false;
          const r = textObject(k, rest[1]);
          if (r) { anchor = r[0]; cur = Math.max(r[0], r[1] - 1); render(); }
          return true;
        }
        if (k === 'p' || k === 'P') {
          const lines = lw || 'DXY'.includes(k);
          const from = lines ? lineStart(a) : a, to = lines ? lineEnd(b) : b + 1;
          const saved = reg;
          edit(from, to, saved.linewise && !lw ? saved.text.replace(/\n$/, '') : saved.text);
          cur = from;
          setMode('normal');
          return true;
        }
        if (opFor[k]) {
          beginChange();
          const linewise = lw || 'DXY'.includes(k);
          applyOperator(opFor[k], a, b + 1, linewise);
          if (opFor[k] !== 'c') endChange();
          return true;
        }
        return true;
      }

      switch (k) {
        case 'i': case 'a': case 'I': case 'A': case 'o': case 'O':
          beginChange(); enterInsert(k); return true;
        case 'v': anchor = cur; mode = 'visual'; render(); return true;
        case 'V': anchor = cur; mode = 'vline'; render(); return true;
        case 'x': case 'X': case 's': case 'D': case 'C': case 'S': case 'Y': {
          const map = { x: 'dl', X: 'dh', s: 'cl', D: 'd$', C: 'c$', S: 'cc', Y: 'yy' };
          const expanded = map[k];
          if ((k === 'x' || k === 's') && (text()[cur] === '\n' || cur >= text().length)) return true;
          return operatorWith(expanded[0], expanded.slice(1), n);
        }
        case 'd': case 'c': case 'y': case '>': case '<':
          if (rest.length < 2) return false;
          return operatorWith(k, rest.slice(1), n);
        case 'p': case 'P': beginChange(); paste(k === 'P', n); endChange(); return true;
        case 'u': undo('undo', n); return true;
        case 'r': {
          if (rest.length < 2) return false;
          const e = lineEnd(cur);
          if (cur + n > e) return true;
          beginChange();
          const ch = rest[1] === 'Enter' ? '\n' : rest[1];
          edit(cur, cur + n, ch.repeat(n));
          cur += n - 1;
          render();
          endChange();
          return true;
        }
        case 'J': {
          beginChange();
          for (let i = 0; i < Math.max(1, n - 1); i++) {
            const e = lineEnd(cur);
            if (e >= text().length) break;
            let s = e + 1;
            while (text()[s] === ' ' || text()[s] === '\t') s++;
            edit(e, s, text()[s] === '\n' || s >= text().length ? '' : ' ');
            cur = e;
          }
          render();
          endChange();
          return true;
        }
        case '~': {
          const e = lineEnd(cur);
          const to = Math.min(e, cur + n);
          if (to <= cur) return true;
          beginChange();
          applyOperator('~', cur, to, false);
          cur = Math.min(to, lastCharOfLine(cur));
          render();
          endChange();
          return true;
        }
        case '.': {
          if (!lastChange) return true;
          replaying = true;
          try {
            for (let i = 0; i < n; i++) {
              keys = '';
              for (const kk of lastChange.keys) { keys += kk; if (run()) keys = ''; }
              if (mode === 'insert') {
                if (lastChange.insert) edit(ta.selectionStart, ta.selectionStart, lastChange.insert);
                leaveInsert();
              }
            }
          } finally { replaying = false; keys = ''; }
          return true;
        }
        case ':': openCmdline(':'); return true;
        case '/': case '?': openCmdline(k); return true;
        case '*': case '#': {
          const r = textObject('i', 'w');
          if (!r) return true;
          const word = text().slice(r[0], r[1]);
          lastSearch = { re: new RegExp('(?<![\\p{L}\\p{N}_])' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}_])', 'u'), back: k === '#' };
          const p = searchFrom(cur, false);
          if (p != null) { cur = p; render(); }
          return true;
        }
      }
      return true; // unknown: drop
    }

    // operator + (motion | text object | same operator for lines)
    function operatorWith(op, tail, n) {
      const tm = /^(\d*)(.*)$/.exec(tail);
      const n2 = tm[1] ? +tm[1] : 1;
      const t = tm[2];
      if (!t) return false;
      const total = n * n2;
      beginChange();
      const done = () => { if (op !== 'c') endChange(); return true; };
      // doubled operator (dd, cc, yy, >>, <<, g~~ …): whole lines
      if (t[0] === op || (op.length === 1 && 'uU~'.includes(op) && t[0] === op)) {
        const a = lineStart(cur);
        const b = lineEnd(offsetOfLine(lineIndex(cur) + total - 1));
        applyOperator(op, a, b + 1, true);
        return done();
      }
      if (t[0] === 'i' || t[0] === 'a') {
        if (t.length < 2) return false;
        const r = textObject(t[0], t[1]);
        if (!r) { changeKeys = null; return true; }
        applyOperator(op, r[0], r[1], false);
        return done();
      }
      if ('fFtT'.includes(t[0]) && t.length < 2) return false;
      if (t[0] === 'g' && t.length < 2) return false;
      let mm = t[0], arg;
      if ('fFtT'.includes(mm)) arg = t[1];
      if (mm === 'g') mm = 'gg';
      // cw / cW behave like ce / cE when on a word
      if (op === 'c' && (mm === 'w' || mm === 'W') && !isSpace(text()[cur])) mm = mm === 'w' ? 'e' : 'E';
      const start = cur;
      const r = motion(mm, total, mm === 'G' || mm === 'gg' ? (tm[1] ? n2 : null) : arg);
      if (!r) { changeKeys = null; return true; }
      let a = Math.min(start, r.pos), b = Math.max(start, r.pos);
      if (r.inclusive) b++;
      // dw at the end of a line stops at the line break
      if ((mm === 'w' || mm === 'W') && text().slice(start, b).includes('\n')) b = Math.max(start + 1, text().indexOf('\n', start));
      applyOperator(op, a, b, !!r.linewise);
      return done();
    }

    function undo(kind, n) {
      internal++;
      try {
        ta.focus();
        for (let i = 0; i < n; i++) document.execCommand(kind);
      } finally { internal--; }
      cur = ta.selectionStart;
      mode = 'normal';
      render();
    }

    // "." replays the keys of the last change plus whatever was typed in insert mode.
    function beginChange() { if (!replaying) changeKeys = keys; }
    function endChange() {
      if (!replaying && changeKeys != null) lastChange = { keys: changeKeys, insert: '' };
      changeKeys = null;
    }

    function leaveInsert() {
      const pos = ta.selectionStart;
      if (!replaying && changeKeys != null) {
        lastChange = { keys: changeKeys, insert: pos >= insertFrom ? text().slice(insertFrom, pos) : '' };
        changeKeys = null;
      }
      cur = Math.max(lineStart(pos), pos - 1);
      opts.onLeaveInsert && opts.onLeaveInsert();
      setMode('normal');
    }

    const keyName = (e) => {
      if (e.ctrlKey && !e.metaKey && e.key.length === 1) return 'C-' + e.key.toLowerCase();
      return e.key;
    };

    // Document-level capture: runs before the textarea's own handlers
    // (completion, snippets, Tab), so normal mode fully owns the keyboard.
    document.addEventListener('keydown', (e) => {
      if (!enabled || e.target !== ta || e.isComposing) return;
      const k = keyName(e);
      if (mode === 'insert') {
        if (k === 'Escape' || k === 'C-[' || k === 'C-c') {
          e.preventDefault();
          e.stopImmediatePropagation();
          leaveInsert();
        }
        return;
      }
      // Cmd shortcuts (save, comment, copy, …) keep working in every mode.
      if (e.metaKey || e.altKey) return;
      if (k === 'Shift' || k === 'Control' || k === 'Alt' || k === 'Meta' || k === 'CapsLock') return;
      if (e.ctrlKey && !['C-r', 'C-[', 'C-c', 'C-d', 'C-u'].includes(k)) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      if (k === 'Escape' || k === 'C-[' || k === 'C-c') {
        keys = '';
        if (mode === 'visual' || mode === 'vline') cur = cur;
        mode = 'normal';
        render();
        return;
      }
      if (k === 'C-r') { undo('redo', 1); return; }
      if (k === 'C-d' || k === 'C-u') {
        const lines = Math.max(1, Math.floor(ta.clientHeight / (parseFloat(getComputedStyle(ta).lineHeight) || 20) / 2));
        const r = motion(k === 'C-d' ? 'j' : 'k', lines);
        if (r) { cur = r.pos; render(); }
        return;
      }
      if (k === 'Enter' && !keys) { const r = motion('j', 1); if (r) { cur = firstNonBlank(r.pos); render(); } return; }
      if (k.length > 1 && !k.startsWith('Arrow') && !['Home', 'End', 'Backspace', 'Enter'].includes(k)) return;

      keys += k;
      if (run()) keys = '';
      setStatus();
    }, true);

    // Normal/visual mode: block typing, pasting and drops unless we are the ones editing.
    ta.addEventListener('beforeinput', (e) => {
      if (enabled && mode !== 'insert' && !internal) e.preventDefault();
    });
    // Mouse: clicking moves the cursor; dragging a selection enters visual mode.
    ta.addEventListener('mouseup', () => {
      if (!enabled || mode === 'insert') return;
      const a = ta.selectionStart, b = ta.selectionEnd;
      if (b - a > 1) { anchor = ta.selectionDirection === 'backward' ? b - 1 : a; cur = ta.selectionDirection === 'backward' ? a : b - 1; mode = 'visual'; }
      else { cur = a; if (mode !== 'normal') mode = 'normal'; }
      render();
    });
    ta.addEventListener('focus', () => { if (enabled && mode !== 'insert') setTimeout(render, 0); });

    return {
      setEnabled(on) {
        enabled = !!on;
        keys = '';
        if (enabled) { cur = ta.selectionStart; mode = 'normal'; render(); }
        else { mode = 'normal'; ta.setSelectionRange(ta.selectionStart, ta.selectionStart); }
        setStatus();
      },
      // Called when the editor loads new content.
      reset() { keys = ''; if (enabled) { cur = 0; mode = 'normal'; render(); } },
      enabled: () => enabled,
      mode: () => (enabled ? mode : 'off'),
    };
  }

  window.TextareaVim = { attach };
})();
