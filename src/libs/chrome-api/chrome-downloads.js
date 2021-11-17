"use strict";

export class ChromeDownloads {
  async download(options) {
    new Promise((resolve, reject) => {
      chrome.downloads.download(options, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        resolve(response);
      });
    });
  }
}
