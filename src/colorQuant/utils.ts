import { RGB } from './Color.ts';

/**
 * @param value : a RGB color value;
 * @param depth : a level of depths
 * @returns : Index number at level of depths
 */
export function getColorIndexForDepth(value: RGB, depth: number): number {
  let index = 0;
  const mask = 0b10000000 >> depth;

  if (value.r & mask) {
    index |= 0b100; // turn on a bit of red.
  }
  if (value.g & mask) {
    index |= 0b010;
  }
  if (value.b & mask) {
    index |= 0b001;
  }

  return index;
}

export function normalizeColor(value: RGB, dividedNumber: number): RGB {
  dividedNumber = dividedNumber || 1;

  return {
    r: Math.min(Math.floor(value.r / dividedNumber), 255),
    g: Math.min(Math.floor(value.g / dividedNumber), 255),
    b: Math.min(Math.floor(value.b / dividedNumber), 255),
  };
}

/**
 * @param value RGB
 * @param depth {1...6}
 */
export function getPaletteIndexFromRGB(value: RGB, depth: number): number {
  if (depth === 1) {
    return getColorIndexForDepth(value, depth);
  } else if (depth === 2) {
    return (getColorIndexForDepth(value, depth) << 3) |
      getColorIndexForDepth(value, depth - 1);
  } else if (depth === 3) {
    return (getColorIndexForDepth(value, depth) << 6) |
      (getColorIndexForDepth(value, depth - 1) << 3) |
      getColorIndexForDepth(value, depth - 2);
  } else if (depth === 4) {
    return (getColorIndexForDepth(value, depth) << 9) |
      (getColorIndexForDepth(value, depth - 1) << 6) |
      (getColorIndexForDepth(value, depth - 2) << 3) |
      getColorIndexForDepth(value, depth - 3);
  } else if (depth === 5) {
    return (getColorIndexForDepth(value, depth) << 12) |
      (getColorIndexForDepth(value, depth - 1) << 9) |
      (getColorIndexForDepth(value, depth - 2) << 6) |
      (getColorIndexForDepth(value, depth - 3) << 3) |
      getColorIndexForDepth(value, depth - 4);
  } else if (depth === 6) {
    return (getColorIndexForDepth(value, depth) << 15) |
      (getColorIndexForDepth(value, depth - 1) << 12) |
      (getColorIndexForDepth(value, depth - 2) << 9) |
      (getColorIndexForDepth(value, depth - 3) << 6) |
      (getColorIndexForDepth(value, depth - 4) << 3) |
      getColorIndexForDepth(value, depth - 5);
  } else {
    return -1;
  }
}
