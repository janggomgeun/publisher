import { Path } from "./path";

export class Sitemap extends Path {
  constructor(fullUrl, protocol, host) {
    super(fullUrl);
    this.protocol = protocol;
    this.host = host;
    this.map = {};
  }

  addPath(fullUrl) {
    const path = Path.fromFullUrl(fullUrl);
  }

  static fromHostUrl(url) {}

  static fromJson(json) {
    return new Sitemap();
  }
}
