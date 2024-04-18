
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

  p.draw = () => {

    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      if (lightValue == 0) {
        p.background(backgroundColor);
        lightValue = magic.modules.light.brightness;
      }
      lightValue = magic.modules.light.brightness * 0.005 + lightValue * 0.995;

      const minuteRingRadius = p.height / 20


      // let updatedFR = (fr * (2*p.PI*(minuteRingRadius+(p.height/60)*(minute)))) / ((2*p.PI)*(minuteRingRadius))
      // let totalSquares = updatedFR * seconds;

      // let density = totalSquares/(2*p.PI*(minuteRingRadius+ (p.height/60)*(minute)))
      // console.log(density)
      // console.log(updatedFR, p.frameRate())

      // p.frameRate(updatedFR);
      let totalPerMinute = (fr * seconds); // * 2 is for the doubled frame rate?
      let rows = 6;
      let cols = 10;

      // let totalPerMinute = fr * 10; // screwed with this for a second
      if (minuteValueArray[minute].length > totalPerMinute) {
        minuteValueArray.push([]);
        minute++;
        cC++
        if (cC >= cols) {
          cC = 0;
          cR++;
        }
        if (cR >= rows) {
          p.saveCanvas("light", "png");
          cR = 0;
        }
      }
      minuteValueArray[minute].push(lightValue)
      p.angleMode(p.DEGREES);
      p.rectMode(p.CENTER);
      p.noFill();
      p.stroke(color1);
      p.strokeWeight(1);
      if (false) {
        let buffer = 100;
        let mappedLightValue = p.map(lightValue, 0, 4095, 0, 1);
        let mappedRectangleSize = p.map(lightValue, 0, 4095, p.height / 40, p.height / 10);
        let rectSize = mappedRectangleSize

        let y = p.map(minuteValueArray[minute].length, 0, totalPerMinute, buffer, p.height - buffer)
        let x = p.map(minute, 0, 10, buffer, p.width - buffer);

        let c = p.lerpColor(p.color(color2), p.color(color1), mappedLightValue);
        p.stroke(c.levels[0], c.levels[1], c.levels[2], mappedLightValue * 255 + 1);
        p.push();
        p.translate(x, y);
        p.rotate(minuteValueArray[minute].length / totalPerMinute * 360);
        p.rect(0, 0, rectSize, rectSize);
        p.pop();
      }

      else {
        let buffer = 100;
        let mappedLightValue = p.map(lightValue, 0, 4095, 0, 1);

        let radius = minuteRingRadius
        let xStart = p.map(cC, 0, cols, buffer, p.width - buffer);
        let yStart = p.map(cR, 0, rows, buffer, p.height - buffer);

        let y = yStart + radius * p.cos(minuteValueArray[minute].length / totalPerMinute * 360);
        let x = xStart + radius * p.sin(minuteValueArray[minute].length / totalPerMinute * 360);
        let rectSize = p.map(lightValue, 0, 4095, 2, 10);

        let c = p.lerpColor(p.color(color1), p.color(color1), mappedLightValue);
        let alpha = p.map(lightValue, 0, 4095, 50, 200);

        p.stroke(c.levels[0], c.levels[1], c.levels[2], alpha);
        p.noFill(); // No fill for the rings
        p.push();
        p.translate(x, y);
        p.rotate(minuteValueArray[minute].length / totalPerMinute * 360);
        p.rect(0, 0, rectSize, rectSize); // Diameter is twice the radius
        p.pop();
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

