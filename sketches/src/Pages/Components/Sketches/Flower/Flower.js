
import { InkLine } from "../../Functions/InkLine";
import { Poly } from "../../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"
import p5 from "p5";

const myP5Sketch = (p) => {
  p.preload = () => {
    p.font = p.loadFont("RobotoMono-Regular.ttf")
  };

  let palettes = [[[255, 234, 208], [55, 80, 92], [247, 111, 142], [17, 53, 55], [38, 196, 133]]]
  let currentPaletteIndex = 0;
  let currentPalette = palettes[currentPaletteIndex];
  let backgroundColor = currentPalette[0];
  let color1 = currentPalette[1];
  let color2 = currentPalette[2];
  let color3 = currentPalette[3];



  let textOverlay;

  let t = 0;
  let isMagic = false

  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noiseDetail(1, 0.5);
  };

  let lightValue = 0;

  p.draw = async () => {
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      if (lightValue == 0) {
        lightValue = magic.modules.light.brightness;
        lightValue += 2
      }
      else {
        lightValue = magic.modules.light.brightness * 0.05 + lightValue * 0.95;
      }
      p.background(backgroundColor);


      let petalDenom = 1.5;
      let petalIncrement = 3;
      let maxRadius = 100;
      let totalFlowers = 3
      let totalColors = currentPalette.length - 1;




      for (let i = 0; i < totalFlowers; i++) {
        let lerpValue = p.map(lightValue, 0, 4095, 0, 1);
        color1 = currentPalette[(i % totalColors) + 1];
        color2 = currentPalette[((i + 1) % totalColors) + 1];
        color3 = currentPalette[((i+2) % totalColors) + 1];
        let lightColor1 = p.lerpColor(p.color(color1), p.color(color2), lerpValue).levels;
        let lightColor2 = p.lerpColor(p.color(color2), p.color(color3), lerpValue).levels;

        let xStart = p.width/2 +  (p.width/3)*(i - 1) / (totalFlowers + 1);
        // let xStart = p.width * (i + 1) / (totalFlowers + 1);
        // let xStart = p.width/2
        // let yStart = p.height / 2;
        let yStart = p.height / 2 + p.height / 10 * (i)

        p.drawFlower(xStart, yStart, maxRadius, petalDenom + i, petalIncrement, lightValue, lightColor1, lightColor2, color3);
      }
      t += 0.02; // Increment time for noise evolution
    };

    p.drawFlower = (xStart, yStart, maxRadius, petalDenom, petalIncrement, lightValue, c1, c2, c3) => {
      let middleOffset = p.map(p.noise((t + petalIncrement*1000) / petalDenom), 0, 1, -1, 1);
      let middle = p.PI + (p.PI / 3 * middleOffset);
      let range = p.map(lightValue, 0, 4095, p.PI / 16, p.PI / 3, true);
      let inc = range / petalDenom; // Can have this be determined by some seed


      p.drawStem(xStart, yStart, 1000, 100, middle, c3);

      for (let ang = middle - range; ang <= middle + range + inc / 2; ang += inc) {
        let nP = p.noise(t / 10 + ang*3);
        let petalSize = p.map(nP, 0, 1, 1.0, 3.5); // Can have this also be determined by some seed
        p.drawPetals(xStart, yStart, maxRadius + ang, petalSize, 5, ang, petalIncrement, c1, c2);
      }
    }

    p.drawPetals = (centerX, centerY, maxRadius, petalSize, noiseMax, rotation, increment, c1, c2) => {
      let minY = [];

      p.push();
      p.translate(centerX, centerY);
      p.rotate(rotation);

      for (let radius = maxRadius; radius > 10; radius -= increment) {
        p.beginShape();
        let minCurrentY = Infinity;
        for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / 25) {
          let xoff = p.map(p.cos(a), -1, 1, 0, noiseMax);
          let yoff = p.map(p.sin(a), -1, 1, 0, noiseMax);
          let r = radius + p.map(p.noise(xoff, yoff, t), 0, 1, -maxRadius / 2, maxRadius / 2);
          let y = r * p.sin(a);
          if (y < minCurrentY) {
            minCurrentY = y;
          }
        }
        minY.push(minCurrentY);
        p.endShape(p.CLOSE);
      }

      let minYOffset = Math.min(...minY);
      for (let i = 0; i < minY.length; i++) {
        let radius = maxRadius - increment * i;
        let offsetY = minY[0] - minY[i];
        let gVal = p.map(lightValue, 0, 4095, 0, 255);
        let cIn = p.color(c1[0], c1[1], c2[0], 50); // replace these with palette colors
        let cOut = p.color(c2[0], c2[1], c2[2], 50);
        let fillC = p.lerpColor(cIn, cOut, i / minY.length);
        p.fill(fillC.levels[0], fillC.levels[1], fillC.levels[2], 30);
        p.stroke(fillC.levels[0], fillC.levels[1], fillC.levels[2], 75 - i);
        p.strokeWeight(p.map(i, 0, minY.length, increment, 0));
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / 25) {
          let xoff = p.map(p.cos(a), -1, 1, 0, noiseMax);
          let yoff = p.map(p.sin(a), -1, 1, 0, noiseMax);
          let r = radius + p.map(p.noise(xoff + rotation, yoff + rotation, t + rotation), 0, 1, -25, 25);
          let x = (r / petalSize) * p.cos(a);
          let y = r * p.sin(a) + offsetY - 1.0 * minYOffset;
          p.curveVertex(x, y);
        }
        p.endShape(p.CLOSE);
      }
      p.pop();
    }

    p.drawStem = (centerX, centerY, totalP, noiseMax, rotation, c3) => {
      p.push();
      p.translate(centerX, centerY - 20);
      p.rotate(rotation);
      p.stroke(0);
      p.fill(0);
      p.strokeWeight(1);
      p.beginShape();
      for (let k = 0; k < totalP; k += 5) {
        let n = p.map(k, 0, totalP, 5, noiseMax);
        let x0 = n * p.noise(t / 100, k / 100);
        let y0 = p.map(k, 0, totalP, 0, -centerY);
        let size = p.map(k, 0, totalP, 3, 1);
        p.ellipse(x0, y0, size, size);
      }
      p.endShape();
      p.pop();
    }


    p.mousePressed = async () => {
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
};

export default myP5Sketch;

