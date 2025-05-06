import React from "react";
import {
    Modal,
    Descriptions,
    Tag,
    Divider,
    Space,
    Badge,
    Typography,
    Button,
} from "antd";
import {
    ClockCircleOutlined,
    UserOutlined,
    BankOutlined,
    TeamOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

// Constants for schedule status
const SCHEDULE_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
};

const ScheduleDetailModal = ({ open, onCancel, schedule }) => {
    if (!schedule) return null;

    const getStatusTagColor = (status) => {
        switch (status) {
            case SCHEDULE_STATUS.PENDING:
                return "warning";
            case SCHEDULE_STATUS.CONFIRMED:
                return "success";
            case SCHEDULE_STATUS.COMPLETED:
                return "default";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case SCHEDULE_STATUS.PENDING:
                return "Chờ xác nhận";
            case SCHEDULE_STATUS.CONFIRMED:
                return "Đã xác nhận";
            case SCHEDULE_STATUS.COMPLETED:
                return "Đã hoàn thành";
            default:
                return "Không xác định";
        }
    };

    const getAttendanceStatusText = (status) => {
        switch (status) {
            case "present":
                return <Tag color="success">Đã điểm danh</Tag>;
            case "absent":
                return <Tag color="error">Vắng mặt</Tag>;
            case "late":
                return <Tag color="warning">Đi trễ</Tag>;
            default:
                return <Tag color="default">Chưa điểm danh</Tag>;
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <CalendarOutlined />
                    <span>Chi tiết lịch làm việc</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Đóng
                </Button>,
            ]}
            width={700}
        >
            <Divider orientation="left">Thông tin chung</Divider>
            <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Mã lịch" span={1}>
                    {schedule.schedule_code}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày làm việc" span={1}>
                    {dayjs(schedule.date).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={1}>
                    <Tag color={getStatusTagColor(schedule.status)}>
                        {getStatusText(schedule.status)}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái điểm danh" span={1}>
                    {getAttendanceStatusText(schedule.attendance_status)}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
                <Space>
                    <UserOutlined />
                    <span>Thông tin nhân viên</span>
                </Space>
            </Divider>
            <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Nhân viên" span={1}>
                    <Text strong>{schedule.employeeName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Chức vụ" span={1}>
                    {schedule.roleName || "Chưa có chức vụ"}
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh" span={1}>
                    {schedule.branchName || "Chưa phân chi nhánh"}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban" span={1}>
                    {schedule.department}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
                <Space>
                    <ClockCircleOutlined />
                    <span>Thông tin ca làm việc</span>
                </Space>
            </Divider>
            <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Tên ca" span={1}>
                    {schedule.shiftName}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian" span={1}>
                    {schedule.shiftTime}
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh ca" span={1}>
                    {schedule.shiftBranchName || "Chưa phân chi nhánh"}
                </Descriptions.Item>
            </Descriptions>

            {(schedule.check_in || schedule.check_out) && (
                <>
                    <Divider orientation="left">
                        <Space>
                            <ClockCircleOutlined />
                            <span>Thông tin điểm danh</span>
                        </Space>
                    </Divider>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Thời gian vào" span={1}>
                            {schedule.check_in
                                ? dayjs(schedule.check_in).format(
                                      "DD/MM/YYYY HH:mm:ss"
                                  )
                                : "Chưa điểm danh vào"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian ra" span={1}>
                            {schedule.check_out
                                ? dayjs(schedule.check_out).format(
                                      "DD/MM/YYYY HH:mm:ss"
                                  )
                                : "Chưa điểm danh ra"}
                        </Descriptions.Item>
                    </Descriptions>
                </>
            )}

            {schedule.note && (
                <>
                    <Divider orientation="left">Ghi chú</Divider>
                    <p>{schedule.note}</p>
                </>
            )}
        </Modal>
    );
};

export default ScheduleDetailModal;
