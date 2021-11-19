import { Contents } from "../contents/contents";

export class Page {
  constructor(fullUrl) {
    this.fullUrl = fullUrl;
    this.rawHtml = undefined;
    this.contents = undefined;
  }

  async loadRawHtmlFromFullUrl() {
    const response = await fetch(this.fullUrl, {
      method: "GET",
    });
    const html = await response.text();
    this.rawHtml = html;
  }

  async loadContents() {
    await this.loadRawHtmlFromFullUrl();
    this.contents = Contents.fromHtml(this.rawHtml);
    return;
  }
}
