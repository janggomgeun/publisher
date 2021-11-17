"use strict";

import * as cheerio from "cheerio";
import {
  ChromeRuntime,
  ChromeStorage,
  ChromeDownloads,
} from "./libs/chrome-api";
import { Publisher } from "./libs/publisher/publisher";
import { EpubAdapter } from "./libs/publisher/adapters/epub-adapter";

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
  [`${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.CLIP_CONTENTS}`]: "",
};

class Background {
  constructor(storage) {
    this.storage = storage;
    this.contentsTree = {};
    this.runtime = new ChromeRuntime();
    this.downloads = new ChromeDownloads();
    this.publisher = new Publisher(new EpubAdapter());
    this.publication = undefined;
  }

  init() {
    this.runtime.addListener(async (type, payload, sender, sendResponse) => {
      if (
        type ===
        `${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.CLIP_CONTENTS}`
      ) {
        const url = new URL(payload.url);
        const host = url.host;
        const protocol = url.protocol;
        const response = await fetch(url.toString(), {
          method: "GET",
        });

        const htmlContents = await response.text();
        const $ = cheerio.load(htmlContents);

        const articleEls = $("article").toArray();
        /**
         * 1. 필요한 엘레멘트를 뽑아 낸다.
         * 2. 엘레멘트 안에서 video, image, code, audio, canvas를 뽑아내서 적절히 처리한다.
         * 3. 캐시한다.
         * 4. 도메인이 변경되면, 모든 캐시를 삭제한다.
         */

        const content = [];
        articleEls.forEach((el) => {
          content.push({
            title: "hmm",
            author: "wilson",
            data: $(el).html(),
          });
        });

        sendResponse({});
        return true;
      }

      if (
        type === `${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.PUBLISH}`
      ) {
        console.log("starts publishing");
        try {
          this.publication = await this.publisher.publish();
        } catch (error) {
          console.log("error", error);
        }
        console.log("this.tempPublishment", this.publication);
      }

      if (
        type === `${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.DOWNLOAD}`
      ) {
        var url = URL.createObjectURL(this.publication);
        const result = await this.downloads.download({
          url,
          saveAs: true,
        });
        console.log("result", result);
      }
    });
  }
}

(function () {
  const background = new Background(new ChromeStorage());
  background.init();
})();
