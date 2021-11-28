"use strict";

export class Chapter {
  constructor(no, title, contents) {
    this.id = `ch_${no}`;
    this.title = title;
    this.contents = contents;
  }
}
