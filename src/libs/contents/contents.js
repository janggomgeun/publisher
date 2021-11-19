"use strict";

import * as cheerio from "cheerio";

export class Contents {
  constructor() {
    this.document = undefined;
    this.$ = undefined;
    this.resources = [];
    this.references = [];
    this.loading = undefined;
  }

  extractDocumentFromRawHtml(rawHtml) {
    this.$ = cheerio.load(rawHtml);
    this.$ = this.$("body");
  }

  clearStyleFromDocument() {
    this.$("*").each(function () {
      this.removeAttr("class");
      this.removeAttr("style");
    });
  }

  convertIncomptibleElements() {
    const incompatibleTags = ["canvas", "svg"];
  }

  extractResourcesFromDocument() {
    const resourceTags = ["img", "audio", "video"];
    resourceTags.forEach((tag) => {
      this.$(tag).each((_) => {});
    });
  }

  extractReferencesFromDocument() {
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
    this.clearStyleFromDocument();
    this.extractResourcesFromDocument();
    this.extractReferencesFromDocument();
    this.loading = loadResources();
  }
}
