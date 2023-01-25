import React, { FC, useState } from 'react';
import { Button, Tooltip, } from 'antd';

export const RequestSummaryButton: FC = () => {
    const [loading, setLoading] = useState<boolean>(false);

    // Sends a message to the worker script to summarize the active tab
    async function requestSummary() {
        let activeTab = await getActiveTab();
        if (activeTab && activeTab.id && activeTab.url) {
            let tabId: number = activeTab.id
            let url: string = activeTab.url
            await sendSummarizationRequest(url, tabId)
        } else {
            console.error("No active tab")
        }
    }

    // Sends a message to the worker script to summarize the highlighted text in the active tab
    async function sendSummarizationRequest(url: string, tabId: number) {
        try {
            await chrome.runtime.sendMessage({ type: "summarization_request", url: url, tabId: tabId })
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
        < Tooltip title="Summarize Highlighted Text" >
            <Button type="primary" loading={loading} onClick={onClick} block style={{ height: 60, fontSize: 16, borderRadius: 0 }}>
                Summarize
            </Button>
        </Tooltip >)
}