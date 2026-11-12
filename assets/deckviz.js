/* SEVEN 3D — рисунки и интерактив для слайдов презентаций услуг.
   SevenViz.make(viz, layer, api) рисует режим viz.mode в слое поверх 3D-сцены и возвращает { destroy }.
   Плоские режимы (страницы, финмодель, панорама, план, телефон) закрывают сцену, остальные работают поверх модели.
   Всё это — схемы-заглушки: потом их заменят реальные работы студии. */
(function () {
  'use strict';
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FLAT = { pages: 1, chart: 1, pano: 1, plan: 1, phone: 1, photos: 1 };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function pad(n) { return ('0' + n).slice(-2); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function svgIco(d) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"></path></svg>'; }
  var I = {
    up: svgIco('M6 15l6-6 6 6'), down: svgIco('M6 9l6 6 6-6'), left: svgIco('M15 6l-6 6 6 6'), right: svgIco('M9 6l6 6-6 6'),
    play: '<svg class="ico ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"></path></svg>',
    pause: svgIco('M9 6v12M15 6v12')
  };

  /* Точки интереса на 3D-моделях (координаты из hero3d.js) */
  var SPOTS = {
    resort: [
      { p: [-1.5, 4.7, -1], t: 'Ресторан под куполом', d: 'Главный объект территории: вход, виды и сценарии отдыха.' },
      { p: [3.8, 3.4, 9.3], t: 'Домики A-frame', d: 'Планировка, вместимость и вид из окна.' },
      { p: [-11, 2.2, -1.6], t: 'Юрты', d: 'Размещение по периметру и маршруты гостей.' },
      { p: [11.8, 0.6, 9.2], t: 'Озеро', d: 'Набережная, пирс и зоны отдыха.' }
    ],
    plant: [
      { p: [-4, 4.3, 1], t: 'Цех', d: 'Процессы и оборудование — по нажатию.' },
      { p: [-5.4, 7.2, -7], t: 'Склад сырья', d: 'Объёмы, приёмка и логистика.' },
      { p: [8, 5, -4], t: 'Офис и лаборатория', d: 'Контроль качества и команда.' },
      { p: [12.5, 12.8, 5], t: 'Котельная', d: 'Энергия и безопасность объекта.' }
    ]
  };

  /* ---------- Ракурсы: кнопки переводят камеру ---------- */
  function views(L, o, api) {
    var box = h('div', 'vz-views');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Ракурсы');
    var bs = o.items.map(function (it, i) {
      var b = h('button', 'vz-chip', esc(it[0]));
      b.type = 'button';
      b.addEventListener('click', function () { set(i); });
      box.appendChild(b);
      return b;
    });
    function set(i) {
      bs.forEach(function (b, k) { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      if (api) api.look(o.items[i][1]);
    }
    L.appendChild(box);
    set(0);
    return {};
  }

  /* ---------- Ролик: камера идёт по кадрам, сверху — интерфейс плеера ---------- */
  function video(L, o, api) {
    var shots = o.shots, n = shots.length, dur = 3600, i = -1, playing = !REDUCE, t0 = performance.now(), paused = 0, raf = 0;
    var w = h('div', 'vz-video',
      '<div class="vz-vtop"><span class="vz-rec"><i></i>' + esc(o.label || 'Ролик') + '</span><span class="vz-tc">00:00</span></div>' +
      '<p class="vz-cap"></p>' +
      '<div class="vz-vbar"><button type="button" class="vz-pp"></button><div class="vz-track"><i></i><span></span></div><span class="vz-shot"></span></div>');
    L.appendChild(w);
    var cap = w.querySelector('.vz-cap'), tc = w.querySelector('.vz-tc'), fill = w.querySelector('.vz-track i'), pp = w.querySelector('.vz-pp'), shotEl = w.querySelector('.vz-shot'), track = w.querySelector('.vz-track');
    for (var k = 1; k < n; k++) { var m = h('b'); m.style.left = (k / n * 100) + '%'; w.querySelector('.vz-track span').appendChild(m); }
    function shot(k) {
      if (k === i) return;
      i = (k + n) % n;
      cap.textContent = shots[i][0];
      cap.classList.remove('is-in'); void cap.offsetWidth; cap.classList.add('is-in');
      shotEl.textContent = 'Кадр ' + (i + 1) + ' из ' + n;
      if (api) api.look(shots[i][1]);
    }
    function setPP() { pp.innerHTML = playing ? I.pause : I.play; pp.setAttribute('aria-label', playing ? 'Пауза' : 'Смотреть'); }
    function tick(now) {
      if (playing) {
        var el = now - t0, total = dur * n, pos = el % total, sec = Math.floor(el / 1000);
        fill.style.width = (pos / total * 100).toFixed(2) + '%';
        tc.textContent = pad(Math.floor(sec / 60)) + ':' + pad(sec % 60);
        shot(Math.floor(pos / dur));
      }
      raf = requestAnimationFrame(tick);
    }
    pp.addEventListener('click', function () {
      playing = !playing;
      if (playing) { t0 = performance.now() - paused; if (api) api.hold(false); }
      else { paused = performance.now() - t0; if (api) api.hold(true); }
      setPP();
    });
    track.addEventListener('click', function (e) {
      var r = track.getBoundingClientRect(), k = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n)));
      t0 = performance.now() - k * dur; paused = k * dur;
      fill.style.width = (k / n * 100) + '%';
      shot(k);
    });
    shot(0);
    setPP();
    if (REDUCE) pp.hidden = true; else raf = requestAnimationFrame(tick);
    return { destroy: function () { cancelAnimationFrame(raf); if (!playing && api) api.hold(false); } };
  }

  /* ---------- Точки на модели: нажал — открылась карточка ---------- */
  function hotspots(L, o, api) {
    var pts = SPOTS[o.set] || [], touched = false, auto = 0;
    var w = h('div', 'vz-spots' + (o.kiosk ? ' is-kiosk' : ''));
    if (o.kiosk) w.appendChild(h('div', 'vz-kiosk', '<span>Сенсорный экран</span>'));
    var dots = pts.map(function (pt, i) {
      var b = h('button', 'vz-dot', '<i></i>');
      b.type = 'button';
      b.setAttribute('aria-label', pt.t);
      b.addEventListener('click', function () { touched = true; open(i); });
      w.appendChild(b);
      return b;
    });
    var card = h('div', 'vz-card', '<p class="vz-tag">Пример</p><b></b><span></span>');
    card.setAttribute('aria-live', 'polite');
    w.appendChild(card);
    L.appendChild(w);
    function open(i) {
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
      card.querySelector('b').textContent = pts[i].t;
      card.querySelector('span').textContent = pts[i].d;
      card.classList.add('is-on');
    }
    function update() {
      pts.forEach(function (pt, i) {
        var s = api.project(pt.p[0], pt.p[1], pt.p[2]), d = dots[i];
        d.style.visibility = s.on ? 'visible' : 'hidden';
        d.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px)';
      });
    }
    var off = api ? api.onFrame(update) : null;
    if (api) update();
    /* Показываем, как это работает: точки открываются по очереди, пока человек не нажмёт сам */
    if (REDUCE) open(0);
    else {
      var k = 0;
      auto = setTimeout(function step() { if (touched) return; open(k % pts.length); k++; auto = setTimeout(step, 2600); }, 900);
    }
    return { destroy: function () { if (off) off(); clearTimeout(auto); } };
  }

  /* ---------- Выбор этажа: подсветка на башне и список квартир ---------- */
  function floors(L, o, api) {
    var T = { x: 0.5, z: -4.5, w: 5.5, d: 5.5, n: 30, fh: 0.5 }, f = 12, auto = 0, touched = false;
    var w = h('div', 'vz-floors' + (o.site ? ' is-site' : ''),
      (o.site ? '<div class="vz-browser"><i></i><i></i><i></i><span>сайт вашего ЖК</span></div>' : '') +
      '<div class="vz-fpanel"><p class="vz-tag">Пример интерфейса</p>' +
      '<div class="vz-frow"><button type="button" class="vz-fb" data-d="-1" aria-label="Этаж ниже">' + I.down + '</button>' +
      '<p class="vz-fl" aria-live="polite"><span>Этаж</span><b></b></p>' +
      '<button type="button" class="vz-fb" data-d="1" aria-label="Этаж выше">' + I.up + '</button></div><ul class="vz-apts"></ul></div>');
    L.appendChild(w);
    var lab = w.querySelector('.vz-fl b'), list = w.querySelector('.vz-apts');
    function set(n) {
      f = Math.max(2, Math.min(T.n, n));
      lab.textContent = f;
      if (api) api.mark([{ x: T.x, z: T.z, w: T.w + 0.3, d: T.d + 0.3, y: (f - 1) * T.fh + T.fh / 2, h: T.fh * 0.9 }]);
      var rows = [['1 комната', 38 + f % 4], ['2 комнаты', 57 + f % 5], ['3 комнаты', 78 + f % 6]];
      list.innerHTML = rows.map(function (r, i) {
        var free = (f + i) % 3 !== 0;
        return '<li><span>' + r[0] + '</span><span>' + r[1] + ' м²</span><b class="' + (free ? 'is-free' : '') + '">' + (free ? 'Свободна' : 'Бронь') + '</b></li>';
      }).join('');
    }
    each(w.querySelectorAll('.vz-fb'), function (b) { b.addEventListener('click', function () { touched = true; set(f + +b.getAttribute('data-d')); }); });
    if (api) { api.look({ yaw: 0.35, elev: 0.04, zoom: 0.86 }); api.nudge(L.clientWidth >= 760 ? -0.06 : -0.2); }
    set(f);
    if (!REDUCE) auto = setInterval(function () { if (touched) { clearInterval(auto); return; } set(f >= 24 ? 6 : f + 3); }, 1500);
    return { destroy: function () { clearInterval(auto); if (api) { api.mark([]); api.nudge(0); } } };
  }

  /* ---------- Видоискатель камеры поверх сцены ---------- */
  function viewfinder(L, o, api) {
    var shots = o.shots || [], i = 0, timer = 0, raf = 0, t0 = performance.now(), off = null;
    var w = h('div', 'vz-vf' + (o.fx ? ' is-fx' : ''),
      (o.fx ? '<div class="vz-box3d"><span>3D</span></div>' : '') +
      '<div class="vz-frame"><span class="vz-c tl"></span><span class="vz-c tr"></span><span class="vz-c bl"></span><span class="vz-c br"></span><span class="vz-cross"></span>' +
      '<div class="vz-vtop"><span class="vz-rec"><i></i>REC</span><span class="vz-tc">00:00:00</span><span class="vz-fmt">4K 25p</span></div>' +
      '<div class="vz-vbot"><span>ISO 400</span><span>1/50</span><span>f/2.8</span><span class="vz-shot"></span></div></div>');
    L.appendChild(w);
    var tc = w.querySelector('.vz-tc'), shotEl = w.querySelector('.vz-shot'), box = w.querySelector('.vz-box3d');
    function shot(k) { if (!shots.length) return; i = k % shots.length; shotEl.textContent = shots[i][0]; if (api) api.look(shots[i][1]); }
    function tick(now) {
      var fr = Math.floor((now - t0) / 40), s = Math.floor(fr / 25);
      tc.textContent = pad(Math.floor(s / 60)) + ':' + pad(s % 60) + ':' + pad(fr % 25);
      raf = requestAnimationFrame(tick);
    }
    /* Рамка «3D» следует за объектом в кадре */
    if (box && api) {
      var C = [];
      [-2.3, 2.3].forEach(function (x) { [0, 8.2].forEach(function (y) { [-0.25, 0.25].forEach(function (z) { C.push([x, y, z]); }); }); });
      off = api.onFrame(function () {
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        C.forEach(function (c) { var p = api.project(c[0], c[1], c[2]); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        box.style.transform = 'translate(' + (x0 - 10).toFixed(1) + 'px,' + (y0 - 10).toFixed(1) + 'px)';
        box.style.width = (x1 - x0 + 20).toFixed(1) + 'px';
        box.style.height = (y1 - y0 + 20).toFixed(1) + 'px';
      });
    }
    shot(0);
    if (!REDUCE) { timer = setInterval(function () { shot(i + 1); }, 3200); raf = requestAnimationFrame(tick); }
    return { destroy: function () { clearInterval(timer); cancelAnimationFrame(raf); if (off) off(); } };
  }

  /* ---------- Страницы презентации ---------- */
  var LAYOUT = ['text', 'map', 'grid', 'chart', 'plan', 'chart', 'steps', 'text'];
  function pageArt(kind, i) {
    var s = '<svg viewBox="0 0 320 150" aria-hidden="true">';
    if (kind === 'map') {
      s += '<path class="a-l" d="M20 120 C70 100 90 130 140 112 S230 70 300 90"/><path class="a-l" d="M60 20 L90 140"/>' +
        '<path class="a-s" d="M150 40 L230 30 L250 95 L170 110 Z"/><path class="a-r" d="M200 62 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M200 68 L200 80"/>' +
        '<path class="a-l" d="M30 135 h40 M30 131 v8 M70 131 v8"/>';
    } else if (kind === 'chart') {
      var hs = i % 2 ? [30, 48, 62, 80, 96] : [70, 55, 82, 64, 100];
      hs.forEach(function (v, k) { s += '<rect class="a-b' + (k === hs.length - 1 ? ' a-rb' : '') + '" x="' + (40 + k * 52) + '" y="' + (130 - v) + '" width="28" height="' + v + '" style="animation-delay:' + (k * 0.06) + 's"/>'; });
      s += '<path class="a-l" d="M24 130 H300"/>';
    } else if (kind === 'grid') {
      [[20, 14], [168, 14], [20, 82], [168, 82]].forEach(function (p, k) {
        s += '<rect class="a-s" x="' + p[0] + '" y="' + p[1] + '" width="132" height="58" rx="2"/>' +
          '<path class="' + (k === 1 ? 'a-r' : 'a-l') + '" d="M' + (p[0] + 10) + ' ' + (p[1] + 48) + ' l30 -22 l20 14 l26 -26 l36 34"/>';
      });
    } else if (kind === 'plan') {
      s += '<rect class="a-s" x="40" y="16" width="240" height="120"/><path class="a-l" d="M140 16 V80 M140 100 V136 M40 76 H110 M200 76 H280 M200 76 V136"/>' +
        '<path class="a-r" d="M150 92 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0"/>';
    } else if (kind === 'steps') {
      s += '<path class="a-l" d="M30 75 H290"/>';
      [30, 117, 203, 290].forEach(function (x, k) { s += '<circle class="' + (k === 1 ? 'a-rf' : 'a-sf') + '" cx="' + x + '" cy="75" r="8"/><path class="a-l" d="M' + (x - 22) + ' ' + (k % 2 ? 108 : 40) + ' h44"/>'; });
    } else {
      s += '<path class="a-t" d="M20 30 H200 M20 50 H260 M20 70 H230 M20 90 H250"/><rect class="a-s" x="216" y="96" width="84" height="40"/><path class="a-r" d="M20 120 H120"/>';
    }
    return s + '</svg>';
  }
  function pages(L, o) {
    var P = o.pages, nums = o.nums || P.map(function (_, k) { return k + 1; }), total = nums[nums.length - 1], i = 0, timer = 0, touched = false;
    var w = h('div', 'vz-panel vz-pages',
      '<div class="vz-sheet" role="img" aria-label="Пример страниц презентации"><div class="vz-pg"></div></div>' +
      '<div class="vz-pnav"><button type="button" class="vz-pb" data-d="-1" aria-label="Предыдущая страница">' + I.left + '</button><p class="vz-pn" aria-live="polite"></p>' +
      '<button type="button" class="vz-pb" data-d="1" aria-label="Следующая страница">' + I.right + '</button></div>');
    L.appendChild(w);
    var pg = w.querySelector('.vz-pg'), pn = w.querySelector('.vz-pn');
    function show(k, dir) {
      i = (k + P.length) % P.length;
      var cover = i === 0;
      pg.className = 'vz-pg' + (cover ? ' is-cover' : '') + (dir < 0 ? ' is-back' : '');
      pg.innerHTML = cover
        ? '<div class="pg-cover"><span class="pg-k">Презентация для встречи</span><p class="pg-t">' + esc(P[0]) + '</p><span class="pg-line"></span></div>' +
          '<svg class="pg-land" viewBox="0 0 320 90" aria-hidden="true"><path class="a-l" d="M0 80 L60 40 L95 62 L150 18 L210 64 L250 44 L320 80"/><path class="a-r" d="M262 26 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0"/></svg>'
        : '<p class="pg-h"><span>' + pad(nums[i]) + '</span>' + esc(P[i]) + '</p>' + pageArt(LAYOUT[i % LAYOUT.length], i);
      void pg.offsetWidth;
      pg.classList.add('is-in');
      pn.textContent = pad(nums[i]) + ' / ' + total;
    }
    each(w.querySelectorAll('.vz-pb'), function (b) { b.addEventListener('click', function () { touched = true; var d = +b.getAttribute('data-d'); show(i + d, d); }); });
    w.querySelector('.vz-sheet').addEventListener('click', function () { touched = true; show(i + 1, 1); });
    show(0, 1);
    if (!REDUCE) timer = setInterval(function () { if (!touched) show(i + 1, 1); }, 2600);
    return { destroy: function () { clearInterval(timer); } };
  }

  /* ---------- Финмодель: сценарии пересчитывают график (цифры условные) ---------- */
  function chart(L) {
    var S = { low: [-6, -4.6, 0.4, 1.4, 2, 2.3, 2.5, 2.7], base: [-6, -4, 1.5, 2.5, 3, 3.4, 3.6, 3.8], high: [-6, -3.4, 2.6, 3.6, 4.2, 4.6, 4.9, 5.1] };
    var names = [['low', 'Осторожный'], ['base', 'Базовый'], ['high', 'Оптимистичный']];
    var X0 = 34, DX = 37, Z = 112, KB = 9, KL = 3.2, cur = S.base.map(function () { return 0; }), raf = 0;
    var svg = '<svg viewBox="0 0 340 220" aria-hidden="true"><path class="c-ax" d="M24 ' + Z + ' H330"/>';
    for (var k = 0; k < 8; k++) svg += '<rect class="c-b" x="' + (X0 + k * DX - 11) + '" width="22"/><text class="c-y" x="' + (X0 + k * DX) + '" y="212" text-anchor="middle">' + (k + 1) + '</text>';
    svg += '<path class="c-l" d=""/><circle class="c-p" r="5"/><text class="c-ax-t" x="330" y="200" text-anchor="end">годы</text></svg>';
    var w = h('div', 'vz-panel vz-chart',
      '<div class="vz-sw" role="group" aria-label="Сценарий"></div>' + svg +
      '<p class="vz-legend"><span class="lg-b"></span>Поток денег по годам<span class="lg-l"></span>Накопленный итог</p>');
    L.appendChild(w);
    var sw = w.querySelector('.vz-sw'), bars = w.querySelectorAll('.c-b'), line = w.querySelector('.c-l'), dot = w.querySelector('.c-p');
    var bs = names.map(function (n) {
      var b = h('button', 'vz-chip', n[1]);
      b.type = 'button';
      b.addEventListener('click', function () { pick(n[0]); });
      sw.appendChild(b);
      return b;
    });
    function draw(v) {
      var acc = 0, pts = [], cross = null;
      v.forEach(function (x, k) {
        var r = bars[k], hgt = Math.abs(x) * KB;
        r.setAttribute('y', (x >= 0 ? Z - hgt : Z).toFixed(1));
        r.setAttribute('height', hgt.toFixed(1));
        r.setAttribute('class', 'c-b' + (x < 0 ? ' is-neg' : ''));
        var prev = acc;
        acc += x;
        pts.push([X0 + k * DX, Z - acc * KL]);
        if (cross === null && prev < 0 && acc >= 0) { var t = -prev / x; cross = [X0 + (k - 1 + t) * DX, Z]; }
      });
      line.setAttribute('d', 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'));
      if (cross) { dot.setAttribute('cx', cross[0].toFixed(1)); dot.setAttribute('cy', cross[1]); dot.style.opacity = 1; } else dot.style.opacity = 0;
    }
    function pick(key) {
      bs.forEach(function (b, k) { var on = names[k][0] === key; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var from = cur.slice(), to = S[key], t0 = performance.now();
      cancelAnimationFrame(raf);
      if (REDUCE) { cur = to.slice(); draw(cur); return; }
      (function step(now) {
        var p = Math.min(1, (now - t0) / 550), e = 1 - Math.pow(1 - p, 3);
        cur = from.map(function (a, k) { return a + (to[k] - a) * e; });
        draw(cur);
        if (p < 1) raf = requestAnimationFrame(step);
      })(t0);
    }
    draw(cur);
    pick('base');
    return { destroy: function () { cancelAnimationFrame(raf); } };
  }

  /* ---------- 360°-панорама: тянешь — осматриваешься ---------- */
  function panoSVG(set) {
    var s = '<svg viewBox="0 0 1600 400" preserveAspectRatio="none" aria-hidden="true">', k, x;
    for (k = 0; k < 4; k++) {
      var x0 = k * 400, xm = x0 + 200, x1 = x0 + 400;
      s += '<path class="p-l" d="M' + x0 + ' 96 Q' + xm + ' 28 ' + x1 + ' 96"/><path class="p-l" d="M' + x0 + ' 300 Q' + xm + ' 372 ' + x1 + ' 300"/><path class="p-l" d="M' + x0 + ' 96 V300"/>';
    }
    if (set === 'factory') {
      for (x = 100; x < 1600; x += 200) s += '<path class="p-l" d="M' + (x - 6) + ' 70 V330 M' + (x + 6) + ' 70 V330"/>';
      s += '<path class="p-l" d="M0 118 H1600 M0 128 H1600"/><path class="p-l" d="M600 128 V196 M588 196 h24 M600 196 v18"/>';
      s += '<rect class="p-s" x="460" y="262" width="300" height="20"/>';
      for (x = 474; x < 760; x += 26) s += '<circle class="p-l" cx="' + x + '" cy="290" r="6"/>';
      [500, 580, 660].forEach(function (bx) { s += '<rect class="p-s" x="' + bx + '" y="236" width="40" height="26"/>'; });
      [[60, 'M60 210 h110 v80 h-110z M90 230 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0'], [860, 'M860 190 h150 v100 h-150z M900 220 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0 M960 210 h30 v20 h-30z'], [1040, 'M1040 220 h100 v70 h-100z']].forEach(function (m) { s += '<path class="p-s" d="' + m[1] + '"/>'; });
      for (x = 1230; x < 1560; x += 80) { s += '<rect class="p-s" x="' + x + '" y="150" width="64" height="140"/><path class="p-l" d="M' + x + ' 196 h64 M' + x + ' 242 h64"/>'; }
      s += '<path class="p-r" d="M0 338 H1600" stroke-dasharray="18 14"/>';
    } else {
      [40, 150, 260].forEach(function (wx) { s += '<rect class="p-s" x="' + wx + '" y="122" width="96" height="140"/><path class="p-l" d="M' + (wx + 48) + ' 122 V262 M' + wx + ' 192 h96"/>'; });
      s += '<rect class="p-s" x="520" y="238" width="160" height="56"/><path class="p-l" d="M510 238 h180"/><rect class="p-s" x="540" y="134" width="120" height="70"/><path class="p-r" d="M592 156 v26 l22 -13z"/>';
      s += '<rect class="p-s" x="930" y="262" width="140" height="34"/><path class="p-l" d="M960 262 V214 h30 V180 h26 V262 M990 214 h26 M960 238 h56"/>';
      [830, 1100].forEach(function (fx) { s += '<rect class="p-s" x="' + fx + '" y="140" width="70" height="90"/><path class="p-l" d="M' + (fx + 8) + ' 214 l18 -26 l14 12 l18 -30 l12 44"/>'; });
      s += '<path class="p-s" d="M1250 250 q0 -24 24 -24 h120 q24 0 24 24 v40 h-168z"/><path class="p-l" d="M1250 262 h168"/>';
      s += '<rect class="p-s" x="1470" y="150" width="70" height="150"/><circle class="p-l" cx="1528" cy="228" r="4"/>';
      s += '<path class="p-l" d="M1440 300 v-36 M1428 270 q12 -30 24 0 M1432 252 q8 -22 16 0"/>';
    }
    return s + '</svg>';
  }
  function pano(L, o) {
    var P = o.set === 'factory' ? [['Вход', 100], ['Линия', 600], ['Станки', 950], ['Склад', 1390]] : [['Окна', 200], ['Стойка', 600], ['Макет', 1000], ['Отдых', 1330]];
    var w = h('div', 'vz-panel vz-pano',
      '<div class="vz-pview"><div class="vz-strip">' + panoSVG(o.set) + panoSVG(o.set) + '</div><span class="vz-360">360°</span><p class="vz-ptip" aria-live="polite"></p></div>' +
      '<div class="vz-ppts" role="group" aria-label="Точки обзора"></div>');
    L.appendChild(w);
    var view = w.querySelector('.vz-pview'), strip = w.querySelector('.vz-strip'), tip = w.querySelector('.vz-ptip'), ptsBox = w.querySelector('.vz-ppts');
    var off = 120, W = 1, raf = 0, last = 0, idleUntil = 0, drag = null, tween = null;
    function size() { W = view.clientHeight * 4; strip.style.width = (W * 2) + 'px'; each(strip.children, function (s) { s.style.width = W + 'px'; s.style.height = '100%'; }); }
    function put() { off = ((off % W) + W) % W; strip.style.transform = 'translateX(' + (-off).toFixed(1) + 'px)'; }
    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      if (tween) { var p = Math.min(1, (now - tween.t0) / 700), e = 1 - Math.pow(1 - p, 3); off = tween.a + (tween.b - tween.a) * e; if (p >= 1) tween = null; }
      else if (!drag && now > idleUntil && !REDUCE) off += W / 1600 * 22 * dt;
      put();
      raf = requestAnimationFrame(frame);
    }
    function goTo(k) {
      var target = P[k][1] / 1600 * W - view.clientWidth / 2, d = ((target - off) % W + W * 1.5) % W - W / 2;
      tween = { a: off, b: off + d, t0: performance.now() };
      idleUntil = performance.now() + 5000;
      tip.textContent = 'Переход: ' + P[k][0];
      tip.classList.remove('is-in'); void tip.offsetWidth; tip.classList.add('is-in');
      each(ptsBox.children, function (b, j) { b.classList.toggle('is-on', j === k); });
      if (REDUCE) { off = tween.b; tween = null; put(); }
    }
    P.forEach(function (p, k) {
      var b = h('button', 'vz-chip', esc(p[0]));
      b.type = 'button';
      b.addEventListener('click', function () { goTo(k); });
      ptsBox.appendChild(b);
    });
    view.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, o: off }; tween = null; try { view.setPointerCapture(e.pointerId); } catch (er) { } view.classList.add('is-drag'); });
    view.addEventListener('pointermove', function (e) { if (!drag) return; off = drag.o - (e.clientX - drag.x); put(); });
    function end() { if (drag) { drag = null; idleUntil = performance.now() + 4000; view.classList.remove('is-drag'); } }
    view.addEventListener('pointerup', end);
    view.addEventListener('pointercancel', end);
    var ro = 'ResizeObserver' in window ? new ResizeObserver(function () { size(); put(); }) : null;
    if (ro) ro.observe(view);
    size(); put();
    raf = requestAnimationFrame(frame);
    return { destroy: function () { cancelAnimationFrame(raf); if (ro) ro.disconnect(); } };
  }

  /* ---------- План квартиры: нажал на комнату — «перешёл» в неё ---------- */
  var ROOMS = {
    hall: { n: 'Прихожая', in: 'в прихожей', c: [62, 196], r: [12, 150, 108, 88], look: -90 },
    living: { n: 'Гостиная', in: 'в гостиной', c: [104, 80], r: [12, 12, 198, 138], look: -60 },
    kitchen: { n: 'Кухня', in: 'на кухне', c: [282, 62], r: [210, 12, 138, 98], look: -20 },
    bedroom: { n: 'Спальня', in: 'в спальне', c: [282, 176], r: [210, 110, 138, 128], look: 30 },
    bath: { n: 'Санузел', in: 'в санузле', c: [166, 196], r: [120, 150, 90, 88], look: 0 }
  };
  var DOORS = { 'hall-living': [70, 150], 'living-kitchen': [210, 57], 'living-bedroom': [210, 130], 'hall-bath': [120, 190] };
  function door(a, b) { return DOORS[a + '-' + b] || DOORS[b + '-' + a]; }
  var NEXT = { hall: ['living', 'bath'], living: ['hall', 'kitchen', 'bedroom'], kitchen: ['living'], bedroom: ['living'], bath: ['hall'] };
  function route(a, b) {
    var prev = {}, q = [a], seen = {}; seen[a] = 1;
    while (q.length) { var x = q.shift(); if (x === b) break; NEXT[x].forEach(function (y) { if (!seen[y]) { seen[y] = 1; prev[y] = x; q.push(y); } }); }
    var path = [b]; while (path[0] !== a) path.unshift(prev[path[0]]);
    return path;
  }
  function plan(L) {
    var s = '<svg viewBox="0 0 360 250" class="vz-plan-svg">';
    s += '<path class="w-o" d="M12 12 H348 V238 H70 M30 238 H12 V12"/>';
    s += '<path class="w-i" d="M210 12 V40 M210 75 V115 M210 145 V238 M12 150 H50 M90 150 H210 M210 110 H348 M120 150 V175 M120 205 V238"/>';
    s += '<path class="w-win" d="M60 12 h90 M260 12 h60 M348 40 v50 M348 150 v60"/><path class="w-win2" d="M60 12 h90 M260 12 h60 M348 40 v50 M348 150 v60"/>';
    s += '<path class="f" d="M30 100 h96 v24 h-96z M30 100 v-8 h96 v8 M60 58 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M40 20 h80"/>';
    s += '<path class="f" d="M218 20 h120 v16 h-120z M322 36 v50 h16 v-50 M282 74 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0"/>';
    s += '<path class="f" d="M248 150 h80 v74 h-80z M254 156 h30 v16 h-30z M292 156 h30 v16 h-30z M220 120 h20 v60 h-20z"/>';
    s += '<path class="f" d="M126 156 h78 v30 h-78z M166 228 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M18 160 h14 v60 h-14z"/>';
    Object.keys(ROOMS).forEach(function (k) {
      var r = ROOMS[k];
      s += '<rect class="r-hit" data-room="' + k + '" x="' + r.r[0] + '" y="' + r.r[1] + '" width="' + r.r[2] + '" height="' + r.r[3] + '"/>';
      s += '<text class="r-t" x="' + (r.r[0] + r.r[2] / 2) + '" y="' + (r.r[1] + r.r[3] - 8) + '" text-anchor="middle">' + r.n + '</text>';
    });
    s += '<g class="pv"><path class="pv-cone" d="M0 0 L58 -30 A66 66 0 0 1 58 30 Z"/><circle class="pv-dot" r="6"/></g></svg>';
    var w = h('div', 'vz-panel vz-plan', '<p class="vz-where" aria-live="polite"></p>' + s +
      '<div class="vz-rooms" role="group" aria-label="Комнаты"></div>');
    L.appendChild(w);
    var pv = w.querySelector('.pv'), where = w.querySelector('.vz-where'), rooms = w.querySelector('.vz-rooms');
    var at = 'hall', pos = ROOMS.hall.c.slice(), ang = ROOMS.hall.look, raf = 0, timer = 0, touched = false, moving = null;
    function put() { pv.setAttribute('transform', 'translate(' + pos[0].toFixed(1) + ' ' + pos[1].toFixed(1) + ') rotate(' + ang.toFixed(1) + ')'); }
    function label() {
      where.textContent = 'Вы ' + ROOMS[at].in;
      each(rooms.children, function (b) { b.classList.toggle('is-on', b.getAttribute('data-room') === at); });
    }
    function walk(to) {
      if (to === at || moving) return;
      var r = route(at, to), pts = [pos.slice()];
      for (var k = 1; k < r.length; k++) { pts.push(door(r[k - 1], r[k])); pts.push(ROOMS[r[k]].c); }
      at = to;
      label();
      if (REDUCE) { pos = ROOMS[to].c.slice(); ang = ROOMS[to].look; put(); return; }
      var segs = [], total = 0;
      for (var j = 1; j < pts.length; j++) { var L2 = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); segs.push([pts[j - 1], pts[j], L2]); total += L2; }
      moving = { segs: segs, total: total, t0: performance.now(), end: ROOMS[to].look };
      raf = requestAnimationFrame(step);
    }
    function step(now) {
      var m = moving, d = (now - m.t0) / 1000 * 150;
      if (d >= m.total) {
        pos = m.segs[m.segs.length - 1][1].slice();
        var turn = ((m.end - ang + 540) % 360) - 180;
        ang += turn * 0.25;
        put();
        if (Math.abs(turn) > 1) { raf = requestAnimationFrame(step); return; }
        ang = m.end; put(); moving = null; return;
      }
      for (var k = 0; k < m.segs.length; k++) {
        var sg = m.segs[k];
        if (d <= sg[2]) {
          var t = sg[2] ? d / sg[2] : 1;
          pos = [sg[0][0] + (sg[1][0] - sg[0][0]) * t, sg[0][1] + (sg[1][1] - sg[0][1]) * t];
          var target = Math.atan2(sg[1][1] - sg[0][1], sg[1][0] - sg[0][0]) * 180 / Math.PI, dA = ((target - ang + 540) % 360) - 180;
          ang += dA * 0.2;
          break;
        }
        d -= sg[2];
      }
      put();
      raf = requestAnimationFrame(step);
    }
    Object.keys(ROOMS).forEach(function (k) {
      var b = h('button', 'vz-chip', ROOMS[k].n);
      b.type = 'button';
      b.setAttribute('data-room', k);
      b.addEventListener('click', function () { touched = true; walk(k); });
      rooms.appendChild(b);
    });
    w.querySelector('svg').addEventListener('click', function (e) { var r = e.target.closest('[data-room]'); if (r) { touched = true; walk(r.getAttribute('data-room')); } });
    put(); label();
    var tour = ['living', 'kitchen', 'living', 'bedroom', 'living', 'hall', 'bath', 'hall'], ti = 0;
    if (!REDUCE) timer = setInterval(function () { if (touched) { clearInterval(timer); return; } walk(tour[ti++ % tour.length]); }, 2300);
    return { destroy: function () { clearInterval(timer); cancelAnimationFrame(raf); } };
  }

  /* ---------- Ролик в телефоне: кадры как в Reels ---------- */
  var ART = {
    product: '<path class="a-l" d="M70 220 h40 l6 -110 h-52z M76 110 v-20 h28 v20 M84 90 v-10 h12 v10"/><path class="a-l" d="M40 236 h100"/><path class="a-r" d="M40 120 l-18 -8 M140 120 l18 -8 M90 60 v-18 M50 80 l-12 -12 M130 80 l12 -12"/>',
    process: '<path class="a-l" d="M90 160 m-34 0 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0 M90 160 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M90 116 v-12 M90 216 v-12 M46 160 h-12 M146 160 h-12"/><path class="a-r" d="M40 232 q50 30 100 0 l-10 -4 M140 232 l-2 -10"/>',
    place: '<path class="a-l" d="M30 240 V130 h120 V240 M30 130 l10 -24 h100 l10 24 M60 240 v-60 h30 v60 M104 176 h30 v28 h-30z"/><path class="a-r" d="M138 70 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0"/><path class="a-l" d="M20 240 h140"/>',
    cta: '<path class="a-l" d="M36 110 h108 q12 0 12 12 v60 q0 12 -12 12 h-60 l-26 22 v-22 h-22 q-12 0 -12 -12 v-60 q0 -12 12 -12z"/><path class="a-r" d="M62 150 h56 M62 168 h36"/>',
    face: '<path class="a-l" d="M90 140 m-40 0 a40 46 0 1 0 80 0 a40 46 0 1 0 -80 0 M74 136 v4 M106 136 v4 M76 160 q14 12 28 0 M40 250 q0 -50 50 -58 q50 8 50 58"/><path class="a-r" d="M142 76 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z M32 100 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/>',
    photo: '<path class="a-l" d="M30 100 h120 v110 h-120z M40 196 l30 -40 l20 22 l22 -34 l28 52z"/><path class="a-r" d="M120 124 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M22 230 h40 M118 86 h40"/>',
    scene: '<path class="a-l" d="M0 70 h180 M0 250 h180 M0 210 l40 -36 l26 20 l40 -46 l34 30 l40 -26 v58z"/><path class="a-r" d="M128 120 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0"/><path class="a-l" d="M40 110 q6 -6 12 0 q6 -6 12 0 M70 96 q5 -5 10 0 q5 -5 10 0"/>',
    gift: '<path class="a-l" d="M44 150 h92 v84 h-92z M38 126 h104 v24 h-104z M90 126 v108 M90 126 q-30 -36 -40 -10 q-4 14 40 10 q30 -36 40 -10 q4 14 -40 10"/><path class="a-r" d="M30 92 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z M150 200 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/>'
  };
  function phone(L, o) {
    var F = o.set === 'ai'
      ? [['Виртуальный персонаж', 'face'], ['Оживлённое фото', 'photo'], ['Кинематографичная сцена', 'scene'], ['Показ продукта', 'gift']]
      : [['Ваш продукт', 'product'], ['Как это работает', 'process'], ['Ваше место', 'place'], ['Напишите нам', 'cta']];
    var dur = 2400, i = 0, timer = 0;
    var bars = F.map(function () { return '<span><i></i></span>'; }).join('');
    var w = h('div', 'vz-panel vz-phwrap',
      '<div class="vz-phone' + (o.set === 'ai' ? ' is-ai' : '') + '" role="img" aria-label="Пример ролика 9:16"><div class="vz-pbars">' + bars + '</div>' +
      '<svg class="vz-art" viewBox="0 0 180 320" aria-hidden="true"></svg>' +
      (o.set === 'ai' ? '<span class="vz-ai">AI</span>' : '') +
      '<div class="vz-side" aria-hidden="true"><i></i><i></i><i></i></div><p class="vz-pcap"></p></div>');
    L.appendChild(w);
    var art = w.querySelector('.vz-art'), cap = w.querySelector('.vz-pcap'), bs = w.querySelectorAll('.vz-pbars span'), ph = w.querySelector('.vz-phone');
    function show(k) {
      i = (k + F.length) % F.length;
      art.innerHTML = ART[F[i][1]];
      art.classList.remove('is-in'); void art.getBoundingClientRect(); art.classList.add('is-in');
      cap.textContent = F[i][0];
      each(bs, function (b, j) { b.className = j < i ? 'is-done' : j === i ? 'is-now' : ''; });
    }
    ph.style.setProperty('--dur', dur + 'ms');
    ph.addEventListener('click', function () { clearInterval(timer); show(i + 1); if (!REDUCE) timer = setInterval(function () { show(i + 1); }, dur); });
    show(0);
    if (!REDUCE) timer = setInterval(function () { show(i + 1); }, dur);
    return { destroy: function () { clearInterval(timer); } };
  }

  /* Реальные работы: кадры сменяются сами, по нажатию — следующий */
  function photos(L, o) {
    var P = o.items || [], i = 0, timer = 0, dur = 4200;
    var w = h('div', 'vz-panel vz-photos',
      '<figure class="vz-photo" aria-label="Работы студии">' +
      P.map(function (p, k) { return '<img src="' + esc(p[0]) + '" alt="' + esc(p[1]) + '"' + (k ? ' loading="lazy"' : '') + '>'; }).join('') +
      '</figure><p class="vz-phcap"><span></span><span class="vz-phdots" aria-hidden="true">' + P.map(function () { return '<i></i>'; }).join('') + '</span></p>');
    L.appendChild(w);
    var imgs = w.querySelectorAll('.vz-photo img'), cap = w.querySelector('.vz-phcap span'), dots = w.querySelectorAll('.vz-phdots i');
    function show(k) {
      i = (k + P.length) % P.length;
      each(imgs, function (im, j) { im.classList.toggle('is-on', j === i); });
      each(dots, function (d, j) { d.classList.toggle('is-on', j === i); });
      cap.textContent = P[i] ? P[i][1] : '';
    }
    function run() { clearInterval(timer); if (!REDUCE && P.length > 1) timer = setInterval(function () { show(i + 1); }, dur); }
    w.querySelector('.vz-photo').addEventListener('click', function () { show(i + 1); run(); });
    show(0);
    run();
    return { destroy: function () { clearInterval(timer); } };
  }

  var MODES = { views: views, video: video, hotspots: hotspots, floors: floors, viewfinder: viewfinder, pages: pages, chart: chart, pano: pano, plan: plan, phone: phone, photos: photos };
  window.SevenViz = {
    flat: function (mode) { return !!FLAT[mode]; },
    make: function (viz, layer, api) {
      var fn = MODES[viz && viz.mode];
      if (!fn || !layer) return { destroy: function () { } };
      var r = fn(layer, viz, api) || {};
      return { destroy: r.destroy || function () { } };
    }
  };
})();
