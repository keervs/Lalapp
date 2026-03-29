import { Asset } from "expo-asset";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";
import { getImageHistogram } from "./generateHistogram";

// 🔥 Cache original tile histograms
let ORIGINAL_TILE_HISTOGRAM: number[] | null = null;

// Number of tiles in the grid (rows × columns)
const TILE_ROWS = 4;
const TILE_COLS = 4;

/**
 * Compute tile‑based histograms for an image.
 * Splits the image into a grid and returns the concatenated histograms.
 */
const getTileHistograms = async (uri: string): Promise<number[]> => {
  // 1. Get image dimensions (no manipulations, just to get width/height)
  const manipResult = await ImageManipulator.manipulateAsync(uri, []);
  const { width, height } = manipResult;

  const tileWidth = width / TILE_COLS;
  const tileHeight = height / TILE_ROWS;

  const allHistograms: number[] = [];

  for (let row = 0; row < TILE_ROWS; row++) {
    for (let col = 0; col < TILE_COLS; col++) {
      // 2. Crop the current tile
      const crop = {
        originX: col * tileWidth,
        originY: row * tileHeight,
        width: tileWidth,
        height: tileHeight,
      };
      const cropped = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop }],
        { format: SaveFormat.PNG } // ✅ Use enum instead of string literal
      );

      // 3. Compute histogram for this tile
      const tileHist = await getImageHistogram(cropped.uri);
      allHistograms.push(...tileHist);
    }
  }

  return allHistograms;
};

/**
 * Load the original badge and compute its tile histograms (cached).
 */
const loadOriginalTileHistogram = async (): Promise<number[]> => {
  if (ORIGINAL_TILE_HISTOGRAM) return ORIGINAL_TILE_HISTOGRAM;

  const asset = Asset.fromModule(require("../app/(tabs)/assets/badge.png"));
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;

  const histogram = await getTileHistograms(uri!);
  ORIGINAL_TILE_HISTOGRAM = histogram;

  console.log("🔥 ORIGINAL TILE HISTOGRAM LOADED");
  return histogram;
};

/**
 * Compare two concatenated tile histograms.
 * Each tile histogram is normalised (sum = 1), so the concatenated vector
 * sums to (TILE_ROWS * TILE_COLS). The maximum possible L1 difference is
 * 2 × number_of_tiles.
 */
const compareTileHistograms = (h1: number[], h2: number[]): number => {
  let diff = 0;
  for (let i = 0; i < h1.length; i++) {
    diff += Math.abs(h1[i] - h2[i]);
  }
  const maxDiff = 2 * (TILE_ROWS * TILE_COLS);
  return 1 - diff / maxDiff;
};

/**
 * Final verification function.
 */
export const verifyBadge = async (uri: string): Promise<boolean> => {
  try {
    const original = await loadOriginalTileHistogram();
    const input = await getTileHistograms(uri);

    if (!original || !input.length) return false;

    const similarity = compareTileHistograms(input, original);
    console.log("🧠 TILE COLOR SIMILARITY:", similarity);

    // You may need to adjust this threshold after testing
    return similarity > 0.65;
  } catch (err) {
    console.log("❌ VERIFY ERROR:", err);
    return false;
  }
};