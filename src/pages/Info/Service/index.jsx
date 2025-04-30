import React, { useState, useEffect, useMemo } from "react";
import { Card, Table, Button, Space, Tag, message, Popconfirm, Input, Select, Row, Col, Tooltip, Switch, Statistic } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import ServiceModal from "./Modals/ServiceModal";
import { getServices, createService, updateService, deleteService } from "../../../api/servicesApi";
import { getBranches } from "../../../api/branchesApi"; // Import API lấy danh sách chi nhánh
import * as XLSX from "xlsx";

const { Option } = Select;

const statusColor = {
    active: "green",
    inactive: "red",
};

export default function ServiceManagement() {
    const [services, setServices] = useState([]);
    const [branches, setBranches] = useState([]); // Thêm state để lưu danh sách chi nhánh
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterBranch, setFilterBranch] = useState(""); // Thêm state để lọc theo chi nhánh

    // Fetch services và branches từ backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [servicesData, branchesData] = await Promise.all([
                    getServices(),
                    getBranches(), // Gọi API lấy danh sách chi nhánh
                ]);
                setServices(servicesData);
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
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingService(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteService(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
            message.success("Xóa dịch vụ thành công");
        } catch (error) {
            message.error("Không thể xóa dịch vụ!");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        setLoading(true);
        try {
            if (data.id) {
                const updatedService = await updateService(data.id, data);
                setServices((prev) => prev.map((s) => (s.id === data.id ? updatedService : s)));
                message.success("Cập nhật dịch vụ thành công");
            } else {
                const newService = await createService(data);
                setServices((prev) => [...prev, newService]);
                message.success("Thêm dịch vụ thành công");
            }
            setIsModalOpen(false);
        } catch (error) {
            message.error("Không thể lưu dịch vụ!");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, isActive) => {
        setLoading(true);
        try {
            const updatedService = await updateService(id, { status: isActive ? "active" : "inactive" });
            setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: isActive ? "active" : "inactive" } : s)));
            message.success(`Dịch vụ đã được ${isActive ? "kích hoạt" : "ngừng hoạt động"}`);
        } catch (error) {
            message.error("Không thể thay đổi trạng thái dịch vụ!");
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = useMemo(() => {
        return services
            .filter(
                (s) =>
                    s.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                    s.description.toLowerCase().includes(searchKeyword.toLowerCase())
            )
            .filter((s) => (filterStatus ? s.status === filterStatus : true))
            .filter((s) => (filterBranch ? s.branch_id === filterBranch : true));
    }, [services, searchKeyword, filterStatus, filterBranch]);

    const columns = [
        {
            title: "Tên dịch vụ",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Giá (VND)",
            dataIndex: "price",
            key: "price",
            width: 200,
            render: (price) => price.toLocaleString("vi-VN"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => <Tag color={statusColor[status]}>{status === "active" ? "Hoạt động" : "Ngừng"}</Tag>,
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: "Chi nhánh",
            dataIndex: ["branch", "name"], // Lấy tên chi nhánh từ object branch
            key: "branch",
            render: (branchName) => branchName || "Không xác định", // Hiển thị "Không xác định" nếu không có chi nhánh
            sorter: (a, b) => (a.branch?.name || "").localeCompare(b.branch?.name || ""),
        },
        {
            title: "Hành động",
            key: "actions",
            width: 250,
            render: (_, record) => (
                <Space>
                    <Switch
                        checked={record.status === "active"}
                        onChange={(checked) => handleStatusChange(record.id, checked)}
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Ngừng"
                    />
                    <Tooltip title="Sửa dịch vụ">
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    {record.status === "inactive" && (
                        <Tooltip title="Xóa dịch vụ">
                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa dịch vụ này?"
                                okText="Xóa"
                                cancelText="Hủy"
                                onConfirm={() => handleDelete(record.id)}
                            >
                                <Button icon={<DeleteOutlined />} danger />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const handleExport = () => {
        try {
            const formattedData = services.map((service) => ({
                "Tên dịch vụ": service.name,
                "Mô tả": service.description || "Không có",
                "Giá (VND)": service.price.toLocaleString("vi-VN"),
                "Trạng thái": service.status === "active" ? "Hoạt động" : "Ngừng",
                "Chi nhánh": service.branch?.name || "Không xác định",
            }));

            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Dịch vụ");

            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
            XLSX.writeFile(workbook, `danh_sach_dich_vu_${timestamp}.xlsx`);

            message.success("Xuất file Excel thành công!");
        } catch (error) {
            message.error("Không thể xuất file Excel!");
        }
    };

    const handleReset = async () => {
        try {
            setSearchKeyword(""); // Đặt lại từ khóa tìm kiếm
            setFilterStatus(""); // Đặt lại bộ lọc trạng thái
            setFilterBranch(""); // Đặt lại bộ lọc chi nhánh
            const servicesData = await getServices(); // Tải lại danh sách dịch vụ từ API
            setServices(servicesData);
            message.success("Đã đặt lại bộ lọc");
        } catch (error) {
            message.error("Không thể tải lại dữ liệu!");
        }
    };

    return (
        <Card
            title="Quản lý Dịch vụ & Tiện ích"
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm dịch vụ
                </Button>
            }
        >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng số dịch vụ" value={services.length} prefix={<AppstoreOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Dịch vụ hoạt động"
                            value={services.filter((s) => s.status === "active").length}
                            valueStyle={{ color: "green" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Dịch vụ ngừng"
                            value={services.filter((s) => s.status === "inactive").length}
                            valueStyle={{ color: "red" }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Input
                        placeholder="Tìm theo tên dịch vụ"
                        prefix={<SearchOutlined />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Select
                        allowClear
                        placeholder="Lọc theo chi nhánh"
                        style={{ width: "100%" }}
                        value={filterBranch || undefined}
                        onChange={(value) => setFilterBranch(value)}
                    >
                        {branches.map((branch) => (
                            <Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} md={6}>
                    <Space>
                        <Button onClick={handleReset} type="default">
                            Reset
                        </Button>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            style={{
                                backgroundColor: "#1890ff", // Màu xanh
                                color: "#fff", // Chữ trắng
                                borderColor: "#1890ff", // Màu viền
                            }}
                        >
                            Xuất Excel
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Table dataSource={filteredServices} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} loading={loading} />
            <ServiceModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingService}
                branches={branches} // Truyền danh sách chi nhánh xuống modal
            />
        </Card>
    );
}
