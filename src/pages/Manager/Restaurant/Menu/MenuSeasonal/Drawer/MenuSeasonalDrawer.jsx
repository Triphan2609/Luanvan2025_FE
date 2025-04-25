import React from "react";
import { Drawer, Descriptions, Button, Space, Tag, Table, Typography, Divider, Statistic, Row, Col } from "antd";
import { EditOutlined, CalendarOutlined, DollarOutlined, ShoppingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

const MenuSeasonalDrawer = ({ open, onClose, menu, onEdit, allFoods }) => {
    if (!menu) return null;

    const menuFoods = menu.foods.map((foodId) => allFoods.find((f) => f.id === foodId)).filter(Boolean);

    const totalPrice = menuFoods.reduce((sum, food) => sum + food.price, 0);
    const isExpired = dayjs().isAfter(menu.endDate);
    const daysLeft = dayjs(menu.endDate).diff(dayjs(), "day");

    const columns = [
        {
            title: "STT",
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên món",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            align: "right",
            render: (price) => `${price.toLocaleString()}đ`,
        },
    ];

    return (
        <Drawer
            title={menu.name}
            placement="right"
            onClose={onClose}
            open={open}
            width={700}
            extra={
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                        onEdit(menu);
                        onClose();
                    }}
                >
                    Chỉnh sửa
                </Button>
            }
        >
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Statistic title="Số món ăn" value={menuFoods.length} prefix={<ShoppingOutlined />} />
                </Col>
                <Col span={12}>
                    <Statistic title="Tổng giá trị" value={totalPrice} prefix={<DollarOutlined />} suffix="đ" />
                </Col>
            </Row>

            <Divider />

            <Descriptions column={1} bordered>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={menu.status ? "green" : "red"}>{menu.status ? "Đang hiển thị" : "Đã ẩn"}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Thời hạn">
                    <Space>
                        <Tag color={isExpired ? "red" : "green"}>{isExpired ? "Hết hạn" : "Còn hạn"}</Tag>
                        {!isExpired && daysLeft > 0 && <span>({daysLeft} ngày còn lại)</span>}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian áp dụng">
                    <Space>
                        <CalendarOutlined />
                        {`${dayjs(menu.startDate).format("DD/MM/YYYY")} - ${dayjs(menu.endDate).format("DD/MM/YYYY")}`}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả">{menu.description || "Không có mô tả"}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Danh sách món ăn</Divider>

            <Table
                dataSource={menuFoods}
                columns={columns}
                pagination={false}
                rowKey="id"
                size="small"
                summary={(pageData) => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={2} align="right">
                                <strong>Tổng cộng:</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align="right">
                                <strong>{totalPrice.toLocaleString()}đ</strong>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />
        </Drawer>
    );
};

export default MenuSeasonalDrawer;
