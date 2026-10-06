// Gera os desenhos do README no estilo Excalidraw: traço "feito à mão" (Rough.js)
// e letra Virgil, a fonte clássica do Excalidraw (OFL 1.1).
// As letras viram path, porque o GitHub serve SVG com CSP que bloqueia fonte embutida.
// Cada desenho sai em versão clara e escura (no escuro o traço fica claro).
// Uso: npm run desenhos
import { mkdirSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';
import rough from 'roughjs';
import { decompress } from 'wawoff2';

const SAIDA = 'assets/desenhos';
const LARANJA = '#FF7A33';
const TINTA = { light: '#1e1e1e', dark: '#e6edf3' };
const LARANJA_TEXTO = { light: '#C2410C', dark: '#FF7A33' };

const SAUDACAO = 'Olá, mundo! Eu sou o Weuden';
const LINHA = 'Software Engineer · chatPro · Goiânia, GO';
const FRASE = 'Extensões, automações e produtos web que resolvem problema de verdade.';
const TITULOS = {
  'sobre-mim': 'Sobre mim',
  'alem-do-codigo': 'Além do código',
  'tech-stacks': 'Tech Stacks',
  'projetos': 'Projetos em destaque',
  'github-stats': 'GitHub Stats',
};

const baixar = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ao baixar ${url}`);
  return r;
};

const woff2 = await (await baixar('https://raw.githubusercontent.com/excalidraw/virgil/main/Virgil.woff2')).arrayBuffer();
const ttf = await decompress(new Uint8Array(woff2));
const virgil = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));
const capAltura = (t) => ((virgil.tables.os2?.sCapHeight || virgil.ascender * 0.72) / virgil.unitsPerEm) * t;
const largura = (s, t) => virgil.getAdvanceWidth(s, t);
// texto com o meio das maiúsculas em yMeio
const letras = (s, t, x, yMeio, cor) =>
  `<path d="${virgil.getPath(s, x, yMeio + capAltura(t) / 2, t).toPathData(2)}" fill="${cor}"/>`;

// 👋 do Noto Emoji (imagens em Apache 2.0), embutido como desenho
const emoji = (await (await baixar('https://raw.githubusercontent.com/googlefonts/noto-emoji/main/2D/svg/emoji_u1f44b.svg')).text())
  .replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
const emojiEm = (x, y, t) => emoji.replace(/^<svg\b[^>]*>/,
  `<svg x="${x}" y="${y}" width="${t}" height="${t}" viewBox="0 0 128 128" xmlns:xlink="http://www.w3.org/1999/xlink">`);

const gen = rough.generator();
const traco = (d) => gen.toPaths(d).map((p) =>
  `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill ?? 'none'}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
const retArredondado = (x, y, w, h, r) =>
  `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} ` +
  `L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;

const svg = (w, h, rotulo, corpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${rotulo}"><title>${rotulo}</title>${corpo}</svg>\n`;

mkdirSync(SAIDA, { recursive: true });
const salvar = (nome, conteudo) => { writeFileSync(`${SAIDA}/${nome}`, conteudo); console.log(`${SAIDA}/${nome}`); };

for (const tema of ['light', 'dark']) {
  // banner
  {
    const W = 1200, H = 270, tS = 66, tE = 76, tL = 30;
    const caixa = traco(gen.path(retArredondado(14, 14, W - 28, H - 28, 34), {
      seed: 7, roughness: 1.8, bowing: 1.6, stroke: TINTA[tema], strokeWidth: 3, fill: LARANJA, fillStyle: 'solid',
    }));
    const wS = largura(SAUDACAO, tS), x0 = (W - (tE + 22 + wS)) / 2, y1 = H * 0.42;
    salvar(`banner-${tema}.svg`, svg(W, H, `${SAUDACAO}. ${LINHA}`, caixa +
      emojiEm(x0, y1 - tE / 2 - 4, tE) +
      letras(SAUDACAO, tS, x0 + tE + 22, y1, '#1e1e1e') +
      letras(LINHA, tL, (W - largura(LINHA, tL)) / 2, H * 0.71, '#1e1e1e')));
  }
  // frase
  {
    const t = 30, W = Math.ceil(largura(FRASE, t)) + 20, H = 56;
    salvar(`frase-${tema}.svg`, svg(W, H, FRASE, letras(FRASE, t, 10, H / 2, LARANJA_TEXTO[tema])));
  }
  // títulos das seções, com sublinhado laranja à mão
  let seed = 11;
  for (const [slug, titulo] of Object.entries(TITULOS)) {
    const t = 36, w = largura(titulo, t), W = Math.ceil(w) + 40, H = 70;
    const sub = traco(gen.curve([[16, 54], [W * 0.35, 58], [W * 0.7, 52], [W - 14, 56]], {
      seed: seed++, roughness: 1.4, stroke: LARANJA, strokeWidth: 3.2,
    }));
    salvar(`titulo-${slug}-${tema}.svg`, svg(W, H, titulo, sub + letras(titulo, t, 20, 28, TINTA[tema])));
  }
}

// rodapé: rabisco laranja (serve nos dois temas)
{
  const W = 1200, H = 70, pts = [];
  for (let x = 20; x <= W - 20; x += 40) pts.push([x, 35 + Math.sin(x / 55) * 14]);
  salvar('rodape.svg', svg(W, H, '', traco(gen.curve(pts, { seed: 3, roughness: 1.2, stroke: LARANJA, strokeWidth: 3.5 }))));
}
