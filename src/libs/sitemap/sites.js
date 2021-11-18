"use strict";

import { ChromeStorage } from "../chrome-api";

const SITES_KEY = "sites";
export class Sites {
  constructor() {
    this.storage = new ChromeStorage();
    this.restore();
  }

  async save() {
    return this.storage.set(SITES_KEY, this.map);
  }

  async restore() {
    const sitesAsJsonString = await this.storage.get(SITES_KEY);
    const sitesAsJson = JSON.parse(sitesAsJsonString);
    if (sitesAsJson) {
      Object.entries(sitesAsJson).forEach(([host, sitemapJson]) => {
        this.map[host] = Sitemap.fromJson(sitemapJson);
      });
    } else {
      this.map = {};
    }
  }

  addSitemap(host) {}
  getSitemap(host) {}
  removeSitemap(host) {}
}

export class SitemapProxy {
  constructor(sitemap, storage) {
    this.sitemap = sitemap;
    this.storage = storage;
  }

  addPath(fullUrl) {
    this.sitemap.addPath(fullUrl);
  }
}
