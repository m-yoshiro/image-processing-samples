export interface RGB {
  r: number;
  g: number;
  b: number;
}

export class Color {
  value: RGB;

  constructor() {
    this.value = {
      r: 0,
      g: 0,
      b: 0,
    };
  }
}
