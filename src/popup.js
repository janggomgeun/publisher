"use strict";

import { ChromeTabs } from "./libs/chrome-api/chrome-tabs";
import { ChromeRuntime } from "./libs/chrome-api/chrome-runtime";
import { BACKGROUND_API } from "./background";

import "./popup.css";

class Popup {
  async init() {
    const self = this;
    this.runtime = new ChromeRuntime();
    this.chromeTabs = new ChromeTabs();
    this.appDOM = document.getElementById("app");
    this.sitesDOM = document.getElementById("sites");
    this.sitePagesDOM = document.getElementById("pages");
    this.clearAllPagesButton = document.getElementById("clearAllPagesBtn");
    this.clipPageButton = document.getElementById("clipPageBtn");
    this.publishButton = document.getElementById("publishBtn");
    this.downloadButton = document.getElementById("downloadBtn");

    const response = await this.runtime.sendMessage({
      type: `${BACKGROUND_API.context}.${BACKGROUND_API.apis.GET_SITES}`,
    });

    console.log("response", response);

    this.updateSites(response.sites);
    this.updateButtons(response.state);

    this.bind();

    this.runtime.addListener(async (type, payload, sender, sendResponse) => {
      switch (type) {
        case `${BACKGROUND_API.context}.${BACKGROUND_API.events.ON_PAGE_CLIPPED}`: {
          console.log("onPageClipped");

          self.updateSites(payload.sites);
          console.log("sites", sites);
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

  updateSites(sites) {
    this.removeAllChildNodes(this.sitesDOM);

    const self = this;
    const urlPageMap = sites.urlPageMap;

    let siteEls = {};
    Object.entries(urlPageMap).forEach(([urlString, page]) => {
      const url = new URL(urlString);
      const host = url.hostname;
      console.log("host", host);
      const title = page.contents.title;
      console.log("title", title);

      if (!(host in siteEls)) {
        siteEls[host] = self.createSiteElement({ host });
      }

      const pageEl = self.createPageElement(page);
      siteEls[host].appendChild(pageEl);
    });

    Object.values(siteEls).forEach((siteEl) => {
      this.sitesDOM.appendChild(siteEl);
    });
  }

  updateButtons(state) {
    console.log("state", state);
  }

  createSiteElement(site) {
    const li = document.createElement("li");

    const spacerDiv = document.createElement("div");
    spacerDiv.setAttribute("class", "spacer-4");
    spacerDiv.textContent = " ";
    li.appendChild(spacerDiv);

    const h2 = document.createElement("h2");
    h2.textContent = site.host ? site.host : "";
    li.appendChild(h2);

    const h3 = document.createElement("h3");
    h3.textContent = "";
    li.appendChild(h3);

    li.appendChild(spacerDiv.cloneNode());

    return li;
  }

  createPageElement(page) {
    const li = document.createElement("li");

    const flexRow = document.createElement("div");
    flexRow.setAttribute("class", "flex row");
    li.appendChild(flexRow);

    // const checkboxContainer = document.createElement("div");
    // flexRow.appendChild(checkboxContainer);

    // const checkbox = document.createElement("input");
    // checkbox.setAttribute("type", "checkbox");
    // checkbox.setAttribute("checked", true);
    // checkboxContainer.appendChild(checkbox);

    // const spacing = document.createElement("div");
    // spacing.textContent = " ";
    // flexRow.appendChild(spacing);

    const labelContainer = document.createElement("div");
    flexRow.appendChild(labelContainer);

    const labelTitle = document.createElement("div");
    labelTitle.textContent = `- ${page.contents.title}`;
    labelContainer.appendChild(labelTitle);

    const labelLink = document.createElement("div");
    labelLink.textContent = "";
    labelContainer.appendChild(labelLink);

    return li;
  }

  removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  bind() {
    const self = this;
    this.clearAllPagesButton.addEventListener("click", async function (e) {
      await self.onClearAllPagesButtonClicked();
    });

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

  async onClearAllPagesButtonClicked() {
    console.log("onClearAllPagesButtonClicked");
    try {
      const response = await this.runtime.sendMessage({
        type: `${BACKGROUND_API.context}.${BACKGROUND_API.apis.CLEAR_ALL_PAGES}`,
      });
      this.updateSites({});
      console.log("response", response);
    } catch (error) {
      console.log(error);
    }
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
