'use strict';

import { ChromeTabs } from './chrome-api/chrome-tabs';
import { ChromeRuntime } from './chrome-api/chrome-runtime';
import './popup.css';
import { BACKGROUND_API } from './background';

class Popup {
  async init() {
    this.chromeRuntime = new ChromeRuntime()
    this.chromeTabs = new ChromeTabs()
    this.appDOM = document.getElementById('app')
    this.clipContentsButtonDOM = document.getElementById('clipContentsBtn')
    this.bindButtonDOM = document.getElementById('bindBtn')
    this.currentBinderDOM = document.getElementById('current-binder')
    this.bindersDOM = document.getElementById('binders')
    this.bind()
  }

  bind() {
    const self = this
    this.clipContentsButtonDOM.addEventListener('click', function(e) {
      self.onClipContentsButtonClicked()
    })

    this.bindButtonDOM.addEventListener('click', function(e) {
      self.onBindButtonClicked()
    })
  }

  async onClipContentsButtonClicked() {
    console.log('onClipContentsButtonClicked')
    const tabs = await this.chromeTabs.query({
      active: true,
      currentWindow: true,
      highlighted: true
    })

    if (!tabs.length) {
      throw new Error('An active tab on the current window is not found')
    }

    const activeCurrentTab = tabs[0]
    console.log(activeCurrentTab);
    try {
      const response = await this.chromeRuntime.sendMessage(
        {
          type: `${BACKGROUND_API.namespace}.${BACKGROUND_API.apis.CLIP_CONTENTS}`,
          payload: {
            url: activeCurrentTab.url,
          }
        }
      )
      console.log('response', response);
    } catch (error) {
      console.log(error);
    }
  }
  
  onBindButtonClicked() {
    console.log('onBindButtonClicked')
  }

  onClearBinderButtonClicked() {

  }

  onBinderFocusChanged() {

  }

  onClearFocusButtonClicked() {

  }

  onBinderDeleted() {

  }
}

(function(){
  function initEnvironment() {
    const popup = new Popup()
    document.addEventListener('DOMContentLoaded', popup.init())
  }
  
  initEnvironment();
})()
