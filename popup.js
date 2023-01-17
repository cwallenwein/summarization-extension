//popup.js

// listener for "summarize"-button
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("button-summarize").addEventListener("click", requestSummary());
})

function requestSummary(){
  console.log("Summarization button clicked")
}