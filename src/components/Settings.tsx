import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Input, Typography } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import Storage, { ISummary } from '../services/Storage';
import HuggingFace from "../services/Summarize"
import { Padding } from "./Style"
const { Paragraph } = Typography;

export const Settings: any = (props: any) => {
    const [apiKey, setApiKey] = useState<string>("")
    //const [formValidationStatus, steFormValidationStatus] = useState<string>("")

    // Update displayed API key when it was changed in local storage
    useEffect(() => {
        const updateApiKey = async () => {
            const result = await Storage.getApiKey()
            if (result) {
                setApiKey(result)
            } else {
                console.error("No API key found in local storage")
            }
        }

        updateApiKey().catch(console.error)
    })

    // When the user changes the API key, save it to local storage
    const onFinish = async (values: any) => {
        const newApiKey = values.apiKey
        await setApiKey(newApiKey)
        await Storage.setApiKey(newApiKey)
        console.log("New API Key: ", newApiKey)
        const apiKeyValid: boolean = await HuggingFace.isApiKeyValid(newApiKey);
        if (apiKeyValid) {

        } else {

        }
    }

    return (
        <Padding>
            <Paragraph strong>
                Settings
            </Paragraph>
            <Paragraph>
                Current API Key: {apiKey}
            </Paragraph>
            <Form onFinish={onFinish}>
                <Form.Item name="apiKey">
                    <Input prefix={<ApiOutlined />} value={apiKey} placeholder="API Key" />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit"  >
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Padding>
    )
}