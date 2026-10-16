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

  function normalizeExpr(s) {
    return String(s).toLowerCase()
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/√/g, 'sqrt')
      .replace(/[·×]/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.')
      .replace(/^\s*y\s*=/, '').replace(/^\s*f\s*\(\s*x\s*\)\s*=/, '');
  }
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[\d.]/.test(c)) { let j = i; while (j < s.length && /[\d.]/.test(s[j])) j++;
        if (s[j] === 'e' && /[\d+-]/.test(s[j + 1] || '') && !/[a-z]/.test(s[j + 1])) { j++; if (/[+-]/.test(s[j])) j++; while (/\d/.test(s[j] || '')) j++; }
        t.push({ k: 'n', v: parseFloat(s.slice(i, j)) }); i = j; continue; }
      if (/[a-z]/.test(c)) { let j = i; while (j < s.length && /[a-z]/.test(s[j])) j++;
        let w = s.slice(i, j);
        if (w.endsWith('log') && s[j] === '2') { w += '2'; j++; }
        // split glued names like "xsin", "2pix" into known pieces
        const parts = splitIdent(w); parts.forEach(p => t.push({ k: 'id', v: p })); i = j; continue; }
      if ('+-*/^()'.includes(c)) { t.push({ k: c }); i++; continue; }
      throw new Error('უცნობი სიმბოლო: ' + c);
    }
    return t;
  }
  function splitIdent(w) {
    const known = Object.keys(FUNCS).concat(Object.keys(CONSTS), ['x', 'y', 't', 'a', 'b', 'c', 'd', 'k', 'n'])
      .sort((a, b) => b.length - a.length);
    const out = []; let i = 0;
    while (i < w.length) {
      const hit = known.find(k => w.startsWith(k, i));
      if (!hit) { if (/\d/.test(w[i])) { // trailing digits like log2 handled above
          throw new Error('უცნობი სახელი: ' + w); }
        throw new Error('უცნობი სახელი: ' + w.slice(i)); }
      out.push(hit); i += hit.length;
    }
    return out;
  }
  function compile(src) {
    const toks = tokenize(normalizeExpr(src)); let p = 0;
    const peek = () => toks[p], next = () => toks[p++];
    const expect = k => { const t = next(); if (!t || t.k !== k) throw new Error('მოსალოდნელია „' + k + '“'); };
    function expr() { let n = term(); while (peek() && (peek().k === '+' || peek().k === '-')) { const o = next().k, r = term(), l = n; n = o === '+' ? v => l(v) + r(v) : v => l(v) - r(v); } return n; }
    function startsFactor(t) { return t && (t.k === 'n' || t.k === 'id' || t.k === '('); }
    function term() { let n = unary();
      for (;;) { const t = peek();
        if (t && (t.k === '*' || t.k === '/')) { next(); const r = unary(), l = n; n = t.k === '*' ? v => l(v) * r(v) : v => l(v) / r(v); }
        else if (startsFactor(t)) { const r = power(), l = n; n = v => l(v) * r(v); }
        else return n; } }
    function unary() { const t = peek(); if (t && t.k === '-') { next(); const u = unary(); return v => -u(v); } if (t && t.k === '+') { next(); return unary(); } return power(); }
    function power() { const b = atom(); if (peek() && peek().k === '^') { next(); const e = unary(); return v => Math.pow(b(v), e(v)); } return b; }
    function atom() {
      const t = next(); if (!t) throw new Error('გამოსახულება დაუსრულებელია');
      if (t.k === 'n') { const c = t.v; return () => c; }
      if (t.k === '(') { const e = expr(); expect(')'); return e; }
      if (t.k === 'id') {
        if (FUNCS[t.v]) { const f = FUNCS[t.v];
          let arg; if (peek() && peek().k === '(') { next(); arg = expr(); expect(')'); }
          else arg = power(); // sin x, sin 2x → sin(2)*x handled as sin(2)… keep simple: sin x
          // allow sin^2 x? not supported
          return v => f(arg(v)); }
        if (t.v in CONSTS) { const c = CONSTS[t.v]; return () => c; }
        const name = t.v; return v => (v && name in v ? v[name] : NaN);
      }
      throw new Error('მოულოდნელი „' + t.k + '“');
    }
    const fn = expr(); if (p < toks.length) throw new Error('ზედმეტი სიმბოლო: ' + (toks[p].k === 'id' ? toks[p].v : toks[p].k));
    return fn;
  }
  function evaluate(src, vars) { return compile(src)(vars || {}); }

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

  const api = { F, decimalExpansion, gcd, simplifySqrt, primeFactors, compile, evaluate, M, fmt, polyRoots, quadratic,
    solveTriangle, solveRight, piFraction, EXACT_TRIG, toDMS, D2R, R2D };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MathCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
