import React from "react";
import { Modal, Table, Tag, Typography, Space, Statistic, Button } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const PointHistory = ({ open, onClose, cardData, historyData }) => {
    const columns = [
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => {
                const configs = {
                    earn: {
                        color: "success",
                        text: "Tích điểm",
                        icon: <PlusCircleOutlined />,
                    },
                    redeem: {
                        color: "processing",
                        text: "Đổi điểm",
                        icon: <MinusCircleOutlined />,
                    },
                    expire: {
                        color: "default",
                        text: "Điểm hết hạn",
                        icon: <ClockCircleOutlined />,
                    },
                };
                return (
                    <Tag color={configs[type].color}>
                        {configs[type].icon} {configs[type].text}
                    </Tag>
                );
            },
        },
        {
            title: "Điểm",
            dataIndex: "points",
            key: "points",
            render: (points, record) => (
                <Text
                    style={{
                        color: record.type === "earn" ? "#52c41a" : "#ff4d4f",
                    }}
                >
                    {record.type === "earn" ? "+" : "-"}
                    {Math.abs(points)}
                </Text>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Số dư",
            dataIndex: "balance",
            key: "balance",
            align: "right",
        },
    ];

    return (
        <Modal
            title="Lịch sử điểm thưởng"
            open={open}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
        >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <div style={{ textAlign: "center" }}>
                    <Statistic title="Số điểm hiện tại" value={cardData?.points || 0} suffix="điểm" />
                </div>

                <Table
                    columns={columns}
                    dataSource={historyData}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                    }}
                />
            </Space>
        </Modal>
    );
};

export default PointHistory;
