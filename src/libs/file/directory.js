import { BaseFile } from "./base-file";

export class Directory extends BaseFile {
  constructor(name) {
    super(true);
    this.name = name;
    this.files = [];
  }

  addFile(file) {
    this.files.push(file);
  }

  addFiles(files) {
    this.files.push(...files);
  }
}
