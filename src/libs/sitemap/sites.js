"use strict";

import { ChromeStorage } from "../chrome-api";
import { Sitemap } from "./sitemap";
import { Page } from "./page";

const SITES_KEY = "sites";

export class Sites {
  constructor() {
    this.storage = new ChromeStorage();
    this.restore();
    this.urlPageMap = {};
  }

  async save() {
    return this.storage.set(SITES_KEY, JSON.parse(this.map));
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

  async addPage(fullUrl) {
    const url = new URL(fullUrl);
    if (!this.hasSitemap(url.host)) {
      this.addSitemap(url.host);
    }

    const sitemap = this.map[url.host];
    sitemap.addPath(url.pathname);

    const page = new Page(fullUrl);
    await page.loadContents();
    this.urlPageMap[fullUrl] = page;
  }

  getSelectedPages() {
    const paths = [];
    const selectedPages = [];
    paths.forEach((path) => {
      if (!(path.fullUrl in this.urlPageMap)) {
        return;
      }

      const selectedPage = this.urlPageMap[path.fullUrl];
      selectedPages.push(selectedPage);
    });
    return selectedPages;
  }

  hasSitemap(host) {
    return host in this.map;
  }

  addSitemap(host) {
    this.map[host] = Sitemap.fromHostUrl(host);
  }
}
