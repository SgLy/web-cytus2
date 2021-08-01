const NOTE_TYPE = [
  'click', 'hold', 'long_hold',
  'drag_head', 'drag_body', 'flick',
  'click_drag_head', 'click_drag_body',
];

module.exports = {
  createPattern(pattern) {
    const JUDGE_DELAY = 0;
    const formatVersion = pattern.format_version;
    const timeBase = pattern.time_base;
    const startOffsetTime = pattern.start_offset_time;
    const pageList = pattern.page_list;
    const tempoList = pattern.tempo_list;
    const eventOrderList = pattern.event_order_list;
    const noteList = pattern.note_list;
    let currentPageIndex, currentTick, finished, currentPage, nextPage, head, removeHead, tail, currentTempoIndex, currentTime, noteCount, removedCount;
    return {
      init() {
        currentPageIndex = 0;
        currentTempoIndex = 0;
        currentTime = 0;
        currentTick = 0;
        passedTicks = 0;
        head = 0;
        removeHead = 0;
        tail = 0;
        finished = false;
        currentPage = pageList[0];
        nextPage = pageList[1];
        noteCount = noteList.length;
        removedCount = 0;
        noteList.forEach((note, i) => {
          if (!NOTE_TYPE[note.type]) console.log('unknown type ', note.type);
          note.type = NOTE_TYPE[note.type] || 'click';
          note.index = i;
          note.y = this.position(note.tick, pageList[note.page_index]);
          note.direction = pageList[note.page_index].scan_line_direction;
          if (note.hold_tick > 0) note.hold_y = this.position(
            note.tick + note.hold_tick, pageList[note.page_index]);
          delete note.shape;
        });
        this.updateTime(0);
      },
      timePerTick() {
        // 150 bpm = 400000 tempo
        // 195 bpm = 307692(.3077) tempo
        // at 400000 tempo, 1920 tick === 800ms
        return this.currentTempo() / 480000;
      },
      currentTick() {
        return currentTick;
      },
      currentTempo() {
        return tempoList[currentTempoIndex].value;
      },
      currentPageIndex() {
        return currentPageIndex;
      },
      isHolding(note) {
        return note.hold_tick > 0 && note.tick <= currentTick && currentTick < note.tick + note.hold_tick;
      },
      passed(note) {
        return currentTick > note.tick + note.hold_tick + JUDGE_DELAY;
      },
      nextTick() {
        currentTick++;
        currentTime += this.timePerTick();
        while (currentPageIndex < pageList.length && currentTick > pageList[currentPageIndex].end_tick) currentPageIndex++;
        if (currentPageIndex === pageList.length) finished = true;
        currentPage = pageList[currentPageIndex];
        nextPage = pageList[currentPageIndex + 1];

        while (currentTempoIndex + 1 < tempoList.length && currentTick >= tempoList[currentTempoIndex + 1].tick) currentTempoIndex++;

        while (tail < noteList.length && nextPage !== undefined && noteList[tail].tick < nextPage.end_tick) tail++;
        while (head < tail && this.passed(noteList[head])) head++;
      },
      updateTime(time) {
        removeHead = head;
        while (currentTime < time) this.nextTick();
      },
      isFinished() {
        return finished;
      },
      position(tick, page) {
        const offset = (tick - page.start_tick) / (page.end_tick - page.start_tick);
        let position = page.scan_line_direction === 1 ? 1 - offset : offset
        if (page.PositionFunction !== undefined) {
          const fn = page.PositionFunction
          if (fn.Type === 0) {
            let pageStart = (1 - fn.Arguments[0] - fn.Arguments[1]) / 2
            position = position * fn.Arguments[0] + pageStart
          } else {
            console.warn('Unknown PositionFunction Type: ' + fn.Type)
          }
        }
        return position;
      },
      linePosition() {
        return this.position(currentTick, currentPage);
      },
      allNotes() {
        return noteList;
      },
      currentNotes() {
        return noteList.slice(head, tail);
      },
      notesToRemove() {
        return noteList.slice(removeHead, tail).filter(note => this.passed(note) && !note.removed);
      },
      getNote(index) {
        return noteList[index];
      },
      removeNote(index) {
        if (!noteList[index].removed) {
          noteList[index].removed = true;
          removedCount++;
        }
      },
      isRemoved(index) {
        return noteList[index].removed;
      },
      score() {
        const base = 900000 / noteCount * removedCount;
        const combo = 100000 / ((noteCount - 1) * noteCount) * (removedCount * (removedCount - 1));
        return base + combo;
      },
      tp() {
        return 100 * removedCount / noteCount;
      },
      combo() {
        return removedCount;
      },
    }
  }
}