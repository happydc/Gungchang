// ---- 화면 ----
const $ = id => document.getElementById(id);
const ST = { kind: 'trad', trad: { ...TRAD_DEF }, roller: { ...ROLL_DEF } };
function buildFields() { const k = ST.kind, p = ST[k], F = k === 'trad' ? TRAD_FIELDS : ROLL_FIELDS; let h = '';
  if (k === 'trad') h += `<div class="grp"><h2>걸이대 결합 방식</h2><select class="full" id="f_joint">${Object.entries(JOINTS).map(([v, t]) => `<option value="${v}"${p.joint === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>`;
  for (const [title, rows] of F) { h += `<div class="grp" style="margin-top:14px"><h2>${title}</h2>`;
    for (const [key, label, only, opts] of rows) { let hide = false; if (only) { if (only.startsWith('o:')) hide = p.outline !== only.slice(2); else if (only.startsWith('h:')) hide = p.headShape !== only.slice(2); else hide = !only.split(',').includes(p.joint); }
      h += `<div class="fld"${hide ? ' hidden' : ''}><label for="f_${key}">${label}</label>` + (opts ? `<select id="f_${key}" data-sel="1">${Object.entries(opts).map(([v, t]) => `<option value="${v}"${p[key] === v ? ' selected' : ''}>${t}</option>`).join('')}</select>` : `<input type="number" id="f_${key}" value="${p[key]}" step="${key === 'pt' && k === 'roller' ? 0.5 : 1}" min="0" inputmode="decimal">`) + '</div>'; }
    h += '</div>'; }
  $('fields').innerHTML = h;
  $('fields').querySelectorAll('input').forEach(e => e.addEventListener('input', () => { const v = parseFloat(e.value); if (isFinite(v) && v >= 0) { ST[ST.kind][e.id.slice(2)] = v; render(); } }));
  $('fields').querySelectorAll('select[data-sel]').forEach(e => e.addEventListener('change', () => { ST[ST.kind][e.id.slice(2)] = e.value; buildFields(); render(); }));
  if ($('f_joint')) $('f_joint').addEventListener('change', e => { ST.trad.joint = e.target.value; buildFields(); render(); }); }
function render() { const k = ST.kind; let out; DRAWINGS = []; try { localStorage.setItem('gungchang', JSON.stringify(ST)); } catch (_) {} try { out = k === 'trad' ? tradCards(ST.trad) : rollCards(ST.roller); } catch (err) { $('cards').innerHTML = `<div class="card"><h2>도면을 그릴 수 없습니다</h2><p class="note">치수 조합을 확인해 주세요. (${String(err.message || err)})</p></div>`; return; }
  $('checks').innerHTML = out.checks.map(c => `<div class="chk ${c[3]}"><div class="k">${c[0]}</div><div class="v">${c[1]}</div><div class="s">${c[2]}</div></div>`).join('');
  const card = (c, i) => `<article class="card"><header><div><h2>${c[0]}</h2>${c[1] ? `<div class="sub">${c[1]}</div>` : ''}</div><span class="acts"><button type="button" class="ghost sm" data-act="svg">SVG 저장</button><button type="button" class="ghost sm" data-act="dxf">DXF 저장</button><button type="button" class="ghost sm" data-act="print">1:1 인쇄</button></span></header>${c[2]}</article>`;
  const tbl = `<article class="card"><header><h2>재단표</h2></header><div class="tblwrap"><table><thead><tr><th>부재</th><th>수량</th><th>치수</th><th>가공·비고</th></tr></thead><tbody>${out.cut.map(r => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div><p class="note">목재 치수는 길이 × 폭 × 두께 순서입니다. 마감 치수이므로 재단할 때 여유를 두세요.</p></article>`;
  $('cards').innerHTML = card(out.cards[0], 0) + `<div class="two">${out.cards.slice(1, 3).map((c, i) => card(c, i + 1)).join('')}</div>` + tbl + card(out.cards[3], 3) + `<div class="two">${out.cards.slice(4).map((c, i) => card(c, i + 4)).join('')}</div>`;
  $('k_trad').className = k === 'trad' ? '' : 'ghost'; $('k_roller').className = k === 'roller' ? '' : 'ghost'; }
const EXPORT_CSS = '.o{fill:none;stroke:#111;stroke-width:1.5px;vector-effect:non-scaling-stroke}.w{fill:#f1e3c8}.s{fill:#dfe5ea}.p{fill:#fff}.h{fill:none;stroke:#111;stroke-width:1px;stroke-dasharray:5 4;vector-effect:non-scaling-stroke}.c{fill:none;stroke:#777;stroke-width:.8px;stroke-dasharray:10 3 2 3;vector-effect:non-scaling-stroke}.d{fill:none;stroke:#17695a;stroke-width:.9px;vector-effect:non-scaling-stroke}text{font-family:sans-serif;fill:#111}text.dt{fill:#17695a}text.n{fill:#666}';
function save(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function fname(card) { return (ST.kind === 'trad' ? '궁창_전통형_' : '궁창_롤러형_') + card.querySelector('h2').textContent.replace(/[:\s()]+/g, '_').replace(/_+$/, ''); }
$('cards').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const card = b.closest('.card'), svg = card.querySelector('svg'); if (!svg) return; const act = b.dataset.act;
  if (act === 'svg') save(fname(card) + '.svg', svg.outerHTML.replace(/ style="[^"]*"/, '').replace('<svg ', `<svg width="${svg.dataset.w}mm" height="${svg.dataset.h}mm" `).replace('>', `><style>${EXPORT_CSS}</style>`), 'image/svg+xml');
  else if (act === 'dxf') save(fname(card) + '.dxf', toDXF(DRAWINGS[+svg.dataset.di]), 'application/dxf');
  else { document.querySelectorAll('.print-target').forEach(x => x.classList.remove('print-target')); card.classList.add('print-target'); svg.style.setProperty('--pw', svg.dataset.w + 'mm'); svg.style.setProperty('--ph', svg.dataset.h + 'mm'); document.body.classList.add('printing'); window.print(); } });
window.addEventListener('afterprint', () => document.body.classList.remove('printing'));
try { const sv = JSON.parse(localStorage.getItem('gungchang') || 'null'); if (sv && sv.trad && sv.roller) { ST.kind = sv.kind === 'roller' ? 'roller' : 'trad'; Object.assign(ST.trad, sv.trad); Object.assign(ST.roller, sv.roller); } } catch (_) {}
$('k_trad').onclick = () => { ST.kind = 'trad'; buildFields(); render(); };
$('k_roller').onclick = () => { ST.kind = 'roller'; buildFields(); render(); };
$('reset').onclick = () => { ST[ST.kind] = ST.kind === 'trad' ? { ...TRAD_DEF, joint: ST.trad.joint } : { ...ROLL_DEF }; buildFields(); render(); };
buildFields(); render();
