export class Sitemap {
  constructor() {
    this.protocol = undefined;
    this.host = undefined;
  }

  static fromJson(json) {
    return new Sitemap();
  }
}
