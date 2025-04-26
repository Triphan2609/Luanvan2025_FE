import React, { useState } from "react";
import { Card, Table, Button, Space, Typography, Input, Row, Col, Tag, Tooltip, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import PositionForm from "./components/PositionForm";

const { Title, Text } = Typography;
const { Search } = Input;

// Constants
const POSITION_TYPE = {
    MANAGEMENT: "management",
    FRONT_DESK: "front_desk",
    HOUSEKEEPING: "housekeeping",
    RESTAURANT: "restaurant",
    SERVICE: "service",
    MAINTENANCE: "maintenance",
};

export default function PositionManagement() {
    // States
    const [searchText, setSearchText] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [positions, setPositions] = useState([
        {
            id: "CV001",
            name: "Quản lý khách sạn",
            code: "HOTEL_MANAGER",
            department: POSITION_TYPE.MANAGEMENT,
            salary: 15000000,
            description: "Quản lý toàn bộ hoạt động của khách sạn",
            employeeCount: 1,
        },
        {
            id: "CV002",
            name: "Lễ tân",
            code: "RECEPTIONIST",
            department: POSITION_TYPE.FRONT_DESK,
            salary: 8000000,
            description: "Tiếp đón khách và xử lý các thủ tục check-in/check-out",
            employeeCount: 4,
        },
        // Thêm dữ liệu mẫu khác...
    ]);

    const columns = [
        {
            title: "Mã CV",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Chức vụ",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        {record.code}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Bộ phận",
            dataIndex: "department",
            key: "department",
            render: (department) => {
                const colors = {
                    [POSITION_TYPE.MANAGEMENT]: "blue",
                    [POSITION_TYPE.FRONT_DESK]: "green",
                    [POSITION_TYPE.HOUSEKEEPING]: "orange",
                    [POSITION_TYPE.RESTAURANT]: "purple",
                    [POSITION_TYPE.SERVICE]: "cyan",
                    [POSITION_TYPE.MAINTENANCE]: "red",
                };
                const labels = {
                    [POSITION_TYPE.MANAGEMENT]: "Ban quản lý",
                    [POSITION_TYPE.FRONT_DESK]: "Lễ tân",
                    [POSITION_TYPE.HOUSEKEEPING]: "Buồng phòng",
                    [POSITION_TYPE.RESTAURANT]: "Nhà hàng",
                    [POSITION_TYPE.SERVICE]: "Dịch vụ",
                    [POSITION_TYPE.MAINTENANCE]: "Bảo trì",
                };
                return <Tag color={colors[department]}>{labels[department]}</Tag>;
            },
        },
        {
            title: "Lương cơ bản",
            dataIndex: "salary",
            key: "salary",
            align: "right",
            render: (salary) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(salary),
        },
        {
            title: "Số nhân viên",
            dataIndex: "employeeCount",
            key: "employeeCount",
            width: 120,
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa chức vụ"
                            description="Bạn có chắc chắn muốn xóa chức vụ này?"
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            disabled={record.employeeCount > 0}
                        >
                            <Button danger icon={<DeleteOutlined />} size="small" disabled={record.employeeCount > 0} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handlers
    const handleAdd = () => {
        setSelectedPosition(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedPosition(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        setPositions(positions.filter((pos) => pos.id !== record.id));
        message.success("Xóa chức vụ thành công");
    };

    const handleSubmit = (values) => {
        if (selectedPosition) {
            // Cập nhật chức vụ
            setPositions(positions.map((pos) => (pos.id === selectedPosition.id ? { ...pos, ...values } : pos)));
            message.success("Cập nhật chức vụ thành công");
        } else {
            // Thêm chức vụ mới
            const newPosition = {
                ...values,
                id: `CV${String(positions.length + 1).padStart(3, "0")}`,
                employeeCount: 0,
            };
            setPositions([...positions, newPosition]);
            message.success("Thêm chức vụ mới thành công");
        }
        setIsModalVisible(false);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Header */}
                    <Row gutter={[16, 16]} justify="space-between" align="middle">
                        <Col>
                            <Space align="center" size={16}>
                                <TeamOutlined style={{ fontSize: 24 }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    Quản lý Chức vụ
                                </Title>
                            </Space>
                        </Col>
                    </Row>

                    {/* Toolbar */}
                    <Row gutter={16} justify="space-between">
                        <Col flex="auto">
                            <Search
                                placeholder="Tìm kiếm theo tên hoặc mã chức vụ"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                        </Col>
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                Thêm chức vụ
                            </Button>
                        </Col>
                    </Row>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={positions.filter(
                            (pos) =>
                                pos.name.toLowerCase().includes(searchText.toLowerCase()) ||
                                pos.code.toLowerCase().includes(searchText.toLowerCase())
                        )}
                        rowKey="id"
                        bordered
                    />
                </Space>
            </Card>

            {/* Form Modal */}
            <PositionForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingPosition={selectedPosition}
            />
        </div>
    );
}
