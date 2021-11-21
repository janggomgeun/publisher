"use strict";

import { ChromeStorage } from "../chrome-api";
import { Sitemap } from "./sitemap";
import { Page } from "./page";

const HOST_SITE_MAP_KEY = "host_site_map";
const URL_PAGE_MAP_KEY = "url_page_map";

export class Sites {
  constructor() {
    this.storage = new ChromeStorage();
    this.hostSitemap = {};
    this.urlPageMap = {};
    this.restore();
  }

  async save() {
    await this.storage.set(HOST_SITE_MAP_KEY, JSON.parse(this.hostSitemap));

    const tempUrlPageMap = {};
    Object.entries(this.urlPageMap).forEach(([url, page]) => {
      tempUrlPageMap[url] = {
        fullUrl: page.fullUrl,
      };
    });
    await this.storage.set(URL_PAGE_MAP_KEY, JSON.parse(tempUrlPageMap));
  }

  async restore() {
    const hostSiteMapAsJsonString = await this.storage.get(HOST_SITE_MAP_KEY);
    if (hostSiteMapAsJsonString) {
      const hostSiteMap = JSON.parse(hostSiteMapAsJsonString);
      if (hostSiteMap) {
        Object.entries(hostSiteMap).forEach(([host, hostSiteMapJson]) => {
          this.hostSitemap[host] = Sitemap.fromJson(hostSiteMapJson);
        });
      }
    }

    const urlPageMapAsJsonString = await this.storage.get(URL_PAGE_MAP_KEY);
    if (urlPageMapAsJsonString) {
      const urlPageMap = JSON.parse(urlPageMapAsJsonString);
      if (urlPageMap) {
        Object.entries(urlPageMap).forEach(([url, page]) => {
          this.urlPageMap[url] = page;
        });
      }
    }
  }

  async addPage(fullUrl) {
    const url = new URL(fullUrl);
    if (!this.hasSitemap(url.host)) {
      this.addSitemap(url.host);
    }

    const sitemap = this.hostSitemap[url.host];
    sitemap.addPath(fullUrl);

    const page = new Page(fullUrl);
    await page.loadContents();
    this.urlPageMap[fullUrl] = page;

    console.log("urlPageMap", this.urlPageMap);
    console.log("hostSitemap", this.hostSitemap);
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
    return host in this.hostSitemap;
  }

  addSitemap(host) {
    this.hostSitemap[host] = Sitemap.fromHostUrl(host);
  }
}
