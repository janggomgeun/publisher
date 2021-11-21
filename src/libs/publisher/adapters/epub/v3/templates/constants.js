export const MIMETYPE = "application/epub+zip";
export const CONTAINER = `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
   <rootfiles>
      <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>
`;

export const EPUB_CSS = `
@charset "UTF-8";
@namespace "http://www.w3.org/1999/xhtml";
@namespace epub "http://www.idpf.org/2007/ops";

body {
  font-family: Georgia, Times, Serif;
  letter-spacing: 0.08em;
}

h1,
h2 {
  letter-spacing: 0.16em;
}

nav#toc ol {
  list-style-type: none;
}

body.reflow {
  margin: 2em 4em 2em 4em;
  background-color: rgb(255, 255, 230);
}

img#portrait,
img.detail {
  float: right;
  margin: 0.2em 0em 0.9em 2em;
}

body.fixed,
img.full {
  width: 1024px;
  margin: 0;
  padding: 0;
  top: 0px;
  left: 0px;
}

#b1.fixed {
  height: 697px;
}

#b2.fixed {
  height: 696px;
}

#b3.fixed {
  height: 673px;
}

#b4.fixed {
  height: 698px;
}

img.full {
  position: absolute;
}
`;
