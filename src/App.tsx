import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { CopyOutlined, HighlightOutlined, LeftOutlined, FileTextOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, LinkOutlined, QuestionOutlined, SettingOutlined, QuestionCircleOutlined, KeyOutlined, ApiOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Form, Row, Input, Skeleton, Typography, Tooltip } from 'antd';
import Storage, { ISummary } from './services/Storage';
import 'antd/dist/reset.css';
import './App.css';

const { Title, Paragraph, Link, Text } = Typography;

// TODO: Test if API key is valid by sending an example request

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("main")

  const tabs: { [key: string]: any } = {
    main: <SummaryHistory />,
    settings: <Settings />,
    help: <Help />
  }

  return (
    <div className="App">
      <Card
        id="main"
        title="Highlighter"
        extra={[
          <GoToSettingsButton setActiveTab={setActiveTab} />,
          <GoToHelpButton setActiveTab={setActiveTab} />
        ]}
        style={{ textAlign: "left" }}>
        <div style={{ overflowY: "auto", height: 400, width: 500 }}> {tabs[activeTab]} </div>
      </Card >
      <Button type="primary" block style={{ height: 60 }}>Summarize</Button>
    </div >
  )
};

const GoToSettingsButton: any = (props: any) => {
  return (
    <Tooltip title="Settings">
      <Button shape="circle" icon={<SettingOutlined />} size="small" onClick={() => props.setActiveTab("settings")} />
    </Tooltip>)
}

const GoToHelpButton: any = (props: any) => {
  return (
    <Tooltip title="Help">
      <Button shape="circle" icon={<QuestionOutlined />} size="small" onClick={() => props.setActiveTab("help")} style={{ marginLeft: "16px" }} />
    </Tooltip>)
}

const SummarizeButton: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    < Tooltip title="Summarize Highlighted Text" >
      <Button type="primary" loading={loading} onClick={() => setLoading(true)}>
        Summarize Text
      </Button>
    </Tooltip >)
}

// TODO Add Button to go back to summaries
const Help: React.FC = () => {
  return (
    <div>
      <Title level={5}>How to Use</Title>
      <Paragraph>
        Explanation of how to use this extension
      </Paragraph>
    </div>
  )
}

// TODO Add Button to go back to summaries
const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("")

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
  const updateApiKey = async (newApiKey: string) => {
    await setApiKey(newApiKey)
    await Storage.setApiKey(newApiKey)
  }

  // <Input placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
  // <Button icon={<LeftOutlined />} type="text" />

  return (
    <div>
      <Title level={5}>Settings</Title>
      <Paragraph
        editable={{
          tooltip: 'Click to edit the API Key',
          onChange: updateApiKey,
          triggerType: ["icon", "text"],
        }}
      > {apiKey}
      </Paragraph>

    </div>
  )
}



function SummaryHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    Storage.getHistory().then((result) => {
      setHistory(result)
    })
  })

  return (
    <>
      {
        history.map((item: any, index) => {
          return <SummaryCard content={item.summary} url={item.url} />
        })
      }
    </>

  )
}

// TODO remove HTTPs from url
// TODO add loading state
function SummaryCard(props: any) {
  const [loading, setLoading] = useState(false);

  return (
    <Card
      style={{
        width: "calc(100% - 32px)",
        textAlign: "left",
        margin: "16px"
      }}

      actions={[
        <Tooltip title="Copy Summary"><CopyOutlined /></Tooltip>,
        //<Tooltip title="Link to Original Text"><FileTextOutlined /></Tooltip>,
        <Tooltip title="Delete Summary"><DeleteOutlined /></Tooltip>
      ]}
    >
      <Skeleton loading={loading} active>
        <Typography>
          <Tooltip title={props.url}>
            <Text>
              <Link href={props.url} target="_blank" style={{ fontSize: "12pt" }}>
                {props.url}
                <LinkOutlined style={{ marginLeft: "5px" }} />
              </Link>
            </Text>
          </Tooltip>
          <Paragraph>
            {props.content}
          </Paragraph>
        </Typography>
      </Skeleton>

    </Card>
  )

}

export default App;