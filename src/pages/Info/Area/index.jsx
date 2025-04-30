import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Tag, message, Popconfirm, Select, Input, Row, Col, Statistic } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, AppstoreOutlined } from "@ant-design/icons";
import AreaModal from "./Modals/AreaModal.jsx";
import { getAreas, createArea, updateArea, deleteArea, updateAreaStatus } from "../../../api/areasApi";
import { getBranches } from "../../../api/branchesApi"; // API lấy danh sách chi nhánh
import * as XLSX from "xlsx";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export default function AreaManagement() {
    const [areas, setAreas] = useState([]);
    const [branches, setBranches] = useState([]); // Lưu danh sách chi nhánh
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState(""); // Trạng thái lọc
    const [filterBranch, setFilterBranch] = useState(""); // Lọc theo chi nhánh
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [areasData, branchesData] = await Promise.all([getAreas(), getBranches()]);
                setAreas(areasData);
                setBranches(branchesData);
            } catch (error) {
                message.error("Không thể tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingArea(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingArea(record); // Truyền toàn bộ thông tin khu vực, bao gồm branch
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteArea(id);
            setAreas((prev) => prev.filter((a) => a.id !== id));
            message.success("Xóa khu vực thành công");
        } catch (error) {
            message.error("Không thể xóa khu vực!");
        }
    };

    const handleSave = async (data) => {
        try {
            if (data.id) {
                const updatedArea = await updateArea(data.id, data); // Gửi branch_id thay vì branch
                setAreas((prev) => prev.map((a) => (a.id === data.id ? updatedArea : a)));
                message.success("Cập nhật khu vực thành công");
            } else {
                const newArea = await createArea(data);
                setAreas((prev) => [...prev, newArea]);
                message.success("Thêm khu vực mới thành công");
            }
            setIsModalOpen(false);
        } catch (error) {
            message.error("Không thể lưu khu vực!");
        }
    };

    const handleChangeStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === "active" ? "inactive" : "active";
            const updatedArea = await updateAreaStatus(id, newStatus);
            setAreas((prev) => prev.map((area) => (area.id === id ? { ...area, status: updatedArea.status } : area)));
            message.success(`Trạng thái đã được cập nhật thành ${newStatus === "active" ? "Hoạt động" : "Ngừng hoạt động"}`);
        } catch (error) {
            message.error("Không thể cập nhật trạng thái!");
        }
    };

    const filteredAreas = areas
        .filter((area) => `${area.name} ${area.type} ${area.branch?.name || ""}`.toLowerCase().includes(searchText.toLowerCase()))
        .filter((area) => (filterType ? area.type === filterType : true))
        .filter((area) => (filterStatus ? area.status === filterStatus : true))
        .filter((area) => (filterBranch ? area.branch?.id === filterBranch : true));

    const columns = [
        {
            title: "Tên khu vực",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => (type === "hotel" ? "Khách sạn" : "Nhà hàng"),
            sorter: (a, b) => a.type.localeCompare(b.type),
        },
        {
            title: "Chi nhánh",
            dataIndex: ["branch", "name"],
            key: "branch",
            render: (branchName) => branchName || "Không xác định",
            sorter: (a, b) => (a.branch?.name || "").localeCompare(b.branch?.name || ""),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 170,
            render: (status) => (
                <Tag
                    color={status === "active" ? "success" : "error"}
                    icon={status === "active" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                    {status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            ),
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: "Hành động",
            key: "actions",
            width: 300,
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title={`Bạn có chắc chắn muốn ${record.status === "active" ? "ngừng hoạt động" : "kích hoạt"} khu vực này?`}
                        okText="Có"
                        cancelText="Không"
                        onConfirm={() => handleChangeStatus(record.id, record.status)}
                    >
                        <Button type="default">{record.status === "active" ? "Ngừng hoạt động" : "Kích hoạt"}</Button>
                    </Popconfirm>
                    {record.status === "inactive" && ( // Chỉ hiển thị nút "Xóa" nếu trạng thái là "Ngừng"
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa khu vực này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button icon={<DeleteOutlined />} danger>
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const handleExport = () => {
        const formattedData = areas.map((area) => ({
            "Tên khu vực": area.name,
            "Loại khu vực": area.type === "hotel" ? "Khách sạn" : "Nhà hàng",
            "Chi nhánh": area.branch?.name || "Không xác định",
            "Trạng thái": area.status === "active" ? "Hoạt động" : "Ngừng hoạt động",
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Khu vực");

        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
        XLSX.writeFile(workbook, `danh_sach_khu_vuc_${timestamp}.xlsx`);
    };

    const handleReset = async () => {
        try {
            setSearchText("");
            setFilterType("");
            setFilterStatus("");
            setFilterBranch("");
            const areasData = await getAreas(); // Gọi lại API để tải dữ liệu gốc
            setAreas(areasData);
            message.success("Đã đặt lại bộ lọc");
        } catch (error) {
            message.error("Không thể tải lại dữ liệu!");
        }
    };

    return (
        <Card
            title="Quản lý Khu vực"
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm khu vực
                </Button>
            }
        >
            {/* Thống kê */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng số khu vực" value={areas.length} prefix={<AppstoreOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Khu vực hoạt động"
                            value={areas.filter((area) => area.status === "active").length}
                            valueStyle={{ color: "green" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Khu vực ngừng"
                            value={areas.filter((area) => area.status === "inactive").length}
                            valueStyle={{ color: "red" }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bộ lọc */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
                <Col flex="auto">
                    <Input.Search
                        placeholder="Tìm kiếm theo tên khu vực"
                        allowClear
                        onSearch={(value) => setSearchText(value)}
                        style={{ width: "100%" }}
                    />
                </Col>
                <Col flex="200px">
                    <Select
                        placeholder="Lọc theo loại khu vực"
                        allowClear
                        onChange={(value) => setFilterType(value)}
                        style={{ width: "100%" }}
                    >
                        <Select.Option value="hotel">Khách sạn</Select.Option>
                        <Select.Option value="restaurant">Nhà hàng</Select.Option>
                    </Select>
                </Col>
                <Col flex="200px">
                    <Select
                        placeholder="Lọc theo trạng thái"
                        allowClear
                        onChange={(value) => setFilterStatus(value)}
                        style={{ width: "100%" }}
                    >
                        <Select.Option value="active">Hoạt động</Select.Option>
                        <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
                    </Select>
                </Col>
                <Col flex="200px">
                    <Select
                        placeholder="Lọc theo chi nhánh"
                        allowClear
                        onChange={(value) => setFilterBranch(value)}
                        style={{ width: "100%" }}
                    >
                        {branches.map((branch) => (
                            <Select.Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col flex="100px">
                    <Button type="default" onClick={handleReset} style={{ width: "100%" }}>
                        Reset
                    </Button>
                </Col>
                <Col flex="130px">
                    <Button icon={<DownloadOutlined />} type="primary" onClick={handleExport} style={{ width: "100%" }}>
                        Xuất Excel
                    </Button>
                </Col>
            </Row>

            {/* Bảng dữ liệu */}
            <Table
                dataSource={filteredAreas}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={loading} // Hiển thị trạng thái tải
            />

            {/* Modal */}
            <AreaModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingArea}
                branches={branches} // Truyền danh sách chi nhánh vào modal
            />
        </Card>
    );
}
