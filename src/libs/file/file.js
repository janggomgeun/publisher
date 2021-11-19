import { BaseFile } from "./base-file";

export class File extends BaseFile {
  constructor(name, data) {
    super(false);
    this.name = name;
    this.data = data;
  }
}
