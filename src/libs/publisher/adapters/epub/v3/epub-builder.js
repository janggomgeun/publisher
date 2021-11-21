import JSZip from "jszip";
import { Directory, File } from "../../../../file";
import {
  epubCss,
  coverTemplate,
  navTemplate,
  chapterTemplate,
  packageOpfTemplate,
  container,
} from "./templates/base";

export class EpubBuilder {
  constructor(publication) {
    this.files = [
      this.buildEpubDir(),
      this.buildMetaInfDir(),
      new File("mimetype", "application/epub+zip"),
    ];
  }

  buildEpubDir() {
    const epubDir = new Directory("EPUB");

    const cssDir = new Directory("css");
    cssDir.addFile(new File("epub.css", epubCss));

    const contentsDir = new Directory("contents");

    // const cover = coverTemplate;
    // contentsDir.addFile(new File("cover.xhtml", coverTemplate));

    const nav = navTemplate;
    contentsDir.addFile(new File("nav.xhtml", nav));

    publication.chapters.forEach((chapter) => {
      contentsDir.addFile(
        new File(`chapter_${chapter.id}.xhtml`, chapterTemplate)
      );
    });

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
    epubDir.addFile(new File("package.opf", packageOpf));

    return epubDir;
  }

  buildMetaInfDir() {
    const metainfDir = new Directory("META-INF");
    metainfDir.addFile(new File("container.xhtml", container));
    return metainfDir;
  }

  async zip() {
    try {
      console.log("this.files", this.files);
      this.zipper = new JSZip();
      this.zipFiles(this.files, this.zipper);
      return this.zipper.generateAsync({
        type: "blob",
        mimeType: "application/epub+zip",
        compression: "DEFLATE",
      });
    } catch (error) {
      console.log(error);
    }
  }

  zipFiles(files, zipper) {
    const self = this;
    files.forEach((file) => {
      if (file.isDir) {
        const dir = zipper.folder(file.name);
        if (file.files.length) {
          self.zipFiles(file.files, dir);
        }
      } else {
        zipper.file(file.name, file.data);
      }
    });
  }
}
