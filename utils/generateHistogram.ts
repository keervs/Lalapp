import * as ImageManipulator from "expo-image-manipulator";

const BINS = 8; // 8x8x8 = 512 bins

// 🔹 Convert RGB → bin index
const getBin = (r: number, g: number, b: number) => {
  const rBin = Math.floor(r / (256 / BINS));
  const gBin = Math.floor(g / (256 / BINS));
  const bBin = Math.floor(b / (256 / BINS));

  return rBin * BINS * BINS + gBin * BINS + bBin;
};

// 🔹 Generate histogram
export const getImageHistogram = async (uri: string) => {
  const processed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 64, height: 64 } }],
    {
      base64: true,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  if (!processed.base64) return [];

  const binary = atob(processed.base64);

  const histogram = new Array(BINS * BINS * BINS).fill(0);

  // 🔥 Extract RGB and count bins
  for (let i = 0; i < binary.length - 2; i += 3) {
    const r = binary.charCodeAt(i);
    const g = binary.charCodeAt(i + 1);
    const b = binary.charCodeAt(i + 2);

    if (isNaN(r) || isNaN(g) || isNaN(b)) continue;

    const bin = getBin(r, g, b);
    histogram[bin]++;
  }

  // 🔹 Normalize
  const total = histogram.reduce((a, b) => a + b, 0);

  return histogram.map((v) => v / total);
};