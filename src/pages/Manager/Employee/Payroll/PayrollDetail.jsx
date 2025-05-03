import React from "react";
import {
    Descriptions,
    Tag,
    Divider,
    Statistic,
    Row,
    Col,
    Typography,
    Tooltip,
} from "antd";
import dayjs from "dayjs";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const PayrollDetail = ({
    payroll,
    periodTypeLabels,
    statusLabels,
    statusColors,
}) => {
    if (!payroll) return null;

    // Format currency for display
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    return (
        <div className="payroll-detail">
            <Descriptions title="Thông tin nhân viên" bordered column={2}>
                <Descriptions.Item label="Mã nhân viên">
                    {payroll.employee?.employee_code}
                </Descriptions.Item>
                <Descriptions.Item label="Họ và tên">
                    {payroll.employee?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                    {payroll.employee?.department?.name || "Chưa có phòng ban"}
                </Descriptions.Item>
                <Descriptions.Item label="Chức vụ">
                    {payroll.employee?.role?.name || "Chưa có chức vụ"}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Thông tin kỳ lương" bordered column={2}>
                <Descriptions.Item label="Mã bảng lương">
                    <Text strong>{payroll.payroll_code}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag
                        className={`status-${payroll.status}`}
                        color={statusColors[payroll.status]}
                    >
                        {statusLabels[payroll.status]}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Kỳ lương">
                    {dayjs(payroll.period_start).format("DD/MM/YYYY")} -{" "}
                    {dayjs(payroll.period_end).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Loại kỳ lương">
                    <Tag color="blue">
                        {periodTypeLabels[payroll.period_type]}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {payroll.created_at
                        ? dayjs(payroll.created_at).format("DD/MM/YYYY HH:mm")
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày thanh toán">
                    {payroll.payment_date
                        ? dayjs(payroll.payment_date).format("DD/MM/YYYY")
                        : "Chưa thanh toán"}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Chi tiết lương" bordered column={2}>
                <Descriptions.Item label="Lương cơ bản">
                    {formatCurrency(payroll.base_salary)}
                </Descriptions.Item>
                <Descriptions.Item label="Số giờ làm việc">
                    {payroll.total_working_hours?.toFixed(1)} giờ
                </Descriptions.Item>
                <Descriptions.Item label="Số giờ tăng ca">
                    {payroll.overtime_hours?.toFixed(1)} giờ
                </Descriptions.Item>
                <Descriptions.Item label="Số giờ ca đêm" span={1}>
                    <Text strong style={{ color: "#0050b3" }}>
                        {payroll.night_shift_hours?.toFixed(1)} giờ
                    </Text>
                    {payroll.night_shift_multiplier && (
                        <Tooltip title="Hệ số lương ca đêm">
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                                x
                                {payroll.night_shift_multiplier?.toFixed(2) ||
                                    "1.30"}
                            </Tag>
                        </Tooltip>
                    )}
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            Lương tăng ca
                            <Tooltip title="Lương tăng ca = Số giờ tăng ca x Lương giờ x Hệ số tăng ca">
                                <InfoCircleOutlined style={{ marginLeft: 5 }} />
                            </Tooltip>
                        </span>
                    }
                >
                    {formatCurrency(payroll.overtime_pay)}
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            Lương ca đêm
                            <Tooltip title="Lương ca đêm = Số giờ ca đêm x Lương giờ x Hệ số ca đêm">
                                <InfoCircleOutlined style={{ marginLeft: 5 }} />
                            </Tooltip>
                        </span>
                    }
                    span={1}
                >
                    <Text strong style={{ color: "#0050b3" }}>
                        {formatCurrency(payroll.night_shift_pay)}
                    </Text>
                    {payroll.night_shift_hours > 0 && (
                        <div style={{ marginTop: 5 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                ({payroll.night_shift_hours?.toFixed(1)} giờ x{" "}
                                {payroll.night_shift_multiplier?.toFixed(2) ||
                                    "1.30"}{" "}
                                hệ số)
                            </Text>
                        </div>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Phụ cấp">
                    {formatCurrency(payroll.allowances)}
                </Descriptions.Item>
                <Descriptions.Item label="Thuế">
                    {formatCurrency(payroll.tax)}
                </Descriptions.Item>
                <Descriptions.Item label="Bảo hiểm">
                    {formatCurrency(payroll.insurance)}
                </Descriptions.Item>
                <Descriptions.Item label="Khấu trừ khác">
                    {formatCurrency(
                        payroll.deductions
                            ? payroll.deductions -
                                  (payroll.tax || 0) -
                                  (payroll.insurance || 0)
                            : 0
                    )}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Row gutter={16}>
                <Col span={12}>
                    <Statistic
                        title="Tổng lương gộp"
                        value={formatCurrency(payroll.gross_pay)}
                        precision={0}
                    />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="Lương thực lãnh"
                        value={formatCurrency(payroll.net_pay)}
                        precision={0}
                        valueStyle={{ color: "#3f8600" }}
                    />
                </Col>
            </Row>

            {payroll.notes && (
                <>
                    <Divider />
                    <div>
                        <Text strong>Ghi chú:</Text>
                        <p>{payroll.notes}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default PayrollDetail;
