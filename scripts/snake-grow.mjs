// Faz a cobrinha do Platane/snk crescer conforme come as contribuições.
// O snk desenha uma cobra fixa de 4 partes (s0 é a cabeça; s1..s3 repetem o
// caminho dela com 1..3 passos de atraso). Aqui entram partes novas (s4, s5…)
// que seguem a cabeça com mais atraso e só aparecem depois de N comidas.
// Uso: node scripts/snake-grow.mjs dist/snake-light.svg dist/snake-dark.svg
import { readFileSync, writeFileSync } from 'node:fs';

const COMIDAS_POR_PARTE = 4; // +1 parte a cada 4 células comidas
const MAX_PARTES = 30;
const CELULA = 16; // sizeCell do snk
const PASSO_MS = 100; // stepDurationMs do snk

const pct = (t) => `${+(t * 100).toFixed(2)}%`;

function crescer(svg) {
  const css = svg.match(/<style>([\s\S]*?)<\/style>/)[1];
  const N = Math.round(+css.match(/\.s\{[^}]*?(\d+)ms/)[1] / PASSO_MS);

  // Caminho da cabeça, passo a passo, a partir dos keyframes de s0.
  const corpo = css.match(/@keyframes s0\{(.*?\})\}/)[1];
  const kf = [];
  for (const m of corpo.matchAll(/([\d.,%]+)\{transform:translate\((-?[\d.]+)px,(-?[\d.]+)px\)\}/g))
    for (const t of m[1].split(',')) kf.push({ t: parseFloat(t) / 100, x: +m[2], y: +m[3] });
  kf.sort((a, b) => a.t - b.t);
  const cabeca = Array.from({ length: N }, (_, k) => {
    const t = k / N;
    let i = kf.findIndex((f, j) => j < kf.length - 1 && f.t <= t && kf[j + 1].t >= t);
    if (i < 0) i = kf.length - 2;
    const a = kf[i], b = kf[i + 1], u = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
    const r = (v) => Math.round(v / CELULA) * CELULA;
    return { x: r(a.x + u * (b.x - a.x)), y: r(a.y + u * (b.y - a.y)) };
  });

  // Momento (0..1) de cada célula comida.
  const comidas = [...css.matchAll(/@keyframes c[0-9a-z]+\{([\d.]+)%/g)].map((m) => +m[1] / 100).sort((a, b) => a - b);
  const total = Math.min(MAX_PARTES, 4 + Math.floor(comidas.length / COMIDAS_POR_PARTE));

  const estilos = [], rects = [];
  for (let i = total - 1; i >= 4; i--) {
    // posição da parte i no passo k = onde a cabeça estava i passos antes
    const pos = Array.from({ length: N }, (_, k) => ({ t: k / N, ...cabeca[(k - i + N) % N] }));
    const enxuto = pos.filter((p, j) => {
      if (j === 0 || j === pos.length - 1) return true;
      const a = pos[j - 1], b = pos[j + 1];
      return !(Math.abs((a.x + b.x) / 2 - p.x) < 0.01 && Math.abs((a.y + b.y) / 2 - p.y) < 0.01);
    });
    const aparece = comidas[(i - 3) * COMIDAS_POR_PARTE - 1];
    estilos.push(
      `@keyframes s${i}{${enxuto.map((p) => `${pct(p.t)}{transform:translate(${p.x}px,${p.y}px)}`).join('')}}`,
      `@keyframes g${i}{0%,${pct(aparece)}{opacity:0}${pct(aparece + 0.0002)},100%{opacity:1}}`,
      `.s.s${i}{transform:translate(${pos[0].x}px,${pos[0].y}px);opacity:0;animation-name:s${i},g${i}}`,
    );
    rects.push(`<rect class="s s${i}" x="3.2" y="3.2" width="9.6" height="9.6" rx="3.2" ry="3.2"/>`);
  }

  const novo = svg
    .replace('</style>', estilos.join('') + '</style>')
    .replace('<rect class="s s0"', rects.join('') + '<rect class="s s0"');
  return { novo, N, comidas: comidas.length, total };
}

for (const arquivo of process.argv.slice(2)) {
  const { novo, N, comidas, total } = crescer(readFileSync(arquivo, 'utf8'));
  writeFileSync(arquivo, novo);
  console.log(`${arquivo}: ${comidas} comidas em ${N} passos, cresce de 4 até ${total} partes`);
}
