import React, { useState } from "react";
import { Tabs, Card } from "antd";
import { InboxOutlined, UnorderedListOutlined } from "@ant-design/icons";
import RoomStuffs from "./index";
import ItemCategories from "./Categories";

const StuffTabs = () => {
    const [activeKey, setActiveKey] = useState("items");

    const items = [
        {
            key: "items",
            label: (
                <span>
                    <InboxOutlined /> Vật dụng
                </span>
            ),
            children: <RoomStuffs />,
        },
        {
            key: "categories",
            label: (
                <span>
                    <UnorderedListOutlined /> Danh mục
                </span>
            ),
            children: <ItemCategories />,
        },
    ];

    return (
        <Card>
            <Tabs
                activeKey={activeKey}
                onChange={setActiveKey}
                items={items}
                size="large"
                type="card"
                style={{ marginTop: 8 }}
            />
        </Card>
    );
};

export default StuffTabs;
