import { FC } from 'react';
import { Typography } from 'antd';
import { Padding } from "./Style"
const { Paragraph } = Typography;

export const Help: FC = (props: any) => {
    return (
        <Padding>
            <Paragraph strong> Help </Paragraph>
            <Paragraph>
                Explanation of how to use this extension
            </Paragraph>
        </Padding>
    )
}