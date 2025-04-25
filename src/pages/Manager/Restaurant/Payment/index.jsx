// PaymentRestaurant.jsx
import React from "react";
import { Radio, Table, Descriptions, Divider, Button } from "antd";

// 👉 Nếu bạn chưa có Card, CardContent riêng thì có thể bỏ qua hoặc thay bằng <div>
const Card = ({ children }) => <div className="bg-white rounded-xl shadow p-6">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;

export default function PaymentRestaurant() {
    // 🔹 Dữ liệu mẫu
    const table = {
        id: "table01",
        name: "Bàn 1",
        orders: [
            { name: "Phở bò", quantity: 2, price: 45000, type: "food" },
            { name: "Trà đá", quantity: 2, price: 5000, type: "food" },
            { name: "Khăn giấy", quantity: 1, price: 3000, type: "service" },
        ],
    };

    const orderItems = table?.orders || [];
    const createdAt = new Date().toLocaleString();
    const [paymentMethod, setPaymentMethod] = React.useState("cash");

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const columns = [
        {
            title: "Tên món/dịch vụ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (text) => (text === "service" ? "Dịch vụ" : "Món ăn"),
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            render: (text) => `${text.toLocaleString()}đ`,
        },
        {
            title: "Thành tiền",
            key: "total",
            render: (_, record) => `${(record.price * record.quantity).toLocaleString()}đ`,
        },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
            <Card>
                <CardContent>
                    <Descriptions title="Thông tin hóa đơn" bordered column={2} size="small">
                        <Descriptions.Item label="Bàn">{table.name}</Descriptions.Item>
                        <Descriptions.Item label="Ngày giờ">{createdAt}</Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left">Chi tiết đơn hàng</Divider>
                    <Table dataSource={orderItems.map((item, idx) => ({ ...item, key: idx }))} columns={columns} pagination={false} />

                    <div className="text-right mt-4 text-lg">
                        <strong>Tổng cộng: {total.toLocaleString()}đ</strong>
                    </div>

                    <Divider orientation="left">Phương thức thanh toán</Divider>
                    <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <Radio value="cash">Tiền mặt</Radio>
                        <Radio value="card">Thẻ</Radio>
                        <Radio value="bank">Chuyển khoản</Radio>
                    </Radio.Group>

                    <div className="flex justify-between mt-6">
                        <Button onClick={() => alert("Quay lại")}>Quay lại</Button>
                        <Button type="primary" onClick={() => alert("Đã thanh toán")}>
                            Xác nhận thanh toán
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
