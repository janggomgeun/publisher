'use strict';

export class ChromeRuntime {
  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        message,
        response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          }
          resolve(response);
        }
      );
    });
  }

  addListener(listener) {
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      await listener(request.type, request.payload, sender, sendResponse)
    })
  }
}
