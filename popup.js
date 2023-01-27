document.addEventListener("DOMContentLoaded", buildPopup)
chrome.storage.onChanged.addListener(handleStorageUpdate)

// Builds all elements of the popup
async function buildPopup() {
  addSummarizeButtonEventListener()
  await buildAllSummariesTable()
  await buildApiKeyForm()
  await displayCurrentApiKey()
}

// Handles updated allSummaries-value in chrome storage
async function handleStorageUpdate(changes, _) {
  for (key in changes) {
    if (key === "allSummaries") {
      await buildAllSummariesTable()
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
      await displayCurrentApiKey()
    })
  } catch (error) {
    console.error(error)
  }
}

async function displayCurrentApiKey() {
  try {
    let apiKey = await getApiKey()
    document.getElementById("current-api-key").innerText = "Current API Key: " + apiKey
  } catch {
    console.error(error)
  }
}

// Retrieves all summaries from chrome storage
async function getAllSummaries() {
  try {
    let result = await chrome.storage.local.get("allSummaries")
    return result.allSummaries
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

// Builds the a table of all summaries
async function buildAllSummariesTable() {
  try {
    let allSummaries = await getAllSummaries()
    let headerRow = buildHeaderRow()

    let tableBody = document.createElement("tbody")
    tableBody.appendChild(headerRow)

    for (let i = allSummaries.length - 1; i >= 0; i--) {
      let row = buildRowFromSummary(allSummaries[i])
      tableBody.appendChild(row)
    }

    let table = document.getElementById("summary-table")
    table.replaceChildren(tableBody)

  } catch (error) {
    console.error(error)
  }
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

// Builds the header row for the allSummaries-table
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