"use strict";

import { Path } from "./path";

export class Sitemap extends Path {
  constructor(urlAsString) {
    const url = new URL(urlAsString);
    const protocol = url.protocol;
    const host = url.host;
    super(`${protocol}//${host}`);

    this.protocol = protocol;
    this.host = host;
  }

  addPath(fullUrl) {
    console.log("addPath");

    const url = new URL(fullUrl);
    const fullPath = `${url.pathname}${url.search}`;

    const tempSplits = fullPath.split("/");
    const fullPathSplits = ["/"];
    tempSplits.forEach((split, index) => {
      if (0 < index && index < tempSplits.length - 1) {
        fullPathSplits.push(split);
        fullPathSplits.push("/");
      }

      if (index === tempSplits.length - 1) {
        if (split === "") {
          fullPathSplits.push("/");
        } else {
          fullPathSplits.push(split);
        }
      }
      return;
    });

    let pathMap = this.map;
    let currentPath = `${this.protocol}//${this.host}`;

    fullPathSplits.forEach((split, index) => {
      currentPath += split;
      if (!pathMap.has(split)) {
        const path = Path.fromFullUrl(currentPath, split);
        pathMap.set(split, path);
        if (index === fullPathSplits.length - 1) {
          path.select();
        }
      } else {
        if (index === fullPathSplits.length - 1) {
          const path = pathMap.get(split);
          path.select();
        }
      }
      pathMap = pathMap.get(split).map;
    });
  }

  static fromHostUrl(url) {
    return new Sitemap(url);
  }

  static fromJson(url, json) {
    return new Sitemap();
  }
}
