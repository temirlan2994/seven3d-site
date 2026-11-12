/* SEVEN 3D — живая сцена первого экрана.
   Участок рисуется линиями → каркас растёт по этажам (красная линия — где сейчас «печатается») →
   появляется объём → в окнах загорается свет. Three.js r128, глобальный THREE.
   Window.Seven3D.mount(stageElement, presetName) — запускает сцену в .stage. */
(function () {
  'use strict';

  var COL = { graphite: 0x0e0f11, carbon: 0x16181b, steel: 0x2a2d32, grey: 0xdbdbdb, white: 0xffffff, red: 0xff0009 };

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ss(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function easeInOut(x) { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* ---------- Сборщик модели ---------- */
  function Builder(seed) {
    this.wire = [];      // пары точек для каркаса
    this.solids = [];    // { geo, x, y, z, ry }
    this.wins = [];      // окна: { x, y, z, ry, w, h }
    this.scans = [];     // контуры «печати»: { kind, x, z, w, d, r, top, ry }
    this.glows = [];     // светящиеся объёмы: { geo, x, y, z, ry, color }
    this.ground = [];    // линии участка, рисуются по очереди: массивы точек [x, z]
    this.groundLoops = [];
    this.trees = [];     // [x, z, r]
    this.water = null;   // массив точек [x, z]
    this.beacons = [];   // красные огни: { x, y, z }
    this.screens = [];   // экраны с текстурой
    this.top = 1;
    this.rand = rng(seed || 7);
  }
  Builder.prototype.seg = function (a, b) { this.wire.push(a[0], a[1], a[2], b[0], b[1], b[2]); };
  Builder.prototype.rectAt = function (x, z, w, d, y, ry) {
    var p = this.rot([[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], x, z, ry);
    for (var i = 0; i < 4; i++) { var a = p[i], b = p[(i + 1) % 4]; this.seg([a[0], y, a[1]], [b[0], y, b[1]]); }
  };
  Builder.prototype.rot = function (pts, x, z, ry) {
    var c = Math.cos(ry || 0), s = Math.sin(ry || 0);
    return pts.map(function (p) { return [x + p[0] * c + p[1] * s, z - p[0] * s + p[1] * c]; });
  };
  /* Корпус: этажи-кольца, углы, импосты и окна по фасадам */
  Builder.prototype.box = function (x, z, w, d, floors, fh, o) {
    o = o || {};
    var ry = o.ry || 0, H = floors * fh, i, k, bay = o.bay || 1.2;
    for (i = 0; i <= floors; i++) this.rectAt(x, z, w, d, i * fh, ry);
    var corners = this.rot([[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], x, z, ry);
    for (i = 0; i < 4; i++) this.seg([corners[i][0], 0, corners[i][1]], [corners[i][0], H, corners[i][1]]);
    var faces = [
      { len: w, nx: 0, nz: 1, off: d / 2, ang: 0 },
      { len: d, nx: 1, nz: 0, off: w / 2, ang: Math.PI / 2 },
      { len: w, nx: 0, nz: -1, off: d / 2, ang: Math.PI },
      { len: d, nx: -1, nz: 0, off: w / 2, ang: -Math.PI / 2 }
    ];
    var c = Math.cos(ry), s = Math.sin(ry), self = this;
    faces.forEach(function (f) {
      var n = Math.max(1, Math.round(f.len / bay)), step = f.len / n;
      for (k = 1; k < n; k++) {
        var u = -f.len / 2 + k * step;
        var lx = f.nx === 0 ? u * (f.nz > 0 ? 1 : -1) : f.nx * f.off;
        var lz = f.nx === 0 ? f.nz * f.off : u * (f.nx > 0 ? -1 : 1);
        if (!o.noMullions) self.seg([x + lx * c + lz * s, 0, z - lx * s + lz * c], [x + lx * c + lz * s, H, z - lx * s + lz * c]);
      }
      if (o.noWindows) return;
      for (i = o.skipGround ? 1 : 0; i < floors; i++) {
        for (k = 0; k < n; k++) {
          var u2 = -f.len / 2 + (k + 0.5) * step;
          var px = f.nx === 0 ? u2 * (f.nz > 0 ? 1 : -1) : f.nx * (f.off + 0.03);
          var pz = f.nx === 0 ? f.nz * (f.off + 0.03) : u2 * (f.nx > 0 ? -1 : 1);
          self.wins.push({ x: x + px * c + pz * s, y: i * fh + fh * 0.55, z: z - px * s + pz * c, ry: ry + f.ang, w: step * 0.62, h: fh * 0.5 });
        }
      }
    });
    this.solids.push({ geo: new THREE.BoxGeometry(w, H, d), x: x, y: H / 2, z: z, ry: ry });
    this.scans.push({ kind: 'rect', x: x, z: z, w: w + 0.12, d: d + 0.12, top: H, ry: ry });
    this.top = Math.max(this.top, H);
  };
  /* Купол-ресторан */
  Builder.prototype.dome = function (x, z, r) {
    var i, j, M = 10, P = 5, seg = 18;
    for (i = 0; i < M; i++) {
      var a = (i / M) * Math.PI * 2, prev = null;
      for (j = 0; j <= seg; j++) {
        var t = (j / seg) * (Math.PI / 2);
        var p = [x + Math.cos(a) * Math.cos(t) * r, Math.sin(t) * r, z + Math.sin(a) * Math.cos(t) * r];
        if (prev) this.seg(prev, p);
        prev = p;
      }
    }
    for (j = 0; j < P; j++) {
      var tt = (j / P) * (Math.PI / 2), rr = Math.cos(tt) * r, yy = Math.sin(tt) * r, pv = null;
      for (i = 0; i <= 36; i++) {
        var aa = (i / 36) * Math.PI * 2, q = [x + Math.cos(aa) * rr, yy, z + Math.sin(aa) * rr];
        if (pv) this.seg(pv, q);
        pv = q;
      }
    }
    this.solids.push({ geo: new THREE.SphereGeometry(r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), x: x, y: 0, z: z, ry: 0, glass: true });
    this.glows.push({ geo: new THREE.SphereGeometry(r * 0.96, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), x: x, y: 0, z: z, ry: 0, color: COL.grey, max: 0.22 });
    this.scans.push({ kind: 'dome', x: x, z: z, r: r, top: r });
    this.top = Math.max(this.top, r);
  };
  /* Юрта: стены + конус крыши */
  Builder.prototype.yurt = function (x, z, r, h) {
    var i, wallH = h * 0.55, pv = null, pv2 = null;
    for (i = 0; i <= 24; i++) {
      var a = (i / 24) * Math.PI * 2, p0 = [x + Math.cos(a) * r, 0, z + Math.sin(a) * r], p1 = [x + Math.cos(a) * r, wallH, z + Math.sin(a) * r];
      if (pv) { this.seg(pv, p0); this.seg(pv2, p1); }
      pv = p0; pv2 = p1;
      if (i % 4 === 0 && i < 24) this.seg(p1, [x, h, z]);
    }
    this.solids.push({ geo: new THREE.CylinderGeometry(r, r, wallH, 20), x: x, y: wallH / 2, z: z, ry: 0 });
    this.solids.push({ geo: new THREE.ConeGeometry(r * 1.04, h - wallH, 20), x: x, y: wallH + (h - wallH) / 2, z: z, ry: 0 });
    var a2 = this.rand() * Math.PI * 2;
    this.wins.push({ x: x + Math.cos(a2) * (r + 0.03), y: wallH * 0.45, z: z + Math.sin(a2) * (r + 0.03), ry: -a2 + Math.PI / 2, w: r * 0.55, h: wallH * 0.62 });
    this.scans.push({ kind: 'circle', x: x, z: z, r: r + 0.06, top: h });
    this.top = Math.max(this.top, h);
  };
  /* A-frame домик */
  Builder.prototype.aframe = function (x, z, w, d, h, ry) {
    var p = this.rot([[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2], [0, -d / 2], [0, d / 2]], x, z, ry);
    var A = [p[0][0], 0, p[0][1]], B = [p[1][0], 0, p[1][1]], Cc = [p[2][0], 0, p[2][1]], Dd = [p[3][0], 0, p[3][1]], T1 = [p[4][0], h, p[4][1]], T2 = [p[5][0], h, p[5][1]];
    this.seg(A, B); this.seg(B, Cc); this.seg(Cc, Dd); this.seg(Dd, A);
    this.seg(A, T1); this.seg(B, T1); this.seg(Dd, T2); this.seg(Cc, T2); this.seg(T1, T2);
    var g = new THREE.BufferGeometry();
    var v = [-w / 2, 0, -d / 2, w / 2, 0, -d / 2, 0, h, -d / 2, -w / 2, 0, d / 2, w / 2, 0, d / 2, 0, h, d / 2];
    var idx = [0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 4, 0, 1, 4, 0, 4, 3];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    this.solids.push({ geo: g, x: x, y: 0, z: z, ry: ry });
    var fc = this.rot([[0, d / 2 + 0.03]], x, z, ry)[0];
    this.wins.push({ x: fc[0], y: h * 0.32, z: fc[1], ry: ry, w: w * 0.42, h: h * 0.42 });
    this.scans.push({ kind: 'rect', x: x, z: z, w: w + 0.1, d: d + 0.1, top: h, ry: ry, taper: true });
    this.top = Math.max(this.top, h);
  };
  /* Цилиндр: силос, труба */
  Builder.prototype.cyl = function (x, z, r, h, rings) {
    var i, j, pv;
    for (j = 0; j <= rings; j++) {
      var y = (j / rings) * h; pv = null;
      for (i = 0; i <= 28; i++) { var a = (i / 28) * Math.PI * 2, p = [x + Math.cos(a) * r, y, z + Math.sin(a) * r]; if (pv) this.seg(pv, p); pv = p; }
    }
    for (i = 0; i < 6; i++) { var b = (i / 6) * Math.PI * 2; this.seg([x + Math.cos(b) * r, 0, z + Math.sin(b) * r], [x + Math.cos(b) * r, h, z + Math.sin(b) * r]); }
    this.solids.push({ geo: new THREE.CylinderGeometry(r, r, h, 24), x: x, y: h / 2, z: z, ry: 0 });
    this.scans.push({ kind: 'circle', x: x, z: z, r: r + 0.06, top: h });
    this.top = Math.max(this.top, h);
  };
  Builder.prototype.path = function (pts) { this.ground.push(pts); };
  Builder.prototype.loop = function (pts) { this.groundLoops.push(pts); };
  Builder.prototype.roundRect = function (w, d, r, cx, cz) {
    var pts = [], i, k, cs = [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 1], [-w / 2 + r, -d / 2 + r, 2], [w / 2 - r, -d / 2 + r, 3]];
    for (k = 0; k < 4; k++) for (i = 0; i <= 6; i++) { var a = (cs[k][2] + i / 6) * Math.PI / 2; pts.push([(cx || 0) + cs[k][0] + Math.cos(a) * r, (cz || 0) + cs[k][1] + Math.sin(a) * r]); }
    pts.push(pts[0]);
    return pts;
  };

  /* ---------- Пресеты сцен ---------- */
  var PRESETS = {
    complex: function (b) {
      b.loop(b.roundRect(34, 24, 3));
      b.path([[-17, 7], [-9, 6], [-2, 7.4], [6, 8.5], [17, 8]]);
      b.path([[-3, 12], [-3.5, 6.5], [-2.5, 0], [-4, -12]]);
      b.box(-7, -3.5, 6, 6, 22, 0.5, { skipGround: true });
      b.box(2, -6.5, 5, 5, 15, 0.5, { skipGround: true });
      b.box(5.5, 2.5, 8, 4, 9, 0.5, { skipGround: true });
      b.box(-1, 3.5, 9, 3.6, 2, 0.6, { bay: 1.5 });
      b.box(-12, 6, 3.4, 3.4, 2, 0.6, { bay: 1.1 });
      for (var i = 0; i < 16; i++) b.trees.push([-15 + b.rand() * 30, 9 + b.rand() * 2.5, 0.35 + b.rand() * 0.35]);
      for (var j = 0; j < 7; j++) b.trees.push([11 + b.rand() * 4, -9 + b.rand() * 12, 0.35 + b.rand() * 0.35]);
      return { target: [0, 3.2, 0], elev: 0.5, angle: -0.95, radius: 23, zoom: 1 };
    },
    towers: function (b) {
      b.loop(b.roundRect(30, 22, 3));
      b.box(-6.5, -2, 5.5, 5.5, 24, 0.5, { skipGround: true });
      b.box(0.5, -4.5, 5.5, 5.5, 30, 0.5, { skipGround: true });
      b.box(7, -1, 5, 5, 18, 0.5, { skipGround: true });
      b.box(0.5, 4.5, 16, 3.4, 2, 0.6, { bay: 1.6 });
      b.path([[-15, 8], [-6, 7.6], [4, 8.6], [15, 8]]);
      for (var i = 0; i < 14; i++) b.trees.push([-13 + b.rand() * 26, 8.5 + b.rand() * 2.2, 0.35 + b.rand() * 0.3]);
      return { target: [0, 5.5, 0], elev: 0.42, angle: -1.05, radius: 26, zoom: 1 };
    },
    resort: function (b) {
      b.loop(b.roundRect(38, 28, 4));
      b.water = [[7, 6], [11, 4.6], [15.5, 6], [17.5, 9.5], [15.5, 13], [10.5, 13.6], [7.5, 11.5], [6.4, 8.6], [7, 6]];
      b.dome(-1.5, -1, 4.2);
      var k;
      for (k = 0; k < 9; k++) { var a = Math.PI * 0.55 + (k / 8) * Math.PI * 0.95; b.yurt(-1.5 + Math.cos(a) * 9.5, -1 + Math.sin(a) * 8, 0.95, 1.7); }
      b.aframe(3, 7.6, 2.4, 3, 3, 0.35);
      b.aframe(4.6, 11, 2.4, 3, 3, 0.15);
      b.aframe(-12, -7, 2.4, 3, 3, -0.4);
      b.path([[2.2, 2.4], [6.8, 6.4], [9.6, 8.8]]);
      b.path([[-17, 10], [-9, 9], [-3, 4.5], [-1.5, 3.2]]);
      for (var i = 0; i < 30; i++) {
        var tx = -18 + b.rand() * 36, tz = -13 + b.rand() * 26;
        if (Math.hypot(tx + 1.5, tz + 1) > 11.5 && !(tx > 5 && tz > 3.5)) b.trees.push([tx, tz, 0.4 + b.rand() * 0.45]);
      }
      return { target: [0, 1.6, 0], elev: 0.62, angle: -0.8, radius: 22, zoom: 1 };
    },
    plant: function (b) {
      b.loop(b.roundRect(36, 24, 3));
      b.box(-4, 1, 16, 7, 3, 1.2, { bay: 2, noMullions: false });
      b.box(8, -4, 6, 5, 4, 1.1, { bay: 1.5 });
      b.cyl(-9, -7, 1.5, 6.5, 6);
      b.cyl(-5.4, -7, 1.5, 6.5, 6);
      b.cyl(-1.8, -7, 1.5, 6.5, 6);
      b.cyl(12.5, 5, 0.55, 12, 8);
      b.beacons.push({ x: 12.5, y: 12.25, z: 5 });
      b.path([[-12, -3.8], [-1.8, -3.8], [3, -3.8], [5, -4]]);
      b.path([[-17, 9], [-4, 8], [17, 9]]);
      for (var i = 0; i < 12; i++) b.trees.push([-15 + b.rand() * 30, 9.5 + b.rand() * 2, 0.35 + b.rand() * 0.3]);
      return { target: [0, 3, 0], elev: 0.5, angle: -0.9, radius: 24, zoom: 1 };
    },
    screen: function (b) {
      b.loop(b.roundRect(26, 18, 3));
      var w = 4.6, h = 8.2, d = 0.5;
      var self = b, i;
      [[0, 0], [0, h]].forEach(function (yy) { self.rectAt(0, 0, w, d, yy[1], 0); });
      var cr = b.rot([[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], 0, 0, 0);
      for (i = 0; i < 4; i++) b.seg([cr[i][0], 0, cr[i][1]], [cr[i][0], h, cr[i][1]]);
      b.solids.push({ geo: new THREE.BoxGeometry(w, h, d), x: 0, y: h / 2, z: 0, ry: 0 });
      b.scans.push({ kind: 'rect', x: 0, z: 0, w: w + 0.12, d: d + 0.12, top: h, ry: 0 });
      b.screens.push({ x: 0, y: h / 2, z: d / 2 + 0.02, w: w - 0.5, h: h - 0.7 });
      [[-6.5, -3, 2.6, 4.2, 0.5], [6.4, -2.2, 3.4, 2.2, -0.45], [-5.2, 4.2, 2.2, 1.4, 0.3]].forEach(function (f, n) {
        var fy = 1.2 + n * 1.6;
        var p = b.rot([[-f[2] / 2, 0], [f[2] / 2, 0]], f[0], f[1], f[4]);
        b.seg([p[0][0], fy, p[0][1]], [p[1][0], fy, p[1][1]]);
        b.seg([p[1][0], fy, p[1][1]], [p[1][0], fy + f[3], p[1][1]]);
        b.seg([p[1][0], fy + f[3], p[1][1]], [p[0][0], fy + f[3], p[0][1]]);
        b.seg([p[0][0], fy + f[3], p[0][1]], [p[0][0], fy, p[0][1]]);
      });
      b.top = Math.max(b.top, h);
      return { target: [0, 4.2, 0], elev: 0.22, angle: 1.2, radius: 14, zoom: 1 };
    }
  };

  /* ---------- Сцена ---------- */
  function mount(stage, presetName, opts) {
    opts = opts || {};
    if (!window.THREE || !stage) return null;
    var canvas = stage.querySelector('canvas');
    if (!canvas) return null;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return null; }
    if (!renderer.getContext()) return null;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.localClippingEnabled = true;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(COL.graphite, 30, 70);
    var camera = new THREE.PerspectiveCamera(30, 1, 0.5, 300);
    scene.add(new THREE.HemisphereLight(0x4a5058, COL.graphite, 1.1));
    var sun = new THREE.DirectionalLight(COL.white, 0.65);
    sun.position.set(-18, 30, 16);
    scene.add(sun);

    var b = new Builder(presetName.length * 977 + 13);
    var view = (PRESETS[presetName] || PRESETS.complex)(b);
    var clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

    /* Сетка участка: тускнеет к краям */
    var gridPos = [], gridCol = [], R = 30, step = 2, gx, cA = new THREE.Color(COL.steel), cB = new THREE.Color(COL.graphite);
    function pushLine(x1, z1, x2, z2) {
      var m1 = clamp01(Math.hypot(x1, z1) / R), m2 = clamp01(Math.hypot(x2, z2) / R);
      var k1 = cA.clone().lerp(cB, m1), k2 = cA.clone().lerp(cB, m2);
      gridPos.push(x1, 0, z1, x2, 0, z2); gridCol.push(k1.r, k1.g, k1.b, k2.r, k2.g, k2.b);
    }
    for (gx = -R; gx <= R; gx += step) {
      var hh = Math.sqrt(Math.max(0, R * R - gx * gx));
      for (var gz = -hh; gz < hh - 0.01; gz += step) { pushLine(gx, gz, gx, Math.min(hh, gz + step)); pushLine(gz, gx, Math.min(hh, gz + step), gx); }
    }
    var gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPos, 3));
    gridGeo.setAttribute('color', new THREE.Float32BufferAttribute(gridCol, 3));
    var gridMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 });
    scene.add(new THREE.LineSegments(gridGeo, gridMat));

    /* Линии участка: граница, дорожки — рисуются по очереди */
    var drawn = [];
    var siteMat = new THREE.LineBasicMaterial({ color: COL.grey, transparent: true, opacity: 0.55 });
    b.groundLoops.concat(b.ground).forEach(function (pts) {
      var dense = [];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], c = pts[i + 1], n = Math.max(2, Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.6));
        for (var j = 0; j < n; j++) dense.push(a[0] + (c[0] - a[0]) * (j / n), 0.02, a[1] + (c[1] - a[1]) * (j / n));
      }
      var last = pts[pts.length - 1]; dense.push(last[0], 0.02, last[1]);
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(dense, 3));
      g.setDrawRange(0, 0);
      var line = new THREE.Line(g, siteMat);
      scene.add(line);
      drawn.push({ line: line, n: dense.length / 3 });
    });

    /* Вода */
    var waterMat = null;
    if (b.water) {
      var shape = new THREE.Shape();
      b.water.forEach(function (p, i) { if (i === 0) shape.moveTo(p[0], -p[1]); else shape.lineTo(p[0], -p[1]); });
      var wg = new THREE.ShapeGeometry(shape);
      waterMat = new THREE.MeshBasicMaterial({ color: 0x15181c, transparent: true, opacity: 0 });
      var wm = new THREE.Mesh(wg, waterMat);
      wm.rotation.x = -Math.PI / 2;
      wm.position.y = 0.01;
      scene.add(wm);
      var wl = [];
      b.water.forEach(function (p) { wl.push(p[0], 0.03, p[1]); });
      var wlg = new THREE.BufferGeometry();
      wlg.setAttribute('position', new THREE.Float32BufferAttribute(wl, 3));
      wlg.setDrawRange(0, 0);
      var wline = new THREE.Line(wlg, siteMat);
      scene.add(wline);
      drawn.push({ line: wline, n: wl.length / 3 });
    }

    /* Деревья — кружки на земле */
    var treePos = [];
    b.trees.forEach(function (t) {
      for (var i = 0; i < 12; i++) {
        var a1 = (i / 12) * Math.PI * 2, a2 = ((i + 1) / 12) * Math.PI * 2;
        treePos.push(t[0] + Math.cos(a1) * t[2], 0.03, t[1] + Math.sin(a1) * t[2], t[0] + Math.cos(a2) * t[2], 0.03, t[1] + Math.sin(a2) * t[2]);
      }
    });
    var treeGeo = new THREE.BufferGeometry();
    treeGeo.setAttribute('position', new THREE.Float32BufferAttribute(treePos, 3));
    var treeMat = new THREE.LineBasicMaterial({ color: COL.grey, transparent: true, opacity: 0 });
    scene.add(new THREE.LineSegments(treeGeo, treeMat));

    /* Каркас */
    var wireGeo = new THREE.BufferGeometry();
    wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(b.wire, 3));
    var wireMat = new THREE.LineBasicMaterial({ color: COL.grey, transparent: true, opacity: 0.75, clippingPlanes: [clip] });
    scene.add(new THREE.LineSegments(wireGeo, wireMat));

    /* Объёмы */
    var solidMat = new THREE.MeshStandardMaterial({ color: COL.carbon, roughness: 0.92, metalness: 0.05, transparent: true, opacity: 0, side: THREE.DoubleSide, clippingPlanes: [clip], polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    var glassMat = new THREE.MeshStandardMaterial({ color: COL.steel, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0, depthWrite: false, clippingPlanes: [clip] });
    b.solids.forEach(function (s) { var m = new THREE.Mesh(s.geo, s.glass ? glassMat : solidMat); m.position.set(s.x, s.y, s.z); m.rotation.y = s.ry || 0; scene.add(m); });
    var glowMats = [];
    b.glows.forEach(function (s) {
      var gm = new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false });
      var m = new THREE.Mesh(s.geo, gm); m.position.set(s.x, s.y, s.z); scene.add(m);
      glowMats.push({ mat: gm, max: s.max });
    });

    /* Экран (для рекламы) */
    var screenMats = [];
    b.screens.forEach(function (sc) {
      var cv = document.createElement('canvas'); cv.width = 360; cv.height = 640;
      var g2 = cv.getContext('2d');
      var grad = g2.createLinearGradient(0, 0, 0, 640);
      grad.addColorStop(0, '#2a2d32'); grad.addColorStop(1, '#16181b');
      g2.fillStyle = grad; g2.fillRect(0, 0, 360, 640);
      g2.strokeStyle = 'rgba(219,219,219,0.35)'; g2.lineWidth = 2;
      for (var y = 120; y < 520; y += 56) { g2.beginPath(); g2.moveTo(40, y); g2.lineTo(320, y + 30); g2.stroke(); }
      g2.fillStyle = '#ffffff'; g2.beginPath(); g2.arc(180, 320, 52, 0, Math.PI * 2); g2.fill();
      g2.fillStyle = '#0e0f11'; g2.beginPath(); g2.moveTo(166, 296); g2.lineTo(166, 344); g2.lineTo(206, 320); g2.closePath(); g2.fill();
      g2.fillStyle = 'rgba(219,219,219,0.3)'; g2.fillRect(40, 580, 280, 6);
      g2.fillStyle = '#ff0009'; g2.fillRect(40, 580, 120, 6);
      var tex = new THREE.CanvasTexture(cv);
      var sm = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 });
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(sc.w, sc.h), sm);
      mesh.position.set(sc.x, sc.y, sc.z); scene.add(mesh);
      screenMats.push(sm);
    });

    /* Окна */
    var wins = b.wins, nW = wins.length, winMesh = null, winAt = [], winLvl = [];
    if (nW) {
      var wmat = new THREE.MeshBasicMaterial({ color: COL.white, side: THREE.DoubleSide });
      winMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), wmat, nW);
      var dummy = new THREE.Object3D(), off = new THREE.Color(COL.carbon), r = rng(4242 + nW);
      for (var i = 0; i < nW; i++) {
        var w = wins[i];
        dummy.position.set(w.x, w.y, w.z); dummy.rotation.set(0, w.ry, 0); dummy.scale.set(w.w, w.h, 1); dummy.updateMatrix();
        winMesh.setMatrixAt(i, dummy.matrix);
        winMesh.setColorAt(i, off);
        winAt.push(r() * 1.6);
        winLvl.push(r() < 0.62 ? 0.55 + r() * 0.45 : 0);
      }
      winMesh.instanceColor.needsUpdate = true;
      winMesh.visible = false;
      scene.add(winMesh);
    }

    /* Красные огни */
    var beaconMats = [];
    b.beacons.forEach(function (bc) {
      var bm = new THREE.MeshBasicMaterial({ color: COL.red, transparent: true, opacity: 0 });
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), bm); m.position.set(bc.x, bc.y, bc.z); scene.add(m);
      beaconMats.push(bm);
    });

    /* Красный контур «печати» на текущей высоте */
    var scanMat = new THREE.LineBasicMaterial({ color: COL.red, transparent: true, opacity: 0.95 });
    var scans = b.scans.map(function (s) {
      var pts = [], i;
      if (s.kind === 'rect') {
        [[-s.w / 2, -s.d / 2], [s.w / 2, -s.d / 2], [s.w / 2, s.d / 2], [-s.w / 2, s.d / 2], [-s.w / 2, -s.d / 2]].forEach(function (p) { pts.push(p[0], 0, p[1]); });
      } else {
        for (i = 0; i <= 32; i++) { var a = (i / 32) * Math.PI * 2; pts.push(Math.cos(a), 0, Math.sin(a)); }
      }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      var line = new THREE.Line(g, scanMat); line.position.set(s.x, 0, s.z); line.rotation.y = s.ry || 0; line.visible = false; scene.add(line);
      return { line: line, s: s };
    });

    /* Камера и кадрирование */
    var target = new THREE.Vector3(view.target[0], view.target[1], view.target[2]);
    var W = 1, Hh = 1, shift = 0, zoom = 1, yaw = 0, yawVel = 0, nudge = 0;
    /* Смещение камеры для слайдов: плавно перелетает к цели */
    var cam = { yaw: 0, elev: 0, zoom: 1 }, camT = { yaw: 0, elev: 0, zoom: 1 };
    function frame() {
      var rect = stage.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width)); Hh = Math.max(1, Math.round(rect.height));
      renderer.setSize(W, Hh, false);
      camera.aspect = W / Hh;
      shift = (typeof opts.shift === 'function' ? opts.shift(W, Hh) : (opts.shift || 0)) + nudge;
      zoom = typeof opts.zoom === 'function' ? opts.zoom(W, Hh) : (opts.zoom || 1);
      if (shift) camera.setViewOffset(W, Hh, -shift * W, 0, W, Hh); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
    function place(t) {
      var vh = (camera.fov * Math.PI) / 360;
      var hh2 = Math.atan(Math.tan(vh) * camera.aspect);
      var fit = Math.min(vh, hh2);
      var dist = (view.radius / Math.sin(fit)) * 0.62 * (view.zoom || 1) * zoom * cam.zoom;
      var dolly = reduce ? 0 : (1 - ss(0, 4.5, t)) * 0.12;
      dist *= 1 + dolly;
      var a = view.angle + (reduce ? 0 : t * 0.045) + yaw + cam.yaw;
      var el = Math.max(0.06, Math.min(1.35, view.elev + cam.elev));
      camera.position.set(target.x + Math.cos(a) * Math.cos(el) * dist, target.y + Math.sin(el) * dist, target.z + Math.sin(a) * Math.cos(el) * dist);
      camera.lookAt(target);
      scene.fog.near = dist * 0.8;
      scene.fog.far = dist * 1.9;
    }

    /* Временная шкала */
    var T_BUILD0 = 0.75, T_BUILD1 = 3.3, T_SOLID0 = 2.7, T_SOLID1 = 3.8, T_LIGHT0 = 3.5;
    var stageNow = -1;
    var tmpC = new THREE.Color(), offC = new THREE.Color(COL.carbon), onC = new THREE.Color(COL.grey), whiteC = new THREE.Color(COL.white);
    function apply(t) {
      gridMat.opacity = ss(0, 0.8, t);
      drawn.forEach(function (d2, i) { d2.line.geometry.setDrawRange(0, Math.floor(d2.n * ss(0.1 + i * 0.12, 1.3 + i * 0.12, t))); });
      treeMat.opacity = 0.35 * ss(0.7, 1.6, t);
      if (waterMat) waterMat.opacity = ss(0.4, 1.4, t);
      var bh = easeInOut((t - T_BUILD0) / (T_BUILD1 - T_BUILD0)) * (b.top + 0.2);
      clip.constant = t >= T_BUILD1 ? 1000 : Math.max(0.02, bh);
      scans.forEach(function (sc) {
        var s = sc.s, on = t > T_BUILD0 && t < T_BUILD1 && bh > 0.02 && bh < s.top;
        sc.line.visible = on;
        if (!on) return;
        sc.line.position.y = bh;
        if (s.kind === 'circle') sc.line.scale.set(s.r, 1, s.r);
        else if (s.kind === 'dome') { var rr = Math.sqrt(Math.max(0.01, s.r * s.r - bh * bh)); sc.line.scale.set(rr, 1, rr); }
        else if (s.taper) { var k = Math.max(0.05, 1 - bh / s.top); sc.line.scale.set(k, 1, 1); }
      });
      solidMat.opacity = ss(T_SOLID0, T_SOLID1, t);
      glassMat.opacity = 0.42 * ss(T_SOLID0, T_SOLID1, t);
      wireMat.opacity = 0.75 - 0.5 * ss(T_SOLID1, T_SOLID1 + 1, t);
      var lt = t - T_LIGHT0;
      glowMats.forEach(function (g) { g.mat.opacity = g.max * ss(0, 1.2, lt); });
      screenMats.forEach(function (m) { m.opacity = ss(0.1, 1, lt); });
      beaconMats.forEach(function (m) { m.opacity = lt > 0 ? 0.55 + 0.45 * Math.max(0, Math.sin(t * 3.2)) : 0; });
      if (winMesh) {
        winMesh.visible = lt > 0;
        if (lt > 0 && lt < 2.4) {
          for (var i = 0; i < nW; i++) {
            var lv = winLvl[i] * ss(winAt[i], winAt[i] + 0.3, lt);
            tmpC.copy(offC).lerp(lv > 0.9 ? whiteC : onC, lv);
            winMesh.setColorAt(i, tmpC);
          }
          winMesh.instanceColor.needsUpdate = true;
        } else if (lt >= 2.4 && !winMesh.userData.done) {
          for (var j = 0; j < nW; j++) { tmpC.copy(offC).lerp(winLvl[j] > 0.9 ? whiteC : onC, winLvl[j]); winMesh.setColorAt(j, tmpC); }
          winMesh.instanceColor.needsUpdate = true;
          winMesh.userData.done = true;
        }
      }
      var st = t < T_BUILD0 ? 0 : t < T_LIGHT0 ? 1 : 2;
      if (st !== stageNow) { stageNow = st; if (opts.onStage) opts.onStage(st); }
    }

    /* Цикл */
    var t = reduce ? 20 : 0, tMax = Infinity, last = 0, running = false, raf = 0, visible = true, held = false;
    /* Подсветка (например, выбранный этаж) и подписчики на каждый кадр — для интерактива поверх сцены */
    var frameCbs = [], marks = new THREE.Group(), pv = new THREE.Vector3();
    var markMat = new THREE.MeshBasicMaterial({ color: COL.red, transparent: true, opacity: 0.3, depthWrite: false, fog: false });
    var markLine = new THREE.LineBasicMaterial({ color: COL.red, fog: false });
    scene.add(marks);
    function render() { place(t); apply(t); renderer.render(scene, camera); for (var i = 0; i < frameCbs.length; i++) frameCbs[i](); }
    function camSettled() { return Math.abs(cam.yaw - camT.yaw) < 0.001 && Math.abs(cam.elev - camT.elev) < 0.001 && Math.abs(cam.zoom - camT.zoom) < 0.001; }
    function loop(now) {
      if (!running) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!reduce) t = Math.min(tMax, t + dt);
      if (Math.abs(yawVel) > 0.0001) { yaw += yawVel; yawVel *= 0.92; }
      var k = 1 - Math.pow(0.02, dt);
      cam.yaw += (camT.yaw - cam.yaw) * k; cam.elev += (camT.elev - cam.elev) * k; cam.zoom += (camT.zoom - cam.zoom) * k;
      render();
      /* Сцена встала (дошла до нужного момента и камера на месте) — не тратим батарею */
      if (t >= tMax && camSettled() && Math.abs(yawVel) <= 0.0001 && !(drag && drag.on)) { running = false; return; }
      raf = requestAnimationFrame(loop);
    }
    function start() { if (running || reduce || held) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    frame(); render();
    stage.classList.add('is-live');

    if ('ResizeObserver' in window) new ResizeObserver(function () { frame(); render(); }).observe(stage);
    else window.addEventListener('resize', function () { frame(); render(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !document.hidden && !held) start(); else stop(); }).observe(stage);
    } else start();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible && !held) start(); });

    /* Вращение пальцем или мышью */
    var drag = null;
    canvas.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, on: false, id: e.pointerId }; });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { drag.on = true; try { canvas.setPointerCapture(drag.id); } catch (err) { } stage.classList.add('is-drag'); }
        else if (Math.abs(dy) > 6) { drag = null; return; }
      }
      if (drag && drag.on) { yawVel = 0; yaw -= (e.clientX - drag.x) * 0.006; drag.x = e.clientX; if (reduce || !running) render(); }
    });
    function endDrag() { if (drag && drag.on) { yawVel = 0; } drag = null; stage.classList.remove('is-drag'); }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    return {
      replay: function () { if (reduce) return; t = 0; tMax = Infinity; stageNow = -1; if (winMesh) winMesh.userData.done = false; start(); },
      reduce: reduce,
      /* Для слайдов: встать на момент t, доиграть до момента, перевести камеру, придержать */
      seek: function (t0) { t = t0; tMax = t0; stageNow = -1; if (winMesh) winMesh.userData.done = false; render(); },
      playTo: function (t1) {
        tMax = t1 == null ? Infinity : t1;
        if (reduce) { t = Math.max(t, tMax === Infinity ? 20 : tMax); render(); return; }
        start();
      },
      look: function (o) {
        o = o || {};
        camT.yaw = o.yaw || 0; camT.elev = o.elev || 0; camT.zoom = o.zoom || 1;
        if (reduce || o.instant) { cam.yaw = camT.yaw; cam.elev = camT.elev; cam.zoom = camT.zoom; render(); }
        if (!reduce) start();
      },
      hold: function (on) { held = !!on; if (held) stop(); else if (visible && !document.hidden) start(); },
      /* Точка сцены → координаты на экране (в пикселях внутри сцены) */
      project: function (x, y, z) { pv.set(x, y, z).project(camera); return { x: (pv.x + 1) / 2 * W, y: (1 - pv.y) / 2 * Hh, on: pv.z > -1 && pv.z < 1 && Math.abs(pv.x) < 1.2 && Math.abs(pv.y) < 1.2 }; },
      onFrame: function (fn) { frameCbs.push(fn); return function () { var i = frameCbs.indexOf(fn); if (i >= 0) frameCbs.splice(i, 1); }; },
      mark: function (list) {
        while (marks.children.length) { var c = marks.children.pop(); if (c.geometry) c.geometry.dispose(); }
        (list || []).forEach(function (m) {
          var g = new THREE.BoxGeometry(m.w, m.h, m.d), mesh = new THREE.Mesh(g, markMat), edge = new THREE.LineSegments(new THREE.EdgesGeometry(g), markLine);
          mesh.position.set(m.x, m.y, m.z); edge.position.set(m.x, m.y, m.z);
          mesh.rotation.y = edge.rotation.y = m.ry || 0;
          marks.add(mesh); marks.add(edge);
        });
        render();
      },
      size: function () { return { w: W, h: Hh }; },
      /* Сдвинуть модель в кадре (доля ширины), например чтобы освободить место под панель */
      nudge: function (dx) { nudge = dx || 0; frame(); render(); },
      time: function () { return t; }
    };
  }

  window.Seven3D = { mount: mount, presets: Object.keys(PRESETS) };
})();
