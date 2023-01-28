import React, { useEffect, useState } from "react";
import type { FC } from "react";
import { Card } from "antd";
import Storage, { ISummary } from "./services/Storage";
import { Help } from "./components/Help";
import { Settings } from "./components/Settings";
import { SummaryCard } from "./components/SummaryCard";
import {
  BackButton,
  GoToSettingsButton,
  GoToHelpButton,
} from "./components/Navigation";
import { RequestSummaryButton } from "./components/RequestSummaryButton";
import "antd/dist/reset.css";
import "./App.css";

// TODO: Test if API key is valid by sending an example request
// TODO add types
// TODO add documentation
// TODO when summarize is clicked, immediately add loading summary to all summaries. When response is received, update the summary in allSummaries and remove loading state from button
// TODO move header to card header
// TODO message if there is no summary yet

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("main");

  const tabs: { [key: string]: any } = {
    main: <Summaries />,
    settings: <Settings />,
    help: <Help />,
  };

  return (
    <div className="App">
      <Card
        id="main"
        title={<Title activeTab={activeTab} setActiveTab={setActiveTab} />}
        extra={[
          <GoToSettingsButton setActiveTab={setActiveTab} />,
          <GoToHelpButton setActiveTab={setActiveTab} />,
        ]}
        style={{ textAlign: "left" }}
      >
        <div style={{ overflowY: "auto", height: 400, width: 500 }}>
          {" "}
          {tabs[activeTab]}{" "}
        </div>
      </Card>
      <RequestSummaryButton />
    </div>
  );
};

const Title = (props: any) => {
  // If the current tab is not "main", show back button otherwise only show title
  if (props.activeTab !== "main") {
    return (
      <>
        <BackButton setActiveTab={props.setActiveTab} /> Highlighter
      </>
    );
  } else {
    return <>Highlighter</>;
  }
};

function Summaries() {
  const [allSummaries, setAllSummaries] = useState<ISummary[]>([]);

  useEffect(() => {
    Storage.getAllSummaries().then((result) => {
      setAllSummaries(result);
    });
  });

  return (
    <>
      {allSummaries.reverse().map((item: any, index) => {
        return <SummaryCard summary={item} />;
      })}
    </>
  );
}

export default App;
