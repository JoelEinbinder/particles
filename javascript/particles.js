const canvas = document.createElement('canvas');
const size = 400;
canvas.width = canvas.height = size * window.devicePixelRatio;
canvas.style.width = canvas.style.height = size + 'px'
canvas.style.border = '1px solid black';
document.body.append(canvas);
const ctx = canvas.getContext('2d');
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

ctx.font = '40px system-ui';
ctx.fillStyle = '#aaa';
ctx.fillRect(0, 0, size, size);
ctx.fillStyle = 'blue';
ctx.fillText('Click to start', (size - ctx.measureText('Click to start').width) / 2, (size + 40) / 2);

const particles = [];
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

function step() {
  for (const particle of particles) {
    particle.x += particle.xspeed;
    particle.y += particle.yspeed;
    for (const other of particles) {
      const a = other.y - particle.y;
      const b = other.x - particle.x;
      const c2 = (a ** 2 + b ** 2) + (other.size + particle.size) ** 2;
      if (c2 === 0)
        continue;
      let g = 0.001 * other.size;
      particle.xspeed += g * b / c2;
      particle.yspeed += g * a / c2;
    }
  }
}
let adding = true;
function redraw() {
  step();
  draw();
  requestAnimationFrame(redraw);
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
  for (let i = 0; i < 1000; i++) {
    step();
  }
  const end = performance.now();
  const timePerStep = (end - start) / 1000;
  iterationsPerSecond = 1000 / timePerStep;
}
canvas.addEventListener('click', () => {
  benchmark();
  redraw();
}, {once: true});

