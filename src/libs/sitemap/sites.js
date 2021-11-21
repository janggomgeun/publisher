"use strict";

import { ChromeStorage } from "../chrome-api";
import { Sitemap } from "./sitemap";
import { Page } from "./page";

const HOST_SITE_MAP_KEY = "host_site_map";
const URL_PAGE_MAP_KEY = "url_page_map";

export class Sites {
  constructor() {
    this.storage = new ChromeStorage();
    this.hostSitemap = new Map();
    this.urlPageMap = new Map();
    this.restore();
  }

  async save() {
    await this.storage.set(HOST_SITE_MAP_KEY, this.hostSitemap);

    const tempUrlPageMap = {};
    Object.entries(this.urlPageMap).forEach(([url, page]) => {
      tempUrlPageMap[url] = {
        fullUrl: page.fullUrl,
      };
    });
    await this.storage.set(URL_PAGE_MAP_KEY, tempUrlPageMap);
  }

  async restore() {
    const hostSiteMap = await this.storage.get(HOST_SITE_MAP_KEY);
    console.log("hostSiteMap", hostSiteMap);

    if (hostSiteMap) {
      Object.entries(hostSiteMap).forEach(([host, hostSiteMapJson]) => {
        this.hostSitemap.set(host, Sitemap.fromJson(hostSiteMapJson));
      });
    }

    const urlPageMap = await this.storage.get(URL_PAGE_MAP_KEY);
    console.log("urlPageMap", urlPageMap);

    if (urlPageMap) {
      Object.entries(urlPageMap).forEach(([url, page]) => {
        this.urlPageMap.set(url, page);
      });
    }
  }

  async addPage(fullUrl) {
    console.log("addPage");
    console.log("fullUrl", fullUrl);

    const url = new URL(fullUrl);
    if (!this.hasSitemap(url.host)) {
      this.addSitemap(fullUrl);
    }

    const sitemap = this.hostSitemap.get(url.host);
    console.log("sitemap", sitemap);
    sitemap.addPath(fullUrl);

    const page = new Page(fullUrl);
    await page.loadContents();
    this.urlPageMap.set(fullUrl, page);

    console.log("urlPageMap", this.urlPageMap);
    console.log("hostSitemap", this.hostSitemap);
  }

  getSelectedPages() {
    const paths = [];
    const selectedPages = [];
    paths.forEach((path) => {
      if (!this.urlPageMap.has(path.fullUrl)) {
        return;
      }

      const selectedPage = this.urlPageMap.get(path.fullUrl);
      selectedPages.push(selectedPage);
    });
    return selectedPages;
  }

  hasSitemap(host) {
    return this.hostSitemap.has(host);
  }

  addSitemap(url) {
    const host = new URL(url).host;
    this.hostSitemap.set(host, Sitemap.fromHostUrl(url));
  }
}
