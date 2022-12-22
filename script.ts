let orininalCanvas = document.getElementById("original") as HTMLCanvasElement;
let grayscaleCanvas = document.getElementById("grayscale") as HTMLCanvasElement;
let heatmapCanvas = document.getElementById("heatmap") as HTMLCanvasElement;
let legendCanvas = document.getElementById("legend") as HTMLCanvasElement;
let greyscalePhotoshopCanvas = document.getElementById(
  "grayscale-photoshop"
) as HTMLCanvasElement;
let heatmapPhotoshopCanvas = document.getElementById(
  "heatmap-photoshop"
) as HTMLCanvasElement;
let legendPhotoshopCanvas = document.getElementById(
  "legend-photoshop"
) as HTMLCanvasElement;
let greyscalePhotoshopCanvas2 = document.getElementById(
  "grayscale-photoshop-2"
) as HTMLCanvasElement;
let heatmapPhotoshopCanvas2 = document.getElementById(
  "heatmap-photoshop-2"
) as HTMLCanvasElement;
let legendPhotoshopCanvas2 = document.getElementById(
  "legend-photoshop-2"
) as HTMLCanvasElement;

let originalContext = orininalCanvas.getContext(
  "2d"
) as CanvasRenderingContext2D;
let grayscaleContext = grayscaleCanvas.getContext(
  "2d"
) as CanvasRenderingContext2D;
let heatmapContext = heatmapCanvas.getContext("2d") as CanvasRenderingContext2D;
let legendContext = legendCanvas.getContext("2d") as CanvasRenderingContext2D;
let greyscalePhotoshopContext = greyscalePhotoshopCanvas.getContext(
  "2d"
) as CanvasRenderingContext2D;
let heatmapPhotoshopContext = heatmapPhotoshopCanvas.getContext(
  "2d"
) as CanvasRenderingContext2D;
let legendPhotoshopContext = legendPhotoshopCanvas.getContext(
  "2d"
) as CanvasRenderingContext2D;
let greyscalePhotoshopContext2 = greyscalePhotoshopCanvas2.getContext(
  "2d"
) as CanvasRenderingContext2D;
let heatmapPhotoshopContext2 = heatmapPhotoshopCanvas2.getContext(
  "2d"
) as CanvasRenderingContext2D;
let legendPhotoshopContext2 = legendPhotoshopCanvas2.getContext(
  "2d"
) as CanvasRenderingContext2D;

let uploadBtn = document.getElementById("upload") as HTMLInputElement;

let image = new Image();
image.src = "Lenna.png";

image.onload = () => {
  drawImage(image, orininalCanvas);
  processImages();
};

document.onload = () => {
  drawImage(image, orininalCanvas);
};

uploadBtn.onchange = (event) => {
  if (event == null || event.target == null) return;

  let target = event.target as HTMLInputElement;
  if (target.files == null) return;
  let file = target.files[0];
  let reader = new FileReader();
  reader.onload = (e) => {
    if (e.target == null) return;
    image.src = e.target.result as string;
  };
  reader.readAsDataURL(file);
};

function processImages() {
  let imageData = getImageData(orininalCanvas);
  let grayscaleData = getImageData(grayscaleCanvas);
  let heatmapData = getImageData(heatmapCanvas);
  let grayscalePhotoshopData = getImageData(greyscalePhotoshopCanvas);
  let heatmapPhotoshopData = getImageData(heatmapPhotoshopCanvas);
  let grayscalePhotoshopData2 = getImageData(greyscalePhotoshopCanvas2);
  let heatmapPhotoshopData2 = getImageData(heatmapPhotoshopCanvas2);

  new Grayscale(imageData, grayscaleData).process();

  let heatmap = new Heatmap(grayscaleData, heatmapData);
  heatmap.process();
  new Legend(legendContext, heatmap).process();
  grayscaleContext.putImageData(grayscaleData, 0, 0);
  heatmapContext.putImageData(heatmapData, 0, 0);

  new GrayscaleLikePhotoshop(imageData, grayscalePhotoshopData).process();
  heatmap = new Heatmap(grayscalePhotoshopData, heatmapPhotoshopData);
  heatmap.process();
  new Legend(legendPhotoshopContext, heatmap).process();
  greyscalePhotoshopContext.putImageData(grayscalePhotoshopData, 0, 0);
  heatmapPhotoshopContext.putImageData(heatmapPhotoshopData, 0, 0);

  new GrayscaleLikePhotoshopMinMaxHue(
    imageData,
    grayscalePhotoshopData2
  ).process();
  heatmap = new Heatmap(grayscalePhotoshopData2, heatmapPhotoshopData2);
  heatmap.process();
  new Legend(legendPhotoshopContext2, heatmap).process();
  greyscalePhotoshopContext2.putImageData(grayscalePhotoshopData2, 0, 0);
  heatmapPhotoshopContext2.putImageData(heatmapPhotoshopData2, 0, 0);
}

function getImageData(canvas: HTMLCanvasElement) {
  return canvas
    .getContext("2d")!
    .getImageData(0, 0, canvas.width, canvas.height);
}

function drawImage(img: CanvasImageSource, canvas: HTMLCanvasElement) {
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  let x = 0;
  let y = 0;
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;

  // default offset is center
  let offsetX = 0.5;
  let offsetY = 0.5;

  let imgW = img.width as number,
    imgH = img.height as number,
    r = Math.min(w / imgW, h / imgH),
    nw = imgW * r, // new prop. width
    nh = imgH * r, // new prop. height
    cx,
    cy,
    cw,
    ch,
    ar = 1;

  // decide which gap to fill
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = imgW / (nw / w);
  ch = imgH / (nh / h);

  cx = (imgW - cw) * offsetX;
  cy = (imgH - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > imgW) cw = imgW;
  if (ch > imgH) ch = imgH;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

function fminf(a: number, b: number) {
  return a < b ? a : b;
}

function fmaxf(a: number, b: number) {
  return a > b ? a : b;
}

class Legend {
  private context: CanvasRenderingContext2D;
  private heatmap: Heatmap;

  constructor(context: CanvasRenderingContext2D, heatmap: Heatmap) {
    this.context = context;
    this.heatmap = heatmap;
  }

  public process() {
    let gradient = this.context.createLinearGradient(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );

    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.25, "yellow");
    gradient.addColorStop(0.5, "green");
    gradient.addColorStop(0.75, "blue");
    gradient.addColorStop(1, "black");

    this.context.fillStyle = gradient;
    this.context.fillRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );

    this.context.fillStyle = "white";
    this.context.font = "bold 18px Arial";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    let textHeightBounds = (this.context.canvas.height - 20) / 5;
    for (let i = 0; i <= 5; i++) {
      let y = textHeightBounds * (5 - i) + 10;
      this.context.fillStyle = "white";
      this.context.fillText(
        this.heatmap.intensityAtPercent(i * 20).toString(),
        this.context.canvas.width / 2,
        y
      );
    }
  }
}

class Grayscale {
  private imageData: ImageData;
  private grayscaleData: ImageData;

  constructor(imageData: ImageData, grayscaleData: ImageData) {
    this.imageData = imageData;
    this.grayscaleData = grayscaleData;
  }

  public process() {
    let data = this.imageData.data;
    let grayscaleData = this.grayscaleData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      let grayscale = (r + g + b) / 3;

      grayscaleData[i] = grayscale;
      grayscaleData[i + 1] = grayscale;
      grayscaleData[i + 2] = grayscale;
      grayscaleData[i + 3] = 255;
    }
  }
}

class GrayscaleLikePhotoshop {
  private imageData: ImageData;
  private grayscaleData: ImageData;

  constructor(imageData: ImageData, grayscaleData: ImageData) {
    this.imageData = imageData;
    this.grayscaleData = grayscaleData;
  }

  public process() {
    let data = this.imageData.data;
    let grayscaleData = this.grayscaleData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      let grayscale = r * 0.3 + g * 0.59 + b * 0.11;

      grayscaleData[i] = grayscale;
      grayscaleData[i + 1] = grayscale;
      grayscaleData[i + 2] = grayscale;
      grayscaleData[i + 3] = 255;
    }
  }
}

class GrayscaleLikePhotoshopMinMaxHue {
  private imageData: ImageData;
  private grayscaleData: ImageData;

  constructor(imageData: ImageData, grayscaleData: ImageData) {
    this.imageData = imageData;
    this.grayscaleData = grayscaleData;
  }

  public process() {
    let data = this.imageData.data;
    let grayscaleData = this.grayscaleData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      let grayscale = (fminf(r, fminf(g, b)) + fmaxf(r, fmaxf(g, b))) * 0.5;

      grayscaleData[i] = grayscale;
      grayscaleData[i + 1] = grayscale;
      grayscaleData[i + 2] = grayscale;
      grayscaleData[i + 3] = 255;
    }
  }
}

class Heatmap {
  private grayscaleData: ImageData;
  private heatmapData: ImageData;

  public minIntensity = 0;
  public maxIntensity = 255;

  constructor(grayscaleData: ImageData, heatmapData: ImageData) {
    this.grayscaleData = grayscaleData;
    this.heatmapData = heatmapData;
  }

  public process() {
    let data = this.grayscaleData.data;
    let heatmapData = this.heatmapData.data;

    let max = 0;
    let min = 255;

    for (let i = 0; i < data.length; i += 4) {
      let grayscale = data[i];

      if (grayscale > max) max = grayscale;
      if (grayscale < min) min = grayscale;
    }

    this.minIntensity = min;
    this.maxIntensity = max;

    let range = max - min;
    range = range == 0 ? 1 : range;

    for (let i = 0; i < data.length; i += 4) {
      let grayscale = data[i];

      let color = this.getColor(grayscale, min, range);

      heatmapData[i] = color[0];
      heatmapData[i + 1] = color[1];
      heatmapData[i + 2] = color[2];
      heatmapData[i + 3] = 255;
    }
  }

  getColor(grayscale: number, min: number, range: number) {
    let color = [0, 0, 0];

    let value = (grayscale - min) / range;

    if (value < 0.25) {
      color[0] = 0;
      color[1] = 0;
      color[2] = 255 * value * 4;
    } else if (value < 0.5) {
      color[0] = 0;
      color[1] = 255 * (value - 0.25) * 4;
      color[2] = 255 - color[1];
    } else if (value < 0.75) {
      color[0] = 255 * (value - 0.5) * 4;
      color[1] = 255;
      color[2] = 0;
    } else {
      color[0] = 255;
      color[1] = 255 - 255 * (value - 0.75) * 4;
      color[2] = 0;
    }

    return color;
  }

  intensityAtPercent(point: number) {
    let percent = point / 100;
    return Math.round(
      this.minIntensity + percent * (this.maxIntensity - this.minIntensity)
    );
  }
}
