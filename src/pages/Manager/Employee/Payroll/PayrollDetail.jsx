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
    Space,
} from "antd";
import dayjs from "dayjs";
import {
    InfoCircleOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
} from "@ant-design/icons";

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
                <Descriptions.Item label="Số giờ tăng ca" span={1}>
                    <Text strong style={{ color: "#fa8c16" }}>
                        {payroll.overtime_hours?.toFixed(1)} giờ
                    </Text>
                    {payroll.overtime_hours > 0 && (
                        <Tooltip title="Hệ số lương tăng ca">
                            <Tag color="orange" style={{ marginLeft: 8 }}>
                                x
                                {payroll.overtime_multiplier?.toFixed(2) ||
                                    "1.50"}
                            </Tag>
                        </Tooltip>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Số giờ ca đêm" span={1}>
                    <Text strong style={{ color: "#0050b3" }}>
                        {payroll.night_shift_hours?.toFixed(1)} giờ
                    </Text>
                    {payroll.night_shift_hours > 0 && (
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
                    <Text strong style={{ color: "#fa8c16" }}>
                        {formatCurrency(payroll.overtime_pay)}
                    </Text>
                    {payroll.overtime_hours > 0 && (
                        <div style={{ marginTop: 5 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                ({payroll.overtime_hours?.toFixed(1)} giờ x{" "}
                                {payroll.overtime_multiplier?.toFixed(2) ||
                                    "1.50"}{" "}
                                hệ số)
                            </Text>
                        </div>
                    )}
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
                <Descriptions.Item
                    label={
                        <span>
                            <PlusCircleOutlined style={{ color: "#52c41a" }} />{" "}
                            Phụ cấp
                        </span>
                    }
                >
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ color: "#52c41a" }}>
                            {formatCurrency(payroll.allowances)}
                        </Text>
                        {payroll.allowances > 0 && (
                            <div style={{ marginTop: 5 }}>
                                <Divider
                                    orientation="left"
                                    plain
                                    style={{ margin: "8px 0", fontSize: 12 }}
                                >
                                    <Text type="secondary">
                                        Không tính thuế (
                                        {formatCurrency(
                                            payroll.non_taxable_allowances
                                        )}
                                        )
                                    </Text>
                                </Divider>

                                {payroll.meal_allowance > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Phụ cấp ăn ca:{" "}
                                            {formatCurrency(
                                                payroll.meal_allowance
                                            )}
                                        </Text>
                                    </div>
                                )}
                                {payroll.transport_allowance > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Phụ cấp đi lại:{" "}
                                            {formatCurrency(
                                                payroll.transport_allowance
                                            )}
                                        </Text>
                                    </div>
                                )}
                                {payroll.phone_allowance > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Phụ cấp điện thoại:{" "}
                                            {formatCurrency(
                                                payroll.phone_allowance
                                            )}
                                            {payroll.phone_allowance >
                                                1000000 && (
                                                <Tooltip title="Phần vượt quá 1.000.000đ sẽ tính thuế">
                                                    <InfoCircleOutlined
                                                        style={{
                                                            marginLeft: 5,
                                                            color: "#faad14",
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}
                                        </Text>
                                    </div>
                                )}

                                <Divider
                                    orientation="left"
                                    plain
                                    style={{ margin: "8px 0", fontSize: 12 }}
                                >
                                    <Text type="secondary">
                                        Tính thuế (
                                        {formatCurrency(
                                            payroll.taxable_allowances
                                        )}
                                        )
                                    </Text>
                                </Divider>

                                {payroll.housing_allowance > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Phụ cấp nhà ở:{" "}
                                            {formatCurrency(
                                                payroll.housing_allowance
                                            )}
                                        </Text>
                                    </div>
                                )}
                                {payroll.position_allowance > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Phụ cấp chức vụ:{" "}
                                            {formatCurrency(
                                                payroll.position_allowance
                                            )}
                                        </Text>
                                    </div>
                                )}
                                {payroll.responsibility_allowance > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Phụ cấp trách nhiệm:{" "}
                                            {formatCurrency(
                                                payroll.responsibility_allowance
                                            )}
                                        </Text>
                                    </div>
                                )}
                                {payroll.attendance_bonus > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Thưởng chuyên cần:{" "}
                                            {formatCurrency(
                                                payroll.attendance_bonus
                                            )}
                                        </Text>
                                    </div>
                                )}
                                {payroll.performance_bonus > 0 && (
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 12 }}
                                        >
                                            Thưởng hiệu suất:{" "}
                                            {formatCurrency(
                                                payroll.performance_bonus
                                            )}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        )}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            <MinusCircleOutlined style={{ color: "#f5222d" }} />{" "}
                            Thuế
                        </span>
                    }
                >
                    <Text strong style={{ color: "#f5222d" }}>
                        {formatCurrency(payroll.tax)}
                    </Text>
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            <MinusCircleOutlined style={{ color: "#f5222d" }} />{" "}
                            Bảo hiểm
                        </span>
                    }
                >
                    <Text strong style={{ color: "#f5222d" }}>
                        {formatCurrency(payroll.insurance)}
                    </Text>
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            <MinusCircleOutlined style={{ color: "#f5222d" }} />{" "}
                            Khấu trừ khác
                        </span>
                    }
                >
                    <Text strong style={{ color: "#f5222d" }}>
                        {formatCurrency(
                            payroll.deductions
                                ? payroll.deductions -
                                      (payroll.tax || 0) -
                                      (payroll.insurance || 0)
                                : 0
                        )}
                    </Text>
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
