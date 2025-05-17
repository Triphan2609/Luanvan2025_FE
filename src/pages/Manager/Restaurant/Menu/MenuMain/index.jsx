import React, { useState, useEffect } from "react";
import {
    Card,
    Typography,
    Button,
    Table,
    Space,
    Input,
    Tag,
    Popconfirm,
    Upload,
    Tabs,
    Select,
} from "antd";
import {
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import MenuDrawer from "./Drawer/MenuDrawer";
import { message } from "antd";
import { menuApi } from "../../../../../api/menuApi";
import { foodApi } from "../../../../../api/restaurantApi";
import CreateMenuModal from "./Modals/CreateMenuModal";
import EditMenuModal from "./Modals/EditMenuModal";

const { Title } = Typography;

const MENU_TYPES = [
    { label: "Thực đơn chính", value: "REGULAR" },
    { label: "Thực đơn theo mùa", value: "SEASONAL" },
    { label: "Combo món ăn", value: "COMBO" },
];
const SEASONS = [
    { label: "Xuân", value: "SPRING" },
    { label: "Hạ", value: "SUMMER" },
    { label: "Thu", value: "AUTUMN" },
    { label: "Đông", value: "WINTER" },
];

export default function MenuManagement() {
    const [menus, setMenus] = useState([]);
    const [foods, setFoods] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [menuType, setMenuType] = useState("REGULAR");
    const [season, setSeason] = useState(undefined);

    // Gọi API đúng loại thực đơn
    const fetchMenusAndFoodsWithType = async () => {
        if (menuType === "SEASONAL" && !season) {
            setMenus([]);
            return;
        }
        try {
            setLoading(true);
            const params = { type: menuType };
            if (menuType === "SEASONAL" && season) params.season = season;
            const [menuRes, foodRes] = await Promise.all([
                menuApi.getAll(params),
                foodApi.getAllFoods(),
            ]);
            const menusArr = Array.isArray(menuRes)
                ? menuRes
                : Array.isArray(menuRes?.data)
                ? menuRes.data
                : [];
            const menusWithFoods = menusArr.map((menu) => ({
                ...menu,
                foods: Array.isArray(menu.foods) ? menu.foods : [],
            }));
            setMenus(menusWithFoods);
            setFoods(Array.isArray(foodRes.data) ? foodRes.data : []);
        } catch (error) {
            message.error("Lỗi khi tải danh sách menu hoặc món ăn");
            setMenus([]);
            setFoods([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenusAndFoodsWithType();
        // eslint-disable-next-line
    }, [menuType, season]);

    // Khi chuyển tab, reset filter mùa nếu không phải tab theo mùa
    const handleTabChange = (key) => {
        setMenuType(key);
        if (key !== "SEASONAL") setSeason(undefined);
    };

    // Không filter lại dữ liệu trên client, chỉ dùng dữ liệu từ API
    const displayedMenus = menus;

    // Xử lý tạo mới menu
    const handleCreate = async (values) => {
        try {
            await menuApi.create(values);
            message.success("Tạo menu thành công");
            setCreateModalVisible(false);
            fetchMenusAndFoodsWithType();
        } catch (error) {
            message.error("Lỗi khi tạo menu");
        }
    };

    // Xử lý cập nhật menu
    const handleUpdate = async (values) => {
        try {
            await menuApi.update(selectedMenu.id, values);
            message.success("Cập nhật menu thành công");
            setEditModalVisible(false);
            fetchMenusAndFoodsWithType();
        } catch (error) {
            message.error("Lỗi khi cập nhật menu");
        }
    };

    // Xử lý xóa menu
    const handleDelete = async (id) => {
        try {
            await menuApi.delete(id);
            message.success("Xóa menu thành công");
            fetchMenusAndFoodsWithType();
        } catch (error) {
            message.error("Lỗi khi xóa menu");
        }
    };

    // Xử lý xem menu
    const handleView = (menu) => {
        setSelectedMenu(menu);
        setIsDrawerOpen(true);
    };

    // Xử lý sửa menu
    const handleEdit = (menu) => {
        setSelectedMenu(menu);
        setEditModalVisible(true);
    };

    // Xử lý cập nhật thứ tự món ăn (nếu có kéo thả)
    const handleUpdateMenu = async (menuId, data) => {
        try {
            await menuApi.update(menuId, data);
            message.success("Cập nhật thực đơn thành công!");
            fetchMenusAndFoodsWithType();
        } catch (error) {
            message.error("Lỗi khi cập nhật thực đơn!");
        }
    };

    // Lọc menu theo tên (nếu cần search)
    const filteredMenus = Array.isArray(menus)
        ? searchText.trim() === ""
            ? menus
            : menus.filter((menu) =>
                  (menu.name || "")
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
              )
        : [];

    useEffect(() => {
        console.log("menus state", menus);
        console.log("filteredMenus", filteredMenus);
    }, [menus, filteredMenus]);

    // Cột bảng menu
    const columns = [
        {
            title: "Tên menu",
            dataIndex: "name",
            sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
        },
        {
            title: "Loại thực đơn",
            dataIndex: "type",
            render: (type) => {
                if (type === "REGULAR") return <Tag color="blue">Chính</Tag>;
                if (type === "SEASONAL")
                    return <Tag color="orange">Theo mùa</Tag>;
                if (type === "COMBO") return <Tag color="purple">Combo</Tag>;
                return type;
            },
        },
        menuType === "SEASONAL"
            ? {
                  title: "Mùa",
                  dataIndex: "season",
                  render: (season) => {
                      const s = SEASONS.find((s) => s.value === season);
                      return s ? s.label : season;
                  },
              }
            : null,
        menuType === "COMBO"
            ? {
                  title: "Giá combo",
                  dataIndex: "price",
                  render: (price) =>
                      price != null ? (
                          <span>{price.toLocaleString()} đ</span>
                      ) : (
                          <span>-</span>
                      ),
              }
            : null,
        {
            title: "Số lượng món",
            dataIndex: "foods",
            render: (foods) => (Array.isArray(foods) ? foods.length : 0),
            sorter: (a, b) => (a.foods?.length || 0) - (b.foods?.length || 0),
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            render: (isActive) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "Đang phục vụ" : "Ngừng phục vụ"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa menu này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ].filter(Boolean);

    return (
        <div>
            <Card>
                <Title level={3}>Quản lý thực đơn</Title>
                <Tabs
                    activeKey={menuType}
                    onChange={handleTabChange}
                    items={MENU_TYPES.map((t) => ({
                        key: t.value,
                        label: t.label,
                    }))}
                />
                {menuType === "SEASONAL" && (
                    <div style={{ marginBottom: 16 }}>
                        <span>Chọn mùa: </span>
                        <Select
                            style={{ width: 160 }}
                            value={season}
                            onChange={setSeason}
                            options={SEASONS}
                            placeholder="Chọn mùa"
                        />
                    </div>
                )}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 16,
                    }}
                >
                    <Title level={4}>Quản lý thực đơn</Title>
                    <Space>
                        <Input
                            placeholder="Tìm kiếm menu..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalVisible(true)}
                        >
                            Thêm menu
                        </Button>
                        <Upload
                            accept=".xlsx,.xls"
                            showUploadList={false}
                            // beforeUpload={handleImportAll} // Có thể bổ sung import Excel nếu cần
                        >
                            <Button icon={<UploadOutlined />}>
                                Import Excel
                            </Button>
                        </Upload>
                        <Button icon={<DownloadOutlined />}>
                            Export Excel
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={displayedMenus}
                    rowKey="id"
                    loading={loading}
                    locale={{
                        emptyText:
                            menuType === "SEASONAL" && !season
                                ? "Vui lòng chọn mùa để xem thực đơn theo mùa."
                                : "Không có dữ liệu.",
                    }}
                />
            </Card>

            <MenuDrawer
                visible={isDrawerOpen}
                menu={selectedMenu}
                onClose={() => setIsDrawerOpen(false)}
                onUpdate={handleUpdateMenu}
                allFoods={foods}
            />

            <CreateMenuModal
                visible={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSubmit={handleCreate}
            />

            <EditMenuModal
                visible={editModalVisible}
                menu={selectedMenu}
                onCancel={() => setEditModalVisible(false)}
                onSubmit={handleUpdate}
            />
        </div>
    );
}
