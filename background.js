/*
GPT-4: This code will listen for both chrome.tabs.onUpdated and chrome.tabs.onActivated events. When a tab is updated, it will check if the update is complete before sending the message. When a tab is activated, it will use chrome.tabs.get to retrieve the current tab information and send the message accordingly.

This should ensure that the message is being sent to contentScript.js when the URL is updated, and also when you switch between different tabs.
*/

const sendMessageToContentScript = (tabId, url) => {
  if (url && url.includes("youtube.com/watch")) {
    const queryParameters = url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    sendMessageToContentScript(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    sendMessageToContentScript(activeInfo.tabId, tab.url);
  });
});
