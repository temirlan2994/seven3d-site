/* SEVEN 3D — поведение сайта: меню, 3D-сцены, вкладки, галереи, счётчики, шаги, заявка в WhatsApp. */
(function () {
  'use strict';
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_IO = 'IntersectionObserver' in window;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function track(name, data) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, data || {})); } catch (e) { } }
  var page = $('.page');
  var wide = function () { return (page ? page.clientWidth : window.innerWidth) >= 1000; };

  /* Меню */
  var burger = $('.burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
      menu.hidden = !open;
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Меню'); menu.hidden = true; } });
  }

  /* Шапка закреплена на всей странице главной: текущий раздел подсвечен, по нижнему краю — линия прокрутки.
     Телефон: в шапке «02 / 09 · Недвижимость»; тап по строке открывает меню — карту страницы. */
  var topEl = $('[data-top]');
  if (topEl) {
    var spyLinks = $$('[data-spy]', topEl), progI = $('.top-prog i', topEl), where = $('.top-where', topEl);
    var spyIds = [], spyHas = {};
    spyLinks.forEach(function (a) { var id = a.getAttribute('data-spy'); if (!spyHas[id]) { spyHas[id] = 1; spyIds.push(id); } });
    var spyNames = { 'd-invest': 'Инвестиции', 'd-estate': 'Недвижимость', 'd-industry': 'Презентация', 'd-ads': 'Реклама', process: 'Как работаем', works: 'Работы', about: 'О студии', faq: 'Вопросы', brief: 'Заявка' };
    /* у секций целей якорь — пустой span в начале секции; меряем саму секцию */
    var spySecs = spyIds.map(function (id) { var el = document.getElementById(id); return el && el.classList.contains('anc') ? el.parentNode : el; });
    var spyOn, spyRaf = 0;
    var spy = function () {
      spyRaf = 0;
      var vh = window.innerHeight, th = topEl.offsetHeight, line = th + (vh - th) * 0.3, cur = -1, de = document.documentElement;
      spySecs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) cur = i; });
      var p = Math.min(1, Math.max(0, (window.pageYOffset || de.scrollTop) / Math.max(1, de.scrollHeight - vh)));
      if (progI) progI.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      var id = cur >= 0 ? spyIds[cur] : null;
      if (id === spyOn) return;
      spyOn = id;
      spyLinks.forEach(function (a) {
        var on = a.getAttribute('data-spy') === id;
        a.classList.toggle('is-on', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
      topEl.classList.toggle('is-deep', !!id);
      if (where) {
        where.hidden = !id;
        if (id) {
          $('.top-where-n', where).textContent = '0' + (cur + 1) + ' / 0' + spyIds.length;
          $('.top-where-t', where).textContent = spyNames[id] || '';
          where.setAttribute('aria-label', 'Раздел ' + (cur + 1) + ' из ' + spyIds.length + ': ' + (spyNames[id] || '') + '. Открыть карту страницы');
        }
      }
    };
    window.addEventListener('scroll', function () { if (!spyRaf) spyRaf = requestAnimationFrame(spy); }, { passive: true });
    window.addEventListener('resize', spy);
    window.addEventListener('load', spy);
    spy();
    if (where && burger) {
      where.addEventListener('click', function () { burger.click(); where.setAttribute('aria-expanded', burger.getAttribute('aria-expanded')); });
      if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) where.setAttribute('aria-expanded', 'false'); });
    }
  }

  /* Плашка пакета в начале секции цели: шаг маршрута при наведении обводит карточку этой услуги ниже,
     по клику страница (на телефоне — карусель) подъезжает к ней. Шаги «только в пакете» не нажимаются. */
  $$('.dpack').forEach(function (pk) {
    var sec = pk.closest('.dsec');
    var cardOf = function (a) { var k = a && a.getAttribute('data-to'); return k && sec ? $('.gal [data-deck="' + k + '"], .gal [data-card="' + k + '"]', sec) : null; };
    var point = function (c, on) { if (c) c.classList.toggle('is-pointed', on); };
    pk.addEventListener('pointerover', function (e) { if (e.pointerType === 'mouse') point(cardOf(e.target.closest('[data-to]')), true); });
    pk.addEventListener('pointerout', function (e) { if (e.pointerType === 'mouse') point(cardOf(e.target.closest('[data-to]')), false); });
    pk.addEventListener('click', function (e) {
      var a = e.target.closest('[data-to]'), c = cardOf(a);
      if (!a) return;
      e.preventDefault();
      if (!c) return;
      c.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center', inline: 'center' });
      c.classList.remove('is-pointed'); void c.offsetWidth; c.classList.add('is-pointed');
      setTimeout(function () { c.classList.remove('is-pointed'); }, 3400);
    });
  });

  /* Копирование номера и почты */
  function selectText(el) { try { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) { } }
  function copyText(text, btn, fallbackEl, okLabel, failLabel) {
    var base = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', base);
    function done(ok) {
      btn.textContent = ok ? (okLabel || 'Скопировано') : (failLabel || 'Выделите и скопируйте');
      btn.classList.add('is-done');
      if (!ok && fallbackEl) selectText(fallbackEl);
      setTimeout(function () { btn.textContent = base; btn.classList.remove('is-done'); }, 2400);
    }
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    copyText(b.getAttribute('data-copy'), b, b.previousElementSibling);
    track('copy_contact');
  });

  /* 3D-сцены */
  var pageStages = [];
  $$('[data-stage]').forEach(function (st) {
    if (!window.Seven3D) return;
    var preset = st.getAttribute('data-stage');
    var hero = st.classList.contains('stage-hero');
    var steps = $$('.stage-steps li', st);
    var api = window.Seven3D.mount(st, preset, {
      shift: function (w) { return hero && wide() ? 0.2 : 0; },
      zoom: function () { return hero ? (wide() ? 1.08 : 0.9) : 0.9; },
      onStage: function (i) {
        steps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); li.classList.toggle('is-done', k < i); });
        st.classList.toggle('is-done', i === 2);
      }
    });
    if (api) pageStages.push(api);
    var rb = $('.stage-replay', st);
    if (api && rb) {
      if (api.reduce) rb.hidden = true;
      rb.addEventListener('click', function () { st.classList.remove('is-done'); api.replay(); track('stage_replay', { preset: preset }); });
    }
  });

  /* Вкладки направлений на главной: красная полоска едет за прокруткой.
     Положение считается прямо из прокрутки (без наблюдателей и задержек): внутри блока полоска стоит под его вкладкой,
     на границе блоков плавно переезжает к следующей, а полоса вкладок сдвигается, чтобы текущая была видна. */
  var tabsList = $('[data-tabs]');
  var dsecs = $$('[data-dsec]');
  if (tabsList && dsecs.length) {
    var tabs = $$('.dtab', tabsList), tabsBar = $('.dtabs'), zone = $('.dzone');
    var ink = document.createElement('i');
    ink.className = 'dtabs-ink';
    ink.setAttribute('aria-hidden', 'true');
    tabsList.appendChild(ink);
    tabsList.classList.add('has-ink');
    var tops = [], tabX = [], tabW = [], onTab = -1, inkRaf = 0, lastX = -1, lastW = -1, maxScroll = 0;
    var ease = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
    var measureTabs = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      tops = dsecs.map(function (sec) { return sec.getBoundingClientRect().top + y; });
      tabX = tabs.map(function (t) { return t.offsetLeft; });
      tabW = tabs.map(function (t) { return t.offsetWidth; });
      maxScroll = Math.max(0, tabsList.scrollWidth - tabsList.clientWidth);
      lastX = -1;
      updateInk();
      tabEdges();
    };
    /* если вкладки не влезают, край, за которым есть ещё, гаснет */
    var tabEdges = function () {
      var m = tabsList.scrollWidth - tabsList.clientWidth;
      tabsList.classList.toggle('is-more-l', m > 2 && tabsList.scrollLeft > 2);
      tabsList.classList.toggle('is-more-r', m > 2 && tabsList.scrollLeft < m - 2);
    };
    tabsList.addEventListener('scroll', tabEdges, { passive: true });
    var updateInk = function () {
      inkRaf = 0;
      var vh = window.innerHeight, barH = tabsBar ? tabsBar.offsetHeight : 0;
      /* «Линия чтения» — чуть ниже полосы вкладок; блок, который её пересекает, и есть текущий */
      var line = (window.pageYOffset || document.documentElement.scrollTop) + barH + (vh - barH) * 0.28;
      var win = Math.min(220, vh * 0.24), pos = 0;
      for (var j = 1; j < tops.length; j++) pos += ease((line - tops[j] + win / 2) / win);
      var a = Math.floor(pos), b = Math.min(tabs.length - 1, a + 1), f = pos - a;
      var x = tabX[a] + (tabX[b] - tabX[a]) * f, w = tabW[a] + (tabW[b] - tabW[a]) * f;
      if (Math.abs(x - lastX) > 0.2 || Math.abs(w - lastW) > 0.2) {
        ink.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
        ink.style.width = w.toFixed(1) + 'px';
        lastX = x; lastW = w;
        if (maxScroll > 1) tabsList.scrollLeft = Math.max(0, Math.min(maxScroll, x + w / 2 - tabsList.clientWidth / 2));
      }
      var k = Math.round(pos);
      if (k !== onTab) {
        onTab = k;
        tabs.forEach(function (t, i) {
          t.classList.toggle('is-on', i === k);
          if (i === k) t.setAttribute('aria-current', 'location'); else t.removeAttribute('aria-current');
        });
      }
    };
    window.addEventListener('scroll', function () { if (!inkRaf) inkRaf = requestAnimationFrame(updateInk); }, { passive: true });
    window.addEventListener('resize', measureTabs);
    window.addEventListener('load', measureTabs);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureTabs);
    if ('ResizeObserver' in window && zone) new ResizeObserver(function () { measureTabs(); }).observe(zone);
    measureTabs();
  }

  /* Галереи: индикатор «где я» и въезд при появлении */
  $$('[data-gal]').forEach(function (g) {
    var bars = $$('.bars i', g.parentNode);
    if (bars.length) {
      var raf = 0;
      g.addEventListener('scroll', function () {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var card = g.querySelector('.gcard');
          var w = card ? card.getBoundingClientRect().width + 12 : 292;
          var i = Math.max(0, Math.min(bars.length - 1, Math.round(g.scrollLeft / w)));
          bars.forEach(function (b, k) { b.classList.toggle('is-on', k === i); });
        });
      }, { passive: true });
    }
  });
  function onEnterOnce(els, fn, margin) {
    if (!HAS_IO || REDUCE) return;
    var first = true;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (first && en.isIntersecting && en.boundingClientRect.top < window.innerHeight * 0.9) { io.unobserve(en.target); return; }
        if (en.isIntersecting) { io.unobserve(en.target); fn(en.target); }
      });
      first = false;
    }, { rootMargin: margin || '0px 0px 12% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  onEnterOnce($$('[data-gal]'), function (g) { g.classList.add('is-in'); });

  /* Счётчики: считают, только если появились при прокрутке */
  function countUp(el) {
    var raw = el.getAttribute('data-count'), m = raw.match(/^(\d+)(.*)$/);
    if (!m) return;
    var target = +m[1], suffix = m[2], t0 = 0, dur = 1300;
    function step(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * k) + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  onEnterOnce($$('[data-count]'), countUp, '0px 0px -8% 0px');

  /* Этапы работы загораются по мере прокрутки */
  var stepsList = $('[data-steps]');
  if (stepsList && !REDUCE) {
    var lis = $$('li', stepsList), sraf = 0;
    var upd = function () {
      sraf = 0;
      var r = stepsList.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var line = vh * 0.62, now = -1;
      lis.forEach(function (li, i) { if (li.getBoundingClientRect().top < line) now = i; });
      lis.forEach(function (li, i) { li.classList.toggle('is-past', i < now); li.classList.toggle('is-now', i === now); });
    };
    window.addEventListener('scroll', function () { if (!sraf) sraf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  /* Страница направления: переключатель и «кому показываете» */
  var swBtn = $('.sw-btn'), swList = $('#swlist');
  if (swBtn && swList) {
    var setSw = function (open) { swBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); swList.hidden = !open; };
    swBtn.addEventListener('click', function (e) { e.stopPropagation(); setSw(swList.hidden); });
    document.addEventListener('click', function (e) { if (!swList.hidden && !e.target.closest('.sw')) setSw(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !swList.hidden) { setSw(false); swBtn.focus(); } });
  }
  var aud = $('[data-aud]');
  if (aud) {
    aud.addEventListener('click', function (e) {
      var b = e.target.closest('[data-aud-btn]');
      if (!b) return;
      var id = b.getAttribute('data-aud-btn');
      $$('[data-aud-btn]', aud).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      $$('[data-aud-card]').forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-aud-card') === id); });
    });
  }

  /* Нижняя панель на телефоне: не мешает первому экрану и заявке */
  var bar = $('[data-mbar]'), heroEl = $('[data-hero]'), briefSec = $('[data-brief-sec]');
  if (bar && HAS_IO) {
    var heroIn = !!heroEl && $('.hero') !== null, briefIn = false;
    var isHome = !!$('.hero');
    var sync = function () { bar.classList.toggle('is-off', (isHome && heroIn) || briefIn); };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.target === heroEl) heroIn = en.isIntersecting; if (en.target === briefSec) briefIn = en.isIntersecting; });
      sync();
    });
    if (heroEl && isHome) bio.observe(heroEl);
    if (briefSec) bio.observe(briefSec);
    sync();
  }

  /* Работы: обложки YouTube (если крупной нет — берём обычную) и ролик прямо на сайте.
     На claude.ai встроить YouTube нельзя — там карточка просто ведёт на YouTube. */
  var BUILD = page ? page.getAttribute('data-build') : 'site';
  $$('img[data-yt-thumb]').forEach(function (im) {
    var low = 'https://i.ytimg.com/vi/' + im.getAttribute('data-yt-thumb') + '/hqdefault.jpg', used = false;
    function fallback() { if (!used) { used = true; im.src = low; } }
    im.addEventListener('error', fallback);
    im.addEventListener('load', function () { if (im.naturalWidth && im.naturalWidth <= 120) fallback(); });
    if (im.complete && im.naturalWidth && im.naturalWidth <= 120) fallback();
  });
  /* Было → стало: линию двигают пальцем, мышью или стрелками */
  $$('[data-ba]').forEach(function (el) {
    var r = $('.ba-range', el);
    if (!r) return;
    function set() { el.style.setProperty('--x', r.value + '%'); }
    r.addEventListener('input', set);
    set();
  });

  /* ---------- Бриф: свои вопросы для каждой услуги, следующие вопросы зависят от ответов → сообщение в WhatsApp ---------- */
  var B = window.SEVEN_BRIEF;
  var DECKS = window.SEVEN_DECKS || {};
  /* Услуга для брифа: из презентации или, если презентации нет (новые услуги), из SEVEN_BRIEF.extra */
  function SVC(id) { return DECKS[id] || (B && B.extra && B.extra[id]) || null; }
  var ICO = {
    arrow: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
    wa: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z"></path></svg>',
    check: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>',
    turn: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"></path></svg>',
    close: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
    play: '<svg class="ico ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"></path></svg>'
  };
  function label(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return list[i][1]; return ''; }
  function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; }
  function focusEl(el) { if (!el) return; try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }

  /* cfg: id — префикс полей; deck — презентация (услуга известна); goal — направление страницы; source — откуда заявка */
  function makeBrief(root, cfg) {
    var fixedSvc = !!cfg.deck, fixedGoal = fixedSvc || !!cfg.goal;
    var st = { goal: fixedSvc ? DECKS[cfg.deck].dir : (cfg.goal || null), svc: cfg.deck || null, ans: {}, f: {}, i: 0 };
    function questions() {
      if (st.svc && SVC(st.svc)) return SVC(st.svc).brief;
      if (st.svc === 'unknown' || st.goal === 'unknown') return B.generic[st.goal && st.goal !== 'unknown' ? st.goal : 'unknown'] || [];
      /* Услуга ещё не выбрана: считаем по обычной длине брифа, чтобы «осталось N» не росло после выбора */
      return [null, null, null, null, null];
    }
    function steps() {
      var f = [];
      if (!fixedGoal) f.push({ k: 'goal' });
      if (!fixedSvc && st.goal !== 'unknown') f.push({ k: 'svc' });
      questions().forEach(function (q) { f.push({ k: 'q', q: q }); });
      f.push({ k: 'q', q: B.when });
      f.push({ k: 'final' });
      return f;
    }
    function indexOf(k) { var f = steps(); for (var i = 0; i < f.length; i++) if (f[i].k === k) return i; return 0; }
    /* Вопрос-ветка: вариант выбирается по ответу на вопрос-родитель */
    function resolve(q) {
      if (!q.by) return q;
      var pa = st.ans[q.by], key = Array.isArray(pa) ? pa[0] : pa;
      return q.vars[key] || q.vars['*'] || q.vars[Object.keys(q.vars)[0]];
    }
    function fields() { return B.fields[st.goal === 'ads' ? 'ads' : 'default']; }
    /* Название услуги — из списка брифа (единые названия сайта), иначе из презентации */
    function svcName(v) {
      if (v === 'unknown') return 'Пока не знаю';
      var L = B.services && SVC(v) && B.services[SVC(v).dir];
      for (var j = 0; L && j < L.length; j++) if (L[j][0] === v) return L[j][1];
      return SVC(v) ? SVC(v).service : v;
    }
    function message() {
      var fl = fields();
      var L = [cfg.deck ? 'Здравствуйте. Пишу с сайта SEVEN 3D после презентации «' + svcName(cfg.deck) + '».' : 'Здравствуйте. Пишу с сайта SEVEN 3D.'];
      if ((st.f.name || '').trim()) L.push(fl[0][3] + ' ' + st.f.name.trim() + '.');
      if (st.goal && st.goal !== 'unknown') L.push('Задача: ' + label(B.goals, st.goal) + '.');
      if (!cfg.deck && st.svc && st.svc !== 'unknown') L.push('Услуга: ' + svcName(st.svc) + '.');
      steps().forEach(function (s) {
        if (s.k !== 'q' || !s.q) return;
        var q = resolve(s.q), a = st.ans[s.q.id];
        if (!q || a == null) return;
        var labs = (Array.isArray(a) ? a : [a]).map(function (v) { return label(q.opts, v); }).filter(Boolean);
        if (labs.length) L.push(q.m + ': ' + labs.join(', ') + '.');
      });
      if ((st.f.place || '').trim()) L.push(fl[1][3] + ': ' + st.f.place.trim() + '.');
      return L.join('\n');
    }
    function waHref() { return 'https://wa.me/' + B.phone + '?text=' + encodeURIComponent(message()); }
    function optsHTML(opts, cur, multi) {
      return '<div class="bf-opts' + (multi ? ' is-multi' : '') + '">' + opts.map(function (o) {
        var on = multi ? (cur || []).indexOf(o[0]) >= 0 : cur === o[0];
        return '<button class="opt' + (multi ? ' opt-m' : '') + (on ? ' is-on' : '') + '" type="button" aria-pressed="' + on + '" data-act="' + (multi ? 'tog' : 'pick') + '" data-v="' + esc(o[0]) + '">' +
          (multi ? '<span class="opt-box" aria-hidden="true">' + ICO.check + '</span>' : '') + '<span class="opt-l">' + esc(o[1]) + '</span>' + (multi ? '' : ICO.arrow) + '</button>';
      }).join('') + '</div>';
    }
    function head(t) { return '<h3 class="bf-h" tabindex="-1">' + esc(t) + '</h3>'; }
    function ctxRow(k, v, edit) { return '<div class="bf-ctx-row"><span class="k">' + k + '</span><b>' + esc(v) + '</b>' + (edit ? '<button class="bf-link" type="button" data-act="edit" data-v="' + edit + '">Изменить</button>' : '') + '</div>'; }
    function render(focus) {
      var f = steps(), n = f.length;
      if (st.i > n - 1) st.i = n - 1;
      var s = f[st.i], h = '', qTotal = n - 1, left = qTotal - st.i;
      /* Полоса брифа: сколько осталось до готового сообщения */
      var pct = Math.round(Math.min(st.i, qTotal) / qTotal * 100);
      var txt = s.k === 'final' ? 'Готово — проверьте сообщение' : left === 1 ? 'Последний вопрос' : 'Осталось ' + left + ' ' + plural(left, 'вопрос', 'вопроса', 'вопросов');
      h += '<div class="bf-prog"><div class="bf-track" role="progressbar" aria-label="Бриф заполнен" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
        '<p class="bf-left" aria-live="polite"><span>' + txt + '</span><span class="bf-num">' + (s.k === 'final' ? qTotal : st.i + 1) + ' / ' + qTotal + '</span></p></div>';
      if (!cfg.deck && st.goal && s.k !== 'goal' && (st.goal !== 'unknown' || s.k !== 'svc')) {
        h += '<div class="bf-ctx">' + (st.goal !== 'unknown' ? ctxRow('Задача', label(B.goals, st.goal), fixedGoal ? '' : 'goal') : ctxRow('Задача', 'Пока не знаю', 'goal'));
        if (st.svc && s.k !== 'svc') h += ctxRow('Услуга', svcName(st.svc), 'svc');
        h += '</div>';
      }
      h += '<div class="bf-step">';
      if (s.k === 'goal') h += head('Что нужно сделать?') + optsHTML(B.goals, st.goal, false);
      else if (s.k === 'svc') h += head('Какая услуга нужна?') + optsHTML((B.services[st.goal] || []).concat([['unknown', 'Пока не знаю']]), st.svc, false);
      else if (s.k === 'q') {
        var q = resolve(s.q), multi = q.type === 'many', cur = st.ans[s.q.id];
        h += head(q.q) + optsHTML(q.opts, cur, multi);
        if (multi) h += '<div class="bf-next"><button class="btn btn-w" type="button" data-act="next"' + (cur && cur.length ? '' : ' disabled') + '>Дальше' + ICO.arrow + '</button><p class="small">' + esc(q.hint || 'Можно выбрать несколько') + '</p></div>';
        else if (q.hint) h += '<p class="small">' + esc(q.hint) + '</p>';
      } else {
        h += head('Сообщение готово');
        fields().forEach(function (fd) {
          h += '<div class="bf-field"><label class="bf-label" for="' + cfg.id + '-' + fd[0] + '">' + esc(fd[1]) + '</label><input class="bf-in" id="' + cfg.id + '-' + fd[0] + '" data-f="' + fd[0] + '" type="text" autocomplete="' + (fd[0] === 'name' ? 'name' : 'off') + '" placeholder="' + esc(fd[2]) + '" value="' + esc(st.f[fd[0]] || '') + '"></div>';
        });
        h += '<div class="bf-preview"><p class="small">Уйдёт нам в WhatsApp — отправляете вы сами:</p><p class="bf-bubble" data-msg>' + esc(message()) + '</p></div>';
        h += '<div class="bf-send"><a class="btn btn-w" data-wa href="' + esc(waHref()) + '" target="_blank" rel="noopener" data-act="send">' + ICO.wa + 'Отправить в WhatsApp</a><button class="bf-link" type="button" data-act="copy">Скопировать текст</button></div>';
        h += '<p class="bf-call" data-note><span>Удобнее позвонить?</span><b>' + esc(B.phoneHuman) + '</b><span>Работаем ' + esc(B.hours) + '</span></p>';
      }
      h += '</div>';
      h += '<div class="bf-foot">' + (st.i > 0 ? '<button class="bf-link" type="button" data-act="back">← Назад</button>' : '') + '<p class="small">Около минуты. Без регистрации и звонков без спроса.</p></div>';
      root.innerHTML = h;
      if (focus) focusEl($('.bf-h', root));
      /* Последний шаг выше предыдущих: на телефоне кнопка «Отправить» оказывалась под краем экрана — подвозим её в кадр */
      if (focus && s.k === 'final') {
        var send = $('[data-wa]', root), sr = send && send.getBoundingClientRect(), vh = window.innerHeight;
        if (sr && sr.bottom > vh - 16) window.scrollBy({ top: sr.bottom - vh + 24, behavior: REDUCE ? 'auto' : 'smooth' });
      }
    }
    function go(i) { st.i = i; render(true); }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || !root.contains(b)) return;
      var act = b.getAttribute('data-act'), v = b.getAttribute('data-v'), s = steps()[st.i];
      if (act === 'pick') {
        if (s.k === 'goal') { if (st.goal !== v) { st.goal = v; st.svc = null; st.ans = {}; } track('brief_goal', { goal: v, source: cfg.source }); }
        else if (s.k === 'svc') { if (st.svc !== v) { st.svc = v; st.ans = {}; } track('brief_service', { service: v, source: cfg.source }); }
        else {
          var id = s.q.id;
          if (st.ans[id] !== v) questions().forEach(function (q) { if (q && q.by === id) delete st.ans[q.id]; });
          st.ans[id] = v;
        }
        go(st.i + 1);
      } else if (act === 'tog') {
        /* Галочки: отмечаем на месте, без перерисовки; «Пока ничего» снимает остальные */
        var q = resolve(s.q), cur = (st.ans[s.q.id] || []).slice(), only = function (k) { var o = q.opts.filter(function (x) { return x[0] === k; })[0]; return o && o[2] === 'only'; };
        var at = cur.indexOf(v);
        if (at >= 0) cur.splice(at, 1);
        else if (only(v)) cur = [v];
        else { cur = cur.filter(function (k) { return !only(k); }); cur.push(v); }
        if (st.ans[s.q.id] && st.ans[s.q.id][0] !== cur[0]) questions().forEach(function (x) { if (x && x.by === s.q.id) delete st.ans[x.id]; });
        st.ans[s.q.id] = cur;
        $$('.opt-m', root).forEach(function (x) { var on = cur.indexOf(x.getAttribute('data-v')) >= 0; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        var nx = $('[data-act="next"]', root);
        if (nx) nx.disabled = !cur.length;
      } else if (act === 'next') { if ((st.ans[s.q.id] || []).length) go(st.i + 1); }
      else if (act === 'edit') go(indexOf(v));
      else if (act === 'back') go(Math.max(0, st.i - 1));
      else if (act === 'send') {
        track('generate_lead', { goal: st.goal, service: st.svc, source: cfg.source });
        var note = $('[data-note]', root);
        if (note) note.innerHTML = '<span>WhatsApp откроется в новой вкладке. Если не открылся — скопируйте текст и напишите на <b>' + esc(B.phoneHuman) + '</b>.</span>';
      } else if (act === 'copy') {
        copyText(message(), b, $('[data-msg]', root), 'Текст скопирован', 'Выделили текст — скопируйте его');
        track('copy_message', { source: cfg.source });
      }
    });
    root.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-f');
      if (!k) return;
      st.f[k] = e.target.value;
      var m = $('[data-msg]', root), a = $('[data-wa]', root);
      if (m) m.textContent = message();
      if (a) a.setAttribute('href', waHref());
    });
    render(false);
    return {
      setService: function (id) {
        if (fixedSvc || !SVC(id)) return;
        if (st.svc !== id) { st.goal = SVC(id).dir; st.svc = id; st.ans = {}; }
        st.i = indexOf('q'); render(false);
      },
      setGoal: function (g) {
        if (fixedGoal) return;
        if (st.goal !== g) { st.goal = g; st.svc = null; st.ans = {}; }
        /* «Пока не знаю» с первого экрана: шага выбора услуги нет — сразу к первому вопросу */
        st.i = indexOf(g === 'unknown' ? 'q' : 'svc'); render(false);
      }
    };
  }

  var pageBriefRoot = $('#bf');
  if (pageBriefRoot && B) {
    var preset = pageBriefRoot.getAttribute('data-goal');
    if (preset === 'none') preset = null;
    var pageBrief = makeBrief(pageBriefRoot, { id: 'bf', goal: preset, source: 'page' });
    /* Делегированием: так работают и кнопки, которые появляются позже (панель 3D-стола на главной) */
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-pick-svc],[data-pick]') : null;
      if (!a) return;
      if (a.hasAttribute('data-pick-svc')) { pageBrief.setService(a.getAttribute('data-pick-svc')); track('service_pick', { service: a.getAttribute('data-pick-svc') }); }
      else pageBrief.setGoal(a.getAttribute('data-pick'));
    });
    /* Пришли с главной по ссылке на услугу или пакет — подставим её в заявку */
    var fromHash = function () {
      var id = (location.hash || '').slice(1);
      if (!id || /^deck-/.test(id)) return;
      if (id === 'pack' && preset) { pageBrief.setService(preset + '-pack'); return; }
      var anc = document.getElementById(id), sec = anc && anc.closest('[data-svc]');
      if (sec) pageBrief.setService(sec.getAttribute('data-svc'));
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------- Презентация услуги: 6 слайдов с моделью и рисунками → бриф → WhatsApp ---------- */
  var SCENE = { invest: ['resort', 'ph-resort.svg'], estate: ['towers', 'ph-towers.svg'], industry: ['plant', 'ph-factory.svg'], ads: ['screen', 'ph-phone.svg'] };
  /* Куда смотрит камера на каждом типе слайда: смещение от исходного вида сцены */
  var LOOKS = {
    hook: { seek: 1.4, look: { yaw: 0.25, elev: 0.18, zoom: 1.06 } },
    scene: { look: {} },
    points: { look: { yaw: 0.95, elev: -0.1, zoom: 0.96 } },
    list: { look: { yaw: -0.55, elev: 0.5, zoom: 1.08 } },
    tiers: { look: { yaw: -0.55, elev: 0.5, zoom: 1.08 } },
    steps: { look: { yaw: -1.5, elev: -0.12, zoom: 0.98 } },
    price: { look: {} },
    brief: { look: { yaw: 0.45, elev: 0.08, zoom: 1.02 } }
  };
  var dk = null, D = null, deckId = '', cur = 0, deckApi = null, deckPreset = '', pushed = false, lastFocus = null, briefEl = null, closeT = 0, vizNow = null;

  function setInert(on) {
    [page, $('[data-mbar]'), $('.skip')].forEach(function (el) { if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
  }
  function deckBuild() {
    dk = document.createElement('div');
    dk.className = 'deck';
    dk.setAttribute('role', 'dialog');
    dk.setAttribute('aria-modal', 'true');
    dk.setAttribute('aria-labelledby', 'deck-name');
    dk.hidden = true;
    dk.innerHTML = '<div class="deck-in">' +
      '<div class="deck-stage stage"><div class="deck-viz"></div></div>' +
      '<div class="deck-top"><div class="deck-bars" aria-hidden="true"></div>' +
      '<div class="deck-head"><p class="deck-name" id="deck-name"></p><button class="deck-x" type="button" aria-label="Закрыть презентацию">' + ICO.close + '</button></div></div>' +
      '<div class="deck-body"><div class="deck-slide"></div></div>' +
      '<div class="deck-nav"><button class="deck-prev" type="button"></button><p class="deck-count" aria-live="polite"></p><button class="btn btn-w deck-next" type="button"></button></div></div>';
    document.body.appendChild(dk);
    $('.deck-x', dk).addEventListener('click', function () { closeDeck(false); });
    $('.deck-prev', dk).addEventListener('click', function () { go(-1); });
    $('.deck-next', dk).addEventListener('click', function () { go(1); });
    /* Свайп по тексту слайда; по модели — поворот */
    var body = $('.deck-body', dk), sw = null;
    body.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && !e.target.closest('.bf')) sw = { x: e.clientX, y: e.clientY }; });
    body.addEventListener('pointerup', function (e) {
      if (!sw) return;
      var dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6) go(dx < 0 ? 1 : -1);
    });
    body.addEventListener('pointercancel', function () { sw = null; });
    /* Если текст не помещается, низ слайда мягко затухает — видно, что его можно прокрутить */
    body.addEventListener('scroll', moreHint, { passive: true });
    window.addEventListener('resize', moreHint);
  }
  function moreHint() {
    if (!dk || dk.hidden) return;
    var b = $('.deck-body', dk);
    b.classList.toggle('has-more', b.scrollTop + b.clientHeight < b.scrollHeight - 6);
  }
  function mountStage(preset, fallback) {
    if (deckApi && deckPreset === preset) return;
    if (vizNow) { vizNow.destroy(); vizNow = null; }
    if (deckApi) deckApi.hold(true);
    var old = $('.deck-stage', dk), stg = document.createElement('div');
    stg.className = 'deck-stage stage';
    stg.innerHTML = '<img class="stage-fallback" src="assets/img/' + fallback + '" alt=""><canvas aria-hidden="true"></canvas><div class="deck-viz"></div>';
    old.parentNode.replaceChild(stg, old);
    deckPreset = preset;
    deckApi = window.Seven3D ? window.Seven3D.mount(stg, preset, {
      shift: function (w) { return w >= 760 ? 0.24 : 0; },
      zoom: function (w) { return w >= 760 ? 1.16 : 0.94; }
    }) : null;
  }
  function slideHTML(s) {
    if (s.kind === 'brief') return '<h2 class="deck-h" tabindex="-1">Короткий бриф</h2><p class="deck-p">Несколько ответов в одно касание — и готовое сообщение уйдёт нам в WhatsApp.</p><div class="deck-brief"></div>';
    var h = '<h2 class="deck-h" tabindex="-1">' + esc(s.title) + '</h2>';
    if (s.big) h += '<p class="deck-big">' + esc(s.big) + '</p>';
    if (s.text) h += '<p class="deck-p">' + esc(s.text) + '</p>';
    if (s.points) h += '<ul class="deck-points">' + s.points.map(function (p) { return '<li><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></li>'; }).join('') + '</ul>';
    if (s.items) h += '<ul class="check deck-check">' + s.items.map(function (x) { return '<li>' + ICO.check + esc(x) + '</li>'; }).join('') + '</ul>';
    if (s.tiers) h += '<ul class="deck-tiers">' + s.tiers.map(function (x) { return '<li><b>' + esc(x[0]) + '</b>' + (x[1] ? '<span class="p">' + esc(x[1]) + '</span>' : '') + '<span class="d">' + esc(x[2]) + '</span></li>'; }).join('') + '</ul>';
    if (s.steps) h += '<ol class="deck-steps">' + s.steps.map(function (p, k) { return '<li><span class="n">0' + (k + 1) + '</span><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></li>'; }).join('') + '</ol>';
    if (s.kind === 'price' && B && B.stats) h += '<div class="deck-proof">' + (D.proof || ['projects']).map(function (k) { var x = B.stats[k]; return x ? '<p><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></p>' : ''; }).join('') + '</div>';
    if (s.hint) h += '<p class="deck-hint">' + ICO.turn + esc(s.hint) + '</p>';
    if (s.link) h += '<a class="link deck-link" href="' + esc(s.link.url) + '" target="_blank" rel="noopener">' + ICO.play + esc(s.link.label) + '</a>';
    if (s.note) h += '<p class="deck-note">' + esc(s.note) + '</p>';
    return h;
  }
  function applyScene(s) {
    var V = window.SevenViz, flat = !!(s.viz && V && V.flat(s.viz.mode));
    if (vizNow) { vizNow.destroy(); vizNow = null; }
    var layer = $('.deck-viz', dk);
    layer.innerHTML = '';
    layer.className = 'deck-viz' + (s.viz ? ' m-' + s.viz.mode : '');
    dk.classList.toggle('is-flat', flat);
    if (deckApi) {
      if (flat) deckApi.hold(true);
      else {
        deckApi.hold(false);
        var sc = s.scene || LOOKS[s.kind] || {};
        if (sc.seek != null) deckApi.seek(sc.seek); else deckApi.playTo(null);
        deckApi.look(sc.look || {});
      }
    }
    if (s.viz && V && (flat || deckApi)) vizNow = V.make(s.viz, layer, deckApi);
  }
  function show(i) {
    var n = D.slides.length, back = i < cur;
    cur = i;
    var s = i < n ? D.slides[i] : { kind: 'brief' };
    var box = $('.deck-slide', dk);
    box.className = 'deck-slide kind-' + s.kind + (back ? ' is-back' : '');
    box.innerHTML = slideHTML(s);
    void box.offsetWidth;
    box.classList.add('is-in');
    if (s.kind === 'brief') {
      if (!briefEl) {
        briefEl = document.createElement('div');
        briefEl.className = 'bf';
        makeBrief(briefEl, { id: 'dk', deck: deckId, source: 'deck:' + deckId });
      }
      $('.deck-brief', box).appendChild(briefEl);
      track('deck_brief', { deck: deckId });
    }
    dk.classList.toggle('is-brief', s.kind === 'brief');
    dk.classList.toggle('is-dense', s.kind === 'points' || s.kind === 'steps' || s.kind === 'tiers');
    $$('.deck-bars i', dk).forEach(function (b, k) { b.className = k < i ? 'is-done' : k === i ? 'is-now' : ''; });
    $('.deck-count', dk).textContent = i < n ? (i + 1) + ' / ' + n : 'Бриф';
    var prev = $('.deck-prev', dk), next = $('.deck-next', dk);
    prev.textContent = s.kind === 'brief' ? '← К слайдам' : '← Назад';
    prev.classList.toggle('is-off', i === 0);
    prev.disabled = i === 0;
    next.textContent = s.cta || 'Далее';
    next.hidden = s.kind === 'brief';
    $('.deck-body', dk).scrollTop = 0;
    requestAnimationFrame(moreHint);
    applyScene(s);
    focusEl($('.deck-h', box));
    track('deck_slide', { deck: deckId, slide: i + 1 });
  }
  function go(d) {
    if (!D) return;
    var i = Math.max(0, Math.min(D.slides.length, cur + d));
    if (i !== cur) show(i);
  }
  function openDeck(id, push) {
    var d = DECKS[id];
    if (!d || !B) return false;
    if (!dk) deckBuild();
    if (dk.classList.contains('is-closing')) { clearTimeout(closeT); dk.hidden = true; dk.classList.remove('is-closing', 'is-open'); }
    if (!dk.hidden && deckId === id) return true;
    if (deckId !== id) briefEl = null; /* ответы брифа сохраняются, если открыть ту же презентацию снова */
    D = d; deckId = id; cur = 0;
    lastFocus = document.activeElement;
    $('.deck-name', dk).textContent = d.service;
    var bars = '';
    for (var k = 0; k <= d.slides.length; k++) bars += '<i></i>';
    $('.deck-bars', dk).innerHTML = bars;
    dk.hidden = false;
    document.documentElement.classList.add('deck-on');
    setInert(true);
    pageStages.forEach(function (a) { a.hold(true); });
    var sc = SCENE[d.dir] || SCENE.invest;
    mountStage(d.scene || sc[0], sc[1]);
    if (deckApi) deckApi.hold(false);
    show(0);
    dk.classList.remove('is-open');
    void dk.offsetWidth;
    dk.classList.add('is-open');
    if (push) { try { history.pushState({ deck: id }, '', '#deck-' + id); pushed = true; } catch (e) { pushed = false; } }
    track('deck_open', { deck: id });
    return true;
  }
  function closeDeck(fromHistory) {
    if (!dk || dk.hidden) return;
    track('deck_close', { deck: deckId, slide: cur + 1 });
    if (vizNow) { vizNow.destroy(); vizNow = null; }
    if (deckApi) deckApi.hold(true);
    pageStages.forEach(function (a) { a.hold(false); });
    document.documentElement.classList.remove('deck-on');
    setInert(false);
    dk.classList.add('is-closing');
    closeT = setTimeout(function () { dk.hidden = true; dk.classList.remove('is-closing', 'is-open'); }, REDUCE ? 0 : 220);
    if (!fromHistory) {
      if (pushed) { pushed = false; try { history.back(); } catch (e) { } }
      else if (/^#deck-/.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } }
    } else pushed = false;
    if (lastFocus && lastFocus.focus) focusEl(lastFocus);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-deck]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (openDeck(a.getAttribute('data-deck'), true)) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (!dk || dk.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDeck(false); return; }
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  });
  /* Кнопка «назад» на телефоне закрывает презентацию, а не уводит со страницы */
  window.addEventListener('popstate', function () {
    var m = /^#deck-(.+)$/.exec(location.hash);
    if (m && DECKS[m[1]]) { if (!dk || dk.hidden || dk.classList.contains('is-closing') || deckId !== m[1]) openDeck(m[1], false); }
    else if (dk && !dk.hidden) closeDeck(true);
  });
  /* Ссылка вида …#deck-invest-viz сразу открывает презентацию — её можно прислать клиенту */
  var startDeck = /^#deck-(.+)$/.exec(location.hash);
  if (startDeck && DECKS[startDeck[1]]) openDeck(startDeck[1], false);

  /* ---------- Телефон: короче «Как мы работаем» и «О студии» ----------
     Принципы и «Что нужно от вас» — раскрывающиеся строки (первая открыта), у крупных проектов — первые три и «Показать ещё».
     На широком экране всё раскрыто, заголовки не кнопки. */
  var phoneMQ = window.matchMedia('(max-width: 699px)');
  var folds = $$('#process .princ li, #process .need');
  folds.forEach(function (li, i) {
    var t = li.querySelector('.h3');
    if (!t) return;
    if (i === 0) li.classList.add('is-open');
    li.classList.add('fold');
    t.addEventListener('click', function () {
      if (!phoneMQ.matches) return;
      var on = !li.classList.contains('is-open');
      li.classList.toggle('is-open', on); t.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    t.addEventListener('keydown', function (e) { if (phoneMQ.matches && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.click(); } });
  });
  var foldMode = function () {
    folds.forEach(function (li) {
      var t = li.querySelector('.h3');
      if (!t) return;
      if (phoneMQ.matches) { t.setAttribute('role', 'button'); t.tabIndex = 0; t.setAttribute('aria-expanded', li.classList.contains('is-open') ? 'true' : 'false'); }
      else { t.removeAttribute('role'); t.removeAttribute('tabindex'); t.removeAttribute('aria-expanded'); }
    });
  };
  foldMode();
  if (phoneMQ.addEventListener) phoneMQ.addEventListener('change', foldMode); else if (phoneMQ.addListener) phoneMQ.addListener(foldMode);
  var alist = $('#about .alist');
  if (alist && alist.children.length > 3) {
    var amore = document.createElement('button');
    amore.type = 'button'; amore.className = 'btn btn-o amore'; amore.textContent = 'Показать ещё ' + (alist.children.length - 3);
    alist.classList.add('is-short');
    alist.parentNode.insertBefore(amore, alist.nextSibling);
    amore.addEventListener('click', function () { alist.classList.remove('is-short'); amore.hidden = true; });
  }

  /* ---------- Работы: вкладки по типу и просмотр во всплывающем окне ---------- */
  var WORKS = {};
  try { var wdata = $('#works-data'); if (wdata) WORKS = JSON.parse(wdata.textContent) || {}; } catch (e) { WORKS = {}; }
  /* Вкладки: показываем работы выбранного типа */
  $$('[data-wtabs]').forEach(function (bar) {
    var grid = bar.parentNode.querySelector('[data-wgrid]');
    if (!grid) return;
    /* Телефон: сначала три работы и кнопка «Показать ещё» (на широком экране CSS показывает всё и прячет кнопку) */
    var more = document.createElement('button'), opened = false;
    more.type = 'button'; more.className = 'btn btn-o wmore';
    grid.parentNode.insertBefore(more, grid.nextSibling);
    var clip = function () {
      var vis = $$('[data-work]', grid).filter(function (c) { return !c.hidden; });
      vis.forEach(function (c, i) { c.classList.toggle('is-more', !opened && i >= 3); });
      var n = opened ? 0 : Math.max(0, vis.length - 3);
      more.hidden = !n; more.textContent = 'Показать ещё ' + n;
    };
    more.addEventListener('click', function () {
      var first = $('[data-work].is-more', grid);
      opened = true; clip(); track('works_more', {});
      if (first) { var a = first.querySelector('a') || first; if (a.focus) a.focus({ preventScroll: true }); }
    });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wcat]');
      if (!b) return;
      var k = b.getAttribute('data-wcat');
      $$('[data-wcat]', bar).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      $$('[data-work]', grid).forEach(function (c) { c.hidden = k !== 'all' && c.getAttribute('data-cat') !== k; });
      clip();
      track('works_tab', { cat: k });
    });
    clip();
  });
  /* Окно работы: слева сама работа, справа — что это, задача, услуга, цена и кнопки. Листается стрелками, клавиатурой и свайпом */
  var wm = null, wmList = [], wmI = 0, wmPushed = false, wmLast = null, wmAfter = null;
  function wmBuild() {
    wm = document.createElement('div');
    wm.className = 'wm';
    wm.setAttribute('role', 'dialog');
    wm.setAttribute('aria-modal', 'true');
    wm.setAttribute('aria-labelledby', 'wm-h');
    wm.hidden = true;
    wm.innerHTML = '<div class="wm-back" data-wm-close></div><div class="wm-in">' +
      '<div class="wm-media"></div>' +
      '<div class="wm-info"><p class="wm-cat"></p><h2 class="d3 wm-h" id="wm-h"></h2><p class="wm-sub"></p><dl class="wm-facts"></dl>' +
      '<p class="wm-about"></p>' +
      '<div class="wm-acts"><a class="btn btn-w wm-cta" href="#brief">Обсудить похожий проект</a><a class="btn btn-o wm-more" href="#">Подробнее об услуге</a></div>' +
      '<a class="wm-wa" href="#" target="_blank" rel="noopener">' + ICO.wa + 'Написать в WhatsApp</a></div>' +
      '<div class="wm-bar"><button class="wm-prev" type="button" aria-label="Предыдущая работа">' + ICO.arrow + '</button>' +
      '<p class="wm-count" aria-live="polite"></p><button class="wm-next" type="button" aria-label="Следующая работа">' + ICO.arrow + '</button></div>' +
      '<button class="wm-x" type="button" aria-label="Закрыть">' + ICO.close + '</button></div>';
    document.body.appendChild(wm);
    wm.addEventListener('click', function (e) {
      if (e.target.closest('[data-wm-close]') || e.target.closest('.wm-x')) { closeWork(); return; }
      if (e.target.closest('.wm-prev')) { stepWork(-1); return; }
      if (e.target.closest('.wm-next')) { stepWork(1); return; }
      var a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      /* Ссылка на эту же страницу (заявка, услуга): закрыть окно и прокрутить к нужному месту */
      var u = new URL(a.href, location.href);
      if (u.pathname === location.pathname && u.hash) {
        e.preventDefault();
        var to = document.getElementById(decodeURIComponent(u.hash.slice(1)));
        closeWork(function () { if (to) to.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' }); });
      }
    });
    var sw = null;
    wm.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && !e.target.closest('a,button')) sw = { x: e.clientX, y: e.clientY }; });
    wm.addEventListener('pointerup', function (e) {
      if (!sw) return;
      var dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) stepWork(dx < 0 ? 1 : -1);
    });
    wm.addEventListener('pointercancel', function () { sw = null; });
  }
  function workMedia(w) {
    if (w.kind === 'img') return '<img class="wm-img" src="' + esc(w.src) + '" alt="' + esc(w.title + ': ' + w.sub) + '">';
    if (w.kind === 'yt' && w.embed) return '<div class="wm-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(w.yt) +
      '?autoplay=1&rel=0&playsinline=1" title="' + esc(w.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
    /* Ролик там, где YouTube нельзя встроить, и интерактивная презентация — обложка и кнопка, открывается в новой вкладке */
    var yt = w.kind === 'yt', href = yt ? 'https://youtu.be/' + w.yt : w.url;
    return '<div class="wm-frame wm-poster"><img src="' + esc(w.poster) + '" alt=""><a class="btn btn-w wm-open" href="' + esc(href) + '" target="_blank" rel="noopener">' +
      (yt ? ICO.play : ICO.arrow) + (yt ? 'Смотреть на YouTube' : 'Открыть презентацию') + '</a></div>';
  }
  function showWork(i) {
    var c = wmList[i], w = c && WORKS[c.getAttribute('data-work')];
    if (!w) return;
    wmI = i;
    $('.wm-media', wm).innerHTML = workMedia(w);
    $('.wm-cat', wm).textContent = w.cat;
    $('.wm-h', wm).textContent = w.title;
    $('.wm-sub', wm).textContent = w.sub;
    var f = '';
    if (w.goal) f += '<div><dt>Цель</dt><dd>' + esc(w.goal) + '</dd></div>';
    if (w.svc) f += '<div><dt>Услуга</dt><dd>' + esc(w.svc) + '</dd></div>';
    if (w.price) f += '<div><dt>Стоимость</dt><dd>' + esc(w.price) + '</dd></div>';
    $('.wm-facts', wm).innerHTML = f;
    var ab = $('.wm-about', wm);
    ab.textContent = w.about || ''; ab.hidden = !w.about;
    var cta = $('.wm-cta', wm);
    if (w.pick) cta.setAttribute('data-pick-svc', w.pick); else cta.removeAttribute('data-pick-svc');
    var more = $('.wm-more', wm);
    more.href = w.href || '#'; more.hidden = !w.svc;
    $('.wm-wa', wm).href = w.wa;
    $('.wm-count', wm).textContent = (i + 1) + ' / ' + wmList.length;
    $('.wm-prev', wm).disabled = i === 0;
    $('.wm-next', wm).disabled = i === wmList.length - 1;
    $('.wm-bar', wm).hidden = wmList.length < 2;
    $('.wm-info', wm).scrollTop = 0;
    if (wmPushed) { try { history.replaceState({ work: w.id }, '', '#work-' + w.id); } catch (e) { } }
    track('work_open', { id: w.id });
  }
  function stepWork(d) {
    var i = Math.max(0, Math.min(wmList.length - 1, wmI + d));
    if (i !== wmI) showWork(i);
  }
  function openWork(card, push) {
    if (!wm) wmBuild();
    var grid = card.closest('[data-wgrid]') || card.parentNode;
    wmList = $$('[data-work]', grid).filter(function (c) { return !c.hidden; });
    var i = wmList.indexOf(card);
    if (i < 0) { wmList = [card]; i = 0; }
    wmLast = card;
    wm.hidden = false;
    document.documentElement.classList.add('wm-on');
    setInert(true);
    pageStages.forEach(function (a) { a.hold(true); });
    if (push) { try { history.pushState({ work: card.getAttribute('data-work') }, '', '#work-' + card.getAttribute('data-work')); wmPushed = true; } catch (e) { wmPushed = false; } }
    showWork(i);
    wm.classList.remove('is-open');
    void wm.offsetWidth;
    wm.classList.add('is-open');
    focusEl($('.wm-x', wm));
  }
  function closeWork(after, fromHistory) {
    if (!wm || wm.hidden) return;
    $('.wm-media', wm).innerHTML = ''; /* ролик останавливается */
    wm.hidden = true;
    wm.classList.remove('is-open');
    document.documentElement.classList.remove('wm-on');
    setInert(false);
    pageStages.forEach(function (a) { a.hold(false); });
    if (!fromHistory && wmPushed) { wmPushed = false; wmAfter = after || null; try { history.back(); } catch (e) { if (after) after(); } }
    else { wmPushed = false; if (after) after(); }
    if (!after && wmList[wmI]) focusEl(wmList[wmI]);
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest ? e.target.closest('[data-work]') : null;
    if (!c || !WORKS[c.getAttribute('data-work')] || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    openWork(c, true);
  });
  document.addEventListener('keydown', function (e) {
    if (!wm || wm.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeWork(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); stepWork(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stepWork(-1); }
  });
  /* «Назад» на телефоне закрывает окно; после закрытия — прокрутка к заявке или услуге, если её просили */
  window.addEventListener('popstate', function () {
    if (wm && !wm.hidden && !/^#work-/.test(location.hash)) closeWork(null, true);
    if (wmAfter) { var f = wmAfter; wmAfter = null; setTimeout(f, 20); }
  });
  /* Ссылка вида …#work-barcelona открывает работу сразу */
  var startWork = /^#work-(.+)$/.exec(location.hash);
  if (startWork) { var sc = $('[data-work="' + startWork[1].replace(/"/g, '') + '"]'); if (sc) openWork(sc, false); }
})();
