export const chapterTemplate = `
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta charset="utf-8" />
        <link rel="stylesheet" type="text/css" href="../css/epub.css" />
    </head>
    <body class="reflow">
    </body>
</html>
`;

export const coverTemplate = `
`;

export const navTemplate = `
`;

export const mimetype = "application/epub+zip";

export const container = `
<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
   <rootfiles>
      <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>
`;

export const epubCss = `
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

export const packageOpfTemplate = `
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" xml:lang="en" unique-identifier="uid" prefix="rendition: http://www.idpf.org/vocab/rendition/# cc: http://creativecommons.org/ns#">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title id="title"><%=title%></dc:title>
    <dc:creator><%=creator%></dc:creator>
    <dc:identifier id="uid"><%=identifier%></dc:identifier>
    <dc:language><%=language%></dc:language>    
    <meta property="dcterms:modified"><%=modifiedAt%></meta>
    <!-- 
      The layout, orientation and spread properties default to their initial values; thus 
      all explicit fixed layout metadata appears on spine items below. 
    -->
  </metadata>
  <manifest>
    <% items.forEach(function(item) { %>
      <item id="<%=item.id%>" href="<%=item.href%>" media-type="<%=item.mimetype%>"/>
    <% }); %>
  </manifest>
  <spine>
    <% items.filter(item => item.mimetype === 'application/xhtml+xml').forEach(function(item) { %>
      <itemref idref="item.id"/>
    <% }); %>
  </spine>
</package>
`;
