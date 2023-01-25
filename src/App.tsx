import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { CopyOutlined, ArrowLeftOutlined, DeleteOutlined, LinkOutlined, QuestionOutlined, SettingOutlined, ApiOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Skeleton, Typography, Tooltip, message } from 'antd';
import Storage, { ISummary } from './services/Storage';
import { Help } from "./components/Help"
import { Settings } from "./components/Settings"
import { SummaryCard } from './components/SummaryCard';
import { BackButton, GoToSettingsButton, GoToHelpButton } from './components/Navigation';
import { RequestSummaryButton } from "./components/RequestSummaryButton"
import 'antd/dist/reset.css';
import './App.css';

// TODO: Test if API key is valid by sending an example request
// TODO: remove " " from summary text
// TODO Propper url shortening in header of summary
// TODO: message when no text is selected
// TODO move components to different files

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
      <RequestSummaryButton />
    </div >
  )
};

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

export default App;