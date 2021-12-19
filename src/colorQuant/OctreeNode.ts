import { RGB } from './Color.ts';
import {
  getColorIndexForDepth,
  getPaletteIndexFromRGB,
  normalizeColor,
} from './utils.ts';

export class OctreeNode {
  value: RGB;

  /** number of samples in this Node. This is required to use it as the key that orders the cells in the priority queue. */
  refCount: number;

  /** index of palette to search for a mapped color */
  paletteIndex: number;

  /** 0 - 5 */
  depth: number;

  children: (OctreeNode | null)[];

  maxDepth: number;

  /**
   * @param value
   * @param depth
   * @param maxDepth 0-5
   */
  constructor(
    value: RGB,
    depth: number,
    maxDepth: number,
  ) {
    this.refCount = 0;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.children = new Array(8);

    if (this.depth < 0 || this.depth > this.maxDepth) {
      throw new Error('depth must be {0...maxDepth}.');
    }

    if (this.depth === this.maxDepth && this.refCount === 0) {
      this.count();
    }

    this.value = this.isLeaf ? { ...value } : {
      r: 0,
      g: 0,
      b: 0,
    };
    this.paletteIndex = getPaletteIndexFromRGB(value, this.depth);
  }

  get isLeaf(): boolean {
    return this.refCount > 0;
  }

  /**
   * increment refCount
   * @param num number of count
   */
  count(num: number = 1): void {
    this.refCount += num;
  }

  sum(value: RGB): void {
    this.value = {
      r: this.value.r + value.r,
      g: this.value.g + value.g,
      b: this.value.b + value.b,
    };
  }

  getColor(): RGB {
    if (!this.isLeaf) {
      throw new Error('getColor should be called by a leaf node');
    }

    return normalizeColor(this.value, this.refCount);
  }

  /** add value and generate nodes tree */
  createChildRecursive(value: RGB): void {
    const childIndex = getColorIndexForDepth(value, this.depth + 1);
    const nextDepth = this.depth + 1;

    if (this.hasChild(childIndex)) {
      const child = this.children[childIndex];

      if (child?.isLeaf) {
        child.sum(value);
        child.count();
        return;
      } else {
        child?.createChildRecursive(value);
      }
    } else {
      // lower than max-depth
      if (nextDepth <= this.maxDepth) {
        const child = new OctreeNode(
          value,
          nextDepth,
          this.maxDepth,
        );
        child.createChildRecursive(value);

        this.children[childIndex] = child;
      }

      return;
    }
  }

  hasChild(index: number): boolean {
    return !!this.children[index];
  }

  getLeaves(): OctreeNode[] {
    let result: OctreeNode[] = [];

    if (this.isLeaf) {
      result.push(this);
    } else {
      this.children.forEach((child) => {
        if (child) {
          if (child.isLeaf) {
            result.push(child);
          } else {
            result = [...result, ...child?.getLeaves()];
          }
        }
      });
    }

    return result;
  }

  pruneLeaves(): number {
    if (!this.children) throw new Error('Expected this node has children.');
    let resultCount = 0;

    for (const child of this.children) {
      if (!child) {
        continue;
      }
      this.refCount += child.refCount;
      this.sum(child.value);

      resultCount++;
    }

    this.children = [];
    return resultCount;
  }

  remove(child: OctreeNode) {
    if (!this.children) throw new Error('Expected this node has children.');

    const childIndex = this.children.indexOf(child);
    if (childIndex < 0) return;

    if (child.children) {
      child.pruneLeaves();
    }

    this.refCount += child.refCount;
    this.sum(child.value);

    this.children[childIndex] = null;
  }

  /** for debug only */
  getChildWithDepth(value: RGB, depth: number): OctreeNode | null {
    if (depth > this.maxDepth) {
      throw new Error('depth should be lower than maxDepth.');
    }

    if (depth <= this.depth) {
      throw new Error('Sorry, can not traverse to the parent level.');
    }

    let currentDepth = this.depth;
    // deno-lint-ignore no-this-alias
    let currentNode: OctreeNode = this;
    let child: OctreeNode | null = null;

    while (currentDepth <= depth) {
      const index = getColorIndexForDepth(value, currentDepth);
      child = currentNode.children[index];
      currentDepth++;

      if (child) {
        currentNode = child;
      } else {
        continue;
      }
    }

    return child;
  }
}
