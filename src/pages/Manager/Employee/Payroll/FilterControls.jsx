import React from "react";
import { Form, Row, Col, Select, DatePicker, Input, Space, Button } from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

const FilterControls = ({
    form,
    departments = [],
    employees = [],
    periodTypes = {},
    periodTypeLabels = {},
    dateRange,
    onDateRangeChange,
    loading,
    onSearch,
    onReset,
    onFetchData,
}) => {
    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={onSearch}
                initialValues={{}}
            >
                <Row gutter={16} className="filter-row">
                    <Col xs={24} sm={12} lg={5}>
                        <Form.Item name="department_id" label="Phòng ban">
                            <Select
                                allowClear
                                placeholder="Chọn phòng ban"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={() => onFetchData()}
                                loading={loading}
                            >
                                {departments.map((dept) => (
                                    <Option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={5}>
                        <Form.Item name="employee_id" label="Nhân viên">
                            <Select
                                allowClear
                                placeholder="Chọn nhân viên"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={() => onFetchData()}
                            >
                                {employees.map((emp) => (
                                    <Option key={emp.id} value={emp.id}>
                                        {emp.employee_code
                                            ? `${emp.employee_code} - `
                                            : ""}
                                        {emp.name}
                                        {emp.department?.name
                                            ? ` - ${emp.department.name}`
                                            : ""}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={4}>
                        <Form.Item name="period_type" label="Loại kỳ lương">
                            <Select
                                allowClear
                                placeholder="Chọn loại kỳ lương"
                                onChange={() => onFetchData()}
                            >
                                {Object.keys(periodTypes).map((key) => (
                                    <Option key={key} value={periodTypes[key]}>
                                        {periodTypeLabels[periodTypes[key]]}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="Khoảng thời gian">
                            <RangePicker
                                value={dateRange}
                                onChange={onDateRangeChange}
                                format="DD/MM/YYYY"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} lg={4}>
                        <Form.Item name="search" label="Tìm kiếm">
                            <Input
                                placeholder="Tìm theo mã, tên..."
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Row justify="end" style={{ marginTop: 16 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={onSearch}
                    >
                        Tìm kiếm
                    </Button>
                    <Button icon={<FilterOutlined />} onClick={onReset}>
                        Đặt lại
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        loading={loading}
                        onClick={() => onFetchData()}
                    >
                        Làm mới
                    </Button>
                </Space>
            </Row>
        </>
    );
};

export default FilterControls;
