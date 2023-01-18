// when popup is created initialize chrome.storage summarization history
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        history: [
            {
                url: "https://google.com",
                summary: "This is a summary"
            },{
                url: "https://youtube.com",
                summary: "This is another summary"
            }
        ]
    })
})

// listen to requests (from popup)
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "summarization_request"){
        let tabId = message.tabId
        console.log("Summarization request from tab", tabId)
        let text = await getSelectedText(tabId)
        console.log(text)
    }
})

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