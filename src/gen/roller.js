// ---- 개량 롤러형 ----
const ROLL_DEF = { L: 500, W: 250, T: 40, back: 90, hH: 230, hL: 170, dxMin: 40, dxMax: 145, rD: 50, flD: 60, rL: 95, waist: 40, boltD: 8, pt: 4.5, flL: 175, flW: 50, stemW: 75, boss: 26 };
const ROLL_FIELDS = [
  ['바닥틀', [['L', '길이'], ['W', '폭'], ['T', '두께'], ['back', '높은 롤러 축 → 판 끝']]],
  ['롤러 축 위치 (판 윗면 기준)', [['hH', '높은 롤러 축 높이 (걸이봉 역할)'], ['hL', '낮은 롤러 축 높이 (받침 역할)'], ['dxMax', '두 축 수평 거리 (가장 벌렸을 때)'], ['dxMin', '두 축 수평 거리 (가장 좁혔을 때)']]],
  ['롤러 (반쪽 4개)', [['rD', '몸통 지름'], ['flD', '끝 턱 지름'], ['waist', '잘록한 곳 지름'], ['rL', '반쪽 길이'], ['boltD', '축 볼트 지름']]],
  ['본대 (철판)', [['pt', '철판 두께'], ['stemW', '목 폭'], ['boss', '축 둘레 반지름'], ['flL', '플랜지 길이'], ['flW', '플랜지 폭']]],
];
function rollModel(p) { const m = { ...p }; m.c = 30; m.bh = 60; m.hn = Math.max(60, p.hL - 75); m.slotR = p.boltD / 2 + 0.5; m.barBot = p.hH - p.rD / 2; m.supTop = p.hL + p.rD / 2; m.total = 2 * p.rL + p.pt; return m; }
function platePts(m) { const { c, bh, hn, stemW, dxMax, dxMin, hL, hH, boss, pt } = m;
  return [[c - bh, pt], [c + bh, pt], [c + stemW / 2, hn]].concat(arcPts(dxMax, hL, boss, -90, 90), [[dxMin, hL + boss]], arcPts(0, hH, boss, 0, 180), [[c - stemW / 2, hn]]); }
function slotPts(m) { const { dxMin, dxMax, hL, slotR: q } = m; return arcPts(dxMax, hL, q, -90, 90).concat(arcPts(dxMin, hL, q, 90, 270)); }
function rollSide(m) { const d = new D(15), { L, T, back, hH, hL, dxMax, dxMin, rD, flD, c, flL, pt } = m;
  d.rect(-back, -T, L, T).rect(c - flL / 2, 0, flL, pt, 'o s').poly(platePts(m), 'o s').poly(slotPts(m), 'o p');
  d.circle(0, hH, m.slotR, 'o p');
  for (const [x, y] of [[0, hH], [dxMax, hL]]) d.circle(x, y, rD / 2, 'o').circle(x, y, flD / 2, 'c').cross(x, y, flD * 0.7);
  d.dimH(-back, L - back, -T, -36, 'L ' + L).dimH(-back, 0, -T, -14, back).dimV(-T, 0, L - back, 22, T);
  d.dimV(0, hH, -m.boss, -34, hH).dimV(0, hL, dxMax + flD / 2, 24, hL).dimH(0, dxMax, hH + flD / 2, 22, dxMax).dimH(dxMin, dxMax, hL - m.boss, -16, '장공 ' + r0(dxMax - dxMin));
  d.text(-flD / 2 - 8, hH + flD / 2 + 4, '높은 롤러 (끈이 걸림)', 'end', 'n').text(dxMax + flD / 2 + 6, hL - flD / 2 - 14, '낮은 롤러 (도지개 받침)', 'start', 'n').text(L - back - 110, 10, '무릎 자리', 'middle', 'n');
  return d.svg(); }
function rollTop(m) { const d = new D(15), { L, W, back, dxMax, rD, rL, pt, c, flL, flW, boss, total } = m;
  d.rect(-back, -W / 2, L, W).rect(c - flL / 2, -flW / 2, flL, flW, 'o s').rect(-boss, -pt / 2, dxMax + 2 * boss, pt, 'o s');
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) d.circle(c + sx * 72.5, sy * 15, 3.5);
  for (const x of [0, dxMax]) { d.rect(x - rD / 2, pt / 2, rD, rL, 'o p').rect(x - rD / 2, -pt / 2 - rL, rD, rL, 'o p').line(x, -total / 2 - 12, x, total / 2 + 12, 'c'); }
  d.dimV(-W / 2, W / 2, L - back, 24, 'W ' + W).dimV(-total / 2, total / 2, -back, -22, r0(total)).dimH(0, dxMax, total / 2, 26, dxMax).dimH(-back, L - back, -W / 2, -22, L);
  return d.svg(); }
function rollFront(m) { const d = new D(12), { W, T, hH, hL, rD, rL, pt, flW, boss, total } = m;
  d.rect(-W / 2, -T, W, T).rect(-flW / 2, 0, flW, pt, 'o s').rect(-pt / 2, pt, pt, hH + boss - pt, 'o s');
  for (const h of [hH, hL]) { d.rect(pt / 2, h - rD / 2, rL, rD, 'o p').rect(-pt / 2 - rL, h - rD / 2, rL, rD, 'o p').line(-total / 2 - 14, h, total / 2 + 14, h, 'c'); }
  d.dimH(-total / 2, total / 2, hH + rD / 2, 26, r0(total)).dimV(0, hH, total / 2, 40, hH).dimV(0, hL, total / 2, 18, hL).dimH(-W / 2, W / 2, -T, -18, W).dimV(hL + rD / 2, hH - rD / 2, -total / 2, -18, r0(hH - hL - rD));
  return d.svg(); }
function rollPlate(m) { const d = new D(12), { hH, hL, dxMin, dxMax, boss, stemW, c, bh, hn, pt, flL, flW } = m;
  d.poly(platePts(m), 'o s').poly(slotPts(m), 'o p').circle(0, hH, m.slotR).cross(0, hH, 14).cross(dxMax, hL, 14).cross(dxMin, hL, 14);
  d.line(c - bh - 20, 0, c + bh + 20, 0, 'c');
  d.dimV(0, hH, -boss, -22, hH).dimV(0, hL, dxMax + boss, 18, hL).dimH(0, dxMin, hH + boss, 14, dxMin).dimH(0, dxMax, hH + boss, 36, dxMax).dimH(c - bh, c + bh, pt, -16, 2 * bh).dimH(c - stemW / 2, c + stemW / 2, hn, -4, stemW);
  d.text(dxMax + boss + 8, hL + boss, 'R' + boss, 'start', 'dt').text(c, hn * 0.45, 't ' + m.pt, 'middle', 'dt').text(0, hH - 22, 'Ø' + r0(2 * m.slotR), 'middle', 'dt');
  const gx = dxMax + boss + 110, gy = 40; d.rect(gx, gy, flL, flW, 'o s').line(gx - 8, gy + flW / 2, gx + flL + 8, gy + flW / 2, 'c');
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) d.circle(gx + flL / 2 + sx * 72.5, gy + flW / 2 + sy * 15, 3.5);
  d.dimH(gx, gx + flL, gy, -16, flL).dimV(gy, gy + flW, gx + flL, 16, flW).dimH(gx + flL / 2 - 72.5, gx + flL / 2 + 72.5, gy + flW, 14, 145).text(gx + flL / 2, gy + flW + 44, '플랜지 (본대 밑에 용접), 구멍 Ø7 × 4', 'middle', 'n');
  return d.svg(); }
function rollRoller(m) { const d = new D(7), { rL, rD, flD, waist, boltD } = m, f = 8, up = [[0, flD / 2], [f, flD / 2], [f, rD / 2], [rL * 0.3, rD / 2], [rL * 0.45, waist / 2], [rL * 0.7, waist / 2], [rL * 0.85, rD / 2], [rL, rD / 2]];
  d.poly(up.concat(up.map(p => [p[0], -p[1]]).reverse()), 'o p').line(-6, 0, rL + 6, 0, 'c');
  const hr = (boltD + 0.5) / 2; d.line(0, hr, rL, hr, 'h').line(0, -hr, rL, -hr, 'h');
  d.dimH(0, rL, -flD / 2, -10, rL).dimV(-flD / 2, flD / 2, 0, -10, 'Ø' + flD).dimV(-rD / 2, rD / 2, rL, 10, 'Ø' + rD).dimH(rL * 0.45, rL * 0.7, flD / 2, 8, 'Ø' + waist + ' 잘록').text(rL / 2, -flD / 2 - 24, `구멍 Ø${r0(2 * hr)} 관통 · 안쪽 끝(오른쪽)이 본대에 닿음`, 'middle', 'n');
  return d.svg(); }
function rollBoard(m) { const d = new D(15), { L, W, back, c } = m; d.rect(-back, -W / 2, L, W).line(-back - 14, 0, L - back + 14, 0, 'c');
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) d.circle(c + sx * 72.5, sy * 15, 3.5);
  d.dimH(-back, L - back, -W / 2, -22, L).dimV(-W / 2, W / 2, L - back, 22, W).dimH(-back, c - 72.5, W / 2, 16, r0(back + c - 72.5)).dimH(c - 72.5, c + 72.5, W / 2, 16, 145).dimV(-15, 15, c + 72.5, 22, 30);
  d.text(L / 2 - back + 80, -40, '두께 ' + m.T + ' · 구멍 Ø7 × 4', 'middle', 'dt');
  return d.svg(); }
function rollChecks(m) { const c = [], room3 = m.barBot - 80, gap = m.barBot - m.supTop, cd = Math.hypot(m.dxMin, m.hH - m.hL);
  c.push(['끈 묶는 자리 (3형 도지개)', `약 ${r0(room3)}`, room3 < 100 ? '100보다 좁습니다. 두 롤러 축을 함께 올리세요' : `2형 도지개에서는 약 ${r0(m.barBot - 50)}. 100 이상이면 손이 들어갑니다`, room3 < 70 ? 'warn' : room3 < 100 ? 'care' : 'good']);
  c.push(['높은 롤러 밑 − 낮은 롤러 위', r0(gap), gap < 0 ? '낮은 롤러가 높아 활이 가파르게 섭니다' : gap > 30 ? '낮은 롤러가 낮아 고자 쪽이 많이 내려갑니다' : '0~25면 도지개가 수평에 가깝게 놓입니다', gap < 0 ? 'warn' : gap > 30 ? 'care' : 'good']);
  c.push(['두 축 수평 거리', `${m.dxMin} ~ ${m.dxMax}`, m.dxMax < 90 ? '낮은 롤러가 도지개 끝에 걸릴 수 있습니다. 100 이상을 권합니다' : '100~180 범위를 권합니다', m.dxMax < 90 ? 'care' : 'good']);
  c.push(['가장 좁혔을 때 롤러 사이', r0(cd - m.flD), cd < m.flD + 2 ? '롤러끼리 닿습니다. 좁혔을 때 거리나 높이차를 키우세요' : '두 롤러 턱 사이의 틈', cd < m.flD + 2 ? 'warn' : 'good']);
  c.push(['바닥틀 두께', m.T, m.T < 40 ? '40 이상을 권합니다' : '기준 40 이상', m.T < 40 ? 'care' : 'good']);
  return c; }
function rollCut(m) { const bl = Math.ceil((m.total + 25) / 10) * 10; return [
  ['바닥틀', 1, `${m.L} × ${m.W} × ${m.T}`, '목재. 본대 고정 구멍 Ø7 × 4'],
  ['본대', 1, `철판 t${m.pt}, 외곽 약 ${r0(m.dxMax + 2 * m.boss)} × ${r0(m.hH + m.boss)}`, `축 구멍 Ø${r0(2 * m.slotR)} 1곳, 장공 ${r0(m.dxMax - m.dxMin)} 1곳`],
  ['플랜지', 1, `${m.flL} × ${m.flW} × t${m.pt}`, '본대 밑에 직각으로 용접. 구멍 Ø7 × 4'],
  ['롤러 반쪽', 4, `Ø${m.flD} × ${m.rL}`, `몸통 Ø${m.rD}, 잘록한 곳 Ø${m.waist}. 엔지니어링 플라스틱 봉 선반 가공`],
  ['축 볼트', 2, `M${m.boltD} × ${bl}`, '캡너트와 와셔 각 2개. 낮은 쪽은 장공에서 위치 조절'],
  ['고정 볼트', 4, `M6 × ${Math.ceil((m.T + m.pt + 15) / 5) * 5}`, '각목 볼트를 밑에서 위로, 너트와 와셔 각 4개']]; }
function rollCards(p) { const m = rollModel(p);
  return { checks: rollChecks(m), cards: [
    ['조립도: 측면', '높은 롤러에 끈을 걸고, 낮은 롤러에 도지개를 얹습니다', rollSide(m)],
    ['조립도: 평면', '위에서 본 모습', rollTop(m)],
    ['조립도: 정면', '고자 쪽에서 본대를 바라본 모습', rollFront(m)],
    ['부재도: 본대와 플랜지', '철판 · 외곽 형상은 예시이고, 축 위치와 장공이 핵심 치수입니다', rollPlate(m)],
    ['부재도: 롤러 반쪽 (4개)', '본대 양옆에 하나씩', rollRoller(m)],
    ['부재도: 바닥틀', '위에서 본 모습', rollBoard(m)]], cut: rollCut(m) }; }
