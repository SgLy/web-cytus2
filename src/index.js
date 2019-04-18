'use strict';

const HEIGHT = Math.min(600, Math.floor(window.innerHeight * 0.9));
const WIDTH = HEIGHT / 3 * 4;
const NOTE_SIZE = HEIGHT / 15;
const NOTE_TYPE = ['click', 'hold', 'long_hold', 'drag_head', 'drag_body'];
const NOTE_COLOR = {
  click: {
    [1]: {
      RING: '#3fc5bc',
      INNER: '#6ef1e7',
    },
    [-1]: {
      RING: '#2b64b6',
      INNER: '#98f2ff',
    },
  },
  hold: {
    [1]: {
      RING: '#ea5fc2',
      INNER: 'white',
    },
    [-1]: {
      RING: '#e5796c',
      INNER: 'white',
    },
  },
  long_hold: {
    [1]: {
      RING: '#fcdb5b',
      INNER: '#ffe8ac',
    },
    [-1]: {
      RING: '#fcdb5b',
      INNER: '#ffe8ac',
    },
  },
  drag_head: {
    [-1]: {
      RING: '#a72dd1',
      INNER: '#d929ff',
    },
    [1]: {
      RING: '#5e46ad',
      INNER: '#6125ff',
    }
  },
  drag_body: {
    [-1]: {
      INNER: '#d929ff',
    },
    [1]: {
      INNER: '#6125ff',
    },
  },
};

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

const layers = [];

// background
const backgroundLayer = new Konva.Layer();
layers.push(backgroundLayer);
backgroundLayer.add(new Konva.Rect({
  x: 0,
  y: 0,
  width: WIDTH,
  height: HEIGHT,
  fill: 'black',
  strokeWidth: 0,
  opacity: 0.5,
}));

// note layer
const noteLayer = new Konva.Layer();
layers.push(noteLayer);

// scanning line
const scanningLineLayer = new Konva.Layer();
layers.push(scanningLineLayer);
const scanningLine = new Konva.Line({
  points: [0, 0, WIDTH, 0],
  stroke: 'white',
  strokeWidth: HEIGHT / 200,
});
scanningLineLayer.add(scanningLine);

// all layers
layers.forEach(layer => stage.add(layer));

// audio
root.click();
const audio = new Howl({
  src: [require('./resources/v/v.ogg')],
})

// core
const { createPattern } = require('./pattern');
const pattern = createPattern(require('./resources/v/v.json'));
pattern.init();

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
      if (!note.shape) {
        const type = NOTE_TYPE[note.type] || 'click';
        const color = NOTE_COLOR[type][note.direction];
        const size = NOTE_SIZE * (type === 'drag_body' ? 0.5 : 1);
        const centerColor = type === 'drag_body' || type === 'drag_head' ? color.INNER : 'white';
        console.log(size);
        note.shape = [
          // outer white ring
          new Konva.Circle({
            x: note.x * WIDTH,
            y: note.y * (HEIGHT - NOTE_SIZE * 2) + NOTE_SIZE,
            radius: size,
            fill: 'transparent',
            stroke: 'white',
            strokeWidth: size * 0.15,
            shadowBlur: 10,
            shadowColor: 'black',
            shadowOffset: { x: 0, y: 0 },
            shadowOpacity: 0.8
          }),
          // inner color
          new Konva.Circle({
            x: note.x * WIDTH,
            y: note.y * (HEIGHT - NOTE_SIZE * 2) + NOTE_SIZE,
            radius: size * (0.85 + (type === 'drag_body' ? 0.075 : 0)),
            stroke: color.RING,
            strokeWidth: type === 'drag_body' ? 0 : size * 0.15,
            fillRadialGradientColorStops: [
              0, color.INNER,
              1, centerColor
            ],
            fillRadialGradientStartRadius: size,
            fillRadialGradientEndRadius: size / 4,
          }),
        ];
        note.shape.forEach(shape => noteLayer.add(shape));
      }
    });
    // remove old notes
    pattern.notesToRemove().forEach(note => {
      if (note.shape) note.shape.forEach(shape => shape.remove());
    });

    layers.forEach(layer => layer.draw());
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
    // audio.seek(7);
    window.requestAnimationFrame(mainLoop);
    setTimeout(() => {
      console.log(pattern.notes());
    }, 300);
  });
};

