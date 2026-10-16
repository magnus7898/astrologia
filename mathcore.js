/* ============================================================
   mathcore.js — MAGNUS მათემატიკის ლაბორატორია: pure math engine
   Exact fractions (BigInt), expression parser, matrices,
   polynomial roots, equation & triangle solvers.
   Works in the browser (window.MathCore) and in Node (module.exports).
   ============================================================ */
(function (root) {
  'use strict';

  /* ---------------- BigInt helpers ---------------- */
  const babs = a => (a < 0n ? -a : a);
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { [a, b] = [b, a % b]; } return a; }

  /* ---------------- Fraction ---------------- */
  class F {
    constructor(n, d = 1n) {
      n = BigInt(n); d = BigInt(d);
      if (d === 0n) throw new Error('ნულზე გაყოფა');
      if (d < 0n) { n = -n; d = -d; }
      const g = bgcd(n, d) || 1n;
      this.n = n / g; this.d = d / g;
    }
    static of(x) {
      if (x instanceof F) return x;
      if (typeof x === 'bigint') return new F(x);
      if (typeof x === 'number') {
        if (!isFinite(x)) throw new Error('არასწორი რიცხვი');
        if (Number.isInteger(x)) return new F(BigInt(x));
        return F.parse(String(+x.toPrecision(15)));
      }
      return F.parse(String(x));
    }
    /* accepts: 3/4, -2, 0.25, .5, 25%, 1 1/2, -1 1/2, 1e-3, 0.(3) repeating */
    static parse(s) {
      s = String(s).trim().replace(/\s+/g, ' ').replace(',', '.').replace('−', '-');
      if (!s) throw new Error('ცარიელი ველი');
      let m;
      if ((m = s.match(/^([+-]?[\d.()]+(?:e[+-]?\d+)?)\s*%$/i))) return F.parse(m[1]).div(new F(100n));
      if ((m = s.match(/^([+-]?)(\d+) (\d+)\/(\d+)$/))) { // mixed
        const w = BigInt(m[2]), n = BigInt(m[3]), d = BigInt(m[4]);
        const f = new F(w * d + n, d); return m[1] === '-' ? f.neg() : f;
      }
      if ((m = s.match(/^([+-]?[\d.()e+-]+)\/([+-]?[\d.()e+-]+)$/i))) return F.parse(m[1]).div(F.parse(m[2]));
      if ((m = s.match(/^([+-]?)(\d*)\.(\d*)\((\d+)\)$/))) { // repeating 0.1(6)
        const ip = m[2] || '0', nr = m[3], rp = m[4];
        const a = BigInt(ip + nr + rp) - BigInt(ip + nr);
        const d = BigInt('9'.repeat(rp.length) + '0'.repeat(nr.length));
        const f = new F(a, d); return m[1] === '-' ? f.neg() : f;
      }
      if ((m = s.match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i)) && (m[2] || m[3])) {
        const ip = m[2] || '0', fp = m[3] || '', ex = parseInt(m[4] || '0', 10);
        let n = BigInt(ip + fp), d = 10n ** BigInt(fp.length);
        if (ex > 0) n *= 10n ** BigInt(ex); else if (ex < 0) d *= 10n ** BigInt(-ex);
        const f = new F(n, d); return m[1] === '-' ? f.neg() : f;
      }
      throw new Error('ვერ წავიკითხე: „' + s + '“');
    }
    add(b) { b = F.of(b); return new F(this.n * b.d + b.n * this.d, this.d * b.d); }
    sub(b) { b = F.of(b); return new F(this.n * b.d - b.n * this.d, this.d * b.d); }
    mul(b) { b = F.of(b); return new F(this.n * b.n, this.d * b.d); }
    div(b) { b = F.of(b); if (b.n === 0n) throw new Error('ნულზე გაყოფა'); return new F(this.n * b.d, this.d * b.n); }
    neg() { return new F(-this.n, this.d); }
    inv() { return new F(this.d, this.n); }
    isZero() { return this.n === 0n; }
    isInt() { return this.d === 1n; }
    sign() { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; }
    eq(b) { b = F.of(b); return this.n === b.n && this.d === b.d; }
    cmp(b) { b = F.of(b); const x = this.n * b.d - b.n * this.d; return x > 0n ? 1 : x < 0n ? -1 : 0; }
    num() { return Number(this.n) / Number(this.d); }
    toString() { return this.d === 1n ? String(this.n) : this.n + '/' + this.d; }
    mixed() {
      if (this.d === 1n || babs(this.n) < this.d) return null;
      const w = babs(this.n) / this.d, r = babs(this.n) % this.d;
      return { sign: this.n < 0n ? '-' : '', whole: w, n: r, d: this.d };
    }
  }

  /* decimal expansion with repeating part detection: 1/6 → 0.1(6) */
  function decimalExpansion(f, maxDigits = 60) {
    f = F.of(f);
    const neg = f.n < 0n; let n = babs(f.n); const d = f.d;
    const ip = n / d; let r = n % d;
    const seen = new Map(); let digits = '';
    while (r !== 0n && !seen.has(r) && digits.length < maxDigits) {
      seen.set(r, digits.length); r *= 10n; digits += String(r / d); r %= d;
    }
    let out;
    if (r === 0n) out = digits ? ip + '.' + digits : String(ip);
    else if (seen.has(r)) { const k = seen.get(r); out = ip + '.' + digits.slice(0, k) + '(' + digits.slice(k) + ')'; }
    else out = ip + '.' + digits + '…';
    return { text: (neg ? '-' : '') + out, terminating: r === 0n, repeating: r !== 0n && seen.has(r) };
  }

  /* ---------------- integer helpers ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  function simplifySqrt(n) { // √n = k√m
    let k = 1, m = n;
    for (let i = 2; i * i <= m; i++) while (m % (i * i) === 0) { m /= i * i; k *= i; }
    return [k, m];
  }
  function primeFactors(n) {
    n = Math.abs(Math.trunc(n)); const out = [];
    for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; }
    if (n > 1) out.push(n); return out;
  }

  /* ---------------- expression parser ---------------- */
  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    cot: x => 1 / Math.tan(x), sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x),
    asin: Math.asin, acos: Math.acos, atan: Math.atan, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp,
    ln: Math.log, log: Math.log10, lg: Math.log10, log2: Math.log2,
    floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign
  };
  const CONSTS = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI };

  /* real power: (-8)^(1/3) = -2, x^(2/3) defined for x < 0 */
  function rpow(b, e) {
    if (b >= 0 || Number.isInteger(e)) return Math.pow(b, e);
    for (let q = 3; q <= 15; q += 2) { const p = Math.round(e * q); if (Math.abs(e * q - p) < 1e-9) { const r = Math.pow(-b, e); return (p % 2 ? -r : r); } }
    return NaN;
  }
  FUNCS.root = (x, n) => rpow(x, 1 / n);
  FUNCS.nroot = FUNCS.root;
  FUNCS.max = Math.max; FUNCS.min = Math.min;
  FUNCS.mod = (a, b) => ((a % b) + b) % b;
  FUNCS.logb = (x, b) => Math.log(x) / Math.log(b);
  const VARS = ['x', 'y', 't', 'theta', 'r', 'a', 'b', 'c', 'd', 'k', 'n'];

  function normalizeExpr(s) {
    return String(s).toLowerCase()
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/π/g, 'pi').replace(/θ/g, 'theta').replace(/∛/g, 'cbrt').replace(/√/g, 'sqrt')
      .replace(/[·×]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-')
      .replace(/(\d),(\d)(?![^()]*\))/g, '$1.$2') // decimal comma outside parentheses
      .replace(/^\s*f\s*\(\s*x\s*\)\s*=/, '');
  }
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[\d.]/.test(c)) { let j = i; while (j < s.length && /[\d.]/.test(s[j])) j++;
        if (s[j] === 'e' && /[\d+-]/.test(s[j + 1] || '') && /\d/.test(s[j + 1] === '-' || s[j + 1] === '+' ? s[j + 2] || '' : s[j + 1])) { j++; if (/[+-]/.test(s[j])) j++; while (/\d/.test(s[j] || '')) j++; }
        const v = parseFloat(s.slice(i, j)); if (isNaN(v)) throw new Error('არასწორი რიცხვი: ' + s.slice(i, j));
        t.push({ k: 'n', v }); i = j; continue; }
      if (/[a-z]/.test(c)) { let j = i; while (j < s.length && /[a-z]/.test(s[j])) j++;
        let w = s.slice(i, j);
        if (w.endsWith('log') && s[j] === '2') { w += '2'; j++; }
        splitIdent(w).forEach(p => t.push({ k: 'id', v: p })); i = j; continue; }
      if ('+-*/^(),|!'.includes(c)) { t.push({ k: c }); i++; continue; }
      throw new Error('უცნობი სიმბოლო: ' + c);
    }
    return t;
  }
  function splitIdent(w) {
    const known = Object.keys(FUNCS).concat(Object.keys(CONSTS), VARS).sort((a, b) => b.length - a.length);
    const out = []; let i = 0;
    while (i < w.length) {
      const hit = known.find(k => w.startsWith(k, i));
      if (!hit) throw new Error('უცნობი სახელი: ' + w.slice(i));
      out.push(hit); i += hit.length;
    }
    return out;
  }
  function fact(n) { if (n < 0 || !Number.isInteger(n)) return NaN; let r = 1; for (let i = 2; i <= n && r < Infinity; i++) r *= i; return r; }

  /* ---- parse → AST ---- */
  function parse(src) {
    const toks = tokenize(normalizeExpr(src)); let p = 0, absDepth = 0;
    const peek = () => toks[p], next = () => toks[p++];
    const expect = k => { const t = next(); if (!t || t.k !== k) throw new Error('აკლია „' + k + '“'); };
    function expr() { let n = term(); while (peek() && (peek().k === '+' || peek().k === '-')) { const op = next().k; n = { k: 'b', op, l: n, r: term() }; } return n; }
    const startsFactor = t => t && (t.k === 'n' || t.k === 'id' || t.k === '(' || (t.k === '|' && absDepth === 0));
    function term() { let n = unary();
      for (;;) { const t = peek();
        if (t && (t.k === '*' || t.k === '/')) { next(); n = { k: 'b', op: t.k, l: n, r: unary() }; }
        else if (startsFactor(t)) n = { k: 'b', op: '*', imp: true, l: n, r: power() };
        else return n; } }
    function unary() { const t = peek(); if (t && t.k === '-') { next(); return { k: 'u', a: unary() }; } if (t && t.k === '+') { next(); return unary(); } return power(); }
    function power() { let b = postfix(); if (peek() && peek().k === '^') { next(); return { k: 'b', op: '^', l: b, r: unary() }; } return b; }
    function postfix() { let a = atom(); while (peek() && peek().k === '!') { next(); a = { k: 'f', name: 'fact', args: [a] }; } return a; }
    function atom() {
      const t = next(); if (!t) throw new Error('ფორმულა დაუსრულებელია');
      if (t.k === 'n') return { k: 'n', v: t.v };
      if (t.k === '(') { const e = expr(); expect(')'); return e; }
      if (t.k === '|') { absDepth++; const e = expr(); absDepth--; expect('|'); return { k: 'f', name: 'abs', args: [e] }; }
      if (t.k === 'id') {
        if (FUNCS[t.v]) {
          let pw = null; if (peek() && peek().k === '^') { next(); pw = postfix(); } // sin^2(x)
          let args;
          if (peek() && peek().k === '(') { next(); args = [expr()]; while (peek() && peek().k === ',') { next(); args.push(expr()); } expect(')'); }
          else args = [power()];
          const f = { k: 'f', name: t.v, args };
          return pw ? { k: 'b', op: '^', l: f, r: pw } : f;
        }
        if (t.v in CONSTS) return { k: 'c', name: t.v };
        return { k: 'v', name: t.v };
      }
      throw new Error('მოულოდნელი „' + t.k + '“');
    }
    const ast = expr();
    if (p < toks.length) throw new Error('ზედმეტი სიმბოლო: ' + (toks[p].k === 'id' ? toks[p].v : toks[p].k));
    return ast;
  }
  function compileAST(n) {
    switch (n.k) {
      case 'n': { const c = n.v; return () => c; }
      case 'c': { const c = CONSTS[n.name]; return () => c; }
      case 'v': { const nm = n.name; return v => (v && nm in v ? v[nm] : NaN); }
      case 'u': { const a = compileAST(n.a); return v => -a(v); }
      case 'b': { const l = compileAST(n.l), r = compileAST(n.r);
        switch (n.op) { case '+': return v => l(v) + r(v); case '-': return v => l(v) - r(v); case '*': return v => l(v) * r(v);
          case '/': return v => l(v) / r(v); default: return v => rpow(l(v), r(v)); } }
      case 'f': { const f = n.name === 'fact' ? fact : FUNCS[n.name], as = n.args.map(compileAST);
        if (as.length === 1) { const a = as[0]; return v => f(a(v)); }
        if (as.length === 2) { const [a, b] = as; return v => f(a(v), b(v)); }
        return v => f(...as.map(g => g(v))); }
    }
  }
  function usedVars(n, s = new Set()) {
    if (n.k === 'v') s.add(n.name);
    if (n.l) usedVars(n.l, s); if (n.r) usedVars(n.r, s); if (n.a) usedVars(n.a, s); if (n.args) n.args.forEach(a => usedVars(a, s));
    return s;
  }
  /* ---- AST → pretty HTML (fractions, powers, roots) ---- */
  const VNAME = { theta: 'θ' };
  function numHTML(v) { let s = String(+v.toPrecision(12)); if (s.includes('e')) s = s.replace(/e\+?(-?\d+)/, '·10<sup>$1</sup>'); return s; }
  function toHTML(n, parentPrec = 0, side) {
    const prec = n.k === 'b' ? ({ '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 })[n.op] : n.k === 'u' ? 3 : 5;
    let h;
    switch (n.k) {
      case 'n': h = numHTML(n.v); break;
      case 'c': h = n.name === 'pi' ? 'π' : n.name === 'tau' ? 'τ' : '<i>e</i>'; break;
      case 'v': h = '<i>' + (VNAME[n.name] || n.name) + '</i>'; break;
      case 'u': h = '−' + toHTML(n.a, 3); break;
      case 'f': {
        const a = n.args.map(x => toHTML(x, 0));
        if (n.name === 'sqrt') h = '<span class="sq">√<span class="ol">' + a[0] + '</span></span>';
        else if (n.name === 'cbrt') h = '<span class="sq"><sup class="ix">3</sup>√<span class="ol">' + a[0] + '</span></span>';
        else if (n.name === 'root' || n.name === 'nroot') h = '<span class="sq"><sup class="ix">' + (a[1] || '') + '</sup>√<span class="ol">' + a[0] + '</span></span>';
        else if (n.name === 'abs') h = '|' + a[0] + '|';
        else if (n.name === 'fact') h = toHTML(n.args[0], 5) + '!';
        else if (n.name === 'exp') h = '<i>e</i><sup>' + a[0] + '</sup>';
        else { const nm = { tan: 'tg', cot: 'ctg', arctan: 'arctg', atan: 'arctg', log: 'lg', log2: 'log<sub>2</sub>' }[n.name] || n.name;
          if (n.name === 'logb') h = 'log<sub>' + a[1] + '</sub>(' + a[0] + ')';
          else h = '<span class="fn">' + nm + '</span>(' + a.join(', ') + ')'; }
        break; }
      case 'b':
        if (n.op === '/') { h = '<span class="fr"><span>' + toHTML(n.l, 0) + '</span><span>' + toHTML(n.r, 0) + '</span></span>'; break; }
        if (n.op === '^') { h = toHTML(n.l, 5) + '<sup>' + toHTML(n.r, 0) + '</sup>'; break; }
        if (n.op === '*') { const L = toHTML(n.l, 2), R = toHTML(n.r, 2.5);
          const numRight = n.r.k === 'n' || (n.r.k === 'b' && n.r.op === '^' && n.r.l.k === 'n');
          h = L + (n.imp && !numRight ? '' : '·') + R; break; }
        h = toHTML(n.l, 1) + (n.op === '+' ? ' + ' : ' − ') + toHTML(n.r, 1.5); break;
    }
    return prec < parentPrec || (n.k === 'u' && parentPrec > 1) ? '(' + h + ')' : h;
  }
  function compile(src) { return compileAST(parse(src)); }
  function evaluate(src, vars) { return compile(src)(vars || {}); }

  /* ---- classify a typed formula: explicit / implicit / inequality / parametric / polar ---- */
  function splitTop(s, ch) { let d = 0; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === '(') d++; else if (c === ')') d--; else if (c === ch && d === 0) return [s.slice(0, i), s.slice(i + 1)]; } return null; }
  function classify(raw) {
    let s = normalizeExpr(raw).trim();
    if (!s) throw new Error('ცარიელი');
    // parametric: (f(t), g(t))
    if (s[0] === '(' && s[s.length - 1] === ')') { const inner = s.slice(1, -1), parts = splitTop(inner, ',');
      if (parts) { const X = parse(parts[0]), Y = parse(parts[1]);
        return { kind: 'param', fx: compileAST(X), fy: compileAST(Y), html: '<i>x</i> = ' + toHTML(X) + ', &nbsp;<i>y</i> = ' + toHTML(Y) }; } }
    const ineq = s.match(/^(.*?)(<=|>=|≤|≥|<|>)(.*)$/);
    if (ineq) { const L = parse(ineq[1]), R = parse(ineq[3]); const op = { '≤': '<=', '≥': '>=' }[ineq[2]] || ineq[2];
      const sym = { '<': '&lt;', '>': '&gt;', '<=': '≤', '>=': '≥' }[op];
      const l = compileAST(L), r = compileAST(R);
      return { kind: 'ineq', op, g: v => l(v) - r(v), html: toHTML(L) + ' ' + sym + ' ' + toHTML(R) }; }
    const eq = splitTop(s, '=');
    if (eq) {
      const lhs = eq[0].trim(), rhs = eq[1].trim();
      if (lhs === 'r') { const R = parse(rhs); return { kind: 'polar', fr: compileAST(R), html: '<i>r</i> = ' + toHTML(R) }; }
      const L = parse(lhs), R = parse(rhs);
      if (lhs === 'y' && !usedVars(R).has('y')) return { kind: 'explicit', f: compileAST(R), html: '<i>y</i> = ' + toHTML(R), ast: R };
      const l = compileAST(L), r = compileAST(R);
      return { kind: 'implicit', g: v => l(v) - r(v), html: toHTML(L) + ' = ' + toHTML(R) };
    }
    const A = parse(s);
    if (usedVars(A).has('y')) { const g = compileAST(A); return { kind: 'implicit', g, html: toHTML(A) + ' = 0' }; }
    return { kind: 'explicit', f: compileAST(A), html: '<i>y</i> = ' + toHTML(A), ast: A };
  }

  /* ---------------- matrices (exact) ---------------- */
  const M = {
    of(rows) { return rows.map(r => r.map(F.of)); },
    zeros(r, c) { return Array.from({ length: r }, () => Array.from({ length: c }, () => new F(0n))); },
    eye(n) { return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => new F(i === j ? 1n : 0n))); },
    clone(A) { return A.map(r => r.slice()); },
    dims(A) { return [A.length, A[0] ? A[0].length : 0]; },
    add(A, B) { M.sameSize(A, B); return A.map((r, i) => r.map((x, j) => x.add(B[i][j]))); },
    sub(A, B) { M.sameSize(A, B); return A.map((r, i) => r.map((x, j) => x.sub(B[i][j]))); },
    scale(A, k) { k = F.of(k); return A.map(r => r.map(x => x.mul(k))); },
    sameSize(A, B) { if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('მატრიცების ზომები არ ემთხვევა (' + A.length + '×' + A[0].length + ' და ' + B.length + '×' + B[0].length + ')'); },
    mul(A, B) {
      if (A[0].length !== B.length) throw new Error('A-ს სვეტების რაოდენობა (' + A[0].length + ') უნდა უდრიდეს B-ს სტრიქონებს (' + B.length + ')');
      return A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s.add(x.mul(B[k][j])), new F(0n))));
    },
    T(A) { return A[0].map((_, j) => A.map(r => r[j])); },
    trace(A) { M.square(A); return A.reduce((s, r, i) => s.add(r[i]), new F(0n)); },
    square(A) { if (A.length !== A[0].length) throw new Error('საჭიროა კვადრატული მატრიცა'); },
    pow(A, k) { M.square(A); let R = M.eye(A.length), P = A; while (k > 0) { if (k & 1) R = M.mul(R, P); P = M.mul(P, P); k >>= 1; } return R; },
    det(A) {
      M.square(A); const n = A.length, a = M.clone(A); let d = new F(1n);
      for (let c = 0; c < n; c++) {
        let p = c; while (p < n && a[p][c].isZero()) p++;
        if (p === n) return new F(0n);
        if (p !== c) { [a[p], a[c]] = [a[c], a[p]]; d = d.neg(); }
        d = d.mul(a[c][c]);
        for (let r = c + 1; r < n; r++) { if (a[r][c].isZero()) continue; const f = a[r][c].div(a[c][c]); a[r] = a[r].map((x, j) => x.sub(f.mul(a[c][j]))); }
      }
      return d;
    },
    minor(A, i, j) { return A.filter((_, r) => r !== i).map(r => r.filter((_, c) => c !== j)); },
    /* Gauss–Jordan with recorded steps; aug = number of columns to the right that are augmented */
    rref(A, aug = 0) {
      const a = M.clone(A), [rows, cols] = M.dims(a), steps = [], piv = [];
      const lim = cols - aug; let r = 0;
      const lbl = i => 'R' + (i + 1);
      for (let c = 0; c < lim && r < rows; c++) {
        let p = r; while (p < rows && a[p][c].isZero()) p++;
        if (p === rows) continue;
        if (p !== r) { [a[p], a[r]] = [a[r], a[p]]; steps.push({ op: lbl(r) + ' ↔ ' + lbl(p), m: M.clone(a) }); }
        const pv = a[r][c];
        if (!pv.eq(1)) { a[r] = a[r].map(x => x.div(pv)); steps.push({ op: lbl(r) + ' → ' + lbl(r) + ' ÷ ' + fmt(pv), m: M.clone(a) }); }
        for (let i = 0; i < rows; i++) {
          if (i === r || a[i][c].isZero()) continue;
          const f = a[i][c];
          a[i] = a[i].map((x, j) => x.sub(f.mul(a[r][j])));
          steps.push({ op: lbl(i) + ' → ' + lbl(i) + (f.sign() > 0 ? ' − ' + fmtAbs(f) : ' + ' + fmtAbs(f)) + '·' + lbl(r), m: M.clone(a) });
        }
        piv.push(c); r++;
      }
      return { R: a, steps, pivots: piv, rank: piv.length };
    },
    rank(A) { return M.rref(A).rank; },
    inverse(A) {
      M.square(A); const n = A.length;
      const aug = A.map((r, i) => r.concat(M.eye(n)[i]));
      const res = M.rref(aug, n);
      if (res.rank < n) throw new Error('მატრიცა გადაგვარებულია (det = 0) — შებრუნებული არ არსებობს');
      return { inv: res.R.map(r => r.slice(n)), steps: res.steps };
    },
    solve(A, b) { // b: column vector array of F
      const aug = A.map((r, i) => r.concat([b[i]]));
      const n = A[0].length, res = M.rref(aug, 1), R = res.R;
      for (const row of R) if (row.slice(0, n).every(x => x.isZero()) && !row[n].isZero()) return { kind: 'none', steps: res.steps, R };
      if (res.rank === n) return { kind: 'unique', x: R.slice(0, n).map(r => r[n]), steps: res.steps, R };
      // parametric
      const free = []; for (let j = 0; j < n; j++) if (!res.pivots.includes(j)) free.push(j);
      const expr = Array(n).fill(null);
      res.pivots.forEach((pc, i) => {
        let s = fmt(R[i][n]) === '0' ? '' : fmt(R[i][n]);
        free.forEach(fj => { const c = R[i][fj].neg(); if (c.isZero()) return; s += (c.sign() < 0 ? ' − ' : (s ? ' + ' : '')) + (fmtAbs(c) === '1' ? '' : fmtAbs(c)) + 't' + (fj + 1); });
        expr[pc] = s || '0';
      });
      free.forEach(fj => (expr[fj] = 't' + (fj + 1) + ' (თავისუფალი)'));
      return { kind: 'infinite', expr, free, steps: res.steps, R };
    },
    /* characteristic polynomial coefficients [1, c1, …, cn] via Faddeev–LeVerrier (exact) */
    charPoly(A) {
      M.square(A); const n = A.length; const c = [new F(1n)]; let Mk = M.zeros(n, n);
      for (let k = 1; k <= n; k++) {
        const AM = M.mul(A, Mk);
        Mk = AM.map((r, i) => r.map((x, j) => (i === j ? x.add(c[k - 1]) : x)));
        const tr = M.trace(M.mul(A, Mk));
        c.push(tr.neg().div(new F(BigInt(k))));
      }
      return c;
    },
    toNum(A) { return A.map(r => r.map(x => x.num())); }
  };

  function fmt(x) { return F.of(x).toString(); }
  function fmtAbs(x) { x = F.of(x); return (x.sign() < 0 ? x.neg() : x).toString(); }

  /* ---------------- polynomial roots (Durand–Kerner) ---------------- */
  function polyRoots(coef) { // coef: numbers, highest first
    let a = coef.slice(); while (a.length && Math.abs(a[0]) < 1e-14) a.shift();
    const n = a.length - 1; if (n < 1) return [];
    a = a.map(x => x / a[0]);
    const cm = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
    const cd = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
    let R = 1 + Math.max(...a.slice(1).map(Math.abs));
    let z = Array.from({ length: n }, (_, k) => [R * 0.9 * Math.cos(2 * Math.PI * k / n + 0.4), R * 0.9 * Math.sin(2 * Math.PI * k / n + 0.4)]);
    for (let it = 0; it < 500; it++) {
      let delta = 0;
      z = z.map((zi, i) => {
        let p = [1, 0]; for (let k = 1; k <= n; k++) { p = cm(p, zi); p[0] += a[k]; }
        let q = [1, 0]; z.forEach((zj, j) => { if (j !== i) q = cm(q, [zi[0] - zj[0], zi[1] - zj[1]]); });
        const s = cd(p, q); delta = Math.max(delta, Math.hypot(s[0], s[1]));
        return [zi[0] - s[0], zi[1] - s[1]];
      });
      if (delta < 1e-14) break;
    }
    return z.map(([re, im]) => [Math.abs(re) < 1e-10 ? 0 : re, Math.abs(im) < 1e-9 ? 0 : im])
      .sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  }

  /* ---------------- quadratic (exact where possible) ---------------- */
  function quadratic(a, b, c) {
    a = F.of(a); b = F.of(b); c = F.of(c);
    if (a.isZero()) throw new Error('a ≠ 0 უნდა იყოს (თორემ განტოლება წრფივია)');
    const D = b.mul(b).sub(a.mul(c).mul(4));
    const xv = b.neg().div(a.mul(2)), yv = c.sub(b.mul(b).div(a.mul(4)));
    const res = { a, b, c, D, vertex: [xv, yv], roots: [], exact: [] };
    const Dn = D.num(), an = a.num(), bn = b.num();
    if (Dn > 0) {
      const s = Math.sqrt(Dn); res.roots = [(-bn - s) / (2 * an), (-bn + s) / (2 * an)].sort((p, q) => p - q);
      res.kind = 2;
    } else if (Dn === 0) { res.roots = [xv.num()]; res.kind = 1; }
    else { res.kind = 0; res.complex = [[-bn / (2 * an), -Math.sqrt(-Dn) / (2 * an)], [-bn / (2 * an), Math.sqrt(-Dn) / (2 * an)]]; }
    // exact form when coefficients are integers
    if (a.isInt() && b.isInt() && c.isInt()) {
      const A = Number(a.n), B = Number(b.n), Dv = Number(D.n);
      const [k, m] = simplifySqrt(Math.abs(Dv));
      const den = 2 * A;
      if (m === 1) { // rational roots
        if (Dv >= 0) res.exact = [new F(BigInt(-B - k), BigInt(den)), new F(BigInt(-B + k), BigInt(den))].sort((p, q) => p.cmp(q)).map(String);
        else res.exact = [fmtSurd(-B, k, den, 'i', -1), fmtSurd(-B, k, den, 'i', 1)];
      } else {
        const g = gcd(gcd(Math.abs(B), k), Math.abs(den)) || 1;
        let p = -B / g, q = k / g, d = den / g; if (d < 0) { p = -p; d = -d; }
        const root = Dv < 0 ? 'i√' + m : '√' + m;
        const qs = (q === 1 ? '' : q) + root;
        const num = (p !== 0 ? p + ' ± ' : '±') + qs;
        res.exact = [d === 1 ? num : '(' + num + ')/' + d];
      }
    }
    return res;
  }
  function fmtSurd(p, k, den, unit, sg) {
    const re = new F(BigInt(p), BigInt(den)), im = new F(BigInt(sg * k), BigInt(den));
    return (re.isZero() ? '' : re + (im.sign() < 0 ? ' − ' : ' + ')) + (fmtAbs(im) === '1' ? '' : fmtAbs(im)) + unit;
  }

  /* ---------------- triangles ---------------- */
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function triFromSSS(a, b, c) {
    if (a <= 0 || b <= 0 || c <= 0) throw new Error('გვერდები დადებითი უნდა იყოს');
    if (a + b <= c || a + c <= b || b + c <= a) throw new Error('სამკუთხედის უტოლობა ირღვევა: ორი გვერდის ჯამი მესამეზე მეტი უნდა იყოს');
    const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * R2D;
    const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * R2D;
    return finishTri(a, b, c, A, B, 180 - A - B);
  }
  function finishTri(a, b, c, A, B, C) {
    const s = (a + b + c) / 2, area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
    return { a, b, c, A, B, C, P: a + b + c, S: area, R: a / (2 * Math.sin(A * D2R)), r: area / s,
      ha: 2 * area / a, hb: 2 * area / b, hc: 2 * area / c };
  }
  function solveTriangle(mode, v) {
    const steps = [];
    if (mode === 'SSS') { steps.push('კოსინუსების თეორემა: cos A = (b² + c² − a²) / 2bc'); return { t: triFromSSS(v.a, v.b, v.c), steps }; }
    if (mode === 'SAS') { // a, b, C
      if (!(v.C > 0 && v.C < 180)) throw new Error('კუთხე 0°-სა და 180°-ს შორის უნდა იყოს');
      const c = Math.sqrt(v.a * v.a + v.b * v.b - 2 * v.a * v.b * Math.cos(v.C * D2R));
      steps.push('c² = a² + b² − 2ab·cos C → c = ' + c.toFixed(4));
      return { t: triFromSSS(v.a, v.b, c), steps };
    }
    if (mode === 'ASA') { // A, c, B
      const C = 180 - v.A - v.B; if (C <= 0) throw new Error('კუთხეების ჯამი 180°-ზე ნაკლები უნდა იყოს');
      const k = v.c / Math.sin(C * D2R);
      steps.push('C = 180° − A − B = ' + C.toFixed(4) + '°', 'სინუსების თეორემა: a / sin A = b / sin B = c / sin C');
      return { t: finishTri(k * Math.sin(v.A * D2R), k * Math.sin(v.B * D2R), v.c, v.A, v.B, C), steps };
    }
    if (mode === 'AAS') { // A, B, a
      const C = 180 - v.A - v.B; if (C <= 0) throw new Error('კუთხეების ჯამი 180°-ზე ნაკლები უნდა იყოს');
      const k = v.a / Math.sin(v.A * D2R);
      steps.push('C = 180° − A − B = ' + C.toFixed(4) + '°', 'სინუსების თეორემა: a / sin A = b / sin B = c / sin C');
      return { t: finishTri(v.a, k * Math.sin(v.B * D2R), k * Math.sin(C * D2R), v.A, v.B, C), steps };
    }
    if (mode === 'SSA') { // a, b, A  (ambiguous case)
      const sinB = v.b * Math.sin(v.A * D2R) / v.a;
      steps.push('sin B = b·sin A / a = ' + sinB.toFixed(5));
      if (sinB > 1 + 1e-12) throw new Error('ასეთი სამკუთხედი არ არსებობს (sin B > 1)');
      const B1 = Math.asin(Math.min(1, sinB)) * R2D, sols = [];
      [B1, 180 - B1].forEach((B, i) => { if (i === 1 && Math.abs(B - B1) < 1e-9) return; const C = 180 - v.A - B; if (C > 1e-9) {
        const c = v.a * Math.sin(C * D2R) / Math.sin(v.A * D2R); sols.push(finishTri(v.a, v.b, c, v.A, B, C)); } });
      if (!sols.length) throw new Error('ასეთი სამკუთხედი არ არსებობს');
      if (sols.length === 2) steps.push('ორაზროვანი შემთხვევა: ორი სამკუთხედი აკმაყოფილებს პირობას');
      return { t: sols[0], alt: sols[1], steps };
    }
    throw new Error('უცნობი რეჟიმი');
  }
  /* right triangle: legs a,b, hypotenuse c, acute angles A (opposite a), B */
  function solveRight(v) {
    const k = ['a', 'b', 'c', 'A', 'B'].filter(x => v[x] != null && !isNaN(v[x]));
    if (k.length < 2) throw new Error('შეიყვანე ორი სიდიდე (მინიმუმ ერთი გვერდი)');
    if (!k.some(x => 'abc'.includes(x))) throw new Error('საჭიროა ერთი გვერდი მაინც');
    let { a, b, c, A, B } = v; const steps = [];
    if (A != null && !isNaN(A)) B = 90 - A; else if (B != null && !isNaN(B)) A = 90 - B;
    if (A != null && !isNaN(A) && (A <= 0 || A >= 90)) throw new Error('მახვილი კუთხე 0°-სა და 90°-ს შორისაა');
    const has = x => x != null && !isNaN(x);
    if (has(a) && has(b)) { c = Math.hypot(a, b); steps.push('პითაგორას თეორემა: c = √(a² + b²) = ' + c.toFixed(4)); A = Math.atan2(a, b) * R2D; B = 90 - A; steps.push('tg A = a / b → A = ' + A.toFixed(4) + '°'); }
    else if (has(a) && has(c)) { if (a >= c) throw new Error('კათეტი ჰიპოტენუზაზე ნაკლები უნდა იყოს'); b = Math.sqrt(c * c - a * a); steps.push('b = √(c² − a²) = ' + b.toFixed(4)); A = Math.asin(a / c) * R2D; B = 90 - A; steps.push('sin A = a / c → A = ' + A.toFixed(4) + '°'); }
    else if (has(b) && has(c)) { if (b >= c) throw new Error('კათეტი ჰიპოტენუზაზე ნაკლები უნდა იყოს'); a = Math.sqrt(c * c - b * b); steps.push('a = √(c² − b²) = ' + a.toFixed(4)); A = Math.acos(b / c) * R2D; B = 90 - A; steps.push('cos A = b / c → A = ' + A.toFixed(4) + '°'); }
    else if (has(A)) {
      const r = A * D2R;
      if (has(a)) { c = a / Math.sin(r); b = a / Math.tan(r); steps.push('c = a / sin A, b = a / tg A'); }
      else if (has(b)) { c = b / Math.cos(r); a = b * Math.tan(r); steps.push('a = b·tg A, c = b / cos A'); }
      else { a = c * Math.sin(r); b = c * Math.cos(r); steps.push('a = c·sin A, b = c·cos A'); }
    }
    return { t: finishTri(a, b, c, A, B, 90), steps };
  }

  /* ---------------- angles ---------------- */
  function piFraction(rad) { // nice multiple of π, e.g. 3π/4
    const f = rad / Math.PI;
    for (let d = 1; d <= 12; d++) { const n = Math.round(f * d); if (Math.abs(f * d - n) < 1e-9) {
      const g = gcd(n, d) || 1, N = n / g, Dd = d / g;
      if (N === 0) return '0';
      const nn = N === 1 ? '' : N === -1 ? '−' : String(N).replace('-', '−');
      return nn + 'π' + (Dd === 1 ? '' : '/' + Dd);
    } }
    return null;
  }
  const EXACT_TRIG = { // degrees in [0,360) → [sin, cos, tan]
    0: ['0', '1', '0'], 30: ['1/2', '√3/2', '√3/3'], 45: ['√2/2', '√2/2', '1'], 60: ['√3/2', '1/2', '√3'], 90: ['1', '0', '—'],
    120: ['√3/2', '−1/2', '−√3'], 135: ['√2/2', '−√2/2', '−1'], 150: ['1/2', '−√3/2', '−√3/3'], 180: ['0', '−1', '0'],
    210: ['−1/2', '−√3/2', '√3/3'], 225: ['−√2/2', '−√2/2', '1'], 240: ['−√3/2', '−1/2', '√3'], 270: ['−1', '0', '—'],
    300: ['−√3/2', '1/2', '−√3'], 315: ['−√2/2', '√2/2', '−1'], 330: ['−1/2', '√3/2', '−√3/3']
  };
  function toDMS(deg) {
    const s = deg < 0 ? -1 : 1; let x = Math.abs(deg);
    let d = Math.floor(x), m = Math.floor((x - d) * 60), sec = (x - d - m / 60) * 3600;
    sec = Math.round(sec * 100) / 100; if (sec >= 60) { sec -= 60; m++; } if (m >= 60) { m -= 60; d++; }
    return { sign: s, d, m, s: sec };
  }

  const api = { F, decimalExpansion, gcd, simplifySqrt, primeFactors, compile, evaluate, parse, compileAST, toHTML, classify, usedVars, rpow, M, fmt, polyRoots, quadratic,
    solveTriangle, solveRight, piFraction, EXACT_TRIG, toDMS, D2R, R2D };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MathCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
