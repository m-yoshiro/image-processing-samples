import {
  assert,
  assertEquals,
  assertExists,
  assertNotEquals,
  assertThrows,
} from 'https://deno.land/std/testing/asserts.ts';
import { join } from 'https://deno.land/std/path/mod.ts';
import { OctreeQuantizer } from '../Octree.ts';
import { getPaletteIndexFromRGB } from '../utils.ts';

import { Image } from 'https://deno.land/x/imagescript@1.2.9/mod.ts';

const basePath = join(Deno.cwd(), 'src/colorQuant/tests');

function generatePixels(): Uint8ClampedArray {
  const maxLength = 10;
  const pixels = new Uint8ClampedArray(maxLength * 4);

  // generates unique colors
  for (let i = 0; i < maxLength * 4; i += 4) {
    pixels[i] = i;
    pixels[i + 1] = i * 2;
    pixels[i + 2] = i * 3;
    pixels[i + 3] = 255;
  }

  return pixels;
}

const pixels = generatePixels();

Deno.test('initialization', () => {
  const quantizer = new OctreeQuantizer();
  assertEquals(pixels.length, 10 * 4);
  assertEquals(quantizer._levels.length, 5 + 1);
});

Deno.test('_createOctreeNode', () => {
  const quantizer = new OctreeQuantizer();
  quantizer.quantize(pixels);

  // each pixel has a unique color, so this result is the same number of pixels;
  assertEquals(quantizer.getLeaves().length, 10);
});

Deno.test('_removeLeavesAt', () => {
  const quantizer = new OctreeQuantizer();
  quantizer.quantize(pixels);

  assertEquals(quantizer.getLeaves().length, 10);
  assert(quantizer.getNodesbyLevel(4).length > 0);
  quantizer.getLeaves().forEach((leaf) => {
    assertEquals(leaf.depth, 5);
  });

  quantizer.removeLeavesAt(4);
  assertEquals(quantizer.getNodesbyLevel(5).length, 0);

  quantizer.getLeaves().forEach((leaf) => {
    assertEquals(leaf.depth, 4);
  });

  assertEquals(
    quantizer.getLeaves().map((node) => node.refCount).reduce(
      (prev, current) => prev + current,
      0,
    ),
    10,
  );

  assertEquals(quantizer.getLeaves().length, 7);
});

Deno.test('_getLeaves', () => {
  const quantizer = new OctreeQuantizer();
  quantizer.quantize(pixels);

  assertEquals(quantizer.getLeaves().length, 10);
});

Deno.test('_palette', async () => {
  const img = await Deno.readFile(join(basePath, 'sample.png'));
  const rawImageData = await Image.decode(img);
  const bitmap = rawImageData.bitmap;
  const quantizer = new OctreeQuantizer(2);

  quantizer.quantize(bitmap);
  const palette = quantizer.palette();

  assert(palette.size > 0);
  // TODO: write test codes more
});

Deno.test('Quantizer.quantize', () => {
  const quantizer = new OctreeQuantizer();
  quantizer.quantize(pixels);

  // only maxLevel nodes have refCount over 0.
  assert(quantizer._levels[1].every((node) => node.refCount === 0));
  assert(quantizer._levels[2].every((node) => node.refCount === 0));
  assert(quantizer._levels[3].every((node) => node.refCount === 0));
  assert(quantizer._levels[4].some((node) => node.refCount > 0));

  // Throw error
  assertThrows(() => quantizer.removeLeavesAt(1), Error);
  assertThrows(() => quantizer.removeLeavesAt(6), Error);
});

Deno.test('all process', async () => {
  const MAX_DEPTH = 2;
  const img = await Deno.readFile(join(basePath, 'sample.png'));
  const rawImageData = await Image.decode(img);
  const bitmap = rawImageData.bitmap;
  const resultBitmap = new Uint8ClampedArray(bitmap.length);
  let errs = [];

  // ===============================
  // Start

  // Initialize Octree.
  const quantizer = new OctreeQuantizer(MAX_DEPTH);

  // 1. make Octree using bitmap
  quantizer.quantize(bitmap);

  // 2. make palette from Octree made before
  const palette = quantizer.palette();

  // 3. generate new pixels by mapping with palette color
  for (let i = 0; i < bitmap.length; i += 4) {
    const paletteIndex = getPaletteIndexFromRGB(
      { r: bitmap[i], g: bitmap[i + 1], b: bitmap[i + 2] },
      MAX_DEPTH,
    );

    const color = palette.get(paletteIndex);
    if (color) {
      resultBitmap[i] = color.r;
      resultBitmap[i + 1] = color.g;
      resultBitmap[i + 2] = color.b;
      resultBitmap[i + 3] = 255;
    } else {
      resultBitmap[i] = 0;
      resultBitmap[i + 1] = 0;
      resultBitmap[i + 2] = 0;
      resultBitmap[i + 3] = 255;
      errs.push([paletteIndex, {
        r: bitmap[i],
        g: bitmap[i + 1],
        b: bitmap[i + 2],
      }]);
    }
  }
  assertEquals(errs.length, 0, errs.toString());

  rawImageData.bitmap.set(resultBitmap);
  const encoded = await rawImageData.encode(1);
  await Deno.writeFile(
    join(basePath, 'dist', `output-depth${MAX_DEPTH}.png`),
    encoded,
  );
});
