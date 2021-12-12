"use strict";

import { ChromeTabs } from "./libs/chrome-api/chrome-tabs";
import { ChromeRuntime } from "./libs/chrome-api/chrome-runtime";
import { BACKGROUND_API } from "./background";

import "./reset.css";
import "./popup.css";

class Popup {
  async init() {
    this.runtime = new ChromeRuntime();
    this.chromeTabs = new ChromeTabs();
    this.appDOM = document.getElementById("app");
    this.clipPageButton = document.getElementById("clipPageBtn");
    this.publishButton = document.getElementById("publishBtn");
    this.downloadButton = document.getElementById("downloadBtn");

    const response = await this.runtime.sendMessage({
      type: `${BACKGROUND_API.context}.${BACKGROUND_API.apis.GET_SITES}`,
    });

    console.log("response", response);

    this.sites = response.sites;

    this.bind();

    this.runtime.addListener(async (type, payload, sender, sendResponse) => {
      switch (type) {
        case `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PAGE_CLIPPED}`: {
          console.log("onPageClipped");
          const url = payload.url;
          console.log("url", url);
          break;
        }
        case `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PAGE_CLIP_FAILED}`: {
          console.log("onPageClipFailed");
          break;
        }
        case `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PUBLISHED}`: {
          console.log("onPublished");
          break;
        }
        case `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PUBLISH_FAILED}`: {
          console.log("onPublishFailed");
          break;
        }
        case `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_DOWNLOADED}`: {
          console.log("onDownloaded");
          break;
        }
        case `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_DOWNLOAD_FAILED}`: {
          console.log("onDownloadFailed");
          break;
        }
      }
    });
  }

  bind() {
    const self = this;
    this.clipPageButton.addEventListener("click", async function (e) {
      await self.onClipPageButtonClicked();
    });

    this.publishButton.addEventListener("click", async function (e) {
      await self.onPublishButtonClicked();
    });

    this.downloadButton.addEventListener("click", async function (e) {
      await self.onDownloadButtonClicked();
    });
  }

  async onClipPageButtonClicked() {
    console.log("onClipContentsButtonClicked");
    const tabs = await this.chromeTabs.query({
      active: true,
      currentWindow: true,
      highlighted: true,
    });

    if (!tabs.length) {
      throw new Error("An active tab on the current window is not found");
    }

    const activeCurrentTab = tabs[0];
    console.log(activeCurrentTab);
    try {
      const response = await this.runtime.sendMessage({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.apis.CLIP_PAGE}`,
        payload: {
          url: activeCurrentTab.url,
        },
      });
      console.log("response", response);
    } catch (error) {
      console.log(error);
    }
  }

  async onPublishButtonClicked() {
    const tabs = await this.chromeTabs.query({
      active: true,
      currentWindow: true,
      highlighted: true,
    });

    if (!tabs.length) {
      throw new Error("An active tab on the current window is not found");
    }

    const activeCurrentTab = tabs[0];
    console.log(activeCurrentTab);
    try {
      const response = await this.runtime.sendMessage({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.apis.PUBLISH}`,
        payload: {
          url: activeCurrentTab.url,
        },
      });
      console.log("response", response);
    } catch (error) {
      console.log(error);
    }
    console.log("onBindButtonClicked");
  }

  async onDownloadButtonClicked() {
    const tabs = await this.chromeTabs.query({
      active: true,
      currentWindow: true,
      highlighted: true,
    });

    if (!tabs.length) {
      throw new Error("An active tab on the current window is not found");
    }

    const activeCurrentTab = tabs[0];
    console.log(activeCurrentTab);
    try {
      const response = await this.runtime.sendMessage({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.apis.DOWNLOAD}`,
        payload: {
          url: activeCurrentTab.url,
        },
      });
      console.log("response", response);
    } catch (error) {
      console.log(error);
    }
    console.log("onBindButtonClicked");
  }
}

(function () {
  function initEnvironment() {
    const popup = new Popup();
    document.addEventListener("DOMContentLoaded", popup.init());
  }

  initEnvironment();
})();
