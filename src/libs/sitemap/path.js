import { Contents } from "../contents/contents";

export class Path {
  constructor(fullUrl) {
    this.fullUrl = fullUrl;
    // this.contents = {
    //   document: undefined,
    //   resources: {
    //     images: [],
    //     audios: [],
    //     videos: [],
    //     svgs: [],
    //     canvas: [],
    //   },
    //   references: [],
    // };
    this.selected = false;
  }

  async loadRawHtmlFromFullUrl(fullUrl) {
    this.rawHtml = rawHtml;
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
