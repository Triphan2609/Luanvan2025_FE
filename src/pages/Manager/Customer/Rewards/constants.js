import React from "react";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    GiftOutlined,
    TrophyOutlined,
    ShoppingOutlined,
    CoffeeOutlined,
    DollarOutlined,
    ExperimentOutlined,
    TagOutlined,
} from "@ant-design/icons";

// Các loại trạng thái phần thưởng
export const REWARD_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};

// Cấu hình trạng thái
export const STATUS_CONFIG = {
    [REWARD_STATUS.ACTIVE]: {
        text: "Đang hoạt động",
        color: "success",
        // icon: <CheckCircleOutlined />,
    },
    [REWARD_STATUS.INACTIVE]: {
        text: "Ngừng hoạt động",
        color: "error",
        // icon: <CloseCircleOutlined />,
    },
};

// Các icon biểu tượng cho phần thưởng
export const REWARD_ICONS = [
    {
        value: "gift",
        label: "Quà tặng",
        // icon: <GiftOutlined />,
    },
    {
        value: "trophy",
        label: "Giải thưởng",
        // icon: <TrophyOutlined />,
    },
    {
        value: "shopping",
        label: "Mua sắm",
        // icon: <ShoppingOutlined />,
    },
    {
        value: "coffee",
        label: "Đồ uống",
        // icon: <CoffeeOutlined />,
    },
    {
        value: "voucher",
        label: "Voucher",
        // icon: <TagOutlined />,
    },
    {
        value: "money",
        label: "Tiền mặt",
        // icon: <DollarOutlined />,
    },
    {
        value: "experience",
        label: "Trải nghiệm",
        // icon: <ExperimentOutlined />,
    },
];
