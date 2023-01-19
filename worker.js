chrome.runtime.onInstalled.addListener(initializeExtension)
chrome.runtime.onMessage.addListener(handleMessage)

async function initializeExtension() {
    await chrome.storage.local.set({
        history: [],
        apiKey: undefined
    })
}

async function handleMessage(message, sender, sendResponse) {
    if (message.type === "summarization_request") {
        let tabId = message.tabId
        let url = message.url
        let text = await getSelectedText(tabId)
        if (text) {
            let summary = await summarizeText(text)
            await saveSummary(url, text, summary)
        } else {
            console.log("No text selected")
        }
    }
}

async function getSelectedText(tabId) {
    let injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => window.getSelection().toString(),
    })
    if (injectionResults && injectionResults.length >= 1) {
        let selection = injectionResults[0].result
        return selection
    }
    else return ""
}

async function summarizeText(text) {
    return await summarizeTextWithHuggingFace(text)
}

async function saveSummary(url, text, summary) {
    let history = await getSummaryHistory()
    history.push({
        url: url,
        text: text,
        summary: summary
    })
    await setSummaryHistory(history)

}

async function summarizeTextWithHuggingFace(text) {
    let result = await queryHuggingFace({ "inputs": text })
    if (result && result.length >= 1) {
        let summary = result[0]["summary_text"]
        return JSON.stringify(summary);
    }
    else return "Error"
}

async function queryHuggingFace(request) {
    let apiKey = await getApiKey()
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

async function getApiKey() {
    let result = await chrome.storage.local.get("apiKey")
    return result.apiKey
}

async function getSummaryHistory() {
    let result = await chrome.storage.local.get("history")
    return result.history;
}

async function setSummaryHistory(newHistory) {
    await chrome.storage.local.set({
        history: newHistory
    })
}