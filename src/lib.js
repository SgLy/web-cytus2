'use strict';

const Konva = require('konva').default;
// Konva.pixelRatio = 1;
const { Howl } = require('howler');

const { NOTE_COLOR, HIT_SOUND } = require('./constants');
const pattern_v2 = require('./pattern');
const pattern_v1 = require('./pattern_v1');

/**
 * @class WebCytus2
 * @classdesc Create a new WebCytus2 instance
 *
 * @param {Object} config - configurations
 * @param {Number} config.height - height of canvas
 * @param {Number} config.width - width of canvas
 * @param {String} config.container - id of container element
 * @param {String=} config.statusContainer - id of status container element
 * @param {Number} [config.version=2] - pattern version (cytus 1 or 2)
 * @param {Boolean} [config.fullscreen=false] - fullscreen
 * @param {String=} config.audio - audio url
 * @param {String} config.pattern - pattern url
 * @param {String} [config.displayType = 'group'] - display type, default or group
 * @param {Boolean} [config.showBorder = false] - show border
 */
const WebCytus2 = function (config) {
  let HEIGHT = config.height;
  let WIDTH = config.width;
  const container = document.getElementById(config.container);
  if (config.fullscreen === true) {
    HEIGHT = window.screen.height;
    WIDTH = window.screen.width;
  }
  const NOTE_SIZE = HEIGHT / 15;

  const display = config.displayType || 'group';

  const AUDIO = config.audio;

  const status = document.getElementById(config.statusContainer);

  const stage = new Konva.Stage({
    container: config.container,
    height: HEIGHT,
    width: WIDTH,
  });

  const layers = [];

  // background
  const backgroundLayer = new Konva.Layer();
  layers.push(backgroundLayer);
  const border = new Konva.Rect({
    x: NOTE_SIZE * 1.2,
    y: NOTE_SIZE * 1.2,
    height: HEIGHT - NOTE_SIZE * 2.4,
    width: WIDTH - NOTE_SIZE * 2.4,
    fill: 'transparent',
    stroke: '#666666',
    strokeWidth: 1,
  });
  if (config.showBorder) {
    backgroundLayer.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,
        fill: '#6f6f6f',
        strokeWidth: 0,
      }),
    );
    backgroundLayer.add(border);
  }

  // note layer
  const noteLayer = new Konva.Layer();
  layers.push(noteLayer);

  // functions to locate notes
  // affects border
  const X = x => x * (WIDTH - NOTE_SIZE * 2.4) + NOTE_SIZE * 1.2;
  const Y = y => y * (HEIGHT - NOTE_SIZE * 2.4) + NOTE_SIZE * 1.2;

  // scan line and border
  const scanLineLayer = new Konva.Layer();
  layers.push(scanLineLayer);
  const scanLine = new Konva.Line({
    points: [0, 0, WIDTH, 0],
    stroke: 'white',
    strokeWidth: HEIGHT / 200,
  });
  scanLineLayer.add(scanLine);

  // all layers
  layers.forEach(layer => stage.add(layer));

  // audio
  const audio = AUDIO ? new Howl({ src: [AUDIO] }) : null;
  const click = new Howl({ src: [HIT_SOUND] });

  // core
  const { createPattern } = config.version === 1 ? pattern_v1 : pattern_v2;
  const pattern = createPattern(config.pattern);
  pattern.init();

  // made note
  console.time('Create Konva shapes');
  pattern.allNotes().forEach(note => {
    const type = note.type;
    const color = NOTE_COLOR[type][note.direction];
    let size =
      NOTE_SIZE *
      (['drag_body', 'click_drag_body'].indexOf(type) !== -1 ? 0.5 : 1);
    if (type === 'flick') size /= 1.2;
    const centerColor =
      [
        'drag_head',
        'drag_body',
        'click_drag_head',
        'click_drag_body',
        'long_hold',
      ].indexOf(type) !== -1
        ? color.INNER
        : 'white';
    note.shape = [];
    // drag arrow
    if (type === 'drag_head' || type === 'click_drag_head') {
      const next = pattern.getNote(note.next_id);
      const srcX = X(note.x),
        srcY = Y(note.y);
      const destX = X(next.x),
        destY = Y(next.y);
      const offsetX = destX - srcX,
        offsetY = srcY - destY;
      const rad = Math.atan2(offsetY, offsetX);
      const ang = (-rad / Math.PI) * 180 + 90;
      const arrow = new Konva.Line({
        x: srcX,
        y: srcY,
        points: [
          0,
          0.1 * NOTE_SIZE,
          0.4 * NOTE_SIZE,
          0.3 * NOTE_SIZE,
          0,
          -0.4 * NOTE_SIZE,
          -0.4 * NOTE_SIZE,
          0.3 * NOTE_SIZE,
        ],
        fill: 'white',
        closed: true,
      });
      arrow.rotate(ang);
      arrow.zPosition = note.index * 4 - 3;
      note.shape.push(arrow);
    }
    // drag line
    if (note.next_id > 0) {
      const next = pattern.getNote(note.next_id);
      const dragLine = new Konva.Line({
        points: [X(note.x), Y(note.y), X(next.x), Y(next.y)],
        stroke: 'white',
        strokeWidth: NOTE_SIZE * 0.4,
        dash: [NOTE_SIZE * 0.1, NOTE_SIZE * 0.1],
      });
      dragLine.isLine = true;
      dragLine.zPosition = next.index * 4;
      note.shape.push(dragLine);
    }
    // short hold body
    if (type === 'hold') {
      const holdBody = new Konva.Line({
        points: [X(note.x), Y(note.y), X(note.x), Y(note.hold_y)],
        stroke: 'white',
        strokeWidth: NOTE_SIZE,
        dash: [NOTE_SIZE * 0.15, NOTE_SIZE * 0.15],
      });
      holdBody.isLine = true;
      holdBody.zPosition = note.index * 4;
      note.shape.push(holdBody);
    }
    // long hold body
    if (type === 'long_hold') {
      const holdBody = new Konva.Line({
        points: [X(note.x), 0, X(note.x), HEIGHT],
        stroke: color.INNER,
        strokeWidth: NOTE_SIZE,
        dash: [NOTE_SIZE * 0.15, NOTE_SIZE * 0.15],
      });
      holdBody.isLine = true;
      holdBody.zPosition = note.index * 4;
      note.shape.push(holdBody);
    }
    // flick
    if (type === 'flick') {
      // outer white ring
      const outer = new Konva.Rect({
        x: X(note.x),
        y: Y(note.y),
        width: size * 2,
        height: size * 2,
        fill: 'transparent',
        stroke: 'white',
        strokeWidth: size * 0.18,
        shadowBlur: 10,
        shadowColor: 'black',
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.8,
      });
      outer.offsetX(outer.width() / 2);
      outer.offsetY(outer.height() / 2);
      outer.rotate(45);
      outer.zPosition = note.index * 4 - 1;
      // inner color
      const inner = new Konva.Rect({
        x: X(note.x),
        y: Y(note.y),
        width: size * 0.82 * 2,
        height: size * 0.82 * 2,
        stroke: color.RING,
        strokeWidth: size * 0.18,
        fill: color.INNER,
      });
      inner.offsetX(inner.width() / 2);
      inner.offsetY(inner.height() / 2);
      inner.rotate(45);
      inner.zPosition = note.index * 4 - 2;
      note.shape.push(inner, outer);
    } else {
      // outer white ring
      const outer = new Konva.Circle({
        x: X(note.x),
        y: Y(note.y),
        radius: size,
        fill: 'transparent',
        stroke: 'white',
        strokeWidth: size * 0.15,
        shadowBlur: 10,
        shadowColor: 'black',
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.8,
      });
      // inner color
      const inner = new Konva.Circle({
        x: X(note.x),
        y: Y(note.y),
        radius: size * 0.85,
        stroke: color.RING,
        strokeWidth: size * 0.15,
        fillRadialGradientColorStops: [0, color.INNER, 1, centerColor],
        fillRadialGradientStartRadius: size,
        fillRadialGradientEndRadius: size / 4,
      });
      outer.zPosition = note.index * 4 - 1;
      inner.zPosition = note.index * 4 - 2;
      note.shape.push(inner, outer);
    }
    note.shape.forEach(shape => {
      shape.cache();
      if (display === 'group') {
        shape.filters([Konva.Filters.Contrast]);
        shape.contrast(-50);
        if (shape.isLine !== true) {
          shape.scaleX(0.8);
          shape.scaleY(0.8);
        }
      }
    });
  });
  console.timeEnd('Create Konva shapes');

  const timeUpdateListener = [];

  let rate = 1;
  const usingAudio = audio && rate <= 4 && rate >= 0.5;
  const offset = 0;
  // main loop
  let lastTime = 0,
    time = 0;
  let playingId;
  let totalCost = 0,
    maxCost = 0,
    totalFrame = 0;
  function mainLoop(aniTime) {
    if (usingAudio) time = audio.seek() * 1000;
    else time = aniTime * rate + offset * 1000;
    timeUpdateListener.forEach(f => f(time));
    const startRender = performance.now();

    if (!Number.isNaN(time)) pattern.updateTime(time);
    if (pattern.isFinished()) return;
    // draw line
    scanLine.offsetY(-Y(pattern.linePosition()));

    // draw notes
    const zIndexes = [];
    pattern.currentNotes().forEach(note => {
      if (pattern.isRemoved(note.index)) return;
      note.shape.forEach(shape => {
        if (shape.parent === null) noteLayer.add(shape);
        zIndexes.push([shape.zPosition, shape]);
      });
      if (
        note.page_index === pattern.currentPageIndex() &&
        !note.pageSwitched
      ) {
        // switch note from back page to front page
        note.pageSwitched = true;
        note.shape.forEach(shape => {
          const switchPageEffect = new Konva.Tween({
            node: shape,
            duration: 0.1,
            contrast: 0,
            scaleX: 1,
            scaleY: 1,
            easing: Konva.Easings.EaseIn,
          });
          switchPageEffect.play();
        });
      } else if (pattern.isHolding(note) && !note.hasHoldingEffect) {
        note.hasHoldingEffect = true;
        note.shape.forEach(shape => {
          if (shape.isLine === true) return;
          const holdingEffect = new Konva.Tween({
            node: shape,
            duration: 0.1,
            scaleX: 1.2,
            scaleY: 1.2,
            easing: Konva.Easings.EaseIn,
          });
          holdingEffect.play();
        });
      }
    });
    zIndexes.sort((a, b) => b[0] - a[0]);
    zIndexes.forEach(([, shape], z) => shape.zIndex(z));

    // remove old notes
    pattern.notesToRemove().forEach(note => {
      if (pattern.isRemoved(note.index)) return;
      if (note.shape) click.play();
      pattern.removeNote(note.index);
      if (note.shape) {
        note.shape.forEach(shape => {
          if (shape.isLine === true) {
            shape.remove();
            return;
          }
          const hitEffect = new Konva.Tween({
            node: shape,
            duration: 0.1,
            scaleX: 1.2,
            scaleY: 1.2,
            opacity: 0,
            easing: Konva.Easings.Linear,
            onFinish() {
              shape.remove();
            },
          });
          hitEffect.play();
        });
        delete note.shape;
      }
    });

    noteLayer.batchDraw();
    scanLineLayer.batchDraw();

    const renderCost = performance.now() - startRender;

    // status
    if (status) {
      setTimeout(() => {
        const message = [];
        message.push([
          `Time: ${time.toFixed(3)} ms`,
          `Playback rate: ${rate.toFixed(4)}x`,
        ]);
        if (config.version === 2) {
          message[message.length - 1].push(
            `Tick: ${pattern.currentTick().toFixed(0)}`,
            `Tempo: ${pattern.currentTempo()}`,
          );
        }

        message.push([
          `Combo: ${pattern.combo()}`,
          `Score: ${pattern.score().toFixed(0)}`,
          `TP: ${pattern.tp().toFixed(2)}`,
        ]);

        totalFrame++;
        totalCost += renderCost;
        const avgCost = totalCost / totalFrame;
        maxCost = Math.max(maxCost, renderCost);
        message.push([
          `Frame render time: ${renderCost.toFixed(4)} ms`,
          `Max: ${maxCost.toFixed(4)} ms`,
          `Avg: ${avgCost.toFixed(4)} ms`,
        ]);
        if (aniTime > 0) {
          const fps = 1000 / (aniTime - lastTime);
          const totalFps = totalFrame / (aniTime / 1000);
          message.push([
            `Frame per second: ${fps.toFixed(1)}`,
            `Avg: ${totalFps.toFixed(2)}`,
          ]);
        }
        lastTime = aniTime;

        if (pattern.isFinished()) message.push(['Finished']);

        status.innerHTML = message.map(m => m.join('; ')).join('\n');
      }, 0);
    }

    window.requestAnimationFrame(mainLoop);
  }

  const readyListener = [];
  this.ready = listener => {
    readyListener.push(listener);
  };

  this.duration = () => {
    return audio.duration();
  };

  this.onTimeUpdate = listener => {
    timeUpdateListener.push(listener);
  };

  this.rate = r => {
    rate = r;
    if (audio) audio.rate(r);
  };

  this.currentTime = () => time;

  this.seekTo = t => {
    if (t > time) {
      audio.seek(t / 1000);
    }
  };

  this.playing = () => {
    if (audio) return audio.playing();
  };

  this.pause = () => {
    if (audio) audio.pause();
  };

  this.resume = () => {
    if (audio) audio.play(playingId);
  };

  this.stop = () => {
    if (audio) audio.stop();
  };

  this.volume = v => {
    if (audio) audio.volume(v);
    click.volume(v);
  };

  this.play = () => {
    if (usingAudio) {
      audio.seek(offset);
      playingId = audio.play();
    }
    if (config.fullscreen === true) {
      const requestFullScreen =
        container.requestFullscreen ||
        container.mozRequestFullScreen ||
        container.webkitRequestFullScreen ||
        container.msRequestFullscreen;
      requestFullScreen.call(container);
    }
    window.requestAnimationFrame(mainLoop);
  };

  audio.on('load', () => {
    readyListener.forEach(f => f());
  });
};

module.exports = WebCytus2;
