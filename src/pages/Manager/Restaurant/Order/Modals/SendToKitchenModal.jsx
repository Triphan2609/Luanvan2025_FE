import React from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    Badge,
    List,
    Typography,
    Divider,
    Alert,
} from "antd";

const { Text } = Typography;

const SendToKitchenModal = ({
    visible,
    onClose,
    onConfirm,
    orderNote,
    setOrderNote,
    orderPriority,
    setOrderPriority,
    cart = [],
}) => {
    // Tính tổng số lượng và tổng tiền
    const totalQuantity = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
    );
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
    );

    return (
        <Modal
            title="Xác nhận gửi đơn hàng đến bếp"
            open={visible}
            onOk={onConfirm}
            onCancel={onClose}
            okText="Xác nhận gửi bếp"
            cancelText="Hủy"
        >
            <Alert
                type="warning"
                showIcon
                message="Bạn có chắc muốn gửi tất cả các món/dịch vụ dưới đây đến bếp? Hành động này không thể hoàn tác."
                style={{ marginBottom: 16 }}
            />
            <List
                size="small"
                bordered
                dataSource={cart}
                renderItem={(item) => (
                    <List.Item>
                        <Text strong>{item.name}</Text> x{item.quantity} -{" "}
                        {item.price.toLocaleString()}đ
                    </List.Item>
                )}
                style={{ marginBottom: 8, maxHeight: 200, overflowY: "auto" }}
            />
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ marginBottom: 8 }}>
                <Text>
                    Tổng số lượng: <b>{totalQuantity}</b>
                </Text>{" "}
                &nbsp;|&nbsp;
                <Text>
                    Tổng tiền: <b>{totalPrice.toLocaleString()}đ</b>
                </Text>
            </div>
            <Form layout="vertical">
                <Form.Item label="Ghi chú đơn hàng">
                    <Input.TextArea
                        rows={2}
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Ghi chú thêm về đơn hàng..."
                    />
                </Form.Item>
                <Form.Item label="Mức độ ưu tiên">
                    <Select
                        value={orderPriority}
                        onChange={setOrderPriority}
                        style={{ width: "100%" }}
                    >
                        <Select.Option value="normal">
                            <Badge status="processing" text="Thường" />
                        </Select.Option>
                        <Select.Option value="high">
                            <Badge status="warning" text="Ưu tiên" />
                        </Select.Option>
                        <Select.Option value="urgent">
                            <Badge status="error" text="Khẩn cấp" />
                        </Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SendToKitchenModal;
