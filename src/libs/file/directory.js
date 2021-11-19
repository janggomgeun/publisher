import { FileOrDirectory } from "./file-or-directory";

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
