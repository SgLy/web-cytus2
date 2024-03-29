'use strict';

require('./index.css');

const WebCytus2 = require('./lib');

const height = Math.min(1536, Math.floor(window.innerHeight * 0.8));
const width = (height / 3) * 4;

// page setup
const root = document.createElement('div');
const body = document.getElementsByTagName('body')[0];
body.append(root);

const controller = document.createElement('div');
controller.id = 'controller';
controller.style = `width: ${width}px`;
root.append(controller);
controller.innerHTML = `
  <div id="full">[]</div>
  <div id="prev"><</div>
  <div id="play">+</div>
  <div id="next">></div>
  <input type="range" id="seek" min="0" max="100" value="0" step="0.01">
  Rate: <input type="range" id="rate" min="-6" max="6" value="0" step="1">
  Volume: <input type="range" id="vol" min="0" max="1" value="1" step="0.01">
`;

const container = document.createElement('div');
container.id = 'container';
root.append(container);

document.getElementById('full').onclick = () => {
  const doc = window.document;
  const requestFullScreen =
    container.requestFullscreen ||
    container.mozRequestFullScreen ||
    container.webkitRequestFullScreen ||
    container.msRequestFullscreen;
  const cancelFullScreen =
    doc.exitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen;

  if (
    !doc.fullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.msFullscreenElement
  ) {
    requestFullScreen.call(container);
  } else {
    cancelFullScreen.call(doc);
  }
};

const status = document.createElement('pre');
status.id = 'status';
root.append(status);

const cy = new WebCytus2({
  height,
  width,
  container: 'container',
  statusContainer: 'status',
  audio: require('./resources/songdata_vos054_bossstage/songdata_vos054_bossstage.ogg'),
  pattern: require('./resources/songdata_vos054_bossstage/songdata_vos054_bossstage.json'),
  // audio: require('./resources/audio/ivy001_014.mp3'),
  // pattern: require('./resources/patterns/ivy001_014_2.json'),
  // audio: require('./resources/c1/audio/conflict.mp3'),
  // pattern: require('./resources/c1/patterns/conflict.hard.txt').default,
  showBorder: true,
  displayType: 'group',
  version: 2,
});

const progress = document.getElementById('seek');
let progressChanging = false;
cy.onTimeUpdate(time => {
  if (!progressChanging) progress.value = time / 1000;
});
progress.onmousedown = () => (progressChanging = true);
progress.onmouseup = () => (progressChanging = false);
progress.onchange = e => {
  cy.seekTo(e.target.value * 1000);
};

const play = document.getElementById('play');
play.onclick = e => {
  if (cy.playing()) {
    cy.pause();
    e.target.innerHTML = '=';
  } else {
    cy.resume();
    e.target.innerHTML = '||';
  }
};

document.getElementById('rate').onchange = e => {
  cy.rate(Math.pow(2, e.target.value / 6));
};

document.getElementById('vol').onchange = e => {
  cy.volume(e.target.value);
};

cy.ready(() => {
  progress.max = cy.duration();
  cy.play();
  play.innerHTML = '||';
});
