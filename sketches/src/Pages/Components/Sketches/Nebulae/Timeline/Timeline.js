import { InkLine } from "../../../Functions/InkLine";
import { Poly } from "../../../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../../../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"

import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../../firebase.init";


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

let timeline = [

]

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
        console.log(timeline)
    }
    else {
        console.log("No timeline in local storage")
        const querySnapshot = await getDocs(collection(db, "nebulae"));
        querySnapshot.forEach((doc) => {
            timeline.push(doc.data())
        });
        timeline.sort((a, b) => a.timestamp - b.timestamp);
        latestTimestamp = timeline[timeline.length - 1].timestamp;
        localStorage.setItem("timeline", JSON.stringify(timeline))
    }
}





const myP5Sketch = (p) => {
    p.preload = async () => {
        p.font = p.loadFont("RobotoMono-Regular.ttf")
        p.emoji = p.loadFont("NotoEmoji-Regular.ttf")
    }

    let lightSlider, humiditySlider, pressureSlider, aqiSlider, temperatureSlider, co2Slider;
    let lightSliderVal, humiditySliderVal, pressureSliderVal, aqiSliderVal, temperatureSliderVal, co2SliderVal;

    let lightMulti, humidityMulti, pressureMulti, aqiMulti, temperatureMulti, co2Multi;

    let initialization = new Date().getTime()

    let timelineSlider;

    let lineHeight = 30 * p.height / 1850;
    let fontSize = lineHeight * 0.8
    let emojiSize = fontSize * 0.8;
    let maxLines = 6;
    let currentLine = "";
    let lines = [];
    let frameCounter = 0;
    let typingSpeed = 0;
    let typingWidth = 0;
    let targetLine = ""; // The line that is being typed
    let targetIndex = 0;
    let wait = 10 // Index to track which character to type next
    let waitTime = wait; // Time to wait after a line is completed
    let waiting = false; // Indicates if we are currently waiting
    let valueIndex = 0;

    let lineEmoji = [];

    let showAboutInfo = false;

    let timelineInitialized = false
    let maxRings = 40;


    let isMagic = false


    p.setup = async () => {
        p.textFont(p.font);
        p.pixelDensity(2);
        p.frameRate(10);
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.colorMode(p.RGB, 255, 255, 255, 1);

        lineHeight = 30 * p.height / 1800;
        fontSize = lineHeight * 0.8
        emojiSize = fontSize * 0.8;
        if (window.innerWidth < 600) {
            fontSize = lineHeight * 0.6
            emojiSize = fontSize * 0.6;
        }

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
        console.log(timeline)

        timeline.sort((a, b) => a.timestamp - b.timestamp);

        currentObject = timeline[timeline.length - 1].currentObject;
        dayObject = timeline[timeline.length - 1].dayObject;
        allTimeObject = timeline[timeline.length - 1].allTimeObject;
    }

    p.showAbout = () => {
        showAboutInfo = true;
    }

    p.draw = () => {
        p.blendMode(p.BLEND)
        p.fill(255);
        p.stroke(255);

        p.angleMode(p.DEGREES);
        p.noFill();
        p.noStroke();
        p.blendMode(p.BLEND);
        p.background(0);
        p.textSize(fontSize);
        p.fill(255);
        p.textAlign(p.LEFT, p.BOTTOM);

        p.blendMode(p.LIGHTEST);
        p.textAlign(p.LEFT);
        let center = 2 * p.height / 8;
        p.textSize(fontSize);

        let t = p.frameCount / 800
        console.log(currentObject.light)

        p.drawNebula(currentObject.light, currentObject.temperature, currentObject.humidity, currentObject.pressure, currentObject.aqi, currentObject.co2, t, center)

        center = 4 * p.height / 8;
        p.drawNebula(dayObject.light, dayObject.temperature, dayObject.humidity, dayObject.pressure, dayObject.aqi, dayObject.co2, t, center)

        center = 6 * p.height / 8;
        p.drawNebula(allTimeObject.light, allTimeObject.temperature, allTimeObject.humidity, allTimeObject.pressure, allTimeObject.aqi, allTimeObject.co2, t, center)
        p.graphNebula();

        p.textAlign(p.RIGHT, p.BOTTOM);
        p.textSize(fontSize);
        p.fill(255);

        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(fontSize * 1.5);
        p.textFont(p.emoji)
        p.fill(255);
        p.text("ℹ", p.width - 50, 50);
        p.textFont(p.font)

        if (showAboutInfo) {
            p.clear();
            p.background(0)

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
            p.text("This is a timeline of a real-time generative and data art piece to be placed in Charlottesville, VA. The purpose of the piece is to highlight 'nebulous' changes in the environment over the course of its existence through a series of moving maxRings that resemble nebulae.", textPadding, 2 * p.height / 8, p.width - 2 * textPadding);
            p.text("The piece is connected to a sensor that measures the environment around it, including light, humidity, pressure, AQI, temperature, and CO2 levels. It will simultaneously display the current conditions, as well as the conditions over the last 24 hours and since initialization.", textPadding, 2 * p.height / 8 + lineHeight * 4, p.width - 2 * textPadding);
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
            p.text("The CO2 impacts the hole of the maxRings, with higher CO2 values creating a larger hole. Values ranging from 200 - 600 ppm.", textPadding, 6.5 * p.height / 8 + lineHeight * 2, p.width - 2 * textPadding);
        }

        if (timeline.length > 0 && !showAboutInfo) {
            if (!timelineInitialized) {
                timeline.sort((a, b) => a.timestamp - b.timestamp);
                timelineSlider = p.createSlider(0, timeline.length, 0);
                timelineSlider.position(50, 9 / 10 * p.height);
                timelineSlider.size(p.width - 125, 10);
                timelineInitialized = true
            }
            p.drawTimeline();
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
        p.textAlign(p.LEFT, p.CENTER);
        p.textFont(p.font);
        p.textSize(fontSize);
        p.text(currentObject.light.toFixed(2) + " lux", p.width / 10 + 75, center + 20);
        p.rect(50, center + 40, humidityLength, 10);
        p.text(currentObject.humidity.toFixed(2) + " %", p.width / 10 + 75, center + 40);
        p.rect(50, center + 60, pressureLength, 10);
        p.text(currentObject.pressure.toFixed(2) + " hPa", p.width / 10 + 75, center + 60);
        p.rect(50, center + 80, aqiLength, 10);
        p.text(currentObject.aqi.toFixed(2), p.width / 10 + 75, center + 80);
        p.rect(50, center + 100, temperatureLength, 10);
        p.text(currentObject.temperature.toFixed(2) + " °C", p.width / 10 + 75, center + 100);
        p.rect(50, center + 120, co2Length, 10);
        p.text(currentObject.co2.toFixed(2) + " ppm", p.width / 10 + 75, center + 120);

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

        p.textAlign(p.LEFT, p.CENTER);

        p.textFont(p.emoji)
        p.textSize(emojiSize);
        p.text("🔅", 25, dayCenter + 20);
        p.text("💧", 25, dayCenter + 40);
        p.text("🔳", 25, dayCenter + 60);
        p.text("💨", 25, dayCenter + 80);
        p.text("🌡️", 25, dayCenter + 100);
        p.text("🌱", 25, dayCenter + 120);

        p.textAlign(p.LEFT, p.CENTER);
        p.textFont(p.font);
        p.textSize(fontSize);
        p.rect(50, dayCenter + 20, dayLightLength, 10);
        p.text(dayObject.light.toFixed(2) + " lux", p.width / 10 + 75, dayCenter + 20);
        p.rect(50, dayCenter + 40, dayHumidityLength, 10);
        p.text(dayObject.humidity.toFixed(2) + " %", p.width / 10 + 75, dayCenter + 40);
        p.rect(50, dayCenter + 60, dayPressureLength, 10);
        p.text(dayObject.pressure.toFixed(2) + " hPa", p.width / 10 + 75, dayCenter + 60);
        p.rect(50, dayCenter + 80, dayAqiLength, 10);
        p.text(dayObject.aqi.toFixed(2), p.width / 10 + 75, dayCenter + 80);
        p.rect(50, dayCenter + 100, dayTemperatureLength, 10);
        p.text(dayObject.temperature.toFixed(2) + " °C", p.width / 10 + 75, dayCenter + 100);
        p.rect(50, dayCenter + 120, dayCo2Length, 10);
        p.text(dayObject.co2.toFixed(2) + " ppm", p.width / 10 + 75, dayCenter + 120);

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

        p.textAlign(p.LEFT, p.TOP);
        p.textFont(p.font);
        p.textSize(fontSize);
        p.rect(50, allTimeCenter + 20, allTimeLightLength, 10);
        p.text(allTimeObject.light.toFixed(2) + " lux", p.width / 10 + 75, allTimeCenter + 20);
        p.rect(50, allTimeCenter + 40, allTimeHumidityLength, 10);
        p.text(allTimeObject.humidity.toFixed(2) + " %", p.width / 10 + 75, allTimeCenter + 40);
        p.rect(50, allTimeCenter + 60, allTimePressureLength, 10);
        p.text(allTimeObject.pressure.toFixed(2) + " hPa", p.width / 10 + 75, allTimeCenter + 60);
        p.rect(50, allTimeCenter + 80, allTimeAqiLength, 10);
        p.text(allTimeObject.aqi.toFixed(2), p.width / 10 + 75, allTimeCenter + 80);
        p.rect(50, allTimeCenter + 100, allTimeTemperatureLength, 10);
        p.text(allTimeObject.temperature.toFixed(2) + " °C", p.width / 10 + 75, allTimeCenter + 100);
        p.rect(50, allTimeCenter + 120, allTimeCo2Length, 10);
        p.text(allTimeObject.co2.toFixed(2) + " ppm", p.width / 10 + 75, allTimeCenter + 120);


        p.textAlign(p.LEFT, p.CENTER);
        p.textFont(p.font);

    }

    p.drawTimeline = () => {
        timelineSlider.show();
        timelineSlider.style('background', 'transparent');
        timelineSlider.style('color', 'white');
        const css = `
  input[type=range]::-webkit-slider-runnable-track {
    background: white;
    border-radius: 10px; /* Rounded track */
    height: 8px; /* Set the height of the track */
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default styling */
    width: 20px; /* Set the width of the thumb */
    height: 20px; /* Set the height of the thumb */
    background: white; /* Black thumb */
    border: 2px solid black; /* Black border */
    border-radius: 50%; /* Make the thumb rounded */
    cursor: pointer; /* Changes the cursor to a pointer */
    margin-top: -6px; /* Adjusts the position of the thumb relative to the track */
  }
  input[type=range]::-moz-range-track {
    background: white;
    border-radius: 10px;
    height: 8px;
  }
  input[type=range]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: black;
    border-radius: 50%;
  }
  input[type=range]::-ms-track {
    background: white;
    border-radius: 10px;
    height: 8px;
  }
  input[type=range]::-ms-thumb {
    width: 20px;
    height: 20px;
    background: black;
    border-radius: 50%;
  }
  input[type=range] {
    -webkit-appearance: none; /* For Chrome and Safari */
    appearance: none; /* Standard syntax */
  }
`;

        const head = document.head || document.getElementsByTagName('head')[0];
        const style = document.createElement('style');

        head.appendChild(style);

        style.type = 'text/css';
        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        let index = timelineSlider.value();
        if (index < 0) {
            index = 0;
        }
        if (index > timeline.length - 1) {
            index = timeline.length - 1;
        }
        let timelineVal = timeline[index];
        console.log(timelineVal)

        currentObject = timelineVal.currentObject;
        dayObject = timelineVal.dayObject;
        allTimeObject = timelineVal.allTimeObject;

        p.textAlign(p.LEFT, p.TOP);
        p.textSize(fontSize);
        p.fill(255);
        p.text("Nebulae Timeline - " + timeline.length + " entries", 25, 9 / 10 * p.height - 2 * fontSize);
        p.text("Use the slider to view different points in time", 25, 9 / 10 * p.height + 2 * fontSize);
        p.textSize(fontSize);
        p.fill(255);
        p.textAlign(p.RIGHT, p.CENTER);
        let currentTime = new Date(timelineVal.timestamp);
        p.text("Time: " + currentTime.toLocaleString(), p.width - 25, 9 / 10 * p.height - 2 * fontSize);
    }

    p.handleTypeFeed = () => {
        // p.typeUpdates();
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
        // p.text("Status Updates", 25, p.height - lineHeight * (totalUpdates));

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
            console.log('info')
            p.showAbout();
            // if (!isMagic) {
            //   magic.connect();
            //   console.log(magic.modules);
            //   isMagic = true;
            // }
            // else {
            //   magic.disconnect();
            //   isMagic = false;
            // }
        }
        else if (showAboutInfo) {
            showAboutInfo = false;
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        timelineInitialized = false;
        timelineSlider.remove();
        p.background(0);
    };
};

export default myP5Sketch;
