import JSZip from "jszip";
import { Directory, File } from "../../../../file";
import { EPUB_CSS, MIMETYPE, CONTAINER } from "./templates/constants";

export class EpubBuilder {
  constructor(publication) {
    this.files = [
      this.buildEpubDir(publication),
      this.buildMetaInfDir(publication),
      new File("mimetype", MIMETYPE),
    ];
    console.log("this.files", this.files);
  }

  buildEpubDir(publication) {
    console.log("buildEpubDir");
    const epubDir = new Directory("EPUB");

    const cssDir = new Directory("css");
    cssDir.addFile(new File("epub.css", EPUB_CSS));

    const contentsDir = new Directory("contents");

    // const cover = coverTemplate;
    // contentsDir.addFile(new File("cover.xhtml", coverTemplate));

    // const nav = ``;
    // contentsDir.addFile(new File("nav.xhtml", nav));

    const packageOpfManifestItems = [];
    const packageOpfSpineItems = [];
    publication.chapters.forEach((chapter) => {
      console.log("chapter", chapter);

      const chapterContents = `<?xml version="1.0" encoding="UTF-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
              <meta charset="utf-8" />
              <link rel="stylesheet" type="text/css" href="../css/epub.css" />
              <title>${chapter.contents.title}</title>
          </head>
          <body class="reflow">
            ${chapter.contents.document}
          </body>
      </html>
      `;
      console.log("chapterContents", chapterContents);
      contentsDir.addFile(new File(`${chapter.id}.xhtml`, chapterContents));
      packageOpfManifestItems.push(
        `<item id="contents/${chapter.id}" href="${chapter.id}" media-type="application/xhtml+xml"/>`
      );
      packageOpfSpineItems.push(`<itemref idref="${chapter.id}"/>`);
    });

    epubDir.addFiles([contentsDir, cssDir]);

    const title = "unknown";
    const creator = "wilson";
    const language = "en-US";
    const modifiedAt = new Date().toISOString();
    const packageOpf = `<?xml version="1.0" encoding="UTF-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" version="3.0" xml:lang="en" unique-identifier="uid" prefix="rendition: http://www.idpf.org/vocab/rendition/# cc: http://creativecommons.org/ns#">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title id="title">${title}</dc:title>
        <dc:creator>${creator}</dc:creator>
        <dc:language>${language}</dc:language>    
        <meta property="dcterms:modified">${modifiedAt}</meta>
      </metadata>
      <manifest>
        ${packageOpfManifestItems}
      </manifest>
      <spine>
        ${packageOpfSpineItems}
      </spine>
    </package>
    `;

    console.log("packageOpf", packageOpf);
    epubDir.addFile(new File("package.opf", packageOpf));

    return epubDir;
  }

  buildMetaInfDir() {
    console.log("buildMetaInfDir");
    const metainfDir = new Directory("META-INF");
    metainfDir.addFile(new File("container.xhtml", CONTAINER));
    return metainfDir;
  }

  async zip() {
    console.log("zip");
    this.zipper = new JSZip();
    this.zipFiles(this.files, this.zipper);
    return this.zipper.generateAsync({
      type: "blob",
      mimeType: "application/epub+zip",
      compression: "DEFLATE",
    });
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
