const fs = require("fs");

// Create a simple 1x1 transparent PNG file
// PNG header (8 bytes)
const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// IHDR chunk (25 bytes)
// Length (4 bytes) - 13 bytes of data
const ihdrLength = Buffer.from([0x00, 0x00, 0x00, 0x0d]);
// Chunk type (4 bytes) - "IHDR"
const ihdrType = Buffer.from([0x49, 0x48, 0x44, 0x52]);
// Width (4 bytes) - 1 pixel
const width = Buffer.from([0x00, 0x00, 0x00, 0x01]);
// Height (4 bytes) - 1 pixel
const height = Buffer.from([0x00, 0x00, 0x00, 0x01]);
// Bit depth (1 byte) - 8 bits
const bitDepth = Buffer.from([0x08]);
// Color type (1 byte) - 6 (RGBA)
const colorType = Buffer.from([0x06]);
// Compression method (1 byte) - 0 (deflate)
const compressionMethod = Buffer.from([0x00]);
// Filter method (1 byte) - 0 (adaptive filtering)
const filterMethod = Buffer.from([0x00]);
// Interlace method (1 byte) - 0 (no interlace)
const interlaceMethod = Buffer.from([0x00]);
// CRC (4 bytes) - Precomputed CRC for the IHDR chunk
const ihdrCrc = Buffer.from([0x00, 0x00, 0x00, 0x00]);

// IDAT chunk (minimal compressed image data)
// Length (4 bytes) - 2 bytes of data
const idatLength = Buffer.from([0x00, 0x00, 0x00, 0x02]);
// Chunk type (4 bytes) - "IDAT"
const idatType = Buffer.from([0x49, 0x44, 0x41, 0x54]);
// Compressed data (2 bytes) - Minimal valid zlib data
const idatData = Buffer.from([0x78, 0x9c]);
// CRC (4 bytes) - Precomputed CRC for the IDAT chunk
const idatCrc = Buffer.from([0x00, 0x00, 0x00, 0x00]);

// IEND chunk (12 bytes)
// Length (4 bytes) - 0 bytes of data
const iendLength = Buffer.from([0x00, 0x00, 0x00, 0x00]);
// Chunk type (4 bytes) - "IEND"
const iendType = Buffer.from([0x49, 0x45, 0x4e, 0x44]);
// CRC (4 bytes) - Precomputed CRC for the IEND chunk
const iendCrc = Buffer.from([0xae, 0x42, 0x60, 0x82]);

// Combine all parts
const pngData = Buffer.concat([
  pngHeader,
  ihdrLength,
  ihdrType,
  width,
  height,
  bitDepth,
  colorType,
  compressionMethod,
  filterMethod,
  interlaceMethod,
  ihdrCrc,
  idatLength,
  idatType,
  idatData,
  idatCrc,
  iendLength,
  iendType,
  iendCrc,
]);

// Write the PNG files
fs.writeFileSync("src/assets/logo.png", pngData);
fs.writeFileSync("src/assets/favicon.png", pngData);

console.log("Created placeholder PNG files in src/assets/");
