"use strict";

export class Publication {
  constructor() {
    this.cover = {
      title: undefined,
      image: undefined,
    };

    this.tableOfContents = {
      autoGeneration: undefined,
      data: undefined,
    };

    this.author = {
      name: undefined,
    };

    this.publisher = {
      name: undefined,
    };

    this.chapters = [];
  }
}
