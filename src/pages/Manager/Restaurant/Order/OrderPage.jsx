import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Layout,
    Row,
    Col,
    Card,
    Button,
    Tabs,
    Input,
    List,
    Badge,
    Drawer,
    Divider,
    Space,
    Modal,
    message,
    Tag,
    Tooltip,
    Select,
    Spin,
    Form,
} from "antd";
import {
    TableOutlined,
    ShoppingCartOutlined,
    SendOutlined,
    DollarOutlined,
    SearchOutlined,
    MenuOutlined,
    UserOutlined,
    PictureOutlined,
    CoffeeOutlined,
    RollbackOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { areasRestaurantApi } from "../../../../api/areasRestaurantApi";
import { tableApi, foodApi } from "../../../../api/restaurantApi";
import { menuApi } from "../../../../api/menuApi";
import { restaurantOrderApi } from "../../../../api/restaurantOrderApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";
import { Tabs as AntTabs } from "antd";
import { staticUrl } from "../../../../configs/apiClient";
import store from "../../../../store/store";
import {
    saveOrder,
    updateOrder,
    removeOrder,
    updateOrderItemStatus,
    selectOrderByTableId,
    addOrderItem,
    addToCart,
    removeFromCart,
    clearCart,
    setCart,
    selectCartByTableId,
    setProcessingOrder,
    selectProcessingOrderByTableId,
} from "../../../../store/orderSlice";
import dayjs from "dayjs";
import * as paymentsApi from "../../../../api/paymentsApi";

// Import Modal Components
import SendToKitchenModal from "./Modals/SendToKitchenModal";
import OrderNoteModal from "./Modals/OrderNoteModal";
import ServiceItemsModal from "./Modals/ServiceItemsModal";

const { Content } = Layout;
const { TabPane } = Tabs;

const statusMap = {
    available: { color: "#52c41a", text: "Trống" },
    occupied: { color: "#f5222d", text: "Đang dùng" },
    reserved: { color: "#faad14", text: "Đặt trước" },
    maintenance: { color: "#1890ff", text: "Bảo trì" },
};

// Đặt hàm getTotalAmount ở đây để tránh lỗi hoisting
const getTotalAmount = (orders) => {
    return orders.reduce((sum, i) => {
        const price =
            typeof i.price === "number" ? i.price : parseFloat(i.price) || 0;
        const qty = typeof i.qty === "number" ? i.qty : i.quantity || 0;
        return sum + price * qty;
    }, 0);
};

// Thêm hàm chuẩn hóa order
function normalizeOrder(order) {
    return {
        ...order,
        id: typeof order.id === "object" ? JSON.stringify(order.id) : order.id,
        items: (order.items || []).map((item) => ({
            ...item,
            id: typeof item.id === "object" ? JSON.stringify(item.id) : item.id,
            price: Number(item.price),
            quantity: Number(item.qty || item.quantity || 1),
        })),
        branchId: Number(order.branchId),
        table: order.table
            ? {
                  ...order.table,
                  id:
                      typeof order.table.id === "object"
                          ? JSON.stringify(order.table.id)
                          : order.table.id,
              }
            : null,
    };
}

// Hàm xác định dịch vụ có cần gửi bếp không
const requiresKitchen = (item) => {
    if (item.type !== "service") return true; // food luôn cần gửi bếp
    const typeObj =
        item.serviceType ||
        (serviceTypes && serviceTypes.find((t) => t.id === item.serviceTypeId));
    const typeName = typeObj?.name?.toLowerCase() || "";
    // Ưu tiên kiểm tra chính xác tên loại dịch vụ
    if (typeName === "Đồ dùng kèm") return false; // Dùng ngay
    if (typeName === "Đồ ăn kèm") return true; // Gửi bếp
    // Các logic cũ vẫn giữ lại cho các loại khác
    const notKitchenKeywords = [
        "đồ dùng bàn",
        "khăn",
        "dụng cụ ăn",
        "đũa",
        "chén",
        "ly",
        "cốc",
        "bát",
        "muỗng",
        "thìa",
        "tăm",
        "khay",
        "khay đựng",
        "giấy",
        "giấy ăn",
        "khay giấy",
        "bình nước",
        "bình giữ nhiệt",
        "bình trà",
        "ấm trà",
        "ấm nước",
        "khăn giấy",
        "khăn ướt",
        "khăn lạnh",
    ];
    const kitchenKeywords = [
        "đồ ăn kèm",
        "món thêm",
        "thức ăn",
        "món ăn",
        "món chính",
        "món phụ",
        "thức uống pha chế",
        "đồ uống pha chế",
        "nước ép",
        "nước uống",
        "đồ ăn",
        "thức uống",
        "món gọi thêm",
        "gọi thêm",
        "phục vụ bếp",
        "bếp",
    ];
    for (const kw of notKitchenKeywords) {
        if (typeName.includes(kw)) return false;
    }
    for (const kw of kitchenKeywords) {
        if (typeName.includes(kw)) return true;
    }
    if (typeName.includes("dịch vụ") || typeName.includes("tiện ích"))
        return false;
    return false;
};

export default function OrderPage() {
    const [areas, setAreas] = useState([]);
    const [tables, setTables] = useState([]);
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [activeTab, setActiveTab] = useState("");
    const [search, setSearch] = useState("");
    const [orderNote, setOrderNote] = useState("");
    const [noteModal, setNoteModal] = useState({
        open: false,
        item: null,
        value: "",
    });
    const [showSendModal, setShowSendModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [loadingTables, setLoadingTables] = useState(false);
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [mainTab, setMainTab] = useState("select-table");
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState("all");
    const [tableSearch, setTableSearch] = useState("");
    const [tableStatus, setTableStatus] = useState("all");
    const [tableCapacity, setTableCapacity] = useState("all");
    const [tableSort, setTableSort] = useState("number-asc");
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [orderPriority, setOrderPriority] = useState("normal");
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [selectedBranchName, setSelectedBranchName] = useState(null);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const savedOrder = useSelector((state) =>
        selectedTable ? selectOrderByTableId(state, selectedTable.id) : null
    );
    const cart = useSelector((state) =>
        selectedTable ? selectCartByTableId(state, selectedTable.id) : []
    );
    const processingOrders = useSelector((state) =>
        selectedTable
            ? selectProcessingOrderByTableId(state, selectedTable.id)
            : []
    );
    const orderData = useSelector((state) =>
        selectedTable ? selectOrderByTableId(state, selectedTable.id) : null
    );

    // Định nghĩa hàm loadExistingOrder ở đầu component để tránh lỗi phạm vi
    const loadExistingOrder = async (tableId) => {
        try {
            setLoadingOrder(true);
            const orders = await restaurantOrderApi.getOrdersByTable(tableId);
            // Tìm đơn hàng active (new hoặc preparing)
            const activeOrders = orders.filter(
                (order) =>
                    order.status === "new" || order.status === "preparing"
            );
            if (activeOrders.length === 0) {
                setCurrentOrderId(null);
                setOrderNote("");
                dispatch(clearCart({ tableId }));
                dispatch(setProcessingOrder({ tableId, items: [] }));
                return;
            }
            const currentOrder = activeOrders.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            setCurrentOrderId(currentOrder.id);
            setOrderNote(currentOrder.note || "");
            // Cart: chỉ lấy các item chưa served
            const cartItems = (currentOrder.items || []).filter(
                (item) => item.status === "new" || item.status === "preparing"
            );
            dispatch(setCart({ tableId, items: cartItems }));
            // Processing: chỉ lấy các item đã served hoặc completed
            const completedItems = (currentOrder.items || []).filter((item) =>
                ["served", "completed", "done"].includes(item.status)
            );
            dispatch(setProcessingOrder({ tableId, items: completedItems }));
            // Luôn lưu lại orderId mới nhất cho bàn
            dispatch(saveOrder({ tableId, orderData: currentOrder }));
        } catch (error) {
            console.error("Error loading existing order:", error);
            setCurrentOrderId(null);
            setOrderNote("");
            dispatch(clearCart({ tableId }));
            dispatch(setProcessingOrder({ tableId, items: [] }));
        } finally {
            setLoadingOrder(false);
        }
    };

    useEffect(() => {
        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                const restaurantBranches = await getRestaurantBranches();
                setBranches(restaurantBranches);
                if (restaurantBranches.length > 0) {
                    const savedBranchId = localStorage.getItem(
                        "selectedRestaurantBranchId"
                    );
                    const defaultBranchId =
                        savedBranchId || restaurantBranches[0].id;
                    setSelectedBranchId(defaultBranchId);

                    // Tìm và lưu tên chi nhánh
                    const selectedBranch = restaurantBranches.find(
                        (branch) => branch.id == defaultBranchId
                    );
                    if (selectedBranch) {
                        setSelectedBranchName(selectedBranch.name);
                    }
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
                message.error("Không thể tải danh sách chi nhánh nhà hàng!");
            } finally {
                setLoadingBranches(false);
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        if (selectedTable && selectedTable.id) {
            const savedOrder = selectOrderByTableId(
                store.getState(),
                selectedTable.id
            );

            if (savedOrder) {
                setCurrentOrderId(savedOrder.id);
                setOrderNote(savedOrder.note || "");
            }
        }
    }, [selectedTable]);

    useEffect(() => {
        if (!selectedBranchId) return;

        localStorage.setItem("selectedRestaurantBranchId", selectedBranchId);

        setLoadingAreas(true);
        setSelectedTable(null);

        areasRestaurantApi
            .getAreas({ branchId: selectedBranchId })
            .then((data) => {
                setAreas(data);
            })
            .catch(() => message.error("Không thể tải khu vực!"))
            .finally(() => setLoadingAreas(false));
    }, [selectedBranchId]);

    useEffect(() => {
        if (!selectedBranchId) return;

        setLoadingTables(true);
        const getTablesFunction = tableApi.getAllTables || tableApi.getAll;

        getTablesFunction({ branchId: selectedBranchId })
            .then((data) => {
                if (Array.isArray(data)) setTables(data);
                else if (data && Array.isArray(data.data)) setTables(data.data);
                else setTables([]);
            })
            .catch(() => message.error("Không thể tải bàn!"))
            .finally(() => setLoadingTables(false));
    }, [selectedBranchId]);

    useEffect(() => {
        if (!selectedBranchId) return;

        menuApi
            .getAll({ branchId: selectedBranchId })
            .then((data) => {
                const menus = Array.isArray(data) ? data : data.data || [];
                setMenus(menus);
            })
            .catch(() => message.error("Không thể tải danh sách thực đơn!"));

        setLoadingMenu(true);
        Promise.all([
            foodApi.getAllFoods({ branchId: selectedBranchId }),
            foodApi
                .getAllFoods({ branchId: selectedBranchId })
                .then((response) => {
                    const foods = response.data || response;
                    const categories = [];
                    foods.forEach((food) => {
                        if (
                            food.category &&
                            food.category.name &&
                            !categories.find((c) => c.id === food.category.id)
                        ) {
                            categories.push({
                                id: food.category.id,
                                name: food.category.name,
                            });
                        }
                    });
                    return categories;
                }),
        ])
            .then(([response, categories]) => {
                const foods = response.data || response;
                const validFoodData = foods.map((item) => ({
                    id: item.id,
                    name: item.name || "Chưa có tên",
                    price:
                        typeof item.price === "string"
                            ? parseFloat(item.price)
                            : item.price || 0,
                    category: item.category?.name || "Khác",
                    categoryId: item.category?.id,
                    description: item.description || "Chưa có mô tả",
                    imageUrl: item.imageUrl || item.thumbnailUrl,
                    isVegetarian: item.isVegetarian,
                    isVegan: item.isVegan,
                    isGlutenFree: item.isGlutenFree,
                    spicyLevel: item.spicyLevel,
                    menuIds: item.menus ? item.menus.map((m) => m.id) : [],
                }));
                setMenu(validFoodData);
                setCategories(categories);
                if (categories.length > 0) {
                    setActiveTab(categories[0].id);
                }
            })
            .catch((error) => {
                console.error("Error loading foods:", error);
                message.error("Không thể tải danh sách món ăn!");
            })
            .finally(() => setLoadingMenu(false));
    }, [selectedBranchId]);

    useEffect(() => {
        setOrderNote("");
    }, [selectedTable]);

    const uniqueCapacities = useMemo(() => {
        const allCaps = tables.map((t) => t.capacity).filter(Boolean);
        return Array.from(new Set(allCaps)).sort((a, b) => a - b);
    }, [tables]);

    const handleBranchChange = (value) => {
        setSelectedBranchId(value);
        // Tìm và lưu tên chi nhánh
        const selectedBranch = branches.find((branch) => branch.id == value);
        if (selectedBranch) {
            setSelectedBranchName(selectedBranch.name);
        }
    };

    const TableGrid = () => (
        <div style={{ padding: 16 }}>
            <div
                style={{
                    display: "flex",
                    marginBottom: 18,
                    justifyContent: "flex-end",
                }}
            >
                <div
                    style={{
                        marginRight: "auto",
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <Input
                        placeholder="Tìm kiếm số bàn..."
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        style={{ width: 180 }}
                        allowClear
                    />
                    <Select
                        value={tableStatus}
                        onChange={setTableStatus}
                        style={{ width: 140 }}
                    >
                        <Select.Option value="all">
                            Tất cả trạng thái
                        </Select.Option>
                        <Select.Option value="available">Trống</Select.Option>
                        <Select.Option value="occupied">
                            Đang dùng
                        </Select.Option>
                        <Select.Option value="reserved">
                            Đặt trước
                        </Select.Option>
                        <Select.Option value="maintenance">
                            Bảo trì
                        </Select.Option>
                    </Select>
                    <Select
                        value={tableCapacity}
                        onChange={setTableCapacity}
                        style={{ width: 120 }}
                    >
                        <Select.Option value="all">Tất cả số ghế</Select.Option>
                        {uniqueCapacities.map((cap) => (
                            <Select.Option key={cap} value={cap}>
                                {cap} ghế
                            </Select.Option>
                        ))}
                    </Select>
                    <Select
                        value={tableSort}
                        onChange={setTableSort}
                        style={{ width: 160 }}
                    >
                        <Select.Option value="number-asc">
                            Số bàn tăng dần
                        </Select.Option>
                        <Select.Option value="number-desc">
                            Số bàn giảm dần
                        </Select.Option>
                        <Select.Option value="capacity-asc">
                            Số ghế tăng dần
                        </Select.Option>
                        <Select.Option value="capacity-desc">
                            Số ghế giảm dần
                        </Select.Option>
                    </Select>
                </div>
                <Select
                    placeholder="Chọn chi nhánh"
                    style={{ width: 220 }}
                    value={selectedBranchName || selectedBranchId}
                    onChange={handleBranchChange}
                    loading={loadingBranches}
                    disabled={loadingBranches}
                >
                    {branches.map((branch) => (
                        <Select.Option key={branch.id} value={branch.id}>
                            {branch.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            <Spin spinning={loadingAreas || loadingTables}>
                {areas.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#aaa" }}>
                        Không có khu vực nào.
                    </div>
                ) : (
                    areas.map((area) => {
                        let tablesInArea = tables.filter(
                            (t) =>
                                t.areaId === area.id || t.area?.id === area.id
                        );
                        if (tableSearch) {
                            tablesInArea = tablesInArea.filter((t) =>
                                (t.tableNumber || "")
                                    .toLowerCase()
                                    .includes(tableSearch.toLowerCase())
                            );
                        }
                        if (tableStatus !== "all") {
                            tablesInArea = tablesInArea.filter(
                                (t) => t.status === tableStatus
                            );
                        }
                        if (tableCapacity !== "all") {
                            tablesInArea = tablesInArea.filter(
                                (t) =>
                                    String(t.capacity) === String(tableCapacity)
                            );
                        }
                        tablesInArea = tablesInArea.slice();
                        if (tableSort === "number-asc") {
                            tablesInArea.sort((a, b) =>
                                (a.tableNumber || "").localeCompare(
                                    b.tableNumber || ""
                                )
                            );
                        } else if (tableSort === "number-desc") {
                            tablesInArea.sort((a, b) =>
                                (b.tableNumber || "").localeCompare(
                                    a.tableNumber || ""
                                )
                            );
                        } else if (tableSort === "capacity-asc") {
                            tablesInArea.sort(
                                (a, b) => (a.capacity || 0) - (b.capacity || 0)
                            );
                        } else if (tableSort === "capacity-desc") {
                            tablesInArea.sort(
                                (a, b) => (b.capacity || 0) - (a.capacity || 0)
                            );
                        }
                        return (
                            <div key={area.id} style={{ marginBottom: 32 }}>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 18,
                                        marginBottom: 12,
                                        color: "#1890ff",
                                    }}
                                >
                                    {area.name}
                                </div>
                                <Row gutter={[16, 16]}>
                                    {tablesInArea.length === 0 && (
                                        <Col
                                            span={24}
                                            style={{
                                                textAlign: "center",
                                                color: "#aaa",
                                            }}
                                        >
                                            Không có bàn nào trong khu vực này.
                                        </Col>
                                    )}
                                    {tablesInArea.map((table) => (
                                        <Col
                                            xs={24}
                                            sm={12}
                                            md={8}
                                            lg={6}
                                            xl={4}
                                            key={table.id}
                                        >
                                            <Tooltip
                                                title={
                                                    <div>
                                                        <div>
                                                            <b>
                                                                {
                                                                    table.tableNumber
                                                                }
                                                            </b>
                                                        </div>
                                                        <div>
                                                            Trạng thái:{" "}
                                                            <span
                                                                style={{
                                                                    color: statusMap[
                                                                        table
                                                                            .status
                                                                    ]?.color,
                                                                }}
                                                            >
                                                                {statusMap[
                                                                    table.status
                                                                ]?.text ||
                                                                    table.status}
                                                            </span>
                                                        </div>
                                                        {table.capacity && (
                                                            <div>
                                                                Số ghế:{" "}
                                                                {table.capacity}
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <Card
                                                    hoverable
                                                    style={{
                                                        background:
                                                            statusMap[
                                                                table.status
                                                            ]?.color ||
                                                            "#d9d9d9",
                                                        color: "#fff",
                                                        border:
                                                            selectedTable?.id ===
                                                            table.id
                                                                ? "3px solid #faad14"
                                                                : "2px solid #fff",
                                                        textAlign: "center",
                                                        cursor:
                                                            table.status ===
                                                                "available" ||
                                                            table.status ===
                                                                "occupied"
                                                                ? "pointer"
                                                                : "not-allowed",
                                                        fontWeight: 600,
                                                        boxShadow:
                                                            selectedTable?.id ===
                                                            table.id
                                                                ? "0 0 10px #faad14"
                                                                : undefined,
                                                        opacity:
                                                            table.status ===
                                                                "available" ||
                                                            table.status ===
                                                                "occupied"
                                                                ? 1
                                                                : 0.7,
                                                        transition: "all 0.2s",
                                                        borderRadius: 12,
                                                        paddingTop: 8,
                                                        paddingBottom: 8,
                                                    }}
                                                    onClick={() =>
                                                        handleTableSelect(table)
                                                    }
                                                    size="small"
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 20,
                                                            fontWeight: 800,
                                                            letterSpacing: 1,
                                                            color: "#fff",
                                                            textShadow:
                                                                "0 1px 2px #000, 0 0 4px #faad14",
                                                            marginBottom: 4,
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {table.tableNumber}
                                                    </div>
                                                    <TableOutlined
                                                        style={{
                                                            fontSize: 28,
                                                            marginBottom: 4,
                                                        }}
                                                    />
                                                    {table.capacity && (
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            <UserOutlined />{" "}
                                                            {table.capacity} ghế
                                                        </div>
                                                    )}
                                                    <div
                                                        style={{ marginTop: 6 }}
                                                    >
                                                        <Tag
                                                            color="#fff"
                                                            style={{
                                                                color:
                                                                    statusMap[
                                                                        table
                                                                            .status
                                                                    ]?.color ||
                                                                    "#333",
                                                                border: "none",
                                                            }}
                                                        >
                                                            {statusMap[
                                                                table.status
                                                            ]?.text ||
                                                                table.status}
                                                        </Tag>
                                                    </div>
                                                </Card>
                                            </Tooltip>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        );
                    })
                )}
            </Spin>
        </div>
    );

    const MenuTabsFilter = () => (
        <AntTabs
            activeKey={selectedMenu}
            onChange={setSelectedMenu}
            tabBarGutter={16}
            style={{ marginBottom: 16 }}
            type="line"
        >
            <AntTabs.TabPane
                tab={
                    <span style={{ color: "#1890ff", fontWeight: 600 }}>
                        Tất cả
                    </span>
                }
                key="all"
            />
            {menus.map((m) => (
                <AntTabs.TabPane
                    tab={<span style={{ color: "#1890ff" }}>{m.name}</span>}
                    key={m.id}
                />
            ))}
        </AntTabs>
    );

    const MenuList = () => {
        let allowedFoodIds = null;
        if (selectedMenu !== "all") {
            const menuObj = menus.find((m) => m.id === selectedMenu);
            if (menuObj) {
                allowedFoodIds = Array.isArray(menuObj.foods)
                    ? menuObj.foods.map((f) =>
                          typeof f === "object" ? f.id : f
                      )
                    : [];
                if (Array.isArray(menuObj.foodIds)) {
                    allowedFoodIds = menuObj.foodIds;
                }
            }
        }
        return (
            <Spin spinning={loadingMenu}>
                <Row gutter={[16, 16]}>
                    {menu.length === 0 ? (
                        <Col
                            span={24}
                            style={{ textAlign: "center", padding: "40px 0" }}
                        >
                            <div style={{ color: "#999" }}>
                                Không tìm thấy món ăn nào
                            </div>
                        </Col>
                    ) : (
                        menu
                            .filter((m) => {
                                if (selectedMenu === "all")
                                    return m.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase());
                                if (!allowedFoodIds) return false;
                                return (
                                    allowedFoodIds.includes(m.id) &&
                                    m.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                                );
                            })
                            .map((m) => {
                                let img = m.imageUrl || m.thumbnailUrl;
                                if (!img && m.category && m.category.imageUrl)
                                    img = m.category.imageUrl;
                                const imgSrc = img ? staticUrl(img) : null;
                                return (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        md={8}
                                        lg={8}
                                        key={m.id}
                                    >
                                        <Card
                                            hoverable
                                            title={m.name}
                                            extra={
                                                <span
                                                    style={{
                                                        color: "#fa541c",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {(
                                                        m.price || 0
                                                    ).toLocaleString("vi-VN")}
                                                    đ
                                                </span>
                                            }
                                            cover={
                                                imgSrc ? (
                                                    <img
                                                        alt={m.name}
                                                        src={imgSrc}
                                                        style={{
                                                            width: "100%",
                                                            height: 140,
                                                            objectFit: "cover",
                                                            borderRadius: 4,
                                                            background:
                                                                "#f0f0f0",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            height: 140,
                                                            background:
                                                                "#f0f0f0",
                                                            borderRadius: 4,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            color: "#bbb",
                                                            fontSize: 16,
                                                        }}
                                                    >
                                                        <PictureOutlined
                                                            style={{
                                                                fontSize: 32,
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                marginLeft: 8,
                                                            }}
                                                        >
                                                            Không có ảnh
                                                        </span>
                                                    </div>
                                                )
                                            }
                                            style={{
                                                cursor: "pointer",
                                                minHeight: 120,
                                            }}
                                        >
                                            <div style={{ minHeight: 40 }}>
                                                {m.description}
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                {m.isVegetarian && (
                                                    <Tag color="green">
                                                        Chay
                                                    </Tag>
                                                )}
                                                {m.isGlutenFree && (
                                                    <Tag color="blue">
                                                        Không gluten
                                                    </Tag>
                                                )}
                                                {m.spicyLevel && (
                                                    <Tag color="red">
                                                        Cay {m.spicyLevel}
                                                    </Tag>
                                                )}
                                            </div>
                                            <Button
                                                type="primary"
                                                icon={<ShoppingCartOutlined />}
                                                style={{ marginTop: 8 }}
                                                onClick={() => {
                                                    if (!selectedTable) {
                                                        message.warning(
                                                            "Vui lòng chọn bàn trước!"
                                                        );
                                                        return;
                                                    }
                                                    dispatch(
                                                        addToCart({
                                                            tableId:
                                                                selectedTable.id,
                                                            item: {
                                                                id: m.id,
                                                                type: "food",
                                                                name: m.name,
                                                                price: m.price,
                                                                quantity: 1,
                                                                note: "",
                                                                status: "new",
                                                            },
                                                        })
                                                    );
                                                }}
                                            >
                                                Chọn
                                            </Button>
                                        </Card>
                                    </Col>
                                );
                            })
                    )}
                </Row>
            </Spin>
        );
    };

    const handleAddNote = (item) => {
        setNoteModal({ open: true, item, value: item.note || "" });
    };
    const handleSaveNote = () => {
        dispatch(
            updateOrderItemStatus({
                tableId: selectedTable.id,
                itemId: noteModal.item.id,
                status: "completed",
                note: noteModal.value,
            })
        );
        setNoteModal({ open: false, item: null, value: "" });
    };

    const handleSendKitchen = async () => {
        if (!selectedTable) {
            message.warning("Vui lòng chọn bàn trước!");
            return;
        }

        const orderData = {
            tableId: parseInt(selectedTable.id, 10),
            tableNumber: selectedTable.tableNumber,
            branchId: parseInt(selectedBranchId, 10),
            items: cart.map((item) => ({
                type: item.type,
                foodId: item.type === "food" ? item.id : null,
                itemId: item.type === "service" ? item.id : null,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                note: item.note || "",
                status: "new",
            })),
            note: orderNote || "",
            status: "new",
            priority: orderPriority,
            orderTime: new Date().toISOString(),
        };

        try {
            const response = await restaurantOrderApi.create(orderData);

            // Cập nhật Redux
            dispatch(
                saveOrder({
                    tableId: selectedTable.id,
                    orderData: {
                        ...orderData,
                        id: response.id,
                    },
                })
            );

            // Cập nhật local state
            setCurrentOrderId(response.id);
            dispatch(clearCart({ tableId: selectedTable.id }));
            message.success("Đã gửi đơn hàng đến bếp!");

            // Cập nhật trạng thái bàn nếu cần
            if (selectedTable.status === "available") {
                try {
                    await tableApi.updateTable(selectedTable.id, {
                        status: "occupied",
                    });
                } catch (error) {
                    console.error("Error updating table status:", error);
                }
            }
        } catch (error) {
            console.error("Error sending order to kitchen:", error);
            message.error("Lỗi khi gửi đơn hàng đến bếp!");
        }
    };

    const handleSendAllToKitchen = async () => {
        if (!selectedTable) {
            message.warning("Vui lòng chọn bàn trước!");
            return;
        }
        if (cart.length === 0) {
            message.warning("Chưa có món nào trong đơn hàng!");
            return;
        }
        // Lọc các item cần gửi bếp và build đúng payload
        const itemsToSend = cart
            .filter(
                (item) =>
                    item.type === "food" ||
                    (item.type === "service" && requiresKitchen(item))
            )
            .map((item) => ({
                ...item,
                foodId: item.type === "food" ? String(item.id) : undefined,
                itemId: item.type === "service" ? String(item.id) : undefined,
                // KHÔNG set lại status ở đây, giữ nguyên status từng item
            }));
        if (itemsToSend.length === 0) {
            message.info("Không có món/dịch vụ nào cần gửi bếp!");
            return;
        }
        try {
            let orderId = currentOrderId;
            let response;
            if (orderId) {
                // Đơn đã tồn tại, thêm món mới và gửi bếp
                await restaurantOrderApi.addMoreItemsAndSendToKitchen(
                    orderId,
                    itemsToSend
                );
            } else {
                // Tạo đơn mới và gửi bếp
                const orderData = {
                    tableId: parseInt(selectedTable.id, 10),
                    tableNumber: selectedTable.tableNumber,
                    branchId: parseInt(selectedBranchId, 10),
                    items: itemsToSend,
                    note: orderNote || "",
                    status: "new",
                    priority: orderPriority,
                    orderTime: new Date().toISOString(),
                };
                response = await restaurantOrderApi.create(orderData);
                orderId = response.id;
                setCurrentOrderId(orderId);
                await restaurantOrderApi.sendToKitchen(orderId);
            }
            // Sau khi gửi, đồng bộ lại đơn hàng từ backend
            await loadExistingOrder(selectedTable.id);
            // Xóa các item đã gửi khỏi cart
            itemsToSend.forEach((item) => {
                dispatch(
                    removeFromCart({
                        tableId: selectedTable.id,
                        itemId: item.id,
                        type: item.type,
                    })
                );
            });
            message.success("Đã gửi các món/dịch vụ cần chế biến đến bếp!");
            if (selectedTable.status === "available") {
                try {
                    await tableApi.updateTable(selectedTable.id, {
                        status: "occupied",
                    });
                } catch (error) {}
            }
            // Hợp nhất các dịch vụ dùng ngay đã có trước đó với danh sách mới từ backend
            {
                const state = store.getState();
                const oldProcessing =
                    state.order.processingOrders?.[selectedTable.id] || [];
                const oldImmediateServices = oldProcessing.filter(
                    (i) =>
                        i.type === "service" &&
                        (i.status === "completed" || !i.status)
                );
                const newProcessing =
                    store.getState().order.processingOrders?.[
                        selectedTable.id
                    ] || [];
                const merged = [
                    ...oldImmediateServices.filter(
                        (oldItem) =>
                            !newProcessing.some(
                                (newItem) => newItem.id === oldItem.id
                            )
                    ),
                    ...newProcessing,
                ];
                dispatch(
                    setProcessingOrder({
                        tableId: selectedTable.id,
                        items: merged,
                    })
                );
            }
        } catch (error) {
            console.error("Error sending items to kitchen:", error);
            message.error("Lỗi khi gửi món/dịch vụ đến bếp!");
        }
    };

    const handleSendSingleItem = async (item) => {
        try {
            if (!selectedTable) {
                message.warning("Vui lòng chọn bàn trước!");
                return;
            }

            const orderData = {
                tableId: parseInt(selectedTable.id, 10),
                tableNumber: selectedTable.tableNumber,
                branchId: parseInt(selectedBranchId, 10),
                items: [
                    {
                        foodId: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        note: item.note || "",
                        status: "new",
                        isService: item.isService || false,
                        serviceTypeId: item.serviceType?.id,
                    },
                ],
                note: orderNote || "",
                status: "new",
                priority: orderPriority,
                orderTime: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };

            let orderId = currentOrderId;
            let response;
            let sentOrderId;

            if (orderId) {
                response = await restaurantOrderApi.update(orderId, orderData);
                sentOrderId = orderId;
                message.success("Cập nhật đơn hàng thành công!");
            } else {
                response = await restaurantOrderApi.create(orderData);
                setCurrentOrderId(response.id);
                sentOrderId = response.id;
                message.success("Tạo đơn hàng mới thành công!");
            }

            await restaurantOrderApi.sendToKitchen(sentOrderId);

            // Sau khi gửi, đồng bộ lại đơn hàng từ backend
            await loadExistingOrder(selectedTable.id);

            dispatch(
                removeFromCart({
                    tableId: selectedTable.id,
                    itemId: item.id,
                    type: item.type,
                })
            );
            message.success("Đã gửi món đến bếp!");

            if (selectedTable.status === "available") {
                try {
                    await tableApi.updateTable(selectedTable.id, {
                        status: "occupied",
                    });
                } catch (error) {
                    console.error("Error updating table status:", error);
                }
            }
        } catch (error) {
            console.error("Error sending item to kitchen:", error);
            message.error("Lỗi khi gửi món đến bếp!");
        }
    };

    // Hàm gọi thêm món khi đã có đơn hàng
    const handleAddMoreItems = async () => {
        if (!selectedTable || !currentOrderId || cart.length === 0) {
            message.warning("Không có món nào để thêm vào đơn hàng!");
            return;
        }

        try {
            // Tạo dữ liệu các món mới cần thêm
            const newItems = cart.map((item) => ({
                foodId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                note: item.note || "",
                status: "new",
            }));

            // Gọi API để thêm món vào đơn hàng hiện tại và gửi đến bếp ngay
            await restaurantOrderApi.addMoreItemsAndSendToKitchen(
                currentOrderId,
                newItems
            );

            // Sau khi thêm món, đồng bộ lại đơn hàng từ backend (KHÔNG clearCart thủ công)
            await loadExistingOrder(selectedTable.id);
            message.success("Đã gửi thêm món đến bếp!");
        } catch (error) {
            console.error("Error adding more items:", error);
            message.error("Lỗi khi thêm món vào đơn hàng!");
        }
    };

    // Thêm hàm xử lý thêm món ăn vào giỏ hàng
    const handleAddFood = (food) => {
        if (!selectedTable) {
            message.warning("Vui lòng chọn bàn trước!");
            return;
        }
        const newItem = {
            id: food.id,
            type: "food",
            foodId: food.id,
            name: food.name,
            price: food.price,
            quantity: 1,
            note: "",
            status: "new",
        };
        dispatch(addToCart({ tableId: selectedTable.id, item: newItem }));
    };

    // Thêm hàm xử lý thêm dịch vụ vào giỏ hàng
    const handleAddServices = async (services) => {
        if (!selectedTable) {
            message.warning("Vui lòng chọn bàn trước!");
            return;
        }
        const kitchenServices = [];
        const nonKitchenServices = [];
        services.forEach((service) => {
            const newItem = {
                id: service.id,
                type: "service",
                itemId: service.id,
                name: service.name,
                price: service.price,
                quantity: service.quantity || 1,
                note: "",
                status: requiresKitchen(service) ? "new" : "served", // Nếu dùng ngay thì 'served', cần bếp thì 'new'
                serviceTypeId: service.serviceTypeId,
                serviceType: service.serviceType,
            };
            if (requiresKitchen(newItem)) {
                kitchenServices.push(newItem);
            } else {
                nonKitchenServices.push(newItem);
            }
        });
        // Dịch vụ dùng ngay: lưu vào backend
        if (nonKitchenServices.length > 0) {
            try {
                let orderId = currentOrderId;
                if (orderId) {
                    await restaurantOrderApi.addItems(
                        orderId,
                        nonKitchenServices
                    );
                } else {
                    // Tạo order mới chỉ với dịch vụ dùng ngay
                    const orderData = {
                        tableId: parseInt(selectedTable.id, 10),
                        tableNumber: selectedTable.tableNumber,
                        branchId: parseInt(selectedBranchId, 10),
                        items: nonKitchenServices,
                        note: orderNote || "",
                        status: "served",
                        priority: orderPriority,
                        orderTime: new Date().toISOString(),
                    };
                    const response = await restaurantOrderApi.create(orderData);
                    setCurrentOrderId(response.id);
                }
                await loadExistingOrder(selectedTable.id);
                message.success(
                    `Đã thêm ${nonKitchenServices.length} dịch vụ dùng ngay`
                );
            } catch (error) {
                message.error("Lỗi khi thêm dịch vụ dùng ngay!");
            }
        }
        // Dịch vụ cần gửi bếp: chỉ thêm vào cart Redux
        if (kitchenServices.length > 0) {
            kitchenServices.forEach((service) => {
                dispatch(
                    addToCart({
                        tableId: selectedTable.id,
                        item: service,
                    })
                );
            });
            message.success(
                `Đã thêm ${kitchenServices.length} dịch vụ cần chế biến vào giỏ hàng`
            );
        }
        setShowServiceModal(false);
    };

    // Thêm các hàm fetch lại dữ liệu
    const fetchTablesAndAreas = async () => {
        if (!selectedBranchId) return;
        setLoadingAreas(true);
        setLoadingTables(true);
        try {
            const [areasData, tablesData] = await Promise.all([
                areasRestaurantApi.getAreas({ branchId: selectedBranchId }),
                (tableApi.getAllTables || tableApi.getAll)({
                    branchId: selectedBranchId,
                }),
            ]);
            setAreas(areasData);
            if (Array.isArray(tablesData)) setTables(tablesData);
            else if (tablesData && Array.isArray(tablesData.data))
                setTables(tablesData.data);
            else setTables([]);
        } catch (e) {
            message.error("Không thể tải lại khu vực/bàn!");
        } finally {
            setLoadingAreas(false);
            setLoadingTables(false);
        }
    };

    const fetchMenuAndOrder = async () => {
        if (!selectedBranchId) return;
        setLoadingMenu(true);
        try {
            const [menusData, foodsData] = await Promise.all([
                menuApi.getAll({ branchId: selectedBranchId }),
                foodApi.getAllFoods({ branchId: selectedBranchId }),
            ]);
            const menus = Array.isArray(menusData)
                ? menusData
                : menusData.data || [];
            setMenus(menus);
            const foods = foodsData.data || foodsData;
            const validFoodData = foods.map((item) => ({
                id: item.id,
                name: item.name || "Chưa có tên",
                price:
                    typeof item.price === "string"
                        ? parseFloat(item.price)
                        : item.price || 0,
                category: item.category?.name || "Khác",
                categoryId: item.category?.id,
                description: item.description || "Chưa có mô tả",
                imageUrl: item.imageUrl || item.thumbnailUrl,
                isVegetarian: item.isVegetarian,
                isVegan: item.isVegan,
                isGlutenFree: item.isGlutenFree,
                spicyLevel: item.spicyLevel,
                menuIds: item.menus ? item.menus.map((m) => m.id) : [],
            }));
            setMenu(validFoodData);
            // Nếu đã chọn bàn, tải lại đơn hàng hiện tại
            if (selectedTable && selectedTable.id) {
                await loadExistingOrder(selectedTable.id);
            }
        } catch (e) {
            message.error("Không thể tải lại thực đơn/món ăn!");
        } finally {
            setLoadingMenu(false);
        }
    };

    // Thay đổi logic onChange của Tabs
    const handleTabChange = (key) => {
        setMainTab(key);
        if (key === "select-table") {
            fetchTablesAndAreas();
        }
        if (key === "order-food") {
            fetchMenuAndOrder();
        }
    };

    const handlePayment = () => {
        if (!selectedTable) {
            message.error("Vui lòng chọn bàn trước khi thanh toán");
            return;
        }
        if (!orderData || !orderData.id) {
            message.error("Không tìm thấy đơn hàng để thanh toán");
            return;
        }
        // Lấy danh sách món đã xử lý từ processingOrders
        const completedItems = (processingOrders || [])
            .filter(
                (item) =>
                    item.type === "service" ||
                    ["served", "completed", "done"].includes(item.status)
            )
            .map((item) => ({
                id: item.id,
                type: item.type,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                note: item.note || "",
            }));

        if (completedItems.length === 0) {
            message.error("Không có món nào sẵn sàng để thanh toán");
            return;
        }
        navigate(`/restaurant/payment/${orderData.id}`);
    };

    // Sửa lại hàm xử lý khi click vào bàn
    const handleTableSelect = async (table) => {
        if (table.status === "available" || table.status === "occupied") {
            // Reset các state liên quan đến đơn hàng (KHÔNG clear cart Redux của bàn mới)
            setCurrentOrderId(null);
            setOrderNote("");
            setOrderPriority("normal");
            // Set bàn mới được chọn
            setSelectedTable(table);
            setMainTab("order-food");
            // Nếu bàn đang dùng, tải đơn hàng hiện tại
            if (table.status === "occupied") {
                await loadExistingOrder(table.id);
            } else {
                // Nếu là bàn mới, đảm bảo cart Redux được khởi tạo rỗng nếu chưa có
                // Không clearCart ở đây để tránh mất cart cũ nếu reload lại
            }
        }
    };

    // Thêm hàm chuyển đổi trạng thái sang tiếng Việt
    const getStatusText = (status) => {
        switch (status) {
            case "preparing":
                return "Đang chế biến";
            case "new":
                return "Mới";
            case "completed":
                return "Đã hoàn thành";
            case "served":
                return "Đã phục vụ";
            case "done":
                return "Đã hoàn thành";
            default:
                return status;
        }
    };

    // Sửa lại phần kiểm tra trạng thái hoàn thành
    const isItemCompleted = (item) => {
        // Nếu là dịch vụ dùng ngay (không cần gửi bếp) thì luôn coi là hoàn thành
        if (
            item.type === "service" &&
            (!item.status || item.status === "completed")
        )
            return true;
        // Các trạng thái đã hoàn thành
        return ["completed", "served", "done"].includes(item.status);
    };

    const handleResetOrder = () => {
        if (!selectedTable) return;
        Modal.confirm({
            title: "Bạn có chắc muốn reset đơn hàng?",
            icon: <ExclamationCircleOutlined />,
            content:
                "Tất cả món ăn và dịch vụ trong giỏ hàng sẽ bị xoá. Hành động này không thể hoàn tác!",
            okText: "Đồng ý",
            okType: "danger",
            cancelText: "Huỷ",
            async onOk() {
                dispatch(clearCart({ tableId: selectedTable.id }));
                dispatch(removeOrder({ tableId: selectedTable.id }));
                dispatch(
                    setProcessingOrder({ tableId: selectedTable.id, items: [] })
                ); // Reset luôn processingOrders
                setCurrentOrderId(null);
                setOrderNote("");
                try {
                    await tableApi.updateTable(selectedTable.id, {
                        status: "available",
                    });
                    await fetchTablesAndAreas();
                } catch (e) {
                    message.warning(
                        "Đã reset đơn hàng nhưng không cập nhật được trạng thái bàn!"
                    );
                    return;
                }
                message.success("Đã reset đơn hàng và đặt lại trạng thái bàn!");
            },
        });
    };

    return (
        <>
            <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
                <Content style={{ padding: 24 }}>
                    <Tabs
                        activeKey={mainTab}
                        onChange={handleTabChange}
                        centered
                        size="large"
                        style={{ marginBottom: 24 }}
                    >
                        <TabPane
                            tab={
                                <span>
                                    <TableOutlined /> Chọn bàn
                                </span>
                            }
                            key="select-table"
                        >
                            <TableGrid />
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <MenuOutlined /> Đặt món
                                </span>
                            }
                            key="order-food"
                            disabled={!selectedTable}
                        >
                            <Row gutter={24}>
                                <Col xs={24} md={14} lg={15}>
                                    <Card
                                        title={
                                            <Space>
                                                <MenuOutlined /> Chọn món ăn
                                            </Space>
                                        }
                                        extra={
                                            <Input
                                                prefix={<SearchOutlined />}
                                                placeholder="Tìm món..."
                                                style={{ width: 220 }}
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                            />
                                        }
                                        bodyStyle={{
                                            padding: 16,
                                            minHeight: 400,
                                        }}
                                    >
                                        <MenuTabsFilter />
                                        <MenuList />
                                    </Card>
                                </Col>
                                <Col xs={24} md={10} lg={9}>
                                    <Card
                                        title={
                                            <Space>
                                                {selectedTable && (
                                                    <span
                                                        style={{
                                                            marginLeft: 8,
                                                            color: "#1890ff",
                                                        }}
                                                    >
                                                        {
                                                            selectedTable.tableNumber
                                                        }
                                                    </span>
                                                )}
                                            </Space>
                                        }
                                        extra={
                                            selectedTable && (
                                                <Space>
                                                    <Button
                                                        type="link"
                                                        onClick={() =>
                                                            setShowServiceModal(
                                                                true
                                                            )
                                                        }
                                                        icon={
                                                            <CoffeeOutlined />
                                                        }
                                                    >
                                                        Dịch vụ
                                                    </Button>
                                                    {selectedTable.status ===
                                                        "occupied" && (
                                                        <Button
                                                            type="link"
                                                            onClick={() =>
                                                                loadExistingOrder(
                                                                    selectedTable.id
                                                                )
                                                            }
                                                            loading={
                                                                loadingOrder
                                                            }
                                                        >
                                                            Tải lại đơn hàng
                                                        </Button>
                                                    )}
                                                    <Button
                                                        danger
                                                        type="link"
                                                        onClick={
                                                            handleResetOrder
                                                        }
                                                    >
                                                        Reset đơn hàng
                                                    </Button>
                                                </Space>
                                            )
                                        }
                                        bodyStyle={{
                                            padding: 16,
                                            minHeight: 400,
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                        }}
                                    >
                                        <Spin spinning={loadingOrder}>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    overflowY: "auto",
                                                }}
                                            >
                                                {/* Phần giỏ hàng tạm thời (chưa gửi bếp) */}
                                                {cart.length > 0 && (
                                                    <>
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    "bold",
                                                                fontSize: 16,
                                                                marginBottom: 8,
                                                            }}
                                                        >
                                                            Đơn hàng tạm thời
                                                        </div>
                                                        <List
                                                            dataSource={cart}
                                                            locale={{
                                                                emptyText:
                                                                    "Chưa có món nào",
                                                            }}
                                                            renderItem={(
                                                                item
                                                            ) => (
                                                                <List.Item
                                                                    style={{
                                                                        padding: 12,
                                                                        borderRadius: 12,
                                                                        marginBottom: 14,
                                                                        background:
                                                                            "#fff",
                                                                        boxShadow:
                                                                            "0 2px 8px #f0f1f2",
                                                                        border: "1px solid #f0f0f0",
                                                                        transition:
                                                                            "box-shadow 0.2s",
                                                                        display:
                                                                            "block",
                                                                    }}
                                                                >
                                                                    {/* Hàng trên: tên, giá, số lượng, trạng thái, ghi chú */}
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            marginBottom: 8,
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                fontWeight: 600,
                                                                                fontSize: 16,
                                                                                maxWidth: 140,
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                                overflow:
                                                                                    "hidden",
                                                                                textOverflow:
                                                                                    "ellipsis",
                                                                                flexShrink: 0,
                                                                            }}
                                                                            title={
                                                                                item.name
                                                                            }
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }{" "}
                                                                        </span>
                                                                        <span
                                                                            style={{
                                                                                color: "#fa541c",
                                                                                fontWeight: 600,
                                                                                fontSize: 15,
                                                                                marginLeft: 8,
                                                                            }}
                                                                        >
                                                                            {item.price.toLocaleString(
                                                                                "vi-VN"
                                                                            )}
                                                                            đ
                                                                        </span>
                                                                        <span
                                                                            style={{
                                                                                marginLeft: 10,
                                                                                background:
                                                                                    "#1677ff",
                                                                                color: "#fff",
                                                                                borderRadius:
                                                                                    "50%",
                                                                                width: 22,
                                                                                height: 22,
                                                                                display:
                                                                                    "flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                justifyContent:
                                                                                    "center",
                                                                                fontWeight: 600,
                                                                                fontSize: 13,
                                                                                boxShadow:
                                                                                    "0 1px 4px #e6f7ff",
                                                                            }}
                                                                        >
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </span>
                                                                        {item.note && (
                                                                            <Tooltip
                                                                                title={
                                                                                    item.note
                                                                                }
                                                                            >
                                                                                <MenuOutlined
                                                                                    style={{
                                                                                        color: "#faad14",
                                                                                        marginLeft: 8,
                                                                                    }}
                                                                                />
                                                                            </Tooltip>
                                                                        )}
                                                                        <Tag
                                                                            color={
                                                                                item.status ===
                                                                                "preparing"
                                                                                    ? "blue"
                                                                                    : "default"
                                                                            }
                                                                            style={{
                                                                                marginLeft:
                                                                                    "auto",
                                                                            }}
                                                                        >
                                                                            {item.status ===
                                                                            "preparing"
                                                                                ? "Đã gửi bếp"
                                                                                : "Chưa gửi bếp"}
                                                                        </Tag>
                                                                    </div>
                                                                    {/* Hàng dưới: các nút thao tác, căn phải */}
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            gap: 8,
                                                                            justifyContent:
                                                                                "flex-end",
                                                                        }}
                                                                    >
                                                                        <Button.Group>
                                                                            <Button
                                                                                size="small"
                                                                                style={{
                                                                                    borderRadius: 6,
                                                                                }}
                                                                                onClick={() => {
                                                                                    if (
                                                                                        item.quantity <=
                                                                                        1
                                                                                    ) {
                                                                                        dispatch(
                                                                                            removeFromCart(
                                                                                                {
                                                                                                    tableId:
                                                                                                        selectedTable.id,
                                                                                                    itemId: item.id,
                                                                                                    type: item.type,
                                                                                                }
                                                                                            )
                                                                                        );
                                                                                    } else {
                                                                                        dispatch(
                                                                                            {
                                                                                                type: "order/updateOrderItem",
                                                                                                payload:
                                                                                                    {
                                                                                                        tableId:
                                                                                                            selectedTable.id,
                                                                                                        itemId: item.id,
                                                                                                        itemData:
                                                                                                            {
                                                                                                                quantity:
                                                                                                                    item.quantity -
                                                                                                                    1,
                                                                                                            },
                                                                                                    },
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            >
                                                                                -
                                                                            </Button>
                                                                            <Button
                                                                                size="small"
                                                                                style={{
                                                                                    borderRadius: 6,
                                                                                }}
                                                                                onClick={() => {
                                                                                    dispatch(
                                                                                        addToCart(
                                                                                            {
                                                                                                tableId:
                                                                                                    selectedTable.id,
                                                                                                item: {
                                                                                                    ...item,
                                                                                                    quantity: 1,
                                                                                                },
                                                                                            }
                                                                                        )
                                                                                    );
                                                                                }}
                                                                            >
                                                                                +
                                                                            </Button>
                                                                        </Button.Group>
                                                                        <Button
                                                                            size="small"
                                                                            danger
                                                                            style={{
                                                                                borderRadius: 6,
                                                                            }}
                                                                            onClick={() =>
                                                                                dispatch(
                                                                                    removeFromCart(
                                                                                        {
                                                                                            tableId:
                                                                                                selectedTable.id,
                                                                                            itemId: item.id,
                                                                                            type: item.type,
                                                                                        }
                                                                                    )
                                                                                )
                                                                            }
                                                                        >
                                                                            X
                                                                        </Button>
                                                                    </div>
                                                                </List.Item>
                                                            )}
                                                        />
                                                        <div
                                                            style={{
                                                                marginBottom: 8,
                                                            }}
                                                        >
                                                            <Input.TextArea
                                                                rows={2}
                                                                placeholder="Ghi chú cho đơn hàng..."
                                                                value={
                                                                    orderNote
                                                                }
                                                                onChange={(e) =>
                                                                    setOrderNote(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        {/* Nút gửi bếp hoặc gọi thêm món */}
                                                        {currentOrderId ? (
                                                            <Button
                                                                type="primary"
                                                                icon={
                                                                    <SendOutlined />
                                                                }
                                                                block
                                                                style={{
                                                                    marginBottom: 16,
                                                                }}
                                                                onClick={
                                                                    handleAddMoreItems
                                                                }
                                                            >
                                                                Gọi thêm món
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="primary"
                                                                icon={
                                                                    <SendOutlined />
                                                                }
                                                                block
                                                                style={{
                                                                    marginBottom: 16,
                                                                }}
                                                                onClick={() =>
                                                                    setShowSendModal(
                                                                        true
                                                                    )
                                                                }
                                                            >
                                                                Gửi tất cả đến
                                                                bếp
                                                            </Button>
                                                        )}
                                                        <Divider />
                                                    </>
                                                )}
                                                {/* Phần đơn hàng đã gửi bếp */}
                                                {processingOrders.length >
                                                    0 && (
                                                    <>
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    "bold",
                                                                fontSize: 16,
                                                                marginBottom: 8,
                                                            }}
                                                        >
                                                            Đơn hàng đang xử lý
                                                        </div>
                                                        <List
                                                            dataSource={
                                                                processingOrders
                                                            }
                                                            locale={{
                                                                emptyText: "",
                                                            }}
                                                            renderItem={(
                                                                item
                                                            ) => (
                                                                <List.Item
                                                                    style={{
                                                                        padding: 8,
                                                                        borderRadius: 8,
                                                                        marginBottom: 8,
                                                                        background:
                                                                            "#fafcff",
                                                                        boxShadow:
                                                                            "0 1px 2px #eee",
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: "100%",
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display:
                                                                                    "flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                gap: 8,
                                                                                flexWrap:
                                                                                    "nowrap",
                                                                                overflow:
                                                                                    "hidden",
                                                                            }}
                                                                        >
                                                                            <span
                                                                                style={{
                                                                                    fontWeight: 600,
                                                                                    fontSize: 15,
                                                                                    maxWidth: 120,
                                                                                    whiteSpace:
                                                                                        "nowrap",
                                                                                    overflow:
                                                                                        "hidden",
                                                                                    textOverflow:
                                                                                        "ellipsis",
                                                                                    flexShrink: 0,
                                                                                }}
                                                                                title={
                                                                                    item.name
                                                                                }
                                                                            >
                                                                                {
                                                                                    item.name
                                                                                }
                                                                            </span>
                                                                            <Tag
                                                                                color="blue"
                                                                                style={{
                                                                                    fontWeight: 600,
                                                                                    marginLeft: 8,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item.quantity
                                                                                }
                                                                            </Tag>
                                                                            {item.type ===
                                                                                "service" &&
                                                                                item.serviceType?.name
                                                                                    ?.trim()
                                                                                    .toLowerCase() ===
                                                                                    "đồ ăn kèm" && (
                                                                                    <Tag
                                                                                        color="green"
                                                                                        style={{
                                                                                            marginLeft: 8,
                                                                                            fontSize: 12,
                                                                                            flexShrink: 0,
                                                                                        }}
                                                                                    >
                                                                                        Đã
                                                                                        phục
                                                                                        vụ
                                                                                    </Tag>
                                                                                )}
                                                                            {item.type ===
                                                                                "service" &&
                                                                                item.serviceType?.name
                                                                                    ?.trim()
                                                                                    .toLowerCase() !==
                                                                                    "đồ ăn kèm" && (
                                                                                    <Tag
                                                                                        color="green"
                                                                                        style={{
                                                                                            marginLeft: 8,
                                                                                            fontSize: 12,
                                                                                            flexShrink: 0,
                                                                                        }}
                                                                                    >
                                                                                        Dùng
                                                                                        ngay
                                                                                    </Tag>
                                                                                )}
                                                                            <Tag
                                                                                color={
                                                                                    item.type ===
                                                                                    "service"
                                                                                        ? "success"
                                                                                        : item.status ===
                                                                                          "new"
                                                                                        ? "blue"
                                                                                        : item.status ===
                                                                                          "preparing"
                                                                                        ? "processing"
                                                                                        : item.status ===
                                                                                          "completed"
                                                                                        ? "success"
                                                                                        : item.status ===
                                                                                          "served"
                                                                                        ? "green"
                                                                                        : "default"
                                                                                }
                                                                                style={{
                                                                                    marginLeft: 8,
                                                                                    fontSize: 12,
                                                                                    flexShrink: 0,
                                                                                }}
                                                                            >
                                                                                {item.type ===
                                                                                "service"
                                                                                    ? "Đã hoàn thành"
                                                                                    : getStatusText(
                                                                                          item.status
                                                                                      )}
                                                                            </Tag>
                                                                            <span
                                                                                style={{
                                                                                    marginLeft:
                                                                                        "auto",
                                                                                    color: "#888",
                                                                                    fontSize: 14,
                                                                                }}
                                                                            >
                                                                                {(typeof item.price ===
                                                                                "number"
                                                                                    ? item.price
                                                                                    : parseFloat(
                                                                                          item.price
                                                                                      ) ||
                                                                                      0
                                                                                ).toLocaleString(
                                                                                    "vi-VN",
                                                                                    {
                                                                                        style: "currency",
                                                                                        currency:
                                                                                            "VND",
                                                                                    }
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </List.Item>
                                                            )}
                                                        />
                                                    </>
                                                )}
                                                {/* Hiển thị thông báo khi không có món nào */}
                                                {cart.length === 0 &&
                                                    processingOrders.length ===
                                                        0 && (
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                padding:
                                                                    "40px 0",
                                                                color: "#999",
                                                            }}
                                                        >
                                                            Chưa có món nào
                                                        </div>
                                                    )}
                                            </div>
                                            <Divider />
                                            {/* Tổng tiền và nút thanh toán */}
                                            <div>
                                                {processingOrders.length >
                                                    0 && (
                                                    <>
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                fontSize: 16,
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            Tổng:{" "}
                                                            {getTotalAmount(
                                                                processingOrders
                                                            ).toLocaleString(
                                                                "vi-VN",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "VND",
                                                                }
                                                            )}
                                                        </div>
                                                        <Button
                                                            icon={
                                                                <DollarOutlined />
                                                            }
                                                            type="primary"
                                                            block
                                                            style={{
                                                                marginTop: 8,
                                                            }}
                                                            onClick={
                                                                handlePayment
                                                            }
                                                        >
                                                            Thanh toán
                                                        </Button>
                                                    </>
                                                )}
                                                {cart.length === 0 &&
                                                    processingOrders.length ===
                                                        0 && (
                                                        <Button
                                                            type="dashed"
                                                            block
                                                            icon={
                                                                <ShoppingCartOutlined />
                                                            }
                                                            onClick={() =>
                                                                message.info(
                                                                    "Hãy chọn món từ thực đơn bên trái!"
                                                                )
                                                            }
                                                        >
                                                            Chọn món
                                                        </Button>
                                                    )}
                                            </div>
                                        </Spin>
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>
                </Content>
            </Layout>

            {/* Modals */}
            <OrderNoteModal
                visible={noteModal.open}
                item={noteModal.item}
                value={noteModal.value}
                onChange={(value) => setNoteModal({ ...noteModal, value })}
                onClose={() =>
                    setNoteModal({ open: false, item: null, value: "" })
                }
                onSave={handleSaveNote}
            />
            <SendToKitchenModal
                visible={showSendModal}
                onClose={() => setShowSendModal(false)}
                onConfirm={async () => {
                    setShowSendModal(false);
                    await handleSendAllToKitchen();
                }}
                orderNote={orderNote}
                setOrderNote={setOrderNote}
                orderPriority={orderPriority}
                setOrderPriority={setOrderPriority}
                cart={cart}
            />
            <ServiceItemsModal
                visible={showServiceModal}
                onClose={() => setShowServiceModal(false)}
                onAddToCart={handleAddServices}
                selectedBranchId={selectedBranchId}
            />
        </>
    );
}
