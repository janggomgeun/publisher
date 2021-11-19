"use strict";

import { EpubAdapter } from "./adapters/epub/v3/epub-adapter";
import { Publication } from "./publication";

export class Publisher {
  constructor() {
    this.publishable = new EpubAdapter();
    this.draft = new Publication();
  }

  addCover(title, image) {
    this.draft.cover.title = title;
    this.draft.cover.image = image;
  }

  addAuthor(author) {
    this.draft.author.name = author;
  }

  addPublisher(publisher) {
    this.draft.publisher.name = publisher;
  }

  addChapter(chapter) {
    this.draft.chapters.push(chapter);
  }

  async publish() {
    return this.publishable.publish(this.draft);
  }

  async throwDraftOut() {
    this.draft = new Publication();
  }
}
