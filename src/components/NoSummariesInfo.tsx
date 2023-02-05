import { FC, useEffect, useState } from "react";
import { Typography, Steps, Space } from "antd";
import Storage from "../services/Storage";
import WorkerRequestSender from "../services/WorkerRequestSender";
import { LoadingOutlined } from "@ant-design/icons";

const { Paragraph, Link, Text } = Typography;

export const NoSummariesInfo: any = (props: any) => {
  const [apiKeyValidating, setApiKeyValidating] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [current, setCurrent] = useState<number>(0);
  const [isTextSelected, setIsTextSelected] = useState<boolean>(false);

  // On mount, check if text is currently being selected
  useEffect(() => {
    const checkIfTextIsSelected = async () => {
      const result = await WorkerRequestSender.requestSelectionState();
      const isTextSelected = result.isTextSelected;
      if (isTextSelected !== undefined) {
        setIsTextSelected(isTextSelected);
        console.log("isTextSelected: ", isTextSelected);
      }
    };
    checkIfTextIsSelected();
  }, []);

  // initialize apiKey and apiKeyValidating when this component is mounted
  useEffect(() => {
    const initializeApiKey = async () => {
      const apiKey = await Storage.getApiKey();
      const isApiKeyValidating: boolean = await Storage.getApiKeyValidating();
      setApiKeyValidating(isApiKeyValidating);
      if (apiKey) {
        setApiKey(apiKey);
      }
    };
    initializeApiKey();
  }, []);

  // add listener for apiKey on component mount
  useEffect(() => {
    const listener = () => {
      chrome.storage.sync.get(["apiKey"], (result) => {
        setApiKey(result.apiKey);
      });
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  // add listener for apiKeyValidating on component mount
  useEffect(() => {
    const listener = () => {
      chrome.storage.sync.get(["apiKeyValidating"], (result) => {
        setApiKeyValidating(result.apiKeyValidating);
      });
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  // set current step of helper text
  useEffect(() => {
    if (apiKeyValidating) {
      setCurrent(0);
    } else {
      if (apiKey !== "") {
        if (isTextSelected) {
          setCurrent(2);
        } else {
          setCurrent(1);
        }
      } else {
        setCurrent(0);
      }
    }
  }, [apiKeyValidating, apiKey, isTextSelected]);

  return (
    <>
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 300, height: 180 }}>
          <Paragraph strong>Generate your first Summary!</Paragraph>
          <Steps
            direction="vertical"
            current={current}
            items={[
              {
                title: (
                  <Text>
                    Set the API Key in{" "}
                    <a
                      onClick={() => {
                        props.setActiveTab("settings");
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Settings
                    </a>
                    ⚙️
                  </Text>
                ),
                icon: apiKeyValidating ? <LoadingOutlined /> : null,
              },
              {
                title: <Text> Highlight Text on any Website ✍️ </Text>,
              },
              {
                title: <Text> Click on 'Summarize' 👇 </Text>,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};
