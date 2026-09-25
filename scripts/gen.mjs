// Gera os SVGs do README de perfil (banner + cards), em tema claro e escuro.
// Uso: node scripts/gen.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const THEMES = {
  dark: {
    bg1: '#0d1117', bg2: '#161b26', border: '#262c38', grid: '#1c2230',
    title: '#e6edf3', text: '#9aa4b2', muted: '#6b7482', accent: '#8b93ff', chip: '#1b2130',
  },
  light: {
    bg1: '#ffffff', bg2: '#f4f6fa', border: '#d9dee7', grid: '#e9edf3',
    title: '#111827', text: '#4b5563', muted: '#8a93a3', accent: '#4f56d6', chip: '#eef0f6',
  },
};

const FONT = `font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"`;
const MONO = `font-family="'JetBrains Mono', Consolas, 'SFMono-Regular', Menlo, monospace"`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function banner(t) {
  const W = 1200, H = 300;
  let grid = '';
  for (let x = 0; x <= W; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 0; y <= H; y += 40) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.bg1}"/><stop offset="1" stop-color="${t.bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.3" r="0.55">
      <stop offset="0" stop-color="${t.accent}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
    <clipPath id="r"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  </defs>
  <style>
    .cursor { animation: blink 1.1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    .scan { animation: scan 6s ease-in-out infinite; }
    @keyframes scan { 0% { transform: translateX(-420px); } 100% { transform: translateX(${W}px); } }
    @media (prefers-reduced-motion: reduce) { .cursor, .scan { animation: none; } }
  </style>
  <g clip-path="url(#r)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g stroke="${t.grid}" stroke-width="1" mask="url(#m)">${grid}</g>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect class="scan" x="0" y="${H - 2}" width="420" height="2" fill="${t.accent}" opacity="0.55"/>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${t.border}"/>
  </g>
  <text x="72" y="92" ${MONO} font-size="18" fill="${t.accent}">~/weuden-reis<tspan fill="${t.muted}"> $ whoami</tspan><tspan class="cursor" fill="${t.accent}"> ▍</tspan></text>
  <text x="70" y="160" ${FONT} font-size="58" font-weight="700" fill="${t.title}" letter-spacing="-1">Weuden Reis</text>
  <text x="72" y="200" ${FONT} font-size="22" fill="${t.text}">Software Engineer <tspan fill="${t.muted}">·</tspan> chatPro <tspan fill="${t.muted}">·</tspan> Goiânia, GO</text>
  <text x="72" y="242" ${FONT} font-size="17" fill="${t.muted}">Extensões, automações e produtos web que resolvem problema de verdade.</text>
  <g transform="translate(930 70)" ${MONO} font-size="14" fill="${t.muted}">
    <text x="0" y="0"><tspan fill="${t.accent}">const</tspan> <tspan fill="${t.title}">stack</tspan> = [</text>
    <text x="20" y="26">'TypeScript', 'React',</text>
    <text x="20" y="50">'Next.js', 'Supabase',</text>
    <text x="20" y="74">'Python', 'Chrome MV3',</text>
    <text x="0" y="98">];</text>
  </g>
</svg>
`;
}

function card(t, p) {
  const W = 420, H = 150;
  const chips = p.tags.map((tag) => tag);
  let x = 24, chipSvg = '';
  for (const c of chips) {
    const w = c.length * 7.2 + 20;
    chipSvg += `<rect x="${x}" y="106" width="${w}" height="24" rx="12" fill="${t.chip}" stroke="${t.border}"/><text x="${x + w / 2}" y="122" text-anchor="middle" ${FONT} font-size="12" fill="${t.text}">${esc(c)}</text>`;
    x += w + 8;
  }
  const lines = p.desc.map((l, i) => `<text x="24" y="${72 + i * 20}" ${FONT} font-size="14" fill="${t.text}">${esc(l)}</text>`).join('');
  const star = p.stars ? `<text x="${W - 24}" y="40" text-anchor="end" ${FONT} font-size="13" fill="${t.muted}">★ ${p.stars}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.bg2}" stroke="${t.border}"/>
  <rect x="24" y="26" width="4" height="18" rx="2" fill="${t.accent}"/>
  <text x="38" y="41" ${FONT} font-size="17" font-weight="600" fill="${t.title}">${esc(p.name)}</text>
  ${star}
  ${lines}
  ${chipSvg}
</svg>
`;
}

const PROJECTS = [
  { file: 'chatpro-alert', name: 'chatpro-alert', stars: 5,
    desc: ['Extensão Chrome que destaca conversas do chatPro', 'sem resposta há mais de 5 minutos.'],
    tags: ['JavaScript', 'Chrome Extension'] },
  { file: 'transcricao', name: 'extensao_transcricao',
    desc: ['Extensão que transcreve as ligações', 'do Google Meet com o cliente.'],
    tags: ['TypeScript', 'Chrome MV3', 'Docker'] },
  { file: 'controle-financeiro', name: 'controle-financeiro', stars: 1,
    desc: ['Controle financeiro pessoal com gráficos,', 'relatórios em PDF e login.'],
    tags: ['Next.js', 'Supabase', 'Recharts'] },
  { file: 'portfolio', name: 'portfolio', stars: 1,
    desc: ['Portfólio pessoal com animações', 'em GSAP e Framer Motion.'],
    tags: ['Next.js', 'React 19', 'Tailwind'] },
];

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(new URL(`banner-${name}.svg`, OUT), banner(t));
  for (const p of PROJECTS) writeFileSync(new URL(`card-${p.file}-${name}.svg`, OUT), card(t, p));
}
console.log('ok');
