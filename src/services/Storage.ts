// Store and retrieve data from chrome storage
export default class Storage {
  // Retrieves the API key from chrome storage
  static async getApiKey(): Promise<string | undefined> {
    try {
      let result = await chrome.storage.local.get("apiKey");
      let apiKey: string = result.apiKey;
      return apiKey;
    } catch (error) {
      console.error(error);
    }
  }

  // Set the API key to chrome storage
  static async setApiKey(apiKey: string) {
    try {
      await chrome.storage.local.set({ apiKey });
    } catch (error) {
      console.error(error);
    }
  }

  // Gets api key validation status
  static async getApiKeyValidating(): Promise<boolean> {
    try {
      let result = await chrome.storage.local.get("isApiKeyValidating");
      let isApiKeyValidating: boolean = result.isApiKeyValidating;
      return isApiKeyValidating;
    } catch (error) {
      console.error(error);
    }
    return false;
  }

  // Sets api key validation status in chrome storage
  static async setApiKeyValidating(isValidating: boolean) {
    try {
      await chrome.storage.local.set({ isApiKeyValidating: isValidating });
    } catch (error) {
      console.error(error);
    }
  }

  // Gets allSummaries from chrome storage
  static async getAllSummaries() {
    try {
      let result = await chrome.storage.local.get("allSummaries");
      return result.allSummaries;
    } catch (error) {
      console.error(error);
    }
  }

  // Saves the summary to chrome storage
  static async saveSummary(summary: ISummary) {
    try {
      let allSummaries = await Storage.getAllSummaries();
      if (allSummaries) {
        allSummaries.push(summary);
      } else {
        throw new Error("No summary returned");
      }
      await Storage.setAllSummaries(allSummaries);
    } catch (error) {
      console.error(error);
    }
  }

  // Set the allSummaries in chrome storage
  static async setAllSummaries(allSummaries: ISummary[]) {
    try {
      await chrome.storage.local.set({ allSummaries });
    } catch (error) {
      console.error(error);
    }
  }

  static async deleteSummaryByTimestamp(timestamp: number) {
    try {
      let allSummaries = await Storage.getAllSummaries();
      if (allSummaries) {
        allSummaries = allSummaries.filter(
          (s: ISummary) => s.timestamp !== timestamp
        );
        await Storage.setAllSummaries(allSummaries);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Saves the summary to chrome storage
  static async createLoadingSummary({ timestamp, url, tabTitle, text }: any) {
    const loadingSummary = {
      timestamp: timestamp,
      url: url,
      tabTitle: tabTitle,
      text: text,
      summary: "",
      loading: true,
    };
    await this.saveSummary(loadingSummary);
    return timestamp;
  }

  // Updates the summary in chrome storage
  static async updateLoadingSummary({ timestamp, summary }: any) {
    let allSummaries = await Storage.getAllSummaries();
    let index = allSummaries.findIndex((item: any) => {
      return item.timestamp === timestamp;
    });
    if (index === -1) {
      throw new Error("No summary found with the specified timestamp");
    }
    allSummaries[index].summary = summary;
    allSummaries[index].loading = false;
    await Storage.setAllSummaries(allSummaries);
  }
}

export interface ISummary {
  timestamp: number;
  url: string;
  tabTitle: string;
  text: string;
  summary: string;
  loading: boolean;
}
