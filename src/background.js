"use strict";

import { ChromeRuntime, ChromeDownloads } from "./libs/chrome-api";
import { Publisher } from "./libs/publisher/publisher";
import { EpubAdapter } from "./libs/publisher/adapters/epub-adapter";
import { Sitemap, Sites } from "./libs/sitemap";

export const BACKGROUND_API = {
  namespace: "background",
  apis: {
    CLIP_CONTENTS: "clipContents",
    REMOVE_CONTENTS: "removeContents",
    PUBLISH: "publish",
    DOWNLOAD: "download",
    SELECT_CLIP: "selectClip",
    SELECT_ALL_CLIPS: "selectAllClips",
    UNSELECT_CLIP: "unselectClip",
    UNSELECT_ALL_CLIPS: "unselectAllClips",
  },
  events: {
    ON_CONTENTS_CLIPPED: "onContentsClipped",
  },
};

export const BACKGROUND_API_COMMAND_MAP = {
  [`${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.CLIP_CONTENTS}`]:
    BACKGROUND_API.apis.CLIP_CONTENTS,
  [`${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.PUBLISH}`]:
    BACKGROUND_API.apis.PUBLISH,
  [`${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.DOWNLOAD}`]:
    BACKGROUND_API.apis.DOWNLOAD,
};

class Background {
  constructor(storage) {
    this.sites = new Sites();
    this.runtime = new ChromeRuntime();
    this.downloads = new ChromeDownloads();
    this.publisher = new Publisher(new EpubAdapter());
    this.publication = undefined;
  }

  init() {
    const sitesKey = "sites";
    const sites = this.storage.get(sitesKey);
    if (sites) {
      Object.entries(sites).forEach(([host, sitemapJson]) => {
        this.sites[host] = Sitemap.fromJson(sitemapJson);
      });
    }

    this.runtime.addListener(async (type, payload, sender, sendResponse) => {
      if (!(type in BACKGROUND_API_COMMAND_MAP)) {
        throw new Error("The command does not exist");
      }

      await this.BACKGROUND_API_COMMAND_MAP[type](payload);
      sendResponse({});
      return;
    });
  }

  async clipContents(payload) {
    const url = new URL(payload.url);
    const host = url.host;
    const protocol = url.protocol;
    this.sites.addSitemap(host);
    const sitemap = this.sites.getSitemap(host);
    sitemap.addPath(payload.url);
  }

  async publish() {
    this.publication = await this.publisher.publish();
  }

  async download() {
    var url = URL.createObjectURL(this.publication);
    await this.downloads.download({
      url,
      saveAs: true,
    });
  }
}

(function () {
  const background = new Background();
  background.init();
})();
