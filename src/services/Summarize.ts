import Storage from "./Storage";

export default class HuggingFace {
  // Summarizes the text using the Hugging Face API
  public static async summarize(apiKey: string, text: string) {
    try {
      const response = await this.query(apiKey || "", text);
      if (response?.ok) {
        let result = await response.json();
        if (result && result.length >= 1) {
          let summary = result[0]["summary_text"];
          console.log(JSON.stringify(summary));
        } else {
          console.log("No summary returned from API");
        }
      } else {
        if (response?.status == 400) {
          console.log("Invalid Bearer Token");
        } else {
          console.log(`HTTP Response Code: ${response?.status}`);
        }
        return response;
      }
    } catch (error) {
      console.error(error);
    }
  }

  public static async isApiKeyValid(apiKey: string): Promise<boolean> {
    const response = await this.query(apiKey, "");
    if (response?.ok) {
      return true;
    } else {
      if (response?.status === 400) {
        return false;
      } else {
        console.error(response);
        return false;
      }
    }
  }

  // Queries the Hugging Face API
  public static async query(apiKey: string, request: any) {
    apiKey = "Bearer " + apiKey || "";
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          headers: { Authorization: apiKey },
          method: "POST",
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}
