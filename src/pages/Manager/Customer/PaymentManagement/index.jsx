import React, { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Switch,
    message,
    Tooltip,
    Popconfirm,
    Tag,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    BankOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    getBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
} from "../../../../api/paymentsApi";
import "./PaymentManagement.scss";

const { TextArea } = Input;

const BankAccountManagement = () => {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bankFormVisible, setBankFormVisible] = useState(false);
    const [bankForm] = Form.useForm();
    const [editingBank, setEditingBank] = useState(null);

    // Fetch bank accounts on component mount
    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            const accounts = await getBankAccounts();
            setBankAccounts(accounts);
        } catch (error) {
            console.error("Failed to fetch bank accounts:", error);
            message.error("Không thể tải danh sách tài khoản ngân hàng");
        } finally {
            setLoading(false);
        }
    };

    // Bank account management
    const handleCreateBank = () => {
        bankForm.resetFields();
        setEditingBank(null);
        setBankFormVisible(true);
    };

    const handleEditBank = (record) => {
        bankForm.setFieldsValue({
            bankName: record.bankName,
            accountNumber: record.accountNumber,
            accountName: record.accountName,
            branch: record.branch,
            swiftCode: record.swiftCode,
            description: record.description,
            isActive: record.isActive,
            logoUrl: record.logoUrl,
        });
        setEditingBank(record);
        setBankFormVisible(true);
    };

    const handleDeleteBank = async (id) => {
        try {
            setLoading(true);
            await deleteBankAccount(id);
            message.success("Xóa tài khoản ngân hàng thành công");
            fetchBankAccounts();
        } catch (error) {
            console.error("Failed to delete bank account:", error);
            message.error("Không thể xóa tài khoản ngân hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleBankFormSubmit = async () => {
        try {
            const values = await bankForm.validateFields();
            setLoading(true);

            if (editingBank) {
                // Update existing bank
                await updateBankAccount(editingBank.id, values);
                message.success(
                    "Cập nhật thông tin tài khoản ngân hàng thành công"
                );
            } else {
                // Create new bank
                await createBankAccount(values);
                message.success("Thêm tài khoản ngân hàng mới thành công");
            }

            setBankFormVisible(false);
            fetchBankAccounts();
        } catch (error) {
            console.error("Bank form validation failed or API error:", error);
            if (error.errorFields) {
                message.error("Vui lòng kiểm tra lại thông tin đã nhập");
            } else {
                message.error("Có lỗi xảy ra khi lưu tài khoản ngân hàng");
            }
        } finally {
            setLoading(false);
        }
    };

    // Bank transfer table columns
    const bankColumns = [
        {
            title: "Ngân hàng",
            dataIndex: "bankName",
            key: "bankName",
            render: (text, record) => (
                <Space>
                    {record.logoUrl ? (
                        <img
                            src={record.logoUrl}
                            alt={text}
                            style={{ width: 24, height: 24, marginRight: 8 }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                                e.target.style.display = "none";
                            }}
                        />
                    ) : (
                        <BankOutlined
                            style={{ fontSize: "18px", color: "#1890ff" }}
                        />
                    )}
                    {text}
                </Space>
            ),
        },
        {
            title: "Số tài khoản",
            dataIndex: "accountNumber",
            key: "accountNumber",
        },
        {
            title: "Chủ tài khoản",
            dataIndex: "accountName",
            key: "accountName",
        },
        {
            title: "Chi nhánh",
            dataIndex: "branch",
            key: "branch",
        },
        {
            title: "Swift Code",
            dataIndex: "swiftCode",
            key: "swiftCode",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) =>
                isActive ? (
                    <Tag color="success">Đang hoạt động</Tag>
                ) : (
                    <Tag color="error">Đã vô hiệu</Tag>
                ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditBank(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?"
                            onConfirm={() => handleDeleteBank(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            icon={
                                <ExclamationCircleOutlined
                                    style={{ color: "red" }}
                                />
                            }
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <BankOutlined />
                    <span>Quản lý tài khoản ngân hàng</span>
                </Space>
            }
            className="bank-account-management"
        >
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateBank}
                    >
                        Thêm tài khoản ngân hàng
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchBankAccounts}
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>

            <Table
                columns={bankColumns}
                dataSource={bankAccounts}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal for creating/editing bank accounts */}
            <Modal
                title={
                    editingBank
                        ? "Chỉnh sửa thông tin ngân hàng"
                        : "Thêm tài khoản ngân hàng mới"
                }
                open={bankFormVisible}
                onOk={handleBankFormSubmit}
                onCancel={() => setBankFormVisible(false)}
                confirmLoading={loading}
                width={600}
            >
                <Form form={bankForm} layout="vertical">
                    <Form.Item
                        name="bankName"
                        label="Tên ngân hàng"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên ngân hàng",
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: Ngân hàng BIDV..." />
                    </Form.Item>

                    <Form.Item
                        name="accountNumber"
                        label="Số tài khoản"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập số tài khoản",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập số tài khoản" />
                    </Form.Item>

                    <Form.Item
                        name="accountName"
                        label="Chủ tài khoản"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên chủ tài khoản",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên chủ tài khoản" />
                    </Form.Item>

                    <div style={{ display: "flex", gap: "20px" }}>
                        <Form.Item
                            name="branch"
                            label="Chi nhánh"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Nhập chi nhánh ngân hàng" />
                        </Form.Item>

                        <Form.Item
                            name="swiftCode"
                            label="Swift Code"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Nhập Swift Code (nếu có)" />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea
                            rows={3}
                            placeholder="Mô tả về tài khoản ngân hàng"
                        />
                    </Form.Item>

                    <Form.Item name="logoUrl" label="Logo URL">
                        <Input placeholder="URL hình ảnh logo ngân hàng" />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Đang hoạt động"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default BankAccountManagement;
