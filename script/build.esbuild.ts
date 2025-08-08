import * as esbuild from 'esbuild';
import * as path from 'path';
import { copy } from 'esbuild-plugin-copy';
import { sync } from 'fast-glob';
// 发布之前构建
async function main() {
  const isMin = process.argv.includes('--min');
  let options: esbuild.BuildOptions = {
    platform: 'node',
    bundle: true,
    sourcemap: !isMin,
    entryPoints: sync('*', { onlyDirectories: true, cwd: 'packages' }).map(
      (item) => {
        return {
          in: `packages/${item}/index.ts`,
          out: `${item}/index`,
        };
      },
    ),
    charset: 'utf8',
    splitting: false,
    outdir: path.join(process.cwd(), '/dist'),
    format: 'esm',
    keepNames: false,
    outExtension: {
      '.js': '.mjs',
    },
    minify: isMin,
    treeShaking: false,
    tsconfig: 'tsconfig.build.json',
    packages: 'external',
    external: ['@piying/orm/core'],
    plugins: [
      copy({
        resolveFrom: 'cwd',
        once: true,
        assets: [
          { from: `./assets/*`, to: './dist' },
          { from: `./readme.md`, to: './dist/readme.md' },
        ],
      }),
    ],
  };
  await esbuild.build(options);
}
main();
