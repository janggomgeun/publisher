import { Reference } from "./reference";

/**
 * 문자 외 글에서 사용된 컨텐츠. 레퍼런스와 차이점은 실제로 글에서 독자들에게 보여주는 데이터가 있는지 여부.
 */
export class Resource extends Reference {
  constructor() {
    this.data = undefined;
  }
}
