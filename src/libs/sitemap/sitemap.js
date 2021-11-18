"use strict";

import { Path } from "./path";

export class Sitemap extends Path {
  constructor(fullUrl, protocol, host) {
    super(fullUrl);
    this.protocol = protocol;
    this.host = host;
    this.map = {};
  }

  addPath(fullUrl) {
    const name = "";
    const path = Path.fromFullUrl(fullUrl, name);
    this.map[path.name] = path;
  }

  static fromHostUrl(url) {}

  static fromJson(json) {
    return new Sitemap();
  }
}