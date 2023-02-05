import React, { FC, useState, useEffect } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import { ApiOutlined } from "@ant-design/icons";
import Storage, { ISummary } from "../services/Storage";
import WorkerRequestSender from "../services/WorkerRequestSender";

import { Padding } from "./Style";
const { Paragraph } = Typography;

export const Settings: any = (props: any) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  // TODO: add preloader
  // When the user changes the API key, save it to local storage
  const onFinish = async (values: any) => {
    const newApiKey = values.apiKey;
    await setApiKey(newApiKey);
    const apiKeyValid: any = await WorkerRequestSender.requestApiKeyValidation(
      newApiKey
    );
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

        <Form onFinish={onFinish}>
          <Form.Item name="apiKey">
            <Input.Password
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
