import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    message,
    Popconfirm,
    Input,
    Select,
    Row,
    Col,
    Tooltip,
    Statistic,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    SearchOutlined,
    EyeOutlined,
    DeleteOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import BranchModal from "./Components/BranchModal";
import BranchTypeDrawer from "./Components/BranchTypeDrawer";
import BranchDetailDrawer from "./Components/BranchDetailDrawer";
import {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    updateBranchStatus,
} from "../../../../api/branchesApi";
import {
    getBranchTypes,
    createBranchType,
    updateBranchType,
    deleteBranchType,
} from "../../../../api/branchTypesApi";
import moment from "moment";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function BranchManagement() {
    const [branches, setBranches] = useState([]);
    const [branchTypes, setBranchTypes] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterType, setFilterType] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const branchesData = await getBranches();
                const branchTypesData = await getBranchTypes();
                setBranches(branchesData);
                setBranchTypes(branchTypesData);
            } catch (error) {
                message.error("Không thể tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingBranch(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingBranch({
            ...record,
            branch_type_id: record.branchType?.id, // Map branchType to branch_type_id
            open_time: moment(record.open_time, "HH:mm"), // Chuyển đổi open_time thành moment object
            close_time: moment(record.close_time, "HH:mm"), // Chuyển đổi close_time thành moment object
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteBranch(id);
            setBranches((prev) => prev.filter((b) => b.id !== id));
            message.success("Xóa chi nhánh thành công");
        } catch (error) {
            message.error("Không thể xóa chi nhánh!");
        }
    };

    const handleViewDetails = (record) => {
        setSelectedBranch(record);
        setIsDetailDrawerOpen(true);
    };

    const handleSave = async (data) => {
        try {
            if (data.id) {
                await updateBranch(data.id, data);
                message.success("Cập nhật chi nhánh thành công");
            } else {
                await createBranch(data);
                message.success("Thêm chi nhánh mới thành công");
            }
            const branchesData = await getBranches();
            setBranches(branchesData);
            setIsModalOpen(false);
        } catch (error) {
            message.error("Không thể lưu chi nhánh!");
        }
    };

    const handleSaveBranchType = async (data) => {
        try {
            if (data.id) {
                await updateBranchType(data.id, data);
                message.success("Cập nhật loại chi nhánh thành công");
            } else {
                await createBranchType(data);
                message.success("Thêm loại chi nhánh mới thành công");
            }
            const branchTypesData = await getBranchTypes();
            setBranchTypes(branchTypesData);
        } catch (error) {
            message.error("Không thể lưu loại chi nhánh!");
        }
    };

    const handleDeleteBranchType = async (id) => {
        try {
            await deleteBranchType(id);
            setBranchTypes((prev) => prev.filter((type) => type.id !== id));
            message.success("Xóa loại chi nhánh thành công");
        } catch (error) {
            message.error("Không thể xóa loại chi nhánh!");
        }
    };

    const handleChangeStatus = async (id, currentStatus) => {
        try {
            const newStatus =
                currentStatus === "active" ? "inactive" : "active";
            await updateBranchStatus(id, newStatus);
            setBranches((prev) =>
                prev.map((branch) =>
                    branch.id === id ? { ...branch, status: newStatus } : branch
                )
            );
            message.success("Thay đổi trạng thái thành công!");
        } catch (error) {
            message.error("Không thể thay đổi trạng thái!");
        }
    };

    const filteredBranches = useMemo(() => {
        return branches
            .filter((b) =>
                `${b.name} ${b.address} ${b.branch_code}`
                    .toLowerCase()
                    .includes(searchKeyword.toLowerCase())
            )
            .filter((b) => (filterStatus ? b.status === filterStatus : true))
            .filter((b) =>
                filterType ? b.branchType?.id === filterType : true
            );
    }, [branches, searchKeyword, filterStatus, filterType]);

    const columns = [
        {
            title: "Mã chi nhánh",
            dataIndex: "branch_code",
            key: "branch_code",
            sorter: (a, b) => a.branch_code.localeCompare(b.branch_code),
        },
        {
            title: "Tên chi nhánh",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Loại chi nhánh",
            dataIndex: ["branchType", "name"],
            key: "branchType",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag
                    color={status === "active" ? "green" : "red"}
                    icon={
                        status === "active" ? (
                            <CheckCircleOutlined />
                        ) : (
                            <CloseCircleOutlined />
                        )
                    }
                >
                    {status === "active" ? "Hoạt động" : "Ngừng"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            record.status === "active"
                                ? "Ngừng hoạt động"
                                : "Kích hoạt"
                        }
                    >
                        <Popconfirm
                            title="Bạn có chắc chắn muốn thay đổi trạng thái chi nhánh này?"
                            okText="Thay đổi"
                            cancelText="Hủy"
                            onConfirm={() =>
                                handleChangeStatus(record.id, record.status)
                            }
                        >
                            <Button>
                                {record.status === "active"
                                    ? "Ngừng hoạt động"
                                    : "Kích hoạt"}
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa chi nhánh này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button icon={<DeleteOutlined />} danger />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card
                title="Quản lý Chi nhánh"
                extra={
                    <Space>
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={handleAdd}
                        >
                            Thêm chi nhánh
                        </Button>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            Quản lý loại chi nhánh
                        </Button>
                    </Space>
                }
            >
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng số chi nhánh"
                                value={branches.length}
                                prefix={<AppstoreOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Chi nhánh hoạt động"
                                value={
                                    branches.filter(
                                        (b) => b.status === "active"
                                    ).length
                                }
                                valueStyle={{ color: "green" }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Chi nhánh ngừng"
                                value={
                                    branches.filter(
                                        (b) => b.status === "inactive"
                                    ).length
                                }
                                valueStyle={{ color: "red" }}
                                prefix={<CloseCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={12}>
                        <Input
                            placeholder="Tìm theo tên hoặc địa chỉ"
                            prefix={<SearchOutlined />}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            allowClear
                            placeholder="Lọc theo trạng thái"
                            style={{ width: "100%" }}
                            value={filterStatus || undefined}
                            onChange={(value) => setFilterStatus(value)}
                        >
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Ngừng</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            allowClear
                            placeholder="Lọc theo loại chi nhánh"
                            style={{ width: "100%" }}
                            value={filterType || undefined}
                            onChange={(value) => setFilterType(value)}
                        >
                            {branchTypes.map((type) => (
                                <Option key={type.id} value={type.id}>
                                    {type.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                <Table
                    dataSource={filteredBranches}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                />
                <BranchModal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingBranch}
                    branchTypes={branchTypes}
                />
            </Card>

            <BranchTypeDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                branchTypes={branchTypes}
                onSaveBranchType={handleSaveBranchType}
                onDeleteBranchType={handleDeleteBranchType}
            />

            <BranchDetailDrawer
                open={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                branch={selectedBranch}
            />
        </>
    );
}
