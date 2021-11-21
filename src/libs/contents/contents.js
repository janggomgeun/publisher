"use strict";

import * as cheerio from "cheerio";
import { Resource } from "./resource";

export class Contents {
  constructor() {
    this.$ = undefined;
    this.document = undefined;
    this.resources = [];
    this.references = [];
    this.loading = undefined;
  }

  extractDocumentFromRawHtml(rawHtml) {
    const test = `
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
      <head>
        <title>Children's Literature</title>
        <link rel="stylesheet" type="text/css" href="css/epub.css" />
      </head>
      <body>
        <img src="https://picsum.photos/200/300" alt="Cover Image" title="Cover Image" />
        <a href="https://naver.com">네이버</a>
      </body>
    </html>
    `;

    this.$ = cheerio.load(test);

    // TODO 나중에는 domain별로 추출 요소 우선순위가 달라질 수 있다.
    const tagsInPriority = ["body", "main", "article"];
    this.$ = this.$(tagsInPriority[0]);
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
    const self = this;
    const resourceTags = ["img", "audio", "video"];
    resourceTags.forEach((tag) => {
      self.$(tag).each((_) => {
        const source = self.$(this).attr("src");
        const sourceTitle = self.$(this).attr("title");
        const splitSource = source.split("/");
        const name = sourceTitle
          ? sourceTitle
          : splitSource[splitSource.length - 1];
        const type = tag === "img" ? "image" : tag;
        const resource = Resource.create(name, type, source);
        this.resources.push(resource);
        self.$(this).attr("src", `../${type}s/${resource.id}`);
      });
    });
  }

  extractReferencesFromDocument() {
    const self = this;
    const referenceTags = ["a"];
    referenceTags.forEach((tag) => {
      const source = self.$(this).attr("href");
      const sourceText = self.$(this).text();
      const splitSource = source.split("/");
      const name = sourceText
        ? sourceText
        : splitSource[splitSource.length - 1];
      const type = tag === "a" ? "link" : tag;
      const resource = Resource.create(
        name ?? new Date().getTime(),
        type,
        source
      );
      this.resources.push(resource);
    });
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
