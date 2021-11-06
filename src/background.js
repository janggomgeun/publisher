'use strict';

import * as cheerio from 'cheerio';
import { ChromeRuntime } from './libs/chrome-api/chrome-runtime';
import { ChromeStorage } from './libs/chrome-api/chrome-storage';

export const BACKGROUND_API = {
  namespace: 'background',
  apis: {
    CLIP_CONTENTS: 'clipContents'
  },
  events: {
    ON_CONTENTS_CLIPPED: 'onContentsClipped'
  }
}

export const BACKGROUND_API_COMMAND_MAP = {
  [`${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.CLIP_CONTENTS}`]: '',
}

class Background {
  constructor(storage) {
    this.storage = storage
    this.runtime = new ChromeRuntime()
  }

  init() {
    this.runtime.addListener(async (type, payload, sender, sendResponse) => {
      if (type === `${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.CLIP_CONTENTS}`) {
        const url = new URL(payload.url)
        const host = url.host
        const protocol = url.protocol
        const response = await fetch(url.toString(), {
          method: 'GET'
        })

        const htmlContents = await response.text()
        const $ = cheerio.load(htmlContents)

        const articleEls = $('article').toArray()

        
        const content = [];
        articleEls.forEach((el) => {
          content.push({
            title: 'hmm',
            author: 'wilson',
            data: $(el).html()
          })
        })
        
        sendResponse({});
        return true;
      }
    })
  }
}

(function(){
  const background = new Background(new ChromeStorage())
  background.init()
})()
