import React, { useEffect, useState } from "react";
import {
    Drawer,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Space,
    Popconfirm,
    message,
} from "antd";
import {
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
} from "../../../../api/restaurantApi";

const UnitDrawer = ({ open, onClose, onUnitChange }) => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await getUnits();
            setUnits(res.data || res);
            if (onUnitChange) onUnitChange();
        } catch {
            message.error("Lỗi tải đơn vị tính");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open) fetchUnits();
        // eslint-disable-next-line
    }, [open]);

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
            await deleteUnit(id);
            message.success("Đã xóa đơn vị");
            fetchUnits();
        } catch {
            message.error("Lỗi xóa đơn vị");
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editing) {
                await updateUnit(editing.id, values);
                message.success("Đã cập nhật đơn vị");
            } else {
                await createUnit(values);
                message.success("Đã thêm đơn vị");
            }
            setEditing(null);
            setModalVisible(false);
            form.resetFields();
            fetchUnits();
        } catch {}
    };

    const columns = [
        { title: "Tên đơn vị", dataIndex: "name", key: "name" },
        { title: "Mô tả", dataIndex: "description", key: "description" },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEdit(record)} type="link">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa đơn vị?"
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
        <Drawer
            title="Quản lý đơn vị tính"
            open={open}
            onClose={onClose}
            width={480}
            destroyOnClose
        >
            <Button
                type="primary"
                onClick={handleAdd}
                style={{ marginBottom: 16 }}
            >
                Thêm đơn vị
            </Button>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={units}
                loading={loading}
                pagination={false}
            />
            <Modal
                title={editing ? "Sửa đơn vị" : "Thêm đơn vị"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditing(null);
                }}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên đơn vị"
                        rules={[
                            { required: true, message: "Nhập tên đơn vị!" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </Drawer>
    );
};

export default UnitDrawer;
