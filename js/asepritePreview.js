// import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";

// Wrapper to make ArrayBuffer compatible with Node.js Buffer API
class BufferWrapper {
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);
  }

  readUInt8(offset) {
    return this.dataView.getUint8(offset);
  }

  readUInt16LE(offset) {
    return this.dataView.getUint16(offset, true);
  }

  readInt16LE(offset) {
    return this.dataView.getInt16(offset, true);
  }

  readUInt32LE(offset) {
    return this.dataView.getUint32(offset, true);
  }

  readInt32LE(offset) {
    return this.dataView.getInt32(offset, true);
  }

  readFloatLE(offset) {
    return this.dataView.getFloat32(offset, true);
  }

  toString(encoding = "utf8", start = 0, end = this.arrayBuffer.byteLength) {
    const slice = this.arrayBuffer.slice(start, end);
    return new TextDecoder(encoding).decode(slice);
  }
}

// Aseprite parser from the ase-parser library
class Aseprite {
  constructor(buffer) {
    this._offset = 0;
    this._buffer = new BufferWrapper(buffer);
    this.frames = [];
    this.layers = [];
    this.slices = [];
    this.fileSize = 0;
    this.numFrames = 0;
    this.width = 0;
    this.height = 0;
    this.colorDepth = 0;
    this.paletteIndex = 0;
    this.numColors = 0;
    this.pixelRatio = "1:1";
    this.name = "";
    this.tags = [];
    this.tilesets = [];
  }

  readNextByte() {
    const byte = this._buffer.readUInt8(this._offset);
    this._offset += 1;
    return byte;
  }

  readNextWord() {
    const word = this._buffer.readUInt16LE(this._offset);
    this._offset += 2;
    return word;
  }

  readNextShort() {
    const short = this._buffer.readInt16LE(this._offset);
    this._offset += 2;
    return short;
  }

  readNextDWord() {
    const dword = this._buffer.readUInt32LE(this._offset);
    this._offset += 4;
    return dword;
  }

  readNextLong() {
    const long = this._buffer.readInt32LE(this._offset);
    this._offset += 4;
    return long;
  }

  readNextFixed() {
    const fixed = this._buffer.readFloatLE(this._offset);
    this._offset += 4;
    return fixed;
  }

  readNextBytes(numBytes) {
    let str = "";
    for (let i = 0; i < numBytes; i++) {
      str += String.fromCharCode(this.readNextByte());
    }
    return str;
  }

  readNextRawBytes(numBytes) {
    const bytes = new Uint8Array(numBytes);
    for (let i = 0; i < numBytes; i++) {
      bytes[i] = this.readNextByte();
    }
    return bytes;
  }

  readNextString() {
    const numBytes = this.readNextWord();
    return this.readNextBytes(numBytes);
  }

  skipBytes(numBytes) {
    this._offset += numBytes;
  }

  #translateFlags(flagValue) {
    const flagMap = {
      visible: 0b1,
      editable: 0b10,
      lockMovement: 0b100,
      background: 0b1000,
      preferLinkedCels: 0b10000,
      collapsedGroup: 0b100000,
      reference: 0b1000000,
    };
    const result = {};
    for (const flag in flagMap) {
      result[flag] = (flagValue & flagMap[flag]) === flagMap[flag];
    }
    return result;
  }

  readHeader() {
    this.fileSize = this.readNextDWord();
    this.readNextWord(); // magic number
    this.numFrames = this.readNextWord();
    this.width = this.readNextWord();
    this.height = this.readNextWord();
    this.colorDepth = this.readNextWord();
    this.skipBytes(14);
    this.paletteIndex = this.readNextByte();
    this.skipBytes(3);
    this.numColors = this.readNextWord();
    const pixW = this.readNextByte();
    const pixH = this.readNextByte();
    this.pixelRatio = `${pixW}:${pixH}`;
    this.skipBytes(92);
    return this.numFrames;
  }

  readFrame() {
    const bytesInFrame = this.readNextDWord();
    this.skipBytes(2); // magic
    const oldChunk = this.readNextWord();
    const frameDuration = this.readNextWord();
    this.skipBytes(2);
    const newChunk = this.readNextDWord();
    let cels = [];

    for (let i = 0; i < newChunk; i++) {
      const chunkData = this.readChunk();
      const chunkType = chunkData.type;

      switch (chunkType) {
        case 0x2005:
          cels.push(this.readCelChunk(chunkData.chunkSize));
          break;
        case 0x2004:
          this.readLayerChunk();
          break;
        case 0x2018:
          this.readFrameTagsChunk();
          break;
        case 0x2019:
          this.palette = this.readPaletteChunk();
          break;
        default:
          this.skipBytes(chunkData.chunkSize - 6);
      }
    }

    this.frames.push({
      bytesInFrame,
      frameDuration,
      numChunks: newChunk,
      cels,
    });
  }

  readLayerChunk() {
    const layer = {};
    layer.flags = this.#translateFlags(this.readNextWord());
    layer.type = this.readNextWord();
    layer.layerChildLevel = this.readNextWord();
    this.skipBytes(4);
    layer.blendMode = this.readNextWord();
    layer.opacity = this.readNextByte();
    this.skipBytes(3);
    layer.name = this.readNextString();
    this.layers.push(layer);
  }

  readCelChunk(chunkSize) {
    const layerIndex = this.readNextWord();
    const x = this.readNextShort();
    const y = this.readNextShort();
    const opacity = this.readNextByte();
    const celType = this.readNextWord();
    const zIndex = this.readNextShort();
    this.skipBytes(5);

    if (celType === 1) {
      return {
        layerIndex,
        xpos: x,
        ypos: y,
        opacity,
        celType,
        zIndex,
        w: 0,
        h: 0,
        rawCelData: undefined,
        link: this.readNextWord(),
      };
    }

    const w = this.readNextWord();
    const h = this.readNextWord();

    if (celType === 0 || celType === 2) {
      const buff = this.readNextRawBytes(chunkSize - 26);
      return {
        layerIndex,
        xpos: x,
        ypos: y,
        opacity,
        celType,
        zIndex,
        w,
        h,
        rawCelData: celType === 2 ? pako.inflate(buff) : buff,
      };
    }

    return {
      layerIndex,
      xpos: x,
      ypos: y,
      opacity,
      celType,
      zIndex,
      w,
      h,
      rawCelData: new Uint8Array(),
    };
  }

  readFrameTagsChunk() {
    const numTags = this.readNextWord();
    this.skipBytes(8);
    for (let i = 0; i < numTags; i++) {
      this.readNextWord(); // from
      this.readNextWord(); // to
      this.readNextByte(); // loop
      this.readNextWord(); // repeat
      this.skipBytes(6);
      this.skipBytes(3); // color
      this.skipBytes(1);
      this.readNextString(); // name
    }
  }

  readPaletteChunk() {
    const paletteSize = this.readNextDWord();
    const firstColor = this.readNextDWord();
    const lastColor = this.readNextDWord();
    this.skipBytes(8);
    const colors = [];
    for (let i = 0; i < paletteSize; i++) {
      const flag = this.readNextWord();
      const r = this.readNextByte();
      const g = this.readNextByte();
      const b = this.readNextByte();
      const a = this.readNextByte();
      colors.push({ r, g, b, a });
      if (flag === 1) this.readNextString();
    }
    return { paletteSize, firstColor, lastColor, colors };
  }

  readChunk() {
    const chunkSize = this.readNextDWord();
    const type = this.readNextWord();
    return { chunkSize, type };
  }

  parse() {
    this.readHeader();
    for (let i = 0; i < this.numFrames; i++) {
      this.readFrame();
    }
    // Link cel references
    for (let i = 0; i < this.numFrames; i++) {
      for (let j = 0; j < this.frames[i].cels.length; j++) {
        const cel = this.frames[i].cels[j];
        if (cel.link !== undefined) {
          for (let k = 0; k < this.frames[cel.link].cels.length; k++) {
            const srcCel = this.frames[cel.link].cels[k];
            if (srcCel.layerIndex === cel.layerIndex) {
              cel.w = srcCel.w;
              cel.h = srcCel.h;
              cel.rawCelData = srcCel.rawCelData;
              break;
            }
          }
        }
      }
    }
  }
}

// Render 32-bit RGBA pixels with alpha blending
function renderRGBA(imageData, cel, ase) {
  const width = ase.width;
  const height = ase.height;
  const celData = cel.rawCelData;
  const celWidth = cel.w;
  const celHeight = cel.h;
  const xPos = cel.xpos;
  const yPos = cel.ypos;
  const opacity = cel.opacity / 255;

  for (let y = 0; y < celHeight; y++) {
    const canvasY = yPos + y;
    if (canvasY < 0 || canvasY >= height) continue;

    for (let x = 0; x < celWidth; x++) {
      const canvasX = xPos + x;
      if (canvasX < 0 || canvasX >= width) continue;

      const srcIdx = (y * celWidth + x) * 4;
      const dstIdx = (canvasY * width + canvasX) * 4;

      if (srcIdx + 3 < celData.length && dstIdx + 3 < imageData.length) {
        const srcA = (celData[srcIdx + 3] / 255) * opacity;
        if (srcA > 0) {
          const dstA = imageData[dstIdx + 3] / 255;
          const outA = srcA + dstA * (1 - srcA);

          imageData[dstIdx] = Math.round(
            (celData[srcIdx] * srcA + imageData[dstIdx] * dstA * (1 - srcA)) /
              outA,
          );
          imageData[dstIdx + 1] = Math.round(
            (celData[srcIdx + 1] * srcA +
              imageData[dstIdx + 1] * dstA * (1 - srcA)) /
              outA,
          );
          imageData[dstIdx + 2] = Math.round(
            (celData[srcIdx + 2] * srcA +
              imageData[dstIdx + 2] * dstA * (1 - srcA)) /
              outA,
          );
          imageData[dstIdx + 3] = Math.round(outA * 255);
        }
      }
    }
  }
}

// Render 16-bit RGB pixels
function renderRGB16(imageData, cel, ase) {
  const width = ase.width;
  const height = ase.height;
  const celData = cel.rawCelData;
  const celWidth = cel.w;
  const celHeight = cel.h;
  const xPos = cel.xpos;
  const yPos = cel.ypos;
  const opacity = cel.opacity / 255;

  for (let y = 0; y < celHeight; y++) {
    const canvasY = yPos + y;
    if (canvasY < 0 || canvasY >= height) continue;

    for (let x = 0; x < celWidth; x++) {
      const canvasX = xPos + x;
      if (canvasX < 0 || canvasX >= width) continue;

      const srcIdx = (y * celWidth + x) * 2;
      const dstIdx = (canvasY * width + canvasX) * 4;

      if (srcIdx + 1 < celData.length && dstIdx + 3 < imageData.length) {
        const pixel = celData[srcIdx] | (celData[srcIdx + 1] << 8);
        const r = (pixel >> 11) & 0x1f;
        const g = (pixel >> 5) & 0x3f;
        const b = pixel & 0x1f;

        const srcR = (r << 3) | (r >> 2);
        const srcG = (g << 2) | (g >> 4);
        const srcB = (b << 3) | (b >> 2);

        const srcA = opacity;
        if (srcA > 0) {
          const dstA = imageData[dstIdx + 3] / 255;
          const outA = srcA + dstA * (1 - srcA);

          imageData[dstIdx] = Math.round(
            (srcR * srcA + imageData[dstIdx] * dstA * (1 - srcA)) / outA,
          );
          imageData[dstIdx + 1] = Math.round(
            (srcG * srcA + imageData[dstIdx + 1] * dstA * (1 - srcA)) / outA,
          );
          imageData[dstIdx + 2] = Math.round(
            (srcB * srcA + imageData[dstIdx + 2] * dstA * (1 - srcA)) / outA,
          );
          imageData[dstIdx + 3] = Math.round(outA * 255);
        }
      }
    }
  }
}

// Render 8-bit indexed color using palette
function renderIndexed(imageData, cel, ase) {
  if (!ase.palette || !ase.palette.colors) {
    renderRGBA(imageData, cel, ase);
    return;
  }

  const width = ase.width;
  const height = ase.height;
  const celData = cel.rawCelData;
  const celWidth = cel.w;
  const celHeight = cel.h;
  const xPos = cel.xpos;
  const yPos = cel.ypos;
  const palette = ase.palette.colors;
  const opacity = cel.opacity / 255;

  for (let y = 0; y < celHeight; y++) {
    const canvasY = yPos + y;
    if (canvasY < 0 || canvasY >= height) continue;

    for (let x = 0; x < celWidth; x++) {
      const canvasX = xPos + x;
      if (canvasX < 0 || canvasX >= width) continue;

      const srcIdx = y * celWidth + x;
      const dstIdx = (canvasY * width + canvasX) * 4;

      if (srcIdx < celData.length && dstIdx + 3 < imageData.length) {
        const colorIdx = celData[srcIdx];
        const color = palette[colorIdx];
        if (!color) continue;

        const srcA = ((color.a !== undefined ? color.a : 255) / 255) * opacity;
        if (srcA > 0) {
          const dstA = imageData[dstIdx + 3] / 255;
          const outA = srcA + dstA * (1 - srcA);

          imageData[dstIdx] = Math.round(
            ((color.r || 0) * srcA + imageData[dstIdx] * dstA * (1 - srcA)) /
              outA,
          );
          imageData[dstIdx + 1] = Math.round(
            ((color.g || 0) * srcA +
              imageData[dstIdx + 1] * dstA * (1 - srcA)) /
              outA,
          );
          imageData[dstIdx + 2] = Math.round(
            ((color.b || 0) * srcA +
              imageData[dstIdx + 2] * dstA * (1 - srcA)) /
              outA,
          );
          imageData[dstIdx + 3] = Math.round(outA * 255);
        }
      }
    }
  }
}

function renderAseprite(buffer, filename, canvas) {
  try {
    const ase = new Aseprite(buffer);
    ase.parse();

    if (!ase.frames || ase.frames.length === 0) {
      throw new Error("No frames found");
    }

    canvas.width = ase.width;
    canvas.height = ase.height;

    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(ase.width, ase.height);
    const data = imageData.data;

    // Fill with transparent background
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = 0; // alpha
    }

    const firstFrame = ase.frames[0];

    // Render all cels (layers) in the frame
    for (let celIdx = 0; celIdx < firstFrame.cels.length; celIdx++) {
      const cel = firstFrame.cels[celIdx];

      if (!cel.rawCelData || cel.rawCelData.length === 0) {
        continue;
      }

      // Get corresponding layer info
      const layer = ase.layers[cel.layerIndex];
      const isVisible = !layer || layer.flags.visible;

      if (layer && !layer.flags.visible) {
        continue;
      }

      // Render based on color depth
      if (ase.colorDepth === 32) {
        renderRGBA(data, cel, ase);
      } else if (ase.colorDepth === 16) {
        renderRGB16(data, cel, ase);
      } else if (ase.colorDepth === 8 && ase.palette) {
        renderIndexed(data, cel, ase);
      } else {
        renderRGBA(data, cel, ase);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.log(error);
  }
}

async function loadAsepritePreviewFromUrlOnCanvas(url, canvas) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    const filename = url.split("/").pop() || "unknown.ase";
    renderAseprite(buffer, filename, canvas);
  } catch (error) {
    console.log(error);
  }
}
