import { OctreeNode } from './OctreeNode.ts';
import { RGB } from './Color.ts';

export class OctreeQuantizer {
  _levels: OctreeNode[][];
  /** 0 - 5 */
  private _maxDepth: number;
  readonly _pixels: Uint8ClampedArray;

  root: OctreeNode;

  constructor(maxDepth = 5) {
    this._maxDepth = maxDepth;
    this._levels = new Array(this._maxDepth + 1);
    this._pixels = new Uint8ClampedArray();

    // Create all node trees that each elements is empty.
    for (let i = 0; i < this._levels.length; i++) {
      this._levels[i] = [];
    }

    this.root = new OctreeNode({ r: 0, g: 0, b: 0 }, 0, this._maxDepth);
  }

  quantize(pixels: Uint8ClampedArray) {
    this.createInnerNodes(pixels);
  }

  createInnerNodes(pixels: Uint8ClampedArray) {
    for (let i = 0; i < pixels.length; i += 4) {
      const value: RGB = {
        r: pixels[i],
        g: pixels[i + 1],
        b: pixels[i + 2],
      };

      this.root.createChildRecursive(value);
    }
  }

  getLeaves(): OctreeNode[] {
    return this.root.getLeaves();
  }

  getNodesbyLevel(depth: number): OctreeNode[] {
    return this._levels[depth];
  }

  /** remove children at given depth */
  removeLeavesAt(depth: number) {
    if (depth < 2 || depth >= this._maxDepth) {
      throw new Error('depth must be < 2, and > maxDepth');
    }

    const nodes = this._levels[depth];
    nodes.forEach((node) => {
      if (node) {
        node.pruneLeaves();
      }
    });

    this._levels[depth + 1] = [];
  }

  palette() {
    const palette = new Map<number, RGB>();

    this.getLeaves().forEach((leaf) => {
      if (!palette.has(leaf.paletteIndex)) {
        palette.set(leaf.paletteIndex, leaf.getColor());
      }
    });

    return palette;
  }
}
