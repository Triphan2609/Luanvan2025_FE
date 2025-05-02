import React from "react";
import { Row, Col, Card, Statistic, Typography, Progress } from "antd";
import {
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    RiseOutlined,
    SolutionOutlined,
} from "@ant-design/icons";
import { EMPLOYEE_STATUS } from "../../../../../constants/employee";

const { Title } = Typography;

const EmployeeStatistics = ({
    employees = [],
    departments = [],
    roles = [],
}) => {
    // Calculate statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(
        (emp) => emp.status === EMPLOYEE_STATUS.ACTIVE
    ).length;
    const onLeaveEmployees = employees.filter(
        (emp) => emp.status === EMPLOYEE_STATUS.ON_LEAVE
    ).length;
    const inactiveEmployees = employees.filter(
        (emp) => emp.status === EMPLOYEE_STATUS.INACTIVE
    ).length;

    // Calculate percentages
    const activePercentage = totalEmployees
        ? Math.round((activeEmployees / totalEmployees) * 100)
        : 0;
    const onLeavePercentage = totalEmployees
        ? Math.round((onLeaveEmployees / totalEmployees) * 100)
        : 0;
    const inactivePercentage = totalEmployees
        ? Math.round((inactiveEmployees / totalEmployees) * 100)
        : 0;

    return (
        <div className="employee-statistics">
            <Card>
                <Title level={4}>Thống kê nhân viên</Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                        <Card bordered={false} className="statistic-card">
                            <Statistic
                                title="Tổng nhân viên"
                                value={totalEmployees}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: "#1890ff" }}
                            />
                            <div className="stat-footer">
                                <span>{departments.length} phòng ban</span>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Card bordered={false} className="statistic-card">
                            <Row align="middle">
                                <Col span={12}>
                                    <Statistic
                                        title="Đang làm việc"
                                        value={activeEmployees}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: "#52c41a" }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Progress
                                        type="circle"
                                        percent={activePercentage}
                                        width={80}
                                        strokeColor="#52c41a"
                                        format={() => `${activePercentage}%`}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Card bordered={false} className="statistic-card">
                            <Row align="middle">
                                <Col span={12}>
                                    <Statistic
                                        title="Nghỉ phép"
                                        value={onLeaveEmployees}
                                        prefix={<ClockCircleOutlined />}
                                        valueStyle={{ color: "#faad14" }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Progress
                                        type="circle"
                                        percent={onLeavePercentage}
                                        width={80}
                                        strokeColor="#faad14"
                                        format={() => `${onLeavePercentage}%`}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                        <Card bordered={false} className="statistic-card">
                            <Statistic
                                title="Ngừng làm việc"
                                value={inactiveEmployees}
                                prefix={<StopOutlined />}
                                valueStyle={{ color: "#ff4d4f" }}
                            />
                            <div className="stat-footer">
                                <span>{roles.length} chức vụ</span>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>
            <style jsx="true">{`
                .employee-statistics {
                    margin-bottom: 24px;
                }
                .statistic-card {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .stat-footer {
                    margin-top: 10px;
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.45);
                }
                .ant-card-body {
                    padding: 20px;
                }
                .ant-progress-circle .ant-progress-text {
                    font-size: 12px;
                }
            `}</style>
        </div>
    );
};

export default EmployeeStatistics;
