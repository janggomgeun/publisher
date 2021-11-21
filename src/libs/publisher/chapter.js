"use strict";

export class Chapter {
  constructor(no, title, contents) {
    this.id = `ch_${no}_${title.toLowerCase()}`;
    this.title = title;
    this.contents = contents;
  }
}
