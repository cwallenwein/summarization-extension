import React, { FC, useState } from 'react';
import { Card, Typography, Skeleton, Tooltip, message, } from 'antd';
import { CopyOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import Storage, { ISummary } from '../services/Storage';
const { Paragraph, Link, Text } = Typography;

// TODO remove HTTPs from url
// TODO add loading state
export function SummaryCard(props: any) {
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const copyToClipboard = async () => {
        console.log(props)
        try {
            await navigator.clipboard.writeText(props.summary.content)
            messageApi.info({ content: 'Copied Summary to Clipboard', icon: < CopyOutlined /> });
        } catch (error) {
            console.error(error)
        }
    }

    async function deleteSummary(summary: ISummary) {
        await Storage.deleteSummary(summary)
        messageApi.info({ content: 'Deleted Summary', icon: < DeleteOutlined /> });
    }

    return (

        <Card
            style={{
                width: "calc(100% - 32px)",
                textAlign: "left",
                margin: "16px"
            }}

            actions={[
                <Tooltip title="Copy Summary"><CopyOutlined onClick={copyToClipboard} /></Tooltip>,
                <Tooltip title="Delete Summary"><DeleteOutlined onClick={() => deleteSummary(props.summary)} /></Tooltip>
            ]}
        >
            {contextHolder}
            <Skeleton loading={loading} active>
                <Typography>
                    <Tooltip title={props.summary.url}>
                        <Text>
                            <Link href={props.summary.url} target="_blank" style={{ fontSize: "12pt" }}>
                                {props.summary.url}
                                <LinkOutlined style={{ marginLeft: "5px" }} />
                            </Link>
                        </Text>
                    </Tooltip>
                    <Paragraph>
                        {props.summary.summary}
                    </Paragraph>
                </Typography>
            </Skeleton>

        </Card>
    )

}