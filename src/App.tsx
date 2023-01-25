import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { CopyOutlined, ArrowLeftOutlined, DeleteOutlined, LinkOutlined, QuestionOutlined, SettingOutlined, ApiOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Skeleton, Typography, Tooltip } from 'antd';
import Storage, { ISummary } from './services/Storage';
import HuggingFace from "./services/Summarize"
import 'antd/dist/reset.css';
import './App.css';

const { Title, Paragraph, Link, Text } = Typography;

// TODO: Test if API key is valid by sending an example request
// TODO: remove " " from summary text
// TODO Propper url shortening

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("main")

  const tabs: { [key: string]: any } = {
    main: <Summaries />,
    settings: <Settings />,
    help: <Help />
  }

  return (
    <div className="App">
      <Card
        id="main"
        title={activeTab !== "main" ? <><BackButton setActiveTab={setActiveTab} /> Highlighter</> : <>Highlighter</>}
        extra={[
          <GoToSettingsButton setActiveTab={setActiveTab} />,
          <GoToHelpButton setActiveTab={setActiveTab} />
        ]}
        style={{ textAlign: "left" }}>
        <div style={{ overflowY: "auto", height: 400, width: 500 }}> {tabs[activeTab]} </div>
      </Card >
      <SummarizeButton />
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

const Padding: any = ({ children }: any) => {
  return (
    <div style={{ padding: 16 }}> {children}</div>
  )
}

// TODO Add Button to go back to summaries
const Help: React.FC = (props: any) => {
  return (
    <Padding>
      <Paragraph strong>
        Help
      </Paragraph>
      <Paragraph>
        Explanation of how to use this extension
      </Paragraph>
    </Padding>
  )
}

// TODO Add Button to go back to summaries
const Settings: any = (props: any) => {
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

const BackButton: any = (props: any) => {
  return (
    <Tooltip title="Back">
      <Button shape="circle" icon={<ArrowLeftOutlined />} size="small" onClick={() => props.setActiveTab("main")} style={{ marginRight: 8 }} />
    </Tooltip>
  )
}

function Summaries() {
  const [allSummaries, setAllSummaries] = useState<ISummary[]>([])

  useEffect(() => {
    Storage.getHistory().then((result) => {
      setAllSummaries(result)
    })
  })

  return (
    <>
      {
        allSummaries.reverse().map((item: any, index) => {
          return <SummaryCard summary={item} />
        })
      }
    </>

  )
}

// TODO remove HTTPs from url
// TODO add loading state
function SummaryCard(props: any) {
  const [loading, setLoading] = useState(false);

  const copyToClipboard = async () => {
    console.log(props)
    try {
      await navigator.clipboard.writeText(props.summary.content)
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteSummary(summary: ISummary) {
    await Storage.deleteSummary(summary)
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

export default App;