// when popup is created initialize chrome.storage summarization history
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        history: [
            /*{
                url: "https://google.com",
                text: "This is a long text",
                summary: "This is a summary"
            },{
                url: "https://youtube.com",
                text: "This is another long text",
                summary: "This is another summary"
            }*/
        ],
        apiKey: undefined
    })
})

// listen to requests (from popup)
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "summarization_request"){
        let tabId = message.tabId
        let url = message.url
        let text = await getSelectedText(tabId)
        // TODO: check if no text is selected
        let summary = await summarizeText(text)
        await saveSummaryToSummaryHistory(url, text, summary)
    }
})

async function saveSummaryToSummaryHistory(url, text, summary){
    let history = await getSummaryHistory()
    history.push({
        url: url,
        text: text,
        summary: summary
    })
    await overwriteSummaryHistory(history)

}

async function overwriteSummaryHistory(newHistory){
    await chrome.storage.local.set({
        history: newHistory
    })
}

async function getSummaryHistory(){
    let result  = await chrome.storage.local.get("history")
    return result.history;
}

async function getSelectedText(tabId){
    let injectionResults = await chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: () => window.getSelection().toString(),
    })
    if(injectionResults && injectionResults.length >= 1){
        let selection = injectionResults[0].result
        return selection
    }
    else return ""
}

async function summarizeText(text){
    return await summarizeTextWithHuggingFace(text)
}

async function summarizeTextWithHuggingFace(text){
    let result = await queryHuggingFace({"inputs": text})
    if(result && result.length >= 1){
        let summary = result[0]["summary_text"]
        return JSON.stringify(summary);
    }
    else return "Error"
}

async function queryHuggingFace(data) {
    let apiKey = await getApiKey()
    console.log("query hugging face with api key", apiKey)
	const response = await fetch(
		"https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
		{
			headers: { Authorization: apiKey},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

async function getApiKey(){
    let result = await chrome.storage.local.get("apiKey")
    return result.apiKey
  }