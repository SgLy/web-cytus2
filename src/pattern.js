const utils = require('./utils');

module.exports = {
  createPattern(pattern) {
    const JUDGE_DELAY = 0.05;
    const formatVersion = pattern.format_version;
    const timeBase = pattern.time_base;
    const startOffsetTime = pattern.start_offset_time;
    const pageList = pattern.page_list;
    const tempoList = pattern.tempo_list;
    const eventOrderList = pattern.event_order_list;
    const noteList = pattern.note_list;
    let currentPageIndex, currentTick, finished, currentPage, nextPage, head, tail, lastHead, currentTempoIndex, currentTime;
    return {
      init() {
        currentPageIndex = 0;
        currentTempoIndex = 0;
        currentTime = 0;
        currentTick = 0;
        passedTicks = 0;
        head = 0;
        tail = 0;
        finished = false;
        currentPage = pageList[0];
        nextPage = pageList[1];
        noteList.forEach(note => {
          note.y = this.position(note.tick, pageList[note.page_index]);
          note.direction = pageList[note.page_index].scan_line_direction;
          delete note.circle;
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
      nextTick() {
        currentTick++;
        currentTime += this.timePerTick();
        while (currentPageIndex < pageList.length && currentTick > pageList[currentPageIndex].end_tick) currentPageIndex++;
        if (currentPageIndex === pageList.length) finished = true;
        currentPage = pageList[currentPageIndex];
        nextPage = pageList[currentPageIndex + 1];

        while (currentTempoIndex + 1 < tempoList.length && currentTick >= tempoList[currentTempoIndex + 1].tick) {
          currentTempoIndex++;
          console.log(this.currentTempo());
        }

        while (tail < noteList.length && nextPage !== undefined && noteList[tail].tick < nextPage.end_tick) tail++;
        while (head < tail && noteList[head].tick < currentTick + JUDGE_DELAY) head++;
      },
      updateTime(time) {
        lastHead = head;
        while (currentTime < time) this.nextTick();
      },
      isFinished() {
        return finished;
      },
      position(tick, page) {
        const offset = (tick - page.start_tick) / (page.end_tick - page.start_tick);
        return page.scan_line_direction === 1 ? 1 - offset : offset;
      },
      linePosition() {
        return this.position(currentTick, currentPage);
      },
      notes() {
        return noteList.slice(head, tail);
      },
      notesToRemove() {
        return noteList.slice(lastHead, head);
      },
    }
  }
}