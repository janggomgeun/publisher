"use strict";

import * as cheerio from "cheerio";
import { Reference } from "./reference";
import { Resource } from "./resource";

export class Contents {
  constructor(html) {
    this.$ = undefined;
    this.$document = undefined;
    this.title = undefined;
    this.document = undefined;
    this.resources = [];
    this.references = [];
    this.loading = undefined;

    this.extractDocumentFromRawHtml(html);
    this.clearStyleFromDocument();
    this.extractResourcesFromDocument();
    this.extractReferencesFromDocument();

    this.document = this.$document.html();
    this.loading = this.loadResources();
  }

  extractDocumentFromRawHtml(rawHtml) {
    console.log("extractDocumentFromRawHtml");
    const test = `
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
        <head>
          <title>Children's Literature</title>
          <link rel="stylesheet" type="text/css" href="css/epub.css" />
        </head>
        <body>
        <div class="hmm" style="width: 100px;">test</div>
        <img src="https://picsum.photos/200/300" alt="Cover Image" title="Cover Image" />
          <a href="https://naver.com">네이버</a>
        </body>
      </html>
      `;

    this.$ = cheerio.load(test);
    this.title = this.$("title").text();
    // TODO 나중에는 domain별로 추출 요소 우선순위가 달라질 수 있다.
    const tagsInPriority = ["body", "main", "article"];
    this.$document = cheerio.load(this.$(tagsInPriority[0]).html());
  }

  clearStyleFromDocument() {
    console.log("clearStyleFromDocument");
    const self = this;
    this.$document("*").each(function (i, el) {
      self.$document(el).removeAttr("class");
      self.$document(el).removeAttr("style");
    });
  }

  convertIncomptibleElements() {
    console.log("convertIncomptibleElements");
    const incompatibleTags = ["canvas", "svg"];
  }

  extractResourcesFromDocument() {
    console.log("extractResourcesFromDocument");
    const self = this;
    const resourceTags = ["img", "audio", "video"];
    resourceTags.forEach((tag) => {
      self.$document(tag).each((i, el) => {
        const source = self.$document(el).attr("src");
        const sourceTitle = self.$document(el).attr("title");
        const splitSource = source.split("/");
        const name = sourceTitle
          ? sourceTitle
          : splitSource[splitSource.length - 1];
        const type = tag === "img" ? "image" : tag;
        const resource = Resource.create(name, type, source);
        self.resources.push(resource);
        self.$document(el).attr("src", `../${type}s/${resource.id}`);
      });
    });
  }

  extractReferencesFromDocument() {
    console.log("extractReferencesFromDocument");
    const self = this;
    const referenceTags = ["a"];
    referenceTags.forEach((tag) => {
      self.$document(tag).each((i, el) => {
        const source = self.$document(el).attr("href");
        const sourceText = self.$document(el).text();
        const splitSource = source.split("/");
        const name = sourceText
          ? sourceText
          : splitSource[splitSource.length - 1];
        const type = tag === "a" ? "link" : tag;
        const reference = Reference.create(
          name ? name : new Date().getTime(),
          type,
          source
        );
        self.references.push(reference);
      });
    });
  }

  async loadResources() {
    console.log("loadResources");
    const loadingResources = [];
    const self = this;
    Object.entries(this.resources).forEach(([_, resources]) => {
      if (!resources.length) {
        return;
      }

      loadingResources.push(
        ...resources.map(async (resource) => {
          return self.loadResource(resource);
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
}
