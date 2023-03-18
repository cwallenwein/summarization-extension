import React, { FC, useState } from "react";
import { Card, Typography, Skeleton, Tooltip, message } from "antd";
import { CopyOutlined, DeleteOutlined, LinkOutlined } from "@ant-design/icons";
import Storage, { ISummary } from "../../services/Storage";
const { Paragraph, Link, Text } = Typography;

export function SummaryCard(props: any) {
  const [loading, setLoading] = useState(false);

  const summary = props.summary;
  const copyToClipboard = async () => {
    console.log(props);
    try {
      await navigator.clipboard.writeText(props.summary.summary);
      props.messageApi.info({
        content: "Copied Summary to Clipboard",
        icon: <CopyOutlined />,
      });
    } catch (error) {
      console.error(error);
    }
  };

  async function deleteSummary(summary: ISummary) {
    try {
      await Storage.deleteSummaryByTimestamp(summary.timestamp);
      props.messageApi.info({
        content: "Deleted Summary",
        icon: <DeleteOutlined />,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // TODO: skeleton only for summary text and not for the rest of the card
  // TODO: add button to regenerate summary
  // TODO: don't allow user to delte or copy summary if it's loading
  return (
    <Card
      style={{
        width: "calc(100% - 32px)",
        textAlign: "left",
        margin: "16px",
      }}
      actions={[
        <Tooltip title="Copy Summary">
          <CopyOutlined onClick={copyToClipboard} />
        </Tooltip>,
        <Tooltip title="Delete Summary">
          <DeleteOutlined onClick={() => deleteSummary(props.summary)} />
        </Tooltip>,
      ]}
    >
      <Skeleton loading={props.summary.loading} active>
        <Typography>
          <Tooltip title={props.summary.url}>
            <Paragraph ellipsis={{ rows: 1, expandable: false }}>
              <Link
                href={props.summary.url}
                target="_blank"
                style={{ fontSize: "12pt" }}
              >
                {props.summary.tabTitle}
                <LinkOutlined style={{ marginLeft: "5px" }} />
              </Link>
            </Paragraph>
          </Tooltip>
          <Paragraph>{props.summary.summary}</Paragraph>
        </Typography>
      </Skeleton>
    </Card>
  );
}
