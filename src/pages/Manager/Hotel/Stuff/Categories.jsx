import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    message,
    Tooltip,
    Popconfirm,
    Input,
    Row,
    Col,
    Select,
    Empty,
    Alert,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    UnorderedListOutlined,
    BranchesOutlined,
} from "@ant-design/icons";
import CategoryForm from "./Modals/CategoryForm";
import {
    getItemCategories,
    createItemCategory,
    updateItemCategory,
    deleteItemCategory,
    updateAllCategoriesBranch,
} from "../../../../api/stuffApi";
import { getHotelBranches } from "../../../../api/branchesApi";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function ItemCategories({ branchId }) {
    // States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(branchId);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
    });
    const [needsMigration, setNeedsMigration] = useState(false);
    const [isMigratingData, setIsMigratingData] = useState(false);

    // Fetch data
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getItemCategories(selectedBranch);
            setCategories(response);

            // Kiểm tra xem có categories nào không có branchId không
            const categoriesWithoutBranch = response.filter(
                (cat) => !cat.branchId
            );
            if (categoriesWithoutBranch.length > 0 && !needsMigration) {
                setNeedsMigration(true);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            message.error("Không thể tải danh mục vật dụng");
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            setLoading(true);
            console.log("Categories: Fetching hotel branches...");
            const response = await getHotelBranches();
            console.log("Categories: Hotel branches response:", response);

            // Lấy chi nhánh loại khách sạn hoặc cả hai
            const hotelBranches = Array.isArray(response) ? response : [];
            console.log("Categories: Filtered hotel branches:", hotelBranches);

            setBranches(hotelBranches);

            // Auto-select the first branch if no branch is selected and no branch is passed from parent
            if (
                hotelBranches.length > 0 &&
                !selectedBranch &&
                branchId === undefined
            ) {
                console.log(
                    "Categories: Auto-selecting first hotel branch:",
                    hotelBranches[0]
                );
                setSelectedBranch(hotelBranches[0].id);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch hotel branches:", error);
            message.error("Không thể tải danh sách chi nhánh khách sạn");
            setLoading(false);
        }
    };

    // Hàm cập nhật branchId cho tất cả categories
    const handleMigrateData = async () => {
        try {
            if (!selectedBranch) {
                message.error(
                    "Vui lòng chọn chi nhánh trước khi cập nhật dữ liệu"
                );
                return;
            }

            setIsMigratingData(true);

            // Cập nhật categories
            const result = await updateAllCategoriesBranch(selectedBranch);

            if (result.updated > 0) {
                message.success(
                    `Đã cập nhật ${result.updated} danh mục vào chi nhánh`
                );
                setNeedsMigration(false);
            } else {
                message.info("Không có danh mục nào cần cập nhật");
            }

            // Tải lại danh mục
            fetchCategories();
        } catch (error) {
            console.error("Failed to migrate categories:", error);
            message.error("Không thể cập nhật chi nhánh cho danh mục");
        } finally {
            setIsMigratingData(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (branchId !== undefined) {
            setSelectedBranch(branchId);
        }
    }, [branchId]);

    useEffect(() => {
        if (selectedBranch) {
            fetchCategories();
        }
    }, [selectedBranch]);

    // Table handlers
    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    // Use useMemo for filtered data to prevent unnecessary re-renders
    const filteredData = useMemo(() => {
        if (!searchText) {
            return categories;
        }
        return categories.filter(
            (category) =>
                category.name
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                category.description
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase())
        );
    }, [categories, searchText]);

    // Action handlers
    const handleAdd = () => {
        setEditingCategory(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCategory(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deleteItemCategory(id);
            message.success("Xóa danh mục thành công");
            fetchCategories();
        } catch (error) {
            console.error("Failed to delete category:", error);
            message.error("Không thể xóa danh mục");
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            if (editingCategory) {
                await updateItemCategory(editingCategory.id, values);
                message.success("Cập nhật danh mục thành công");
            } else {
                await createItemCategory(values);
                message.success("Thêm danh mục thành công");
            }
            setIsModalVisible(false);
            fetchCategories();
        } catch (error) {
            console.error("Failed to save category:", error);
            message.error("Không thể lưu danh mục");
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchText("");
        fetchCategories();
    };

    const handleBranchChange = (value) => {
        setSelectedBranch(value);
    };

    // Find the current branch name
    const getCurrentBranchName = () => {
        if (!selectedBranch || !branches) return "Tất cả chi nhánh";

        const branch = branches.find((b) => b.id === selectedBranch);
        return branch ? branch.name : "Tất cả chi nhánh";
    };

    // Render migration alert if needed
    const renderMigrationAlert = () => {
        if (!needsMigration || !selectedBranch) return null;

        return (
            <Alert
                message="Danh mục cần cập nhật"
                description={
                    <div>
                        <p>
                            Có danh mục chưa được gán chi nhánh. Cập nhật ngay
                            để quản lý tốt hơn.
                        </p>
                        <Button
                            type="primary"
                            onClick={handleMigrateData}
                            loading={isMigratingData}
                        >
                            Cập nhật tất cả vào chi nhánh hiện tại
                        </Button>
                    </div>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
            />
        );
    };

    // Table columns
    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Chi nhánh",
            dataIndex: ["branch", "name"],
            key: "branch",
            render: (text, record) => {
                const branchName = record.branch?.name || "Không xác định";
                const branchType = record.branch?.branchType?.name || "";

                return (
                    <Space direction="vertical" size={0}>
                        <Text strong>{branchName}</Text>
                        {branchType && (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                {branchType}
                            </Text>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text) => text || "Không có mô tả",
        },
        {
            title: "Số lượng vật dụng",
            dataIndex: "items",
            key: "itemCount",
            width: 150,
            align: "center",
            render: (items) => items?.length || 0,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa danh mục"
                            description="Bạn có chắc chắn muốn xóa danh mục này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // If branch is provided from parent, hide branch selection
    const showBranchSelection = branchId === undefined;

    return (
        <div className="category-management">
            <Card>
                <Title level={4}>
                    <UnorderedListOutlined /> Quản lý danh mục vật dụng
                </Title>

                {/* Branch info banner */}
                {selectedBranch && (
                    <Card style={{ marginBottom: 16, background: "#f0f7ff" }}>
                        <Space>
                            <BranchesOutlined style={{ fontSize: 18 }} />
                            <Text strong>Chi nhánh hiện tại:</Text>
                            <Text>{getCurrentBranchName()}</Text>
                        </Space>
                    </Card>
                )}

                {/* Migration alert */}
                {renderMigrationAlert()}

                {/* Filter row */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    {showBranchSelection && (
                        <Col span={8}>
                            <Select
                                placeholder="Chọn chi nhánh"
                                style={{ width: "100%" }}
                                value={selectedBranch}
                                onChange={handleBranchChange}
                                optionFilterProp="children"
                                showSearch
                                allowClear
                                loading={loading}
                                notFoundContent={
                                    loading
                                        ? "Đang tải..."
                                        : "Không có chi nhánh"
                                }
                            >
                                {branches && branches.length > 0 ? (
                                    branches.map((branch) => (
                                        <Option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </Option>
                                    ))
                                ) : (
                                    <Option disabled>Không có chi nhánh</Option>
                                )}
                            </Select>
                        </Col>
                    )}
                    <Col span={showBranchSelection ? 8 : 12}>
                        <Search
                            placeholder="Tìm kiếm danh mục..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: "100%" }}
                            allowClear
                        />
                    </Col>
                    <Col
                        span={showBranchSelection ? 8 : 12}
                        style={{ textAlign: "right" }}
                    >
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                disabled={!selectedBranch}
                            >
                                Thêm danh mục
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Table */}
                {!selectedBranch ? (
                    <Empty
                        description="Vui lòng chọn chi nhánh để xem danh mục vật dụng"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        pagination={pagination}
                        onChange={handleTableChange}
                        loading={loading}
                        bordered
                        locale={{ emptyText: "Không có dữ liệu" }}
                    />
                )}
            </Card>

            {/* Modal for adding/editing categories */}
            <CategoryForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingCategory={editingCategory}
                branches={branches}
                selectedBranch={selectedBranch}
                loading={loading}
            />
        </div>
    );
}
