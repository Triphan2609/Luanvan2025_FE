import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    Table,
    Tag,
    Typography,
    Space,
    Input,
    Popconfirm,
    notification,
    Select,
    DatePicker,
    Spin,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import PromotionModal from "./Modals/PromotionModal";
import PromotionDrawer from "./Drawer/PromotionDrawer";
import { getPromotions, deletePromotion } from "../../../../api/promotionApi";
import { getBranches } from "../../../../api/branchesApi";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusColors = {
    active: "green",
    inactive: "orange",
    expired: "red",
};

export default function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [drawerPromotion, setDrawerPromotion] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDate, setFilterDate] = useState([]);
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetchPromotions();
        fetchBranches();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const data = await getPromotions();
            setPromotions(data);
        } catch (err) {
            notification.error({ message: "Lỗi tải khuyến mãi" });
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const data = await getBranches();
            setBranches(data);
        } catch {}
    };

    const handleAdd = () => {
        setEditingPromotion(null);
        setIsModalOpen(true);
    };

    const handleEdit = (promo) => {
        setEditingPromotion(promo);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchPromotions();
    };

    const handleView = (promo) => {
        setDrawerPromotion(promo);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deletePromotion(id);
            notification.success({ message: "Đã xóa khuyến mãi" });
            fetchPromotions();
        } catch {
            notification.error({ message: "Lỗi xóa khuyến mãi" });
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredData = promotions.filter((p) => {
        const matchName =
            p.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (p.description &&
                p.description.toLowerCase().includes(searchText.toLowerCase()));
        const matchStatus = filterStatus ? p.status === filterStatus : true;
        const matchBranch = filterBranch ? p.branch?.id === filterBranch : true;
        const matchType = filterType ? p.type === filterType : true;
        const matchDate =
            filterDate.length === 2
                ? dayjs(p.startDate).isBefore(filterDate[1], "day") &&
                  dayjs(p.endDate).isAfter(filterDate[0], "day")
                : true;
        return (
            matchName && matchStatus && matchBranch && matchType && matchDate
        );
    });

    const columns = [
        {
            title: "Tên chương trình",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Loại",
            dataIndex: "type",
            render: (type) => <Tag>{type}</Tag>,
        },
        {
            title: "Giá trị",
            dataIndex: "value",
            render: (val, record) => {
                if (record.valueType === "PERCENT") return `${val}%`;
                if (record.valueType === "AMOUNT")
                    return `${val.toLocaleString()} đ`;
                return val;
            },
        },
        {
            title: "Thời gian",
            render: (_, r) =>
                `${dayjs(r.startDate).format("DD/MM/YYYY")} - ${dayjs(
                    r.endDate
                ).format("DD/MM/YYYY")}`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => (
                <Tag color={statusColors[status]}>{status}</Tag>
            ),
        },
        {
            title: "Chi nhánh",
            dataIndex: ["branch", "name"],
            render: (_, r) => r.branch?.name || "Toàn hệ thống",
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xác nhận xóa khuyến mãi này?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={<Title level={4}>Chương trình khuyến mãi</Title>}
            extra={
                <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={handleAdd}
                >
                    Thêm khuyến mãi
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }} wrap>
                <Input.Search
                    placeholder="Tìm kiếm tên hoặc mô tả"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    style={{ width: 220 }}
                />
                <Select
                    placeholder="Trạng thái"
                    allowClear
                    style={{ width: 120 }}
                    value={filterStatus || undefined}
                    onChange={setFilterStatus}
                >
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Ngừng</Option>
                    <Option value="expired">Hết hạn</Option>
                </Select>
                <Select
                    placeholder="Chi nhánh"
                    allowClear
                    style={{ width: 160 }}
                    value={filterBranch || undefined}
                    onChange={setFilterBranch}
                >
                    {branches.map((b) => (
                        <Option key={b.id} value={b.id}>
                            {b.name}
                        </Option>
                    ))}
                </Select>
                <Select
                    placeholder="Loại khuyến mãi"
                    allowClear
                    style={{ width: 150 }}
                    value={filterType || undefined}
                    onChange={setFilterType}
                >
                    <Option value="ITEM">Theo món</Option>
                    <Option value="BILL">Theo hóa đơn</Option>
                    <Option value="COMBO">Combo</Option>
                    <Option value="TIME">Khung giờ vàng</Option>
                </Select>
                <RangePicker
                    value={filterDate}
                    onChange={setFilterDate}
                    style={{ width: 240 }}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchPromotions} />
            </Space>
            <Spin spinning={loading} tip="Đang tải...">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                />
            </Spin>
            <PromotionModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingPromotion}
            />
            <PromotionDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                promotion={drawerPromotion}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Card>
    );
}
