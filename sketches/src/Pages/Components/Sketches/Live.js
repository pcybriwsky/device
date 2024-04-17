
import { InkLine } from "../Functions/InkLine";
import { Poly } from "../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase.init";

let currentObject = {
  light: 0,
  humidity: 0,
  pressure: 0,
  aqi: 0,
  temperature: 0,
  co2: 0,
}

let dayObject = {
  light: 0,
  humidity: 0,
  pressure: 0,
  aqi: 0,
  temperature: 0,
  co2: 0,
}

let allTimeObject = {
  light: 0,
  humidity: 0,
  pressure: 0,
  aqi: 0,
  temperature: 0,
  co2: 0,
}



async function addDocToCollection() {
  try {
    console.log("Trying to add a document");
    const docRef = await addDoc(collection(db, "nebulae"), {
      currentObject: currentObject,
      dayObject: dayObject,
      allTimeObject: allTimeObject,
      timestamp: new Date().getTime()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

let timeline = [

]

let isTimelineStored = false;

async function getDocsFromCollection() {
  let latestTimestamp = 0;
  if (localStorage.getItem("timeline")) {
    console.log("Timeline in local storage")
    timeline = JSON.parse(localStorage.getItem("timeline"))
    timeline.sort((a, b) => a.timestamp - b.timestamp);
    latestTimestamp = timeline[timeline.length - 1].timestamp;

    const nebulaeCollection = collection(db, "nebulae");
    const queryConstraint = query(nebulaeCollection, where("timestamp", ">", latestTimestamp));
    const querySnapshot = await getDocs(queryConstraint);

    querySnapshot.forEach((doc) => {
      timeline.push(doc.data());
      console.log("Other documents added")
    });

    // Update the local storage with the new timeline
    localStorage.setItem("timeline", JSON.stringify(timeline));
    isTimelineStored = true;
  }
  else {
    console.log("No timeline in local storage")
    const querySnapshot = await getDocs(collection(db, "nebulae"));
    if (querySnapshot.empty) {
      console.log("No documents in collection")
    }
    else {
      querySnapshot.forEach((doc) => {
        timeline.push(doc.data())
      });

      timeline.sort((a, b) => a.timestamp - b.timestamp);
      latestTimestamp = timeline[timeline.length - 1].timestamp;
      localStorage.setItem("timeline", JSON.stringify(timeline))
      isTimelineStored = true;
    }
  }
}



const myP5Sketch = (p) => {
  p.preload = async () => {
    p.font = p.loadFont("RobotoMono-Regular.ttf")
    p.emoji = p.loadFont("NotoEmoji-Regular.ttf")
  }


  let lightSlider, humiditySlider, pressureSlider, aqiSlider, temperatureSlider, co2Slider;

  let initialization = new Date().getTime()

  let lineHeight = 30 * p.height / 1850;
  let fontSize = lineHeight * 0.8
  let emojiSize = fontSize * 0.8;
  let maxLines = 6;
  let currentLine = "";
  let lines = [];
  let frameCounter = 0;
  let typingSpeed = 1;
  let typingWidth = 0;
  let targetLine = "";
  let targetIndex = 0;
  let wait = 25
  let waitTime = wait;
  let waiting = false;
  let valueIndex = 0;

  let maxRings = 40;
  let showAboutInfo = false;

  let isMagic = false
  let lineEmoji = [];
  let initializeFirebaseWrite = false

  p.setup = async () => {
    p.textFont(p.font);
    p.pixelDensity(1);
    p.frameRate(10);
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.colorMode(p.RGB, 255, 255, 255, 1);

    lineHeight = 30 * p.height / 1850;
    fontSize = lineHeight * 0.8
    emojiSize = fontSize * 0.8;
    typingWidth = p.width / 10;

    dayObject.light = p.random(0, 4095);
    dayObject.humidity = p.random(0, 90);
    dayObject.pressure = p.random(980, 1050);
    dayObject.aqi = p.random(0, 500);
    dayObject.temperature = p.random(-10, 38);
    dayObject.co2 = p.random(200, 600);

    allTimeObject.light = p.random(0, 4095);
    allTimeObject.humidity = p.random(0, 90);
    allTimeObject.pressure = p.random(980, 1050);
    allTimeObject.aqi = p.random(0, 500);
    allTimeObject.temperature = p.random(-10, 38);
    allTimeObject.co2 = p.random(200, 600)

    await getDocsFromCollection();
    if(isTimelineStored){
      dayObject = timeline[timeline.length - 1].dayObject;
      allTimeObject = timeline[timeline.length - 1].allTimeObject;
      initialization = timeline[0].timestamp;
    }

  }


  p.showAbout = () => {
    showAboutInfo = true;
  }

  p.draw = () => {
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      
      p.angleMode(p.DEGREES);
      p.noFill();
      p.noStroke();
      p.blendMode(p.BLEND);
      p.background(0);
      p.blendMode(p.LIGHTEST);

      // Place offset here at the reading level, not down the line, this can ensure certain readings are mitigated
      let light = Number(magic.modules.light.raw.brightness); // Range is 0-4095
      let humidity = Number(magic.modules.environment.raw.humidity); // Range is 0-90
      let pressure = Number(magic.modules.environment.raw.pressure) / 100; // Range is 300 hPa to 1100 hPa

      let aqi = Number(magic.modules.environment.raw.siaq); // Range is 0-500
      
      let temperature = Number(magic.modules.environment.raw.temperature); // Range is -40 to 85 degrees C
      let co2 = Number(magic.modules.environment.raw.co2); // Ask Lance 
      

      p.stroke(255);
      p.textSize(20);
      p.text("You are connected to Magic", 10, 150);
      p.textSize(fontSize);
      p.text("Click to disconnect from Magic", 10, 170);
      if(currentObject.light == 0){
        currentObject.light = light;
      }
      else{
        currentObject.light = currentObject.light * 0.8 + light * 0.2;
      }
      currentObject.humidity = humidity;
      currentObject.pressure = pressure;
      currentObject.aqi = aqi;
      currentObject.temperature = temperature;
      currentObject.co2 = co2;

      console.log(currentObject)


      let timeSinceInitialization = new Date().getTime() / 1000 - initialization / 1000;
      let multi = Math.max(1 / (timeSinceInitialization * 10), 1 / (86400 * 10));
      dayObject.light = light * multi + dayObject.light * (1 - multi);
      dayObject.humidity = humidity * multi + dayObject.humidity * (1 - multi);
      dayObject.pressure = pressure * multi + dayObject.pressure * (1 - multi);
      dayObject.aqi = aqi * multi + dayObject.aqi * (1 - multi);
      dayObject.temperature = temperature * multi + dayObject.temperature * (1 - multi);
      dayObject.co2 = co2 * multi + dayObject.co2 * (1 - multi);


      multi = 1 / (timeSinceInitialization * 10);
      allTimeObject.light = light * multi + allTimeObject.light * (1 - multi);
      allTimeObject.humidity = humidity * multi + allTimeObject.humidity * (1 - multi);
      allTimeObject.pressure = pressure * multi + allTimeObject.pressure * (1 - multi);
      allTimeObject.aqi = aqi * multi + allTimeObject.aqi * (1 - multi);
      allTimeObject.temperature = temperature * multi + allTimeObject.temperature * (1 - multi);
      allTimeObject.co2 = co2 * multi + allTimeObject.co2 * (1 - multi);

      p.angleMode(p.DEGREES);
      p.noFill();
      p.noStroke();
      p.blendMode(p.BLEND);
      p.background(0);

      p.textSize(fontSize);
      p.fill(255);
      p.textAlign(p.LEFT);
      p.handleTypeFeed();
      p.blendMode(p.LIGHTEST);

      p.textAlign(p.LEFT);
      let center = 2 * p.height / 8;
      p.textSize(fontSize);

      let t = p.frameCount / 800
      p.drawNebula(currentObject.light, currentObject.temperature, currentObject.humidity, currentObject.pressure, currentObject.aqi, currentObject.co2, t, center)

      center = 4 * p.height / 8;
      p.drawNebula(dayObject.light, dayObject.temperature, dayObject.humidity, dayObject.pressure, dayObject.aqi, dayObject.co2, t, center)
      center = 6 * p.height / 8;

      p.drawNebula(allTimeObject.light, allTimeObject.temperature, allTimeObject.humidity, allTimeObject.pressure, allTimeObject.aqi, allTimeObject.co2, t, center)
      p.graphNebula();

      p.textAlign(p.RIGHT, p.BOTTOM);
      p.textSize(fontSize);
      p.fill(255);
      let initializationDate = new Date(initialization)
      p.text("Initialized: " + initializationDate.toLocaleString(), p.width - 25, p.height - lineHeight);
      
      // Firebase initialization
      if (!initializeFirebaseWrite) {
        initializeFirebaseWrite = true;
        addDocToCollection();
        setInterval(addDocToCollection, 1000 * 60 * 60 * 6); // Every 6 hours
      }
    }

    else if (isMagic && magic.modules != undefined) {
      console.log(magic)
      p.background(0);
      p.textFont(p.font);
      p.textSize(fontSize);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("No device found, please connect a device to proceed", p.width / 2, p.height / 2);
    }

    // Current file
    else {
      p.background(0);
      p.textFont(p.font);
      p.textSize(fontSize * 4);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Nebulae", p.width / 2, p.height / 2);
      p.textSize(fontSize);
      p.text("Live data environment visualization. Click to connect Magic", p.width / 2, p.height / 2 + fontSize * 4);
    }


    if (showAboutInfo) {
      p.clear();
      p.background(0)
      lightSlider.hide()
      humiditySlider.hide()
      pressureSlider.hide()
      co2Slider.hide()
      aqiSlider.hide()
      temperatureSlider.hide()

      p.textFont(p.font);
      p.textSize(fontSize * 2);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Nebulae", p.width / 2, p.height / 8);
      p.textSize(fontSize * 1);
      p.text("A generative and data art piece by Pete Cybriwsky", p.width / 2, p.height / 8 + lineHeight * 2);
      p.textSize(fontSize);
      p.textAlign(p.CENTER, p.CENTER);
      let textPadding = 60;
      p.text("This is a demo version of a real-time generative and data art piece to be placed in Charlottesville, VA. The purpose of the piece is to highlight 'nebulous' changes in the environment over the course of its existence through a series of moving maxRings that resemble nebulae.", textPadding, 2 * p.height / 8, p.width - 2 * textPadding);
      p.text("The piece will be connected to a sensor that measures the environment around it, including light, humidity, pressure, AQI, temperature, and CO2 levels. It will simultaneously display the current conditions, as well as the conditions over the last 24 hours and since initialization.", textPadding, 2 * p.height / 8 + lineHeight * 4, p.width - 2 * textPadding);
      p.text("The piece will be made of a series of maxRings that will change color and size based on the current conditions. The maxRings will be made of a series of points that will be connected by a curve.", textPadding, 2 * p.height / 8 + lineHeight * 8, p.width - 2 * textPadding);
      p.text("Certain conditions (temperature + pressure) are mapped to a range that is specific to Charlottesvilles 2023 highs and lows to create a relevant range in outputs for this project. More information on how each impact the piece can be found below.", textPadding, 2 * p.height / 8 + lineHeight * 12, p.width - 2 * textPadding);


      p.textFont(p.emoji);
      p.textSize(emojiSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("🔅", p.width / 2, 4 * p.height / 8);
      p.textFont(p.font);
      p.textSize(fontSize);
      p.text("Light", p.width / 2, 4 * p.height / 8 + lineHeight);
      p.text("The thickness of the maxRings and the brightness of the piece is determined by the light sensor. The light sensor measures the amount of light in lux, values ranging from 0 - 4095.", textPadding, 4 * p.height / 8 + lineHeight * 2, p.width - 2 * textPadding);

      p.textFont(p.emoji);
      p.textSize(emojiSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("💧", p.width / 2, 4.5 * p.height / 8);
      p.textFont(p.font);
      p.textSize(fontSize);
      p.text("Humidity", p.width / 2, 4.5 * p.height / 8 + lineHeight);
      p.text("The humidity impacts the smoothness of the maxRings, rounding them out as it get's more humid. Values ranging from 0 - 90 %.", textPadding, 4.5 * p.height / 8 + lineHeight * 2, p.width - 2 * textPadding);
      p.textFont(p.emoji);
      p.textSize(emojiSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("🔳", p.width / 2, 5 * p.height / 8);
      p.textFont(p.font);
      p.textSize(fontSize);
      p.text("Pressure", p.width / 2, 5 * p.height / 8 + lineHeight);
      p.text("The pressure determines how confined the maxRings are, with higher pressure condesing the piece. Values ranging from 980 - 1050 hPa.", textPadding, 5 * p.height / 8 + lineHeight * 2, p.width - 2 * textPadding);

      p.textFont(p.emoji);
      p.textSize(emojiSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("💨", p.width / 2, 5.5 * p.height / 8);
      p.textFont(p.font);
      p.textSize(fontSize);
      p.text("AQI", p.width / 2, 5.5 * p.height / 8 + lineHeight);
      p.text("The AQI impacts the texture of the maxRings, with higher AQI adding more noise and texture. Values ranging from 0 - 300.", textPadding, 5.5 * p.height / 8 + lineHeight * 2, p.width - 2 * textPadding);

      p.textFont(p.emoji);
      p.textSize(emojiSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("🌡️", p.width / 2, 6 * p.height / 8);
      p.textFont(p.font);
      p.textSize(fontSize);
      p.text("Temperature", p.width / 2, 6 * p.height / 8 + lineHeight);
      p.text("The temperature impacts the color of the maxRings, with warmer temperatures creating more red colors and colder temperatures creating more blue. Values ranging from 14 - 104 °F.", textPadding, 6 * p.height / 8 + lineHeight * 2, p.width - 2 * textPadding);

      p.textFont(p.emoji);
      p.textSize(emojiSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("🌱", p.width / 2, 6.5 * p.height / 8);
      p.textFont(p.font);
      p.textSize(fontSize);
      p.text("CO2", p.width / 2, 6.5 * p.height / 8 + lineHeight);
      p.text("The CO2 impacts the hole of the maxRings, with higher CO2 values creating a larger hole. Values ranging from 200 - 1500 ppm.", textPadding, 6.5 * p.height / 8 + lineHeight * 2, p.width - 2 * textPadding);
    }

  }

  p.drawNebula = (light, temp, humidity, pressure, aqi, co2, t, center) => {
    // Calculate multipliers once and reuse them
    const multipliers = {
      temp: p.map(temp, -10, 38, 0, 1),
      pressure: p.map(pressure, 980, 1050, 0, 1, true),
      light: p.map(light, 0, 4095, 0, 1, true),
      co2: p.map(co2, 200, 600, 0.1, 1, true),
      aqi: p.map(aqi, 0, 500, 0.3, 1, true),
      humidity: p.map(humidity, 0, 80, 0, 1, true)
    };

    const stepSize = Math.floor(p.map(multipliers.humidity, 0, 1, 30, 8, true));
    const minRings = (maxRings / 2) * multipliers.co2;
    const maxNoise = p.map(window.innerWidth, 300, 1920, 100, 250, true);
    const xCenter = p.width / 2;

    for (let r = minRings; r <= maxRings; r++) { // Blending approach adapted from Roni Kaufman's openprocessing sketch: https://openprocessing.org/sketch/839679 
      const commonParams = {
        size: r * ((1 - multipliers.co2) + 0.2),
        xCenter,
        yCenter: center,
        k: Math.log((r * (multipliers.aqi + 0.1)) / maxRings + 1) + 0.25,
        t,
        noiseLevel: maxNoise * (r / maxRings) * (1.45 - 1.1 * multipliers.pressure),
        stepSize
      };

      const alpha = (0.6 - (r / maxRings)) * (1.1 - multipliers.light) + Math.sin(Math.PI * r / maxRings) * multipliers.light; 

      p.drawRings(r, commonParams, multipliers, alpha, maxRings);
    }
    p.noStroke();
  };

  p.drawRings = (r, commonParams, multipliers, alpha, maxRings) => {
    const offsets = [0, 20, 40];
    const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
    offsets.forEach((offset, index) => {
      let size = commonParams.size * (index === 0 ? multipliers.temp : (index === 2 ? 1 - multipliers.temp : 0.125));
      p.strokeWeight(1 + multipliers.temp + multipliers.light + (r / maxRings) * 2);
      p.stroke(...colors[index], alpha);
      p.drawRing({ ...commonParams, size, angleOffset: offset });
    });
  };

  p.drawRing = ({ size, xCenter, yCenter, k, t, noiseLevel, stepSize, angleOffset }) => {
    p.noFill();
    p.beginShape();
    const inc = Math.round(360 / stepSize);
    for (let ang = 0; ang < 360 + 2 * inc; ang += inc) {
      const xOff = p.map(p.cos(ang), -1, 1, 0, 1);
      const yOff = p.map(p.sin(ang), -1, 1, 0, 1);
      const addedNoise = calculateNoise(k, ang, t, noiseLevel, angleOffset, stepSize);
      const r = p.map(p.noise(k * xOff, k * yOff, t), 0, 1, size, size + 2 * addedNoise);
      const x = xCenter + r * p.cos(ang);
      const y = yCenter + r * p.sin(ang);
      p.curveVertex(x, y);
    }
    p.endShape(p.CLOSE);
  };


  const calculateNoise = (k, ang, t, noiseLevel, angleOffset, stepSize) => {
    const baseNoise = p.noise(k * (p.cos(ang + angleOffset / stepSize) + 1), k * (p.sin(ang + angleOffset / stepSize) + 1), t) * noiseLevel;

    // Secondary noise with doubled frequency for finer details
    const secondaryNoise = 0.2 * p.noise(2 * k * (p.cos(ang + angleOffset / stepSize) + 1), 2 * k * (p.sin(ang + angleOffset / stepSize) + 1), t) * noiseLevel;

    // Tertiary noise for added depth, with a higher frequency but lower impact
    const tertiaryNoise = 0.05 * p.noise(4 * k * (p.cos(ang + angleOffset / stepSize) + 1), 4 * k * (p.sin(ang + angleOffset / stepSize) + 1), t) * noiseLevel;

    return baseNoise + secondaryNoise + tertiaryNoise;
  };

  p.graphNebula = () => {
    let center = 2 * p.height / 8 - 60
    p.textSize(fontSize);
    p.fill(255);

    p.textAlign(p.LEFT, p.CENTER);
    p.textFont(p.font);
    p.text("Current", 25, center);
    p.textAlign(p.LEFT, p.TOP);

    let currentLightConversion = p.map(((currentObject.light * (3.3 / 4095)) / 10000) * 1000000, 0, ((4095 * (3.3 / 4095)) / 10000) * 1000000, 0, 950);

    let lightLength = p.map(currentLightConversion, 0, 950, 0, p.width / 10, true);
    let humidityLength = p.map(currentObject.humidity, 0, 90, 0, p.width / 10, true);
    let pressureLength = p.map(currentObject.pressure, 980, 1050, 0, p.width / 10, true);
    let aqiLength = p.map(currentObject.aqi, 0, 500, 0, p.width / 10, true);
    let temperatureLength = p.map(currentObject.temperature, -10, 38, 0, p.width / 10, true);
    let co2Length = p.map(currentObject.co2, 200, 600, 0, p.width / 10, true);

    p.textFont(p.emoji)
    p.textSize(emojiSize);
    p.text("🔅", 25, center + 20);
    p.text("💧", 25, center + 40);
    p.text("🔳", 25, center + 60);
    p.text("💨", 25, center + 80);
    p.text("🌡️", 25, center + 100);
    p.text("🌱", 25, center + 120);

    p.rect(50, center + 20, lightLength, 10);
    p.rect(50, center + 40, humidityLength, 10);
    p.rect(50, center + 60, pressureLength, 10);
    p.rect(50, center + 80, aqiLength, 10);
    p.rect(50, center + 100, temperatureLength, 10);
    p.rect(50, center + 120, co2Length, 10);

    let dayCenter = 4 * p.height / 8 - 60;
    p.textFont(p.font);
    p.textSize(fontSize);

    p.textAlign(p.LEFT, p.CENTER);

    p.text("Last 24 Hours", 25, dayCenter);
    let dayLightConversion = p.map(((dayObject.light * (3.3 / 4095)) / 10000) * 1000000, 0, ((4095 * (3.3 / 4095)) / 10000) * 1000000, 0, 950);

    let dayLightLength = p.map(dayLightConversion, 0, 950, 0, p.width / 10, true);
    let dayHumidityLength = p.map(dayObject.humidity, 0, 90, 0, p.width / 10, true);
    let dayPressureLength = p.map(dayObject.pressure, 980, 1050, 0, p.width / 10, true);
    let dayAqiLength = p.map(dayObject.aqi, 0, 500, 0, p.width / 10, true);
    let dayTemperatureLength = p.map(dayObject.temperature, -10, 38, 0, p.width / 10, true);
    let dayCo2Length = p.map(dayObject.co2, 200, 600, 0, p.width / 10, true);

    p.textAlign(p.LEFT, p.TOP);

    p.textFont(p.emoji)
    p.textSize(emojiSize);
    p.text("🔅", 25, dayCenter + 20);
    p.text("💧", 25, dayCenter + 40);
    p.text("🔳", 25, dayCenter + 60);
    p.text("💨", 25, dayCenter + 80);
    p.text("🌡️", 25, dayCenter + 100);
    p.text("🌱", 25, dayCenter + 120);

    p.rect(50, dayCenter + 20, dayLightLength, 10);
    p.rect(50, dayCenter + 40, dayHumidityLength, 10);
    p.rect(50, dayCenter + 60, dayPressureLength, 10);
    p.rect(50, dayCenter + 80, dayAqiLength, 10);
    p.rect(50, dayCenter + 100, dayTemperatureLength, 10);
    p.rect(50, dayCenter + 120, dayCo2Length, 10);

    let allTimeCenter = 6 * p.height / 8 - 60;
    p.textAlign(p.LEFT, p.CENTER);
    p.textFont(p.font);
    p.textSize(fontSize);
    p.text("Since Initialized", 25, allTimeCenter);
    let allTimeLightConversion = p.map(((allTimeObject.light * (3.3 / 4095)) / 10000) * 1000000, 0, ((4095 * (3.3 / 4095)) / 10000) * 1000000, 0, 950);

    let allTimeLightLength = p.map(allTimeLightConversion, 0, 950, 0, p.width / 10, true);
    let allTimeHumidityLength = p.map(allTimeObject.humidity, 0, 90, 0, p.width / 10, true);
    let allTimePressureLength = p.map(allTimeObject.pressure, 980, 1050, 0, p.width / 10, true);
    let allTimeAqiLength = p.map(allTimeObject.aqi, 0, 500, 0, p.width / 10, true);
    let allTimeTemperatureLength = p.map(allTimeObject.temperature, -10, 38, 0, p.width / 10, true);
    let allTimeCo2Length = p.map(allTimeObject.co2, 200, 600, 0, p.width / 10);

    p.textAlign(p.LEFT, p.TOP);

    p.textFont(p.emoji)
    p.textSize(emojiSize);
    p.text("🔅", 25, allTimeCenter + 20);
    p.text("💧", 25, allTimeCenter + 40);
    p.text("🔳", 25, allTimeCenter + 60);
    p.text("💨", 25, allTimeCenter + 80);
    p.text("🌡️", 25, allTimeCenter + 100);
    p.text("🌱", 25, allTimeCenter + 120);

    p.rect(50, allTimeCenter + 20, allTimeLightLength, 10);
    p.rect(50, allTimeCenter + 40, allTimeHumidityLength, 10);
    p.rect(50, allTimeCenter + 60, allTimePressureLength, 10);
    p.rect(50, allTimeCenter + 80, allTimeAqiLength, 10);
    p.rect(50, allTimeCenter + 100, allTimeTemperatureLength, 10);
    p.rect(50, allTimeCenter + 120, allTimeCo2Length, 10);


    p.textAlign(p.LEFT, p.CENTER);
    p.textFont(p.font);

  }


  p.handleTypeFeed = () => {
    p.typeUpdates();
    if (!waiting && lines.length < maxLines) {
      if (valueIndex === 0) { // can add more stuff here
        lineEmoji.push("🔅");
        p.newLine("Brightness: " + currentObject.light.toFixed(2) + " lux");
      }
      else if (valueIndex === 1) {
        lineEmoji.push("💧");
        p.newLine("Humidity: " + currentObject.humidity.toFixed(2) + " %");
      }
      else if (valueIndex === 2) {
        lineEmoji.push("🔳");
        p.newLine("Pressure: " + currentObject.pressure.toFixed(2) + " hPa");
      }
      else if (valueIndex === 3) {
        lineEmoji.push("💨");
        p.newLine("AQI: " + currentObject.aqi.toFixed(2));
      }
      else if (valueIndex === 4) {
        lineEmoji.push("🌡️");
        p.newLine("Temperature: " + (currentObject.temperature * 1.8 + 32).toFixed(2) + " °F");
      }
      else if (valueIndex === 5) {
        lineEmoji.push("🌱");
        p.newLine("CO2: " + currentObject.co2.toFixed(2) + " ppm");
      }
      valueIndex++;
      if (valueIndex > 5) {
        valueIndex = 0;
        if (lineEmoji.length > 6) {
          lineEmoji.shift()
        }
      }
      waiting = true;
    }
  }

  p.typeUpdates = () => {
    p.textSize(fontSize);
    p.fill(255)
    let totalUpdates = 7;
    for (let i = lines.length; i >= 0; i--) {
      p.textFont(p.emoji)
      p.textSize(emojiSize);
      p.text(lineEmoji[lineEmoji.length - i - 1], 25, p.height - (((totalUpdates - 1) - i) * lineHeight));

      p.textFont(p.font)
      p.textSize(fontSize);
      p.text(lines[i], 50, p.height - (((totalUpdates - 1) - i - 1) * lineHeight));
    }

    if (frameCounter === typingSpeed) {
      p.addCharacter();
      frameCounter = 0; // Reset frame counter
    } else {
      frameCounter++;
    }

    p.textFont(p.emoji)
    p.textSize(emojiSize);
    p.text(lineEmoji[lineEmoji.length - 1], 25, p.height - lineHeight * (totalUpdates - 1));


    p.textFont(p.font)
    p.textSize(fontSize);
    p.text(currentLine, 50, p.height - lineHeight * (totalUpdates - 1));
    p.text("Status Updates", 25, p.height - lineHeight * (totalUpdates));
  }

  p.addCharacter = () => {
    if (targetIndex < targetLine.length) {
      currentLine += targetLine.charAt(targetIndex);
      targetIndex++;
    }

    // Check if the current line typing is complete
    if (currentLine.length === targetLine.length) {
      waiting = true;
      waitTime--;
      if (waitTime <= 0) {
        lines.unshift(currentLine); // Add current line to lines array
        if (lines.length >= maxLines) {
          lines.pop(); // Remove the oldest line
        }
        // Reset for the next line
        currentLine = "";
        targetLine = "";
        targetIndex = 0;
        waiting = false;
        waitTime = wait;
      }
    }
  }

  p.newLine = (newLine) => {
    if (!waiting && currentLine === "") {
      targetLine = newLine;
      targetIndex = 0;
    }
  }

  p.mousePressed = async () => {
    if (p.mouseX > p.width - 100 && p.mouseY < 100 && !showAboutInfo) {
      p.showAbout();
    }
    else if (showAboutInfo) {
      showAboutInfo = false;
    }

    if (!isMagic) {
      // MUST BE TRUE FOR MAGIC TO WORK
      let meshVal = true;
      magic.connect({ mesh: meshVal, auto: false });
      if (meshVal) {
        console.log("In mesh mode for production, this is correct state for UVa");
      }
      else {
        console.log("In direct mode for development, this is not in correct state for UVa");
      }

      console.log(magic.modules);
      isMagic = true;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
};

export default myP5Sketch;

