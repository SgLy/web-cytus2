'use strict';

const HEIGHT = Math.min(600, Math.floor(window.innerHeight * 0.9));
const WIDTH = HEIGHT / 3 * 4;
const NOTE_SIZE = HEIGHT / 20;

const Konva = require('konva');
const { Howl, Howler } = require('howler');
const utils = require('./utils');

// page setup

const root = document.createElement('div');
const body = document.getElementsByTagName('body')[0];
body.append(root);

const container = document.createElement('div');
container.id = 'container';
root.append(container);

const status = document.createElement('code');
status.style = 'font-family: "Noto Mono"; font-size: 14px; line-height: 1.2';
root.append(status);

const stage = new Konva.Stage({
  container: 'container',
  height: HEIGHT,
  width: WIDTH,
});

const layer = new Konva.Layer();

stage.add(layer);

// audio

root.click();
const audio = new Howl({
  src: [require('./resources/v/v.ogg')],
})

// core

const { createPattern } = require('./pattern');
const pattern = createPattern(require('./resources/v/v.json'));
pattern.init();

const scanningLine = new Konva.Line({
  points: [0, 0, WIDTH, 0],
  stroke: 'black',
  strokeWidth: HEIGHT / 200,
  shadowColor: 'black',
  shadowBlur: 5,
  shadowOffset: { x: 0, y: 0 },
  shadowOpacity: 0.5
});

layer.add(scanningLine);

// main loop

let lastTime = 0;
let totalCost = 0, totalFrame = 0;
let offset = 0;
function mainLoop(aniTime) {
  const time = audio.seek() * 1000;
  const startRender = Date.now();

  if (!Number.isNaN(time)) pattern.updateTime(time);
  if (!pattern.isFinished()) {
    // draw line
    scanningLine.offsetY(-pattern.linePosition() * HEIGHT);

    // draw notes
    pattern.notes().forEach(note => {
      if (!note.circle) {
        const color = note.direction === 1 ? '#3bd3be' : '#1e62ba';
        note.circle = new Konva.Circle({
          x: note.x * WIDTH,
          y: note.y * (HEIGHT - NOTE_SIZE * 2) + NOTE_SIZE,
          radius: NOTE_SIZE,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 4,
          shadowBlur: 5,
          shadowColor: color,
          shadowOffset: { x: 0, y: 0 },
          shadowOpacity: 0.5
        });
        layer.add(note.circle);
      }
    });
    // remove old notes
    pattern.notesToRemove().forEach(note => {
      if (note.circle) note.circle.remove();
    });

    layer.draw();
    window.requestAnimationFrame(mainLoop);
  }

  // status
  const message = [];
  message.push(time.toFixed(3) + ' ms');
  message.push(pattern.currentTick().toFixed(0) + ' tick');
  message.push(pattern.currentTempo() + ' tempo');

  const renderCost = Date.now() - startRender;
  totalFrame++;
  totalCost += renderCost;
  const avgCost = totalCost / totalFrame
  message.push(`${renderCost} / ${avgCost.toFixed(2)} ms`);
  if (aniTime > 0) {
    const fps = 1000 / (aniTime - lastTime);
    const totalFps = totalFrame / (aniTime / 1000);
    message.push(`${fps.toFixed(2)} / ${totalFps.toFixed(2)} FPS`);
  }
  lastTime = aniTime;

  if (pattern.isFinished()) message.push('Finished');

  status.innerHTML = message.join('; ');
}

window.onload = () => {
  audio.on('load', () => {
    audio.play();
    window.requestAnimationFrame(mainLoop);
  });
};

