chrome.runtime.onInstalled.addListener(initializeExtension)
chrome.runtime.onMessage.addListener(handleMessage)

// Initializes the extension by setting the initial values for history and apiKey in chrome storage
async function initializeExtension() {
    try {
        await chrome.storage.local.set({
            history: [
                {
                    url: "https://us.cnn.com/2023/01/19/tech/chatgpt-future-davos",
                    text: "This is the first test text",
                    summary: "Jeff Maggioncalda, the CEO of online learning provider Coursera, said that when he first tried ChatGPT, he was “dumbstruck.” Now, it’s part of his daily routine.He uses the powerful new AI chatbot tool to bang out emails. He uses it to craft speeches “in a friendly, upbeat, authoritative tone with mixed cadence.” He even uses it to help break down big strategic questions — such as how Coursera should approach incorporating artificial intelligence tools like ChatGPT into its platform.“I use it as a writing assistant and as a thought partner,” Maggioncalda told CNN."
                },
                {
                    url: "google.com",
                    text: "This is the second test text",
                    summary: "Aunt Nicki is hard of hearing. Although there are many enhanced listening devices available to help her, such as an Assistive Living amplifier or a closed captioning screen that sits in a cup holder, she tells me they don’t work well enough. When I recently tried on the new “smart caption glasses” at the Royal National Theatre, I had her on my mind. The theater is testing a pilot program for the technology for all performances of Hadestown and War Horse through October. It plans to make the glasses available for all of its performances during the 2019 season."
                },
                {
                    url: "google.com",
                    text: "This the third test text",
                    summary: "Chinese tech giant Baidu revealed its plan to roll out Apollo RT6, an autonomous self-driving car with a detachable steering wheel, even though Chinese authorities haven't approved the concept yet. In August, Baidu obtained the first permits to operate fully driverless robotaxis in two cities in China."
                },
                {
                    url: "google.com",
                    text: "This is the fourth test text",
                    summary: "Smith, who was managing 40 assistants to financial advisers at a bank in Atlanta, said most of her team performed well during the past year and were great about staying in touch with her. But the few who were not exhausted her."
                }
            ],
            apiKey: undefined
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
        let text = await getSelectedText(tabId)
        if (text) {
            let summary = await summarizeTextWithHuggingFace(text)
            await saveSummary(url, text, summary)
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
async function saveSummary(url, text, summary) {
    let history = await getSummaryHistory()
    history.push({
        url: url,
        text: text,
        summary: summary
    })
    await setSummaryHistory(history)
}

// Summarizes the text using the Hugging Face API
async function summarizeTextWithHuggingFace(text) {
    try {
        let result = await queryHuggingFace({ "inputs": text })
        console.log("result", result)
        if (result && result.length >= 1) {
            let summary = result[0]["summary_text"]
            return JSON.stringify(summary);
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