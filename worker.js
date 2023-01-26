chrome.runtime.onInstalled.addListener(initializeExtension)
chrome.runtime.onMessage.addListener(handleMessage)

// Initializes the extension by setting the initial values for history and apiKey in chrome storage
async function initializeExtension() {
    try {
        await chrome.storage.local.set({
            history: [],
            apiKey: "Bearer hf_"
        })
    } catch (error) {
        console.error(error)
    }
}

// Handles incoming messages and calls the appropriate function based on message type
async function handleMessage(message, sender, sendResponse) {
    if (message.type === "summarization_request") {
        let tabId = message.tabId
        let url = message.url
        let tabTitle = message.tabTitle
        let text = await getSelectedText(tabId)
        if (text) {
            let summary = await summarizeTextWithHuggingFace(text)
            await saveSummary(url = url, tabTitle = tabTitle, text = text, summary = summary)
        } else {
            console.error("No text selected")
        }
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
        }
        else return ""
    } catch (error) {
        console.error(error)
    }
}


// Saves the summary to chrome storage
async function saveSummary(url, tabTitle, text, summary) {
    let history = await getSummaryHistory()
    history.push({
        url: url,
        tabTitle: tabTitle,
        text: text,
        summary: summary
    })
    await setSummaryHistory(history)
}

// Summarizes the text using the Hugging Face API
async function summarizeTextWithHuggingFace(text) {
    try {
        let result = await queryHuggingFace({ "inputs": text })
        if (result && result.length >= 1) {
            let summary = result[0]["summary_text"]
            return summary;
        } else {
            throw new Error("No summary returned")
        }
    } catch (error) {
        console.error(error)
    }
}

// Queries the Hugging Face API
async function queryHuggingFace(request) {
    try {
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

// Retrieves the summary history from chrome storage
async function getSummaryHistory() {
    try {
        let result = await chrome.storage.local.get("history")
        return result.history;
    } catch (error) {
        console.error(error)
    }
}

// Sets the summary history in chrome storage
async function setSummaryHistory(newHistory) {
    try {
        await chrome.storage.local.set({
            history: newHistory
        })
    } catch (error) {
        console.error(error)
    }
}