"use strict";

import { ChromeRuntime, ChromeDownloads } from "./libs/chrome-api";
import { Publisher } from "./libs/publisher/publisher";
import { EpubAdapter } from "./libs/publisher/adapters/epub/v3/epub-adapter";
import { Sites } from "./libs/sitemap";
import { Chapter } from "./libs/publisher/chapter";

export const BACKGROUND_API = {
  context: "background",
  apis: {
    GET_SITES: "getSites",
    CLIP_PAGE: "clipPage",
    REMOVE_PAGE: "removePage",
    PUBLISH: "publish",
    DOWNLOAD: "download",
    SELECT_CLIP: "selectClip",
    UNSELECT_CLIP: "unselectClip",
  },
  events: {
    ON_PAGE_CLIPPED: "onPageClipped",
    ON_PAGE_CLIP_FAILED: "onPageClipFailed",
    ON_PUBLISHED: "onPublished",
    ON_PUBLISH_FAILED: "onPublishFailed",
    ON_DOWNLOADED: "onDownloaded",
    ON_DOWNLOAD_FAILED: "onDownloadFailed",
  },
};

export const STATE_DEFAULT = "default";
export const STATE_PUBLISHING = "publishing";
export const STATE_PUBLISHED = "published";
export const STATE_DOWNLOADING = "downloading";

class Background {
  constructor(storage) {
    this.sites = new Sites();
    this.runtime = new ChromeRuntime();
    this.downloads = new ChromeDownloads();
    this.publisher = new Publisher(new EpubAdapter());
    this.publishing = undefined;
    this.publication = undefined;
    this.state = STATE_DEFAULT;
  }

  async init() {
    const self = this;
    this.runtime.addListener(async (type, payload, sender, sendResponse) => {
      switch (type) {
        case `${BACKGROUND_API.context}.${BACKGROUND_API.apis.GET_SITES}`: {
          console.log("this.sites.urlPageMap", this.sites.urlPageMap);
          sendResponse({
            sites: {
              hostSitemap: this.sites.hostSitemap
                ? Object.fromEntries(this.sites.hostSitemap)
                : undefined,
              urlPageMap: this.sites.urlPageMap
                ? Object.fromEntries(this.sites.urlPageMap)
                : undefined,
            },
            state: this.state,
          });
          break;
        }

        case `${BACKGROUND_API.context}.${BACKGROUND_API.apis.CLIP_PAGE}`: {
          await self.clipPage(payload);
          sendResponse({
            message: "ok",
          });
          break;
        }

        case `${BACKGROUND_API.context}.${BACKGROUND_API.apis.PUBLISH}`: {
          self.setState(STATE_PUBLISHING);
          self.publishing = this.publish().finally((_) =>
            self.setState(STATE_PUBLISHED)
          );
          sendResponse({
            message: "ok",
          });
          break;
        }

        case `${BACKGROUND_API.context}.${BACKGROUND_API.apis.DOWNLOAD}`: {
          try {
            if (self.publishing) {
              await self.publishing;
            }

            self.setState(STATE_DOWNLOADING);
            await self.download();
            self.setState(STATE_PUBLISHED);
            sendResponse({
              message: "ok",
            });
          } catch (error) {
            sendResponse({ error });
          } finally {
            self.setState(STATE_PUBLISHED);
          }
          break;
        }
      }
    });
  }

  async clipPage(payload) {
    try {
      console.log("clipPage");
      if (!("url" in payload)) {
        throw new Error("No URL is given");
      }

      await this.sites.addPage(payload.url);

      this.emitEvent({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PAGE_CLIPPED}`,
        payload: {
          sites: {
            hostSitemap: this.sites.hostSitemap
              ? Object.fromEntries(this.sites.hostSitemap)
              : undefined,
            urlPageMap: this.sites.urlPageMap
              ? Object.fromEntries(this.sites.urlPageMap)
              : undefined,
          },
        },
      });
    } catch (error) {
      console.log("error", error);

      this.emitEvent({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PAGE_CLIP_FAILED}`,
        payload: {
          url: payload.url,
        },
      });
    }
  }

  async publish() {
    try {
      console.log("publish");
      const title = Object.keys(
        Object.fromEntries(this.sites.hostSitemap)
      ).reduce((prev, curr, currIdx, originalArray) => {
        if (currIdx === 0 && curr) {
          return curr;
        }

        return prev + curr + (originalArray.length - 1 !== currIdx ? ", " : "");
      }, "N/A");

      console.log("title", title);

      const selectedPages = this.sites.getSelectedPages();

      console.log("selectedPages", selectedPages);

      if (!selectedPages.length) {
        throw new Error("There are no selected pages.");
      }

      await Promise.all(
        selectedPages.map(async (selectedPage, n) => {
          await selectedPage.contents.loading;
          const contents = selectedPage.contents;
          const chapter = new Chapter(n, contents.title, contents);
          this.publisher.addChapter(chapter);
          return;
        })
      );

      this.publisher.addTitle(title);
      this.publisher.addCover("unknown");
      this.publisher.addAuthor("unknown");
      this.publisher.addPublisher("unknown");
      this.publication = await this.publisher.publish();
      console.log("this.publication", this.publication);
      this.publisher.throwDraftOut();

      this.emitEvent({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PUBLISHED}`,
      });
    } catch (error) {
      this.emitEvent({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PUBLISH_FAILED}`,
      });
    }
  }

  async download() {
    try {
      if (this.publication === undefined) {
        throw new Error("It is not published yet.");
      }

      var url = URL.createObjectURL(this.publication);
      await this.downloads.download({
        url,
        saveAs: true,
      });
      this.emitEvent({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_DOWNLOADED}`,
      });
    } catch (error) {
      this.emitEvent({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_DOWNLOAD_FAILED}`,
      });
    }
  }

  setState(state) {
    this.state = state;
  }

  emitEvent(event) {
    this.runtime.sendMessage(event);
  }
}

(function () {
  const background = new Background();
  background.init();
})();
