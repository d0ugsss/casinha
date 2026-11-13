// Casa em 3D: cena do cômodo, itens, personagens parados e toque
import * as THREE from 'three';
import { buildQuintalBase, buildItem, buildGhost, ghostMat, CHAR_SPOTS } from './quintal.js';
import { CHARS } from './data.js';

const ROOM_BUILDERS = { quintal: { base: buildQuintalBase, item: buildItem, ghost: buildGhost, spots: CHAR_SPOTS, center: [0.1, 0.3, -0.35], radius: 7.6, elev: 0.56, yaw: 0.06 } };

function sparkTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  gr.addColorStop(0, 'rgba(255,245,200,1)'); gr.addColorStop(0.3, 'rgba(255,214,90,.5)'); gr.addColorStop(1, 'rgba(255,214,90,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(32, 3); g.quadraticCurveTo(35, 29, 61, 32); g.quadraticCurveTo(35, 35, 32, 61); g.quadraticCurveTo(29, 35, 3, 32); g.quadraticCurveTo(29, 29, 32, 3); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function blobTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(50,30,40,.42)'); gr.addColorStop(1, 'rgba(50,30,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export class House {
  constructor(host, hooks = {}) {
    this.host = host;
    this.hooks = hooks;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'house-canvas';
    host.appendChild(this.canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    this.scene.add(new THREE.HemisphereLight('#FFFFFF', '#D9CBB8', 1.3));
    const sun = new THREE.DirectionalLight('#FFF1DC', 2.3);
    sun.position.set(4, 7, 4.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    Object.assign(sun.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 25 });
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
    sun.shadow.camera.layers.enable(1);
    this.scene.add(sun);
    this.sparkTex = sparkTexture();
    this.blobTex = blobTexture();
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.items = {}; this.ghosts = {}; this.chars = {}; this.sparks = []; this.anims = [];
    this.yaw = 0; this.yawTarget = 0;
    this.loader = new THREE.TextureLoader();
    this.texCache = {};
    this.ray = new THREE.Raycaster();
    this.bind();
    this.resize();
    this.loop = this.loop.bind(this);
    this.clock = new THREE.Clock();
  }

  bind() {
    let down = null;
    this.canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, yaw: this.yawTarget, moved: false }; });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 6) down.moved = true;
      if (down.moved) this.yawTarget = Math.max(-0.5, Math.min(0.5, down.yaw - dx * 0.004));
    });
    window.addEventListener('pointerup', e => {
      if (!down) return;
      const d = down; down = null;
      if (!d.moved && e.target === this.canvas) this.tapAt(e.clientX, e.clientY);
    });
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.camera.aspect = w / h;
    // mais estreito (celular em pé) abre o campo de visão pra caber o cômodo
    const want = 5.4;
    const hfov = 2 * Math.atan(want / 2 / (this.cfg ? this.cfg.radius : 7.4));
    const vfov = 2 * Math.atan(Math.tan(hfov / 2) / this.camera.aspect);
    this.camera.fov = THREE.MathUtils.clamp(vfov * 180 / Math.PI, 26, 70);
    // desce o cômodo um pouco: o painel de baixo cobre o fim da tela
    this.camera.setViewOffset(w, h, 0, -Math.round(h * 0.08), w, h);
    this.camera.updateProjectionMatrix();
  }

  tex(name) {
    if (!this.texCache[name]) {
      this.texCache[name] = new Promise(res => this.loader.load(`assets/chars/${name}.webp`, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res(t); }, undefined, () => res(null)));
    }
    return this.texCache[name];
  }

  async loadRoom(roomId, placed = {}, extras = {}) {
    const cfg = ROOM_BUILDERS[roomId];
    this.cfg = cfg;
    this.roomId = roomId;
    this.root.clear();
    this.items = {}; this.ghosts = {}; this.chars = {};
    this.root.add(cfg.base());
    for (const id of Object.keys(extras.allItems || {})) {
      if (placed[id] !== undefined) this.setItem(id, placed[id], false);
      else this.showGhost(id);
    }
    if (extras.plaque) this.setItem('plaquinha', 0, false);
    this.yaw = this.yawTarget = cfg.yaw;
    this.resize();
  }

  showGhost(id) {
    if (this.ghosts[id]) return;
    const g = this.cfg.ghost(id);
    this.ghosts[id] = g;
    this.root.add(g);
  }

  setItem(id, style, animate = true) {
    if (this.ghosts[id]) { this.root.remove(this.ghosts[id]); delete this.ghosts[id]; }
    if (this.items[id]) this.root.remove(this.items[id]);
    const obj = this.cfg.item(id, style);
    this.items[id] = obj;
    this.root.add(obj);
    if (animate) {
      obj.scale.setScalar(0.01);
      this.anims.push({ t: 0, dur: 0.75, fn: k => { const e = 1 - Math.pow(2, -10 * k) * Math.cos(k * 10.5); obj.scale.setScalar(Math.max(0.01, e)); } });
      this.sparkle(obj);
    }
  }

  sparkle(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
    for (let i = 0; i < 26; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.sparkTex, transparent: true, depthWrite: false, toneMapped: false, color: i % 3 ? '#FFE08A' : '#FFFFFF' }));
      sp.position.set(c.x + (Math.random() - 0.5) * Math.max(0.6, s.x), c.y + (Math.random() - 0.2) * Math.max(0.5, s.y), c.z + (Math.random() - 0.5) * Math.max(0.6, s.z));
      const size = 0.08 + Math.random() * 0.14;
      sp.scale.setScalar(size);
      this.root.add(sp);
      this.sparks.push({ sp, vy: 0.3 + Math.random() * 0.5, life: 1 + Math.random() * 0.8, t: 0, size });
    }
  }

  async setCharacters(list) {
    const want = new Set(list.map(c => c.id));
    for (const id of Object.keys(this.chars)) if (!want.has(id)) { this.root.remove(this.chars[id].group); delete this.chars[id]; }
    for (const c of list) {
      if (this.chars[c.id]) { this.chars[c.id].glow = !!c.glow; continue; }
      const def = CHARS[c.id];
      const spot = (c.spot || this.cfg.spots[c.id] || [0, 0]);
      const t = await this.tex(def.img);
      if (!t || this.chars[c.id]) continue;
      const h = def.h, ar = t.image.width / t.image.height;
      const group = new THREE.Group();
      group.position.set(spot[0], 0, spot[1]);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(h * ar, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, toneMapped: false }));
      plane.position.y = h / 2;
      plane.userData.char = c.id;
      group.add(plane);
      const caster = new THREE.Mesh(plane.geometry, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
      caster.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
      caster.castShadow = true; caster.layers.set(1); caster.position.y = h / 2;
      group.add(caster);
      const blob = new THREE.Mesh(new THREE.PlaneGeometry(h * ar * 1.2, h * ar * 0.6), new THREE.MeshBasicMaterial({ map: this.blobTex, transparent: true, depthWrite: false }));
      blob.rotation.x = -Math.PI / 2; blob.position.y = 0.05;
      group.add(blob);
      const ring = new THREE.Mesh(new THREE.RingGeometry(h * ar * 0.55, h * ar * 0.68, 40), new THREE.MeshBasicMaterial({ color: '#FFC23D', transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06;
      group.add(ring);
      this.root.add(group);
      this.chars[c.id] = { group, plane, caster, ring, h, glow: !!c.glow, phase: Math.random() * 6 };
    }
  }

  // posição na tela da cabeça de cada personagem (pros balões e o "!")
  headPositions() {
    const out = {};
    const r = this.canvas.getBoundingClientRect();
    for (const [id, ch] of Object.entries(this.chars)) {
      const v = new THREE.Vector3(0, ch.h * 1.02, 0).applyMatrix4(ch.group.matrixWorld).project(this.camera);
      out[id] = { x: (v.x + 1) / 2 * r.width + r.left, y: (1 - v.y) / 2 * r.height + r.top, glow: ch.glow };
    }
    return out;
  }

  tapAt(x, y) {
    const r = this.canvas.getBoundingClientRect();
    const p = new THREE.Vector2((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(p, this.camera);
    const planes = Object.values(this.chars).map(c => c.plane);
    const hitC = this.ray.intersectObjects(planes, false);
    for (const h of hitC) {
      if (this.alphaAt(h)) { this.hooks.onCharTap && this.hooks.onCharTap(h.object.userData.char); return; }
    }
    const hitI = this.ray.intersectObjects(Object.values(this.items), true);
    if (hitI.length && hitI[0].object.userData.item) this.hooks.onItemTap && this.hooks.onItemTap(hitI[0].object.userData.item);
  }

  alphaAt(hit) {
    const img = hit.object.material.map && hit.object.material.map.image;
    if (!img || !hit.uv) return true;
    if (!this._probe) { this._probe = document.createElement('canvas'); this._probe.width = this._probe.height = 1; this._pg = this._probe.getContext('2d', { willReadFrequently: true }); }
    this._pg.clearRect(0, 0, 1, 1);
    this._pg.drawImage(img, Math.floor(hit.uv.x * img.width), Math.floor((1 - hit.uv.y) * img.height), 1, 1, 0, 0, 1, 1);
    return this._pg.getImageData(0, 0, 1, 1).data[3] > 60;
  }

  start() { if (this.running) return; this.running = true; this.clock.getDelta(); requestAnimationFrame(this.loop); }
  stop() { this.running = false; }

  loop() {
    if (!this.running) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    const t = this.clock.elapsedTime;
    this.yaw += (this.yawTarget - this.yaw) * Math.min(1, dt * 8);
    const cfg = this.cfg;
    if (cfg) {
      const [cx, cy, cz] = cfg.center;
      const R = cfg.radius;
      this.camera.position.set(cx + Math.sin(this.yaw) * R * Math.cos(cfg.elev), cy + R * Math.sin(cfg.elev), cz + Math.cos(this.yaw) * R * Math.cos(cfg.elev));
      this.camera.lookAt(cx, cy, cz);
    }
    for (const ch of Object.values(this.chars)) {
      const look = this.camera.position.clone(); look.y = ch.group.position.y;
      ch.group.lookAt(look);
      ch.plane.scale.y = 1 + Math.sin(t * 2.2 + ch.phase) * 0.012;
      ch.plane.position.y = ch.h / 2 * ch.plane.scale.y;
      ch.ring.visible = ch.glow;
      if (ch.glow) { const k = (Math.sin(t * 4) + 1) / 2; ch.ring.material.opacity = 0.45 + k * 0.5; ch.ring.scale.setScalar(1 + k * 0.12); }
    }
    ghostMat.opacity = 0.18 + (Math.sin(t * 2.5) + 1) * 0.07;
    this.anims = this.anims.filter(a => { a.t += dt; a.fn(Math.min(1, a.t / a.dur)); return a.t < a.dur; });
    this.sparks = this.sparks.filter(s => {
      s.t += dt; s.sp.position.y += s.vy * dt;
      const k = s.t / s.life;
      s.sp.material.opacity = 1 - k;
      s.sp.scale.setScalar(s.size * (1 + Math.sin(s.t * 12) * 0.25));
      if (k >= 1) { this.root.remove(s.sp); return false; }
      return true;
    });
    this.renderer.render(this.scene, this.camera);
    this.hooks.onFrame && this.hooks.onFrame(this);
    requestAnimationFrame(this.loop);
  }
}
