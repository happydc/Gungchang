// ---- 화면 ----
const $ = id => document.getElementById(id);
const PRE = { roller: { hBar: 230, rBar: 25, hSup: 195, rSup: 25, dx: 145, len: 500, back: 90, bt: 40, foot: 0 }, trad: { hBar: 223, rBar: 18, hSup: 188, rSup: 12, dx: 100, len: 900, back: 110, bt: 40, foot: 20 } };
let kind = 'roller';
const NUM = ['curl', 'kink', 'gLow', 'gUp', 'hBar', 'rBar', 'hSup', 'rSup', 'dx', 'sBar', 'len', 'back', 'bt', 'foot', 't'];
function setPreset(k) { kind = k; for (const [a, v] of Object.entries(PRE[k])) $(a).value = v; $('p_roller').className = k === 'roller' ? '' : 'ghost'; $('p_trad').className = k === 'trad' ? '' : 'ghost'; $('dx_l').textContent = k === 'trad' ? '받침 위치 (걸이봉에서, 옮겨 가며 사용)' : '걸이봉 ↔ 받침 수평 거리'; render(); }
function params() { const st2 = $('stage').value === '2'; const P = { grade: $('grade').value, flip: false, other: st2, st2 }; for (const a of NUM) P[a] = parseFloat($(a).value); const low = !st2; P.sTie = GRIP + (low ? P.gLow : P.gUp); P.sTieB = GRIP + (low ? P.gUp : P.gLow); KINK = P.kink * Math.PI / 180; P.sOff = P.sBar; P.sBar = P.sTie + TIE + P.sOff; P.cord = CORD; P.drop = P.bt + P.foot; return P; }
const cv = $('cv'), g = cv.getContext('2d');
const VX0 = -650, VX1 = 750, VY0 = -260, VY1 = 700;
function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function render() {
  const P = params(), R = solve(P), F = freeSize(P.curl);
  for (const a of NUM) if ($(a + '_o')) $(a + '_o').textContent = a === 'curl' ? P.curl.toFixed(2) : a === 'kink' ? P.kink + '°' : a === 't' ? Math.round(P.t * 100) + '%' : (a === 'sBar' ? (P.sOff > 0 ? '고자 쪽 ' : P.sOff < 0 ? '줌통 쪽 ' : '') + Math.abs(P.sOff) : P[a]) + (a === 'curl' ? '' : ' mm');
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 1400; cv.width = w * dpr; cv.height = w * 960 / 1400 * dpr;
  const k = cv.width / (VX1 - VX0), px = x => (VX1 - x) * k, py = y => (VY1 - y) * k, C = { ink: css('--ink'), mute: css('--mute'), line: css('--line'), wood: css('--wood'), we: css('--wood-edge'), bow: css('--bow'), grip: css('--grip'), steel: css('--steel'), board: css('--board'), warn: css('--warn'), acc: css('--accent'), panel: css('--panel'), paper: css('--paper') };
  g.fillStyle = C.paper; g.fillRect(0, 0, cv.width, cv.height); g.lineJoin = 'round'; g.lineCap = 'round';
  const poly = (pts, fill, stroke, lw) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(px(p[0]), py(p[1])) : g.moveTo(px(p[0]), py(p[1]))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = (lw || 1.5) * dpr; g.stroke(); } };
  const circ = (c, r, fill, stroke) => { g.beginPath(); g.arc(px(c[0]), py(c[1]), r * k, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5 * dpr; g.stroke(); } };
  const text = (s, x, y, col, al) => { g.font = `${13 * dpr}px ${css('--display')}`; g.fillStyle = col || C.mute; g.textAlign = al || 'center'; g.fillText(s, px(x), py(y)); };
  // 바닥, 지지판
  const bx0 = -P.back, bx1 = P.len - P.back;
  g.strokeStyle = C.line; g.lineWidth = 2 * dpr; g.beginPath(); g.moveTo(0, py(-P.drop)); g.lineTo(cv.width, py(-P.drop)); g.stroke();
  text('바닥', VX0 + 30, -P.drop - 22, C.mute, 'right');
  const bt = P.bt;
  poly([[bx0, 0], [bx1, 0], [bx1, -bt], [bx0, -bt]], C.board, C.we);
  if (P.drop > bt) { poly([[bx0, -bt], [bx0 + 40, -bt], [bx0 + 40, -P.drop], [bx0, -P.drop]], C.board, C.we); poly([[bx1 - 40, -bt], [bx1, -bt], [bx1, -P.drop], [bx1 - 40, -P.drop]], C.board, C.we); }
  text('지지판 ' + P.len, (bx0 + bx1) / 2, -P.drop - 22);
  const kneeX = Math.min(bx1 - 20, P.dx + 260); if (kneeX > P.dx + 60) text('무릎 자리', (kneeX + bx1) / 2 > bx1 - 40 ? bx1 - 60 : (kneeX + bx1) / 2, 10, C.mute);
  // 걸이대 / 받침
  if (kind === 'trad') {
    poly([[-22, -P.drop], [22, -P.drop], [22, P.hBar + P.rBar + 45], [-22, P.hBar + P.rBar + 45]], null, C.we, 1.5);
    const h = P.hSup - P.rSup, x = P.dx; poly([[x - P.rSup, 0], [x - P.rSup, h], [x + P.rSup * 0.6, h + P.rSup * 0.6], [x + P.rSup + 60, 0]], C.wood, C.we);
    circ(R.Cs, P.rSup, C.wood, C.we); circ(R.Cb, P.rBar, C.wood, C.we);
  } else {
    poly([[-18, 0], [18, 0], [10, P.hBar], [P.dx, P.hSup - P.rSup], [P.dx - 14, P.hSup - P.rSup - 16], [-10, P.hBar - 40]], C.steel, C.ink, 1);
    circ(R.Cs, P.rSup, C.panel, C.ink); circ(R.Cb, P.rBar, C.panel, C.ink); circ(R.Cs, 4, C.ink); circ(R.Cb, 4, C.ink);
  }
  // 도지개, 활
  if (R.polyB) poly(R.polyB, C.wood, C.we);
  poly(R.polyA, C.wood, C.we);
  const up = R.bow.map(b => b.up), dn = R.bow.map(b => b.dn).reverse(); poly(up.concat(dn), C.bow, C.bow, 1);
  const gp = R.bow.filter(b => Math.abs(b.s) <= GRIP); poly(gp.map(b => b.up).concat(gp.map(b => b.dn).reverse()), C.grip, C.bow, 1);
  // 끈
  const tie = (b, on) => { g.strokeStyle = on ? C.acc : C.mute; g.lineWidth = 7 * dpr; g.setLineDash(on ? [] : [4 * dpr, 6 * dpr]); g.beginPath(); g.moveTo(px(b.up[0]), py(b.up[1])); const dxn = b.dn[0] - b.up[0], dyn = b.dn[1] - b.up[1], l = Math.hypot(dxn, dyn), e = on ? 30 : 0; g.lineTo(px(b.dn[0] + dxn / l * e), py(b.dn[1] + dyn / l * e)); g.stroke(); g.setLineDash([]); };
  tie(R.tieIn, true); if (P.t > 0.985) tie(R.tieOut, true); if (R.tiesB) R.tiesB.forEach(b => tie(b, true));
  // 누르는 손
  if (P.t < 0.985) { const h = R.hand; g.strokeStyle = C.acc; g.fillStyle = C.acc; g.lineWidth = 3 * dpr; g.beginPath(); g.moveTo(px(h[0]), py(h[1] + 95)); g.lineTo(px(h[0]), py(h[1] + 22)); g.stroke(); g.beginPath(); g.moveTo(px(h[0]), py(h[1] + 10)); g.lineTo(px(h[0] - 12), py(h[1] + 32)); g.lineTo(px(h[0] + 12), py(h[1] + 32)); g.closePath(); g.fill(); text('누름', h[0] + 16, h[1] + 60, C.acc, 'right'); }
  // 이름표
  text('걸이봉', R.Cb[0], R.Cb[1] + P.rBar + 14, C.ink); if (kind !== 'trad') text('받침', R.Cs[0], Math.max(18, R.Cs[1] - P.rSup - 26), C.ink);
  if (kind === 'trad') { const y = -P.drop - 44, x0 = P.dx - 70, x1 = P.dx + 90; text('받침: 옮겨 가며 사용', (x0 + x1) / 2, y - 26, C.acc); g.strokeStyle = C.acc; g.fillStyle = C.acc; g.lineWidth = 2 * dpr; g.beginPath(); g.moveTo(px(x0), py(y)); g.lineTo(px(x1), py(y)); g.stroke(); for (const [xx, s] of [[x0, 1], [x1, -1]]) { g.beginPath(); g.moveTo(px(xx), py(y)); g.lineTo(px(xx + s * 14), py(y + 7)); g.lineTo(px(xx + s * 14), py(y - 7)); g.closePath(); g.fill(); } }
  const zm = R.bow.find(b => b.s >= 0); text('줌통', zm.dn[0] - 30, zm.dn[1] - 34, C.ink);
  text(P.st2 ? '윗장 고자' : '아랫장 고자', R.tipA[0], R.tipA[1] + 24, C.ink); text(P.st2 ? '아랫장 고자' : '윗장 고자', R.tipB[0], R.tipB[1] + 24, C.ink);
  // 간섭 표시
  for (const c of [R.clrA, R.clrB]) if (c.v < 0 && c.p) { g.strokeStyle = C.warn; g.lineWidth = 3 * dpr; g.beginPath(); g.arc(px(c.p[0]), py(Math.max(c.p[1], VY0 + 30)), 16 * dpr, 0, 7); g.stroke(); text('닿음', c.p[0], Math.max(c.p[1], VY0 + 30) + 34, C.warn); }
  // 판독값
  const cls = v => v < 0 ? 'warn' : v < 20 ? 'care' : 'good', f0 = v => Math.round(v);
  const R1 = solve({ ...P, t: 1 }), q = R1.polyA[76], room = q[1] + ((q[0] >= -P.back && q[0] <= P.len - P.back) ? 0 : P.drop);
  const rd = [
    ['부린활 크기 (자유 상태)', `${f0(F.w)} × ${f0(F.h)}`, `고자 간격 ${f0(F.tips)} mm`, ''],
    ['처음에 벌어진 틈', `${f0(solve({ ...P, t: 0 }).gap)} mm`, '도지개 고자 쪽 끝에서 활채까지. 이만큼 눌러야 합니다', ''],
    [(P.st2 ? '윗장' : '아랫장') + ' 쪽 최소 여유 (작업 중)', `${f0(R.clrA.v)} mm`, R.clrA.v < 0 ? '활이나 도지개가 지지판·바닥을 파고듭니다' : '지지판·바닥까지', cls(R.clrA.v)],
    [(P.st2 ? '아랫장' : '윗장') + ' 쪽 최소 여유 (반대쪽)', `${f0(R.clrB.v)} mm`, R.clrB.v < 0 ? '반대쪽 활채가 지지판·바닥을 파고듭니다' : '지지판·바닥까지', cls(R.clrB.v)],
    ['끈 묶는 자리 (도지개 밑 공간)', `${f0(room)} mm`, room < 100 ? '손을 넣어 끈을 돌리기에 좁습니다. 걸이봉과 받침을 함께 올리세요' : '도지개 고자 쪽 끝 아래, 다 눌렀을 때', room < 70 ? 'warn' : room < 100 ? 'care' : 'good'],
    ['누르는 손 높이', `${f0(R.hand[1])} mm`, '지지판 윗면에서', R.hand[1] < 40 ? 'care' : ''],
    ['도지개 기울기', `${R.tilt.toFixed(1)}°`, '고자 쪽이 올라가면 +', ''],
    ['창을 지나는 최대 두께', `${f0(R.stack)} mm`, '도지개 채운 활채. 끈 두께는 별도', ''],
    ['받침 접촉', !R.ok ? '안 닿음' : Math.abs(R.tilt) > 30 ? '끝에 걸림' : '닿음', !R.ok ? '수평 거리나 높이를 조절하세요' : Math.abs(R.tilt) > 30 ? '받침이 도지개 끝 모서리에 걸려 활이 곧추섭니다. 받침을 고자 쪽으로 옮기세요' : `걸이봉에서 ${f0(R.cp[0])} mm 지점`, !R.ok || Math.abs(R.tilt) > 30 ? 'warn' : 'good'],
  ];
  $('st1').className = P.st2 ? 'ghost' : ''; $('st2').className = P.st2 ? '' : 'ghost'; $('cap').textContent = CAP[P.st2 ? 2 : 1];
  g.font = `600 ${17 * dpr}px ${css('--display')}`; g.fillStyle = C.ink; g.textAlign = 'left'; g.fillText(P.st2 ? '2단계  윗장 작업 (아랫장은 채워짐)' : '1단계  아랫장 작업', 16 * dpr, 28 * dpr);
  $('reads').innerHTML = rd.map(r => `<div class="read ${r[3]}"><div class="k">${r[0]}</div><div class="v">${r[1]}</div><div class="s">${r[2]}</div></div>`).join('');
}
document.querySelectorAll('input,select').forEach(e => e.addEventListener('input', render));
$('p_roller').onclick = () => setPreset('roller'); $('p_trad').onclick = () => setPreset('trad');
let raf = 0;
const CAP = { 1: '도지개의 줌통 쪽 끝을 아랫장에 먼저 묶고, 그 끈을 걸이봉에 겁니다. 아랫장 고자 쪽을 눌러 도지개에 붙인 뒤 고자 쪽 끝을 묶습니다. 윗장은 아직 말려 있습니다.', 2: '활을 돌려 윗장을 작업합니다. 아랫장은 도지개가 채워진 채 걸이봉 너머로 뻗어 있습니다. 윗장에 묶은 끈을 걸이봉에 걸고 같은 방법으로 눌러 묶습니다.' };
function setStage(s, t) { $('stage').value = s; if (t !== undefined) $('t').value = t; render(); }
function anim(dur, done) { const t0 = performance.now(); const step = now => { const u = Math.min(1, (now - t0) / dur); $('t').value = u * u * (3 - 2 * u); render(); if (u < 1) raf = requestAnimationFrame(step); else if (done) tmr = setTimeout(done, 1100); }; raf = requestAnimationFrame(step); }
function stopAnim() { cancelAnimationFrame(raf); clearTimeout(tmr); }
let tmr = 0;
$('st1').onclick = () => { stopAnim(); setStage('1', 0); }; $('st2').onclick = () => { stopAnim(); setStage('2', 0); };
$('play').onclick = () => { stopAnim(); $('t').value = 0; anim(3500); };
$('playAll').onclick = () => { stopAnim(); setStage('1', 0); tmr = setTimeout(() => anim(3500, () => { setStage('2', 0); tmr = setTimeout(() => anim(3500), 900); }), 500); };
window.addEventListener('resize', render);
new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
setPreset('roller');
