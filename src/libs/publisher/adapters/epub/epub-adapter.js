import JSZip from "jszip";

export class EpubBuilder {
  constructor() {
    this.zip = new JSZip();
    this.zip.file("test.txt", "hello world");
  }

  async build() {
    return this.zip.generateAsync({
      type: "blob",
      mimeType: "application/epub+zip",
      compression: "DEFLATE",
    });
  }
}

export class EpubAdapter {
  constructor() {}

  async publish() {
    return new EpubBuilder().build();
  }
}
