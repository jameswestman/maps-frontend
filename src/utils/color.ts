export const parseColor = (color: string) =>
  color.length === 4
    ? {
        r: parseInt(color[0] + color[0], 16),
        g: parseInt(color[1] + color[1], 16),
        b: parseInt(color[2] + color[2], 16),
      }
    : {
        r: parseInt(color.substring(0, 2), 16),
        g: parseInt(color.substring(2, 4), 16),
        b: parseInt(color.substring(4, 6), 16),
      };

export const luminance = (color: Rgb) => {
  return (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
};

export interface Rgb {
  r: number;
  g: number;
  b: number;
}
