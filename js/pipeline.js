'use strict';

const pipeCount = 30;
const pipePropCount = 8;
const pipePropsLength = pipeCount * pipePropCount;
const turnCount = 8;
const turnAmount = (360 / turnCount) * TO_RAD;
const turnChanceRange = 58;
const baseSpeed = 0.5;
const rangeSpeed = 1;
const baseTTL = 100;
const rangeTTL = 300;
const baseWidth = 2;
const rangeWidth = 4;
const baseHue = 180;
const rangeHue = 60;
const backgroundColor = 'hsla(150,80%,1%,1)';

let container;
let canvas;
let ctx;
let center;
let tick;
let pipeProps;

function setup() {
	createCanvas();
  resize();
  initPipes();
	draw();
}

function initPipes() {
  pipeProps = new Float32Array(pipePropsLength);

  let i;

  for (i = 0; i < pipePropsLength; i += pipePropCount) {
    initPipe(i);
  }
}

function initPipe(i) {
  let x, y, direction, speed, life, ttl, width, hue;

  x = rand(canvas.a.width);
  y = center[1];
  direction = (round(rand(1)) ? HALF_PI : TAU - HALF_PI);
  speed = baseSpeed + rand(rangeSpeed);
  life = 0;
  ttl = baseTTL + rand(rangeTTL);
  width = baseWidth + rand(rangeWidth);
  hue = baseHue + rand(rangeHue);

  pipeProps.set([x, y, direction, speed, life, ttl, width, hue], i);
}

function updatePipes() {
  tick++;

  let i;

  for (i = 0; i < pipePropsLength; i += pipePropCount) {
    updatePipe(i);
  }
}

function updatePipe(i) {
  let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;
  let x, y, direction, speed, life, ttl, width, hue, turnChance, turnBias;

  x = pipeProps[i];
  y = pipeProps[i2];
  direction = pipeProps[i3];
  speed = pipeProps[i4];
  life = pipeProps[i5];
  ttl = pipeProps[i6]
  width = pipeProps[i7];
  hue = pipeProps[i8];

  drawPipe(x, y, life, ttl, width, hue);

  life++;
  x += cos(direction) * speed;
  y += sin(direction) * speed;
  turnChance = !(tick % round(rand(turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
  turnBias = round(rand(1)) ? -1 : 1;
  direction += turnChance ? turnAmount * turnBias : 0;

  pipeProps[i] = x;
  pipeProps[i2] = y;
  pipeProps[i3] = direction;
  pipeProps[i5] = life;

  checkBounds(x, y);
  life > ttl && initPipe(i);
}

function drawPipe(x, y, life, ttl, width, hue) {
  ctx.a.save();
  ctx.a.strokeStyle = `hsla(${hue},75%,50%,${fadeInOut(life, ttl) * 0.125})`;
  ctx.a.beginPath();
  ctx.a.arc(x, y, width, 0, TAU);
  ctx.a.stroke();
  ctx.a.closePath();
  ctx.a.restore();
}

function checkBounds(x, y) {
  if (x > canvas.a.width) x = 0;
  if (x < 0) x = canvas.a.width;
  if (y > canvas.a.height) y = 0;
  if (y < 0) y = canvas.a.height;
}

function createCanvas() {
  container = document.querySelector('.content--canvas');
	canvas = {
		a: document.createElement('canvas'),
		b: document.createElement('canvas')
	};
	canvas.b.style = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`;
	container.appendChild(canvas.b);
	ctx = {
		a: canvas.a.getContext('2d'),
		b: canvas.b.getContext('2d')
  };
  center = [];
  tick = 0;
}

function resize() {
	const { innerWidth, innerHeight } = window;
	
	canvas.a.width = innerWidth;
  canvas.a.height = innerHeight;

  ctx.a.drawImage(canvas.b, 0, 0);

	canvas.b.width = innerWidth;
  canvas.b.height = innerHeight;
  
  ctx.b.drawImage(canvas.a, 0, 0);

  center[0] = 0.5 * canvas.a.width;
  center[1] = 0.5 * canvas.a.height;
}

function render() {
  ctx.b.save();
  ctx.b.fillStyle = backgroundColor;
  ctx.b.fillRect(0,0,canvas.b.width,canvas.b.height);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.filter = 'blur(12px)'
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function draw() {
  updatePipes();

  render();

	window.requestAnimationFrame(draw);
}

window.addEventListener('load', setup);
window.addEventListener('resize', resize);