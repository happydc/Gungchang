// ---- 전통 목재형 ----
const TRAD_DEF = { L: 900, W: 250, T: 40, back: 110, foot: 20, joint: 'lap', a: 15, b: 10, ww: 150, pw: 60, pt: 45, barBot: 205, barD: 36, barOver: 30, head: 40, blockH: 188, blockBase: 120, blockTop: 24, blockW: 180, grooveW: 36, grooveD: 6, headShape: 'round', headR: 12, outline: 'rect', cornerR: 30, handle: 0, barShape: 'round' };
const TRAD_FIELDS = [
  ['지지판', [['L', '길이'], ['W', '폭'], ['T', '두께'], ['back', '걸이대 중심 → 판 끝'], ['foot', '걸이대 하단 연장(발)'], ['outline', '윤곽', '', { rect: '장방형', round: '모서리 굴림', end: '무릎 쪽 끝 둥글게' }], ['cornerR', '모서리 굴림 반지름', 'o:round']]],
  ['걸이대 (2개)', [['pw', '폭 (판 길이 방향)'], ['pt', '두께 (판 폭 방향)'], ['head', '걸이봉 위 머리 길이'], ['headShape', '머리 모양', '', { square: '직각', round: '모서리 굴림', half: '반원' }], ['headR', '머리 굴림 반지름', 'h:round'], ['a', '지지판 옆면 턱 깊이', 'lap'], ['b', '걸이대 턱 깊이', 'lap'], ['ww', '창 안쪽 폭', 'tenon,screw']]],
  ['걸이봉', [['barShape', '단면', '', { round: '둥근 봉', square: '각재' }], ['barBot', '아랫면 높이 (판 윗면에서)'], ['barD', '지름 (각재는 한 변)'], ['barOver', '걸이대 밖 돌출'], ['handle', '손잡이 연장 (한쪽)']]],
  ['받침 (이동식)', [['blockH', '높이'], ['blockBase', '밑변'], ['blockTop', '윗변'], ['blockW', '폭'], ['grooveW', '윗면 홈 폭'], ['grooveD', '윗면 홈 깊이']]],
];
const JOINTS = { lap: '지지판 옆면 턱끼움', tenon: '관통장부 + 쐐기', screw: '나사·목심 고정' };
function tradModel(p) {
  const m = { ...p }; m.hc = p.barBot + p.barD / 2; m.hTop = p.barBot + p.barD + p.head;
  if (p.joint === 'lap') { m.inner = p.W / 2 - p.a - p.b; m.ww = 2 * m.inner; } else m.inner = p.ww / 2;
  m.outer = m.inner + p.pt; m.below = p.joint === 'screw' ? 0 : p.T + p.foot; m.postLen = m.hTop + m.below;
  m.barBase = 2 * m.outer + 2 * p.barOver; m.barLen = m.barBase + p.handle; m.by0 = -m.barBase / 2; m.by1 = m.barBase / 2 + p.handle; m.hr = p.headShape === 'half' ? p.pw / 2 : p.headShape === 'round' ? Math.min(p.headR, p.pw / 2) : 0; m.sym = p.barShape === 'square' ? '□' : 'Ø'; m.bx = 100 - p.blockTop / 2; m.tw = p.pw - 20; m.tt = p.pt - 16; return m;
}
function headPts(x0, zb, w, zt, r) { return [[x0, zb], [x0 + w, zb]].concat(arcPts(x0 + w - r, zt - r, r, 0, 90), arcPts(x0 + r, zt - r, r, 90, 180)); }
function tradBoardPts(m) { const { L, W, back, pw, a } = m, x0 = -back, x1 = L - back, h = W / 2, lap = m.joint === 'lap';
  const rL = m.outline === 'round' ? Math.max(0, Math.min(m.cornerR, h, back - pw / 2 - 5)) : 0, rR = m.outline === 'end' ? h : m.outline === 'round' ? Math.min(m.cornerR, h) : 0;
  let p = arcPts(x0 + rL, -h + rL, rL, 180, 270);
  if (lap) p.push([-pw / 2, -h], [-pw / 2, -h + a], [pw / 2, -h + a], [pw / 2, -h]);
  p = p.concat(rR >= h ? arcPts(x1 - h, 0, h, 270, 450) : arcPts(x1 - rR, -h + rR, rR, 270, 360).concat(arcPts(x1 - rR, h - rR, rR, 0, 90)));
  if (lap) p.push([pw / 2, h], [pw / 2, h - a], [-pw / 2, h - a], [-pw / 2, h]);
  return p.concat(arcPts(x0 + rL, h - rL, rL, 90, 180)); }
function barSec(d, m, x, cls) { if (m.barShape === 'square') d.rect(x - m.barD / 2, m.barBot, m.barD, m.barD, cls); else d.circle(x, m.hc, m.barD / 2, cls); return d.cross(x, m.hc, m.barD * 0.8); }
function tradSide(m) { const d = new D(22), { L, T, back, foot, pw, hc, hTop, barD, barBot, blockH, blockBase, blockTop, bx } = m;
  d.rect(-back, -T, L, T);
  if (m.joint === 'lap') d.poly(headPts(-pw / 2, -m.below, pw, hTop, m.hr));
  else { d.poly(headPts(-pw / 2, 0, pw, hTop, m.hr)); if (m.joint === 'tenon') { d.rect(-m.tw / 2, -T, m.tw, T, 'h'); d.rect(-m.tw / 2, -m.below, m.tw, foot); } }
  barSec(d, m, 0, 'o w');
  d.poly([[bx, 0], [bx, blockH], [bx + blockTop, blockH], [bx + blockBase, 0]]);
  d.text(bx + blockBase / 2 + 10, blockH * 0.35, '받침', 'middle', 'n').text(L - back - 160, 14, '무릎 자리', 'middle', 'n').text(-pw / 2 - 12, hTop + 10, '걸이대', 'end', 'n').text(pw / 2 + 14, hc + barD / 2 + 8, '걸이봉', 'start', 'n');
  d.dimH(-back, L - back, -m.below, -46, 'L ' + L).dimH(-back, 0, -m.below, -20, back);
  d.dimV(-T, 0, L - back, 26, T); if (foot > 0 && m.joint !== 'screw') d.dimV(-m.below, -T, -back, -24, foot);
  d.dimV(0, barBot, -pw / 2, -30, barBot).dimV(0, hTop, -pw / 2, -64, hTop).dimV(0, blockH, bx + blockBase, 30, blockH);
  d.dimH(bx, bx + blockBase, 0, -20, blockBase).dimH(bx, bx + blockTop, blockH, 20, blockTop);
  d.dimH(80, 300, -m.below, -20, '받침 위치 80~300');
  d.text(0, hc - barD / 2 - 30, m.sym + barD, 'middle', 'dt');
  return d.svg(); }
function tradTop(m) { const d = new D(22), { L, W, back, pw, pt, inner, outer, barD, barLen, bx, blockBase, blockTop, blockW, grooveW } = m;
  d.poly(tradBoardPts(m));
  for (const s of [1, -1]) d.rect(-pw / 2, s > 0 ? inner : -outer, pw, pt, 'o p');
  d.rect(-barD / 2, m.by0, barD, barLen, 'o w'); if (m.handle > 0) d.line(-barD / 2, m.barBase / 2, barD / 2, m.barBase / 2, 'h').text(barD / 2 + 8, m.barBase / 2 + m.handle / 2 - 8, '손잡이', 'start', 'n');
  d.rect(bx, -blockW / 2, blockBase, blockW).line(bx + blockTop, -blockW / 2, bx + blockTop, blockW / 2, 'o').line(bx, -grooveW / 2, bx + blockTop, -grooveW / 2, 'o').line(bx, grooveW / 2, bx + blockTop, grooveW / 2, 'o');
  d.line(-back - 20, 0, L - back + 20, 0, 'c');
  d.dimV(-W / 2, W / 2, L - back, 30, 'W ' + W).dimV(-inner, inner, -back, -26, '창 ' + r0(2 * inner)).dimV(m.by0, m.by1, -back, -62, r0(barLen));
  d.dimV(-blockW / 2, blockW / 2, bx + blockBase, 26, blockW).dimH(-pw / 2, pw / 2, m.by1, 22, pw).dimH(-back, L - back, -Math.max(W, m.barBase) / 2, -30, L);
  return d.svg(); }
function tradFront(m) { const d = new D(15), { W, T, pt, inner, outer, barBot, barD, barLen, hTop, blockW, blockH, grooveW, grooveD } = m;
  d.rect(-W / 2, -T, W, T);
  d.poly([[-blockW / 2, 0], [-blockW / 2, blockH], [-grooveW / 2, blockH], [-grooveW / 2, blockH - grooveD], [grooveW / 2, blockH - grooveD], [grooveW / 2, blockH], [blockW / 2, blockH], [blockW / 2, 0]], 'h');
  for (const s of [1, -1]) d.rect(s > 0 ? inner : -outer, m.joint === 'tenon' ? 0 : -m.below, pt, m.joint === 'tenon' ? hTop : m.postLen, 'o p');
  if (m.joint === 'tenon') for (const s of [1, -1]) d.rect((s > 0 ? inner : -outer) + 8, -m.below, m.tt, m.below, 'h');
  d.rect(m.by0, barBot, barLen, barD, 'o w'); if (m.handle > 0) d.line(m.barBase / 2, barBot, m.barBase / 2, barBot + barD, 'h');
  d.dimH(-inner, inner, barBot, -22, '창 폭 ' + r0(2 * inner)).dimV(0, barBot, -outer, -22, '창 높이 ' + barBot).dimH(-W / 2, W / 2, -m.below, -22, W).dimH(-outer, outer, hTop, 18, r0(2 * outer)).dimH(m.by0, m.by1, hTop, 42, r0(barLen)).dimV(0, hTop, m.by1, 22, hTop);
  d.text(0, blockH * 0.3, '받침(점선)', 'middle', 'n');
  return d.svg(); }
function tradPost(m) { const d = new D(15), { pw, pt, T, foot, hc, barD, postLen, b } = m, z0 = -m.below, gx = pw + 110;
  d.poly(headPts(0, z0, pw, m.hTop, m.hr)); barSec(d, m, pw / 2, 'o p');
  if (m.joint === 'lap') { d.poly([[gx, z0], [gx + pt, z0], [gx + pt, m.hTop], [gx, m.hTop], [gx, 0], [gx + b, 0], [gx + b, -T], [gx, -T]]); d.dimH(gx, gx + b, -T, -16 - foot, b).dimV(-T, 0, gx, -22, T); }
  else if (m.joint === 'tenon') { d.rect(gx, 0, pt, m.hTop).rect(gx + 8, z0, m.tt, m.below); d.rect(pw / 2 - m.tw / 2, z0, m.tw, m.below, 'h'); d.dimH(gx + 8, gx + 8 + m.tt, z0, -18, m.tt).dimH(pw / 2 - m.tw / 2, pw / 2 + m.tw / 2, z0, -18, m.tw); if (foot >= 20) d.rect(gx + 8 - 6, z0 + foot / 2 - 5, m.tt + 12, 10, 'h'); }
  else d.rect(gx, 0, pt, m.hTop);
  d.line(gx, hc - barD / 2, gx + pt, hc - barD / 2, 'h').line(gx, hc + barD / 2, gx + pt, hc + barD / 2, 'h');
  d.dimV(z0, m.hTop, 0, -26, '전체 ' + r0(postLen)).dimV(z0, hc, pw, 26, r0(hc - z0)).dimH(0, pw, m.hTop, 16, pw).dimH(gx, gx + pt, m.hTop, 16, pt);
  d.text(pw / 2, z0 - 66, m.sym + barD + ' 관통' + (m.hr > 0 ? ' · 머리 R' + r0(m.hr) : ''), 'middle', 'dt').text(pw / 2, z0 - 40, '옆에서', 'middle', 'n').text(gx + pt / 2, z0 - 40, '앞에서', 'middle', 'n');
  return d.svg(); }
function tradBoard(m) { const d = new D(22), { L, W, back, pw, a } = m; d.poly(tradBoardPts(m));
  d.dimH(-back, L - back, -W / 2, -30, L).dimV(-W / 2, W / 2, L - back, 28, W).dimH(-back, -pw / 2, W / 2, 24, back - pw / 2);
  if (m.joint === 'lap') d.dimH(-pw / 2, pw / 2, W / 2, 24, pw).dimV(W / 2 - a, W / 2, pw / 2, 30, a);
  if (m.joint === 'tenon') for (const s of [1, -1]) { const y = (s > 0 ? m.inner : -m.outer) + 8; d.rect(-m.tw / 2, y, m.tw, m.tt, 'o p'); }
  if (m.joint === 'tenon') d.dimH(-m.tw / 2, m.tw / 2, W / 2, 24, m.tw).dimV(-m.inner, m.inner, -back, -26, r0(2 * m.inner));
  if (m.joint === 'screw') for (const s of [1, -1]) { const y = s * (m.inner + m.pt / 2); d.circle(-12, y, 2.5).circle(12, y, 2.5); }
  d.text(L / 2 - back + 60, 0, '받침이 움직이는 면은 평탄하게', 'middle', 'n').text(L / 2 - back + 60, -32, '두께 ' + m.T, 'middle', 'dt');
  return d.svg(); }
function tradBar(m) { const d = new D(13), { barLen, barD, inner, barBase, handle } = m; d.rect(0, 0, barLen, barD).line(-10, barD / 2, barLen + 10, barD / 2, 'c');
  const c = barBase / 2; d.line(c - inner, 0, c - inner, barD, 'h').line(c + inner, 0, c + inner, barD, 'h');
  d.dimH(0, barLen, 0, -20, r0(barLen)).dimH(c - inner, c + inner, barD, 16, '완충재 감는 구간 ' + r0(2 * inner)).text(barLen + 14, barD / 2 - 4, m.sym + barD, 'start', 'dt');
  if (handle > 0) d.line(barBase, 0, barBase, barD, 'h').dimH(barBase, barLen, barD, 16, '손잡이 ' + handle);
  return d.svg(); }
function tradBlock(m) { const d = new D(13), { blockH: H, blockBase: B, blockTop: Tp, blockW: Wd, grooveW: gw, grooveD: gd } = m, gx = B + 90;
  d.poly([[0, 0], [0, H], [Tp, H], [B, 0]]).line(0, H - gd, Tp + gd * (B - Tp) / H, H - gd, 'h');
  d.poly([[gx, 0], [gx, H], [gx + Wd / 2 - gw / 2, H], [gx + Wd / 2 - gw / 2, H - gd], [gx + Wd / 2 + gw / 2, H - gd], [gx + Wd / 2 + gw / 2, H], [gx + Wd, H], [gx + Wd, 0]]);
  d.dimV(0, H, 0, -22, H).dimH(0, B, 0, -18, B).dimH(0, Tp, H, 14, Tp).dimH(gx, gx + Wd, 0, -18, Wd).dimH(gx + Wd / 2 - gw / 2, gx + Wd / 2 + gw / 2, H, 14, gw).dimV(H - gd, H, gx + Wd, 20, gd);
  d.text(B / 2, -52, '옆에서 (수직면이 걸이대 쪽)', 'middle', 'n').text(gx + Wd / 2, -52, '앞에서', 'middle', 'n');
  return d.svg(); }
function tradChecks(m) { const c = [], room3 = m.barBot - 80, room2 = m.barBot - 50, diff = m.barBot - m.blockH, need = 30 + 12 + 20;
  c.push(['끈 묶는 자리 (3형 도지개)', `약 ${r0(room3)}`, room3 < 100 ? '100보다 좁습니다. 걸이봉 아랫면 높이를 185 이상으로 올리세요' : `2형 도지개에서는 약 ${r0(room2)}. 100 이상이면 손이 들어갑니다`, room3 < 70 ? 'warn' : room3 < 100 ? 'care' : 'good']);
  c.push(['받침과 걸이봉의 높이차', `${r0(diff)} 낮음`, diff < 5 ? '받침이 높아 활이 가파르게 섭니다. 걸이봉 아랫면보다 10~25 낮게 하세요' : diff > 35 ? '받침이 낮아 고자 쪽이 많이 내려갑니다' : '도지개가 수평에 가깝게 놓입니다', diff < 5 ? 'warn' : diff > 35 ? 'care' : 'good']);
  c.push(['창 안쪽 폭', r0(2 * m.inner), 2 * m.inner < need ? `도지개 채운 활채가 지나가려면 ${need} 이상이 필요합니다` : `도지개 폭 30 + 끈 + 여유 = ${need} 이상`, 2 * m.inner < need ? 'warn' : 'good']);
  c.push(['지지판 두께', m.T, m.T < 40 ? '40 이상을 권합니다' : '기준 40 이상', m.T < 40 ? 'care' : 'good']);
  if (m.joint === 'lap') { const rem = m.pt - m.b; c.push(['걸이대 턱 뒤에 남는 두께', r0(rem), rem < 25 ? '걸이대가 약해집니다. 걸이대를 두껍게 하거나 턱을 얕게 하세요' : '걸이대 두께 − 걸이대 턱 깊이', rem < 25 ? 'warn' : 'good']); }
  else { const edge = m.W / 2 - m.outer; c.push(['걸이대 바깥 ~ 판 옆면', r0(edge), edge < 15 ? '판 가장자리가 얇아 터질 수 있습니다. 창 폭을 줄이거나 판을 넓히세요' : '15 이상', edge < 15 ? 'warn' : 'good']); }
  if (m.hr > m.head + m.barD * 0.25) c.push(['걸이대 머리 굴림', 'R' + r0(m.hr), '굴림이 걸이봉 구멍까지 내려옵니다. 머리 길이를 늘리거나 반지름을 줄이세요', 'care']);
  if (m.blockW > m.W) c.push(['받침 폭', m.blockW, '지지판 폭보다 넓습니다', 'care']);
  return c; }
function tradCut(m) { const rows = [['지지판', 1, `${m.L} × ${m.W} × ${m.T}`, (m.outline === 'round' ? `모서리 R${m.cornerR}, ` : m.outline === 'end' ? '무릎 쪽 끝 반원, ' : '') + (m.joint === 'lap' ? `옆면 양쪽에 턱 ${m.pw} × ${m.a}` : m.joint === 'tenon' ? `장부 구멍 ${m.tw} × ${m.tt} 2곳` : '밑에서 나사 4개')],
  ['걸이대', 2, `${r0(m.postLen)} × ${m.pw} × ${m.pt}`, `${m.sym}${m.barD} 관통 구멍` + (m.hr > 0 ? `, 머리 R${r0(m.hr)}` : '') + (m.joint === 'lap' ? `, 턱 ${m.T} × ${m.b}` : m.joint === 'tenon' ? `, 장부 ${m.tw} × ${m.tt} × ${r0(m.below)}` : '')],
  ['걸이봉', 1, `${m.sym}${m.barD} × ${r0(m.barLen)}`, (m.barShape === 'square' ? '각재' : '둥근 봉') + '. 가운데에 헝겊이나 가죽을 감음' + (m.handle > 0 ? `. 한쪽 ${m.handle}은 손잡이(끈 감기)` : '')],
  ['받침', 1, `${m.blockBase} × ${m.blockW} × ${m.blockH}`, `직각사다리꼴(윗변 ${m.blockTop}), 윗면 홈 ${m.grooveW} × ${m.grooveD}. 고정하지 않음`]];
  if (m.joint === 'tenon' && m.foot >= 20) rows.push(['쐐기', 2, `${m.tt + 30} × 10 × 10 안팎`, '장부 밑에 끼움']);
  rows.push(['걸이봉 빠짐 방지', 2, '산지못 Ø8 또는 쐐기', '걸이대 바깥쪽에서 걸이봉에 꽂음']);
  return rows; }
function tradCards(p) { const m = tradModel(p), j = JOINTS[p.joint];
  return { checks: tradChecks(m), cards: [
    ['조립도: 측면', '걸이봉에 끈을 걸고, 받침을 옮겨 가며 고자 쪽을 누릅니다', tradSide(m)],
    ['조립도: 평면', '위에서 본 모습', tradTop(m)],
    ['조립도: 정면', '고자 쪽에서 걸이대를 바라본 모습', tradFront(m)],
    ['부재도: 지지판', '위에서 본 모습 · ' + j, tradBoard(m)],
    ['부재도: 걸이대 (2개)', j, tradPost(m)],
    ['부재도: 걸이봉', '', tradBar(m)],
    ['부재도: 받침', '이동식', tradBlock(m)]], cut: tradCut(m) }; }
