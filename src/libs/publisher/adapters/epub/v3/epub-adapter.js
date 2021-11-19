import JSZip from "jszip";

export class FileOrDirectory {
  constructor(isDir) {
    this.isDir = isDir;
  }
}

export class File extends FileOrDirectory {
  constructor(name, data) {
    super(false);
    this.name = name;
    this.data = data;
  }
}

export class Directory extends FileOrDirectory {
  constructor(name) {
    super(true);
    this.name = name;
    this.fileTree = [];
  }

  addDirectory(directory) {
    this.fileTree.push(directory);
  }

  addDirectories(directories) {
    this.fileTree.push(...directories);
  }

  addFile(file) {
    this.fileTree.push(file);
  }

  addFiles(files) {
    this.fileTree.push(...files);
  }
}

// FILE tree

export class EpubBuilder {
  constructor() {
    const epubDir = new Directory("EPUB");
    const metainfDir = new Directory("META-INF");
    metainfDir.addFile(new File("container.xhtml"));
    const mimetypeFile = new File("mimetype", "application/epub+zip");
    this.fileTree = [epubDir, metainfDir, mimetypeFile];
  }

  addCover() {}
  addChapter() {}

  async build() {
    return this.zip.generateAsync({
      type: "blob",
      mimeType: "application/epub+zip",
      compression: "DEFLATE",
    });
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

  async publish() {
    return new EpubBuilder().build();
  }
}
