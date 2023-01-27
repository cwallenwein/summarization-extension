import React, { FC, useState } from 'react';
import { Button, Tooltip, message } from 'antd';

export const RequestSummaryButton: FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();

    // Sends a message to the worker script to summarize the active tab
    async function requestSummary() {
        let activeTab = await getActiveTab();
        if (activeTab && activeTab.id && activeTab.url) {
            let tabId: number = activeTab.id
            let url: string = activeTab.url
            let tabTitle: string = activeTab.title || ""
            await sendSummarizationRequest(url, tabId, tabTitle)
        } else {
            console.error("No active tab")
        }
    }

    // Sends a message to the worker script to summarize the highlighted text in the active tab
    async function sendSummarizationRequest(url: string, tabId: number, tabTitle: string) {
        try {
            const response = await chrome.runtime.sendMessage({ type: "summarization_request", url: url, tabId: tabId, tabTitle: tabTitle })
            if (response.type === "error") {
                messageApi.warning({ content: response.message });

            }
        } catch (error) {
            console.error(error)
        }
    }

    // Retrieves the active tab
    async function getActiveTab() {
        try {
            let queryOptions = { active: true, lastFocusedWindow: true };
            // `tab` will either be a `tabs.Tab` instance or `undefined`.
            let [tab] = await chrome.tabs.query(queryOptions);
            return tab;
        } catch (error) {
            console.error(error)
        }
    }

    const onClick = async () => {
        setLoading(true)
        await requestSummary()
    }

    return (
        <>
            {contextHolder}
            < Tooltip title="Summarize Highlighted Text" >
                <Button type="primary" onClick={onClick} block style={{ height: 60, fontSize: 16, borderRadius: 0 }}>
                    Summarize
                </Button>
            </Tooltip >
        </>
    )
}