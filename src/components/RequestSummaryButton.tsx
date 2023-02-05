import React, { FC, useState } from "react";
import { Button, Tooltip, message } from "antd";
import WorkerRequestSender from "../services/WorkerRequestSender";

export const RequestSummaryButton: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onClick = async () => {
    setLoading(true);
    await WorkerRequestSender.requestSummary();
  };

  return (
    <>
      {contextHolder}
      <Tooltip title="Summarize Highlighted Text">
        <Button
          type="primary"
          onClick={onClick}
          block
          style={{ height: 60, fontSize: 16, borderRadius: 0 }}
        >
          Summarize
        </Button>
      </Tooltip>
    </>
  );
};
