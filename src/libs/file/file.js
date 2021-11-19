import { FileOrDirectory } from "./file-or-directory";

export class File extends FileOrDirectory {
  constructor(name, data) {
    super(false);
    this.name = name;
    this.data = data;
  }
}
