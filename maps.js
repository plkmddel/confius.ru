// Интеграция Яндекс.Карт (JS API v3). Без ключа или при ошибке загрузки ничего не делает —
// остаются рисованные заглушки, которые строит app.js.
const YMaps = (() => {
  let loading = null;

  function load() {
    if (!window.YMAPS_KEY) return Promise.reject(new Error('YMAPS_KEY не задан'));
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://api-maps.yandex.ru/v3/?apikey=' + encodeURIComponent(window.YMAPS_KEY) + '&lang=ru_RU';
        s.onload = () => window.ymaps3.ready.then(() => resolve(window.ymaps3), reject);
        s.onerror = () => reject(new Error('Не удалось загрузить API Яндекс.Карт'));
        document.head.appendChild(s);
      });
      loading.catch(e => console.warn('[Яндекс.Карты]', e.message));
    }
    return loading;
  }

  const lngLat = p => [p.lon, p.lat];

  function baseMap(api, host, location) {
    const map = new api.YMap(host, { location, behaviors: ['drag', 'pinchZoom', 'dblClick'] });
    map.addChild(new api.YMapDefaultSchemeLayer({}));
    map.addChild(new api.YMapDefaultFeaturesLayer({}));
    return map;
  }

  function makeHost(container) {
    const host = document.createElement('div');
    host.className = 'ymap-host';
    container.appendChild(host);
    return host;
  }

  function zoomControls(container, map, onHome) {
    const box = document.createElement('div');
    box.className = 'map-zoom';
    const btn = (label, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label; b.title = title; b.setAttribute('aria-label', title);
      b.addEventListener('click', fn);
      box.appendChild(b);
    };
    btn('+', 'Приблизить', () => map.update({ location: { zoom: map.zoom + 1, duration: 250 } }));
    btn('−', 'Отдалить', () => map.update({ location: { zoom: map.zoom - 1, duration: 250 } }));
    if (onHome) btn('⤢', 'Вся область', onHome);
    container.appendChild(box);
  }

  // Мини-карта в окне подробностей. markerEl — готовый DOM-элемент метки в стиле раздела.
  // Возвращает функцию уничтожения карты.
  async function mountMini(container, place, markerEl) {
    const api = await load();
    if (!container.isConnected) return () => {};
    const host = makeHost(container);
    const map = baseMap(api, host, { center: lngLat(place), zoom: place.z || 12 });
    map.addChild(new api.YMapMarker({ coordinates: lngLat(place) }, markerEl));
    zoomControls(container, map);
    return () => map.destroy();
  }

  // Большая карта экрана 7. makeMarker(place) → DOM-элемент, onPick(id) — клик по метке.
  async function mountBig(container, places, makeMarker, onPick) {
    const api = await load();
    const lats = places.map(p => p.lat), lons = places.map(p => p.lon);
    const bounds = [[Math.min(...lons), Math.max(...lats)], [Math.max(...lons), Math.min(...lats)]];
    const host = makeHost(container);
    const map = new api.YMap(host, { location: { bounds }, margin: [40, 40, 40, 40], behaviors: ['drag', 'pinchZoom', 'dblClick', 'scrollZoom'] });
    map.addChild(new api.YMapDefaultSchemeLayer({}));
    map.addChild(new api.YMapDefaultFeaturesLayer({}));
    zoomControls(container, map, () => map.update({ location: { bounds, duration: 500 } }));

    const markers = new Map();
    for (const p of places) {
      const el = makeMarker(p);
      el.addEventListener('click', e => { e.stopPropagation(); onPick(p.id); });
      const m = new api.YMapMarker({ coordinates: lngLat(p) }, el);
      markers.set(p.id, { m, el, shown: false });
    }

    return {
      // Показать только видимые метки; restyle(el, place) обновляет вид метки (выбрана / нет)
      update(visibleIds, restyle) {
        for (const p of places) {
          const rec = markers.get(p.id);
          const want = visibleIds.has(p.id);
          if (want && !rec.shown) { map.addChild(rec.m); rec.shown = true; }
          if (!want && rec.shown) { map.removeChild(rec.m); rec.shown = false; }
          const z = restyle(rec.el, p) || 0;
          if (rec.shown) rec.m.update({ zIndex: z });
        }
      },
      flyTo(p) {
        map.update({ location: { center: lngLat(p), zoom: Math.max(map.zoom, Math.min(p.z || 12, 13)), duration: 600 } });
      }
    };
  }

  return { load, mountMini, mountBig };
})();
