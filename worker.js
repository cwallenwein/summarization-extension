chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.runtime.onMessage.addListener(handleMessage);

// Initializes the extension by setting the initial values for history and apiKey in chrome storage
async function initializeExtension() {
  try {
    await chrome.storage.local.set({
      allSummaries: [],
      apiKey: undefined,
    });
  } catch (error) {
    console.error(error);
  }
}

// TODO Resolve confusion. Currently a summary can be the text of the summary or an object containing the summary and other information
// Approaches: call the summary including all information summaryObject, summaryData or sumamryInfo
//              call the text of the summary summaryText

// Handles incoming messages and calls the appropriate function based on message type
function handleMessage(message, _, sendResponse) {
  try {
    if (message.type === "summarization_request") {
      handleSummarizationRequest(message, sendResponse);
      return true;
    } else if (message.type === "api_key_validation_request") {
      handleApiKeyValidationRequest(message, sendResponse);
      return true;
    } else {
      sendResponse({ type: "error", message: "Unknown message type" });
    }
  } catch (error) {
    console.error(error);
    sendResponse({ type: "error", message: error.message });
  }
}

// Checks
async function handleApiKeyValidationRequest(message, sendResponse) {
  // check internet connection
  const connectedToInternet = isConnectedToInternet(sendResponse);
  if (!connectedToInternet) return;

  // check if api key is valid
  try {
    const apiKey = message.apiKey;
    const apiKeyValid = await Cohere.isApiKeyValid(apiKey);
    console.log("API Key Valid: " + apiKeyValid);
    if (apiKeyValid) {
      return sendResponse({ type: "success" });
    } else {
      return sendResponse({ type: "error", message: "Invalid API Key" });
    }
  } catch (error) {
    console.error(error);
    return sendResponse({ type: "error", message: error.message });
  }
}

async function handleSummarizationRequest(message, sendResponse) {
  let url = message.url;
  let tabId = message.tabId;
  let tabTitle = message.tabTitle;

  const connectedToInternet = isConnectedToInternet(sendResponse);
  if (!connectedToInternet) return;

  try {
    let text = await getSelectedText(tabId);
    if (text) {
      summarizeText({ text, url, tabTitle, sendResponse });
    } else {
      sendResponse({ type: "error", message: "No text selected" });
    }
  } catch (error) {
    console.error(error);
    sendResponse({ type: "error", message: error.message });
  }
}

async function summarizeText({ text, url, tabTitle, sendResponse }) {
  const timestamp = new Date().getTime();
  try {
    await Storage.createLoadingSummary({
      timestamp,
      url,
      tabTitle,
      text,
    });

    let summary = await Cohere.summarize(text);
    await Storage.updateLoadingSummary({
      timestamp: timestamp,
      summary: summary,
    });
    sendResponse({ type: "success" });
  } catch (error) {
    await Storage.deleteSummaryByTimestamp(timestamp);
    sendResponse({ type: "error", message: error.message });
    console.error(error);
  }
}

class Cohere {
  // TODO: if the stop sequence was used in the prompt, filter it out
  static async summarize(text) {
    console.log("Text to summarize: " + text);
    const response = await this.sendRequest(text);
    if (response?.ok) {
      return await this.handleSuccessfulRequest(response);
    } else {
      await this.handleFailedRequest(response);
    }
  }

  static async handleSuccessfulRequest(response) {
    let result = await response.json();
    if (result["text"]) {
      let summary = result["text"];
      console.log("Summary before: " + summary);
      summary = summary.replace("--", "");
      console.log("Summary after: " + summary);
      return summary;
    } else {
      console.error("Cohere API didn't return a summary");
    }
  }
  static async handleFailedRequest(response) {
    const status = response?.status;
    // TODO: not all 4xx errors are invalid api keys
    if (status >= 400 && status < 500) {
      throw Error("Invalid Bearer Token");
    } else {
      throw Error(`HTTP Response Code: ${response?.status}`);
    }
  }

  static async isApiKeyValid(apiKey) {
    const response = await this.sendRequest("", apiKey);
    if (response?.ok) {
      return true;
    } else {
      const status = response?.status;
      if (status == 401 || status == 403) {
        return false;
      } else {
        throw new Error(`HTTP Response Code: ${status}`);
      }
    }
  }

  static async sendRequest(text) {
    const url = "https://api.cohere.ai/generate";
    const options = await this.generateOptions(text);
    let response = await fetch(url, options);
    return response;
  }

  static async generateOptions(text) {
    const apiKey = "Bearer " + (await ApiKey.get());
    const prompt = this.generatePrompt(text);
    const body = JSON.stringify({
      model: "xlarge",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.9,
      stop_sequences: ["--"],
    });
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: apiKey,
      },
      body: body,
    };
    return options;
  }

  static generatePrompt(selectedText) {
    const intro = "This program summarizes articles from the internet.\n\n";
    const example1 =
      "Passage: Is Wordle getting tougher to solve? Players seem to be convinced that the game has gotten harder in recent weeks ever since The New York Times bought it from developer Josh Wardle in late January. The Times has come forward and shared that this likely isn't the case. That said, the NYT did mess with the back end code a bit, removing some offensive and sexual language, as well as some obscure words There is a viral thread claiming that a confirmation bias was at play. One Twitter user went so far as to claim the game has gone to 'the dusty section of the dictionary' to find its latest words.\n\nTLDR: Wordle has not gotten more difficult to solve.\n--\n";
    const example2 =
      "Passage: ArtificialIvan, a seven-year-old, London-based payment and expense management software company, has raised $190 million in Series C funding led by ARG Global, with participation from D9 Capital Group and Boulder Capital. Earlier backers also joined the round, including Hilton Group, Roxanne Capital, Paved Roads Ventures, Brook Partners, and Plato Capital.\n\nTLDR: ArtificialIvan has raised $190 million in Series C funding.\n--\n";
    const prompt =
      intro + example1 + example2 + "Passage: " + selectedText + "\n\nTLDR:";
    return prompt;
  }
}

// Retrieves the selected text on the current tab
async function getSelectedText(tabId) {
  try {
    let injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => window.getSelection().toString(),
    });
    if (injectionResults && injectionResults.length >= 1) {
      let selection = injectionResults[0].result;
      return selection;
    } else {
      throw new Error("Unknown error");
    }
  } catch (error) {
    if (
      error.message.includes("chrome:// URL") ||
      error.message.includes("edge:// URL")
    ) {
      throw new Error("Unable to select text in browser-internal pages");
    } else {
      console.error(error);
      throw new Error("Unknown error");
    }
  }
}

function isConnectedToInternet(sendResponse) {
  if (!navigator.onLine) {
    sendResponse({ type: "error", message: "Not connected to the internet" });
    return false;
  } else {
    return true;
  }
}

// Gets the API key from chrome storage
class ApiKey {
  // Retrieves the API key from chrome storage
  static async get() {
    try {
      let result = await chrome.storage.local.get("apiKey");
      let apiKey = result.apiKey;
      return apiKey;
    } catch (error) {
      console.error(error);
    }
  }
}

// Saves, gets and deletes summaries from chrome storage
class Storage {
  // Gets allSummaries from chrome storage
  static async getAllSummaries() {
    try {
      let result = await chrome.storage.local.get("allSummaries");
      return result.allSummaries;
    } catch (error) {
      console.error(error);
    }
  }

  // Set the allSummaries in chrome storage
  static async setAllSummaries(allSummaries) {
    try {
      await chrome.storage.local.set({ allSummaries });
    } catch (error) {
      console.error(error);
    }
  }

  // Deletes a summary with a specific timestamp from chrome storage
  static async deleteSummaryByTimestamp(timestamp) {
    try {
      let allSummaries = await this.getAllSummaries();
      if (allSummaries) {
        allSummaries = allSummaries.filter((s) => s.timestamp !== timestamp);
        await this.setAllSummaries(allSummaries);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Saves a summary to chrome storage
  static async saveSummary(summary) {
    try {
      let allSummaries = await this.getAllSummaries();
      if (allSummaries) {
        allSummaries.push(summary);
      } else {
        throw new Error("No summary returned");
      }
      await this.setAllSummaries(allSummaries);
    } catch (error) {
      console.error(error);
    }
  }

  // Saves the summary to chrome storage
  static async createLoadingSummary({ timestamp, url, tabTitle, text }) {
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
  static async updateLoadingSummary({ timestamp, summary }) {
    let allSummaries = await this.getAllSummaries();
    let index = allSummaries.findIndex((item) => {
      return item.timestamp === timestamp;
    });
    if (index === -1) {
      throw new Error("No summary found with the specified timestamp");
    }
    allSummaries[index].summary = summary;
    allSummaries[index].loading = false;
    await this.setAllSummaries(allSummaries);
  }
}
