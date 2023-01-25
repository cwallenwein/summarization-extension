

// Store and retrieve data from chrome storage
export default class Storage {
    // Retrieves the API key from chrome storage
    static async getApiKey() {
        try {
            let result = await chrome.storage.local.get("apiKey")
            let apiKey: string = result.apiKey
            return apiKey
        } catch (error) {
            console.error(error)
        }
    }

    // Set the API key to chrome storage
    static async setApiKey(apiKey: string) {
        try {
            await chrome.storage.local.set({ apiKey })
        } catch (error) {
            console.error(error)
        }
    }

    // Gets the history of summaries from chrome storage
    static async getHistory() {
        try {
            let result = await chrome.storage.local.get("history")
            return result.history
        } catch (error) {
            console.error(error)
        }
    }


    // Saves the summary to chrome storage
    static async saveSummary(summary: ISummary) {
        try {
            let history = await Storage.getHistory()
            if (history) {
                history.push(summary)
            } else {
                throw new Error("No summary returned")
            }
            await Storage.setHistory(history)
        } catch (error) {
            console.error(error)
        }
    }

    // Set the summary history to chrome storage
    static async setHistory(history: ISummary[]) {
        try {
            await chrome.storage.local.set({ history })
        } catch (error) {
            console.error(error)
        }
    }

    static async deleteSummary(summary: ISummary) {
        try {
            let history = await Storage.getHistory()
            if (history) {
                history = history.filter((s: ISummary) => (s.url !== summary.url) || (s.text !== summary.text) || (s.summary !== summary.summary))
            } else {
                throw new Error("No summary returned")
            }
            await Storage.setHistory(history)
        } catch (error) {
            console.error(error)
        }
    }

}

export interface ISummary {
    url: string,
    text: string,
    summary: string
}