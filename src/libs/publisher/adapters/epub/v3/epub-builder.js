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
  }

  buildEpubDir(publication) {
    const epubDir = new Directory("EPUB");

    const cssDir = new Directory("css");
    cssDir.addFile(new File("epub.css", EPUB_CSS));

    const imagesDir = new Directory("images");

    const contentsDir = new Directory("contents");

    // const cover = coverTemplate;
    // contentsDir.addFile(new File("cover.xhtml", coverTemplate));

    const packageOpfManifestItems = [];
    const packageOpfSpineItems = [];
    const navItems = [];

    publication.chapters.forEach((chapter) => {
      const chapterContents = this.buildChapterContents(chapter);
      contentsDir.addFile(new File(`${chapter.id}.xhtml`, chapterContents));

      packageOpfManifestItems.push(
        `<item id="${chapter.id}" href="contents/${chapter.id}.xhtml" media-type="application/xhtml+xml"/>`
      );
      packageOpfSpineItems.push(`<itemref idref="${chapter.id}"/>`);
      navItems.push(
        `<li><a href="${chapter.id}.xhtml">${chapter.title}</a></li>`
      );

      const imageResources = chapter.contents.resources.filter(
        (resource) => resource.type === "image"
      );

      imageResources.forEach((imageResource) => {
        packageOpfManifestItems.push(
          `<item id="${imageResource.id}" href="images/${imageResource.id}" media-type="${imageResource.mimetype}"/>`
        );
        imagesDir.addFile(new File(imageResource.id, imageResource.data));
      });
    });

    const nav = `<?xml version="1.0" encoding="UTF-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <head>
          <title>${publication.title}</title>
        </head>
        <body>
            <nav epub:type="toc">
              <h1>Table of Contents</h1>
              <ol>
                  ${navItems.join("")}
              </ol>
            </nav>
        </body>
    </html>
    `;
    contentsDir.addFile(new File("nav.xhtml", nav));

    epubDir.addFiles([contentsDir, cssDir, imagesDir]);

    const title = "unknown";
    const creator = "wilson";
    const language = "en-US";
    const modifiedAt = new Date().toUTCString();
    const packageOpf =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<package version="3.0" unique-identifier="uid" xmlns="http://www.idpf.org/2007/opf">' +
      '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">' +
      '<dc:identifier id="uid">urn:uuid:fe93046f-af57-475a-a0cb-a0d4bc99ba6d</dc:identifier>' +
      `<dc:title id="title">${publication.title}</dc:title>` +
      "<dc:language>en</dc:language>" +
      `<meta property="dcterms:modified">${modifiedAt}</meta>` +
      "</metadata>" +
      "<manifest>" +
      '<item id="css" href="css/epub.css" media-type="text/css"/>' +
      '<item id="nav" href="contents/nav.xhtml" media-type="application/xhtml+xml" properties="nav" />' +
      packageOpfManifestItems.join("") +
      "</manifest>" +
      "<spine>" +
      packageOpfSpineItems.join("") +
      "</spine>" +
      "</package>";

    epubDir.addFile(new File("package.opf", packageOpf));

    return epubDir;
  }

  buildChapterContents(chapter) {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
              <meta charset="utf-8" />
              <link rel="stylesheet" type="text/css" href="../css/epub.css" />
              <title>${chapter.contents.title}</title>
          </head>
          <body>
            ${chapter.contents.document}
          </body>
      </html>
      `;
  }

  buildMetaInfDir() {
    const metainfDir = new Directory("META-INF");
    metainfDir.addFile(new File("container.xml", CONTAINER));
    return metainfDir;
  }

  async zip() {
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
