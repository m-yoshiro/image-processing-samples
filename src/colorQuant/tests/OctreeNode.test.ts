import {
  assert,
  assertEquals,
  assertExists,
  assertNotEquals,
  assertObjectMatch,
  assertThrows,
} from 'https://deno.land/std/testing/asserts.ts';
import { OctreeNode } from '../OctreeNode.ts';
import { RGB } from '../Color.ts';
import { getColorIndexForDepth } from '../utils.ts';

const value: RGB = {
  r: 118, // 0b01110110
  g: 100, // 0b01100100
  b: 38, //  0b00100110
};
const expectedIndecies = [0, 6, 7, 4, 0, 7];

// 5, 4, 1, 5, 2, 1, 6, 4
const value2: RGB = {
  r: 211, // 0b11010011
  g: 10, //  0b00001010
  b: 180, // 0b10110100
};

Deno.test('Octree initialization', () => {
  assertThrows(() => {
    new OctreeNode(value, -1, 5);
    new OctreeNode(value, 6, 5);
  });

  const node = new OctreeNode(value, 4, 5);
  assertEquals(node.refCount, 0);

  const leafNode = new OctreeNode(value, 5, 5);
  assertEquals(leafNode.refCount, 1);
});

Deno.test('_createChildRecursive', () => {
  const rootNode = new OctreeNode(value, 0, 5);
  rootNode.createChildRecursive(value);

  // const node2 = new OctreeNode({ r: 35, g: 38, b: 47 }, 0, 5);
  const node2 = new OctreeNode({ r: 37, g: 37, b: 45 }, 0, 5);
  node2.createChildRecursive({ r: 35, g: 38, b: 47 });
  node2.createChildRecursive({ r: 37, g: 37, b: 45 });
  node2.createChildRecursive({ r: 168, g: 164, b: 178 });
  console.log(node2.getLeaves());

  // depth 0 - 5
  [
    rootNode.children[0],
    rootNode.children[0]?.children[6],
    rootNode.children[0]?.children[6]?.children[7],
    rootNode.children[0]?.children[6]?.children[7]?.children[4],
    rootNode.children[0]?.children[6]?.children[7]?.children[4]?.children[0],
  ].forEach((child, i) => {
    assertExists(child);

    if (i < 4) {
      assert(!child.isLeaf);
      assertEquals(child.refCount, 0);
      assertEquals(child.value, { r: 0, g: 0, b: 0 });
    } else {
      assert(child.isLeaf);
      assertEquals(child.refCount, 1);
      assertEquals(child.value, value);
    }
  });

  // depth 6~
  assert(
    rootNode.children[0]?.children[6]?.children[7]?.children[4]?.children[0]
      ?.children[7] === undefined,
  );

  // Second
  rootNode.createChildRecursive(value);
  assertEquals(
    (rootNode.children[0]?.children[6]?.children[7]?.children[4]?.children[0])
      ?.refCount,
    2,
  );
  assertEquals(
    (rootNode.children[0]?.children[6]?.children[7]?.children[4]?.children[0])
      ?.value,
    { r: value.r * 2, g: value.g * 2, b: value.b * 2 },
  );
});

Deno.test('_getChildWithDepth', () => {
  const node = new OctreeNode(value, 0, 5);
  node.createChildRecursive(value);

  assertThrows(
    () => {
      node.getChildWithDepth(value, 0);
    },
    Error,
    'can not traverse to the parent level',
  );

  assertThrows(
    () => {
      node.getChildWithDepth(value, 6);
    },
    Error,
    'nooooo',
  );

  for (let i = 1; i < 5; i++) {
    const level = i;
    const childLevel = i + 1;
    const childNode = node.getChildWithDepth(value, level);

    assertExists(childNode);
    assertEquals(childNode.depth, childLevel);

    if (!childNode.isLeaf) {
      childNode.children.forEach((child) => {
        assertExists(child);
        assertEquals(child.depth, childLevel + 1);

        if (child.isLeaf) {
          assertEquals(child.refCount, 1);
        } else {
          assertEquals(child.refCount, 0);
        }
      });
    }
  }
});

Deno.test('_getLeaves', () => {
  const node = new OctreeNode(value, 0, 5);
  node.createChildRecursive(value);
  assertEquals(node.getLeaves().length, 1);

  node.createChildRecursive(value2);
  assertEquals(node.getLeaves().length, 2);

  assertEquals(node.getLeaves()[0].refCount, 1);
  assertEquals(node.getLeaves()[1].refCount, 1);
});

Deno.test('_pruneChildren', () => {
  const node = new OctreeNode(value, 0, 5);
  node.createChildRecursive(value);
  node.createChildRecursive(value2);

  const leafNodeExpected = node.getChildWithDepth(value, 3);

  assertEquals(leafNodeExpected?.pruneLeaves(), 1);
  assertEquals(leafNodeExpected?.value, value);
  assertEquals(leafNodeExpected?.children, []);
});

Deno.test('_getColor', () => {
  const node = new OctreeNode(value, 5, 5);
  assert(node.isLeaf);
  assertObjectMatch(node.getColor(), { ...value });

  node.sum({ r: 10, g: 10, b: 10 });
  assertObjectMatch(node.getColor(), {
    r: value.r + 10,
    g: value.g + 10,
    b: value.b + 10,
  });

  node.sum({ r: 300, g: 300, b: 300 });
  assertObjectMatch(node.getColor(), {
    r: 255,
    g: 255,
    b: 255,
  });

  node.count();
  assertObjectMatch(node.getColor(), {
    r: Math.floor(node.value.r / 2),
    g: Math.floor(node.value.g / 2),
    b: Math.floor(node.value.b / 2),
  });
});
