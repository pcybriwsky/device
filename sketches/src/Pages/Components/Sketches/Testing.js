
import { InkLine } from "../Functions/InkLine";
import { Poly } from "../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"
import p5 from "p5";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.init";

// try {
//   console.log("Trying to add a document");
//   const docRef = await addDoc(collection(db, "users"), {
//     first: "Ada",
//     last: "Lovelace",
//     born: 1815
//   });
//   console.log("Document written with ID: ", docRef.id);
// } catch (e) {
//   console.error("Error adding document: ", e);
// }

async function getDocsFromCollection() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data().last}`);
  });
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

  let lightArray = [];

  p.setup = async () => {
    p.textFont(p.font);
    p.pixelDensity(1);
    p.frameRate(10);
    p.createCanvas(window.innerWidth, window.innerHeight);
    // setInterval(getDocsFromCollection, 1000); // Pass the function reference without calling it

  }







  p.showAbout = () => {
    // showAboutInfo = true;
  }



  let fontSize = 20;
  p.draw = () => {
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      p.angleMode(p.DEGREES);
      p.noFill();
      p.noStroke();
      p.blendMode(p.BLEND);
      p.background(0);
      // p.blendMode(p.LIGHTEST);

      let light = Number(magic.modules.light.raw.brightness); // Range is 0-4095
      let humidity = Number(magic.modules.environment.raw.humidity); // Range is 0-90
      let pressure = Number(magic.modules.environment.raw.pressure) / 100; // Range is 300 hPa to 1100 hPa
      let aqi = Number(magic.modules.environment.raw.aqi); // Range is 0-500
      let temperature = Number(magic.modules.environment.raw.temperature); // Range is -40 to 85 degrees C
      let co2 = Number(magic.modules.environment.raw.co2); // Ask Lance 

      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(light, p.width / 10, p.height / 2 - 100);

      p.textAlign(p.LEFT, p.TOP)

      p.textSize(20);
      p.text("You are connected to Magic", 10, 150);
      p.textSize(fontSize);
      p.text("Click to disconnect from Magic", 10, 170);


      p.stroke(255);
      p.strokeWeight(1);

      p.fill(255);
      p.noFill();

      let ellipseSize = p.width / 10;

      if (light > 300) {
        let lightVal = p.map(light, 0, 4095, 0, 255);
        let thickness = p.map(light, 0, 4095, 0, 10);

        p.stroke(255, lightVal);
        p.strokeWeight(thickness);
        p.ellipse(p.width / 2, p.height / 2 - ellipseSize / 1.75, ellipseSize, ellipseSize / 4);

      }
      else {
        p.stroke(255, 0, 0)
        p.strokeWeight(1);



      }

      // face
      p.stroke(255);
      p.strokeWeight(1);
      p.ellipse(p.width / 2, p.height / 2, ellipseSize, ellipseSize);

      // eyes
      // p.fill(255);

      // use an arc and the arc are lines that gradually flatten with light
      if (light > 300) {
        let eyeSize = p.map(light, 300, 4095, 0.0001, ellipseSize / 6);
        let eyeMiddle = p.map(light, 300, 4095, 0.0001, ellipseSize / 24);

        p.arc(p.width / 2 - ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeSize, -180, 0);
        p.arc(p.width / 2 - ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeMiddle, -180, 0);

        p.arc(p.width / 2 + ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeSize, -180, 0);
        p.arc(p.width / 2 + ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeMiddle, -180, 0);


        let mouthSize = p.map(light, 300, 4095, 0.0001, ellipseSize / 12);
        let mouthMiddle = p.map(light, 300, 4095, 0.0001, ellipseSize / 24);

        p.arc(p.width / 2, p.height / 2 + ellipseSize / 6, ellipseSize / 3, mouthSize, 0, 180);
        p.arc(p.width / 2, p.height / 2 + ellipseSize / 6, ellipseSize / 3, mouthMiddle, 0, 180);
      }


      else {
        let eyeSize = p.map(light, 0, 300, ellipseSize / 6, 0.0001);
        let eyeMiddle = p.map(light, 0, 300, ellipseSize / 24, 0.0001);

        p.arc(p.width / 2 - ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeSize, 0, 180);
        p.arc(p.width / 2 - ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeMiddle, 0, 180);

        p.arc(p.width / 2 + ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeSize, 0, 180);
        p.arc(p.width / 2 + ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, eyeMiddle, 0, 180);

        let mouthSize = p.map(light, 0, 300, ellipseSize / 12, 0.0001);
        let mouthMiddle = p.map(light, 0, 300, ellipseSize / 24, 0.0001);

        p.arc(p.width / 2, p.height / 2 + ellipseSize / 6, ellipseSize / 3, mouthSize, -180, -0);
        p.arc(p.width / 2, p.height / 2 + ellipseSize / 6, ellipseSize / 3, mouthMiddle, -180, -0);
      }


      // p.arc(p.width / 2 + ellipseSize / 6, p.height / 2 - ellipseSize / 6, ellipseSize / 6, ellipseSize / 6, 0, 180);





    }


    else if (isMagic) {
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
      p.textSize(fontSize * 2);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Testing", p.width / 2, p.height / 2);
      p.text("Live data environment visualization. Click to connect Magic", p.width / 2, p.height / 2 + fontSize * 4);
    }

  }

  let isMagic = false
  p.mousePressed = async () => {
    if (p.mouseX > p.width - 100 && p.mouseY < 100) {
      console.log('info')
      p.showAbout();
    }

    if (!isMagic) {
      magic.connect();
      console.log(magic.modules);
      isMagic = true;
    }

  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };



};

export default myP5Sketch;

