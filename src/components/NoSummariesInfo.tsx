import { FC } from "react";
import { Typography, Steps, Space } from "antd";
const { Paragraph, Link, Text } = Typography;

export const NoSummariesInfo: any = (props: any) => {
  return (
    <>
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 300, height: 180 }}>
          <Paragraph strong>Generate your first Summary!</Paragraph>
          <Steps
            direction="vertical"
            current={0}
            items={[
              {
                title: (
                  <Text>
                    Set the API Key in{" "}
                    <a
                      onClick={() => {
                        props.setActiveTab("settings");
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Settings
                    </a>
                    ⚙️
                  </Text>
                ),
              },
              {
                title: <Text> Highlight Text on any Website ✍️ </Text>,
              },
              {
                title: <Text> Click on 'Summarize' 👇 </Text>,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};
