import React, { useState } from "react";
import {
    Modal,
    Tabs,
    Form,
    Select,
    Button,
    Alert,
    Space,
    Popconfirm,
    Typography,
    List,
    Tag,
} from "antd";
import {
    UserSwitchOutlined,
    TagsOutlined,
    DeleteOutlined,
    BranchesOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const BatchActionsModal = ({
    open,
    onCancel,
    selectedCustomers,
    onToggleStatus,
    onUpdateType,
    onDelete,
    onAssignBranch,
    branches = [],
    CUSTOMER_TYPE,
    CUSTOMER_STATUS,
}) => {
    const [statusForm] = Form.useForm();
    const [typeForm] = Form.useForm();
    const [branchForm] = Form.useForm();
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

    const handleSubmitStatus = () => {
        statusForm.validateFields().then((values) => {
            onToggleStatus(
                selectedCustomers.map((c) => c.id),
                values.status
            );
            statusForm.resetFields();
            onCancel();
        });
    };

    const handleSubmitType = () => {
        typeForm.validateFields().then((values) => {
            onUpdateType(
                selectedCustomers.map((c) => c.id),
                values.type
            );
            typeForm.resetFields();
            onCancel();
        });
    };

    const handleSubmitBranch = () => {
        branchForm.validateFields().then((values) => {
            onAssignBranch(
                selectedCustomers.map((c) => c.id),
                values.branchId
            );
            branchForm.resetFields();
            onCancel();
        });
    };

    const handleConfirmDelete = () => {
        onDelete(selectedCustomers.map((c) => c.id));
        setDeleteConfirmVisible(false);
        onCancel();
    };

    const renderCustomerList = () => (
        <List
            size="small"
            dataSource={selectedCustomers.slice(0, 5)}
            renderItem={(customer) => (
                <List.Item>
                    <Space>
                        <Text strong>{customer.name}</Text>
                        <Text type="secondary">{customer.phone}</Text>
                        <Tag
                            color={
                                customer.type === "vip" ? "#722ed1" : "#52c41a"
                            }
                        >
                            {customer.type === "vip" ? "VIP" : "Thường"}
                        </Tag>
                    </Space>
                </List.Item>
            )}
            footer={
                selectedCustomers.length > 5 ? (
                    <div style={{ textAlign: "center" }}>
                        <Text type="secondary">
                            và {selectedCustomers.length - 5} khách hàng khác
                        </Text>
                    </div>
                ) : null
            }
        />
    );

    const items = [
        {
            key: "status",
            label: (
                <span>
                    <UserSwitchOutlined /> Trạng thái
                </span>
            ),
            children: (
                <div>
                    <Alert
                        message="Thay đổi trạng thái hàng loạt"
                        description={`Thao tác này sẽ thay đổi trạng thái của ${selectedCustomers.length} khách hàng đã chọn.`}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {renderCustomerList()}

                    <Form
                        form={statusForm}
                        layout="vertical"
                        style={{ marginTop: 16 }}
                    >
                        <Form.Item
                            name="status"
                            label="Trạng thái mới"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn trạng thái",
                                },
                            ]}
                        >
                            <Select>
                                <Select.Option value={CUSTOMER_STATUS.ACTIVE}>
                                    Kích hoạt
                                </Select.Option>
                                <Select.Option value={CUSTOMER_STATUS.BLOCKED}>
                                    Khóa
                                </Select.Option>
                            </Select>
                        </Form.Item>

                        <Button type="primary" onClick={handleSubmitStatus}>
                            Cập nhật trạng thái
                        </Button>
                    </Form>
                </div>
            ),
        },
        {
            key: "type",
            label: (
                <span>
                    <TagsOutlined /> Loại khách hàng
                </span>
            ),
            children: (
                <div>
                    <Alert
                        message="Thay đổi loại khách hàng hàng loạt"
                        description={`Thao tác này sẽ thay đổi loại của ${selectedCustomers.length} khách hàng đã chọn.`}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {renderCustomerList()}

                    <Form
                        form={typeForm}
                        layout="vertical"
                        style={{ marginTop: 16 }}
                    >
                        <Form.Item
                            name="type"
                            label="Loại khách hàng mới"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn loại khách hàng",
                                },
                            ]}
                        >
                            <Select>
                                <Select.Option value={CUSTOMER_TYPE.NORMAL}>
                                    Thường
                                </Select.Option>
                                <Select.Option value={CUSTOMER_TYPE.VIP}>
                                    VIP
                                </Select.Option>
                            </Select>
                        </Form.Item>

                        <Button type="primary" onClick={handleSubmitType}>
                            Cập nhật loại khách hàng
                        </Button>
                    </Form>
                </div>
            ),
        },
        {
            key: "branch",
            label: (
                <span>
                    <BranchesOutlined /> Chi nhánh
                </span>
            ),
            children: (
                <div>
                    <Alert
                        message="Gán chi nhánh hàng loạt"
                        description={`Thao tác này sẽ gán chi nhánh cho ${selectedCustomers.length} khách hàng đã chọn.`}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {renderCustomerList()}

                    <Form
                        form={branchForm}
                        layout="vertical"
                        style={{ marginTop: 16 }}
                    >
                        <Form.Item
                            name="branchId"
                            label="Chi nhánh"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chi nhánh",
                                },
                            ]}
                        >
                            <Select>
                                {branches.map((branch) => (
                                    <Select.Option
                                        key={branch.id}
                                        value={branch.id}
                                    >
                                        {branch.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Button type="primary" onClick={handleSubmitBranch}>
                            Gán chi nhánh
                        </Button>
                    </Form>
                </div>
            ),
        },
        {
            key: "delete",
            label: (
                <span>
                    <DeleteOutlined /> Xóa
                </span>
            ),
            children: (
                <div>
                    <Alert
                        message="Xóa khách hàng hàng loạt"
                        description={`Thao tác này sẽ xóa ${selectedCustomers.length} khách hàng đã chọn. Hành động này không thể hoàn tác!`}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {renderCustomerList()}

                    <div style={{ marginTop: 16, textAlign: "center" }}>
                        <Space direction="vertical">
                            <Text type="danger">
                                <InfoCircleOutlined /> Thao tác này sẽ xóa vĩnh
                                viễn dữ liệu và không thể khôi phục.
                            </Text>

                            <Popconfirm
                                title="Xác nhận xóa khách hàng"
                                description={`Bạn có chắc chắn muốn xóa ${selectedCustomers.length} khách hàng đã chọn?`}
                                open={deleteConfirmVisible}
                                onConfirm={handleConfirmDelete}
                                onCancel={() => setDeleteConfirmVisible(false)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    type="primary"
                                    onClick={() =>
                                        setDeleteConfirmVisible(true)
                                    }
                                >
                                    Xóa {selectedCustomers.length} khách hàng
                                </Button>
                            </Popconfirm>
                        </Space>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Modal
            title={`Thao tác hàng loạt (${selectedCustomers.length} khách hàng)`}
            open={open}
            onCancel={onCancel}
            width={600}
            footer={null}
        >
            <Tabs items={items} />
        </Modal>
    );
};

export default BatchActionsModal;
