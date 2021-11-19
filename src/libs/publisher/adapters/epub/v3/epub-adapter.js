import JSZip from "jszip";
import { Directory, File } from "../../../../file";

export class EpubBuilder {
  constructor() {
    const epubDir = new Directory("EPUB");
    const metainfDir = new Directory("META-INF");
    metainfDir.addFile(new File("container.xhtml"));
    const mimetypeFile = new File("mimetype", "application/epub+zip");
    this.fileTree = [epubDir, metainfDir, mimetypeFile];
  }

  async zip() {
    this.zip = new JSZip();
    this.files.forEach((file) => {});
    return this.zip.generateAsync({
      type: "blob",
      mimeType: "application/epub+zip",
      compression: "DEFLATE",
    });
  }
}

export class EpubAdapter {
  constructor() {}

  async publish(draft) {
    return new EpubBuilder().zip();
  }
}
