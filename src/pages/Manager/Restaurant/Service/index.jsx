import React, { useState } from "react";
import { Card, Table, Button, Space, Tag, Typography, message, Tooltip, Popconfirm, Input, Select, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import ServiceModal from "./Modals/ServiceModal";

const { Title } = Typography;
const { Option } = Select;

export default function RestaurantService() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Dữ liệu mẫu
    const [services, setServices] = useState([
        {
            id: 1,
            name: "Khăn ướt",
            type: "additional",
            price: 3000,
            status: "active",
            unit: "cái",
        },
        {
            id: 2,
            name: "Đậu phộng",
            type: "snack",
            price: 15000,
            status: "active",
            unit: "đĩa",
        },
        // Thêm nhiều dữ liệu mẫu hơn để test phân trang
    ]);

    const handleTableChange = (pagination, filters, sorter) => {
        setSortedInfo(sorter);
        setPagination(pagination);
    };

    const getFilteredData = () => {
        let filteredData = [...services];

        // Lọc theo tìm kiếm
        if (searchText) {
            filteredData = filteredData.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchText.toLowerCase()) || item.unit.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Lọc theo loại
        if (filterType !== "all") {
            filteredData = filteredData.filter((item) => item.type === filterType);
        }

        return filteredData;
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Tên dịch vụ",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            filters: [
                { text: "Dịch vụ thêm", value: "additional" },
                { text: "Món ăn kèm", value: "snack" },
            ],
            onFilter: (value, record) => record.type === value,
            render: (type) => (
                <Tag color={type === "additional" ? "blue" : "green"}>{type === "additional" ? "Dịch vụ thêm" : "Món ăn kèm"}</Tag>
            ),
        },
        // ...existing columns...
    ];

    const handleReset = () => {
        setSearchText("");
        setFilterType("all");
        setSortedInfo({});
        setPagination({
            ...pagination,
            current: 1,
        });
    };

    // Handlers for modal
    const handleAdd = () => {
        setEditingService(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingService(record);
        setIsModalVisible(true);
    };

    const handleSubmit = (values) => {
        if (editingService) {
            setServices(services.map((item) => (item.id === editingService.id ? { ...values, id: item.id } : item)));
            message.success("Cập nhật dịch vụ thành công");
        } else {
            const newService = {
                ...values,
                id: Math.max(...services.map((s) => s.id)) + 1,
                status: "active",
            };
            setServices([...services, newService]);
            message.success("Thêm dịch vụ thành công");
        }
        setIsModalVisible(false);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>
                                Quản lý dịch vụ bàn
                            </Title>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                Thêm dịch vụ
                            </Button>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                            <Input
                                placeholder="Tìm kiếm theo tên hoặc đơn vị"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </Col>
                        <Col>
                            <Select value={filterType} onChange={setFilterType} style={{ width: 150 }}>
                                <Option value="all">Tất cả loại</Option>
                                <Option value="additional">Dịch vụ thêm</Option>
                                <Option value="snack">Món ăn kèm</Option>
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

            <ServiceModal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingService={editingService}
            />
        </div>
    );
}
