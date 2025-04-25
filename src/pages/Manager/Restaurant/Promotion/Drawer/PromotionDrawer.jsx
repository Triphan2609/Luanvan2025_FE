import React from "react";
import { Drawer, Descriptions, Tag } from "antd";
import dayjs from "dayjs";

const typeMap = {
    percent: "Giảm theo %",
    amount: "Giảm theo số tiền",
    free_item: "Tặng món miễn phí",
};

export default function PromotionDrawer({ open, onClose, promotion }) {
    if (!promotion) return null;

    return (
        <Drawer title="Chi tiết khuyến mãi" open={open} onClose={onClose} width={480}>
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên chương trình">{promotion.name}</Descriptions.Item>
                <Descriptions.Item label="Loại khuyến mãi">
                    <Tag color="blue">{typeMap[promotion.type]}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giá trị">
                    {promotion.type === "percent"
                        ? `${promotion.value}%`
                        : promotion.type === "amount"
                        ? `${promotion.value.toLocaleString()} ₫`
                        : promotion.value}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian áp dụng">
                    {dayjs(promotion.start).format("DD/MM/YYYY")} - {dayjs(promotion.end).format("DD/MM/YYYY")}
                </Descriptions.Item>
                {promotion.note && <Descriptions.Item label="Ghi chú">{promotion.note}</Descriptions.Item>}
            </Descriptions>
        </Drawer>
    );
}
