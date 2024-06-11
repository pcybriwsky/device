
import { InkLine } from "../../Functions/InkLine";
import { Poly } from "../../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"
import p5 from "p5";

const myP5Sketch = (p) => {
  p.preload = () => {
    p.font = p.loadFont("RobotoMono-Regular.ttf")
  };

  let w = 5;
  let rez = 0.003;
  let amount = 1200;

  let palettes = [
    ["#fffff2", "#41d3bd", "#EE6352", "#223843", "#010101"],
    ["#0EF3C5", "#015268", "#025385", "#172347", "#010101"],
    ["#CD8A8C", "#C56AB4", "#010101", "#EFEAE7", "#010101"],
    ["#ff715b", "#258EA6", "#44AF69", "#e9f1f7", "#010101"],
    ["#CCFF66", "#FF6666", "#FFFBFC", "#58355E", "#010101"],
    ["#79addc", "#ff8552", "#79addc", "#F7F3E3", "#010101"],
  ];

  let paletteNum,
    color1,
    color2,
    color3,
    colorBG,
    colorBG2,
    density,
    ringSize,
    showFill,
    shift,
    shiftInc,
    buffer,
    leeway;
  let textOverlay;

  let t = 0;
  let isMagic = false
  let wArray = []

  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noiseDetail(1, 0.5);
    paletteNum = Math.floor(p.random(palettes.length));
    // paletteNum = 2;
    color1 = palettes[paletteNum][0];
    color2 = palettes[paletteNum][1];
    color3 = palettes[paletteNum][2];
    colorBG = palettes[paletteNum][3];
    colorBG2 = palettes[paletteNum][4];

    if (false) {
      colorBG = palettes[paletteNum][2];
      color3 = palettes[paletteNum][3]
    }

    buffer = p.width / 20;
    amount = 400;

    let range = p.width - buffer * 2
    let wSum = 0;
    while (wSum < range) {
      let newW = p.random(25, 200);
      newW = 8;
      wArray.push(newW);
      wSum += newW;

    }
    shift = 0;
    shiftInc = p.random(3, 5) / 1000;
    vertVal = Math.round(p.random(0, 1));
    vertVal = 0;
  };

  let vertVal = false;
  let lightValue = 0;

  p.draw = async () => { // make this dance in the dark
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      if (lightValue == 0) {
        lightValue = Number(magic.modules.light.brightness)
        lightValue += 5;
        // console.log(magic.modules.light.brightness)
      }
      else {
        lightValue = (Number(magic.modules.light.brightness) * 0.02) + (lightValue * 0.98);
        if (lightValue < 2) {
          lightValue = 0;
        }
      }
      let bg1 = p.color(colorBG);
      let bg2 = p.color(colorBG2);

      let c1 = p.color(color3);
      let c2 = p.color(color1);
      let inter = p.map(lightValue, 0, 2005, 1, 0, true);

      let newC = p.lerpColor(c1, c2, inter).levels;
      let newBG = p.lerpColor(bg1, bg2, inter).levels;

      shiftInc = p.map(lightValue, 0, 2005, 0.05, 0.001, true);

      p.background(newBG[0], newBG[1], newBG[2], newBG[3]);

      p.noStroke();
      p.push();
      p.makeDistortedGrid(amount, newC, rez, shiftInc, inter, vertVal);
      p.pop();
    }
    else{
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Click to connect to the Magic", p.width/2, p.height/2);
    }
  };

  p.makeDistortedGrid = (amount, color, rez, shiftMulti, inter, vert) => {
    p.noFill();
    p.stroke(color[0], color[1], color[2], color[3]);
    let index = 0;
    let w = wArray[index + 1];
    if (vert) {
      for (let i = buffer; i <= p.width - buffer; i += w) {
        p.strokeWeight(w / 3);
        p.beginShape();
        for (let j = buffer; j <= p.height - buffer; j += w) {
          let rez1 = (rez * p.height) / 2000;
          let rez2 = rez1 * 2;
          let placement1 = inter * p.map(p.noise(i * rez2, j * rez1, shift + shiftMulti), 0, 0.5, -amount / 2, amount / 2)
          let placement2 = inter * p.map(p.noise(j * rez2, i * rez1, shift + 2 * shiftMulti), 0, 0.5, -amount / 2, amount / 2) // * (j / (p.height-buffer));
          p.curveVertex(i + placement1, j + placement2);
        }
        p.endShape();
        index++;
        if (index < (wArray.length - 1)) {
          w = wArray[index + 1];
        }
      }
    }
    else {
      for (let i = buffer; i <= p.height - buffer; i += w) {
        p.strokeWeight(w / 3);
        p.beginShape();
        for (let j = buffer; j <= p.width - buffer; j += w) {
          let rez1 = (rez * (p.height)) / 2000;
          let rez2 = rez1 * 2;
          let placement1 = inter * p.map(p.noise(i * rez2, j * rez1, shift + shiftMulti), 0, 0.5, -amount / 2, amount / 2) // * (j / (p.width-buffer));
          let placement2 = inter * p.map(p.noise(j * rez2, i * rez1, shift + 2 * shiftMulti), 0, 0.5, -amount / 2, amount / 2)
          p.curveVertex(j + placement1, i + placement2);
        }
        p.endShape();
        index++;
        if (index < (wArray.length - 1)) {
          w = wArray[index + 1];
        }
      }

    }

    shift += shiftInc;
    p.noFill();
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

export default myP5Sketch;

