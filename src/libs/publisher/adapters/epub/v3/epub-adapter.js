import { EpubBuilder } from "./epub-builder";

export class EpubAdapter {
  async publish(draft) {
    return new EpubBuilder(draft).zip();
  }
}
