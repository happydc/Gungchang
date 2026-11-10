// ---- 시뮬레이션 코어 (작업 좌표: 작업하는 활채가 +x, 위가 +y, 단위 mm) ----
const LH = 620, DS = 1, LEATHER = 2, GRIP = 40, TIE = 15, CORD = 5;
function sstep(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
// 부린활의 말림 곡률(위로 말리는 방향 +). a = 줌통 중심에서의 거리
let KINK = 24 * Math.PI / 180, K1 = 0.003;
function kRest(a, curl) {
  const k1 = K1 * curl, k2 = 0.013;
  if (a < GRIP - 20) return 0;
  if (a < GRIP) return KINK / 20;
  if (a < 440) return k1 * sstep(GRIP, GRIP + 65, a) * (1 + 0.45 * Math.exp(-(((a - 300) / 90) ** 2)));
  if (a < 500) return k1 + (k2 - k1) * sstep(440, 500, a);
  if (a < 548) return k2;
  if (a < 566) return k2 * (1 - sstep(548, 566, a));
  return 0;
}
function thick(a) { return a < GRIP - 8 ? 27 : a < GRIP + 60 ? 27 - 13 * sstep(GRIP - 8, GRIP + 60, a) : 14 - 3 * sstep(GRIP + 60, 560, a); }
function interp(arr, step, x) { const f = Math.max(0, Math.min(arr.length - 1.0001, x / step)); const i = Math.floor(f); return arr[i] + (arr[i + 1] - arr[i]) * (f - i); }

function dojiShape(grade, flip) {
  const d = DOJI[grade]; let top = d.top.slice(), bot = d.bot.slice();
  if (flip) { top.reverse(); bot.reverse(); }
  const n = top.length, xs = top.map((_, i) => i * 5);
  // 활 중심선 목표 = 접촉면 + 가죽 + 활 두께/2
  const off = LEATHER + 6.5, cx = [], cy = [];
  for (let i = 0; i < n; i++) {
    const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
    const tx = xs[i1] - xs[i0], ty = top[i1] - top[i0], l = Math.hypot(tx, ty);
    cx.push(xs[i] - ty / l * off); cy.push(top[i] + tx / l * off);
  }
  const sig = [0], th = [];
  for (let i = 1; i < n; i++) sig.push(sig[i - 1] + Math.hypot(cx[i] - cx[i - 1], cy[i] - cy[i - 1]));
  for (let i = 0; i < n - 1; i++) th.push(Math.atan2(cy[i + 1] - cy[i], cx[i + 1] - cx[i]));
  // 곡률을 호 길이 2mm 간격으로 (이동평균으로 다듬음)
  const smax = sig[n - 1], kd = [], m = Math.floor(smax / 2);
  const thAt = s => { let j = 0; while (j < n - 2 && (sig[j] + sig[j + 1]) / 2 < s) j++; if (j === 0) return th[0]; const a = (sig[j - 1] + sig[j]) / 2, b = (sig[j] + sig[j + 1]) / 2; return th[j - 1] + (th[j] - th[j - 1]) * Math.min(1, Math.max(0, (s - a) / (b - a))); };
  for (let i = 0; i <= m; i++) { const s = i * 2; kd.push((thAt(Math.min(smax, s + 14)) - thAt(Math.max(0, s - 14))) / (Math.min(smax, s + 14) - Math.max(0, s - 14))); }
  const poly = []; for (let i = 0; i < n; i++) poly.push([xs[i], top[i]]); for (let i = n - 1; i >= 0; i--) poly.push([xs[i], bot[i]]);
  return { xs, top, bot, poly, p0: [cx[0], cy[0]], th0: th[0], smax, kd };
}

function solve(P) {
  const dj = dojiShape(P.grade, P.flip);
  const n = Math.round(2 * LH / DS), i0 = Math.round((LH + P.sTie) / DS);
  const S = [], X = new Array(n + 1), Y = new Array(n + 1), T = new Array(n + 1);
  for (let i = 0; i <= n; i++) S.push(-LH + i * DS);
  const kap = (s, t) => { const a = Math.abs(s), sg = a - (s > 0 ? P.sTie : P.sTieB);
    if (sg > 0 && sg < dj.smax) { const kdv = interp(dj.kd, 2, sg); if (s > 0) return (1 - t) * kRest(a, P.curl) + t * kdv; if (P.other) return kdv; }
    return kRest(a, P.curl); };
  X[i0] = dj.p0[0]; Y[i0] = dj.p0[1]; T[i0] = dj.th0;
  for (let i = i0; i < n; i++) { const k = kap(S[i] + DS / 2, P.t), tm = T[i] + k * DS / 2; X[i + 1] = X[i] + DS * Math.cos(tm); Y[i + 1] = Y[i] + DS * Math.sin(tm); T[i + 1] = T[i] + k * DS; }
  for (let i = i0; i > 0; i--) { const k = kap(S[i] - DS / 2, P.t), tm = T[i] - k * DS / 2; X[i - 1] = X[i] - DS * Math.cos(tm); Y[i - 1] = Y[i] - DS * Math.sin(tm); T[i - 1] = T[i] - k * DS; }
  // 반대쪽 도지개의 위치
  let polyB = null;
  if (P.other) { const ib = Math.round((LH - P.sTieB) / DS), R = T[ib] + dj.th0, c = Math.cos(R), s = Math.sin(R);
    const q = [-dj.p0[0], dj.p0[1]], tx = X[ib] - (c * q[0] - s * q[1]), ty = Y[ib] - (s * q[0] + c * q[1]);
    polyB = dj.poly.map(p => [c * -p[0] - s * p[1] + tx, s * -p[0] + c * p[1] + ty]); }
  // 걸이봉 접촉점(활 등 쪽 윗면) → 걸이봉 중심
  const ibar = Math.max(0, Math.min(n, Math.round((LH + P.sBar) / DS)));
  const hb = thick(Math.abs(S[ibar])) / 2 + (P.cord || 0) + P.rBar;
  const piv = [X[ibar] - Math.sin(T[ibar]) * hb, Y[ibar] + Math.cos(T[ibar]) * hb];
  const Cb = [0, P.hBar], Cs = [P.dx, P.hSup - P.rSup];
  const under = []; // 받침에 닿을 수 있는 아랫면
  for (let i = 0; i < dj.xs.length; i++) under.push([dj.xs[i], dj.bot[i]]);
  const belly = []; for (let i = 0; i <= n; i++) { const h = thick(Math.abs(S[i])) / 2; belly.push([X[i] + Math.sin(T[i]) * h, Y[i] - Math.cos(T[i]) * h]); }
  const pre = belly.filter((_, i) => S[i] > -200 && S[i] <= P.sTie);
  const tf = (p, ph) => { const c = Math.cos(ph), s = Math.sin(ph), dx = p[0] - piv[0], dy = p[1] - piv[1]; return [c * dx - s * dy + Cb[0], s * dx + c * dy + Cb[1]]; };
  const segD = (a, b, q) => { const vx = b[0] - a[0], vy = b[1] - a[1], l = vx * vx + vy * vy; let u = l ? ((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / l : 0; u = Math.max(0, Math.min(1, u)); return Math.hypot(a[0] + u * vx - q[0], a[1] + u * vy - q[1]); };
  const minD = ph => { let m = 1e9; for (const L of [pre, under]) { let a = tf(L[0], ph); for (let i = 1; i < L.length; i++) { const b = tf(L[i], ph); m = Math.min(m, segD(a, b, Cs)); a = b; } } return m; };
  let ph = null; const st = Math.PI / 360;
  for (let a = 1.45; a > -1.45; a -= st) { if (minD(a) <= P.rSup) { let lo = a, hi = a + st; for (let k = 0; k < 20; k++) { const mid = (lo + hi) / 2; if (minD(mid) <= P.rSup) lo = mid; else hi = mid; } ph = hi; break; } }
  const ok = ph !== null; if (!ok) ph = 0;
  const bow = []; for (let i = 0; i <= n; i++) { const h = thick(Math.abs(S[i])) / 2, nx = -Math.sin(T[i]), ny = Math.cos(T[i]); bow.push({ s: S[i], c: tf([X[i], Y[i]], ph), up: tf([X[i] + nx * h, Y[i] + ny * h], ph), dn: tf([X[i] - nx * h, Y[i] - ny * h], ph) }); }
  const polyA = dj.poly.map(p => tf(p, ph)), pB = polyB ? polyB.map(p => tf(p, ph)) : null;
  // 받침 접촉점
  let cp = null, cm = 1e9; for (const p of under.concat(pre)) { const q = tf(p, ph), d = Math.hypot(q[0] - Cs[0], q[1] - Cs[1]); if (d < cm) { cm = d; cp = q; } }
  // 간섭 검사: 지지판(y=0) / 바닥
  const ground = x => (x >= -P.back && x <= P.len - P.back) ? 0 : -P.drop;
  const clr = pts => { let m = { v: 1e9, p: null }; for (const p of pts) { const v = p[1] - ground(p[0]); if (v < m.v) m = { v, p }; } return m; };
  const A = bow.filter(b => b.s > P.sBar).map(b => b.dn).concat(polyA), B = bow.filter(b => b.s <= P.sBar).map(b => b.dn).concat(pB || []);
  // 눌러야 할 틈(도지개 고자 쪽 끝에서 활 배 쪽 면까지)
  const iend = Math.min(n, i0 + Math.round(dj.smax / DS)), endTop = tf([dj.xs[dj.xs.length - 1], dj.top[dj.top.length - 1]], ph);
  const gap = Math.max(0, Math.hypot(bow[iend].dn[0] - endTop[0], bow[iend].dn[1] - endTop[1]) - LEATHER);
  const ihand = Math.min(n, iend + Math.round(40 / DS));
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const b of bow) { x0 = Math.min(x0, b.c[0]); x1 = Math.max(x1, b.c[0]); y0 = Math.min(y0, b.c[1]); y1 = Math.max(y1, b.c[1]); }
  return { ok, tilt: ph * 180 / Math.PI + Math.atan2(dj.top[dj.top.length - 1] - dj.top[0], 360) * 180 / Math.PI, bow, polyA, polyB: pB, Cb, Cs, cp, clrA: clr(A), clrB: clr(B), gap, hand: bow[ihand].up, tieIn: bow[Math.min(n, i0 + Math.round(TIE / DS))], tieOut: bow[Math.max(0, iend - Math.round(TIE / DS))], tiesB: P.other ? [bow[Math.round((LH - P.sTieB) / DS)], bow[Math.max(0, Math.round((LH - P.sTieB - dj.smax) / DS))]] : null, ibar,
    tipA: bow[n].c, tipB: bow[0].c, stack: Math.max(...DOJI[P.grade].top.map((v, i) => v - DOJI[P.grade].bot[i])) + LEATHER + 14, box: [x1 - x0, y1 - y0] };
}
// 자유 상태 부린활의 크기
function freeSize(curl) { let x = 0, y = 0, t = 0, mx = 0, my = 0; for (let a = 0; a < LH; a += 2) { const k = kRest(a + 1, curl); x += 2 * Math.cos(t + k); y += 2 * Math.sin(t + k); t += 2 * k; mx = Math.max(mx, x); my = Math.max(my, y); } return { w: 2 * mx, h: my + 14, tips: 2 * x }; }
