import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Typography,
    message,
    Tooltip,
    Popconfirm,
    Input,
    Select,
    Row,
    Col,
    Badge,
    Statistic,
    Image,
    Tabs,
    Empty,
    Alert,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    DashboardOutlined,
    InboxOutlined,
    UnorderedListOutlined,
    BranchesOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import StuffForm from "./Modals/StuffForm";
import StuffDetail from "./Drawer/StuffDetail";
import Categories from "./Categories";
import {
    getItems,
    deleteItem,
    createItem,
    updateItem,
    getItemCategories,
    updateAllItemsBranch,
    updateAllCategoriesBranch,
} from "../../../../api/stuffApi";
import { getHotelBranches } from "../../../../api/branchesApi";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

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
    const [filterCategory, setFilterCategory] = useState(null);
    const [filterBranch, setFilterBranch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
    });
    const [stuffItems, setStuffItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        outOfStock: 0,
        lowStock: 0,
    });
    const [isMigratingData, setIsMigratingData] = useState(false);
    const [needsMigration, setNeedsMigration] = useState(false);
    const [filterItemType, setFilterItemType] = useState(null);

    // Fetch data
    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await getItems(filterCategory, filterBranch);
            setStuffItems(response);

            // Kiểm tra xem có items nào không có branchId không
            const itemsWithoutBranch = response.filter(
                (item) => !item.branchId
            );
            if (itemsWithoutBranch.length > 0 && !needsMigration) {
                setNeedsMigration(true);
            }

            // Calculate statistics
            const outOfStock = response.filter(
                (item) => !item.stockQuantity || item.stockQuantity <= 0
            ).length;
            const lowStock = response.filter(
                (item) => item.stockQuantity > 0 && item.stockQuantity < 20
            ).length;

            setStats({
                total: response.length,
                outOfStock,
                lowStock,
            });

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch items:", error);
            message.error("Không thể tải danh sách vật dụng");
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getItemCategories(filterBranch);
            setCategories(response);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            message.error("Không thể tải danh mục vật dụng");
        }
    };

    const fetchBranches = async () => {
        try {
            setLoading(true);
            console.log("Fetching hotel branches...");
            const response = await getHotelBranches();
            console.log("Hotel branches response:", response);

            // Lấy chi nhánh loại khách sạn hoặc cả hai
            const hotelBranches = Array.isArray(response) ? response : [];
            console.log("Filtered hotel branches:", hotelBranches);

            setBranches(hotelBranches);

            // Auto-select the first branch if no branch is selected
            if (hotelBranches.length > 0 && !filterBranch) {
                console.log(
                    "Auto-selecting first hotel branch:",
                    hotelBranches[0]
                );
                setFilterBranch(hotelBranches[0].id);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch hotel branches:", error);
            message.error("Không thể tải danh sách chi nhánh khách sạn");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (filterBranch) {
            fetchCategories();
            fetchItems();
        }
    }, [filterCategory, filterBranch]);

    // Table handlers
    const handleTableChange = (pagination, filters, sorter) => {
        setSortedInfo(sorter);
        setPagination(pagination);
    };

    // Use useMemo for filtered data to prevent unnecessary re-renders
    const filteredData = useMemo(() => {
        let data = [...stuffItems];

        if (searchText) {
            data = data.filter(
                (item) =>
                    item.name
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    item.description
                        ?.toLowerCase()
                        .includes(searchText.toLowerCase())
            );
        }

        // Filter by item type if selected
        if (filterItemType) {
            data = data.filter((item) => item.itemType === filterItemType);
        }

        return data;
    }, [stuffItems, searchText, filterItemType]);

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

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deleteItem(id);
            message.success("Xóa vật dụng thành công");
            fetchItems();
        } catch (error) {
            console.error("Failed to delete item:", error);
            message.error("Không thể xóa vật dụng");
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            if (editingStuff) {
                await updateItem(editingStuff.id, values);
                message.success("Cập nhật vật dụng thành công");
            } else {
                await createItem(values);
                message.success("Thêm vật dụng thành công");
            }
            setIsModalVisible(false);
            fetchItems();
        } catch (error) {
            console.error("Failed to save item:", error);
            message.error("Không thể lưu vật dụng");
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchText("");
        setFilterCategory(null);
        // Don't reset branch filter since we want to keep the context
        // setFilterBranch(null);
        setSortedInfo({});
        setPagination({ ...pagination, current: 1 });
        fetchItems();
    };

    const handleBranchChange = (value) => {
        setFilterBranch(value);
        // Reset category filter when branch changes
        setFilterCategory(null);
    };

    // Hàm cập nhật branchId cho tất cả items và categories
    const handleMigrateData = async () => {
        try {
            if (!filterBranch) {
                message.error(
                    "Vui lòng chọn chi nhánh trước khi cập nhật dữ liệu"
                );
                return;
            }

            setIsMigratingData(true);

            // Cập nhật categories trước
            const categoriesResult = await updateAllCategoriesBranch(
                filterBranch
            );

            // Sau đó cập nhật items
            const itemsResult = await updateAllItemsBranch(filterBranch);

            const totalUpdated =
                (categoriesResult.updated || 0) + (itemsResult.updated || 0);

            if (totalUpdated > 0) {
                message.success(
                    `Đã cập nhật ${totalUpdated} mục dữ liệu vào chi nhánh`
                );
                setNeedsMigration(false);
            } else {
                message.info("Không có dữ liệu nào cần cập nhật");
            }

            // Tải lại dữ liệu
            fetchItems();
            fetchCategories();
        } catch (error) {
            console.error("Failed to migrate data:", error);
            message.error("Không thể cập nhật dữ liệu chi nhánh");
        } finally {
            setIsMigratingData(false);
        }
    };

    // Render status tag
    const renderStatusTag = (item) => {
        if (!item.stockQuantity || item.stockQuantity <= 0) {
            return <Tag color="#ff4d4f">Hết hàng</Tag>;
        } else if (item.stockQuantity < 20) {
            // Sample threshold, should be dynamic in real application
            return <Tag color="#faad14">Sắp hết</Tag>;
        } else {
            return <Tag color="#52c41a">Còn hàng</Tag>;
        }
    };

    // Find the current branch name
    const getCurrentBranchName = () => {
        if (!filterBranch || !branches) return "Tất cả chi nhánh";

        const branch = branches.find((b) => b.id === filterBranch);
        return branch ? branch.name : "Tất cả chi nhánh";
    };

    // Render the migration alert if needed
    const renderMigrationAlert = () => {
        if (!needsMigration || !filterBranch) return null;

        return (
            <Alert
                message="Dữ liệu cần cập nhật"
                description={
                    <div>
                        <p>
                            Có vật dụng hoặc danh mục chưa được gán chi nhánh.
                            Cập nhật ngay để quản lý tốt hơn.
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
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            width: 80,
            render: (image) => (
                <div style={{ textAlign: "center" }}>
                    {image ? (
                        <Image
                            src={image}
                            alt="Item"
                            width={50}
                            height={50}
                            style={{ objectFit: "cover" }}
                            fallback="error"
                        />
                    ) : (
                        <InboxOutlined
                            style={{ fontSize: 24, color: "#bfbfbf" }}
                        />
                    )}
                </div>
            ),
        },
        {
            title: "Tên vật dụng",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
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
            title: "Loại",
            dataIndex: ["category", "name"],
            key: "category",
            render: (text) => text || "Không xác định",
        },
        {
            title: "Loại sử dụng",
            dataIndex: "itemType",
            key: "itemType",
            render: (itemType) => {
                switch (itemType) {
                    case "long_term":
                        return <Tag color="#108ee9">Dài hạn</Tag>;
                    case "single_use":
                        return <Tag color="#f50">Dùng 1 lần</Tag>;
                    case "multiple_use":
                        return <Tag color="#87d068">Dùng nhiều lần</Tag>;
                    default:
                        return <Tag color="#108ee9">Dài hạn</Tag>;
                }
            },
        },
        {
            title: "Số lượng",
            dataIndex: "stockQuantity",
            key: "stockQuantity",
            width: 100,
            align: "right",
            sorter: (a, b) => a.stockQuantity - b.stockQuantity,
            render: (stockQuantity) => stockQuantity || 0,
        },
        {
            title: "Đang sử dụng",
            dataIndex: "inUseQuantity",
            key: "inUseQuantity",
            width: 120,
            align: "right",
            render: (inUseQuantity, record) => {
                const usage = inUseQuantity || 0;

                // For multiple use items, also show usage count
                if (record.itemType === "multiple_use" && record.maxUses > 0) {
                    return (
                        <>
                            {usage}{" "}
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                ({record.currentUses || 0}/{record.maxUses || 0}{" "}
                                lần)
                            </Text>
                        </>
                    );
                }

                return usage;
            },
        },
        {
            title: "Đơn giá",
            dataIndex: "unitPrice",
            key: "unitPrice",
            width: 140,
            align: "right",
            sorter: (a, b) => (a.unitPrice || 0) - (b.unitPrice || 0),
            render: (unitPrice) =>
                unitPrice
                    ? `${unitPrice.toLocaleString("vi-VN")} VNĐ`
                    : "Không có",
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 120,
            render: (_, record) => renderStatusTag(record),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                            size="small"
                        />
                    </Tooltip>
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
                            title="Xóa vật dụng"
                            description="Bạn có chắc chắn muốn xóa vật dụng này?"
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

    const tabItems = [
        {
            key: "items",
            label: (
                <span>
                    <InboxOutlined /> Vật dụng
                </span>
            ),
            children: (
                <>
                    {/* Branch info banner */}
                    {filterBranch && (
                        <Card
                            style={{ marginBottom: 16, background: "#f0f7ff" }}
                        >
                            <Space>
                                <BranchesOutlined style={{ fontSize: 18 }} />
                                <Text strong>Chi nhánh hiện tại:</Text>
                                <Text>{getCurrentBranchName()}</Text>
                            </Space>
                        </Card>
                    )}

                    {/* Migration alert if needed */}
                    {renderMigrationAlert()}

                    {/* Stats row */}
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Tổng số vật dụng"
                                    value={stats.total}
                                    prefix={<InboxOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Sắp hết hàng"
                                    value={stats.lowStock}
                                    valueStyle={{ color: "#faad14" }}
                                    prefix={<Badge status="warning" />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Đã hết hàng"
                                    value={stats.outOfStock}
                                    valueStyle={{ color: "#ff4d4f" }}
                                    prefix={<Badge status="error" />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Filter row */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <Select
                                placeholder="Chọn chi nhánh"
                                style={{ width: "100%" }}
                                value={filterBranch}
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
                        <Col span={6}>
                            <Search
                                placeholder="Tìm kiếm vật dụng..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: "100%" }}
                                allowClear
                            />
                        </Col>
                        <Col span={6}>
                            <Select
                                placeholder="Lọc theo loại"
                                style={{ width: "100%" }}
                                value={filterCategory}
                                onChange={setFilterCategory}
                                optionFilterProp="children"
                                showSearch
                                allowClear
                                disabled={!filterBranch}
                            >
                                {categories.map((category) => (
                                    <Option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6} style={{ textAlign: "right" }}>
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
                                    disabled={!filterBranch}
                                >
                                    Thêm vật dụng
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    {/* Table */}
                    {!filterBranch ? (
                        <Empty
                            description="Vui lòng chọn chi nhánh để xem danh sách vật dụng"
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
                </>
            ),
        },
        {
            key: "categories",
            label: (
                <span>
                    <UnorderedListOutlined /> Danh mục
                </span>
            ),
            children: <Categories branchId={filterBranch} />,
        },
    ];

    return (
        <div className="stuff-management">
            <Card>
                <Title level={4}>
                    <DashboardOutlined /> Quản lý vật dụng khách sạn
                </Title>

                <Tabs
                    defaultActiveKey="items"
                    items={tabItems}
                    size="large"
                    type="card"
                    style={{ marginTop: 8 }}
                />
            </Card>

            {/* Modal for adding/editing stuff */}
            <StuffForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingStuff={editingStuff}
                categories={categories}
                branches={branches}
                selectedBranch={filterBranch}
                loading={loading}
            />

            {/* Drawer for viewing stuff details */}
            <StuffDetail
                open={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                stuffData={selectedStuff}
            />
        </div>
    );
}
