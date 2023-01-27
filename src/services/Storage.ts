

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

    // Gets allSummaries from chrome storage
    static async getAllSummaries() {
        try {
            let result = await chrome.storage.local.get("allSummaries")
            return result.allSummaries
        } catch (error) {
            console.error(error)
        }
    }


    // Saves the summary to chrome storage
    static async saveSummary(summary: ISummary) {
        try {
            let allSummaries = await Storage.getAllSummaries()
            if (allSummaries) {
                allSummaries.push(summary)
            } else {
                throw new Error("No summary returned")
            }
            await Storage.setAllSummaries(allSummaries)
        } catch (error) {
            console.error(error)
        }
    }

    // Set the allSummaries in chrome storage
    static async setAllSummaries(allSummaries: ISummary[]) {
        try {
            await chrome.storage.local.set({ allSummaries })
        } catch (error) {
            console.error(error)
        }
    }

    static async deleteSummary(summary: ISummary) {
        try {
            let allSummaries = await Storage.getAllSummaries()
            if (allSummaries) {
                allSummaries = allSummaries.filter((s: ISummary) => (s.url !== summary.url) || (s.text !== summary.text) || (s.summary !== summary.summary))
            } else {
                throw new Error("No summary returned")
            }
            await Storage.setAllSummaries(allSummaries)
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