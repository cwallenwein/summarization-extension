chrome.runtime.onInstalled.addListener(initializeExtension)
chrome.runtime.onMessage.addListener(handleMessage)

// Initializes the extension by setting the initial values for history and apiKey in chrome storage
async function initializeExtension() {
    try {
        await chrome.storage.local.set({
            allSummaries: [
        ],
            apiKey: "Bearer hf_"
        })
    } catch (error) {
        console.error(error)
    }
}

// TODO Resolve confusion. Currently a summary can be the text of the summary or an object containing the summary and other information
// Approaches: call the summary including all information summaryObject, summaryData or sumamryInfo
//              call the text of the summary summaryText

// Handles incoming messages and calls the appropriate function based on message type
function handleMessage(message, sender, sendResponse) {
    if (message.type === "summarization_request") {
        handleSummarizationRequest(message, sendResponse)
        return true
    } else {
        sendResponse({ type: "error", message: "Unknown message type" })
    }
}

async function handleSummarizationRequest(message, sendResponse) {
        let tabId = message.tabId
    try {
        let text = await getSelectedText(tabId)
        if (text) {
        let url = message.url
        let tabTitle = message.tabTitle
            let timestamp = (new Date).getTime()

            if (!navigator.onLine) {
                sendResponse({ type: "error", message: "Not connected to the internet" })
                return
            }
            try {
                await createLoadingSummary({ timestamp: timestamp, url: url, tabTitle: tabTitle, text: text })
            let summary = await summarizeTextWithHuggingFace(text)
                await updateLoadingSummary({ timestamp: timestamp, summary: summary })
                sendResponse({ type: "success" })
            } catch (error) {
                await deleteSummaryByTimestamp(timestamp)
                sendResponse({ type: "eror", message: "Unknown error" })
            }
        } else {
            sendResponse({ type: "error", message: "No text selected" })
        }
    } catch (error) {
        sendResponse({ type: "error", message: error.message })
    }
}

async function deleteSummaryByTimestamp(timestamp) {
    let allSummaries = await getAllSummaries()
    if (allSummaries) {
        allSummaries = allSummaries.filter((s) => (s.timestamp !== timestamp))
        await setAllSummaries(allSummaries)
    }
}

// Retrieves the selected text on the current tab
async function getSelectedText(tabId) {
    try {
        let injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => window.getSelection().toString(),
        })
        if (injectionResults && injectionResults.length >= 1) {
            let selection = injectionResults[0].result
            return selection
        } else {
            throw new Error("Unknown error")
        }
    } catch (error) {
        if (error.message.includes("chrome:// URL") || error.message.includes("edge:// URL")) {
            throw new Error("Unable to select text in browser-internal pages")
        } else {
            throw new Error("Unknown error")
        }
    }
}


// Saves the summary to chrome storage
async function createLoadingSummary({ timestamp, url, tabTitle, text }) {
    // TODO this doesn not only contain summaries but also more information about them, how do I call it
    let allSummaries = await getAllSummaries()
    allSummaries.push({
        timestamp: timestamp,
        url: url,
        tabTitle: tabTitle,
        text: text,
        summary: "",
        loading: true
    })
    await setAllSummaries(allSummaries)
}

async function updateLoadingSummary({ timestamp, summary }) {
    let allSummaries = await getAllSummaries()
    let index = allSummaries.findIndex((item) => {
        return item.timestamp === timestamp
    })
    if (index === -1) {
        throw new Error("Unknown error")
    }
    allSummaries[index].summary = summary
    allSummaries[index].loading = false
    await setAllSummaries(allSummaries)
}

// Summarizes the text using the Hugging Face API
async function summarizeTextWithHuggingFace(text) {
        let result = await queryHuggingFace({ "inputs": text })
        if (result && result.length >= 1) {
            let summary = result[0]["summary_text"]
            return summary;
        } else {
            throw new Error("No summary returned")
    }
}

// Queries the Hugging Face API
async function queryHuggingFace(request) {
        let apiKey = await getApiKey()
        console.log("apiKey", apiKey)
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                headers: { Authorization: apiKey },
                method: "POST",
                body: JSON.stringify(request),
            }
        );
        const result = await response.json();
        return result;
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

// Retrieves the all summaries from chrome storage
async function getAllSummaries() {
    try {
        let result = await chrome.storage.local.get("allSummaries")
        return result.allSummaries;
    } catch (error) {
        console.error(error)
    }
}

// Sets the allSummaries in chrome storage
async function setAllSummaries(allSummaries) {
    try {
        await chrome.storage.local.set({
            allSummaries: allSummaries
        })
    } catch (error) {
        console.error(error)
    }
}