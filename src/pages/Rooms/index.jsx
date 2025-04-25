import { Table, Button, Space, Input, Card } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

const columns = [
    {
        title: "Mã phòng",
        dataIndex: "roomCode",
        key: "roomCode",
    },
    {
        title: "Loại phòng",
        dataIndex: "roomType",
        key: "roomType",
    },
    {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        render: (price) => `${price.toLocaleString()} VND`,
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => (
            <span style={{ color: status === "Available" ? "green" : "red" }}>{status === "Available" ? "Còn trống" : "Đã đặt"}</span>
        ),
    },
    {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
            <Space size="middle">
                <Button type="link">Sửa</Button>
                <Button type="link" danger>
                    Xóa
                </Button>
            </Space>
        ),
    },
];

const data = [
    {
        key: "1",
        roomCode: "P101",
        roomType: "Deluxe",
        price: 1500000,
        status: "Available",
    },
    {
        key: "2",
        roomCode: "P102",
        roomType: "Standard",
        price: 1000000,
        status: "Booked",
    },
    // Thêm dữ liệu mẫu khác
];

export default function Rooms() {
    return (
        <Card
            title="Quản lý Phòng"
            extra={
                <Button type="primary" icon={<PlusOutlined />}>
                    Thêm phòng
                </Button>
            }
        >
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm kiếm phòng"
                    allowClear
                    enterButton={
                        <Button type="primary" icon={<SearchOutlined />}>
                            Tìm kiếm
                        </Button>
                    }
                    size="large"
                    style={{ width: 400 }}
                />
            </div>

            <Table
                columns={columns}
                dataSource={data}
                bordered
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    showTotal: (total) => `Tổng ${total} phòng`,
                }}
            />
        </Card>
    );
}
