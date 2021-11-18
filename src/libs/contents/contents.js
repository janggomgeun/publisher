export class Contents {
  constructor() {
    this.document = undefined;
    this.resources = {};
    this.references = {};
    this.loading = undefined;
  }

  extractDocumentFromRawHtml(rawHtml) {}

  clearStyleFromDocument(document) {}

  async extractResourcesFromDocument(document) {}
  async extractReferencesFromDocument(document) {}

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
    const document = this.extractDocumentFromRawHtml(html);
    this.document = document;

    const styleClearedDocument = this.clearStyleFromDocument(document);

    const resources = this.extractResourcesFromDocument(styleClearedDocument);
    this.resources = resources;

    const references = this.extractReferencesFromDocument(styleClearedDocument);
    this.references = references;

    this.loading = loadResources();
  }
}
