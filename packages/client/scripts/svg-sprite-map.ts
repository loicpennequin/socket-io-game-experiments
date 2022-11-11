import type { Plugin } from 'vite';
import glob from 'glob-promise';
import fs from 'fs-extra';
import path from 'path';
import SvgSpriter from 'svg-sprite';
// @ts-ignore
import chokidar from 'chokidar';

export type PluginOptions = {
  src: string;
  spriteDest: string;
  linksDest: string;
};

type GenerateSpriteOptions = {
  filePaths: string[];
  dest: string;
};

function generateSpriteMap({ filePaths, dest }: GenerateSpriteOptions) {
  const spriter = new SvgSpriter({
    dest,
    shape: {
      id: {
        //@ts-ignore
        generator: file => {
          return file.replace('.svg', '');
        }
      },
      dimension: {
        attributes: false
      }
    },
    svg: {
      dimensionAttributes: false
    },
    mode: { symbol: true }
  });
  filePaths.forEach(filePath => {
    spriter.add(
      filePath,
      //@ts-ignore
      null,
      fs.readFileSync(filePath, { encoding: 'utf-8' })
    );
  });

  return new Promise((resolve, reject) => {
    spriter.compile(function (error, result) {
      if (error) reject(error);

      resolve(result.symbol.sprite.contents.toString());
    });
  });
}

export default function ({
  src,
  spriteDest,
  linksDest
}: PluginOptions): Plugin[] {
  const generate = async () => {
    const filePaths = await glob(src);

    const spriteMap = (
      (await generateSpriteMap({
        filePaths,
        dest: spriteDest
      })) as string
    ).replace('<?xml version="1.0" encoding="utf-8"?>', '');

    const dest = path.join(process.cwd(), 'public', spriteDest);

    fs.ensureFileSync(dest);
    fs.writeFileSync(dest, spriteMap);

    fs.ensureDirSync(linksDest);
    filePaths.forEach(filePath => {
      const fileName = filePath.split('/').reverse()[0];
      const id = fileName.replace('.svg', '');
      fs.writeFileSync(
        path.join(linksDest, fileName),
        `<svg viewBox="0 0 100 100"><use xlink:href="${spriteDest}#${id}"></use></svg>`
      );
    });
  };

  return [
    {
      name: 'vite-plugin-svg-sprite-map',
      enforce: 'pre',
      async buildStart() {
        await generate();
      }
    },
    {
      name: 'vite-plugin-svg-sprite-map:dev',
      enforce: 'pre',
      apply: 'serve',
      async buildStart() {
        const watcher = chokidar.watch(src, {
          ignored: /(^|[/\\])\../, // ignore dotfiles
          persistent: true
        });

        watcher.on('change', generate).on('unlink', generate);
      }
    }
  ];
}
