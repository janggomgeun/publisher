"use strict";

import { ChromeRuntime, ChromeDownloads } from "./libs/chrome-api";
import { Publisher } from "./libs/publisher/publisher";
import { EpubAdapter } from "./libs/publisher/adapters/epub/v3/epub-adapter";
import { Sites } from "./libs/sitemap";
import { Chapter } from "./libs/publisher/chapter";

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
    return this.sites.addPage(payload.url);
  }

  async publish() {
    this.publisher.addCover("unknown");
    this.publisher.addAuthor("unknown");
    this.publisher.addPublisher("unknown");

    const selectedPages = this.sites.getSelectedPages();
    for (const page of selectedPages) {
      await page.contents.loading;
      const contents = page.contents;
      const chapter = new Chapter(contents.title, contents);
      this.publisher.addChapter(chapter);
    }

    this.publication = await this.publisher.publish();
    this.publisher.throwDraftOut();
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
