import { Contents } from "../contents/contents";

export class Page {
  constructor(fullUrl) {
    this.fullUrl = fullUrl;
    this.rawHtml = undefined;
    this.contents = undefined;
  }

  async loadRawHtmlFromFullUrl() {
    console.log("loadRawHtmlFromFullUrl");
    const response = await fetch(this.fullUrl, {
      method: "GET",
    });
    const html = await response.text();
    this.rawHtml = html;
  }

  async loadContents() {
    console.log("loadContents");
    await this.loadRawHtmlFromFullUrl();
    this.contents = new Contents(this.rawHtml);
    return;
  }
}
