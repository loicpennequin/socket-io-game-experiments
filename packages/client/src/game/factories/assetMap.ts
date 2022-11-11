import { sum } from '@game/shared-utils';

export type CreateAssetMapOptions = {
  baseSize: number;
  gap: number;
};

export const createAssetMap = (
  assets: HTMLImageElement[],
  { gap, baseSize }: CreateAssetMapOptions
) => {
  const canvas = document.createElement('canvas');
  canvas.width = sum(...assets.map(a => a.naturalWidth));
  canvas.height = Math.max(...assets.map(a => a.naturalHeight));
  const ctx = canvas.getContext('2d');

  assets.forEach((asset, i) => {
    const offsetX =
      sum(...assets.slice(0, i).map(a => a.naturalWidth)) + i * gap;
    ctx?.drawImage(asset, offsetX, 0, asset.naturalWidth, asset.naturalHeight);
  });

  return {
    canvas,
    get(
      x: number,
      y: number,
      size: number,
      isFlipped?: boolean
    ): [number, number, number, number] {
      return [
        x * baseSize + x * gap,
        y * baseSize,
        isFlipped ? baseSize * size * -1 : baseSize * size,
        baseSize * size
      ];
    }
  };
};

export type AssetMap = Map<string, HTMLImageElement>;
// export type AssetMap = ReturnType<typeof createAssetMap>;
