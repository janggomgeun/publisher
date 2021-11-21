"use strict";

import { Path } from "./path";

export class Sitemap extends Path {
  constructor(fullUrl) {
    super(fullUrl);

    const url = new URL(fullUrl);
    this.protocol = url.protocol;
    this.host = url.host;
  }

  addPath(fullUrl) {
    const url = new URL(fullUrl);
    const name = "";
    const path = Path.fromFullUrl(fullUrl, name);

    this.map.set(path.name, path);
  }

  static fromHostUrl(host) {
    this.map.delete(host);
  }

  static fromJson(json) {
    return new Sitemap();
  }
}
