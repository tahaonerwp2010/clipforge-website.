(() => {
  const REPO = 'tahaonerwp2010/ClipForge';           // GitHub user/repo that holds your releases
  const BASE = `https://github.com/${REPO}/releases/latest/download/`;
  const FILES = { 'windows': 'ClipForge-Setup-windows-x64.exe', 'mac-arm': 'ClipForge-mac-arm64.dmg', 'mac-intel': 'ClipForge-mac-x64.dmg', 'linux': 'ClipForge-linux-x64.AppImage', 'android': 'ClipForge-android-arm64.apk' };
  const PORTABLE = 'ClipForge-windows-x64.exe';
  const NAMES = { windows: 'Windows', 'mac-arm': 'Mac', 'mac-intel': 'Mac', linux: 'Linux', android: 'Android' };
  const FALLBACK_COUNT = 1000;                         // shown until the real number loads
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ---- download links + device detection ----
  $$('.dl-card').forEach(a => a.href = BASE + FILES[a.dataset.os]);
  $('#portable').href = BASE + PORTABLE;
  function detect() {
    const ua = navigator.userAgent || '', p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua) || (/Mac/.test(p) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/win/i.test(p) || /windows/i.test(ua)) return 'windows';
    if (/mac/i.test(p) || /Macintosh/.test(ua)) {
      try { const gl = document.createElement('canvas').getContext('webgl'); const e = gl && gl.getExtension('WEBGL_debug_renderer_info'); const r = e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : ''; if (/Intel/i.test(r) && !/Apple/i.test(r)) return 'mac-intel'; } catch {}
      return 'mac-arm';
    }
    if (/linux|x11|cros/i.test(p + ua)) return 'linux';
    return 'unknown';
  }
  const os = detect(), mine = $(`.dl-card[data-os="${os}"]`), hero = $('[data-hero-dl]');
  if (mine) {
    mine.classList.add('me'); $('#dlGrid').prepend(mine);
    $('#detected').textContent = `We found your device: ${NAMES[os]}${os === 'mac-arm' ? ' (Apple Silicon)' : os === 'mac-intel' ? ' (Intel)' : ''}.`;
    hero.innerHTML = `Download for ${NAMES[os]} <svg viewBox="0 0 24 24" width="14" height="14"><path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="currentColor"/></svg>`; hero.href = BASE + FILES[os]; hero.dataset.dl = '';
  } else if (os === 'ios') $('#detected').textContent = 'iPhone and iPad are not supported yet. Open this page on a computer or an Android phone.';

  // ---- odometer + live counter (GitHub release download counts) ----
  const odo = $('#odo'); let digits = [];
  function build(n) {
    const s = n.toLocaleString('en-US'); odo.innerHTML = ''; digits = [];
    for (const ch of s) {
      if (ch === ',') { const c = document.createElement('span'); c.className = 'sep'; c.textContent = ','; odo.appendChild(c); digits.push(null); continue; }
      const d = document.createElement('span'); d.className = 'd'; const col = document.createElement('div');
      col.innerHTML = '0123456789'.split('').map(x => `<i>${x}</i>`).join(''); d.appendChild(col); odo.appendChild(d); digits.push(col);
    }
  }
  function show(n) {
    const s = n.toLocaleString('en-US'); if (!digits.length || digits.length !== s.length) build(n);
    [...s].forEach((ch, i) => { if (digits[i] && ch !== ',') digits[i].style.transform = `translateY(${-(+ch) * 1.15}em)`; });
  }
  let target = FALLBACK_COUNT;
  try { const c = JSON.parse(localStorage.getItem('cf_count') || 'null'); if (c && c.all) target = c.all; } catch {}
  build(target); show(0); requestAnimationFrame(() => setTimeout(() => show(target), 300));
  async function pull() {
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) throw 0; const rel = await r.json(); const by = { Windows: 0, Mac: 0, Linux: 0, Android: 0 }; let all = 0;
      for (const x of rel) for (const a of x.assets || []) {
        const n = a.name.toLowerCase(), c = a.download_count || 0;
        if (/\.exe$/.test(n)) by.Windows += c; else if (/\.dmg$/.test(n)) by.Mac += c; else if (/\.appimage$/.test(n)) by.Linux += c; else if (/\.apk$/.test(n)) by.Android += c; else continue; all += c;
      }
      target = all; show(target);
      $('#split').textContent = Object.entries(by).filter(e => e[1]).map(e => `${e[0]} ${e[1].toLocaleString('en-US')}`).join(' · ');
      try { localStorage.setItem('cf_count', JSON.stringify({ all })); } catch {}
    } catch {}
  }
  pull(); setInterval(pull, 90000);
  $$('[data-dl]').forEach(a => a.addEventListener('click', () => { if (/releases\/latest\/download/.test(a.href)) { target += 1; show(target); setTimeout(pull, 20000); } }));

  // ---- intro, nav, progress ----
  const ready = () => { document.documentElement.classList.add('ready'); hs.classList.add('show'); };
  addEventListener('load', () => setTimeout(ready, 500)); setTimeout(ready, 3000);
  const nav = $('#nav'), bar = $('#bar'), hs = $('.hero'); let heroIn = true, started = false;
  let tick = false;
  function frame() {
    tick = false;
    nav.classList.toggle('solid', scrollY > hs.offsetHeight - 120);
    bar.style.transform = `scaleX(${scrollY / Math.max(1, document.body.scrollHeight - innerHeight)})`;
    lit();
  }
  function onScroll() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  $('#yr').textContent = new Date().getFullYear();

  // ---- reveal on scroll ----
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.intersectionRatio >= .15) { if (!e.target.classList.contains('in')) { e.target.classList.add('in'); if (e.target.dataset.n) count(e.target); } } else if (!e.isIntersecting) e.target.classList.remove('in'); }), { threshold: [0, .15] });
  $$('.rv').forEach(el => io.observe(el));
  new IntersectionObserver(es => { const e = es[0]; if (!document.documentElement.classList.contains('ready')) return; if (e.isIntersecting && e.intersectionRatio > .25) hs.classList.add('show'); else if (!e.isIntersecting) hs.classList.remove('show'); heroIn = e.isIntersecting; }, { threshold: [0, .25] }).observe(hs);
  function count(el) { const b = $('b', el); if (!b) return; const n = +b.dataset.n, t0 = performance.now(); (function f(t) { const k = clamp((t - t0) / 1400, 0, 1); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); }
  $$('.bx.num').forEach(e => { e.dataset.n = 1; });

  // ---- words that light up while you scroll ----
  const litEl = $('#lit'); const parts = []; let litK = -1;
  (function split(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(t => { if (!t.trim()) { f.appendChild(document.createTextNode(t)); return; } const s = document.createElement('span'); s.textContent = t; f.appendChild(s); parts.push(s); }); n.replaceWith(f); }
      else if (n.nodeType === 1) split(n);
    });
  })(litEl);
  function lit() {
    const r = litEl.getBoundingClientRect(), p = clamp((innerHeight * .82 - r.top) / (r.height + innerHeight * .25), 0, 1.02);
    const k = Math.floor(p * parts.length); if (k === litK) return; litK = k; parts.forEach((s, i) => s.classList.toggle('on', i < k));
  }

  // ---- story: auto-advances on a timer, click any step to jump ----
  const st = $('#story'), stSteps = $$('#steps li'), DUR = 5500; let cur = 0, stTimer, stVis = false;
  st.style.setProperty('--dur', DUR + 'ms');
  function setStep(i) {
    cur = (i + stSteps.length) % stSteps.length; st.dataset.step = cur;
    stSteps.forEach((l, j) => { l.classList.remove('on'); l.setAttribute('aria-selected', j === cur); });
    void st.offsetWidth; stSteps[cur].classList.add('on');            // restarts the progress bar
    clearTimeout(stTimer); if (stVis) stTimer = setTimeout(() => setStep(cur + 1), DUR);
  }
  stSteps.forEach((l, i) => { l.addEventListener('click', () => setStep(i)); l.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStep(i); } }); });
  new IntersectionObserver(es => { stVis = es[0].isIntersecting; st.classList.toggle('paused', !stVis); if (stVis) setStep(cur); else clearTimeout(stTimer); }, { threshold: .35 }).observe(st);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(stTimer); st.classList.add('paused'); } else if (stVis) { st.classList.remove('paused'); setStep(cur); } });
  setStep(0);
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  // ---- caption stage runner ----
  const SENT = 'this one habit changed everything for me'.split(' ');
  function runStage(root, styles, opt = {}) {
    const words = $('.words', root), big = $('.big', root); let si = 0, timer, vis = true;
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(root);
    const render = () => { words.innerHTML = SENT.map(w => `<span>${w}</span>`).join(' '); if (big) big.textContent = ''; };
    function go(n) {
      if (!vis) { timer = setTimeout(() => go(n), 600); return; }
      const sp = $$('span', words);
      if (n >= sp.length) { timer = setTimeout(() => { if (styles.length > 1) { si = (si + 1) % styles.length; root.dataset.style = styles[si]; opt.onStyle && opt.onStyle(si); } render(); go(0); }, 1500); return; }
      sp.forEach((s, i) => { s.classList.toggle('on', i <= n); s.classList.toggle('now', i === n); });
      if (big && root.dataset.style === 'behind' && sp[n].textContent === 'everything') { big.textContent = 'EVERYTHING'; big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); }
      timer = setTimeout(() => go(n + 1), 430);
    }
    root.dataset.style = styles[0]; opt.onStyle && opt.onStyle(0); render(); go(0);
  }
  const heroStage = $('#heroStage'); runStage(heroStage, ['hormozi', 'behind', 'gold', 'neon', 'comic', 'pill']);
  const pills = $('#capPills'), NAMES2 = ['Hormozi Yellow', 'Gold Sweep', 'Neon Glow', 'Comic Slam', 'Yellow Pill'];
  pills.innerHTML = NAMES2.map(n => `<i>${n}</i>`).join('');
  runStage($('#capStage'), ['hormozi', 'gold', 'neon', 'comic', 'pill'], { onStyle: i => $$('i', pills).forEach((e, j) => e.classList.toggle('on', i === j)) });
  runStage($('#behStage'), ['behind']);

  // ---- your preview video replaces the live demo as soon as it exists ----
  const v = $('#demo');
  v.addEventListener('loadeddata', () => { heroStage.style.display = 'none'; });
  const src = v.querySelector('source'); src.addEventListener('error', () => v.classList.add('nov'));
  v.play && v.play().catch(() => {});

  // ---- waveform, languages ----
  $('#wave').innerHTML = Array.from({ length: 34 }, (_, i) => `<i style="--h:${20 + Math.abs(Math.sin(i * 1.7) * 60) + (i % 5) * 4}px;--dl:${(i % 9) * .11}s"></i>`).join('');
  const hello = $('#hello'), HI = ['Hello', 'नमस्ते', 'مرحبا', 'Hola', 'Bonjour', 'こんにちは', 'Salaam']; let hi = 0;
  setInterval(() => { hello.classList.add('out'); setTimeout(() => { hi = (hi + 1) % HI.length; hello.textContent = HI[hi]; hello.dir = /[؀-ۿ]/.test(HI[hi]) ? 'rtl' : 'ltr'; hello.classList.remove('out'); }, 400); }, 2200);
  const two = $$('.two i'); let tw = 0; setInterval(() => { tw ^= 1; two.forEach((e, i) => e.classList.toggle('on', i === tw)); }, 1800);

  // ---- terrain parallax (cheap: transforms only, hero only) ----
  const lays = $$('.lay'); let mx = 0, my = 0, pt = false;
  function par() { pt = false; const sy = scrollY; lays.forEach(l => { const d = +l.dataset.d; l.style.transform = `translate3d(${(-mx * 34 * d).toFixed(1)}px,${(sy * d * .18 - my * 8 * d).toFixed(1)}px,0)`; }); }
  const reqPar = () => { if (!pt && heroIn) { pt = true; requestAnimationFrame(par); } };
  if (matchMedia('(hover:hover)').matches) addEventListener('scroll', reqPar, { passive: true });
  if (matchMedia('(hover:hover)').matches && !reduce) addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; reqPar(); }, { passive: true });

  // ---- phone tilt (desktop) ----
  const ph = $('#phone');
  let tx = 0, ty = 0, tt = false;
  if (matchMedia('(hover:hover)').matches && !reduce) addEventListener('pointermove', e => {
    tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
    if (!tt && heroIn) { tt = true; requestAnimationFrame(() => { tt = false; ph.style.transform = `perspective(900px) rotateY(${tx * 10}deg) rotateX(${-ty * 6}deg)`; }); }
  }, { passive: true });
})();
