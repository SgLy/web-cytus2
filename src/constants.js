const HEIGHT = Math.min(1536, Math.floor(window.innerHeight * 0.8));
const WIDTH = HEIGHT / 3 * 4;
const NOTE_SIZE = HEIGHT / 15;
const NOTE_TYPE = [
  'click', 'hold', 'long_hold',
  'drag_head', 'drag_body', 'flick',
  'click_drag_head', 'click_drag_body',
];
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
      INNER: '#782eff',
    }
  },
  drag_body: {
    [-1]: {
      RING: '#a72dd1',
      INNER: '#d929ff',
    },
    [1]: {
      RING: '#5e46ad',
      INNER: '#782eff',
    },
  },
  flick: {
    [1]: {
      RING: '#3fc5bc',
      INNER: '#6ef1e7',
    },
    [-1]: {
      RING: '#2b64b6',
      INNER: '#98f2ff',
    },
  },
  click_drag_head: {
    [1]: {
      RING: '#3fc5bc',
      INNER: '#6ef1e7',
    },
    [-1]: {
      RING: '#2b64b6',
      INNER: '#98f2ff',
    },
  },
  click_drag_body: {
    [1]: {
      RING: '#3fc5bc',
      INNER: '#6ef1e7',
    },
    [-1]: {
      RING: '#2b64b6',
      INNER: '#98f2ff',
    },
  },
};

const PATTERN = require('./resources/patterns/ivy001_005_2.json');
const AUDIO = require('./resources/audio/ivy001_005.mp3');
const HIT_SOUND = require('./resources/beat.wav');

module.exports = {
  HEIGHT, WIDTH, NOTE_SIZE, NOTE_TYPE, NOTE_COLOR,
  PATTERN, AUDIO, HIT_SOUND,
};
