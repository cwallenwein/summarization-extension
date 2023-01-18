//popup.js

// listener for "summarize"-button
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("button-summarize").addEventListener("click", requestSummary);
})

async function requestSummary(){
  let activeTab = await getActiveTab();
  let tabId = activeTab.id
  await chrome.runtime.sendMessage({type:"summarization_request", tabId: tabId})
}

async function getActiveTab(){
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}