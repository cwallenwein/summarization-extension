import React, { FC, useState, useEffect } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import { ApiOutlined } from "@ant-design/icons";
import Storage, { ISummary } from "../services/Storage";
import HuggingFace from "../services/Summarize";
import { Padding } from "./Style";
const { Paragraph } = Typography;

export const Settings: any = (props: any) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  //const [formValidationStatus, steFormValidationStatus] = useState<string>("")

  // Update displayed API key when it was changed in local storage
  useEffect(() => {
    const updateApiKey = async () => {
      const result = await Storage.getApiKey();

      if (result === undefined) {
        console.error("No API key specified yet");
        return;
      } else {
        setApiKey(result);
      }
    };

    updateApiKey().catch(console.error);
  });

  // When the user changes the API key, save it to local storage
  const onFinish = async (values: any) => {
    const newApiKey = values.apiKey;
    await setApiKey(newApiKey);
    await Storage.setApiKey(newApiKey);
    const apiKeyValid: any = await chrome.runtime.sendMessage({
      type: "api_key_validation_request",
      apiKey: newApiKey,
    });
    if (apiKeyValid.type === "success") {
      messageApi.success({ content: "Successfully updated the API Key" });
    } else {
      messageApi.warning({ content: apiKeyValid.message });
    }
  };

  return (
    <>
      {contextHolder}
      <Padding>
        <Paragraph strong>Settings</Paragraph>
        <Paragraph>Current API Key: {apiKey}</Paragraph>
        <Form onFinish={onFinish}>
          <Form.Item name="apiKey">
            <Input
              prefix={<ApiOutlined />}
              value={apiKey}
              placeholder="API Key"
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Padding>
    </>
  );
};
