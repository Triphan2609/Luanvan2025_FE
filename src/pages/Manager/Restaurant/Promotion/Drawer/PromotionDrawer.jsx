import React from "react";
import { Drawer, Descriptions, Tag, Image } from "antd";
import dayjs from "dayjs";

const typeMap = {
    ITEM: "Theo món",
    BILL: "Theo hóa đơn",
    COMBO: "Combo",
    TIME: "Khung giờ vàng",
};
const valueTypeMap = {
    PERCENT: "%",
    AMOUNT: "VNĐ",
};
const statusColor = {
    active: "green",
    inactive: "orange",
    expired: "red",
};

export default function PromotionDrawer({ open, onClose, promotion }) {
    if (!promotion) return null;
    return (
        <Drawer
            title="Chi tiết khuyến mãi"
            open={open}
            onClose={onClose}
            width={520}
        >
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên chương trình">
                    {promotion.name}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                    {promotion.description || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Loại khuyến mãi">
                    <Tag color="blue">
                        {typeMap[promotion.type] || promotion.type}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Kiểu giá trị">
                    <Tag>
                        {valueTypeMap[promotion.valueType] ||
                            promotion.valueType}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giá trị">
                    {promotion.value}
                    {promotion.valueType === "PERCENT"
                        ? "%"
                        : promotion.valueType === "AMOUNT"
                        ? " VNĐ"
                        : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian áp dụng">
                    {dayjs(promotion.startDate).format("DD/MM/YYYY")} -{" "}
                    {dayjs(promotion.endDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={statusColor[promotion.status]}>
                        {promotion.status}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh">
                    {promotion.branch?.name || "Toàn hệ thống"}
                </Descriptions.Item>
                <Descriptions.Item label="Menu áp dụng">
                    {promotion.menus && promotion.menus.length > 0
                        ? promotion.menus.map((m) => (
                              <Tag key={m.id}>{m.name}</Tag>
                          ))
                        : "Tất cả menu"}
                </Descriptions.Item>
                <Descriptions.Item label="Giá trị hóa đơn tối thiểu">
                    {promotion.minOrderValue
                        ? promotion.minOrderValue.toLocaleString() + " VNĐ"
                        : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ảnh banner">
                    {promotion.imageUrl ? (
                        <Image
                            src={promotion.imageUrl}
                            alt="banner"
                            width={180}
                        />
                    ) : (
                        <span>-</span>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
}
