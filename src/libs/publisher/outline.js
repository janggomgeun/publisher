"use strict";

/**
 *
 */
export class TableOfContentsItem {
  constructor() {
    this.title = undefined;
    /**
     * index는 pdf냐 epub인지에 따라 형태가 달라질 수 있다.
     */
    this.index = undefined;
    this.childItems = [];
  }
}

/**
 *
 */
export class TableOfContents {
  constructor() {
    this.childItems = [];
  }
}

/**
 * outline. 아웃라인과 table of contents의 의미는 다르다. 아웃라인은 말 그대로 글의 구조를 나타내는 반면, 테이블 오브 컨텐츠는 색인의 목적이 강하다.
 */
export class Outline {}
