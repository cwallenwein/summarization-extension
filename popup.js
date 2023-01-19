//popup.js

document.addEventListener("DOMContentLoaded", async () => {
  addSummarizeButtonEventListener()
  await buildSummaryHistory()
  await buildApiKeyForm()
  let apiKey = await getApiKey()
  console.log(apiKey)
})

function addSummarizeButtonEventListener() {
  document.getElementById("button-summarize").addEventListener("click", requestSummary);
}

async function requestSummary() {
  let activeTab = await getActiveTab();
  let tabId = activeTab.id
  let url = activeTab.url
  await chrome.runtime.sendMessage({ type: "summarization_request", url: url, tabId: tabId })
}

async function getActiveTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function buildApiKeyForm() {
  let apiKeyForm = document.getElementById("api-key-form")
  console.log(apiKeyForm)
  apiKeyForm.addEventListener("submit", async (event) => {
    console.log("submitting api key")
    event.preventDefault()
    let apiKey = document.getElementById("api-key-input").value
    await chrome.storage.local.set({ apiKey: apiKey })
  })
}

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  console.log("History was updated!")
  for (key in changes) {
    if (key === "history") {
      await buildSummaryHistory()
    }
  }
})

async function buildSummaryHistory() {
  let history = await getHistory()
  console.log("new history", history)

  let headerRow = buildHeaderRow()

  let tableBody = document.createElement("tbody")
  tableBody.appendChild(headerRow)

  for (let i = history.length - 1; i >= 0; i--) {
    let row = buildRowFromSummary(history[i])
    tableBody.appendChild(row)
  }

  console.log(tableBody)

  let table = document.getElementById("summary-table")
  table.replaceChildren(tableBody)
}

async function getHistory() {
  let result = await chrome.storage.local.get("history")
  return result.history
}

async function getApiKey() {
  let result = await chrome.storage.local.get("apiKey")
  return result.apiKey
}

function buildRowFromSummary(summary) {
  let urlCell = builtTableData(summary.url)
  let textCell = builtTableData(summary.text)
  let summaryCell = builtTableData(summary.summary)

  let row = document.createElement("tr")
  row.appendChild(urlCell)
  row.appendChild(textCell)
  row.appendChild(summaryCell)
  return row
}

function buildHeaderRow() {
  let url = buildTableHeader("URL")
  let text = buildTableHeader("Text")
  let summary = buildTableHeader("Summary")

  let row = document.createElement("tr")
  row.appendChild(url)
  row.appendChild(text)
  row.appendChild(summary)
  return row
}

function buildTableHeader(content) {
  let header = document.createElement("th")
  header.innerHTML = content
  return header
}

function builtTableData(content) {
  let data = document.createElement("td")
  data.innerHTML = content
  return data
}