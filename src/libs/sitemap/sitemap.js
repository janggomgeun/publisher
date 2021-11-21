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
    const fullPath = `${url.pathname}${url.search}`;
    const fullPathSplits = fullPath.split("/");

    let pathMap = this.map;
    fullPathSplits.forEach((split) => {
      if (!pathMap.has(split)) {
        const path = Path.fromFullUrl(fullUrl, split);
        path.select();
        pathMap.set(split, path);
      }
    });
  }

  static fromHostUrl(host) {
    this.map.delete(host);
  }

  static fromJson(json) {
    return new Sitemap();
  }
}
