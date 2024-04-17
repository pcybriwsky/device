
import { InkLine } from "../Functions/InkLine";
import { Poly } from "../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/magic-js"
import p5 from "p5";

const myP5Sketch = (p) => {

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
   
    #ifdef GL_ES
      precision highp float;
    #endif

    uniform vec2 iResolution;
    uniform float millis;
    uniform float heat;
    varying vec2 pos;

    float hash(vec2 p) {
        p = fract(p * 0.6180339887);
        p *= 25.0;
        return fract(p.x * p.y * (p.x + p.y));
    }

    float noise(in vec2 x) {
        vec2 p = floor(x);
        vec2 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(p + vec2(0.0, 0.0));
        float b = hash(p + vec2(1.0, 0.0));
        float c = hash(p + vec2(0.0, 1.0));
        float d = hash(p + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * noise(p); p = p * 2.02;
        f += 0.2500 * noise(p); p = p * 2.03;
        f += 0.1250 * noise(p); p = p * 2.01;
        f += 0.0625 * noise(p);
        return f / 0.9375;
    }

    const mat2 mtx = mat2(1.6,  1.2, -1.2,  1.6);

    float fbm4( vec2 p )
    {
        float f = 0.0;
        f += 0.5000*(-1.0+2.0*noise( p )); p = mtx*p*2.02;
        f += 0.2500*(-1.0+2.0*noise( p )); p = mtx*p*2.03;
        f += 0.1250*(-1.0+2.0*noise( p )); p = mtx*p*2.01;
        f += 0.0625*(-1.0+2.0*noise( p ));
        return f/0.9375;
    }

    float fbm6( vec2 p )
    {
        float f = 0.0;
        f += 0.500000*noise( p ); p = mtx*p*2.02;
        f += 0.250000*noise( p ); p = mtx*p*2.03;
        f += 0.125000*noise( p ); p = mtx*p*2.01;
        f += 0.062500*noise( p ); p = mtx*p*2.04;
        f += 0.031250*noise( p ); p = mtx*p*2.01;
        f += 0.015625*noise( p );
        return f/0.96875;
    }

    vec2 fbm4_2( vec2 p )
    {
        return vec2( fbm4(p+vec2(1.0)), fbm4(p+vec2(6.2)) );
    }

    vec2 fbm6_2( vec2 p )
    {
        return vec2( fbm6(p+vec2(9.2)), fbm6(p+vec2(5.7)) );
    }

    float func( vec2 q, out vec2 o, out vec2 n )
{
    q += 0.05*sin(vec2(0.11,0.13)*millis + length( q )*4.0);
    
    q *= 0.7 + 0.2*cos(0.05*millis);

    o = 0.5 + 0.5*fbm4_2( q );
    
    o += 0.02*sin(vec2(0.13,0.11)*millis*length( o ));

    n = fbm6_2( 4.0*o );

    vec2 p = q + 2.0*n + 1.0;

    float f = 0.5 + 0.5*fbm4( 2.0*p );

    f = mix( f, f*f*f*3.5, f*abs(n.x) );

    f *= 1.0-0.5*pow( 0.5+0.5*sin(8.0*p.x)*sin(8.0*p.y), 8.0 );

    return f;
}

float funcs( in vec2 q )
{
    vec2 t1, t2;
    return func(q,t1,t2);
}

void main() {
    vec2 q = (gl_FragCoord.xy-iResolution.xy)/iResolution.y;
    // float f = funcs( q );
    vec3 tot = vec3(0.0);
    if (length(q) > 2.5) {
      
    }
    else{
      for(int m = 0; m < 1; m++) {
          for(int ni = 0; ni < 1; ni++) {
              vec2 of = vec2(float(m), float(ni)) / float(1.0) - .5;
              vec2 q = (2.0 * (gl_FragCoord.xy + of) - iResolution.xy) / iResolution.y; // Interesting mechanic to play with distance here 

              vec2 o, n2;
              float f = func(q, o, n2);  // Ensure func is correctly defined and used

              // Base colors influenced by 'heat'
              vec3 coldColor = vec3(0.2, 0.1, 0.4); // Cooler color
              vec3 warmColor = vec3(0.9, 0.2, 0.1); // Warmer color
              vec3 baseColor = mix(coldColor, warmColor, heat);

              vec3 col = mix(baseColor, vec3(0.3, 0.05, 0.05), f);
              col = mix(col, vec3(0.9, 0.9, 0.9), dot(n2, n2));
              col = mix(col, vec3(0.5, 0.2, 0.2), 0.5 * o.y * o.y);
              col = mix(col, vec3(0.0, 0.2, 0.4), 0.5 * smoothstep(1.2, 1.3, abs(n2.y) + abs(n2.x)));
              col *= f * 1.5;

              tot += col;
          }
      }
    }

    gl_FragColor = vec4(tot, 1.0);
    }


`;

    shaderTexture = p.createGraphics(window.innerWidth, window.innerHeight, p.WEBGL);
    theShader = new p5.Shader(p._renderer, vertShader, fragShader)
    p.font = p.loadFont("RobotoMono-Regular.ttf")
  };





  const numCircles = 100;
  let fractals = 0;
  let shaderBG = 0;
  let speedMulti = 0;
  let textOverlay;
  let shaderTexture;
  let theShader;

  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    p.pixelDensity(2)
    p.noStroke();
    // p.shader(theShader);

    textOverlay = p.createGraphics(p.width, p.height);
  }


  let tempMapped = 3.0;
  let lightVal = 100;
  
  p.draw = () => {
    let bottomBannerHeight = p.height/20;
    let textBuffer = bottomBannerHeight/4;
    p.clear();
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {

      // p.blendMode(p.LIGHTEST);

      let light = Number(magic.modules.light.raw.brightness); // Range is 0-4095
      let humidity = Number(magic.modules.environment.raw.humidity); // Range is 0-90
      let pressure = Number(magic.modules.environment.raw.pressure) / 100; // Range is 300 hPa to 1100 hPa
      let aqi = Number(magic.modules.environment.raw.iaq); // Range is 0-500
      let temperature = Number(magic.modules.environment.raw.temperature); // Range is -40 to 85 degrees C
      let co2 = Number(magic.modules.environment.raw.co2); // Ask Lance 
      // console.log(light, humidity, pressure, aqi, temperature, co2)

      tempMapped = tempMapped * 0.995 + p.map(light, 0, 4095, 0.3, 10, true) * 0.005;
      lightVal = lightVal * 0.995 + light * 0.005
      console.log(lightVal, light);
    }


    else if (isMagic) {
      // p.text("No device found, please connect a device to proceed", p.width / 2, p.height / 2);
    }

    // Current file
    else {
      p.noLoop();

    }
    p.push();
    p.translate(-p.width / 2, -p.height / 2);
    
    shaderTexture.shader(theShader);
    theShader.setUniform("millis", p.millis() / (1000 / tempMapped));
    theShader.setUniform("iResolution", [p.width, p.height]);
    theShader.setUniform("heat", tempMapped - 2.0);
    shaderTexture.rect(0, 0, p.width, p.height);
    p.texture(shaderTexture)

    p.rect(0, 0, p.width, p.height);

    
    textOverlay.clear();
    // textOverlay.background(0, 0, 0, 0);
    textOverlay.textAlign(p.LEFT, p.CENTER);
    textOverlay.textFont(p.font);
    textOverlay.fill(0);
    textOverlay.textSize(20);
    
    textOverlay.rect(0, p.height - bottomBannerHeight, p.width, bottomBannerHeight);
    textOverlay.fill(255);
    textOverlay.text("Light:", textBuffer, p.height - bottomBannerHeight/2);
    let rectLength = p.map(lightVal, 0, 4095, 1, 200);
    textOverlay.rect(100, p.height - bottomBannerHeight/2 - 5, rectLength, 20);
    textOverlay.text(lightVal.toFixed(0), 300 + textBuffer, p.height - bottomBannerHeight/2);

    if(!isMagic) {
      textOverlay.textFont(p.font);
      textOverlay.textSize(20);
      textOverlay.fill(255);
      textOverlay.textAlign(p.RIGHT, p.CENTER);
      textOverlay.text("Click to initialize", p.width - textBuffer, p.height - bottomBannerHeight/2);
    }

    // textOverlay.rect(0, 0, textOverlay.width, textOverlay.height);
    p.image(textOverlay, 0, 0, p.width, p.height);
    p.pop();
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
    p.loop();
  }

};

p.windowResized = () => {
  p.resizeCanvas(window.innerWidth, window.innerHeight);
};



};

export default myP5Sketch;

