export default class WorkerRequestSender {
  // Sends a message to the worker script to summarize the currently highlighted text
  static async requestSummary() {
    try{
      let activeTab = await this.getActiveTab();
      if (activeTab && activeTab.id) {
        let tabId: number = activeTab.id;
        let url: string = activeTab.url || "";
        let tabTitle: string = activeTab.title || "";
        const result = await this.sendSummarizationRequestToWorker(
          tabId,
          url,
          tabTitle
        );
        return result;
      } else {
        console.error("No active tab");
      }
    }catch(error){
      console.error(error)
    }
    
  }

  static async requestApiKeyValidation(apiKey: string) {
    try{
      const message: IApiKeyValidationRequest = {
        type: "api_key_validation_request",
        apiKey: apiKey,
      };
      const apiKeyValid: any = await this.sendMessageToWorker(message);
      return apiKeyValid;
    }catch(error){
      console.error(error)
    }
    
  }

  static async requestSelectionState() {
    try{
      const activeTab: chrome.tabs.Tab | undefined = await this.getActiveTab();
      if (activeTab && activeTab.id) {
        const tabId: number = activeTab.id;
        const message: IGetSelectionStateRequest = {
          type: "get_selection_state_request",
          tabId: tabId,
        };
        const isTextSelected: any = await this.sendMessageToWorker(message);
        return isTextSelected;
      }
    }catch(error){
      console.error(error)
    }
  }

  // Builds the message for the summarization request and sends it to the worker script
  private static async sendSummarizationRequestToWorker(
    tabId: number,
    url: string,
    tabTitle: string
  ) {
    const message: ISummarizationRequest = {
      type: "summarization_request",
      url: url,
      tabId: tabId,
      tabTitle: tabTitle,
    };

    return await this.sendMessageToWorker(message);
  }

  private static async sendMessageToWorker(
    message:
      | ISummarizationRequest
      | IApiKeyValidationRequest
      | IGetSelectionStateRequest
  ) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      if (response.type === "error") {
        console.error(response.error);
      } else {
        return response;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Retrieves the active tab
  private static async getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
    try {
      let queryOptions = { active: true, lastFocusedWindow: true };
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      let [tab] = await chrome.tabs.query(queryOptions);
      return tab;
    } catch (error) {
      console.error(error);
    }
  }
}

interface ISummarizationRequest {
  type: "summarization_request";
  url: string;
  tabId: number;
  tabTitle: string;
}

interface IApiKeyValidationRequest {
  type: "api_key_validation_request";
  apiKey: string;
}

interface IGetSelectionStateRequest {
  type: "get_selection_state_request";
  tabId: number;
}
