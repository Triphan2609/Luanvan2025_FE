import React, { useState, useEffect } from "react";
import {
    Drawer,
    Descriptions,
    Tag,
    Typography,
    Button,
    Table,
    Card,
    Statistic,
    Row,
    Col,
    Space,
    Empty,
    Spin,
} from "antd";
import {
    HistoryOutlined,
    DollarOutlined,
    BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getBranchById } from "../../../../../api/branchesApi";

const { Text } = Typography;

const CustomerDetail = ({
    open,
    onClose,
    customerData,
    TYPE_COLORS,
    STATUS_COLORS,
    CUSTOMER_TYPE,
    CUSTOMER_STATUS,
}) => {
    const [branchInfo, setBranchInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        if (customerData && customerData.branchId) {
            fetchBranchInfo(customerData.branchId);
        } else {
            setBranchInfo(null);
        }

        // Trong tương lai, sẽ tích hợp API để lấy lịch sử đặt phòng/bàn
        // Hiện tại sử dụng dữ liệu mẫu
        setBookingLoading(true);
        setTimeout(() => {
            if (customerData && customerData.totalBookings > 0) {
                // Dữ liệu mẫu lịch sử đặt phòng/bàn
                const sampleBookingHistory = [
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
                setBookingHistory(sampleBookingHistory);
            } else {
                setBookingHistory([]);
            }
            setBookingLoading(false);
        }, 1000);
    }, [customerData]);

    const fetchBranchInfo = async (branchId) => {
        setLoading(true);
        try {
            const branch = await getBranchById(branchId);
            setBranchInfo(branch);
        } catch (error) {
            console.error("Error fetching branch information:", error);
            setBranchInfo(null);
        } finally {
            setLoading(false);
        }
    };

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
            render: (type) => (
                <Tag color={type === "room" ? "blue" : "green"}>
                    {type === "room" ? "Phòng" : "Nhà hàng"}
                </Tag>
            ),
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
                        <Descriptions.Item label="Mã khách hàng" span={1}>
                            {customerData.customer_code || "Chưa có mã"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Họ và tên" span={1}>
                            {customerData.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {customerData.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {customerData.email || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="CCCD/Passport">
                            {customerData.idNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">
                            {customerData.birthday
                                ? dayjs(customerData.birthday).format(
                                      "DD/MM/YYYY"
                                  )
                                : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            {customerData.gender
                                ? customerData.gender === "male"
                                    ? "Nam"
                                    : customerData.gender === "female"
                                    ? "Nữ"
                                    : "Khác"
                                : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại khách hàng">
                            <Tag color={TYPE_COLORS[customerData.type]}>
                                {customerData.type === CUSTOMER_TYPE.VIP
                                    ? "Khách VIP"
                                    : "Khách thường"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={STATUS_COLORS[customerData.status]}>
                                {customerData.status === CUSTOMER_STATUS.ACTIVE
                                    ? "Đang hoạt động"
                                    : "Đã khóa"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Chi nhánh" span={1}>
                            {loading ? (
                                <Spin size="small" />
                            ) : branchInfo ? (
                                <Space>
                                    <BankOutlined />
                                    {branchInfo.name}
                                </Space>
                            ) : (
                                "Không có chi nhánh"
                            )}
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
                            <Statistic
                                title="Tổng số lần đặt"
                                value={customerData.totalBookings}
                                prefix={<HistoryOutlined />}
                            />
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
                            <Statistic
                                title="Lần cuối sử dụng"
                                value={
                                    customerData.lastVisit
                                        ? dayjs(customerData.lastVisit).format(
                                              "DD/MM/YYYY"
                                          )
                                        : "Chưa sử dụng"
                                }
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Lịch sử đặt phòng/bàn */}
                <Card title="Lịch sử đặt phòng/bàn">
                    {bookingLoading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <Spin tip="Đang tải dữ liệu..." />
                        </div>
                    ) : bookingHistory.length > 0 ? (
                        <Table
                            columns={bookingColumns}
                            dataSource={bookingHistory}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                        />
                    ) : (
                        <Empty description="Khách hàng chưa có lịch sử đặt phòng/bàn" />
                    )}
                </Card>
            </Space>
        </Drawer>
    );
};

export default CustomerDetail;
