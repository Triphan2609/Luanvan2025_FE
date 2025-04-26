import React from "react";
import { Tabs, Card } from "antd";
import { FieldTimeOutlined, CalendarOutlined } from "@ant-design/icons";
import Shifts from "./Shifts/index";
import Schedule from "./Schedule/index";

export default function WorkingTime() {
    const items = [
        {
            key: "shifts",
            label: (
                <span>
                    <FieldTimeOutlined />
                    Quản lý Ca làm việc
                </span>
            ),
            children: <Shifts />,
        },
        {
            key: "schedule",
            label: (
                <span>
                    <CalendarOutlined />
                    Lịch làm việc Nhân viên
                </span>
            ),
            children: <Schedule />,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Tabs defaultActiveKey="shifts" items={items} size="large" />
            </Card>
        </div>
    );
}
