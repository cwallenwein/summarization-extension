//popup.js

// listener for "summarize"-button
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("button-summarize").addEventListener("click", requestSummary);
})

async function requestSummary(){
  await chrome.runtime.sendMessage({type:"summarization_request"})
}