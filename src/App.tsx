import React, { useEffect, useState } from "react";
import type { FC } from "react";
import { Card, message } from "antd";
import Storage, { ISummary } from "./services/Storage";
import { Help } from "./components/Help";
import { Settings } from "./components/Settings";
import { SummaryCard } from "./components/SummaryCard";
import { NoSummariesInfo } from "./components/NoSummariesInfo";
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
// TODO move header to card header
// TODO add option to regenerate a summary
// TODO if api key is currently being validated in the settings and the user switches to another tab, the validation-result-notifcation should still be shown

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("main");

  const tabs: { [key: string]: any } = {
    main: <Summaries setActiveTab={setActiveTab} />,
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
          {tabs[activeTab]}
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

const Summaries: any = (props: any) => {
  const [allSummaries, setAllSummaries] = useState<ISummary[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    Storage.getAllSummaries().then((result) => {
      setAllSummaries(result);
    });
  });

  const AllSummaries = allSummaries.reverse().map((item: any, index) => {
    return <SummaryCard summary={item} messageApi={messageApi} />;
  });

  if (allSummaries.length === 0) {
    return (
      <>
        {contextHolder}
        <NoSummariesInfo setActiveTab={props.setActiveTab} />
      </>
    );
  } else {
    return (
      <>
        {contextHolder}
        {AllSummaries}
      </>
    );
  }
};

export default App;
