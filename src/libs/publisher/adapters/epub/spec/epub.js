export class EpubRootDirectory {
  constructor() {
    this.isDir = true;
  }

  mimetypeFile(mimeType) {
    this.mimeTypeFile = mimeType;
  }

  epubDir(epubDir) {
    this.epubDirectory = epubDir;
  }

  metaInfDir(metaInfDir) {
    this.metaInfDir = metaInfDir;
  }

  zip() {}
}

export class Epub {
  constructor() {
    this.value = {
      mimetype: "application/epub+zip",
      ["EPUB"]: {
        ["captions"]: {},
        ["css"]: {},
        ["scripts"]: {},
        ["fonts"]: {},
        ["images"]: {},
        ["audios"]: {},
        ["videos"]: {},
        ["contents"]: {
          "cover.xhtml": "",
          "nav.xhtml": "",
        },
        "package.opf": ``,
        "toc.ncx": ``,
      },
      ["META-INF"]: {
        "container.xml": `
        <?xml version="1.0" encoding="utf-8" standalone="no"?>
        <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
          <rootfiles>
            <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
        </container>
        `,
      },
    };
  }
}
