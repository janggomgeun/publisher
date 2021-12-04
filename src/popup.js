"use strict";

import { ChromeTabs } from "./libs/chrome-api/chrome-tabs";
import { ChromeRuntime } from "./libs/chrome-api/chrome-runtime";
import "./popup.css";
import { BACKGROUND_API } from "./background";

class Popup {
  async init() {
    this.chromeRuntime = new ChromeRuntime();
    this.chromeTabs = new ChromeTabs();
    this.appDOM = document.getElementById("app");
    this.clipPageButtonDOM = document.getElementById("clipPageBtn");
    this.bindButtonDOM = document.getElementById("bindBtn");
    this.downloadButtonDOM = document.getElementById("downloadBtn");
    this.currentBinderDOM = document.getElementById("current-binder");
    this.bindersDOM = document.getElementById("binders");
    this.bind();
  }

  bind() {
    const self = this;
    this.clipPageButtonDOM.addEventListener("click", function (e) {
      self.onClipContentsButtonClicked();
    });

    this.bindButtonDOM.addEventListener("click", function (e) {
      self.onBindButtonClicked();
    });

    this.downloadButtonDOM.addEventListener("click", function (e) {
      self.onDownloadButtonClicked();
    });
  }

  async onClipContentsButtonClicked() {
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
      const response = await this.chromeRuntime.sendMessage({
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

  async onBindButtonClicked() {
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
      const response = await this.chromeRuntime.sendMessage({
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
      const response = await this.chromeRuntime.sendMessage({
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

  onClearBinderButtonClicked() {}

  onBinderFocusChanged() {}

  onClearFocusButtonClicked() {}

  onBinderDeleted() {}
}

(function () {
  function initEnvironment() {
    const popup = new Popup();
    document.addEventListener("DOMContentLoaded", popup.init());
  }

  initEnvironment();
})();
