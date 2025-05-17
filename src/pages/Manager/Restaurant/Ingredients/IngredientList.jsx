import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Space,
    Popconfirm,
    message,
    Row,
    Col,
    Select,
    Tag,
    Tooltip,
} from "antd";
import {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    getUnits,
} from "../../../../api/restaurantApi";
import UnitDrawer from "./UnitDrawer";
import {
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

const statusMap = {
    available: { color: "green", text: "Đủ", icon: <CheckCircleOutlined /> },
    low: {
        color: "orange",
        text: "Sắp hết",
        icon: <ExclamationCircleOutlined />,
    },
    out: { color: "red", text: "Hết", icon: <CloseCircleOutlined /> },
};

const IngredientList = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [units, setUnits] = useState([]);
    const [unitDrawerOpen, setUnitDrawerOpen] = useState(false);
    const [unitFilter, setUnitFilter] = useState("");

    const fetchIngredients = async (params = {}) => {
        setLoading(true);
        try {
            const res = await getIngredients();
            let data = res.data || res;
            // Tìm kiếm
            if (search) {
                data = data.filter((item) =>
                    item.name.toLowerCase().includes(search.toLowerCase())
                );
            }
            setPagination((prev) => ({ ...prev, total: data.length }));
            // Phân trang
            const start = (pagination.current - 1) * pagination.pageSize;
            const end = start + pagination.pageSize;
            setIngredients(data.slice(start, end));
        } catch (err) {
            message.error("Lỗi tải nguyên liệu");
        }
        setLoading(false);
    };

    const fetchUnits = async () => {
        try {
            const res = await getUnits();
            setUnits(res.data || res);
        } catch {
            setUnits([]);
        }
    };

    useEffect(() => {
        fetchIngredients();
        fetchUnits();
        // eslint-disable-next-line
    }, [search, pagination.current, pagination.pageSize]);

    const handleAdd = () => {
        setEditing(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteIngredient(id);
            message.success("Đã xóa nguyên liệu");
            fetchIngredients();
        } catch {
            message.error("Lỗi xóa nguyên liệu");
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editing) {
                await updateIngredient(editing.id, values);
                message.success("Đã cập nhật nguyên liệu");
            } else {
                await createIngredient(values);
                message.success("Đã thêm nguyên liệu");
            }
            setModalVisible(false);
            fetchIngredients();
        } catch {}
    };

    const handleTableChange = (pag) => {
        setPagination((prev) => ({
            ...prev,
            current: pag.current,
            pageSize: pag.pageSize,
        }));
    };

    const handleUnitDrawerClose = () => {
        setUnitDrawerOpen(false);
        fetchUnits();
    };

    const unitOptions = useMemo(
        () => units.map((u) => ({ label: u.name, value: u.id })),
        [units]
    );

    // Lọc nguyên liệu theo đơn vị
    const filteredIngredients = unitFilter
        ? ingredients.filter((i) => i.unitId === unitFilter)
        : ingredients;

    const columns = [
        { title: "Tên", dataIndex: "name", key: "name", align: "center" },
        {
            title: "Đơn vị",
            dataIndex: ["unit", "name"],
            key: "unit",
            align: "center",
            render: (_, record) => {
                const unitName =
                    record.unit?.name ||
                    units.find((u) => u.id === record.unitId)?.name;
                return unitName ? unitName : <Tag color="red">Chưa chọn</Tag>;
            },
            sorter: (a, b) => {
                const nameA =
                    a.unit?.name ||
                    units.find((u) => u.id === a.unitId)?.name ||
                    "";
                const nameB =
                    b.unit?.name ||
                    units.find((u) => u.id === b.unitId)?.name ||
                    "";
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: "Tồn kho",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            sorter: (a, b) => a.quantity - b.quantity,
            render: (value, record) => (
                <span
                    style={{
                        color:
                            record.status === "out"
                                ? "red"
                                : record.status === "low"
                                ? "orange"
                                : undefined,
                        fontWeight:
                            record.status !== "available" ? "bold" : undefined,
                    }}
                >
                    {value}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            filters: [
                { text: "Đủ", value: "available" },
                { text: "Sắp hết", value: "low" },
                { text: "Hết", value: "out" },
            ],
            onFilter: (value, record) => record.status === value,
            sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
            render: (status) =>
                statusMap[status] ? (
                    <Tooltip title={statusMap[status].text}>
                        <Tag
                            color={statusMap[status].color}
                            icon={statusMap[status].icon}
                            style={{ fontWeight: "bold", fontSize: 14 }}
                        >
                            {statusMap[status].text}
                        </Tag>
                    </Tooltip>
                ) : null,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            align: "center",
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEdit(record)} type="link">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa nguyên liệu?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="link" danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Button type="primary" onClick={handleAdd}>
                        Thêm nguyên liệu
                    </Button>
                    <Button
                        className="mx-3"
                        type="button"
                        onClick={() => setUnitDrawerOpen(true)}
                    >
                        Quản lý đơn vị
                    </Button>
                    <Select
                        allowClear
                        showSearch
                        style={{ width: 180, marginLeft: 8 }}
                        placeholder="Lọc theo đơn vị"
                        options={unitOptions}
                        value={unitFilter || undefined}
                        onChange={(v) => setUnitFilter(v || "")}
                        filterOption={(input, option) =>
                            option.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                    />
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                    <Input.Search
                        placeholder="Tìm kiếm nguyên liệu..."
                        allowClear
                        value={search}
                        onChange={(e) => {
                            setPagination((prev) => ({ ...prev, current: 1 }));
                            setSearch(e.target.value);
                        }}
                        style={{ width: 250 }}
                    />
                </Col>
            </Row>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredIngredients}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                }}
                onChange={(pag) => {
                    setPagination((prev) => ({
                        ...prev,
                        current: pag.current,
                        pageSize: pag.pageSize,
                    }));
                }}
                bordered
                size="middle"
                style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px #f0f1f2",
                }}
                scroll={{ x: "max-content" }}
            />
            <Modal
                title={editing ? "Sửa nguyên liệu" : "Thêm nguyên liệu"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => setModalVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên nguyên liệu"
                        rules={[{ required: true, message: "Nhập tên!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="unitId"
                        label="Đơn vị"
                        rules={[{ required: true, message: "Chọn đơn vị!" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn đơn vị"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Button
                                        type="link"
                                        style={{
                                            width: "100%",
                                            textAlign: "left",
                                        }}
                                        onClick={() => setUnitDrawerOpen(true)}
                                    >
                                        + Thêm đơn vị mới
                                    </Button>
                                </>
                            )}
                        >
                            {units.map((u) => (
                                <Select.Option key={u.id} value={u.id}>
                                    {u.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="Tồn kho"
                        rules={[{ required: true, message: "Nhập số lượng!" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
            <UnitDrawer
                open={unitDrawerOpen}
                onClose={handleUnitDrawerClose}
                onUnitChange={fetchUnits}
            />
        </div>
    );
};

export default IngredientList;
