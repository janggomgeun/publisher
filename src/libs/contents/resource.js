import { Reference } from "./reference";

/**
 * 문자 외 글에서 사용된 컨텐츠. 레퍼런스와 차이점은 실제로 글에서 독자들에게 보여주는 데이터가 있는지 여부.
 */
export class Resource extends Reference {
  constructor(id, type, source) {
    super(id, type, source);
    this.mimetype = undefined;
  }

  async load() {
    console.log("load");
    try {
      const response = await fetch(this.source, {
        method: "GET",
      });
      this.mimetype = response.headers.get("Content-Type");
      console.log("this.mimetype", this.mimetype);

      this.data = await response.blob();
      console.log("response", response);
    } catch (error) {
      console.log("error", error);
    }
  }

  static create(name, type, source) {
    const id = `res_${this.type}_${name}`;
    return new Resource(id, type, source);
  }
}
