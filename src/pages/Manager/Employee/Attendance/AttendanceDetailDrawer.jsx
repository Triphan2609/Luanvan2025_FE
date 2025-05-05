import React, { useState } from "react";
import {
    Drawer,
    Descriptions,
    Button,
    Space,
    Tag,
    Divider,
    Typography,
    Popconfirm,
    message,
    Timeline,
    Card,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    EditOutlined,
    AuditOutlined,
    FileDoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    approveAttendanceAdjustment,
    rejectAttendanceAdjustment,
} from "../../../../api/attendanceApi";

const { Title, Text } = Typography;

// Sử dụng các enum để phù hợp với file chính
const AttendanceType = {
    NORMAL: "normal",
    OVERTIME: "overtime",
    NIGHT_SHIFT: "night_shift",
    HOLIDAY: "holiday",
};

const AttendanceStatus = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

const statusColors = {
    [AttendanceStatus.PENDING]: "warning",
    [AttendanceStatus.APPROVED]: "success",
    [AttendanceStatus.REJECTED]: "error",
};

const statusLabels = {
    [AttendanceStatus.PENDING]: "Chờ xác nhận",
    [AttendanceStatus.APPROVED]: "Đã xác nhận",
    [AttendanceStatus.REJECTED]: "Đã từ chối",
};

const typeLabels = {
    [AttendanceType.NORMAL]: "Thông thường",
    [AttendanceType.OVERTIME]: "Tăng ca",
    [AttendanceType.NIGHT_SHIFT]: "Ca đêm",
    [AttendanceType.HOLIDAY]: "Ngày lễ",
};

const AttendanceDetailDrawer = ({ visible, onClose, selectedRecord }) => {
    const [loading, setLoading] = useState(false);

    // Kiểm tra nếu record là undefined
    if (!selectedRecord) {
        return null;
    }

    const handleApprove = async () => {
        try {
            setLoading(true);
            await approveAttendanceAdjustment(selectedRecord.id);
            message.success("Đã phê duyệt yêu cầu điều chỉnh");
            onClose(); // Đóng drawer sau khi phê duyệt
        } catch (error) {
            console.error("Error approving adjustment:", error);
            message.error("Không thể phê duyệt yêu cầu điều chỉnh");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            await rejectAttendanceAdjustment(selectedRecord.id);
            message.success("Đã từ chối yêu cầu điều chỉnh");
            onClose(); // Đóng drawer sau khi từ chối
        } catch (error) {
            console.error("Error rejecting adjustment:", error);
            message.error("Không thể từ chối yêu cầu điều chỉnh");
        } finally {
            setLoading(false);
        }
    };

    // Xác định trạng thái và màu sắc tương ứng
    const getStatusTag = (status) => {
        const statusMap = {
            pending: { color: "warning", text: "Chờ xác nhận" },
            approved: { color: "success", text: "Đã xác nhận" },
            rejected: { color: "error", text: "Đã từ chối" },
        };

        const statusInfo = statusMap[status] || {
            color: "default",
            text: status,
        };

        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    };

    // Xác định loại chấm công và màu sắc tương ứng
    const getTypeTag = (type) => {
        const typeMap = {
            normal: { color: "blue", text: "Thường" },
            overtime: { color: "orange", text: "Tăng ca" },
            night_shift: { color: "purple", text: "Ca đêm" },
            holiday: { color: "green", text: "Ngày lễ" },
        };

        const typeInfo = typeMap[type] || { color: "default", text: type };

        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
    };

    // Kiểm tra xem có phải yêu cầu điều chỉnh không
    const isAdjustment = selectedRecord.is_adjustment === true;

    return (
        <Drawer
            title={
                <Space>
                    <ClockCircleOutlined />
                    {isAdjustment
                        ? "Chi tiết yêu cầu điều chỉnh"
                        : "Chi tiết chấm công"}
                </Space>
            }
            placement="right"
            closable={true}
            onClose={onClose}
            visible={visible}
            width={600}
            footer={
                isAdjustment && selectedRecord.status === "pending" ? (
                    <div
                        style={{
                            textAlign: "right",
                        }}
                    >
                        <Space>
                            <Popconfirm
                                title="Bạn có chắc muốn từ chối yêu cầu này?"
                                onConfirm={handleReject}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button danger loading={loading}>
                                    <CloseCircleOutlined /> Từ chối
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Bạn có chắc muốn phê duyệt yêu cầu này?"
                                onConfirm={handleApprove}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button type="primary" loading={loading}>
                                    <CheckCircleOutlined /> Phê duyệt
                                </Button>
                            </Popconfirm>
                        </Space>
                    </div>
                ) : null
            }
        >
            {isAdjustment && (
                <>
                    <Card style={{ marginBottom: 16, borderColor: "#faad14" }}>
                        <Title level={5}>
                            <AuditOutlined /> Thông tin yêu cầu điều chỉnh
                        </Title>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Trạng thái">
                                {getStatusTag(selectedRecord.status)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do điều chỉnh">
                                {selectedRecord.adjustment_reason ||
                                    "Không có lý do"}
                            </Descriptions.Item>
                            {selectedRecord.requested_by && (
                                <Descriptions.Item label="Người yêu cầu">
                                    {selectedRecord.requested_by_name ||
                                        selectedRecord.requested_by}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày yêu cầu">
                                {selectedRecord.created_at
                                    ? dayjs(selectedRecord.created_at).format(
                                          "DD/MM/YYYY HH:mm"
                                      )
                                    : "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </>
            )}

            <Title level={5}>
                <UserOutlined /> Thông tin nhân viên
            </Title>
            <Descriptions column={1} size="small">
                <Descriptions.Item label="Mã nhân viên">
                    {selectedRecord.employee?.employee_code || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tên nhân viên">
                    {selectedRecord.employee?.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                    {selectedRecord.employee?.department?.name ||
                        "Không có phòng ban"}
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh">
                    {selectedRecord.employee?.branch?.name ||
                        "Không có chi nhánh"}
                </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <Title level={5}>
                <CalendarOutlined /> Thông tin chấm công
            </Title>
            <Descriptions column={1} size="small">
                <Descriptions.Item label="Ngày">
                    {dayjs(selectedRecord.date).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Ca làm việc">
                    {selectedRecord.employeeShift ? (
                        <>
                            {selectedRecord.employeeShift.shift?.name} (
                            {selectedRecord.employeeShift.shift?.start_time} -{" "}
                            {selectedRecord.employeeShift.shift?.end_time})
                        </>
                    ) : (
                        "Không có ca làm việc"
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ vào">
                    {selectedRecord.check_in || "Chưa ghi nhận"}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ ra">
                    {selectedRecord.check_out || "Chưa ghi nhận"}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng thời gian">
                    {selectedRecord.working_hours
                        ? `${selectedRecord.working_hours.toFixed(1)} giờ`
                        : "0 giờ"}
                </Descriptions.Item>
                <Descriptions.Item label="Loại chấm công">
                    {getTypeTag(selectedRecord.type)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    {getStatusTag(selectedRecord.status)}
                </Descriptions.Item>
                {selectedRecord.notes && (
                    <Descriptions.Item label="Ghi chú">
                        {selectedRecord.notes
                            .split(",")
                            .map((note) => note.trim())
                            .filter((note) => note)
                            .map((note, index) => {
                                let color = "default";
                                let text = note;

                                if (note.includes("late")) {
                                    color = "orange";
                                    text = "Đi trễ";
                                } else if (note.includes("early_leave")) {
                                    color = "gold";
                                    text = "Về sớm";
                                } else if (note.includes("on_leave")) {
                                    color = "blue";
                                    text = "Nghỉ phép";
                                }

                                return (
                                    <Tag
                                        color={color}
                                        key={index}
                                        style={{ margin: 2 }}
                                    >
                                        {text}
                                    </Tag>
                                );
                            })}
                    </Descriptions.Item>
                )}
            </Descriptions>

            {selectedRecord.status === "approved" && (
                <>
                    <Divider style={{ margin: "16px 0" }} />
                    <Title level={5}>
                        <FileDoneOutlined /> Thông tin duyệt
                    </Title>
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Người duyệt">
                            {selectedRecord.approved_by_name || "Admin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian duyệt">
                            {selectedRecord.updated_at
                                ? dayjs(selectedRecord.updated_at).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "N/A"}
                        </Descriptions.Item>
                    </Descriptions>
                </>
            )}
        </Drawer>
    );
};

export default AttendanceDetailDrawer;
