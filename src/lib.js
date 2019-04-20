'use strict';

const Konva = require('konva');
const { Howl } = require('howler');

const { NOTE_TYPE, NOTE_COLOR, HIT_SOUND } = require('./constants');
const { createPattern } = require('./pattern');

/**
 * @class WebCytus2
 * @classdesc Create a new WebCytus2 instance
 * 
 * @param {Object} config - configurations
 * @param {Number} config.height - height of canvas
 * @param {Number} config.width - width of canvas
 * @param {String} config.container - id of container element
 * @param {String=} config.statusContainer - id of status container element
 * @param {String=} config.audio - audio url
 * @param {String} config.pattern - pattern url
 */
const WebCytus2 = function (config) {
  const HEIGHT = config.height;
  const WIDTH = config.width;
  const NOTE_SIZE = HEIGHT / 15;

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
  backgroundLayer.add(border);
  backgroundLayer.add(new Konva.Rect({
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
    fill: '#777777',
    strokeWidth: 0,
  }));

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
  scanLineLayer.add(border);

  // all layers
  layers.forEach(layer => stage.add(layer));

  // audio
  const audio = AUDIO ? new Howl({ src: [AUDIO] }) : null;
  const click = new Howl({ src: [HIT_SOUND] });

  // core
  const pattern = createPattern(config.pattern);
  pattern.init();

  let rate = 1;
  const usingAudio = audio && rate <= 4 && rate >= 0.5;
  const offset = 0;
  // main loop
  let lastTime = 0;
  let totalCost = 0, maxCost = 0, totalFrame = 0;
  function mainLoop(aniTime) {
    let time;
    if (usingAudio) time = audio.seek() * 1000;
    else time = aniTime * rate + offset * 1000;
    const startRender = Date.now();

    if (!Number.isNaN(time)) pattern.updateTime(time);
    if (!pattern.isFinished()) {
      // draw line
      scanLine.offsetY(-Y(pattern.linePosition()));

      // draw notes
      const zIndexes = [];
      pattern.notes().forEach(note => {
        if (!NOTE_TYPE[note.type]) console.log('unknown type ', note.type);
        const type = NOTE_TYPE[note.type] || 'click';
        const color = NOTE_COLOR[type][note.direction];
        let size = NOTE_SIZE * (['drag_body', 'click_drag_body'].indexOf(type) !== -1 ? 0.5 : 1);
        if (type === 'flick') size /= 1.2;
        // const groupScaler = note.page_index !== pattern.currentPageIndex() ? 0.5 : 1;
        const centerColor = ['drag_body', 'drag_body', 'click_drag_body', 'long_hold'].indexOf(type) !== -1 ? color.INNER : 'white';
        if (!note.shape) {
          note.shape = [];
          // drag line
          if (note.next_id > 0) {
            const next = pattern.getNote(note.next_id);
            const dragLine = new Konva.Line({
              points: [ X(note.x), Y(note.y), X(next.x), Y(next.y) ],
              stroke: 'white',
              strokeWidth: NOTE_SIZE * 0.4,
              dash: [NOTE_SIZE * 0.1, NOTE_SIZE * 0.1],
            });
            zIndexes.push([next.index * 3, dragLine]);
            note.shape.push(dragLine);
          }
          // short hold body
          if (type === 'hold') {
            const holdBody = new Konva.Line({
              points: [ X(note.x), Y(note.y), X(note.x), Y(note.hold_y) ],
              stroke: 'white',
              strokeWidth: NOTE_SIZE,
              dash: [NOTE_SIZE * 0.15, NOTE_SIZE * 0.15],
            });
            zIndexes.push([note.index * 3, holdBody]);
            note.shape.push(holdBody);
          }
          // long hold body
          if (type === 'long_hold') {
            const holdBody = new Konva.Line({
              points: [
                X(note.x), 0,
                X(note.x), HEIGHT,
              ],
              stroke: color.INNER,
              strokeWidth: NOTE_SIZE,
              dash: [NOTE_SIZE * 0.15, NOTE_SIZE * 0.15],
            });
            zIndexes.push([note.index * 3, holdBody]);
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
            zIndexes.push([note.index * 3 - 1, outer]);
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
            zIndexes.push([note.index * 3 - 2, inner]);
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
              fillRadialGradientColorStops: [
                0, color.INNER,
                1, centerColor
              ],
              fillRadialGradientStartRadius: size,
              fillRadialGradientEndRadius: size / 4,
            });
            zIndexes.push([note.index * 3 - 1, outer]);
            zIndexes.push([note.index * 3 - 2, inner]);
            note.shape.push(inner, outer);
          }
          note.shape.forEach(shape => {
            shape.perfectDrawEnabled(false);
            shape.cache();
            shape.filters([Konva.Filters.Contrast]);
            shape.contrast(-50);
            noteLayer.add(shape);
          });
        } else if (note.page_index === pattern.currentPageIndex() && !note.flag) {
          note.flag = true;
          note.shape.forEach(shape => { shape.contrast(0); });
        }
      });
      // remove old notes
      pattern.notesToRemove().forEach(note => {
        if (note.shape) note.shape.forEach(shape => {
          shape.remove();
          shape.destroy();
        });
        if (!pattern.isRemoved(note.index)) {
          click.play();
          pattern.removeNote(note.index);
        }
      });
      zIndexes.sort((a, b) => b[0] - a[0]);
      zIndexes.forEach(([_, shape], z) => shape.zIndex(z));

      noteLayer.draw();
      scanLineLayer.draw();
      window.requestAnimationFrame(mainLoop);
    }

    if (!status) return;

    // status
    const message = [];
    message.push([
      `Time: ${time.toFixed(3)} ms`,
      `Tick: ${pattern.currentTick().toFixed(0)}`,
      `Tempo: ${pattern.currentTempo()}`,
      `Playback rate: ${rate.toFixed(2)}x`,
    ]);

    message.push([
      `Score: ${pattern.score().toFixed(0)}`,
      `TP: 100.00`,
    ]);

    const renderCost = Date.now() - startRender;
    totalFrame++;
    totalCost += renderCost;
    const avgCost = totalCost / totalFrame;
    maxCost = Math.max(maxCost, renderCost);
    message.push([
      `Frame render time: ${renderCost} ms`,
      `Max: ${maxCost} ms`,
      `Avg: ${avgCost.toFixed(2)} ms`,
    ]);
    if (aniTime > 0) {
      const fps = 1000 / (aniTime - lastTime);
      const totalFps = totalFrame / (aniTime / 1000);
      message.push([
        `Frame per second: ${fps.toFixed(1)}`,
        `Avg: ${totalFps.toFixed(2)}`
      ]);
    }
    lastTime = aniTime;

    if (pattern.isFinished()) message.push(['Finished']);

    status.innerHTML = message.map(m => m.join('; ')).join('\n');
  }

  this.play = () => {
    if (usingAudio) {
      audio.on('load', () => {
        audio.seek(offset);
        audio.rate(rate);
        audio.play();
        window.requestAnimationFrame(mainLoop);
      });
    } else {
      window.requestAnimationFrame(mainLoop);
    }
  }
}

module.exports = WebCytus2;
