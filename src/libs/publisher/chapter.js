"use strict";

export class Chapter {
  constructor(no, title, contents) {
    const trimmedTitle = title.replace(/^\s+|\s+$/g, "");
    this.id = `ch_${no}_${trimmedTitle}`;
    this.title = title;
    this.contents = contents;
  }
}
