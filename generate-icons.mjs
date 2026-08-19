import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Two open curly quote marks — circle head + curved tapered tail, same fill so they merge visually
const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FDF6E3"/>
  <g fill="#4A3020">
    <!-- Left quote curl: ball + tail -->
    <circle cx="190" cy="175" r="52"/>
    <path d="
      M 170,218
      C 154,268 158,324 183,368
      C 190,381 203,383 210,374
      C 199,344 194,307 197,270
      C 199,249 210,233 222,222
      C 215,209 203,201 192,205
      C 184,209 178,218 170,218
      Z
    "/>

    <!-- Right quote curl: ball + tail -->
    <circle cx="322" cy="175" r="52"/>
    <path d="
      M 302,218
      C 286,268 290,324 315,368
      C 322,381 335,383 342,374
      C 331,344 326,307 329,270
      C 331,249 342,233 354,222
      C 347,209 335,201 324,205
      C 316,209 310,218 302,218
      Z
    "/>
  </g>
</svg>`;

function generateIcon(size, outputPath) {
  const resvg = new Resvg(svgTemplate, {
    fitTo: { mode: 'width', value: size },
  });
  const png = resvg.render().asPng();
  writeFileSync(outputPath, png);
  console.log(`Generated ${size}x${size} → ${outputPath}`);
}

generateIcon(512, join(__dirname, 'public', 'icon-512.png'));
generateIcon(192, join(__dirname, 'public', 'icon-192.png'));
