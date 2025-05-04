import React from "react";
import { Drawer, Descriptions, Tag, Space, Typography, Tooltip } from "antd";
import dayjs from "dayjs";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

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
    if (!selectedRecord) return null;

    // Kiểm tra xem có phải ca đặc biệt không (ca tối/ca đêm)
    const isSpecialShift = () => {
        if (!selectedRecord.employeeShift?.shift) return false;

        const shift = selectedRecord.employeeShift.shift;
        return (
            selectedRecord.type === AttendanceType.NIGHT_SHIFT ||
            shift.end_time === "00:00:00" ||
            shift.start_time === "00:00:00" ||
            shift.start_time > shift.end_time
        );
    };

    // Hiển thị thông tin giờ làm việc với định dạng đẹp hơn
    const renderWorkingHours = () => {
        if (!selectedRecord.working_hours) return "0 giờ";

        // Nếu đây là ca đặc biệt
        if (isSpecialShift()) {
            return (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: "#1890ff" }}>
                        {selectedRecord.working_hours.toFixed(1)} giờ
                    </Text>
                    {selectedRecord.notes &&
                        selectedRecord.notes.includes("early_leave") && (
                            <Tooltip title="Checkout sớm trong ca tối/đêm vẫn được tính đúng giờ làm việc thực tế">
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    <InfoCircleOutlined
                                        style={{ marginRight: 5 }}
                                    />
                                    {selectedRecord.check_in} -{" "}
                                    {selectedRecord.check_out}
                                </Text>
                            </Tooltip>
                        )}
                </Space>
            );
        }

        return `${selectedRecord.working_hours.toFixed(1)} giờ`;
    };

    // Hiển thị trạng thái đặc biệt với các ghi chú bổ sung
    const renderSpecialStatus = () => {
        const notes = selectedRecord.notes || "";
        const tags = [];

        if (notes.includes("late")) {
            tags.push(
                <Tag color="orange" key="late">
                    Đi trễ
                </Tag>
            );
        }

        // Nếu là ca đặc biệt và về sớm, hiển thị tag với tooltip giải thích
        if (notes.includes("early_leave")) {
            if (isSpecialShift()) {
                tags.push(
                    <Tooltip
                        key="early_leave"
                        title="Về sớm trong ca tối/đêm được tính đúng thời gian thực tế"
                    >
                        <Tag color="gold" style={{ cursor: "help" }}>
                            Về sớm <InfoCircleOutlined />
                        </Tag>
                    </Tooltip>
                );
            } else {
                tags.push(
                    <Tag color="gold" key="early_leave">
                        Về sớm
                    </Tag>
                );
            }
        }

        if (notes.includes("on_leave")) {
            tags.push(
                <Tag color="blue" key="on_leave">
                    Nghỉ phép
                </Tag>
            );
        }

        return tags.length > 0 ? <Space>{tags}</Space> : "-";
    };

    // Hiển thị ghi chú với phân tích và định dạng đẹp hơn
    const renderNotes = () => {
        const notes = selectedRecord.notes || "";
        if (!notes) return "-";

        // Thay thế các key bằng văn bản đã dịch
        let displayNotes = notes
            .replace(/late/g, "Đi trễ")
            .replace(/early_leave/g, "Về sớm")
            .replace(/on_leave/g, "Nghỉ phép");

        // Thêm chú thích đặc biệt cho ca tối/đêm có checkout sớm
        if (isSpecialShift() && notes.includes("early_leave")) {
            return (
                <>
                    <div>{displayNotes}</div>
                    <Text
                        type="secondary"
                        style={{ fontSize: 12, marginTop: 5 }}
                    >
                        <InfoCircleOutlined style={{ marginRight: 5 }} />
                        Về sớm trong ca tối/đêm vẫn được tính chính xác giờ làm
                        việc
                    </Text>
                </>
            );
        }

        return displayNotes;
    };

    return (
        <Drawer
            title="Chi tiết chấm công"
            placement="right"
            onClose={onClose}
            open={visible}
            width={500}
        >
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Mã nhân viên">
                    {selectedRecord.employee?.employee_code}
                </Descriptions.Item>
                <Descriptions.Item label="Tên nhân viên">
                    {selectedRecord.employee?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                    {selectedRecord.employee?.department?.name || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày">
                    {dayjs(selectedRecord.date).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ check-in">
                    {selectedRecord.check_in || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ check-out">
                    {selectedRecord.check_out || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ làm việc">
                    {renderWorkingHours()}
                </Descriptions.Item>

                <Descriptions.Item label="Loại chấm công">
                    <Tag
                        color={
                            selectedRecord.type === AttendanceType.OVERTIME
                                ? "orange"
                                : selectedRecord.type ===
                                  AttendanceType.NIGHT_SHIFT
                                ? "purple"
                                : selectedRecord.type === AttendanceType.HOLIDAY
                                ? "green"
                                : "blue"
                        }
                    >
                        {typeLabels[selectedRecord.type]}
                    </Tag>
                    {selectedRecord.type === AttendanceType.NIGHT_SHIFT && (
                        <Tooltip title="Ca đêm được tính với hệ số 1.3">
                            <Tag color="#1890ff">Hệ số 1.3</Tag>
                        </Tooltip>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={statusColors[selectedRecord.status]}>
                        {statusLabels[selectedRecord.status]}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái đặc biệt">
                    {renderSpecialStatus()}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                    {renderNotes()}
                </Descriptions.Item>
                <Descriptions.Item label="Ca làm việc">
                    {selectedRecord.employeeShift?.shift ? (
                        <>
                            {selectedRecord.employeeShift.shift.name} (
                            {selectedRecord.employeeShift.shift.start_time} -{" "}
                            {selectedRecord.employeeShift.shift.end_time})
                            {isSpecialShift() && (
                                <Tag color="purple" style={{ marginLeft: 5 }}>
                                    Ca đặc biệt
                                </Tag>
                            )}
                        </>
                    ) : (
                        "Không có"
                    )}
                </Descriptions.Item>
                {selectedRecord.is_adjustment && (
                    <>
                        <Descriptions.Item label="Lý do điều chỉnh">
                            {selectedRecord.adjustment_reason || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người yêu cầu">
                            {selectedRecord.requested_by || "-"}
                        </Descriptions.Item>
                        {selectedRecord.approved_by && (
                            <Descriptions.Item label="Người duyệt">
                                {selectedRecord.approved_by}
                            </Descriptions.Item>
                        )}
                        {selectedRecord.approved_at && (
                            <Descriptions.Item label="Thời gian duyệt">
                                {dayjs(selectedRecord.approved_at).format(
                                    "DD/MM/YYYY HH:mm"
                                )}
                            </Descriptions.Item>
                        )}
                    </>
                )}
                <Descriptions.Item label="Thời gian tạo">
                    {dayjs(selectedRecord.created_at).format(
                        "DD/MM/YYYY HH:mm"
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                    {dayjs(selectedRecord.updated_at).format(
                        "DD/MM/YYYY HH:mm"
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default AttendanceDetailDrawer;
