import React from "react";
import { Drawer, Descriptions, Tag, Typography, Button, Table, Card, Statistic, Row, Col, Space } from "antd";
import { HistoryOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const CustomerDetail = ({ open, onClose, customerData, TYPE_COLORS, STATUS_COLORS, CUSTOMER_TYPE, CUSTOMER_STATUS }) => {
    if (!customerData) return null;

    const bookingColumns = [
        {
            title: "Mã đặt",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Ngày đặt",
            dataIndex: "date",
            key: "date",
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => <Tag color={type === "room" ? "blue" : "green"}>{type === "room" ? "Phòng" : "Nhà hàng"}</Tag>,
        },
        {
            title: "Tổng tiền",
            dataIndex: "total",
            key: "total",
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
    ];

    // Dữ liệu mẫu lịch sử đặt phòng/bàn
    const bookingHistory = [
        {
            id: "B001",
            date: "2024-04-20",
            type: "room",
            total: 1500000,
        },
        {
            id: "B002",
            date: "2024-04-15",
            type: "restaurant",
            total: 850000,
        },
    ];

    return (
        <Drawer
            title="Chi tiết khách hàng"
            placement="right"
            onClose={onClose}
            open={open}
            width={800}
            extra={
                <Button type="primary" onClick={onClose}>
                    Đóng
                </Button>
            }
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Thông tin cơ bản */}
                <Card title="Thông tin cá nhân">
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="Họ và tên" span={2}>
                            {customerData.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{customerData.phone}</Descriptions.Item>
                        <Descriptions.Item label="Email">{customerData.email || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="CCCD/Passport">{customerData.idNumber}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">
                            {customerData.birthday ? dayjs(customerData.birthday).format("DD/MM/YYYY") : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại khách hàng">
                            <Tag color={TYPE_COLORS[customerData.type]}>
                                {customerData.type === CUSTOMER_TYPE.VIP ? "Khách VIP" : "Khách thường"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={STATUS_COLORS[customerData.status]}>
                                {customerData.status === CUSTOMER_STATUS.ACTIVE ? "Đang hoạt động" : "Đã khóa"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>
                            {customerData.address || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú" span={2}>
                            {customerData.note || "Không có ghi chú"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Thống kê */}
                <Card title="Thống kê chi tiêu">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic title="Tổng số lần đặt" value={customerData.totalBookings} prefix={<HistoryOutlined />} />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Tổng chi tiêu"
                                value={customerData.totalSpent}
                                precision={0}
                                prefix={<DollarOutlined />}
                                formatter={(value) =>
                                    new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(value)
                                }
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Lần cuối sử dụng" value={dayjs(customerData.lastVisit).format("DD/MM/YYYY")} />
                        </Col>
                    </Row>
                </Card>

                {/* Lịch sử đặt phòng/bàn */}
                <Card title="Lịch sử đặt phòng/bàn">
                    <Table columns={bookingColumns} dataSource={bookingHistory} rowKey="id" pagination={{ pageSize: 5 }} />
                </Card>
            </Space>
        </Drawer>
    );
};

export default CustomerDetail;
