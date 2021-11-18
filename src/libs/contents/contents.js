"use strict";

import * as cheerio from "cheerio";

export class Contents {
  constructor() {
    this.document = undefined;
    this.$ = undefined;
    this.resources = {
      images: [],
      audios: [],
      videos: [],
      svgs: [],
      canvases: [],
    };
    this.references = [];
    this.loading = undefined;
  }

  extractDocumentFromRawHtml(rawHtml) {
    this.$ = cheerio.load(this.rawHtml);
    this.$ = this.$("body");
  }

  clearStyleFromDocument(document) {
    this.$("*").each(function () {
      this.removeAttr("class");
      this.removeAttr("style");
    });
  }

  async extractResourcesFromDocument(document) {
    const resourceTags = ["img", "svg", "audio", "video", "canvas"];
  }

  async extractReferencesFromDocument(document) {
    const referenceTags = ["a"];
  }

  async loadResources() {
    const loadingResources = [];
    Object.entries(this.contents.resources).forEach(([_, resources]) => {
      loadingResources.push(
        ...resources.map(async (resource) => {
          return this.loadResource(resource);
        })
      );
    });

    if (!loadingResources.length) {
      return [];
    }

    return Promise.all(loadingResources);
  }

  async loadResource(resource) {
    return resource.load();
  }

  static fromHtml(html) {
    this.extractDocumentFromRawHtml(html);
    this.clearStyleFromDocument(document);
    this.extractResourcesFromDocument(styleClearedDocument);
    this.extractReferencesFromDocument(styleClearedDocument);
    this.loading = loadResources();
  }
}
