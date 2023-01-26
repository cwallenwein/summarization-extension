import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Card } from 'antd';
import Storage, { ISummary } from './services/Storage';
import { Help } from "./components/Help"
import { Settings } from "./components/Settings"
import { SummaryCard } from './components/SummaryCard';
import { BackButton, GoToSettingsButton, GoToHelpButton } from './components/Navigation';
import { RequestSummaryButton } from "./components/RequestSummaryButton"
import 'antd/dist/reset.css';
import './App.css';

// TODO Propper url shortening in header of summary
// TODO: Test if API key is valid by sending an example request
// TODO: message when no text is selected
// TODO add types
// TODO add documentation
// TODO when summarize is clicked, immediately add loading summary to history. When response is received, update the summary in history and remove loading state from button
// TODO don't add summary to history if summarization failed
// TODO move header to card header
// TODO warning when no text is selected
// TODO warning if text could not be selected

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
        title={<Title activeTab={activeTab} setActiveTab={setActiveTab} />}
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

const Title = (props: any) => {
  // If the current tab is not "main", show back button otherwise only show title
  if (props.activeTab !== "main") {
    return (<><BackButton setActiveTab={props.setActiveTab} /> Highlighter</>)
  } else {
    return (<>Highlighter</>)
  }

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

export default App;