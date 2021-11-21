"use strict";

import { EpubAdapter } from "./adapters/epub/v3/epub-adapter";
import { Publication } from "./publication";

export class Publisher {
  constructor() {
    this.publishable = new EpubAdapter();
    this.draft = new Publication();
  }

  addCover(title, image) {
    console.log("addCover");
    this.draft.cover.title = title;
    this.draft.cover.image = image;
  }

  addAuthor(author) {
    console.log("addAuthor");
    this.draft.author.name = author;
  }

  addPublisher(publisher) {
    console.log("addPublisher");
    this.draft.publisher.name = publisher;
  }

  addChapter(chapter) {
    console.log("addChapter");
    this.draft.chapters.push(chapter);
  }

  async publish() {
    console.log("publish");
    return this.publishable.publish(this.draft);
  }

  throwDraftOut() {
    console.log("throwDraftOut");
    this.draft = new Publication();
  }
}
