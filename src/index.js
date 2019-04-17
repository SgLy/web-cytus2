'use strict';

const HEIGHT = 600;
const WIDTH = 800;

const Konva = require('konva');

const root = document.createElement('div');
const body = document.getElementsByTagName('body')[0];
body.append(root);

const container = document.createElement('div');
container.id = 'container';
root.append(container);

const fps = document.createElement('code');
fps.style = 'font-family: "Noto Mono"; font-size: 14px; line-height: 1.2';
root.append(fps);

const stage = new Konva.Stage({
  container: 'container',
  height: HEIGHT,
  width: WIDTH,
});

const layer = new Konva.Layer();

stage.add(layer);

let lastTime = 0;
function mainLoop(time) {
  layer.draw();
  if (time > 0) fps.innerHTML = (1000 / (time - lastTime)).toFixed(2) + ' FPS';
  lastTime = time;
  window.requestAnimationFrame(mainLoop);
}

window.requestAnimationFrame(mainLoop);
