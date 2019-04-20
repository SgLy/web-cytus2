'use strict';

require('./index.css');

const WebCytus2 = require('./lib');

const height = Math.min(1536, Math.floor(window.innerHeight * 0.8));
const width = height / 3 * 4;

// page setup
const root = document.createElement('div');
const body = document.getElementsByTagName('body')[0];
body.append(root);

const container = document.createElement('div');
container.id = 'container';
root.append(container);

const controller = document.createElement('div');
controller.id = 'controller';
controller.style = `width: ${width}px`;
root.append(controller);
controller.innerHTML = `
  <div class="prev"><</div>
  <div class="play">+</div>
  <div class="next">></div>
  <input type="range" id="seek" min="0" max="100" value="0" step="0.01">
  <input type="range" id="rate" min="-6" max="6" value="0" step="1">
`;

const status = document.createElement('pre');
status.id = 'status';
root.append(status);

const cy = new WebCytus2({
  height, width,
  container: 'container',
  statusContainer: 'status',
  audio: require('./resources/audio/ivy001_008.mp3'),
  pattern: require('./resources/patterns/ivy001_008_2.json'),
});

// cy.seekTo();
cy.play();