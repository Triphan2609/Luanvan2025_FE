// FoodManagement.jsx
import React, { useState } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Input,
    Select,
    Popconfirm,
    Tag,
    Image,
    message,
    Tabs,
    Typography,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import FoodModal from "./Modals/FoodModal";
import FoodDetailDrawer from "./Drawer/FoodDetailDrawer";
import FoodCategory from "./FoodCategory";
import FoodList from "./FoodList";

const { Search } = Input;
const { Title } = Typography;
const { TabPane } = Tabs;

const initialFoods = [
    {
        id: 1,
        name: "Cơm chiên Dương Châu",
        category: "Món chính",
        price: 45000,
        image: "https://source.unsplash.com/400x300/?fried-rice",
        status: "available",
        ingredients: ["Cơm", "Trứng", "Lạp xưởng", "Rau củ"],
    },
    {
        id: 2,
        name: "Canh chua cá",
        category: "Món canh",
        price: 60000,
        image: "https://source.unsplash.com/400x300/?soup",
        status: "unavailable",
        ingredients: ["Cá", "Cà chua", "Thơm", "Rau ngò"],
    },
];

const categories = [
    "Tất cả món ăn",
    "Món chính",
    "Món phụ",
    "Món canh",
    "Đồ uống",
];
const statusColors = {
    available: "green",
    unavailable: "red",
};

const RestaurantFood = () => {
    const [activeTab, setActiveTab] = useState("1");

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    return (
        <div>
            <Title level={3}>Quản lý Món ăn Nhà hàng</Title>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    type="card"
                >
                    <TabPane tab="Danh sách món ăn" key="1">
                        <FoodList />
                    </TabPane>
                    <TabPane tab="Danh mục món ăn" key="2">
                        <FoodCategory />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default RestaurantFood;
