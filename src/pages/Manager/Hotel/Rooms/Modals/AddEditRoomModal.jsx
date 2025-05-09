import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Upload,
    message,
    Alert,
    Divider,
    Table,
    Tag,
    Typography,
    Checkbox,
    List,
    Card,
    Row,
    Col,
    Spin,
    Empty,
    Button,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    HomeOutlined,
    TeamOutlined,
    DollarOutlined,
    BranchesOutlined,
    InboxOutlined,
    SearchOutlined,
    ReloadOutlined,
    FilterOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { getRoomTypes } from "../../../../../api/roomTypesApi";
import { getHotelBranches } from "../../../../../api/branchesApi";
import { getItems, getItemCategories } from "../../../../../api/stuffApi";
import { getRoomItems } from "../../../../../api/roomsApi";
import { getAmenities } from "../../../../../api/amenitiesApi";

const { Text } = Typography;

export default function AddEditRoomModal({
    open,
    onClose,
    onSubmit,
    initialData,
    selectedBranch = null,
    floors = [],
}) {
    const [form] = Form.useForm();
    const [roomTypes, setRoomTypes] = useState([]);
    const [branches, setBranches] = useState([]);
    const [amenitiesOptions, setAmenitiesOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [branchItems, setBranchItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [itemsLoading, setItemsLoading] = useState(false);
    const [amenitiesLoading, setAmenitiesLoading] = useState(false);
    const [roomItemsLoaded, setRoomItemsLoaded] = useState(false);
    const [categories, setCategories] = useState([]);
    const [apiErrors, setApiErrors] = useState({
        items: false,
        categories: false,
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [displayCategories, setDisplayCategories] = useState([]);

    useEffect(() => {
        if (open) {
            // Reset trạng thái
            setRoomItemsLoaded(false);

            fetchRoomTypes();
            fetchBranches();
            fetchAmenities();

            if (initialData) {
                // Nếu là cập nhật, chuyển roomType object sang roomTypeId
                const formData = {
                    ...initialData,
                    roomTypeId:
                        initialData.roomType?.id || initialData.roomTypeId,
                    branchId:
                        initialData.branch?.id ||
                        initialData.branchId ||
                        selectedBranch,
                    floorId:
                        initialData.floorId ||
                        initialData.floorDetails?.id ||
                        null,
                };
                form.setFieldsValue(formData);

                // Fetch branch items based on branch ID from initialData
                const branchId = initialData.branch?.id || initialData.branchId;
                if (branchId) {
                    // Fetch categories first, then branch items
                    fetchCategories(branchId).then(() => {
                        fetchBranchItems(branchId);
                        // Sau đó mới fetch room items để có thể chọn đúng trong danh sách vật dụng
                        if (initialData.id) {
                            fetchRoomItems(initialData.id);
                        }
                    });
                }
            } else {
                form.resetFields();
                // Nếu có selectedBranch từ phía ngoài truyền vào, sử dụng nó
                if (selectedBranch) {
                    form.setFieldsValue({ branchId: selectedBranch });
                    // Fetch categories first, then branch items
                    fetchCategories(selectedBranch).then(() => {
                        fetchBranchItems(selectedBranch);
                    });
                }
            }
        }
    }, [open, initialData, form, selectedBranch]);

    useEffect(() => {
        // Tạo danh sách hiển thị từ categories
        if (categories.length > 0) {
            setDisplayCategories(categories);
        } else {
            // Tạo danh sách từ các vật dụng nếu không có danh mục
            const categoriesFromItems = branchItems.reduce(
                (uniqueCategories, item) => {
                    if (item.category && item.category.id !== undefined) {
                        const existingCategory = uniqueCategories.find(
                            (c) => c.id === item.category.id
                        );
                        if (!existingCategory) {
                            uniqueCategories.push({
                                id: item.category.id,
                                name:
                                    item.category.name ||
                                    `Danh mục ${item.category.id}`,
                            });
                        }
                    }
                    return uniqueCategories;
                },
                []
            );

            console.log(
                "Categories extracted from items:",
                categoriesFromItems
            );
            setDisplayCategories(categoriesFromItems);
        }
    }, [categories, branchItems]);

    const fetchAmenities = async () => {
        try {
            setAmenitiesLoading(true);
            const amenities = await getAmenities();
            const formattedAmenities = amenities.map((amenity) => ({
                label: amenity.name,
                value: amenity.value,
            }));
            setAmenitiesOptions(formattedAmenities);
        } catch (error) {
            message.error("Không thể tải danh sách tiện nghi!");
            console.error("Error fetching amenities:", error);
        } finally {
            setAmenitiesLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            setLoading(true);
           
            const data = await getHotelBranches();
           
            const hotelBranches = Array.isArray(data) ? data : [];
            setBranches(hotelBranches);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hotel branches:", error);
            setLoading(false);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const data = await getRoomTypes();
            const formattedTypes = data.map((type) => ({
                label: type.name,
                value: type.id,
            }));
            setRoomTypes(formattedTypes);
        } catch (error) {
            message.error("Không thể tải dữ liệu loại phòng!");
            console.error("Error fetching room types:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async (branchId) => {
        try {
            console.log(`Fetching categories for branch ID: ${branchId}`);
            const data = await getItemCategories(branchId);
           

            if (!data || !Array.isArray(data)) {
                console.error("Invalid categories response:", data);
                setApiErrors((prev) => ({ ...prev, categories: true }));
                setCategories([]);
            } else {
                // Đảm bảo categories có định dạng đúng
                const formattedCategories = data.map((cat) => ({
                    id: cat.id,
                    name: cat.name || "Không xác định",
                }));
               
                setCategories(formattedCategories);
                setApiErrors((prev) => ({ ...prev, categories: false }));
            }
        } catch (error) {
            console.error("Error fetching item categories:", error);
            setApiErrors((prev) => ({ ...prev, categories: true }));
            setCategories([]);
        }
    };

    const fetchBranchItems = async (branchId) => {
        if (!branchId) {
            setBranchItems([]);
            return;
        }

        try {
            setItemsLoading(true);
            console.log(`Fetching items for branch ID: ${branchId}`);
            const items = await getItems(null, branchId);
            console.log(`Received ${items.length} items for branch`);

            // Đảm bảo mỗi vật dụng có danh mục đúng
            const processedItems = items.map((item) => {
                // Nếu item đã có category đầy đủ, giữ nguyên
                if (
                    item.category &&
                    typeof item.category === "object" &&
                    item.category.id &&
                    item.category.name
                ) {
                    return item;
                }

                // Nếu item có categoryId nhưng không có thông tin category đầy đủ
                if (item.categoryId) {
                    const matchingCategory = categories.find(
                        (c) => c.id === item.categoryId
                    );
                    if (matchingCategory) {
                        return {
                            ...item,
                            category: {
                                id: matchingCategory.id,
                                name: matchingCategory.name,
                            },
                        };
                    }
                    // Nếu không tìm thấy danh mục tương ứng nhưng có categoryId
                    return {
                        ...item,
                        category: {
                            id: item.categoryId,
                            name:
                                item.categoryName ||
                                `Danh mục ${item.categoryId}`,
                        },
                    };
                }

                // Nếu không có thông tin danh mục
                return {
                    ...item,
                    category: { id: 0, name: "Không phân loại" },
                };
            });

           
            setBranchItems(processedItems);
        } catch (error) {
            console.error("Error fetching branch items:", error);
            message.error("Không thể tải danh sách vật dụng của chi nhánh");
            setBranchItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    const fetchRoomItems = async (roomId) => {
        try {
            console.log(`Fetching items for room ID: ${roomId}`);
            const items = await getRoomItems(roomId);
            console.log(`Received ${items.length} items for room:`, items);

            // Process items to ensure valid category structure
            const processedItems = items.map((item) => {
                // If item already has a valid category structure, return as is
                if (
                    item.category &&
                    typeof item.category === "object" &&
                    item.category.id &&
                    item.category.name
                ) {
                    return item;
                }

                // If item has categoryId but no category object or invalid category object
                if (item.categoryId) {
                    const matchingCategory = categories.find(
                        (c) => c.id === item.categoryId
                    );
                    if (matchingCategory) {
                        return {
                            ...item,
                            category: {
                                id: matchingCategory.id,
                                name: matchingCategory.name,
                            },
                        };
                    }
                    return {
                        ...item,
                        category: {
                            id: item.categoryId,
                            name:
                                item.categoryName ||
                                `Danh mục ${item.categoryId}`,
                        },
                    };
                }

                // If no category information at all
                return {
                    ...item,
                    category: { id: 0, name: "Không phân loại" },
                };
            });

            console.log(
                "Processed room items with categories:",
                processedItems
            );

            // Extract item IDs
            const itemIds = processedItems.map((item) => item.id);
           
            setSelectedItems(itemIds);
            setRoomItemsLoaded(true);
        } catch (error) {
            console.error("Error fetching room items:", error);
            setSelectedItems([]);
            setRoomItemsLoaded(true);
        }
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                // Add selected items to the form values
                const formData = {
                    ...values,
                    itemIds: selectedItems,
                };

               
               

                // Thêm trường floor từ thông tin tầng
                if (values.floorId) {
                    const selectedFloor = floors.find(
                        (floor) => floor.id === values.floorId
                    );
                    if (selectedFloor && selectedFloor.floorNumber) {
                        formData.floor = selectedFloor.floorNumber;
                    } else {
                        // Đặt mặc định là 1 nếu không tìm thấy
                        formData.floor = 1;
                    }
                }

               
                onSubmit(formData);
                form.resetFields();
                onClose();
            })
            .catch((errors) => {
                console.error("Form validation errors:", errors);
                message.error("Vui lòng kiểm tra lại thông tin!");
            });
    };

    // Find branch name by ID
    const findBranchName = (branchId) => {
        if (!branchId || !branches) return "";
        const branch = branches.find((b) => b.id === branchId);
        return branch ? branch.name : "";
    };

    const handleBranchChange = (value) => {
        console.log(`Branch selection changed to ID: ${value}`);

        // Khi thay đổi chi nhánh, xóa các vật dụng đã chọn trước đó
        setSelectedItems([]);

        // Tải danh mục và vật dụng của chi nhánh mới
        if (value) {
            fetchCategories(value).then(() => {
                fetchBranchItems(value);
            });
        } else {
            setBranchItems([]);
            setCategories([]);
        }
    };

    const handleReloadItems = () => {
        const branchId = form.getFieldValue("branchId");
        if (branchId) {
            fetchBranchItems(branchId);

            // Nếu đang chỉnh sửa phòng, cũng tải lại các vật dụng đã chọn
            if (initialData?.id) {
                fetchRoomItems(initialData.id);
            }
        } else {
            message.warning("Vui lòng chọn chi nhánh trước");
        }
    };

    const handleItemToggle = (itemId) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(itemId)) {
                return prevSelected.filter((id) => id !== itemId);
            } else {
                return [...prevSelected, itemId];
            }
        });
    };

    // Filter items based on search text and category
    const filteredItems = branchItems.filter((item) => {
        // Lọc theo nội dung tìm kiếm
        const matchesSearch =
            !searchText ||
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.description &&
                item.description
                    .toLowerCase()
                    .includes(searchText.toLowerCase())) ||
            (item.category?.name &&
                item.category.name
                    .toLowerCase()
                    .includes(searchText.toLowerCase()));

        // Lọc theo danh mục
        const matchesCategory =
            !selectedCategory ||
            (item.category &&
                item.category.id === parseInt(selectedCategory, 10));

        return matchesSearch && matchesCategory;
    });

    return (
        <Modal
            title={
                <Space>
                    <HomeOutlined />
                    {initialData ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                setSelectedItems([]);
                setRoomItemsLoaded(false);
                onClose();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={800}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="roomCode"
                            label="Mã phòng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mã phòng!",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập mã phòng" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="branchId"
                            label="Chi nhánh"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chi nhánh!",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn chi nhánh"
                                options={branches.map((branch) => ({
                                    value: branch.id,
                                    label: branch.name,
                                }))}
                                onChange={handleBranchChange}
                                loading={loading}
                                disabled={selectedBranch !== null}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="roomTypeId"
                            label="Loại phòng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn loại phòng!",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn loại phòng"
                                options={roomTypes}
                                loading={loading}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="floorId"
                            label="Tầng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn tầng!",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn tầng"
                                options={floors.map((floor) => ({
                                    value: floor.id,
                                    label: floor.name,
                                }))}
                                loading={loading}
                                notFoundContent={
                                    floors.length === 0
                                        ? "Không có dữ liệu tầng, vui lòng tạo tầng trước"
                                        : null
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="capacity"
                            label="Sức chứa"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập sức chứa!",
                                },
                            ]}
                        >
                            <InputNumber
                                placeholder="Số người"
                                style={{ width: "100%" }}
                                min={1}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="price"
                            label="Giá phòng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá phòng!",
                                },
                            ]}
                        >
                            <InputNumber
                                placeholder="Giá phòng"
                                style={{ width: "100%" }}
                                min={0}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn trạng thái!",
                        },
                    ]}
                >
                    <Select placeholder="Chọn trạng thái phòng">
                        <Select.Option value="Available">
                            <Tag color="green">Còn trống</Tag>
                        </Select.Option>
                        <Select.Option value="Booked">
                            <Tag color="red">Đã đặt</Tag>
                        </Select.Option>
                        <Select.Option value="Cleaning">
                            <Tag color="orange">Đang dọn</Tag>
                        </Select.Option>
                        <Select.Option value="Maintenance">
                            <Tag color="blue">Bảo trì</Tag>
                        </Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="amenities"
                    label="Tiện nghi"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn ít nhất một tiện nghi!",
                        },
                    ]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn tiện nghi"
                        loading={amenitiesLoading}
                        options={amenitiesOptions}
                    />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea
                        rows={3}
                        placeholder="Nhập mô tả chi tiết về phòng (tùy chọn)"
                    />
                </Form.Item>

                <Divider orientation="left">
                    <Space>
                        <InboxOutlined />
                        Danh sách vật dụng
                        <Tooltip title="Tải lại danh sách vật dụng">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                size="small"
                                onClick={handleReloadItems}
                                loading={itemsLoading}
                            />
                        </Tooltip>
                    </Space>
                </Divider>

                {itemsLoading ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: 16,
                        }}
                    >
                        <Spin />
                    </div>
                ) : (
                    <>
                        <Input
                            placeholder="Tìm kiếm vật dụng"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ marginBottom: 16 }}
                        />

                        <Row style={{ marginBottom: 8 }}>
                            <Col span={24} style={{ textAlign: "right" }}>
                                <Text type="secondary">
                                    {selectedItems.length > 0
                                        ? `Đã chọn ${selectedItems.length} vật dụng`
                                        : roomItemsLoaded && initialData?.id
                                        ? "Chưa có vật dụng nào được chọn"
                                        : ""}
                                </Text>
                            </Col>
                        </Row>

                        {branchItems.length > 0 ? (
                            <List
                                grid={{
                                    gutter: 16,
                                    xs: 1,
                                    sm: 2,
                                    md: 2,
                                    lg: 3,
                                    xl: 3,
                                    xxl: 3,
                                }}
                                dataSource={filteredItems}
                                renderItem={(item) => (
                                    <List.Item key={item.id}>
                                        <Card
                                            size="small"
                                            hoverable
                                            onClick={() =>
                                                handleItemToggle(item.id)
                                            }
                                            style={{
                                                border: selectedItems.includes(
                                                    item.id
                                                )
                                                    ? "1px solid #1890ff"
                                                    : "1px solid #d9d9d9",
                                                background:
                                                    selectedItems.includes(
                                                        item.id
                                                    )
                                                        ? "#e6f7ff"
                                                        : "white",
                                            }}
                                        >
                                            <Checkbox
                                                checked={selectedItems.includes(
                                                    item.id
                                                )}
                                            >
                                                <Space direction="vertical">
                                                    <Text strong>
                                                        {item.name}
                                                    </Text>
                                                    <Space>
                                                        <Text
                                                            type="secondary"
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {item.category
                                                                ?.name ||
                                                                "Không có danh mục"}
                                                        </Text>
                                                        {item.stockQuantity !==
                                                            undefined && (
                                                            <Tag
                                                                color={
                                                                    item.stockQuantity >
                                                                    0
                                                                        ? "green"
                                                                        : "red"
                                                                }
                                                            >
                                                                {item.stockQuantity >
                                                                0
                                                                    ? `Còn ${item.stockQuantity}`
                                                                    : "Hết hàng"}
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </Space>
                                            </Checkbox>
                                        </Card>
                                    </List.Item>
                                )}
                                locale={{
                                    emptyText: (
                                        <Empty
                                            description="Không tìm thấy vật dụng nào phù hợp với tìm kiếm"
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    ),
                                }}
                            />
                        ) : (
                            <Alert
                                message="Không có vật dụng nào"
                                description={
                                    form.getFieldValue("branchId")
                                        ? initialData?.id
                                            ? "Không tìm thấy vật dụng nào. Hãy đảm bảo chi nhánh đã được chọn đúng và có vật dụng."
                                            : "Chi nhánh này chưa có vật dụng nào. Vui lòng thêm vật dụng cho chi nhánh trước."
                                        : "Vui lòng chọn chi nhánh để xem danh sách vật dụng."
                                }
                                type="info"
                                showIcon
                                action={
                                    form.getFieldValue("branchId") && (
                                        <Button
                                            size="small"
                                            icon={<ReloadOutlined />}
                                            onClick={handleReloadItems}
                                        >
                                            Tải lại
                                        </Button>
                                    )
                                }
                            />
                        )}
                    </>
                )}

                {!apiErrors.items && (
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <Space>
                                <FilterOutlined />
                                <Text strong>Lọc theo danh mục:</Text>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Tất cả danh mục"
                                    allowClear
                                    value={selectedCategory}
                                    onChange={(value) => {
                                        console.log(
                                            `Category filter changed to: ${value}`
                                        );
                                        setSelectedCategory(value);
                                    }}
                                    options={[
                                        {
                                            value: null,
                                            label: "Tất cả danh mục",
                                        },
                                        ...displayCategories.map(
                                            (category) => ({
                                                value: category.id,
                                                label:
                                                    category.name ||
                                                    "Không xác định",
                                            })
                                        ),
                                    ]}
                                    optionFilterProp="label"
                                    showSearch
                                    status={apiErrors.categories ? "error" : ""}
                                    disabled={
                                        apiErrors.categories ||
                                        displayCategories.length === 0
                                    }
                                    loading={loading}
                                    notFoundContent={
                                        displayCategories.length === 0
                                            ? "Không có danh mục nào"
                                            : undefined
                                    }
                                />
                                {apiErrors.categories && (
                                    <Tooltip title="Không thể tải danh mục đầy đủ. Hiển thị danh mục từ vật dụng trong phòng.">
                                        <ExclamationCircleOutlined
                                            style={{ color: "#ff4d4f" }}
                                        />
                                    </Tooltip>
                                )}
                            </Space>
                        </Col>
                    </Row>
                )}
            </Form>

            {initialData &&
            {selectedItems.length > 0 &&
               
        </Modal>
    );
}
