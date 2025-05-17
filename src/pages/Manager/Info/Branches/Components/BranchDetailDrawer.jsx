import React from "react";
import { Drawer, Descriptions, Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

export default function BranchDetailDrawer({ open, onClose, branch }) {
    return (
        <Drawer title="Chi tiết chi nhánh" placement="right" width={600} onClose={onClose} open={open}>
            {branch ? (
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Tên chi nhánh">{branch.name}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{branch.address}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{branch.phone}</Descriptions.Item>
                    <Descriptions.Item label="Email">{branch.email}</Descriptions.Item>
                    <Descriptions.Item label="Loại chi nhánh">{branch.branchType?.name || "Không xác định"}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag
                            color={branch.status === "active" ? "green" : "red"}
                            icon={branch.status === "active" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        >
                            {branch.status === "active" ? "Hoạt động" : "Ngừng"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày hoạt động">{branch.working_days}</Descriptions.Item>
                    <Descriptions.Item label="Giờ mở cửa">{branch.open_time}</Descriptions.Item>
                    <Descriptions.Item label="Giờ đóng cửa">{branch.close_time}</Descriptions.Item>
                    <Descriptions.Item label="Người quản lý">
                        {branch.manager_name} - {branch.manager_phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng nhân viên">{branch.staff_count}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{branch.description}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>Không có thông tin chi nhánh.</p>
            )}
        </Drawer>
    );
}
