let lineFunction = {
    title: "line",
    formula: (x1, y1, x2, y2, points, p) => {
      let returnArray = []
      for (let n = 0; n < points; n++) {
        let plotX = (x2 * n) / points + (x1 * (points - n)) / points;
        let plotY = (y2 * n) / points + (y1 * (points - n)) / points + p.noise(plotX);
        returnArray.push({ x: plotX, y: plotY })
      }
      return returnArray
    }
  };
  
  let circleFunction = {
    title: "circle",
    formula: (x1, y1, x2, y2, points, p) => {
      let returnArray = []
      for (let n = 0; n < points; n++) {
        p.angleMode(p.DEGREES)
        let centerX = x1
        let centerY = y1
        let radius = p.dist(x1, y1, x2, y2) / 2
        let angle = p.cos((n / points * 360 * 0.5 + 90));
        let plotX = centerX + radius * p.cos((n / points * 360) - x1)
        let plotY = centerY + radius * p.sin((n / points * 360) - x1)
        returnArray.push({ x: plotX, y: plotY, shade: angle })
      }
      return returnArray
    }
  }
  
  let spiralFunction = {
    title: "spiral",
    formula: (x1, y1, x2, y2, points, p) => {
      let returnArray = []
      for (let n = 0; n < points - 1; n++) {
        p.angleMode(p.DEGREES)
        let centerX = x1
        let centerY = y1
        let radius = p.dist(x1, y1, x2, y2) / 1.5 * n / points
        let plotX = centerX + radius * p.cos((n / 1 + x1) % 360)
        let plotY = centerY + radius * p.sin((n / 1 + x1) % 360)
        returnArray.push({ x: plotX, y: plotY })
      }
      return returnArray
    }
  }
  
  let waveFunction = {
    title: "wave",
    formula: (x1, y1, x2, y2, points, p) => {
      p.angleMode(p.DEGREES)
      let returnArray = []
      for (let n = 0; n < points; n++) {
        let centerX = (x1 + x2) / 2
        let centerY = (y1 + y2) / 2
        let radius = p.dist(x1, y1, x2, y2) / 4 * n / points
        let plotX, plotY = null;
        if (x1 == x2) {
          plotY = (y2 * n) / points + (y1 * (points - n)) / points;
          plotX = centerX + radius * p.sin(n / points * 360)
        }
        else {
          plotX = (x2 * n) / points + (x1 * (points - n)) / points;
          plotY = centerY + radius * p.sin(n / points * 360)
        }
        returnArray.push({ x: plotX, y: plotY });
      }
      return returnArray;
    }
  }
  
  let heartFunction = {
    title: "heart",
    formula: (x1, y1, x2, y2, points, p) => {
      p.angleMode(p.DEGREES)
      let returnArray = []
      let offset = (x1+y1)%360
      for (let n = 0; n < points; n++) {
        let centerX = x1
        let centerY = y1
        let radius = p.dist(x1, y1, x2, y2) / 2
        // let angle = cos((n/points * 360 * 0.5 + 90));
        let plotX = centerX + radius * p.pow(p.sin((n / points * 360) - offset), 3)
        let plotY = centerY - ((0.8 * radius) * p.cos((n / points * 360) - offset) - (0.35 * radius) * p.cos(2 * ((n / points * 360) - offset)) - (0.2 * radius) * p.cos(3 * ((n / points * 360) - offset)) - (0.05 * radius) * p.cos(4 * ((n / points * 360) - offset)))
        returnArray.push({ x: plotX, y: plotY });
      }
      return returnArray;
    }
  }
  
  let flowerFunction = {
    title: "flower",
    formula: (x1, y1, x2, y2, points, p) => {
      p.angleMode(p.RADIANS)
      let returnArray = []
      let offset = (x1+y1)%360
      for (let n = 0; n < points; n++) {
        // if(n == 0){
        //   p.ellipse(x1, y1, 100, 100)
        // }
        let centerX = x1
        let centerY = y1
        let k = 7;
        let d = 3;
        let theta = ((n / points) * p.TWO_PI * (d + 1))
        let radius = p.dist(x1, y1, x2, y2) / 4 * p.cos((k / d) * theta) - (theta / p.TWO_PI) * p.noise(theta, centerY) * 1
        let plotX = centerX + radius * p.cos(theta)
        let plotY = centerY + radius * p.sin(theta)
        returnArray.push({ x: plotX, y: plotY });
      }
      p.angleMode(p.DEGREES)
      return returnArray;
  
    }
  
  }
  
  
  let shapeFunctions = [lineFunction, circleFunction, spiralFunction, waveFunction, heartFunction, flowerFunction]
  // All shape functions, can add more to these if wanted to
  
  export class InkLine {
    constructor(colors, weight) {
      this.colors = colors;
      this.weight = weight;
      this.drawFunction = null;
      this.analogueness = false;
      this.endBubbleP = 0;
      this.splatterStart = 0;
      this.splatterP = 0;
      this.splats = 0;
      this.addStops = 0;
      this.minWeight = 3000;
      this.maxWeight = 4000;
      this.points = null;
      this.pointsArray = null;
  
    }
  
    // Set smoothness of line
    setAnalogueness(splitP, displacement) {
      this.splitP = splitP;
      this.displacement = displacement;
    }
  
    // Add an end bubble
    setEndBubble(bubbleP) {
      this.endBubbleP = bubbleP;
    }
  
    // Set the splatter vars
    setSplatter(minSplatterDistance, splatterP, maxSplats) {
      this.splatterStart = minSplatterDistance;
      this.splatterP = splatterP
      this.maxSplats = maxSplats
    }
  
    // Set the shape function
    setDrawFunction(f) {
      this.drawFunction = shapeFunctions[f];
    }
  
    // Add stops along the line
    setStops(n) {
      this.addStops = n;
    }
  
    // Set line weight
    setWeight(min, max) {
      this.minWeight = min
      this.maxWeight = max
    }
  
    // Give custome set of points, like a trace of a shape or Strava GPS coordinates
    setPoints(pointsArray) {
      this.points = pointsArray.length;
      if (this.points < this.minWeight) {
        let newPoints = [];
        let pointsToAdd = this.minWeight - this.points;
        let segments = this.points - 1; // Number of segments between original points
        let addPerSegment = pointsToAdd / segments; // New points per segment
  
        for (let i = 0; i < segments; i++) {
          // Add the original point
          newPoints.push(pointsArray[i]);
  
          // Calculate and add the interpolated points
          for (let j = 1; j <= addPerSegment; j++) {
            let interpolatedPoint = this.interpolateBetweenPoints(pointsArray[i], pointsArray[i + 1], j / (addPerSegment + 1));
            newPoints.push(interpolatedPoint);
          }
        }
        newPoints.push(pointsArray[pointsArray.length - 1]);
        this.pointsArray = newPoints;
        this.points = this.pointsArray.length;
      }
  
      else {
        this.pointsArray = pointsArray;
      }
    }
  
    // Add points to increase line thickness along a path
    interpolateBetweenPoints(pointA, pointB, fraction, p) {
      let x = p.lerp(pointA.x, pointB.x, fraction);
      let y = p.lerp(pointA.y, pointB.y, fraction);
      return { x: x, y: y };
    }
  
    // Set points with a shape function
    setPointsFunction(x1, y1, x2, y2, p) {
      this.points = this.drawFunction.formula(x1, y1, x2, y2, (p.random(this.minWeight, this.maxWeight)), p);
    }
  
    drawLine(x1, y1, x2, y2, count, p) {
      // console.log(x1, y1, x2, y2, count, p)
      p.ellipseMode(p.CENTER);
      let strokeLength = p.dist(x1, y1, x2, y2);
  
      let points, pointsArray = null;
  
      // Define the points to be drawn through
      if (this.pointsArray == null && this.drawFunction != null) {
  
        this.pointsArray = this.drawFunction.formula(x1, y1, x2, y2, this.minWeight, p);
        this.points = this.pointsArray.length;
      }
  
      pointsArray = this.pointsArray;
      points = this.pointsArray.length;
  
      // Define the variables for the line that will impact the drawing
  
      let endBubbleProb = this.endBubbleP; // // turn into a var with setter
      let bubbleCheck = (Math.random(1) < endBubbleProb);
      let splatterProb = this.splatterP; // turn into a var with setter
      let willSplatter = (Math.random(1) < splatterProb); // turn into a var based on platter Prob and some random calc
      let splatterDistance = points * this.splatterStart; // turn into a var with setter
      let splats = Math.ceil(p.random(1, this.maxSplats)); // turn into a var with setter
  
      let weightF = (n, e) => {
        let weight = p.map(n, 0, 1, this.minWeight, 40000); // make this the point weight if it exists
        return ((6 * weight + p.random(strokeLength)) / p.width) * e;
      };
  
      let displaceF = (n, d) => {
        return p.noise(n) * d;
      };
  
      // Set the colors for the line to be drawn
      p.colorMode(p.RGB);
      let colors = [];
      let colorsLength = this.colors.length
      for (let c = 0; c < colorsLength; c++) {
        let c1 = null;
        c1 = p.color(this.colors[c]);
        colors.push(c1);
      }
  
      let c1 = null;
      let c2 = null;
  
      // Iterate through the points and draw
      for (let n = 0; n < points; n += 1) {
        if (n < count) {
          let check = Math.random(1);
  
          let plotPoint = this.pointsArray[n]
          let plotX = plotPoint.x
          let plotY = plotPoint.y
          let inter = null
  
  
          let colorInter = p.map(n, 0, points, 0, colorsLength)
  
          c1 = colors[Math.floor(colorInter)]
          c2 = colors[Math.ceil(colorInter)]
  
          if (c2 == undefined) {
            c2 = c1;
          }
  
  
          let fixedInter = p.map(colorInter, Math.floor(colorInter), Math.ceil(colorInter), 0, 1, true);
  
          let c = p.lerpColor(c1, c2, fixedInter);
          p.fill(c);
          p.noStroke()
  
          // Edit something here to reflect weight
  
          if (willSplatter && n > splatterDistance) {
            let totalPointsLeft = points - splatterDistance;
            let cuts = Math.floor(totalPointsLeft / splats);
            if (n % cuts == 0) {
  
              let displacement = displaceF(n, this.displacement);
              let weight = weightF(inter, 0.2);
  
              p.ellipse(
                plotX + displacement / 2,
                plotY + displacement / 2,
                weight,
                weight
              );
            }
          }
          else if (check > this.splitP) {
            let weight = weightF(inter, 0.15);
            let displacement = displaceF(n, this.displacement);
            p.ellipse(
              plotX + displacement / 2,
              plotY + displacement / 2,
              weight,
              weight
            );
          }
          if (bubbleCheck && n == points - 1 && !willSplatter) {
            let weight = weightF(inter, 0.35);
            p.ellipse(plotX, plotY, weight, weight);
          }
  
  
        }
  
        if (this.addStops > 0 && n == 0) {
          let colorInter = p.map(n, 0, points, 0, colorsLength)
  
          c1 = colors[Math.floor(colorInter)]
          c2 = colors[Math.ceil(colorInter)]
  
          if (c2 == undefined) {
            c2 = c1;
          }
  
          let fixedInter = p.map(colorInter, Math.floor(colorInter), Math.ceil(colorInter), 0, 1, true);
          let c = p.lerpColor(c1, c2, fixedInter);
          p.fill(c);
          p.textSize(20)
          p.text("a", pointsArray[n].x, pointsArray[n].y + 20)
        }
  
        if (this.addStops > 1 && n == points - 1) {
          let colorInter = p.map(n, 0, points, 0, colorsLength)
  
          c1 = colors[Math.floor(colorInter)]
          c2 = colors[Math.ceil(colorInter)]
  
          if (c2 == undefined) {
            c2 = c1;
          }
  
  
          let fixedInter = p.map(colorInter, Math.floor(colorInter), Math.ceil(colorInter), 0, 1, true);
  
          let c = p.lerpColor(c1, c2, fixedInter);
          p.fill(c);
          p.textSize(20)
          p.text("b", pointsArray[n].x, pointsArray[n].y + 20)
        }
      }
    }
  
    animateLine(x1, y1, x2, y2, countStart, countEnd, p) {
      p.ellipseMode(p.CENTER);
      let strokeLength = p.dist(x1, y1, x2, y2);
      let points, pointsArray = null;
  
      // Define the points to be drawn through
      if (this.pointsArray == null && this.drawFunction != null) {
        this.pointsArray = this.drawFunction.formula(x1, y1, x2, y2, this.minWeight, p);
        this.points = this.pointsArray.length;
      }
  
      pointsArray = this.pointsArray;
      points = this.pointsArray.length;
  
      // Define the variables for the line that will impact the drawing
  
      let endBubbleProb = this.endBubbleP; // // turn into a var with setter
      let bubbleCheck = (Math.random(1) < endBubbleProb);
      let splatterProb = this.splatterP; // turn into a var with setter
      let willSplatter = (Math.random(1) < splatterProb); // turn into a var based on platter Prob and some random calc
      let splatterDistance = points * this.splatterStart; // turn into a var with setter
      let splats = Math.ceil(p.random(1, this.maxSplats)); // turn into a var with setter
  
      let weightF = (n, e) => {
        let weight = p.map(n, 0, 1, this.minWeight, 40000); // make this the point weight if it exists
        return ((6 * weight + p.random(strokeLength)) / p.width) * e;
      };
  
      let displaceF = (n, d) => {
        return p.noise(n) * d;
      };
  
      // Set the colors for the line to be drawn
      p.colorMode(p.RGB);
      let colors = [];
      let colorsLength = this.colors.length
      for (let c = 0; c < colorsLength; c++) {
        let c1 = null;
        c1 = p.color(this.colors[c]);
        colors.push(c1);
      }
  
      let c1 = null;
      let c2 = null;
  
      // Iterate through the points and draw
      for (let n = countStart; n < countEnd; n += 1) {
        // console.log(n, this.addStops, countStart)
        if (n < points) {
          let check = Math.random(1);
          let plotPoint = this.pointsArray[n]
          let plotX = plotPoint.x
          let plotY = plotPoint.y
          let inter = null
  
  
          let colorInter = p.map(n, 0, points, 0, colorsLength)
  
          c1 = colors[Math.floor(colorInter)]
          c2 = colors[Math.ceil(colorInter)]
  
          if (c2 == undefined) {
            c2 = c1;
          }
  
  
          let fixedInter = p.map(colorInter, Math.floor(colorInter), Math.ceil(colorInter), 0, 1, true);
  
          let c = p.lerpColor(c1, c2, fixedInter);
          p.fill(c);
          p.noStroke()
  
          // Edit something here to reflect weight
  
          if (willSplatter && n > splatterDistance) {
            let totalPointsLeft = points - splatterDistance;
            let cuts = Math.floor(totalPointsLeft / splats);
            if (n % cuts == 0) {
  
              let displacement = displaceF(n, this.displacement);
              let weight = weightF(inter, 0.2);
  
              p.ellipse(
                plotX + displacement / 2,
                plotY + displacement / 2,
                weight,
                weight
              );
            }
          }
          else if (check > this.splitP) {
            let weight = weightF(inter, 0.15);
            let displacement = displaceF(n, this.displacement);
            p.ellipse(
              plotX + displacement / 2,
              plotY + displacement / 2,
              weight,
              weight
            );
          }
          if (bubbleCheck && n == points - 1 && !willSplatter) {
            let weight = weightF(inter, 0.35);
            p.ellipse(plotX, plotY, weight, weight);
          }
  
  
        }
  
        if (this.addStops > 0 && n == 0) {
          let colorInter = p.map(0, 0, points, 0, colorsLength)
  
          c1 = colors[Math.floor(colorInter)]
          c2 = colors[Math.ceil(colorInter)]
  
          if (c2 == undefined) {
            c2 = c1;
          }
  
          let fixedInter = p.map(colorInter, Math.floor(colorInter), Math.ceil(colorInter), 0, 1, true);
          let c = p.lerpColor(c1, c2, fixedInter);
          p.fill(c);
          p.textSize(20)
          p.text("a", pointsArray[0].x, pointsArray[0].y + 20)
        }
  
        if (this.addStops > 1) {
          let colorInter = p.map(points-1, 0, points, 0, colorsLength)
  
          c1 = colors[Math.floor(colorInter)]
          c2 = colors[Math.ceil(colorInter)]
  
          if (c2 == undefined) {
            c2 = c1;
          }
  
  
          let fixedInter = p.map(colorInter, Math.floor(colorInter), Math.ceil(colorInter), 0, 1, true);
  
          let c = p.lerpColor(c1, c2, fixedInter);
          p.fill(c);
          p.textSize(20)
          p.text("a", pointsArray[0].x, pointsArray[0].y + 20)
          p.text("b", pointsArray[points - 1].x, pointsArray[points-1].y + 20)
        }
      }
    }
  }
  
  