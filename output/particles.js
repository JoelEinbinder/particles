const canvas = document.createElement('canvas');
const size = 400;
canvas.width = canvas.height = size * window.devicePixelRatio;
canvas.style.width = canvas.style.height = size + 'px'
canvas.style.border = '1px solid black';
document.body.append(canvas);

const dataURL = 'data:application/wasm;base64,AGFzbQEAAAABBQFgAX8AAwIBAAUGAQGAAoACBgcBfwBBgAgLBx0DBHN0ZXAAAAZtZW1vcnkCAAlwYXJ0aWNsZXMDAArjAQHgAQgBfwJ9AX8CfQF/An0CfwJ9IABBAEoEQANAIARBFGxBgAhqIgEgASoCCCIFIAEqAgCSIgg4AgAgASABKgIMIgYgASoCBJIiCTgCBCABIQogASELIAEqAhAhDEEAIQEDQCAGIAFBFGxBgAhqIgcqAgQgCZMiAiAHKgIQIgNDbxKDOpQiDZQgAyAMkiIDIAOUIAIgApQgByoCACAIkyICIAKUkpIiA5WSIQYgBSACIA2UIAOVkiEFIAFBAWoiASAARw0ACyALIAU4AgggCiAGOAIMIARBAWoiBCAARw0ACwsLAGgEbmFtZQEHAQAEc3RlcAI/AQAOAAJwMAECbDECAmwyAwJsMwQCbDQFAmw1BgJsNgcCbDcIAmw4CQJsOQoDbDEwCwNsMTEMA2wxMg0DbDEzBgkBAAZtZW1vcnkHDAEACXBhcnRpY2xlcw==';
const {instance: wasm} = await WebAssembly.instantiateStreaming(fetch(dataURL));
const ctx = canvas.getContext('2d');
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

ctx.font = '40px system-ui';
ctx.fillStyle = '#aaa';
ctx.fillRect(0, 0, size, size);
ctx.fillStyle = 'blue';
ctx.fillText('Click to start', (size - ctx.measureText('Click to start').width) / 2, (size + 40) / 2);


class Particle {
  constructor(dataView) {
    this.dataView = dataView;
  }
  static byteLength = 4 * 5;
  get x() {
    return this.dataView.getFloat32(0, true);
  }
  set x(value) {
    this.dataView.setFloat32(0, value, true);
  }
  get y() {
    return this.dataView.getFloat32(4, true);
  }
  set y(value) {
    this.dataView.setFloat32(4, value, true);
  }
  get xspeed() {
    return this.dataView.getFloat32(8, true);
  }
  set xspeed(value) {
    this.dataView.setFloat32(8, value, true);
  }
  get yspeed() {
    return this.dataView.getFloat32(12, true);
  }
  set yspeed(value) {
    this.dataView.setFloat32(12, value, true);
  }
  get size() {
    return this.dataView.getFloat32(16, true);
  }
  set size(value) {
    this.dataView.setFloat32(16, value, true);
  }
}

class Particles {
  static maxLength = 1024;
  constructor(data, offset) {
    this.data = data;
    this.offset = offset;
    this.length = 0;
  }
  push(descriptor) {
    if (this.length >= Particles.maxLength)
      return;
    const dataView = new DataView(this.data, this.offset + this.length * Particle.byteLength);
    const particle = new Particle(dataView);
    particle.x = descriptor.x;
    particle.y = descriptor.y;
    particle.xspeed = descriptor.xspeed;
    particle.yspeed = descriptor.yspeed;
    particle.size = descriptor.size;
    this.length++;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++)
      yield new Particle(new DataView(this.data, this.offset + i * Particle.byteLength));
  }
}
const particles = new Particles(wasm.exports.memory.buffer, wasm.exports.particles.value);

function draw() {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'black';
  // ctx.fillRect(0, 0, size, size);
  // ctx.globalAlpha = 0.3;
  // ctx.fillStyle = 'white';
  for (const particle of particles) {
    ctx.beginPath();
    // ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
    ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = 'blue';
  ctx.font = '20px monospace';
  ctx.fillText('Iterations per Second: ' + Math.round(iterationsPerSecond), 4, 20);
}

for (let i = 0; i < 500; i++) {
  particles.push({
    x: Math.random() * size,
    y: Math.random() * size,
    xspeed: 0,
    yspeed: 0,
    size: Math.random() * Math.random() *  Math.random() *  Math.random() * 20 + 2,
  });    
}
let iterationsPerSecond = 0;
function benchmark() {
  const start = performance.now();
  for (let i = 0; i < 1000; i++)
    wasm.exports.step(particles.length);
  const end = performance.now();
  const timePerStep = (end - start) / 1000;
  iterationsPerSecond = 1000 / timePerStep;
}


function redraw() {
  wasm.exports.step(particles.length);
  draw();
  requestAnimationFrame(redraw);
}
canvas.addEventListener('click', () => {
  benchmark();
  redraw();
}, {once: true});

