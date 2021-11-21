"use strict";

export class Chapter {
  constructor(no, title, contents) {
    this.id = `ch_${no}_${title}`;
    this.title = title;
    this.contents = contents;
  }
}
