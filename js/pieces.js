// Desenhos das peças, especiais e obstáculos (SVG -> imagem)

const S = {};

S.a = `<defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFC2DA"/><stop offset=".55" stop-color="#FF8DBA"/><stop offset="1" stop-color="#D9467F"/></radialGradient></defs>
<path d="M14 22C10 12 22 8 30 14c12-6 28-6 40 0 8-6 20-2 16 8 6 12 6 30 0 44 4 10-8 16-16 10-12 6-28 6-40 0-8 6-20 0-16-10C8 54 8 34 14 22z" fill="url(#g)" stroke="#B83A6C" stroke-width="2.5"/>
<path d="M30 30q20 8 40 0M30 70q20-8 40 0" fill="none" stroke="#E0629A" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="50" cy="50" r="6" fill="#C9447D"/><circle cx="48" cy="48" r="2.2" fill="#FFD3E5"/>
<ellipse cx="34" cy="28" rx="11" ry="6" fill="#fff" opacity=".55" transform="rotate(-20 34 28)"/>`;

S.x = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3C76D6"/><stop offset=".35" stop-color="#7DB6FF"/><stop offset="1" stop-color="#2F62B8"/></linearGradient></defs>
<path d="M30 14q4 6 0 12M44 10q4 7 0 14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>
<path d="M70 44h6a12 12 0 0 1 0 24h-8" fill="none" stroke="#2F62B8" stroke-width="8" stroke-linecap="round"/>
<path d="M16 34h56v30a22 22 0 0 1-22 22H38a22 22 0 0 1-22-22z" fill="url(#g)" stroke="#244E94" stroke-width="2.5"/>
<ellipse cx="44" cy="34" rx="28" ry="7" fill="#A9D0FF" stroke="#244E94" stroke-width="2.5"/>
<ellipse cx="44" cy="35" rx="21" ry="4" fill="#7A4A2E"/>
<rect x="24" y="44" width="7" height="26" rx="3.5" fill="#fff" opacity=".45"/>`;

S.p = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8EE07A"/><stop offset="1" stop-color="#2F8F3A"/></linearGradient><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F09464"/><stop offset="1" stop-color="#B9532E"/></linearGradient></defs>
<path d="M50 56C28 54 16 38 20 18c18 2 30 16 30 38z" fill="url(#g)" stroke="#256F2E" stroke-width="2.5"/>
<path d="M50 56c22-2 34-18 30-38-18 2-30 16-30 38z" fill="url(#g)" stroke="#256F2E" stroke-width="2.5"/>
<path d="M50 58C44 40 46 20 50 8c4 12 6 32 0 50z" fill="#5FC25A" stroke="#256F2E" stroke-width="2.5"/>
<path d="M24 56h52l-6 32H30z" fill="url(#v)" stroke="#8E3B1E" stroke-width="2.5" stroke-linejoin="round"/>
<rect x="20" y="52" width="60" height="10" rx="4" fill="#E58156" stroke="#8E3B1E" stroke-width="2.5"/>
<path d="M30 30q6 8 14 12" fill="none" stroke="#C8F5B8" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;

S.l = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A2FF"/><stop offset="1" stop-color="#6A43C2"/></linearGradient></defs>
<path d="M24 12h50a6 6 0 0 1 6 6v64a6 6 0 0 1-6 6H24z" fill="url(#g)" stroke="#4A2A96" stroke-width="2.5"/>
<path d="M24 80h52v8H28a4 4 0 0 1-4-4z" fill="#FFF4DD" stroke="#4A2A96" stroke-width="2.5"/>
<rect x="18" y="12" width="12" height="76" rx="4" fill="#5A35B0" stroke="#4A2A96" stroke-width="2.5"/>
<rect x="40" y="28" width="28" height="7" rx="3.5" fill="#EBDDFF"/><rect x="40" y="40" width="18" height="6" rx="3" fill="#EBDDFF" opacity=".8"/>
<path d="M62 12v22l5-4 5 4V12" fill="#FF7FA8" stroke="#B83A6C" stroke-width="2"/>
<rect x="34" y="16" width="5" height="58" rx="2.5" fill="#fff" opacity=".3"/>`;

S.b = `<defs><radialGradient id="g" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#FFF6C9"/><stop offset=".5" stop-color="#FFD84A"/><stop offset="1" stop-color="#E59E0E"/></radialGradient></defs>
<g stroke="#FFD84A" stroke-width="4" stroke-linecap="round" opacity=".8"><path d="M50 4v8M14 20l6 6M86 20l-6 6M6 46h8M86 46h8"/></g>
<path d="M50 14a28 28 0 0 1 18 49c-4 4-6 8-6 13H38c0-5-2-9-6-13a28 28 0 0 1 18-49z" fill="url(#g)" stroke="#B9760A" stroke-width="2.5"/>
<path d="M42 62q8-14 16 0" fill="none" stroke="#C98612" stroke-width="2.5"/>
<rect x="37" y="74" width="26" height="8" rx="3" fill="#B9BEC5" stroke="#6E747C" stroke-width="2"/>
<rect x="39" y="82" width="22" height="7" rx="3" fill="#9AA0A8" stroke="#6E747C" stroke-width="2"/>
<ellipse cx="40" cy="30" rx="8" ry="11" fill="#fff" opacity=".6" transform="rotate(25 40 30)"/>`;

S.h = `<defs><radialGradient id="g" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#FFB0BC"/><stop offset=".5" stop-color="#FF5470"/><stop offset="1" stop-color="#C21A3A"/></radialGradient></defs>
<path d="M50 86C20 66 8 50 10 32 12 16 30 10 42 18c4 3 6 6 8 10 2-4 4-7 8-10 12-8 30-2 32 14 2 18-10 34-40 54z" fill="url(#g)" stroke="#991230" stroke-width="2.5"/>
<ellipse cx="30" cy="30" rx="9" ry="6" fill="#fff" opacity=".7" transform="rotate(-30 30 30)"/>
<circle cx="66" cy="28" r="3" fill="#fff" opacity=".5"/>`;

const rocket = `<defs><linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9D4E3"/></linearGradient></defs>
<path d="M50 10c14 10 20 26 18 44H32c-2-18 4-34 18-44z" fill="url(#r)" stroke="#3B4A66" stroke-width="2.5"/>
<path d="M50 10c6 4 11 10 14 17H36c3-7 8-13 14-17z" fill="#FF5470" stroke="#3B4A66" stroke-width="2.5"/>
<circle cx="50" cy="38" r="7" fill="#7DB6FF" stroke="#3B4A66" stroke-width="2.5"/><circle cx="48" cy="36" r="2.4" fill="#fff"/>
<path d="M32 44l-12 14 14-2zM68 44l12 14-14-2z" fill="#FF5470" stroke="#3B4A66" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M38 56q12 34 24 0z" fill="#FFC23D" stroke="#E07A0E" stroke-width="2"/><path d="M44 58q6 18 12 0z" fill="#FFF0A8"/>`;
S.rocketV = rocket;
S.rocketH = `<g transform="rotate(90 50 50)">${rocket}</g>`;

S.plane = `<path d="M8 50L92 14 70 86 50 60z" fill="#FFFFFF" stroke="#3B4A66" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M92 14L50 60l-6 22 6-22" fill="#BFD9FF" stroke="#3B4A66" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M8 50l42 10L92 14z" fill="#FFD3E5" stroke="#3B4A66" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M14 76q8-4 14 2" fill="none" stroke="#7DB6FF" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 5"/>`;

S.bomb = `<defs><radialGradient id="g" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#7A86A8"/><stop offset=".55" stop-color="#3B4566"/><stop offset="1" stop-color="#1D2338"/></radialGradient></defs>
<circle cx="46" cy="56" r="32" fill="url(#g)" stroke="#121729" stroke-width="2.5"/>
<rect x="56" y="18" width="16" height="12" rx="3" transform="rotate(35 64 24)" fill="#8A93AD" stroke="#121729" stroke-width="2.5"/>
<path d="M70 18q6-10 14-6" fill="none" stroke="#9B6A43" stroke-width="3.5" stroke-linecap="round"/>
<path d="M86 4l3 7 7 1-6 4 2 8-6-5-7 3 3-7-5-5 7-1z" fill="#FFD84A" stroke="#E07A0E" stroke-width="1.5"/>
<ellipse cx="34" cy="44" rx="9" ry="6" fill="#fff" opacity=".45" transform="rotate(-35 34 44)"/>
<path d="M30 64q16 10 30 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25"/>`;

S.rainbow = `<defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#F5F0FF"/><stop offset="1" stop-color="#C9B8F0"/></radialGradient><clipPath id="c"><circle cx="50" cy="50" r="38"/></clipPath></defs>
<circle cx="50" cy="50" r="38" fill="url(#g)" stroke="#5A3FA0" stroke-width="2.5"/>
<g clip-path="url(#c)" fill="none" stroke-width="7" opacity=".9">
<path d="M8 70a42 42 0 0 1 84 0" stroke="#FF5470"/><path d="M15 70a35 35 0 0 1 70 0" stroke="#FF9F3D"/><path d="M22 70a28 28 0 0 1 56 0" stroke="#FFD84A"/>
<path d="M29 70a21 21 0 0 1 42 0" stroke="#5FC25A"/><path d="M36 70a14 14 0 0 1 28 0" stroke="#5B9BEA"/><path d="M43 70a7 7 0 0 1 14 0" stroke="#9A73E0"/></g>
<ellipse cx="36" cy="28" rx="10" ry="6" fill="#fff" opacity=".8" transform="rotate(-25 36 28)"/>
<path d="M76 14l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#FFD84A"/>`;

S.box = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7B97A"/><stop offset="1" stop-color="#B98247"/></linearGradient></defs>
<rect x="6" y="10" width="88" height="82" rx="8" fill="url(#g)" stroke="#7A5126" stroke-width="3"/>
<path d="M6 32h88" stroke="#9C6C38" stroke-width="3"/><rect x="40" y="10" width="20" height="82" fill="#F2DDB0" stroke="#9C6C38" stroke-width="2"/>
<path d="M16 60h14M16 70h10" stroke="#8A5A2C" stroke-width="3" stroke-linecap="round"/>
<path d="M70 52l8 8m0-8l-8 8" stroke="#8A5A2C" stroke-width="3" stroke-linecap="round"/>`;

S.box2 = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A566"/><stop offset="1" stop-color="#9C6A34"/></linearGradient></defs>
<rect x="6" y="10" width="88" height="82" rx="8" fill="url(#g)" stroke="#5E3C17" stroke-width="3"/>
<path d="M6 10l88 82M94 10L6 92" stroke="#6E747C" stroke-width="7" stroke-linecap="round"/>
<path d="M6 10l88 82M94 10L6 92" stroke="#B9BEC5" stroke-width="3" stroke-linecap="round"/>
<g fill="#9AA0A8" stroke="#4E545C" stroke-width="2"><rect x="4" y="8" width="16" height="16" rx="3"/><rect x="80" y="8" width="16" height="16" rx="3"/><rect x="4" y="78" width="16" height="16" rx="3"/><rect x="80" y="78" width="16" height="16" rx="3"/></g>`;

S.mud = `<defs><radialGradient id="g" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#9C7048"/><stop offset="1" stop-color="#5E3F22"/></radialGradient></defs>
<path d="M14 40c-6-14 10-28 24-22 6-10 26-10 30 2 14-2 24 12 18 24 10 10 2 30-14 28-6 10-26 12-32 2-14 4-28-6-24-18-10-4-8-14-2-16z" fill="url(#g)" stroke="#3E2812" stroke-width="2.5"/>
<g fill="#3E2812" opacity=".7"><ellipse cx="38" cy="50" rx="6" ry="7"/><circle cx="31" cy="40" r="3"/><circle cx="38" cy="37" r="3"/><circle cx="45" cy="40" r="3"/>
<ellipse cx="64" cy="66" rx="6" ry="7"/><circle cx="57" cy="56" r="3"/><circle cx="64" cy="53" r="3"/><circle cx="71" cy="56" r="3"/></g>
<ellipse cx="30" cy="28" rx="8" ry="4" fill="#fff" opacity=".25"/>`;

S.tape = `<g opacity=".92"><rect x="-6" y="40" width="112" height="20" rx="3" transform="rotate(45 50 50)" fill="#D9DEE5" stroke="#8A929C" stroke-width="2"/>
<rect x="-6" y="40" width="112" height="20" rx="3" transform="rotate(-45 50 50)" fill="#E9EDF2" stroke="#8A929C" stroke-width="2"/>
<path d="M30 30l40 40" stroke="#fff" stroke-width="3" opacity=".6" transform="rotate(90 50 50)"/></g>`;

S.bone = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E3D9C6"/></linearGradient></defs>
<path d="M28 34a10 10 0 1 1-6-18 10 10 0 1 1 18 6l26 26a10 10 0 1 1 18 6 10 10 0 1 1-6 18 10 10 0 1 1-18-6L34 40a10 10 0 0 1-6-6z" fill="url(#g)" stroke="#9C8A6A" stroke-width="3" stroke-linejoin="round"/>
<path d="M36 30l30 30" stroke="#fff" stroke-width="3" opacity=".7"/>`;

S.dirt = `<path d="M10 30c4-14 22-20 32-12 10-8 30-6 36 6 12 2 16 18 8 26 6 12-4 26-18 22-8 10-28 10-36 0-14 2-24-12-18-24-10-6-8-16-4-18z" fill="#C79A6A" opacity=".55"/>
<g fill="#A97A4C" opacity=".6"><circle cx="30" cy="34" r="5"/><circle cx="66" cy="62" r="6"/><circle cx="52" cy="40" r="3"/><circle cx="38" cy="66" r="4"/></g>`;
S.dirt2 = `<path d="M8 28c4-16 24-22 34-14 12-10 34-6 40 8 12 4 16 20 8 28 6 14-6 28-20 24-10 10-30 10-38 0-16 2-26-14-20-26-10-6-8-18-4-20z" fill="#8F6338" opacity=".75"/>
<g fill="#6E4826" opacity=".75"><circle cx="30" cy="34" r="6"/><circle cx="66" cy="62" r="7"/><circle cx="54" cy="38" r="4"/><circle cx="36" cy="66" r="5"/><circle cx="70" cy="34" r="4"/></g>`;

S.hammer = `<rect x="44" y="40" width="12" height="52" rx="5" fill="#C9955B" stroke="#7A5126" stroke-width="2.5"/>
<rect x="18" y="14" width="64" height="28" rx="8" fill="#8A93AD" stroke="#3B4566" stroke-width="2.5"/><rect x="24" y="18" width="24" height="6" rx="3" fill="#fff" opacity=".5"/>`;
S.broom = `<rect x="46" y="6" width="8" height="54" rx="4" fill="#C9955B" stroke="#7A5126" stroke-width="2.5" transform="rotate(20 50 50)"/>
<path d="M30 56h40l8 36H22z" fill="#FFD84A" stroke="#B9760A" stroke-width="2.5" transform="rotate(20 50 50)"/>
<path d="M36 62l-4 26M50 62v28M64 62l4 26" stroke="#E0A11E" stroke-width="2.5" transform="rotate(20 50 50)"/>`;
S.shuffle = `<path d="M10 30h18c18 0 22 40 42 40h12M10 70h18c8 0 12-8 16-16M56 38c4-6 8-8 14-8h12" fill="none" stroke="#3B2A3F" stroke-width="8" stroke-linecap="round"/>
<path d="M76 18l14 12-14 12zM76 58l14 12-14 12z" fill="#3B2A3F"/>`;

S.star = `<path d="M50 6l13 27 30 4-22 21 6 30-27-15-27 15 6-30L7 37l30-4z" fill="#FFC23D" stroke="#E0A11E" stroke-width="3" stroke-linejoin="round"/><ellipse cx="40" cy="30" rx="8" ry="5" fill="#fff" opacity=".6" transform="rotate(-30 40 30)"/>`;

export const SVG_IDS = Object.keys(S);

export function svgString(id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${S[id]}</svg>`;
}

export function svgUrl(id) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString(id));
}

const cache = {};
export function loadSprites(px) {
  const jobs = SVG_IDS.map(id => new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = px;
      c.getContext('2d').drawImage(img, 0, 0, px, px);
      cache[id] = c;
      res();
    };
    img.onerror = () => res();
    img.src = svgUrl(id);
  }));
  return Promise.all(jobs).then(() => cache);
}

export function sprite(id) { return cache[id]; }
