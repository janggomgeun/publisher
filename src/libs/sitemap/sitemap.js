"use strict";

import { Path } from "./path";

export class Sitemap extends Path {
  constructor(urlAsString) {
    super(urlAsString);

    const url = new URL(urlAsString);
    this.protocol = url.protocol;
    this.host = url.host;
  }

  addPath(fullUrl) {
    console.log("addPath");
    console.log("fullUrl", fullUrl);

    const url = new URL(fullUrl);
    const fullPath = `${url.pathname}${url.search}`;
    console.log("fullPath", fullPath);

    const tempSplits = fullPath.split("/");
    const fullPathSplits = ["/"];
    tempSplits.forEach((split, index) => {
      console.log("split", split);
      console.log("index", index);

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
    console.log("fullPathSplits", fullPathSplits);

    let pathMap = this.map;
    fullPathSplits.forEach((split) => {
      if (!pathMap.has(split)) {
        const path = Path.fromFullUrl(fullUrl, split);
        path.select();
        console.log("split", split);
        pathMap.set(split, path);
      }
      pathMap = pathMap.get(split).map;
    });
  }

  static fromHostUrl(url) {
    console.log("fromHostUrl");
    console.log("url", url);

    return new Sitemap(url);
  }

  static fromJson(url, json) {
    return new Sitemap();
  }
}
