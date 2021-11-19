"use strict";

export class Publisher {
  constructor(publishable) {
    this.publishable = publishable;
  }

  async publish() {
    return this.publishable.publish();
  }
}
