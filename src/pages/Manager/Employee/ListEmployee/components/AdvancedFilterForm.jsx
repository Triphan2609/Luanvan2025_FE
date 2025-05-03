import React from "react";
import {
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Card,
    Space,
    Divider,
    Typography,
    Badge,
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import {
    EMPLOYEE_STATUS_LABELS,
    EMPLOYEE_STATUS_COLORS,
} from "../../../../../constants/employee";

const { Title } = Typography;

const AdvancedFilterForm = ({
    form,
    departments = [],
    roles = [],
    onFinish,
    onReset,
    onSearch,
    loading,
    initialValues = {},
    isExpanded = false,
    onToggleExpand,
}) => {
    // Xử lý submit form để ngăn refresh trang
    const handleFormSubmit = (e) => {
        if (e) {
            e.preventDefault(); // Ngăn chặn refresh trang
            e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt
        }

        // Lấy giá trị từ form và gọi callback
        const values = form.getFieldsValue();
        if (onFinish) {
            onFinish(values);
        }
    };

    return (
        <Card className="filter-card">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={initialValues}
            >
                {/* Basic search row - always visible */}
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={24} md={14} lg={16} xl={18}>
                        <Form.Item name="search" noStyle>
                            <Input.Search
                                placeholder="Tìm kiếm theo mã, tên, email hoặc số điện thoại..."
                                allowClear
                                enterButton={
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                    >
                                        Tìm
                                    </Button>
                                }
                                loading={loading}
                                size="middle"
                                style={{ maxWidth: "500px" }}
                                onSearch={(value) => {
                                    if (onSearch) {
                                        onSearch(value);
                                    } else {
                                        // Nếu không có hàm onSearch, sử dụng onFinish với giá trị search
                                        const formValues =
                                            form.getFieldsValue();
                                        formValues.search = value;
                                        if (onFinish) onFinish(formValues);
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={10} lg={8} xl={6}>
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button
                                onClick={onToggleExpand}
                                icon={
                                    isExpanded ? (
                                        <UpOutlined />
                                    ) : (
                                        <DownOutlined />
                                    )
                                }
                                size="middle"
                            >
                                {isExpanded ? "Thu gọn" : "Bộ lọc nâng cao"}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const values = form.getFieldsValue();
                                    console.log(
                                        "Áp dụng bộ lọc với giá trị:",
                                        values
                                    );
                                    if (onFinish) onFinish(values);
                                }}
                                icon={<FilterOutlined />}
                                size="middle"
                            >
                                Áp dụng
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Advanced filters - expandable */}
                {isExpanded && (
                    <>
                        <Divider style={{ margin: "16px 0" }} />
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="department_id"
                                    label="Phòng ban"
                                >
                                    <Select
                                        placeholder="Chọn phòng ban"
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {departments.map((dept) => (
                                            <Select.Option
                                                key={dept.id}
                                                value={dept.id}
                                            >
                                                {dept.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="role_id" label="Chức vụ">
                                    <Select
                                        placeholder="Chọn chức vụ"
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {roles.map((role) => (
                                            <Select.Option
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="status" label="Trạng thái">
                                    <Select
                                        placeholder="Chọn trạng thái"
                                        allowClear
                                    >
                                        {Object.entries(
                                            EMPLOYEE_STATUS_LABELS
                                        ).map(([value, label]) => (
                                            <Select.Option
                                                key={value}
                                                value={value}
                                            >
                                                <Badge
                                                    status={
                                                        EMPLOYEE_STATUS_COLORS[
                                                            value
                                                        ]
                                                    }
                                                    text={label}
                                                />
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="end" gutter={[8, 8]} className="mt-5">
                            <Col>
                                <Button
                                    type="default"
                                    htmlType="button"
                                    onClick={(e) => {
                                        if (onReset) {
                                            onReset();
                                        }
                                    }}
                                    icon={<ReloadOutlined />}
                                >
                                    Đặt lại tất cả
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}
            </Form>
        </Card>
    );
};

export default AdvancedFilterForm;
