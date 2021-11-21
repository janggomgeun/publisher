"use strict";

export class Path {
  constructor(fullUrl, name) {
    this.fullUrl = fullUrl;
    this.name = name;
    this.selected = false;
    this.map = new Map();
  }

  selectPath() {
    if (this.selected) {
      console.warn("It is already selected");
    }
    this.selected = true;
  }

  unselectPath() {
    if (!this.selected) {
      console.warn("It is already unselected");
    }
    this.selected = false;
  }

  static fromFullUrl(fullUrl) {
    return new Path(fullUrl);
  }
}
