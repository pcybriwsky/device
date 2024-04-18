
import { InkLine } from "../../Functions/InkLine";
import { Poly } from "../../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"
import p5 from "p5";

const myP5Sketch = (p) => {
  p.preload = () => {
    p.font = p.loadFont("RobotoMono-Regular.ttf")
  };

  let palettes = [['#FFFDF7', '#393E41', '#B0413E', '#478978']]
  let currentPaletteIndex = 0;
  let currentPalette = palettes[currentPaletteIndex];
  let backgroundColor = currentPalette[0];
  let color1 = currentPalette[1];
  let color2 = currentPalette[2];
  let color3 = currentPalette[3];



  let textOverlay;
  let fr = 60;
  let seconds = 3;

  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.pixelDensity(2)
    p.noStroke();
    // p.shader(theShader);

    textOverlay = p.createGraphics(p.width, p.height);
    p.frameRate(fr);
  }


  let mappedLightValue = 0;
  let lightValue = 0;
  let lightValueArray = [];

  let minuteValueArray = [[]];
  let hourValueArray = [];
  let shape = true;
  let minute = 0;
  let cR = 0;
  let cC = 0;
  let offset = 0

  p.draw = () => {

    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      if (lightValue == 0) {
        lightValue = magic.modules.light.brightness;
      }
      lightValue = magic.modules.light.brightness * 0.005 + lightValue * 0.995;
      p.angleMode(p.DEGREES);
      p.blendMode(p.BLEND);
      p.background(0);
      p.blendMode(p.LIGHTEST);

      let colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
      p.colorMode(p.RGB, 255, 255, 255, 1);
      let minR = p.map(lightValue, 0, 4095, 15, 100);
      let maxR = p.map(lightValue, 0, 4095, p.height / 4, minR);
      // maxR = 15
      let inc = maxR / 20

      let offsetInc = p.map(lightValue, 0, 4095, 1, 0.1)

      for (let r = minR; r <= maxR; r += inc) {
        let alpha = p.map(r, minR, maxR, 1.0, 0.001);
        for (let i = 0; i < 3; i++) {
          p.beginShape();
          for (let ang = 0; ang < 360; ang += 8) {
            p.fill(colors[i][0], colors[i][1], colors[i][2], alpha);
            let k =  Math.log((r * 0.5) / r) + 0.25
            const xOff = p.map(p.cos(ang + offset*(i+1)), -1, 1, 0, 1);
            const yOff = p.map(p.sin(ang + offset*(i+1)), -1, 1, 0, 1);
            let n = maxR * p.noise(k * xOff, k * yOff);
            // let n = p.map(p.noise(i * offset, offset), 0, 1, -50, 50);
            // let n2 = p.map(p.noise(i * offset, offset * ang), 0, 1, -50, 50);
            p.curveVertex(p.width / 2 + (r+n) * Math.cos(ang), p.height / 2 + (r+n) * Math.sin(ang));
          }
          p.endShape();
        }
        offset += offsetInc
      }


    }


    else if (isMagic) {
      p.text("No device found, please connect a device to proceed", p.width / 2, p.height / 2);
    }

    // Current file
    else {
      p.noLoop();

    }
    p.push();
    p.setOverlay(lightValue, "Light", false)

  }

  p.setOverlay = (value, title, contrast) => {
    let bottomBannerHeight = p.height / 20;
    let textBuffer = bottomBannerHeight / 4;

    let bg = backgroundColor;
    let fg = color1;

    if (!contrast) {
      bg = color1;
      fg = backgroundColor;
    }

    textOverlay.clear();
    textOverlay.textAlign(p.LEFT, p.CENTER);
    textOverlay.textFont(p.font);
    textOverlay.fill(fg);
    textOverlay.textSize(20);
    textOverlay.noStroke();

    textOverlay.rect(0, p.height - bottomBannerHeight, p.width, bottomBannerHeight);
    textOverlay.fill(bg);
    textOverlay.text(title + ":", textBuffer, p.height - bottomBannerHeight / 2);
    let rectLength = p.map(value, 0, 4095, 1, 200);
    textOverlay.rect(100, p.height - bottomBannerHeight / 2 - 5, rectLength, 20);
    textOverlay.text(value.toFixed(0), 300 + textBuffer, p.height - bottomBannerHeight / 2);

    if (!isMagic) {
      textOverlay.textFont(p.font);
      textOverlay.textSize(20);
      textOverlay.fill(bg);
      textOverlay.textAlign(p.RIGHT, p.CENTER);
      textOverlay.text("Click to initialize", p.width - textBuffer, p.height - bottomBannerHeight / 2);
    }

    // textOverlay.rect(0, 0, textOverlay.width, textOverlay.height);
    p.image(textOverlay, 0, 0, p.width, p.height);
    p.pop();
  }


  let isMagic = false
  p.mousePressed = async () => {
    if (p.mouseX > p.width - 100 && p.mouseY < 100) {

    }

    if (!isMagic) {
      magic.connect({ mesh: false, auto: true });
      console.log(magic.modules);
      isMagic = true;
      p.loop();
    }

  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
};

export default myP5Sketch;

