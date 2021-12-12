import {
  assert,
  assertEquals,
  assertNotEquals,
  assertThrows,
} from 'https://deno.land/std/testing/asserts.ts';
import { getColorIndexForDepth, getPaletteIndexFromRGB } from '../utils.ts';

Deno.test('getColorIndexForDepth', () => {
  // means the color has red
  assertEquals(getColorIndexForDepth({ r: 1, g: 0, b: 0 }, 7), 0b100);
  // means the color has red and green
  assertEquals(getColorIndexForDepth({ r: 1, g: 1, b: 0 }, 7), 0b110);
  // means the color has red, green and blue
  assertEquals(getColorIndexForDepth({ r: 1, g: 1, b: 1 }, 7), 0b111);

  // 10-000-000 => 100
  assertEquals(getColorIndexForDepth({ r: 4, g: 0, b: 0 }, 5), 0b100);
  // means the color has red and green
  assertEquals(getColorIndexForDepth({ r: 4, g: 4, b: 0 }, 5), 0b110);
  // means the color has red, green and blue
  assertEquals(getColorIndexForDepth({ r: 4, g: 4, b: 4 }, 5), 0b111);
});

Deno.test('getPaletteIndexFromRGB', () => {
  const value = { r: 255, g: 255, b: 255 };

  assertEquals(getPaletteIndexFromRGB(value, 1), 0b111);
  assertEquals(getPaletteIndexFromRGB(value, 2), 0b111111);
  assertEquals(getPaletteIndexFromRGB(value, 3), 0b111111111);
  assertEquals(getPaletteIndexFromRGB(value, 4), 0b111111111111);
  assertEquals(getPaletteIndexFromRGB(value, 5), 0b111111111111111);
  assertEquals(getPaletteIndexFromRGB(value, 6), 0b111111111111111111);

  const value2 = { r: 35, g: 38, b: 47 };
  assertEquals(getPaletteIndexFromRGB(value2, 1), 0b000);
  assertEquals(getPaletteIndexFromRGB(value2, 2), 0b111000);
  assertEquals(getPaletteIndexFromRGB(value2, 3), 0b000111000);
  assertEquals(getPaletteIndexFromRGB(value2, 4), 0b001000111000);
  assertEquals(getPaletteIndexFromRGB(value2, 5), 0b011001000111000);
  assertEquals(getPaletteIndexFromRGB(value2, 6), 0b111011001000111000);
  // assertEquals(getPaletteIndexFromRGB(value2, 7), 0b000111000001011111101);

  const value3 = { r: 33, g: 36, b: 45 };
  assertEquals(getPaletteIndexFromRGB(value3, 1), 0b000);
  assertEquals(getPaletteIndexFromRGB(value3, 2), 0b111000);
  assertEquals(getPaletteIndexFromRGB(value3, 3), 0b000111000);
  assertEquals(getPaletteIndexFromRGB(value3, 4), 0b001000111000);
  assertEquals(getPaletteIndexFromRGB(value3, 5), 0b011001000111000);
  // assertEquals(getPaletteIndexFromRGB(value3, 6), 0b000111000001011111);

  const value4 = { r: 34, g: 37, b: 46 };
  assertEquals(getPaletteIndexFromRGB(value4, 1), 0b000);
  assertEquals(getPaletteIndexFromRGB(value4, 2), 0b111000);
  assertEquals(getPaletteIndexFromRGB(value4, 3), 0b000111000);
  assertEquals(getPaletteIndexFromRGB(value4, 4), 0b001000111000);
  assertEquals(getPaletteIndexFromRGB(value4, 5), 0b011001000111000);
  assertEquals(getPaletteIndexFromRGB(value4, 6), 0b101011001000111000);

  const value5 = { r: 168, g: 164, b: 178 };
  assertEquals(getPaletteIndexFromRGB(value5, 1), 0b000);
  assertEquals(getPaletteIndexFromRGB(value5, 2), 0b111000);
  assertEquals(getPaletteIndexFromRGB(value5, 3), 0b001111000);
  assertEquals(getPaletteIndexFromRGB(value5, 4), 0b100001111000);
  assertEquals(getPaletteIndexFromRGB(value5, 5), 0b010100001111000);
  assertEquals(getPaletteIndexFromRGB(value5, 6), 0b001010100001111000);

  const value6 = { r: 30, g: 31, b: 35 };
  assertEquals(getPaletteIndexFromRGB(value6, 1), 0b000);
  assertEquals(getPaletteIndexFromRGB(value6, 2), 0b001000);
  // assertEquals(getPaletteIndexFromRGB(value6, 3), 0b001111000);
  // assertEquals(getPaletteIndexFromRGB(value6, 4), 0b100001111000);
  // assertEquals(getPaletteIndexFromRGB(value6, 5), 0b010100001111000);
  // assertEquals(getPaletteIndexFromRGB(value6, 6), 0b001010100001111000);

  const value7 = { r: 128, g: 154, b: 169 };
  assertEquals(getPaletteIndexFromRGB(value7, 2), 0b001000);
});
