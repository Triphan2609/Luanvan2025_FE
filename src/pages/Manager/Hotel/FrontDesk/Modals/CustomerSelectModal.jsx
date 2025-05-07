import React, { useState } from "react";
import {
    Modal,
    Table,
    Input,
    Button,
    Space,
    Tag,
    Typography,
    Tooltip,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    SearchOutlined,
    PlusOutlined,
    MailOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export default function CustomerSelectModal({
    open,
    onCancel,
    customers,
    onSelect,
    onAddNew,
}) {
    const [searchText, setSearchText] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Kiểm tra và ghi nhật ký cấu trúc dữ liệu khách hàng khi component mount
    React.useEffect(() => {
        console.log(
            "CustomerSelectModal received customers:",
            Array.isArray(customers)
                ? `Array with ${customers.length} items`
                : `Non-array type: ${typeof customers}`
        );

        // Khởi tạo filteredCustomers là mảng rỗng
        setFilteredCustomers([]);
    }, []);

    // Filter customers based on search text
    const handleSearch = (value) => {
        setSearchText(value);

        // Ensure customers is always an array
        const customerArray = Array.isArray(customers) ? customers : [];

        if (!value) {
            setFilteredCustomers(customerArray);
            return;
        }

        const filtered = customerArray.filter(
            (customer) =>
                customer.name.toLowerCase().includes(value.toLowerCase()) ||
                customer.phone.includes(value) ||
                (customer.email &&
                    customer.email
                        .toLowerCase()
                        .includes(value.toLowerCase())) ||
                (customer.idNumber && customer.idNumber.includes(value))
        );

        setFilteredCustomers(filtered);
    };

    // Set initial data when modal opens
    React.useEffect(() => {
        if (open) {
            setLoading(true);
            try {
                // Ensure customers is always an array
                const customerArray = Array.isArray(customers) ? customers : [];
                console.log(
                    `CustomerSelectModal opened with ${customerArray.length} customers`
                );
                setFilteredCustomers(customerArray);
                setSearchText("");
            } catch (error) {
                console.error("Error processing customers data:", error);
                setFilteredCustomers([]);
            } finally {
                setLoading(false);
            }
        }
    }, [open, customers]);

    const columns = [
        {
            title: "Khách hàng",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <UserOutlined />
                        <Text strong>{text}</Text>
                        {record.type === "vip" && <Tag color="gold">VIP</Tag>}
                    </Space>
                    <Space>
                        <PhoneOutlined />
                        <Text type="secondary">{record.phone}</Text>
                    </Space>
                    {record.email && (
                        <Space>
                            <MailOutlined />
                            <Text type="secondary">{record.email}</Text>
                        </Space>
                    )}
                </Space>
            ),
        },
        {
            title: "Thông tin bổ sung",
            dataIndex: "address",
            key: "info",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    {record.idNumber && (
                        <div>
                            <Text type="secondary">
                                CMND/CCCD: {record.idNumber}
                            </Text>
                        </div>
                    )}
                    {record.address && (
                        <div>
                            <Text type="secondary">
                                Địa chỉ: {record.address}
                            </Text>
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: "Lịch sử",
            key: "history",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <CreditCardOutlined />
                        <Text>
                            {parseFloat(
                                record.totalSpent || 0
                            ).toLocaleString()}
                            đ
                        </Text>
                    </Space>
                    <div>
                        <Text type="secondary">
                            {record.totalBookings || 0} lần đặt phòng
                        </Text>
                    </div>
                    {record.lastVisit && (
                        <div>
                            <Text type="secondary">
                                Lần cuối:{" "}
                                {dayjs(record.lastVisit).format("DD/MM/YYYY")}
                            </Text>
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Button type="primary" onClick={() => onSelect(record)}>
                    Chọn
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title="Chọn khách hàng"
            open={open}
            onCancel={onCancel}
            width={900}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="add"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onAddNew}
                >
                    Thêm khách hàng mới
                </Button>,
            ]}
        >
            <Space style={{ width: "100%", marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm theo tên, số điện thoại, email, CMND/CCCD"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 400 }}
                    allowClear
                />
            </Space>

            <Table
                columns={columns}
                dataSource={filteredCustomers || []}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                }}
                locale={{
                    emptyText: "Không tìm thấy khách hàng nào",
                }}
            />
        </Modal>
    );
}
