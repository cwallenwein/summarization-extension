document.addEventListener("DOMContentLoaded", buildPopup)
chrome.storage.onChanged.addListener(handleStorageUpdate)

// Builds all elements of the popup
async function buildPopup() {
  addSummarizeButtonEventListener()
  await buildSummaryHistory()
  await buildApiKeyForm()
}

// Handles updated history in chrome storage
async function handleStorageUpdate(changes, _) {
  for (key in changes) {
    if (key === "history") {
      await buildSummaryHistory()
    }
  }
}

// Adds click event listener to the summarize button
function addSummarizeButtonEventListener() {
  try {
    document.getElementById("button-summarize").addEventListener("click", requestSummary);
  } catch (error) {
    console.log(error)
  }
}

// Sends a message to the worker script to summarize the active tab
async function requestSummary() {
  let activeTab = await getActiveTab();
  if (activeTab) {
    let tabId = activeTab.id
    let url = activeTab.url
    await sendSummarizationRequest(url, tabId)
  } else {
    console.error("No active tab")
  }
}

// Sends a message to the worker script to summarize the highlighted text in the active tab
async function sendSummarizationRequest(url, tabId) {
  try {
    await chrome.runtime.sendMessage({ type: "summarization_request", url: url, tabId: tabId })
  } catch (error) {
    console.error(error)
  }
}

// Retrieves the active tab
async function getActiveTab() {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  } catch (error) {
    console.error(error)
  }
}

// Adds submit event listener to the API key form
async function buildApiKeyForm() {
  try {
    let apiKeyForm = document.getElementById("api-key-form")
    apiKeyForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      let apiKey = document.getElementById("api-key-input").value
      await setApiKey(apiKey)
    })
  } catch (error) {
    console.error(error)
  }
}

// Retrieves the summary history from chrome storage
async function getHistory() {
  try {
    let result = await chrome.storage.local.get("history")
    return result.history
  } catch (error) {
    console.error(error)
  }
}

// Retrieves the API key from chrome storage
async function getApiKey() {
  try {
    let result = await chrome.storage.local.get("apiKey")
    return result.apiKey
  } catch (error) {
    console.error(error)
  }
}

async function setApiKey(apiKey) {
  try {
    await chrome.storage.local.set({ apiKey: apiKey })
  } catch (error) {
    console.error(error)
  }
}

// Builds the summary history table
async function buildSummaryHistory() {
  try {
    let history = await getHistory()
  } catch (error) {
    console.error(error)
  }

  let headerRow = buildHeaderRow()

  let tableBody = document.createElement("tbody")
  tableBody.appendChild(headerRow)

  for (let i = history.length - 1; i >= 0; i--) {
    let row = buildRowFromSummary(history[i])
    tableBody.appendChild(row)
  }
  try {
    let table = document.getElementById("summary-table")
  } catch (error) {
    console.error(error)
  }

  table.replaceChildren(tableBody)
}

// Builds a row from a summary object
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

// Builds the header row for the summary history table
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

// Builds a table header element
function buildTableHeader(content) {
  let header = document.createElement("th")
  header.innerHTML = content
  return header
}

// Builds a table data element
function builtTableData(content) {
  let data = document.createElement("td")
  data.innerHTML = content
  return data
}