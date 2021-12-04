"use strict";

import { ChromeRuntime, ChromeDownloads } from "./libs/chrome-api";
import { Publisher } from "./libs/publisher/publisher";
import { EpubAdapter } from "./libs/publisher/adapters/epub/v3/epub-adapter";
import { Sites } from "./libs/sitemap";
import { Chapter } from "./libs/publisher/chapter";

export const BACKGROUND_API = {
  context: "background",
  apis: {
    CLIP_PAGE: "clipPage",
    REMOVE_PAGE: "removePage",
    PUBLISH: "publish",
    DOWNLOAD: "download",
    SELECT_CLIP: "selectClip",
    SELECT_ALL_CLIPS: "selectAllClips",
    UNSELECT_CLIP: "unselectClip",
    UNSELECT_ALL_CLIPS: "unselectAllClips",
  },
  events: {
    ON_PAGE_CLIPPED: "onPageClipped",
    ON_PUBLISHED: "onPublished",
  },
};

export const BACKGROUND_API_COMMAND_MAP = {
  [`${BACKGROUND_API.context}.${BACKGROUND_API.apis.CLIP_PAGE}`]:
    BACKGROUND_API.apis.CLIP_PAGE,
  [`${BACKGROUND_API.context}.${BACKGROUND_API.apis.PUBLISH}`]:
    BACKGROUND_API.apis.PUBLISH,
  [`${BACKGROUND_API.context}.${BACKGROUND_API.apis.DOWNLOAD}`]:
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

  async init() {
    this.runtime.addListener(async (type, payload, sender, sendResponse) => {
      if (!(type in BACKGROUND_API_COMMAND_MAP)) {
        throw new Error("The command does not exist");
      }

      try {
        await this[BACKGROUND_API_COMMAND_MAP[type]](payload);
        sendResponse({});
      } catch (error) {
        sendResponse({
          error,
        });
      }
    });

    // TODO background is initialized
    // await this.runtime.sendMessage({
    //   payload: {
    //     sites: {
    //       ...this.sites,
    //     },
    //   },
    // });
  }

  async clipPage(payload) {
    console.log("clipPage");
    if (!("url" in payload)) {
      throw new Error("No URL is given");
    }

    await this.sites.addPage(payload.url);

    // this.runtime.sendMessage({
    //   type: `${BACKGROUND_API}.${BACKGROUND_API.events.ON_PAGE_CLIPPED}`,
    //   payload: {
    //     sites: {
    //       ...this.sites,
    //     },
    //   },
    // });
  }

  async publish() {
    console.log("publish");
    const title = Object.keys(this.sites.hostSitemap).reduce(
      (prev, curr, currIdx, originalArray) =>
        prev + curr + (originalArray.length - 1 !== currIdx) ? ", " : "",
      "N/A"
    );
    const selectedPages = this.sites.getSelectedPages();

    if (!selectedPages.length) {
      throw new Error("There are no selected pages.");
    }

    for (let n = 0; n < selectedPages.length; ++n) {
      const page = selectedPages[n];
      await page.contents.loading;
      const contents = page.contents;
      const chapter = new Chapter(n, contents.title, contents);
      this.publisher.addChapter(chapter);
    }
    this.publisher.addTitle(title);
    this.publisher.addCover("unknown");
    this.publisher.addAuthor("unknown");
    this.publisher.addPublisher("unknown");
    this.publication = await this.publisher.publish();
    console.log("this.publication", this.publication);
    this.publisher.throwDraftOut();

    // this.runtime.sendMessage({
    //   type: `${BACKGROUND_API}.${BACKGROUND_API.events.ON_PUBLISHED}`,
    //   payload: {
    //     sites: {
    //       ...this.sites,
    //     },
    //   },
    // });
  }

  async download() {
    if (this.publication === undefined) {
      throw new Error("It is not published yet.");
    }

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
