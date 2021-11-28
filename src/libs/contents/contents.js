"use strict";

import * as cheerio from "cheerio";
import DOMPurify from "dompurify";
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

    const cleanHtml = this.cleanHtml(html);
    console.log("cleanHtml", cleanHtml);

    this.extractDocumentFromRawHtml(cleanHtml);
    this.clearStyleFromDocument();
    this.clearInputFromDocument();
    this.clearScriptFromDocument();
    this.extractResourcesFromDocument();
    this.extractReferencesFromDocument();

    console.log("hmm");
    this.document = this.cleanHtml(this.$document.html());
    console.log("this.document", this.document);

    this.loading = this.loadResources();
  }

  cleanHtml(html) {
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }

  extractDocumentFromRawHtml(rawHtml) {
    console.log("extractDocumentFromRawHtml");
    this.$ = cheerio.load(rawHtml);
    this.title = this.$("title").text();

    // TODO 나중에는 domain별로 추출 요소 우선순위가 달라질 수 있다.
    const tagsInPriority = ["body", "main", "article"];
    this.$document = cheerio.load(
      this.$(tagsInPriority[0]).html(),
      null,
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
