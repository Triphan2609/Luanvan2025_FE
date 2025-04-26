import React, { useState } from "react";
import { Card, Table, Button, Space, Tag, Typography, message, Tooltip, Popconfirm, Input, Select, Row, Col, Badge } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import StuffForm from "./Modals/StuffForm";
import StuffDetail from "./Drawer/StuffDetail";

const { Title } = Typography;
const { Search } = Input;

// Constants
const STUFF_STATUS = {
    AVAILABLE: "available",
    LOW: "low",
    OUT_OF_STOCK: "out_of_stock",
};

const STUFF_TYPE = {
    BEDDING: "bedding",
    BATHROOM: "bathroom",
    AMENITIES: "amenities",
    ELECTRONICS: "electronics",
    OTHER: "other",
};

const STATUS_COLORS = {
    [STUFF_STATUS.AVAILABLE]: "#52c41a",
    [STUFF_STATUS.LOW]: "#faad14",
    [STUFF_STATUS.OUT_OF_STOCK]: "#ff4d4f",
};

const STATUS_LABELS = {
    [STUFF_STATUS.AVAILABLE]: "Còn hàng",
    [STUFF_STATUS.LOW]: "Sắp hết",
    [STUFF_STATUS.OUT_OF_STOCK]: "Hết hàng",
};

const TYPE_LABELS = {
    [STUFF_TYPE.BEDDING]: "Giường ngủ",
    [STUFF_TYPE.BATHROOM]: "Phòng tắm",
    [STUFF_TYPE.AMENITIES]: "Tiện nghi",
    [STUFF_TYPE.ELECTRONICS]: "Điện tử",
    [STUFF_TYPE.OTHER]: "Khác",
};

export default function RoomStuffs() {
    // States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingStuff, setEditingStuff] = useState(null);
    const [selectedStuff, setSelectedStuff] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
    });

    // Dữ liệu mẫu
    const [stuffs, setStuffs] = useState([
        {
            id: 1,
            name: "Khăn tắm",
            type: STUFF_TYPE.BATHROOM,
            quantity: 100,
            minQuantity: 20,
            unit: "cái",
            status: STUFF_STATUS.AVAILABLE,
            note: "Khăn cotton 100%",
        },
        {
            id: 2,
            name: "Dép đi trong phòng",
            type: STUFF_TYPE.AMENITIES,
            quantity: 15,
            minQuantity: 20,
            unit: "đôi",
            status: STUFF_STATUS.LOW,
            note: "Size người lớn",
        },
    ]);

    // Table handlers
    const handleTableChange = (pagination, filters, sorter) => {
        setSortedInfo(sorter);
        setPagination(pagination);
    };

    const getFilteredData = () => {
        let data = [...stuffs];

        if (searchText) {
            data = data.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.note?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (filterType !== "all") {
            data = data.filter((item) => item.type === filterType);
        }

        if (filterStatus !== "all") {
            data = data.filter((item) => item.status === filterStatus);
        }

        return data;
    };

    // Action handlers
    const handleAdd = () => {
        setEditingStuff(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingStuff(record);
        setIsModalVisible(true);
    };

    const handleView = (record) => {
        setSelectedStuff(record);
        setIsDrawerVisible(true);
    };

    const handleDelete = (id) => {
        setStuffs(stuffs.filter((item) => item.id !== id));
        message.success("Xóa vật dụng thành công");
    };

    const handleSubmit = (values) => {
        if (editingStuff) {
            setStuffs(
                stuffs.map((item) =>
                    item.id === editingStuff.id
                        ? {
                              ...item,
                              ...values,
                              status:
                                  values.quantity <= 0
                                      ? STUFF_STATUS.OUT_OF_STOCK
                                      : values.quantity <= values.minQuantity
                                      ? STUFF_STATUS.LOW
                                      : STUFF_STATUS.AVAILABLE,
                          }
                        : item
                )
            );
            message.success("Cập nhật vật dụng thành công");
        } else {
            const newStuff = {
                ...values,
                id: Math.max(...stuffs.map((s) => s.id)) + 1,
                status:
                    values.quantity <= 0
                        ? STUFF_STATUS.OUT_OF_STOCK
                        : values.quantity <= values.minQuantity
                        ? STUFF_STATUS.LOW
                        : STUFF_STATUS.AVAILABLE,
            };
            setStuffs([...stuffs, newStuff]);
            message.success("Thêm vật dụng thành công");
        }
        setIsModalVisible(false);
    };

    const handleReset = () => {
        setSearchText("");
        setFilterType("all");
        setFilterStatus("all");
        setSortedInfo({});
        setPagination({ ...pagination, current: 1 });
    };

    // Table columns
    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Tên vật dụng",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => TYPE_LABELS[type],
            filters: Object.entries(TYPE_LABELS).map(([value, label]) => ({
                text: label,
                value: value,
            })),
            onFilter: (value, record) => record.type === value,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 120,
            align: "right",
            sorter: (a, b) => a.quantity - b.quantity,
            render: (quantity, record) => `${quantity} ${record.unit}`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button icon={<EyeOutlined />} onClick={() => handleView(record)} size="small" />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa vật dụng"
                            description="Bạn có chắc chắn muốn xóa vật dụng này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>
                                Quản lý vật dụng khách sạn
                            </Title>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                Thêm vật dụng
                            </Button>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                            <Search
                                placeholder="Tìm kiếm theo tên hoặc ghi chú"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col>
                            <Select value={filterType} onChange={setFilterType} style={{ width: 150 }}>
                                <Select.Option value="all">Tất cả loại</Select.Option>
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                    <Select.Option key={value} value={value}>
                                        {label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col>
                            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
                                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                    <Select.Option key={value} value={value}>
                                        {label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col>
                            <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                Đặt lại
                            </Button>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={getFilteredData()}
                        rowKey="id"
                        bordered
                        pagination={pagination}
                        onChange={handleTableChange}
                    />
                </Space>
            </Card>

            <StuffForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingStuff={editingStuff}
                TYPE_LABELS={TYPE_LABELS}
            />

            <StuffDetail
                open={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                stuffData={selectedStuff}
                STATUS_LABELS={STATUS_LABELS}
                TYPE_LABELS={TYPE_LABELS}
                STATUS_COLORS={STATUS_COLORS}
            />
        </div>
    );
}
