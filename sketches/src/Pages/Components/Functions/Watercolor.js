import p5 from 'p5';
export class Poly {
  constructor(vertices, modifiers, p) {
    this.vertices = vertices;
    if (!modifiers) {
      modifiers = [];
      for (let i = 0; i < vertices.length; i++) {
        modifiers.push(p.random(0.8, 2.2));
      }
    }
    this.modifiers = modifiers;
  }

  grow(p) {
    p.angleMode(p.RADIANS)
    const grownVerts = [];
    const grownMods = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const j = (i + 1) % this.vertices.length;
      const v1 = this.vertices[i];
      const v2 = this.vertices[j];
      const mod = this.modifiers[i];

      const chmod = m => {
        return m + (this.rand(p) - 0.5) * 0.1;
      }

      grownVerts.push(v1);
      grownMods.push(chmod(mod));

      const segment = p5.Vector.sub(v2, v1);
      const len = segment.mag();
      segment.mult(this.rand(p));

      const v = p5.Vector.add(segment, v1);

      segment.rotate(-p.PI / 2 + (this.rand(p) - 0.5) * p.PI / 4);
      segment.setMag(this.rand(p) * len / 2 * mod);
      v.add(segment);
      grownVerts.push(v);
      grownMods.push(chmod(mod));
    }
    return new Poly(grownVerts, grownMods, p);
  }

  dup() {
    return new Poly(Array.from(this.vertices), Array.from(this.modifiers));
  }

  draw(p) {
    p.beginShape();
    for (let v of this.vertices) {
      p.vertex(v.x, v.y);
    }
    p.endShape(p.CLOSE);
  }

  colorIn(c1, c2, layer, p) {
    // need to think through how to animate this in piece parts
    const numLayers = 5;
  
    p.noStroke();
    c2 = p.color(c2);
    c2 = c2.levels;
    
    p.fill(c2[0], c2[1], c2[2], 100 / (2 * (layer + numLayers)));
  
    let poly = this.grow(p).grow(p);
  
    for (let i = 0; i < numLayers; i++) {
      if (i == Math.round((layer + numLayers) / 3) || i == Math.round(2 * (layer + numLayers) / 3)) {
        poly = poly.grow(p).grow(p);
  
      }
      poly.grow(p).draw(p);
    }
  }
  
  distribute(x, p) {
    return Math.pow((x - 0.5) * 1.58740105, 3) + 0.5;
  }

  rand(p) {
    return this.distribute(p.random(1));
  }
  
  
}

