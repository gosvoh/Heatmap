"use strict";
let orininalCanvas = document.getElementById("original");
let grayscaleCanvas = document.getElementById("grayscale");
let heatmapCanvas = document.getElementById("heatmap");
let legendCanvas = document.getElementById("legend");
let greyscalePhotoshopCanvas = document.getElementById("grayscale-photoshop");
let heatmapPhotoshopCanvas = document.getElementById("heatmap-photoshop");
let legendPhotoshopCanvas = document.getElementById("legend-photoshop");
let greyscalePhotoshopCanvas2 = document.getElementById("grayscale-photoshop-2");
let heatmapPhotoshopCanvas2 = document.getElementById("heatmap-photoshop-2");
let legendPhotoshopCanvas2 = document.getElementById("legend-photoshop-2");
let originalContext = orininalCanvas.getContext("2d");
let grayscaleContext = grayscaleCanvas.getContext("2d");
let heatmapContext = heatmapCanvas.getContext("2d");
let legendContext = legendCanvas.getContext("2d");
let greyscalePhotoshopContext = greyscalePhotoshopCanvas.getContext("2d");
let heatmapPhotoshopContext = heatmapPhotoshopCanvas.getContext("2d");
let legendPhotoshopContext = legendPhotoshopCanvas.getContext("2d");
let greyscalePhotoshopContext2 = greyscalePhotoshopCanvas2.getContext("2d");
let heatmapPhotoshopContext2 = heatmapPhotoshopCanvas2.getContext("2d");
let legendPhotoshopContext2 = legendPhotoshopCanvas2.getContext("2d");
let uploadBtn = document.getElementById("upload");
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
    if (event == null || event.target == null)
        return;
    let target = event.target;
    if (target.files == null)
        return;
    let file = target.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        if (e.target == null)
            return;
        image.src = e.target.result;
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
    new GrayscaleLikePhotoshopMinMaxHue(imageData, grayscalePhotoshopData2).process();
    heatmap = new Heatmap(grayscalePhotoshopData2, heatmapPhotoshopData2);
    heatmap.process();
    new Legend(legendPhotoshopContext2, heatmap).process();
    greyscalePhotoshopContext2.putImageData(grayscalePhotoshopData2, 0, 0);
    heatmapPhotoshopContext2.putImageData(heatmapPhotoshopData2, 0, 0);
}
function getImageData(canvas) {
    return canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
}
function drawImage(img, canvas) {
    let ctx = canvas.getContext("2d");
    let x = 0;
    let y = 0;
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    // default offset is center
    let offsetX = 0.5;
    let offsetY = 0.5;
    let imgW = img.width, imgH = img.height, r = Math.min(w / imgW, h / imgH), nw = imgW * r, // new prop. width
    nh = imgH * r, // new prop. height
    cx, cy, cw, ch, ar = 1;
    // decide which gap to fill
    if (nw < w)
        ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h)
        ar = h / nh; // updated
    nw *= ar;
    nh *= ar;
    // calc source rectangle
    cw = imgW / (nw / w);
    ch = imgH / (nh / h);
    cx = (imgW - cw) * offsetX;
    cy = (imgH - ch) * offsetY;
    // make sure source rectangle is valid
    if (cx < 0)
        cx = 0;
    if (cy < 0)
        cy = 0;
    if (cw > imgW)
        cw = imgW;
    if (ch > imgH)
        ch = imgH;
    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
function fminf(a, b) {
    return a < b ? a : b;
}
function fmaxf(a, b) {
    return a > b ? a : b;
}
class Legend {
    constructor(context, heatmap) {
        this.context = context;
        this.heatmap = heatmap;
    }
    process() {
        let gradient = this.context.createLinearGradient(0, 0, this.context.canvas.width, this.context.canvas.height);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.25, "yellow");
        gradient.addColorStop(0.5, "green");
        gradient.addColorStop(0.75, "blue");
        gradient.addColorStop(1, "black");
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.fillStyle = "white";
        this.context.font = "bold 18px Arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(this.heatmap.minIntensity.toString(), this.context.canvas.width / 2, this.context.canvas.height - 10);
        this.context.fillText(this.heatmap.maxIntensity.toString(), this.context.canvas.width / 2, 10);
        for (let i = 0; i < 5; i++) {
            if (i == 0)
                continue;
            let y = (this.context.canvas.height / 5) * i;
            this.context.fillStyle = "white";
            this.context.fillText(this.heatmap.intensityAtPercent(i * 20).toString(), this.context.canvas.width / 2, y);
        }
    }
}
class Grayscale {
    constructor(imageData, grayscaleData) {
        this.imageData = imageData;
        this.grayscaleData = grayscaleData;
    }
    process() {
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
    constructor(imageData, grayscaleData) {
        this.imageData = imageData;
        this.grayscaleData = grayscaleData;
    }
    process() {
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
    constructor(imageData, grayscaleData) {
        this.imageData = imageData;
        this.grayscaleData = grayscaleData;
    }
    process() {
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
    constructor(grayscaleData, heatmapData) {
        this.minIntensity = 0;
        this.maxIntensity = 255;
        this.grayscaleData = grayscaleData;
        this.heatmapData = heatmapData;
    }
    process() {
        let data = this.grayscaleData.data;
        let heatmapData = this.heatmapData.data;
        let max = 0;
        let min = 255;
        for (let i = 0; i < data.length; i += 4) {
            let grayscale = data[i];
            if (grayscale > max)
                max = grayscale;
            if (grayscale < min)
                min = grayscale;
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
    getColor(grayscale, min, range) {
        let color = [0, 0, 0];
        let value = (grayscale - min) / range;
        if (value < 0.25) {
            color[0] = 0;
            color[1] = 0;
            color[2] = 255 * value * 4;
        }
        else if (value < 0.5) {
            color[0] = 0;
            color[1] = 255 * (value - 0.25) * 4;
            color[2] = 255 - color[1];
        }
        else if (value < 0.75) {
            color[0] = 255 * (value - 0.5) * 4;
            color[1] = 255;
            color[2] = 0;
        }
        else {
            color[0] = 255;
            color[1] = 255 - 255 * (value - 0.75) * 4;
            color[2] = 0;
        }
        return color;
    }
    intensityAtPercent(point) {
        let percent = point / 100;
        return Math.round(this.minIntensity + percent * (this.maxIntensity - this.minIntensity));
    }
}
