import React, { FC, useState } from 'react';
import { Button, Tooltip, } from 'antd';
import { SettingOutlined, QuestionOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export const GoToSettingsButton: any = (props: any) => {
    return (
        <Tooltip title="Settings">
            <Button shape="circle" icon={<SettingOutlined />} size="small" onClick={() => props.setActiveTab("settings")} />
        </Tooltip>)
}

export const GoToHelpButton: any = (props: any) => {
    return (
        <Tooltip title="Help">
            <Button shape="circle" icon={<QuestionOutlined />} size="small" onClick={() => props.setActiveTab("help")} style={{ marginLeft: "16px" }} />
        </Tooltip>)
}

export const BackButton: any = (props: any) => {
    return (
        <Tooltip title="Back">
            <Button shape="circle" icon={<ArrowLeftOutlined />} size="small" onClick={() => props.setActiveTab("main")} style={{ marginRight: 8 }} />
        </Tooltip>
    )
}