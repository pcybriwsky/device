
import { InkLine } from "../../Functions/InkLine";
import { Poly } from "../../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"
import p5 from "p5";

const myP5Sketch = (p) => {
  p.preload = () => {
    p.font = p.loadFont("RobotoMono-Regular.ttf")
    img = p.loadImage("bigGuy.png")
  };


  let rez = 0.003;
  let amount = 1200;

  let palettes = [
    ["#fffff2", "#41d3bd", "#EE6352", "#223843", "#010101"],
    ["#0EF3C5", "#015268", "#025385", "#172347", "#010101"],
    ["#CD8A8C", "#C56AB4", "#010101", "#EFEAE7", "#010101"],
    ["#ff715b", "#258EA6", "#44AF69", "#e9f1f7", "#010101"],
    ["#CCFF66", "#FF6666", "#FFFBFC", "#58355E", "#010101"],
    ["#F7F3E3", "#010101", "#79addc", "#ff8552", "#4B4A67", "#79addc", "#091540", "#B3001B", "#941C2F"],
  ];

  let paletteNum,
    color1,
    color2,
    color3,
    color4,
    color5,
    color6,
    colorBG,
    colorBG2;

  let isMagic = false
  let wArray = []
  let lightValue = 0;
  let seedVal = 0
  let force = 0;
  let buffer = 0;
  let t = 0;
  let forceT = 0;

  let img;

  let imgPixels = [];
  let imgPixels2 = [];
  let textureOverlay;

  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    img.resize(50, 180);
    img.loadPixels();

    p.noiseDetail(1, 0.5);
    paletteNum = Math.floor(p.random(palettes.length));
    paletteNum = 5;
    color1 = palettes[paletteNum][2];
    color2 = palettes[paletteNum][3];
    color3 = palettes[paletteNum][4];
    color4 = palettes[paletteNum][5];
    color5 = palettes[paletteNum][6];
    color6 = palettes[paletteNum][7];

    colorBG = palettes[paletteNum][0];
    colorBG2 = palettes[paletteNum][1];
    p.angleMode(p.DEGREES)
    seedVal = Math.round(p.random(1000))
    buffer = p.min(p.width / 10, p.height / 10)

    textureOverlay = p.createGraphics(p.width, p.height);

    for (let i = 0; i < 50; i++) {
      lineDashArray.push([])
      for (let j = 0; j < 10; j++) {
        if (j % 2 == 0) {
          lineDashArray[i].push(p.random(40, 200))
        }
        else {
          lineDashArray[i].push(p.random(2, 80))
        }
      }
    }
  };

  let lineDashArray = [];
  let noMagic = false;


  p.draw = async () => { // make this dance in the dark
    if (noMagic || (isMagic && magic.modules.light != null && magic.modules.light != undefined && magic.modules.force != null && magic.modules.force != undefined)) {
      p.randomSeed(seedVal);
      textureOverlay.randomSeed(seedVal);
      if (noMagic) {
        lightValue = 2000
        force = 400
      }
      else {
        if (lightValue == 0) {
          lightValue = Number(magic.modules.light.brightness)
          lightValue += 5;
          if (force == 0) {
            force = Number(magic.modules.force.strength)
          }
          else {
            force = (Number(magic.modules.force.strength) * 0.05) + (force * 0.95);
          }
        }
        else {
          lightValue = (Number(magic.modules.light.brightness) * 0.1) + (lightValue * 0.9);
          if (lightValue < 2) {
            lightValue = 0;
          }
          force = (Number(magic.modules.force.strength) * 0.05) + (force * 0.95);
        }
      }

      let bg1 = p.color(colorBG2);
      let bg2 = p.color(colorBG);

      let c1 = p.color(color1);
      let c2 = p.color(color2);
      let inter = p.map(lightValue, 0, 2005, 0, 1, true);

      let newC = p.lerpColor(c1, c2, inter).levels;
      let newC2 = p.lerpColor(p.color(color3), p.color(color4), inter).levels;
      let newC3 = p.lerpColor(p.color(color5), p.color(color6), inter).levels;

      let newBG = p.lerpColor(bg1, bg2, inter).levels;
      let reverseBG = p.lerpColor(bg2, bg1, inter).levels;

      p.background(newBG[0], newBG[1], newBG[2], newBG[3]);

      textureOverlay.clear();
      textureOverlay.strokeWeight(0.1);
      textureOverlay.stroke(reverseBG[0], reverseBG[1], reverseBG[2], 30);
      textureOverlay.noFill();
      for (let i = 0; i < 2500; i++) {
        let x1 = p.random(0, p.width);
        let y1 = p.random(0, p.height);
        let x2 = x1 + p.random(-500, 500);
        let y2 = y1 + p.random(-500, 500);
        textureOverlay.line(x1, y1, x2, y2);
        textureOverlay.arc(x1, y1, 100, 100, 0, 180);
      }



      let newBuffer = buffer + p.map(force, 0, 4000, 0, 40)


      p.drawMountains(force, inter, newBG, reverseBG, newBuffer);
      // p.drawClouds(force, inter, newBG, reverseBG, newBuffer);

      p.drawingContext.setLineDash([]);




      p.noStroke();

      let startX = p.random(3 * newBuffer, p.width - 3 * newBuffer);
      let startY = p.height - buffer
      let startLength = p.height / 20
      p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], 300)
      p.strokeWeight(10)


      p.push()
      p.translate(startX, startY)
      let bendOffset = p.map(force, 0, 4000, 55, 20)
      p.rotate(bendOffset / 10);
      // p.line(0, 0, 0, -startLength);
      // p.drawBranch(0, -startLength, startLength, startLength, newC, reverseBG, bendOffset, 0);
      p.pop()






      p.drawSunMoon(force, inter, newBG, newC)

      let houseLift = p.map(force / 2, 0, 4000, 0, p.height / 2)

      // House
      let xTranslate = p.random(newBuffer, p.width - newBuffer)
      let yTranslate = p.height - 1.00 * newBuffer - 0.8 * img.height - houseLift

      // Person 

      // let xTranslate = p.random(newBuffer, p.width - newBuffer)
      // let yTranslate = p.height - 1.00 * newBuffer - 0.8*img.height
      p.drawPerson(xTranslate, yTranslate, reverseBG, newBuffer);

      p.drawHouse = (xStart, yStart, newC, newBG, reverseBG, newBuffer, force, inter) => {
        if (imgPixels.length < 1) {
          p.image(img, p.width / 2, p.height / 2, img.width, img.height);
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              let index = (x + y * img.width) * 4;

              let r = img.pixels[index];
              let g = img.pixels[index + 1];
              let b = img.pixels[index + 2];

              if (r < 100 && g < 100 && b < 100) {
                imgPixels.push({ x: x, y: y });
              }
            }
          }
          console.log(imgPixels.length)
        }
        else {
          p.push()
          p.translate(xStart + img.width / 2, yStart + img.height / 2)
          p.rotate(p.map(p.cos(t * 200), 0, 1, 0, -10) * p.map(force, 0, 4000, 0, 1))
          for (let k = 0; k < imgPixels.length; k++) {
            p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3]);
            p.strokeWeight(1.50)
            let posX = imgPixels[k].x - img.width / 2
            let posY = imgPixels[k].y - img.height / 2

            let xOffset = p.map(force, 0, 4000, 0, 20 * p.cos(t * 200))
            let yOffset = p.map(force, 0, 4000, 0, 20 * p.sin(t * 200))



            // point(posX, posY)
            p.point(posX + 2 * p.noise(posX / (k / 100), t + 100) + xOffset, posY + 2 * p.noise(posY / (k / 100) + yOffset, t + 100));
          }
          p.pop();
        }

      }

      // p.drawHouse(xTranslate, yTranslate, newC, newBG, reverseBG, newBuffer, force, inter)



      p.drawBalloon = (xStart, yStart, newC, newC2, newC3, newBG, reverseBG, newBuffer, force, inter, numBalloons) => {
        let balloonSize = p.map(force, 0, 4000, 30, 40)

        let xOffset = p.random(img.width / 3, 2 * img.width / 3)
        let x = xStart + p.random(2 * img.width / 5, 3 * img.width / 5)

        let balloonArray = []
        for (let i = 0; i < numBalloons; i++) {
          p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3])
          p.strokeWeight(2)
          if (i % 3 == 0) {
            p.fill(newC[0], newC[1], newC[2], newC[3])
          }
          else if (i % 3 == 1) {
            p.fill(newC2[0], newC2[1], newC2[2], newC2[3])
          }
          else {
            p.fill(newC3[0], newC3[1], newC3[2], newC3[3])
          }

          let balloonString = p.map(force, 0, 4000, 40, 50) * (p.random(p.map(i, 0, numBalloons, 4.0, 0.8), p.map(i, 0, numBalloons, 3.2, 0.4)))
          let y = yStart - balloonString
          let lowerBound = p.map(i, 0, 10, -0.15, 0.10) * img.width * p.map(force, 4000, 0, 0.8, 1.2)
          let upperBound = p.map(i, 0, 10, -0.10, 0.15) * img.width * p.map(force, 4000, 0, 0.8, 1.2)

          let n = p.map(p.noise(i, t / 8), 0, 1, -0.15, 0.35) * p.random(lowerBound, upperBound)
          // balloonArray.push({ x: x + n, y: y, size: balloonSize })

          p.push()
          p.translate(x, y)
          p.rotate(p.map(p.cos(t * 200), 0, 1, 0, -10) * p.map(force, 0, 4000, 0, 1))
          p.ellipse(n, 0, balloonSize * 0.8, balloonSize)
          let balloonBottom = balloonSize / 2
          let ctrlX1 = n + 30; // Control point 1 x-coordinate
          let ctrlY1 = balloonBottom + 60; // Control point 1 y-coordinate
          let ctrlX2 = - 30; // Control point 2 x-coordinate
          let ctrlY2 = balloonBottom + balloonString - 60; // Control point 2 y-coordinate

          // Draw the curve for the balloon string

          p.noFill();

          p.curve(ctrlX1, ctrlY1, n, balloonBottom, 0, balloonBottom + balloonString - 5, ctrlX2, ctrlY2);
          p.rect(0 + n - 2, 0 + balloonSize / 2, 4, 2)
          p.pop()
        }
        // for (let b = 0; b < balloonArray.length; b++) {
        //   p.fill(newC[0], newC[1], newC[2], newC[3])
        //   p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3])

        //   p.strokeWeight(2)
        //   p.rect(balloonArray[b].x - 2, balloonArray[b].y + balloonArray[b].size / 2, 4, 2)
        //   p.ellipse(balloonArray[b].x, balloonArray[b].y, balloonArray[b].size * 0.8, balloonArray[b].size)
        // }

      }

      let numBalloons = p.random(100, 500)

      // p.drawBalloon(xTranslate, yTranslate + 0.2 * img.height, newC, newC2, newC3, newBG, reverseBG, newBuffer, force, inter, numBalloons)

      p.fill(newBG[0], newBG[1], newBG[2], newBG[3])
      p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3]);
      p.strokeWeight(2)

      p.noStroke()

      p.rect(0, 0, newBuffer, p.height)
      p.rect(p.width - newBuffer, 0, newBuffer, p.height)
      p.rect(0, 0, p.width, newBuffer)
      p.rect(0, p.height - newBuffer, p.width, newBuffer)

      p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3]);
      p.strokeWeight(2)

      p.line(newBuffer, newBuffer, p.width - newBuffer, newBuffer)
      p.line(newBuffer, newBuffer, newBuffer, p.height - newBuffer)
      p.line(p.width - newBuffer, newBuffer, p.width - newBuffer, p.height - newBuffer)
      p.line(newBuffer, p.height - newBuffer, p.width - newBuffer, p.height - newBuffer)

      p.image(textureOverlay, 0, 0, p.width, p.height);

      t += 0.025
      forceT += p.map(force, 0, 4000, 0, 0.025);
    }
    else {
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Click to connect to the Magic", p.width / 2, p.height / 2);
    }
  };

  p.drawMountains = (force, inter, newBG, reverseBG, newBuffer) => {
    p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3])
    p.strokeWeight(2)
    p.noFill()
    let cloudSize = p.map(force, 0, 4000, 50, 200)
    let cloudOffset = p.map(inter, 0, 1, 0, 50)
    let w = 30;
    let dashIndex = 0;

    for (let i = 4.5 * p.height / 5 - 0.2 * newBuffer; i <= p.height - 0.1 * newBuffer; i += w) { // Could factor in some start / end that triggers after a certain point for when we're changing scenery
      p.strokeWeight(1);
      let lineDash = lineDashArray[dashIndex];
      // console.log(lineDash)
      p.drawingContext.setLineDash(lineDash);
      
      // Version with more of a sidescroll feeling
      p.beginShape();
      for (let j = 0.1 * newBuffer; j <= p.width - 0.1 * newBuffer; j += w) {
        let rez1 = (rez * (p.height)) / 2000;
        let rez2 = rez1 * 2;
        let placement1 = p.map(p.noise((i+forceT*500) * rez2, (j+forceT*500) * rez1), 0, 1, -100, 0) 
        let placement2 = p.map(p.noise((i+forceT*500) * rez2, (j+forceT*500) * rez1), 0, 1, -100, 100)
        p.curveVertex(j + placement1, i + placement2);
      }

      // OG version with better up and down

      // for (let j = 0.1 * newBuffer; j <= p.width - 0.1 * newBuffer; j += w) {
      //   let rez1 = (rez * (p.height)) / 2000;
      //   let rez2 = rez1 * 2;
      //   let placement1 = p.map(p.noise(i * rez2, j * rez1, t / 4), 0, 1, -100, 100) // * (j / (p.width-buffer));
      //   let placement2 = p.map(p.noise(i * rez2, j * rez1, t / 4), 0, 1, -100, 100)
      //   p.curveVertex(j + placement1, i + placement2);
      // }
      p.endShape();
      dashIndex++;
    }
    p.drawingContext.setLineDash([]);
  }

  p.drawClouds = (force, inter, newBG, reverseBG, newBuffer) => {
    p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3])
    p.strokeWeight(2)
    p.noFill()
    let cloudSize = p.map(force, 0, 4000, 50, 200)
    let cloudOffset = p.map(inter, 0, 1, 0, 50)
    let w = 5;

    let yStart = 2 * p.height / 5 - 0.2 * buffer
    let xStart = 2.1 * newBuffer
    let xEnd = p.width - 2.1 * newBuffer

    for (let i = yStart; i <= yStart + 2 * buffer; i += w) {
      p.strokeWeight(1);
      p.drawingContext.setLineDash([15, 5, 100, 2, 20, 2]);
      p.beginShape();
      for (let j = xStart; j <= xEnd; j += w) {
        let rez1 = (rez * (p.height)) / 2000;
        let rez2 = rez1 * 2;
        let placement1 = p.map(p.noise(i * rez2, j * rez1, t / 4), 0, 1, -100, 100) // * (j / (p.width-buffer));
        let placement2 = p.map(p.noise(i * rez2, j * rez1, t / 4), 0, 1, -100, 100)
        p.curveVertex(j + placement1, i + placement2);
      }
      p.endShape();
    }
  }

  p.drawSunMoon = (force, inter, newBG, reverseBG) => {
    p.fill(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3])
    p.noStroke()

    let ellipseX = p.map(force, 0, 4000, p.width / 2 - buffer, p.width / 2 + buffer)
    let ellipseY = p.map(force, 0, 4000, 1.5 * buffer, 2 * buffer)
    let ellipseSize = 50

    p.ellipse(ellipseX, ellipseY, ellipseSize, ellipseSize)

    p.fill(newBG[0], newBG[1], newBG[2], newBG[3])

    let ellipseOffset = p.map(inter, 0, 1, 15, 60)

    p.ellipse(ellipseX + ellipseOffset, ellipseY, ellipseSize, ellipseSize)


    p.rect(0, 0, buffer, p.height)
    p.rect(p.width - buffer, 0, buffer, p.height)
    p.rect(0, 0, p.width, buffer)
    p.rect(0, p.height - buffer, p.width, buffer)
  }

  p.drawBranch = (startX, startY, startLength, length, c, rBG, branchRange, depth) => {

    let lengthInter = p.map(length, 0, startLength, 0, 1)
    p.stroke(rBG[0], rBG[1], rBG[2], 300)
    p.strokeWeight(p.map(depth, 0, 10, 10, 1))
    p.noFill()
    if (length < 5) {
      p.noStroke()
      p.fill(c[0], c[1], c[2], startLength * 2)
      let returnSize = p.random(0, 20)
      p.ellipse(startX, startY, returnSize / 2, returnSize)
      return
    }
    else {
      let newLength = length * p.random(0.60, 0.80); // Ensure the new branch length is shorter
      let angleOffset1 = p.random(0, branchRange); // More subtle angles
      let angleOffset2 = p.random(-branchRange, 0); // More subtle angles

      // More natural-looking bezier curve control points
      let sideVariation = p.random(-1, 1) * length * 0.18; // Random side variation for control points
      let controlX1 = sideVariation;
      let controlY1 = -length * 0.3;
      let controlX2 = -sideVariation; // Opposite side variation for a more dynamic curve
      let controlY2 = -length * 0.6;
      let endX = 0;
      let endY = -length;

      // Right branch
      p.push();
      p.translate(startX, startY);
      p.rotate(angleOffset1 + 3 * p.noise(newLength + t));
      p.bezier(0, 0, controlX1, controlY1, controlX2, controlY2, endX, endY);
      p.drawBranch(endX, endY, startLength, newLength, c, rBG, branchRange, depth + 1);
      p.pop();

      // Left branch
      p.push();
      p.translate(startX, startY);
      p.rotate(angleOffset2 + 3 * p.noise(newLength + t));
      p.bezier(0, 0, controlX1, controlY1, controlX2, controlY2, endX, endY);
      p.drawBranch(endX, endY, startLength, newLength, c, rBG, branchRange, depth + 1);
      p.pop();
    }
  }

  p.drawPerson = (xStart, yStart, reverseBG, newBuffer) => {
    if (imgPixels.length < 1) {
      p.image(img, p.width / 2, p.height / 2, img.width, img.height);
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          let index = (x + y * img.width) * 4;

          let r = img.pixels[index];
          let g = img.pixels[index + 1];
          let b = img.pixels[index + 2];

          if (r < 100 && g < 100 && b < 100) {
            imgPixels.push({ x: x, y: y });
          }

          else{
            if (r > 100 && g < 100 && b < 100) {
              imgPixels2.push({ x: x, y: y });
            } 
          }
        }
      }
      console.log(imgPixels.length)
    }
    else {
      p.push()
      p.translate(xStart, yStart)
      for (let k = 0; k < imgPixels.length; k++) {
        p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3]);
        p.strokeWeight(1.50)
        let posX = imgPixels[k].x
        let posY = imgPixels[k].y

        // point(posX, posY)
        p.point(posX + 2 * p.noise(posX / (k / 100), t + 100), posY + 2 * p.noise(posY / (k / 100), t + 100));
      }
      p.pop();

      p.push()
      p.translate(xStart, yStart)
      // Blink animation
      let blink = p.map(p.cos(t * 500), -1, 1, 0, 0.75) // This pulsates at regular intervals, but instead this should be a random trigger and move more quickly
      let avgX = 0;
      let avgY = 0;
      
      for (let k = 0; k < imgPixels2.length; k++) {
        let posX = imgPixels2[k].x;
        let posY = imgPixels2[k].y;
        avgX += posX
        avgY += posY

        p.stroke(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3]);
        p.strokeWeight(1.50)
        p.point(posX, posY)
      }
      avgX /= imgPixels2.length;
      avgY /= imgPixels2.length;

      for (let k = 0; k < imgPixels2.length; k++) {
        
        let color1 = p.color(255, 0, 0, 255);
        let color2 = p.color(reverseBG[0], reverseBG[1], reverseBG[2], reverseBG[3]);
        p.stroke(p.lerpColor(color1, color2, blink));
        // p.stroke(255, 0, 0, 255 * blink);

        p.strokeWeight(1.50)
        let posX = imgPixels2[k].x
        let posY = p.map(blink, 0, 1, imgPixels2[k].y, avgY, true)

        // point(posX, posY)
        p.point(posX + 2 * p.noise(posX / (k / 100), t + 100), posY + 2 * p.noise(posY / (k / 100), t + 100));
      }
      p.pop();
    }
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

