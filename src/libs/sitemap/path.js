import { Contents } from "../contents/contents";

export class Path {
  constructor(fullUrl, name) {
    this.fullUrl = fullUrl;
    this.name = name;
    this.selected = false;
    this.map = {};
  }

  async loadRawHtmlFromFullUrl(fullUrl) {
    const response = await fetch(this.fullUrl, {
      method: "GET",
    });
    const html = await response.text();
    this.rawHtml = html;
  }

  async loadContents() {
    this.contents = Contents.fromHtml(this.rawHtml);
    return;
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
