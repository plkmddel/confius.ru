// Рендер сайта: списки, вкладки, окна подробностей, навигация, карта экрана 7.
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PLACE = Object.fromEntries(window.PLACES.map(p => [p.id, p]));
  const photo = sid => 'photos/' + sid + '.webp';
  const img = (sid, alt) => `<img class="ph" src="${photo(sid)}" alt="${esc(alt)}" loading="lazy">`;
  const mapUrl = p => p ? `https://yandex.ru/maps/?ll=${p.lon},${p.lat}&pt=${p.lon},${p.lat}&z=${Math.min(p.z || 16, 16)}&l=map` : '#';
  const srcChips = (codes, color) => (codes || []).filter(c => SRC[c]).map(c =>
    `<a class="src-chip" href="${esc(SRC[c][1])}" target="_blank" rel="noopener" title="${esc(SRC[c][0])}" style="color:${color}">${esc(c)}</a>`).join('');
  const paras = (arr, style) => arr.map(p => `<p style="${style}">${esc(p)}</p>`).join('');

  /* ---------- Навигация ---------- */
  let active = 1;
  function renderNav() {
    $('nav').innerHTML = NAV_LABELS.map((label, i) => {
      const on = active === i + 1;
      return `<button data-go="${i + 1}" title="${esc(label)}" aria-label="${esc(label)}" style="display:flex;align-items:center;justify-content:flex-end;gap:8px;background:none;border:0;color:#fff;padding:2px 0;opacity:${on ? 1 : .45};font:500 10px/1 'IBM Plex Mono',monospace;letter-spacing:.08em">
        <span>0${i + 1}</span><span style="display:block;height:1px;background:#fff;width:${on ? 28 : 12}px;transition:width .3s"></span></button>`;
    }).join('');
  }
  function onScroll() {
    let a = 1;
    for (let i = 1; i <= 8; i++) {
      const el = $('s' + i);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) a = i;
    }
    if (a !== active) { active = a; renderNav(); }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) $('s' + b.dataset.go).scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 02 Почему здесь ---------- */
  $('geo-cards').innerHTML = GEO.map((g, i) => `
    <button data-open="why:${i}" class="h-geo" style="text-align:left;background:#f4efe8;border:1px solid rgba(107,18,25,.18);padding:0;display:flex;flex-direction:column;color:inherit;transition:background .3s,transform .3s">
      <div style="aspect-ratio:4/3;width:100%;background:repeating-linear-gradient(135deg,rgba(107,18,25,.07) 0 1px,transparent 1px 12px),#e6ddd1;position:relative;overflow:hidden">${img('why' + i, g.t)}</div>
      <div style="flex:1;padding:20px 22px 22px;display:flex;flex-direction:column;gap:8px">
        <span style="font:500 11px 'IBM Plex Mono',monospace;color:#6b1219;letter-spacing:.1em">${g.n}</span>
        <span style="font-family:'Cormorant Garamond',serif;font-size:26px;line-height:1.05;color:#2a1a1a">${esc(g.t)}</span>
        <span style="margin-top:auto;padding-top:10px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b1219">Подробнее →</span>
      </div>
    </button>`).join('');

  let tab = 'pop';
  function panelHtml(k) {
    const S = STATS[k], on = k === tab;
    const max = S.bars ? Math.max(...S.bars.map(b => b[1])) : 1;
    const left = S.hasDonut ? `
      <div style="position:relative;width:280px;max-width:100%;aspect-ratio:1;border-radius:50%;background:${S.donut};flex:none">
        <div style="position:absolute;inset:28px;border-radius:50%;background:#f4efe8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:24px">
          <span style="font-family:'Cormorant Garamond',serif;font-size:60px;line-height:1;color:#5e1218">${esc(S.center)}</span>
          <span style="font-size:14px;line-height:1.35;color:#6a5a54">${esc(S.sub)}</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px;min-width:200px;flex:1">
        ${S.segs.map(s => `<div style="display:flex;align-items:center;gap:14px;font-size:17px;color:#2a1a1a"><span style="width:14px;height:14px;background:${s.c};transform:rotate(45deg);flex:none"></span><span style="flex:1">${esc(s.l)}</span><span style="font-family:'Cormorant Garamond',serif;font-size:30px;color:#6b1219">${esc(s.v)}</span></div>`).join('')}
      </div>` : `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:520px">
        <span style="font-family:'Cormorant Garamond',serif;font-size:clamp(72px,9vw,140px);line-height:.9;color:#5e1218">${esc(S.center)}</span>
        <span style="font-size:19px;line-height:1.5;color:#4a3a36">${esc(S.sub)}</span>
      </div>`;
    const right = S.bars ? `<div style="display:flex;flex-direction:column;gap:16px">${S.bars.map(b => `
        <div style="display:grid;grid-template-columns:minmax(110px,190px) 1fr 70px;gap:16px;align-items:center;font-size:17px">
          <span>${esc(b[0])}</span>
          <span style="height:10px;background:rgba(107,18,25,.1);position:relative"><span style="position:absolute;left:0;top:0;bottom:0;width:${Math.round(b[1] / max * 100)}%;background:#6b1219"></span></span>
          <span style="text-align:right;font-family:'Cormorant Garamond',serif;font-size:26px;color:#6b1219">${b[1].toLocaleString('ru-RU')}</span>
        </div>`).join('')}</div>`
      : `<div style="display:flex;flex-direction:column">${S.facts.map(f => `
        <div style="display:grid;grid-template-columns:minmax(90px,150px) 1fr;gap:24px;padding:16px 0;border-bottom:1px solid rgba(107,18,25,.15);align-items:baseline">
          <span style="font-family:'Cormorant Garamond',serif;font-size:28px;line-height:1.1;color:#6b1219">${esc(f.k)}</span>
          <span style="font-size:17px;line-height:1.5;color:#4a3a36">${esc(f.t)}</span>
        </div>`).join('')}</div>`;
    return `<div aria-hidden="${!on}" style="grid-area:1/1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:clamp(32px,5vw,96px);align-items:center;align-content:center;visibility:${on ? 'visible' : 'hidden'};pointer-events:${on ? 'auto' : 'none'}">
      <div style="display:flex;align-items:center;gap:40px;flex-wrap:wrap;order:${S.hasBig ? 2 : 1}">${left}</div>
      <div style="display:flex;flex-direction:column;gap:20px;order:${S.hasBig ? 1 : 2}">
        <span style="font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#6b1219">${esc(S.rightTitle)}</span>${right}
      </div>
    </div>`;
  }
  function renderStats() {
    $('stats-heading').textContent = STATS[tab].heading;
    $('stats-tabs').innerHTML = TABS.map(([k, l]) => `<button data-tab="${k}" style="border:0;padding:14px 28px;font-size:14px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;background:${tab === k ? '#6b1219' : 'transparent'};color:${tab === k ? '#f4efe8' : '#6b1219'};transition:background .25s">${l}</button>`).join('');
    $('stats-panels').innerHTML = TABS.map(([k]) => panelHtml(k)).join('');
  }
  $('stats-tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; renderStats(); } });

  /* ---------- 03 Купеческий Нижний ---------- */
  $('fair-stats').innerHTML = FAIR_STATS.map(s => `<div style="padding:22px 20px 22px 0;display:flex;flex-direction:column;gap:6px"><span style="font-family:'Ruslan Display',serif;font-size:40px;line-height:1.05;color:#e6cf98">${esc(s.v)}</span><span style="font-size:14px;line-height:1.4;color:#bba98a">${esc(s.l)}</span></div>`).join('');
  $('mer-cards').innerHTML = MERCHANTS.map((c, i) => `
    <button data-open="mer:${i}" class="h-mer" style="text-align:left;background:#22160f;border:1px solid rgba(200,163,90,.45);padding:0;display:flex;flex-direction:column;color:inherit;font-family:'Old Standard TT',serif;transition:background .3s,transform .3s">
      <div style="aspect-ratio:4/3;width:100%;padding:14px 14px 0;display:flex;justify-content:center"><div style="width:62%;height:100%;border-radius:999px 999px 0 0;border:1px solid #c8a35a;border-bottom:0;background:repeating-linear-gradient(135deg,rgba(200,163,90,.12) 0 1px,transparent 1px 9px),#2e2016;position:relative;overflow:hidden">${img('mer' + i, c.t)}</div></div>
      <div style="flex:1;padding:20px 22px 22px;display:flex;flex-direction:column;gap:8px;border-top:1px solid rgba(200,163,90,.45)">
        <span style="font-family:'Ruslan Display',serif;font-size:22px;line-height:1.1;color:#e6cf98">${esc(c.t)}</span>
        <span style="font-size:15px;line-height:1.45;font-style:italic;color:#bba98a">${esc(c.role)}</span>
        <span style="margin-top:auto;padding-top:10px;font-size:12px;letter-spacing:.2em;color:#c8a35a">ПОДРОБНЕЕ →</span>
      </div>
    </button>`).join('');
  $('fair-timeline').innerHTML = FAIR_TIMELINE.map(e => `<div style="display:grid;grid-template-columns:minmax(96px,128px) minmax(0,1fr);gap:20px;align-items:center;padding:14px 0;min-height:56px;border-bottom:1px solid rgba(200,163,90,.2);box-sizing:content-box"><span style="font-family:'Ruslan Display',serif;font-size:clamp(26px,2.2vw,34px);line-height:1.1;color:#d9a536">${esc(e.y)}</span><span style="font-size:clamp(22px,1.8vw,28px);font-weight:700;line-height:1.3;color:#f4ead2;text-wrap:pretty">${esc(e.t)}</span></div>`).join('');
  $('goods').innerHTML = GOODS.map(g => `<div style="display:grid;grid-template-columns:56px minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:center;padding:14px 0;border-bottom:1px solid rgba(200,163,90,.2)"><img src="icons/${g.i}.webp" alt="" style="width:56px;height:56px;object-fit:contain;display:block"><span style="font-size:clamp(22px,1.8vw,28px);font-weight:700;line-height:1.3;color:#f4ead2;text-transform:capitalize">${esc(g.v)}</span><span style="font-size:clamp(22px,1.8vw,28px);font-weight:700;line-height:1.3;color:#f4ead2">${esc(g.k)}</span></div>`).join('');

  /* ---------- 04 Индустриальный рывок ---------- */
  $('war-stats').innerHTML = WAR_STATS.map(s => `<div style="padding:22px 20px;display:flex;flex-direction:column;gap:6px"><span style="font-size:44px;font-weight:700;line-height:1;color:${s.c}">${esc(s.v)}</span><span style="font:400 12px/1.45 'IBM Plex Mono',monospace;color:#bdbab3">${esc(s.l)}</span></div>`).join('');
  $('fac-cards').innerHTML = FACTORIES.map((f, i) => `
    <button data-open="fac:${i}" class="h-fac" style="background:#d9d6cf;border:3px solid #121212;padding:0;text-align:left;color:#121212;display:flex;flex-direction:column;transition:background .2s,color .2s">
      <div style="aspect-ratio:16/9;width:100%;background:repeating-linear-gradient(90deg,rgba(128,128,128,.22) 0 2px,transparent 2px 14px);border-bottom:3px solid currentColor;position:relative;overflow:hidden">${img('fac' + i, f.t)}</div>
      <div style="flex:1;padding:18px 20px 20px;display:flex;flex-direction:column;gap:8px;width:100%">
        <span style="font:500 11px 'IBM Plex Mono',monospace;letter-spacing:.1em">№ ${f.n} · ${esc(f.y)}</span>
        <span style="font-size:28px;font-weight:600;line-height:1;text-transform:uppercase">${esc(f.t)}</span>
        <span style="margin-top:auto;padding-top:10px;font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.12em">ПОДРОБНЕЕ →</span>
      </div>
    </button>`).join('');
  $('ind-timeline').innerHTML = IND_TIMELINE.map(e => `<div style="display:grid;grid-template-columns:120px 1fr;gap:20px;padding:11px 0;border-bottom:1px solid #121212"><span style="font-size:22px;font-weight:600;line-height:1.1">${esc(e.y)}</span><span style="font:400 13px/1.5 'IBM Plex Mono',monospace;color:#333">${esc(e.t)}</span></div>`).join('');

  /* ---------- 05 Современный бизнес ---------- */
  $('biz-stats').innerHTML = BIZ_STATS.map(s => `<div style="padding:22px 24px;display:flex;flex-direction:column;gap:6px"><span style="font-size:40px;font-weight:800;letter-spacing:-.04em;line-height:1">${esc(s.v)}</span><span style="font-size:13px;line-height:1.4;color:#4a4e66">${esc(s.l)}</span></div>`).join('');
  $('biz-cards').innerHTML = BIZ.map((b, i) => `
    <button data-open="biz:${i}" class="h-biz" style="text-align:left;color:inherit;padding:0;overflow:hidden;border-radius:24px;background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.85);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 20px 50px -30px rgba(40,50,100,.3);display:flex;flex-direction:column;transition:transform .3s">
      <div style="aspect-ratio:16/9;width:100%;background:repeating-linear-gradient(135deg,rgba(60,70,140,.08) 0 1px,transparent 1px 12px),${b.c};position:relative;overflow:hidden">${img('biz' + i, b.t)}</div>
      <div style="flex:1;padding:18px 20px 20px;display:flex;flex-direction:column;gap:8px">
        <span style="font-size:12px;font-weight:700;color:#6a6f8a">${esc(b.k)}</span>
        <span style="font-size:21px;font-weight:700;letter-spacing:-.015em;line-height:1.2">${esc(b.t)}</span>
        <span style="font-size:14px;line-height:1.5;color:#4a4e66">${esc(b.short)}</span>
        <span style="margin-top:auto;padding-top:10px;font-size:13px;font-weight:700;color:oklch(0.5 0.14 265)">Подробнее →</span>
      </div>
    </button>`).join('');

  /* ---------- 06 Мастера и бренды ---------- */
  $('craft-stats').innerHTML = CRAFT_STATS.map(s => `<div style="padding:22px 20px 22px 0;display:flex;flex-direction:column;gap:6px"><span style="font-family:'Unbounded',sans-serif;font-weight:900;font-size:36px;letter-spacing:-.03em;line-height:1.05;color:${s.c}">${esc(s.v)}</span><span style="font-size:16px;line-height:1.35;color:#cdbf9f">${esc(s.l)}</span></div>`).join('');
  $('craft-cards').innerHTML = CRAFTS.map((c, i) => `
    <button data-open="craft:${i}" class="h-craft" style="text-align:left;display:flex;flex-direction:column;padding:0;overflow:hidden;border:1px solid rgba(217,165,54,.3);border-radius:20px;background:linear-gradient(#171310,#0d0b09);color:inherit;font-family:'Cormorant Garamond',serif;transition:border-color .3s,transform .3s">
      <div style="aspect-ratio:4/3;width:100%;display:flex;align-items:center;justify-content:center;border-bottom:1px solid rgba(217,165,54,.3)"><div style="height:78%;aspect-ratio:1;border-radius:50%;border:2px solid #d9a536;box-shadow:inset 0 0 0 8px #0d0b09,inset 0 0 0 9px #b3201b;background:repeating-linear-gradient(135deg,rgba(217,165,54,.12) 0 1px,transparent 1px 9px),#1a1410;position:relative;overflow:hidden">${img('craft' + i, c.t)}</div></div>
      <div style="flex:1;padding:20px 22px 24px;display:flex;flex-direction:column;gap:10px">
        <span style="font:500 12px 'Unbounded',sans-serif;letter-spacing:.14em;color:#d9a536">${esc(c.place)}</span><span style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:22px;line-height:1.15;text-transform:uppercase;color:#f3e7cf">${esc(c.t)}</span>
        <span style="font-size:18px;line-height:1.4;color:#d8cbae">${esc(c.short)}</span>
        <span style="margin-top:auto;padding-top:10px;font:500 12px 'Unbounded',sans-serif;letter-spacing:.12em;color:#e0453a">ПОДРОБНЕЕ →</span>
      </div>
    </button>`).join('');
  $('craft-paths').innerHTML = CRAFT_PATHS.map(p => `<div style="display:flex;flex-direction:column;gap:16px;padding:8px clamp(14px,1.6vw,28px) 12px;border-left:1px solid rgba(217,165,54,.3)"><span style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:clamp(44px,4.2vw,64px);line-height:1;color:#d9a536">${p.n}</span><span style="display:flex;flex-direction:column;gap:8px"><span style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:clamp(15px,1.2vw,19px);text-transform:uppercase;letter-spacing:.04em">${esc(p.t)}</span><span style="font-size:clamp(16px,1.2vw,19px);line-height:1.45;color:#b9ab8c">${esc(p.d)}</span></span></div>`).join('');

  /* ---------- 08 Итоги ---------- */
  $('summary').innerHTML = SUMMARY.map(s => `<div style="padding:22px 24px 22px 0;display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#d8b9b2">${esc(s.t)}</span><span style="font-family:'Cormorant Garamond',serif;font-size:44px;line-height:1;font-style:italic">${esc(s.c)}</span><span style="font-size:14px;line-height:1.5;color:#e6d3ce">${esc(s.d)}</span></div>`).join('');
  $('team').innerHTML = TEAM.map(p => `<div style="display:flex;flex-direction:column;gap:8px;padding:20px 22px;border:1px solid rgba(244,239,232,.2)"><span style="font-family:'Cormorant Garamond',serif;font-size:32px;line-height:1">${esc(p.n)}</span><span style="font-size:13px;line-height:1.45;color:#d8b9b2">${esc(p.r)}</span></div>`).join('');
  $('src-count').textContent = 'ИСТОЧНИКИ · ' + Object.keys(SRC).length;
  $('src-groups').innerHTML = SRC_GROUPS.map(g => `<div style="display:flex;flex-direction:column"><span style="font-family:'Cormorant Garamond',serif;font-size:24px;font-style:italic;padding-bottom:10px">${esc(g.who)}</span>${g.items.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="h-src" style="display:grid;grid-template-columns:40px 1fr;gap:10px;padding:9px 0;border-top:1px solid rgba(244,239,232,.15);color:#f4efe8;font-size:13px;line-height:1.4;text-decoration:none"><span style="font:500 10px/1.9 'IBM Plex Mono',monospace;color:#d8b9b2">${esc(s.code)}</span><span>${esc(s.title)}</span></a>`).join('')}</div>`).join('');

  /* ---------- Мини-карты в окнах ---------- */
  // Стиль метки по разделу (как рисованные точки макета)
  const MARK = {
    why: 'width:14px;height:14px;background:#6b1219;border-radius:50%;box-shadow:0 0 0 6px rgba(107,18,25,.18)',
    mer: 'width:14px;height:14px;background:#c8a35a;box-shadow:0 0 0 6px rgba(200,163,90,.2);rotate:45deg',
    fac: 'width:16px;height:16px;background:#c8261d;border:3px solid #121212',
    biz: 'width:14px;height:14px;background:oklch(0.5 0.14 265);border-radius:50%;box-shadow:0 0 0 6px oklch(0.5 0.14 265 / .2)',
    craft: 'width:14px;height:14px;background:#b3201b;border:2px solid #d9a536;border-radius:50%'
  };
  const markerEl = kind => { const el = document.createElement('div'); el.style.cssText = 'position:absolute;transform:translate(-50%,-50%);' + MARK[kind]; return el; };
  // Контейнер мини-карты: рисованная заглушка (точка по x/y) + метка-подпись; Яндекс.Карта ложится поверх
  const miniMap = (kind, m, box, label, labelStyle) => `
    <div class="minimap" data-kind="${kind}" data-pid="${m.pid}" style="position:relative;overflow:hidden;${box}">
      ${label ? `<span style="position:absolute;left:10px;top:8px;z-index:1;${labelStyle}">${esc(label)}</span>` : ''}
      <span style="position:absolute;left:${m.mx ?? m.x}%;top:${m.my ?? m.y}%;transform:translate(-50%,-50%);${MARK[kind]}"></span>
    </div>`;

  /* ---------- Окна подробностей ---------- */
  const closeBtn = style => `<button data-close aria-label="Закрыть" style="${style}">×</button>`;
  const MODALS = {
    why: (m, i) => `
      <div data-backdrop style="position:fixed;inset:0;z-index:100;background:rgba(42,18,18,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px">
        <div role="dialog" aria-modal="true" aria-label="${esc(m.t)}" style="width:min(1080px,100%);max-height:92vh;overflow:auto;background:#f4efe8;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));box-shadow:0 40px 100px -30px rgba(40,8,10,.5)">
          <div style="min-height:420px;background:repeating-linear-gradient(135deg,rgba(107,18,25,.07) 0 1px,transparent 1px 12px),#e6ddd1;position:relative;overflow:hidden">${img('why' + i, m.t)}</div>
          <div style="padding:36px 36px 32px;display:flex;flex-direction:column;gap:16px;position:relative;font-family:'Golos Text',sans-serif;color:#2a1a1a">
            ${closeBtn('position:absolute;top:18px;right:18px;width:40px;height:40px;border:1px solid rgba(107,18,25,.3);background:none;color:#6b1219;font-size:18px')}
            <span style="font:500 11px 'IBM Plex Mono',monospace;color:#6b1219;letter-spacing:.12em">${m.n} · ПОЧЕМУ ЗДЕСЬ</span>
            <h3 style="margin:0;padding-right:44px;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:42px;line-height:1;color:#5e1218">${esc(m.t)}</h3>
            <span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;line-height:1.3;color:#2a1a1a">${esc(m.sub)}</span>
            ${paras(m.text, 'margin:0;font-size:15px;line-height:1.65;color:#4a3a36;text-wrap:pretty')}
            ${miniMap('why', m, 'height:160px;margin-top:8px;background:repeating-linear-gradient(0deg,rgba(107,18,25,.06) 0 1px,transparent 1px 20px),repeating-linear-gradient(90deg,rgba(107,18,25,.06) 0 1px,transparent 1px 20px),#ebe3d8;border:1px solid rgba(107,18,25,.15)', 'карта области', "font:500 10px 'IBM Plex Mono',monospace;color:#a08f88")}
            <div style="display:flex;justify-content:space-between;font:400 11px 'IBM Plex Mono',monospace;color:#7a6a64;gap:12px;flex-wrap:wrap"><span>${esc(m.place)}</span><a href="${mapUrl(PLACE[m.pid])}" target="_blank" rel="noopener">Яндекс.Карты ↗</a></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">${srcChips(m.src, '#6b1219')}</div>
          </div>
        </div>
      </div>`,
    mer: (m, i) => `
      <div data-backdrop style="position:fixed;inset:0;z-index:100;background:rgba(10,6,4,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px">
        <div role="dialog" aria-modal="true" aria-label="${esc(m.t)}" style="width:min(1040px,100%);max-height:92vh;overflow:auto;background:#1f140e;border:1px solid #c8a35a;outline:1px solid rgba(200,163,90,.3);outline-offset:-10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:32px;padding:36px;color:#eadfc8;font-family:'Old Standard TT',serif;position:relative">
          ${closeBtn('position:absolute;top:20px;right:20px;z-index:2;width:40px;height:40px;border:1px solid #c8a35a;background:#1f140e;color:#c8a35a;font-size:18px')}
          <div style="min-height:400px;border-radius:999px 999px 0 0;border:1px solid #c8a35a;background:repeating-linear-gradient(135deg,rgba(200,163,90,.12) 0 1px,transparent 1px 10px),#2e2016;position:relative;overflow:hidden">${img('mer' + i, m.t)}</div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <span style="font-size:13px;letter-spacing:.25em;color:#c8a35a">${esc(m.years)}</span>
            <h3 style="margin:0;padding-right:44px;font-family:'Ruslan Display',serif;font-weight:400;font-size:38px;line-height:1.05;color:#e6cf98">${esc(m.t)}</h3>
            <span style="font-style:italic;color:#bba98a">${esc(m.role)}</span>
            ${paras(m.text, 'margin:0;font-size:16px;line-height:1.65;color:#d6c8ab;text-wrap:pretty')}
            <div style="display:flex;gap:10px;align-items:baseline;padding:12px 0;border-top:1px solid rgba(200,163,90,.3);border-bottom:1px solid rgba(200,163,90,.3)"><span style="color:#c8a35a;font-size:13px;letter-spacing:.15em;flex:none">ОСТАЛОСЬ:</span><span style="font-size:15px">${esc(m.left)}</span></div>
            ${miniMap('mer', m, 'height:140px;background:repeating-linear-gradient(0deg,rgba(200,163,90,.08) 0 1px,transparent 1px 18px),repeating-linear-gradient(90deg,rgba(200,163,90,.08) 0 1px,transparent 1px 18px),#2a1c12;border:1px solid rgba(200,163,90,.35)')}
            <div style="display:flex;justify-content:space-between;font:400 11px 'IBM Plex Mono',monospace;color:#a88a52;gap:12px;flex-wrap:wrap"><span>${esc(m.place)}</span><a href="${mapUrl(PLACE[m.pid])}" target="_blank" rel="noopener" style="color:#c8a35a">Яндекс.Карты ↗</a></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">${srcChips(m.src, '#c8a35a')}</div>
          </div>
        </div>
      </div>`,
    fac: (m, i) => `
      <div data-backdrop style="position:fixed;inset:0;z-index:100;background:rgba(18,18,18,.75);display:flex;align-items:center;justify-content:center;padding:24px">
        <div role="dialog" aria-modal="true" aria-label="${esc(m.t)}" style="width:min(1100px,100%);max-height:92vh;overflow:auto;background:#d9d6cf;border:3px solid #121212;font-family:'Oswald',sans-serif;color:#121212">
          <div style="position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;background:#121212;color:#d9d6cf;padding:10px 10px 10px 20px;font:500 12px 'IBM Plex Mono',monospace"><span>ОБЪЕКТ № ${m.n} · ${esc(m.y)}</span>${closeBtn('background:#c8261d;color:#fff;border:0;width:36px;height:36px;font-size:18px')}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))">
            <div style="display:flex;flex-direction:column;border-right:3px solid #121212">
              <div style="flex:1;min-height:320px;background:repeating-linear-gradient(90deg,rgba(18,18,18,.12) 0 2px,transparent 2px 14px),#bfbbb2;position:relative;overflow:hidden">${img('fac' + i, m.t)}</div>
              ${miniMap('fac', m, 'height:170px;border-top:3px solid #121212;background:repeating-linear-gradient(0deg,rgba(18,18,18,.1) 0 1px,transparent 1px 16px),repeating-linear-gradient(90deg,rgba(18,18,18,.1) 0 1px,transparent 1px 16px),#cfccc4', m.mapLabel, "font:500 10px 'IBM Plex Mono',monospace;background:#cfccc4;padding:2px 4px")}
            </div>
            <div style="padding:28px;display:flex;flex-direction:column;gap:14px">
              <h3 style="margin:0;font-weight:700;font-size:48px;line-height:.9;text-transform:uppercase">${esc(m.t)}</h3>
              <span style="font:500 13px 'IBM Plex Mono',monospace;color:#c8261d">${esc(m.sub)}</span>
              ${paras(m.text, "margin:0;font:400 13.5px/1.65 'IBM Plex Mono',monospace;color:#222")}
              <div style="display:flex;justify-content:space-between;font:500 11px 'IBM Plex Mono',monospace;gap:12px;flex-wrap:wrap;padding-top:10px;border-top:3px solid #121212"><span>${esc(m.place)}</span><a href="${mapUrl(PLACE[m.pid])}" target="_blank" rel="noopener" style="color:#121212;text-decoration:underline">ЯНДЕКС.КАРТЫ →</a></div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">${srcChips(m.src, '#121212')}</div>
            </div>
          </div>
        </div>
      </div>`,
    biz: (m, i) => `
      <div data-backdrop style="position:fixed;inset:0;z-index:100;background:rgba(30,34,60,.25);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:center;padding:24px;font-family:'Manrope',sans-serif">
        <div role="dialog" aria-modal="true" aria-label="${esc(m.t)}" style="width:min(1000px,100%);max-height:92vh;overflow:auto;border-radius:32px;background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.9);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);box-shadow:0 40px 120px -40px rgba(30,40,100,.45);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px;padding:24px;color:#16182a;position:relative">
          ${closeBtn('position:absolute;top:18px;right:18px;z-index:2;width:42px;height:42px;border-radius:50%;border:0;background:rgba(22,24,42,.08);font-size:18px;color:#16182a')}
          <div style="min-height:360px;border-radius:22px;background:repeating-linear-gradient(135deg,rgba(60,70,140,.08) 0 1px,transparent 1px 12px),rgba(255,255,255,.5);position:relative;overflow:hidden">${img('biz' + i, m.t)}</div>
          <div style="padding:12px 8px 8px;display:flex;flex-direction:column;gap:14px">
            <span style="align-self:flex-start;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.8);font-size:12px;font-weight:700;color:oklch(0.5 0.14 265)">${esc(m.k)}</span>
            <h3 style="margin:0;padding-right:44px;font-size:36px;font-weight:800;letter-spacing:-.03em;line-height:1.05">${esc(m.t)}</h3>
            ${paras(m.text, 'margin:0;font-size:15px;line-height:1.65;color:#3a3e56;text-wrap:pretty')}
            ${miniMap('biz', m, 'height:150px;border-radius:14px;background:repeating-linear-gradient(0deg,rgba(60,70,140,.08) 0 1px,transparent 1px 18px),repeating-linear-gradient(90deg,rgba(60,70,140,.08) 0 1px,transparent 1px 18px),rgba(255,255,255,.55);border:1px solid rgba(60,70,140,.18)', 'Карта области', 'font-size:11px;font-weight:700;color:#6a6f8a')}
            <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.6);font-size:13px"><span>${esc(m.place)}</span><a href="${mapUrl(PLACE[m.pid])}" target="_blank" rel="noopener" style="color:oklch(0.5 0.14 265);font-weight:600">Яндекс.Карты ↗</a></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">${srcChips(m.src, 'oklch(0.5 0.14 265)')}</div>
          </div>
        </div>
      </div>`,
    craft: (m, i) => `
      <div data-backdrop style="position:fixed;inset:0;z-index:100;background:rgba(5,4,3,.8);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px">
        <div role="dialog" aria-modal="true" aria-label="${esc(m.t)}" style="width:min(1040px,100%);max-height:92vh;overflow:auto;background:#120f0c;border:1px solid #d9a536;border-radius:28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:32px;padding:36px;color:#f3e7cf;font-family:'Cormorant Garamond',serif;position:relative">
          ${closeBtn('position:absolute;top:18px;right:18px;z-index:2;width:42px;height:42px;border-radius:50%;border:1px solid #d9a536;background:#120f0c;color:#d9a536;font-size:18px')}
          <div style="display:flex;flex-direction:column;align-items:center;gap:20px">
            <div style="width:min(100%,340px);aspect-ratio:1;border-radius:50%;border:2px solid #d9a536;box-shadow:inset 0 0 0 12px #120f0c,inset 0 0 0 13px #b3201b;background:repeating-linear-gradient(135deg,rgba(217,165,54,.12) 0 1px,transparent 1px 10px),#1a1410;position:relative;overflow:hidden">${img('craft' + i, m.t)}</div>
            ${miniMap('craft', m, 'width:100%;height:130px;border-radius:14px;background:repeating-linear-gradient(0deg,rgba(217,165,54,.07) 0 1px,transparent 1px 18px),repeating-linear-gradient(90deg,rgba(217,165,54,.07) 0 1px,transparent 1px 18px),#1a1410;border:1px solid rgba(217,165,54,.3)', 'карта области', "font:400 10px 'IBM Plex Mono',monospace;color:#8a6a2a")}
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <span style="font:500 11px 'Unbounded',sans-serif;letter-spacing:.14em;color:#d9a536">${esc(m.place)}</span>
            <h3 style="margin:0;padding-right:44px;font-family:'Unbounded',sans-serif;font-weight:900;font-size:34px;line-height:1;text-transform:uppercase">${esc(m.t)}</h3>
            <span style="font-size:22px;font-style:italic;color:#d9a536">${esc(m.sub)}</span>
            ${paras(m.text, 'margin:0;font-size:18px;line-height:1.55;color:#d8cbae;text-wrap:pretty')}
            <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:12px;border-top:1px solid rgba(217,165,54,.3);font:400 11px 'IBM Plex Mono',monospace;color:#b9ab8c"><span>${esc(m.addr)}</span><a href="${mapUrl(PLACE[m.pid])}" target="_blank" rel="noopener" style="color:#d9a536">Яндекс.Карты ↗</a></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">${srcChips(m.src, '#d9a536')}</div>
          </div>
        </div>
      </div>`
  };
  const DATA = { why: GEO, mer: MERCHANTS, fac: FACTORIES, biz: BIZ, craft: CRAFTS };

  let destroyMini = null, lastFocus = null;
  function openModal(kind, i) {
    closeModal();
    lastFocus = document.activeElement;
    const root = $('modal-root');
    root.innerHTML = MODALS[kind](DATA[kind][i], i);
    document.body.classList.add('modal-open');
    root.querySelector('[data-close]').focus({ preventScroll: true });
    const mm = root.querySelector('.minimap');
    const place = PLACE[mm.dataset.pid];
    if (place && window.YMAPS_KEY) {
      YMaps.mountMini(mm, place, markerEl(kind)).then(d => { destroyMini = d; }).catch(() => {});
    }
  }
  function closeModal() {
    if (destroyMini) { try { destroyMini(); } catch (e) { /* карта уже удалена */ } destroyMini = null; }
    if (!$('modal-root').innerHTML) return;
    $('modal-root').innerHTML = '';
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { const [k, i] = o.dataset.open.split(':'); openModal(k, +i); return; }
    if (e.target.closest('[data-close]') || e.target.matches('[data-backdrop]')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------- 07 Карта ---------- */
  const MAP_PLACES = window.PLACES.filter(p => p.era);
  let filter = 'all', sel = 'p0', big = null;

  const styleBigMarker = (el, p) => {
    const on = p.id === sel, s = on ? 22 : 12;
    el.style.cssText = `width:${s}px;height:${s}px;border-radius:50%;border:2px solid #f4efe8;background:${ERAS[p.era][1]};box-shadow:${on ? '0 0 0 8px rgba(107,18,25,.18)' : '0 2px 6px rgba(0,0,0,.2)'};z-index:${on ? 5 : 1}`;
    el.title = p.t;
    return on ? 5 : 1;
  };
  const makeBigMarker = p => { const el = document.createElement('button'); el.type = 'button'; el.className = 'map-marker'; el.setAttribute('aria-label', p.t); return el; };

  function pick(id, fly) {
    sel = id;
    renderMap();
    if (fly && big) big.flyTo(PLACE[id]);
  }

  function renderMap() {
    $('map-filters').innerHTML = [['all', 'Все места', '#7a6a64'], ...Object.entries(ERAS).map(([k, v]) => [k, v[0], v[1]])].map(([k, l, c]) =>
      `<button data-filter="${k}" style="display:flex;align-items:center;gap:8px;padding:10px 16px;white-space:nowrap;border:1px solid rgba(107,18,25,.3);background:${filter === k ? '#2a1a1a' : 'transparent'};color:${filter === k ? '#f4efe8' : '#2a1a1a'};font-size:13px"><span style="width:8px;height:8px;border-radius:50%;background:${c}"></span>${l}</button>`).join('');

    const vis = MAP_PLACES.filter(p => filter === 'all' || p.era === filter);
    const visIds = new Set(vis.map(p => p.id));

    if (big) {
      big.update(visIds, styleBigMarker);
    } else {
      // Рисованная карта (без ключа Яндекса)
      $('bigmap').innerHTML = vis.map(p => {
        const [x, y] = SCHEMATIC[p.id] || [50, 50];
        return `<button class="map-marker" data-pick="${p.id}" title="${esc(p.t)}" aria-label="${esc(p.t)}" style="left:${x}%;top:${y}%"></button>`;
      }).join('');
      $('bigmap').querySelectorAll('[data-pick]').forEach(el => {
        const p = PLACE[el.dataset.pick];
        const z = styleBigMarker(el, p);
        el.style.left = SCHEMATIC[p.id][0] + '%'; el.style.top = SCHEMATIC[p.id][1] + '%'; el.style.zIndex = z;
      });
    }

    const s = PLACE[sel];
    $('map-sel').innerHTML = s ? `
      <div style="padding:22px;display:flex;flex-direction:column;gap:8px;border-bottom:1px solid rgba(107,18,25,.2);background:#efe8de">
        <span style="font:500 11px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:${ERAS[s.era][1]}">${ERAS[s.era][0].toUpperCase()}</span>
        <span style="font-family:'Cormorant Garamond',serif;font-size:26px;line-height:1.05;color:#2a1a1a">${esc(s.t)}</span>
        <span style="font-size:14px;line-height:1.5;color:#4a3a36">${esc(s.d)}</span>
        <span style="font:400 11px/1.4 'IBM Plex Mono',monospace;color:#7a6a64">${esc(s.addr)}</span>
        <a href="${mapUrl(s)}" target="_blank" rel="noopener" style="font-size:12px;letter-spacing:.12em;text-transform:uppercase">Найти на карте ↗</a>
      </div>` : '';

    $('map-list').innerHTML = vis.map(p => `
      <button data-pick="${p.id}" class="h-row" style="width:100%;display:flex;align-items:center;gap:12px;padding:11px 22px;border:0;border-bottom:1px solid rgba(107,18,25,.1);background:${p.id === sel ? '#efe8de' : 'transparent'};text-align:left;font-size:14px;color:#2a1a1a">
        <span style="width:8px;height:8px;border-radius:50%;background:${ERAS[p.era][1]};flex:none"></span><span style="flex:1">${esc(p.t)}</span><span style="font:400 10px 'IBM Plex Mono',monospace;color:#a08f88;white-space:nowrap">${ERAS[p.era][0]}</span>
      </button>`).join('');
  }
  $('map-filters').addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (b) { filter = b.dataset.filter; renderMap(); } });
  $('map-list').addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (b) pick(b.dataset.pick, true); });
  $('bigmap').addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (b) pick(b.dataset.pick, false); });

  /* ---------- Старт ---------- */
  renderNav();
  renderStats();
  renderMap();
  onScroll();

  if (window.YMAPS_KEY) {
    YMaps.mountBig($('bigmap'), MAP_PLACES, makeBigMarker, id => pick(id, false))
      .then(ctrl => {
        $('bigmap').querySelectorAll('[data-pick]').forEach(el => el.remove());
        big = ctrl;
        renderMap();
      })
      .catch(() => { /* остаётся рисованная карта */ });
  }
})();
