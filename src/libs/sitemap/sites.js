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

    if (hostSiteMap) {
      Object.entries(hostSiteMap).forEach(([host, hostSiteMapJson]) => {
        this.hostSitemap.set(host, Sitemap.fromJson(hostSiteMapJson));
      });
    }

    const urlPageMap = await this.storage.get(URL_PAGE_MAP_KEY);

    if (urlPageMap) {
      Object.entries(urlPageMap).forEach(([url, page]) => {
        this.urlPageMap.set(url, page);
      });
    }
  }

  async addPage(fullUrl) {
    console.log("addPage");

    const url = new URL(fullUrl);
    if (!this.hasSitemap(url.host)) {
      this.addSitemap(fullUrl);
    }

    const sitemap = this.hostSitemap.get(url.host);
    sitemap.addPath(fullUrl);

    const page = new Page(fullUrl);
    await page.loadContents();
    this.urlPageMap.set(fullUrl, page);
  }

  getSelectedPages() {
    const allPaths = [];
    const extractChildPathFullUrls = (path) => {
      const paths = [{ fullUrl: path.fullUrl, selected: path.selected }];
      for (const childPath of path.map.values()) {
        const extracted = extractChildPathFullUrls(childPath);
        if (extracted.length) {
          paths.push(...extractChildPathFullUrls(childPath));
        }
      }
      return paths;
    };

    for (const path of this.hostSitemap.values()) {
      const extractedSitemapPaths = extractChildPathFullUrls(path);
      if (extractedSitemapPaths.length) {
        allPaths.push(...extractedSitemapPaths);
      }
    }

    const selectedPathFullUrls = allPaths
      .filter((path) => path.selected)
      .map((path) => path.fullUrl);

    const selectedPages = [];
    selectedPathFullUrls.forEach((fullUrl) => {
      if (!this.urlPageMap.has(fullUrl)) {
        return;
      }

      const selectedPage = this.urlPageMap.get(fullUrl);
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
