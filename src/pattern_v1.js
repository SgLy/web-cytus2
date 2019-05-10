const utils = require('./utils');

module.exports = {
  createPattern(pattern) {
    let noteList, bpm, pageShift, pageSize;
    let currentTime, head, tail, removeHead, removedCount, noteCount;
    const JUDGE_DELAY = 0;
    return {
      init() {
        noteList = pattern.match(/NOTE.+/g).map(s => s.split(/[ \t]/))
          .map(([_, i, time, position, length]) => ({
            id: parseInt(i, 10),
            time: parseFloat(time) * 1000,
            x: parseFloat(position),
            length: parseFloat(length) * 1000,
            index: parseInt(i, 10),
            removed: false,
          }));
        noteCount = noteList.length;
        removedCount = 0;
        pattern.match(/LINK.+/g).map(s => {
          const link = s.split(/[ \t]/).map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n));
          for (let i = 0; i < link.length - 1; ++i)
            noteList[link[i]].next_id = link[i + 1];
        });
        bpm = parseFloat(pattern.match(/BPM[ \t]([\d\.]+)/)[1]);
        pageShift = parseFloat(pattern.match(/PAGE_SHIFT[ \t]([\d\.]+)/)[1]) * 1000;
        pageSize = parseFloat(pattern.match(/PAGE_SIZE[ \t]([\d\.]+)/)[1]) * 1000;
        noteList.forEach(note => {
          note.direction = this.direction(note.time);
          note.y = this.position(note.time);
          if (note.length > 0) note.hold_y = this.position(note.time + note.length);
          note.page_index = this.pageIndex(note.time);
          if (note.next_id) {
            noteList[note.next_id].type = 'drag_body';
            if (note.type !== 'drag_body') note.type = 'drag_head';
            return;
          }
          if (note.type === 'drag_body') return;
          if (note.length > 0) note.type = 'hold';
          else note.type = 'click';
        });
        removeHead = 0;
        head = 0;
        tail = 0;
      },
      allNotes() {
        return noteList;
      },
      getNote(index) {
        return noteList[index];
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
      updateTime(time) {
        removeHead = head;
        currentTime = time + pageShift;
        while (tail < noteCount && noteList[tail].time < this.nextPageEnd()) tail++;
        while (head < tail && this.passed(noteList[head])) head++;
      },
      isFinished() {
        const lastNote = noteList[noteList.length - 1];
        return currentTime > lastNote.time + lastNote.length + 1000;
      },
      linePosition() {
        return this.position(currentTime - pageShift);
      },
      currentNotes() {
        return noteList.slice(head, tail);
      },
      isRemoved(index) {
        return noteList[index].removed;
      },
      isHolding(note) {
        return note.length > 0 && note.time <= currentTime && currentTime < note.time + note.length;
      },
      passed(note) {
        return currentTime > note.time + note.length + pageShift + JUDGE_DELAY;
      },
      notesToRemove() {
        return noteList.slice(removeHead, tail).filter(note => this.passed(note) && !note.removed);
      },
      removeNote(index) {
        if (!noteList[index].removed) {
          noteList[index].removed = true;
          removedCount++;
        }
      },
      pageIndex(time) {
        return utils.floatDiv(time, pageSize);
      },
      direction(time) {
        return this.pageIndex(time) % 2 === 0 ? 1 : -1;
      },
      currentPageIndex() {
        return this.pageIndex(currentTime);
      },
      nextPageEnd() {
        return (this.currentPageIndex() + 2) * pageSize;
      },
      position(time) {
        const direction = this.direction(time);
        const pageStart = this.pageIndex(time) * pageSize;
        const offset = (time - pageStart) / pageSize;
        return direction === 1 ? 1 - offset : offset;
      },
    }
  }
}