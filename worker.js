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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "summarization_request"){
        let tabId = message.tabId
        console.log("Summarization request from tab", tabId)
    }
})