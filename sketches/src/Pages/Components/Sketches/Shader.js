
import { InkLine } from "../Functions/InkLine";
import { Poly } from "../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"

const myP5Sketch = (p) => {
  let theShader;

  p.preload = () => {
    // Define shader code
    const vertShader = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    
    varying vec2 pos;
    
    void main() {
      pos = aTexCoord;
    
      vec4 positionVec4 = vec4(aPosition, 1.0);
      positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
      
      gl_Position = positionVec4;
    }
    `;

    const fragShader = `
    precision mediump float;

varying vec2 pos;
uniform float millis;
uniform vec2 iResolution;
uniform float fractals;
uniform float shaderBG;
uniform float speedMulti;
uniform float beatTime;
uniform float lightVal;
uniform float powMulti;

vec3 palette(float t){
  vec3 a = vec3(0.5, 0.4, 0.6);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 0.9, 1.0);
    vec3 d = vec3(0.263, 0.416,0.557);

  
  return a+b*cos(6.28318*(c*t*d));
}

float capsule(vec2 p){
    float r1 = 0.04;
    float r2 = 0.12;
    float h = 0.24;
    p.x = abs(p.x);
    float b = (r1-r2)/h;
    float a = sqrt(1.0-b*b);
    float k = dot(p,vec2(-b,a));
    if( k < 0.0 ) return length(p) - r1 ;
    if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
    return dot(p, vec2(a,b) ) - r1;
}

float moon(vec2 p){
    float d = 0.02;
    float ra = 0.02;
    float rb = 0.08;
    p.y = abs(p.y);
    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if( d*(p.x*b-p.y*a) > d*d*max(b-p.y,0.0) )
          return length(p-vec2(a,b));
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

float sdfCircle(vec2 uv) {
    return length(uv) - 0.5;
}

float sdfHexagon(vec2 p, float r )
{
    const vec3 k = vec3(-0.866025404,0.5,0.577350269);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p)*sign(p.y);
}

float sdfHexagram(vec2 p, float r )
{
    const vec4 k = vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
    p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
    return length(p)*sign(p.y);
}

float sdf(vec2 p) {
    return sdfHexagram(p, 1.0);
}

float beat(float t) {
    return t + ((sin(t * 8.0) + sin(t * 6.0) + sin(t * 18.0)) / 2.0) * ((sin(t * 0.01) + 1.0) / 2.0);
}

const float PHI = (1.0 + sqrt(5.0)) / 2.0;

vec2 rotate(vec2 u, float theta) {
    float c = cos(theta);
    float s = sin(theta);
    mat2 R = mat2(c, s, -s, c);
    
    return R * u;
}


void main() {  
  

  vec2 uv = pos * 2. - 1.; // normalizes 0 to center
  uv.x *= iResolution.x/iResolution.y;
  uv = rotate(uv, millis/30000.);
  vec2 uv0 = uv;
  uv0 = rotate(uv0, millis/5000./float(lightVal));
  vec3 finalColor = vec3(0.0);
  float beatTime = (sin(length(uv) * 6.0 - beat(millis/10000.)));
  for(float i = 10.0; i > 0.0; i--){
    if(float(i) < float(lightVal)) break;
    uv = fract(uv*fractals * 1.0) - 0.5 ; // Breaks down stuff into quadrants and nirmalizes it to center
    float d = (sdfHexagram(uv, i) * exp(-sdfHexagon(uv0, sin(millis/10000.))));
    d = abs(sin(d * 8.0 + beatTime*0.6) / 8.0);
    d = pow(float(powMulti) / d, 2.2);
    
    vec3 col = palette(d + millis/(5000.*i) + i*2.);
    finalColor += col * d * i/5.;
  }
  
  gl_FragColor = vec4(finalColor, 1.);
  
}`;

    theShader = p.createShader(vertShader, fragShader);
  };





  const numCircles = 100;
  let fractals = 0;
  let shaderBG = 0;
  let speedMulti = 0;

  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    p.pixelDensity(2)

    const circles = [];
    for (let i = 0; i < numCircles; i++) {
      circles.push(p.random(), p.random(), p.random(0.05, 0.01));
    }
    theShader.setUniform('iResolution', [p.width, p.height]);
    fractals = Math.round(p.random(1, 5));
    shaderBG = Math.round(p.random(1));
    p.shader(theShader);

  }




  let lightMapped = 2;
  let powMulti = 0.01;
  p.draw = () => {
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {

      // p.blendMode(p.LIGHTEST);

      let light = Number(magic.modules.light.raw.brightness); // Range is 0-4095
      let humidity = Number(magic.modules.environment.raw.humidity); // Range is 0-90
      let pressure = Number(magic.modules.environment.raw.pressure) / 100; // Range is 300 hPa to 1100 hPa
      let aqi = Number(magic.modules.environment.raw.iaq); // Range is 0-500
      let temperature = Number(magic.modules.environment.raw.temperature); // Range is -40 to 85 degrees C
      let co2 = Number(magic.modules.environment.raw.co2); // Ask Lance 
      // console.log(light, humidity, pressure, aqi, temperature, co2)

      let lightVal = Math.ceil(p.map(light, 0, 4095, 2, 10));
      lightMapped = lightMapped + (lightVal - lightMapped) * 0.01;
      let tempMapped = p.map(temperature, -40, 85, 1, 2);
      fractals = Math.round(2.5/lightMapped);
      powMulti = p.map(light, 0, 4095, 0.01, 0.001);



    }


    else if (isMagic) {
      // p.text("No device found, please connect a device to proceed", p.width / 2, p.height / 2);
    }

    // Current file
    else {

    }

    theShader.setUniform("powMulti", powMulti);
    theShader.setUniform("lightVal", lightMapped);
    theShader.setUniform("millis", p.millis());
    theShader.setUniform("iResolution", [p.width, p.height]);
    theShader.setUniform("fractals", fractals)
    theShader.setUniform("shaderBG", 1)
    theShader.setUniform("speedMulti", speedMulti)
    // Run shader
    p.rect(0, 0, p.width, p.width);

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

