// Gera o topo do README: a onda laranja do capsule-render (sem texto) com o nome
// desenhado nas fontes da Vortexi (Paytone One e Space Grotesk).
// As letras viram contorno vetorial (path): o GitHub serve o SVG com CSP que
// bloqueia fonte embutida, e assim o desenho não depende de fonte nenhuma.
// Uso: npm run header -- [fonte do nome] [fonte da linha de baixo] [saída]
import { writeFileSync } from 'node:fs';
import opentype from 'opentype.js';

const NOME = 'Weuden Reis';
const LINHA = 'Software Engineer · chatPro · Goiânia, GO';
const [fNome = 'Paytone One', fLinha = 'Space Grotesk', saida = 'assets/header.svg'] = process.argv.slice(2);
const PESO = { 'Space Grotesk': 600, 'Poppins': 700, 'Montserrat': 700, 'Outfit': 700 };
const COR = '#FFF7ED';

// Sem User-Agent de navegador, o Google Fonts entrega TTF, que o opentype.js lê.
async function fonte(familia, peso) {
  const fam = familia.replace(/ /g, '+') + (peso ? `:wght@${peso}` : '');
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${fam}`)).text();
  const url = css.match(/src:\s*url\(([^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`fonte não encontrada: ${familia}`);
  return opentype.parse(await (await fetch(url)).arrayBuffer());
}

// Texto centralizado em x, com o meio da altura das maiúsculas em yMeio.
function texto(font, str, tamanho, largura, yMeio, extra = '') {
  const w = font.getAdvanceWidth(str, tamanho);
  const cap = ((font.tables.os2?.sCapHeight || font.ascender * 0.7) / font.unitsPerEm) * tamanho;
  const d = font.getPath(str, (largura - w) / 2, yMeio + cap / 2, tamanho).toPathData(2);
  return `<path d="${d}" fill="${COR}"${extra}/>`;
}

const H = 250;
const onda = await (await fetch(`https://capsule-render.vercel.app/api?type=wave&height=${H}&color=0:C2410C%2C100:FF7A33`)).text();
const corpo = onda.slice(onda.indexOf('>') + 1, onda.lastIndexOf('</svg>')).replace(/<style>[\s\S]*?<\/style>/, '').trim();
const vb = onda.match(/viewBox="([^"]+)"/)[1];
const [, , vw, vh] = vb.split(/\s+/).map(Number);

const nome = texto(await fonte(fNome, PESO[fNome]), NOME, fNome === 'Press Start 2P' ? 40 : 60, vw, Math.round(vh * 0.25));
const linha = texto(await fonte(fLinha, PESO[fLinha] ? 600 : undefined), LINHA, 19, vw, Math.round(vh * 0.425), ' opacity=".92"');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="${vb}" role="img" aria-label="${NOME}, ${LINHA}">
  <title>${NOME}, ${LINHA}</title>
  ${corpo}
  ${nome}
  ${linha}
</svg>
`;
writeFileSync(saida, svg);
console.log(saida, Math.round(svg.length / 1024) + ' KB', fNome, '/', fLinha);
