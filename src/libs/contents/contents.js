"use strict";

import * as cheerio from "cheerio";
import { Reference } from "./reference";
import { Resource } from "./resource";

export class Contents {
  constructor(html, meta) {
    this.origin = meta.origin;
    this.$ = undefined;
    this.$document = undefined;
    this.title = undefined;
    this.document = undefined;
    this.resources = [];
    this.references = [];
    this.loading = undefined;

    this.extractDocumentFromRawHtml(html);
    this.clearStyleFromDocument();
    this.clearInputFromDocument();
    this.clearScriptFromDocument();
    this.extractResourcesFromDocument();
    this.extractReferencesFromDocument();

    this.document = this.$document.html();

    this.loading = this.loadResources();
  }

  extractDocumentFromRawHtml(rawHtml) {
    console.log("extractDocumentFromRawHtml");
    this.$ = cheerio.load(rawHtml);
    this.title = this.$("head title").text();

    // TODO 나중에는 domain별로 추출 요소 우선순위가 달라질 수 있다.
    const contentsTagsInPriority = ["body", "main", "article"];

    let contentsTag = undefined;
    for (const tag of contentsTagsInPriority) {
      if (this.$(tag).length) {
        contentsTag = this.$(tag);
      }
    }

    if (contentsTag === undefined) {
      throw new Error("No contents tag");
    }

    this.$document = cheerio.load(
      contentsTag.html(),
      {
        xmlMode: true,
      },
      false
    );
  }

  clearStyleFromDocument() {
    console.log("clearStyleFromDocument");
    const self = this;
    this.$document("*").each(function (i, el) {
      self.$document(el).removeAttr("class");
      self.$document(el).removeAttr("style");
    });
  }

  clearInputFromDocument() {
    const self = this;
    this.$document("input").each(function (i, el) {
      self.$document(this).remove();
    });
  }

  clearScriptFromDocument() {
    console.log("clearScriptFromDocument");
    const self = this;
    this.$document("script").each(function (i, el) {
      console.log("self.$document(this).html()", self.$document(this).html());
      self.$document(this).remove();
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
        const modifiedSource = source
          ? this.isAbsoluteUrl(source)
            ? source
            : this.isRelativeUrl(source)
            ? `${this.origin}${source}`
            : source
          : undefined;

        const sourceTitle = self.$document(el).attr("title");
        const splitSource = source.split("/");
        const name = sourceTitle
          ? sourceTitle
          : splitSource[splitSource.length - 1];
        const type = tag === "img" ? "image" : tag;
        const resource = Resource.create(name, type, modifiedSource);
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
        console.log("source", source);
        console.log("this.origin", this.origin);

        const modifiedSource = source
          ? this.isAbsoluteUrl(source)
            ? source
            : this.isRelativeUrl(source)
            ? `${this.origin}${source}`
            : source
          : undefined;

        console.log("modifiedSource", modifiedSource);

        const sourceText = self.$document(el).text();
        console.log("sourceText", sourceText);

        const splitSource = source ? source.split("/") : [];
        const name = sourceText
          ? sourceText
          : splitSource[splitSource.length - 1];

        console.log("name", name);

        const type = tag === "a" ? "link" : tag;
        console.log("type", type);

        const reference = Reference.create(
          name ? name : new Date().getTime(),
          type,
          modifiedSource
        );

        console.log("reference", reference);

        self.references.push(reference);
      });
    });
  }

  isAbsoluteUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (error) {
      return false;
    }
  }

  isRelativeUrl(string) {
    return string.startsWith("/");
  }

  async loadResources() {
    console.log("loadResources");
    console.log("this.resources", this.resources);
    if (!this.resources.length) {
      return;
    }

    const self = this;
    const loadingResources = this.resources.map((resource) => {
      return self.loadResource(resource);
    });

    if (!loadingResources.length) {
      return [];
    }

    return Promise.all(loadingResources);
  }

  async loadResource(resource) {
    console.log("loadResource");
    console.log("resource", resource);
    return resource.load();
  }
}
