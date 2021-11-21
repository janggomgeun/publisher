import JSZip from "jszip";
import { Directory, File } from "../../../../file";
import {
  epubCss,
  coverTemplate,
  navTemplate,
  chapterTemplate,
  packageOpfTemplate,
} from "./templates/base";

export class EpubBuilder {
  constructor(publication) {
    const cssDir = new Directory("css");
    cssDir.addFile("epub.css", epubCss);

    const contentsDir = new Directory("contents");

    const cover = coverTemplate;
    contentsDir.addFile("cover.xhtml", coverTemplate);

    const nav = navTemplate;
    contentsDir.addFile("nav.xhtml", nav);

    publication.chapters.forEach((chapter) => {
      chapter.contents.resources;
      contentsDir.addFile(`chapter_${chapter.id}.xhtml`, chapterTemplate);
    });

    const epubDir = new Directory("EPUB");
    epubDir.addFiles([contentsDir, cssDir]);

    const packageOpf = packageOpfTemplate;
    const packageOpfData = {
      title: "",
      creator: "",
      idendifier: "",
      language: "",
      modifiedAt: new Date(),
      items: [],
    };
    epubDir.addFile("package.opf", packageOpf);

    const metainfDir = new Directory("META-INF");
    metainfDir.addFile(new File("container.xhtml", container));

    const mimetypeFile = new File("mimetype", "application/epub+zip");

    this.files = [epubDir, metainfDir, mimetypeFile];
  }

  async zip() {
    this.zipper = new JSZip();
    this.zipFiles(this.files);
    return this.zipper.generateAsync({
      type: "blob",
      mimeType: "application/epub+zip",
      compression: "DEFLATE",
    });
  }

  zipFiles(files) {
    const self = this;
    this.files.forEach((file) => {
      if (file.isDir) {
        if (file.files.length) {
          self.zipFiles(file.files);
        }
      } else {
        self.zipper.file(file.name, file.data);
      }
    });
  }
}