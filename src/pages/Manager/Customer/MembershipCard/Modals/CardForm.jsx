import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Radio,
    InputNumber,
    Row,
    Col,
    Card,
    Divider,
    Statistic,
    Space,
    Tag,
    Tabs,
    Badge,
    Typography,
    Progress,
    Avatar,
    Tooltip,
    Button,
    message,
} from "antd";
import { CARD_TYPE, CARD_STATUS } from "../constants";
import dayjs from "dayjs";
import {
    CrownOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    StarOutlined,
    DollarOutlined,
    GiftOutlined,
    ReadOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

export default function CardForm({
    open,
    onCancel,
    onSubmit,
    editingCard,
    TYPE_CONFIGS,
    customerList,
}) {
    const [form] = Form.useForm();
    const isEditing = !!editingCard;
    const [formValues, setFormValues] = useState({
        type: CARD_TYPE.SILVER,
        status: CARD_STATUS.ACTIVE,
        points: 0,
        totalSpent: 0,
        customerId: null,
        issueDate: dayjs(),
        expireDate: dayjs().add(1, "year"),
    });
    const [customer, setCustomer] = useState(null);
    const [activeTab, setActiveTab] = useState("form");

    // Reset form khi modal đóng/mở hoặc dữ liệu thay đổi
    useEffect(() => {
        if (open) {
            form.resetFields();

            if (editingCard) {
                // Khi chỉnh sửa thẻ, cần set giá trị cho form
                const values = {
                    ...editingCard,
                    issueDate: editingCard.issueDate
                        ? dayjs(editingCard.issueDate)
                        : null,
                    expireDate: editingCard.expireDate
                        ? dayjs(editingCard.expireDate)
                        : null,
                };
                form.setFieldsValue(values);
                setFormValues(values);
            } else {
                // Khi tạo mới thẻ, set giá trị mặc định
                const today = dayjs();
                const nextYear = today.add(1, "year");
                const defaultValues = {
                    type: CARD_TYPE.SILVER,
                    status: CARD_STATUS.ACTIVE,
                    points: 0,
                    totalSpent: 0,
                    issueDate: today,
                    expireDate: nextYear,
                };

                form.setFieldsValue(defaultValues);
                setFormValues(defaultValues);
            }
        }
    }, [open, editingCard, form]);

    // Cập nhật customer để hiển thị trên preview
    useEffect(() => {
        if (formValues.customerId && customerList) {
            const selectedCustomer = customerList.find(
                (c) => c.id === formValues.customerId
            );
            setCustomer(selectedCustomer);
        } else if (isEditing && editingCard) {
            setCustomer({
                name: editingCard.customerName,
                id: editingCard.customerId,
            });
        }
    }, [formValues.customerId, customerList, isEditing, editingCard]);

    // Xử lý khi người dùng submit form
    const handleSubmit = () => {
        form.validateFields().then((values) => {
            // Debug: Kiểm tra giá trị customerId
            console.log("Form values before format:", values);
            console.log(
                "Customer ID before format:",
                values.customerId,
                typeof values.customerId
            );

            // Chuyển đổi các trường Date thành string dạng YYYY-MM-DD cho backend
            const formattedValues = {
                ...values,
                // Không chuyển đổi customerId thành số nữa
                customerId: values.customerId,
                issueDate: values.issueDate.format("YYYY-MM-DD"),
                expireDate: values.expireDate.format("YYYY-MM-DD"),
            };

            // Debug: Kiểm tra giá trị đã format
            console.log("Formatted values:", formattedValues);

            // Kiểm tra chặt chẽ trước khi submit
            if (!formattedValues.customerId && !isEditing) {
                message.error("Vui lòng chọn khách hàng");
                return;
            }

            onSubmit(formattedValues);
        });
    };

    // Tính ngày hết hạn mặc định
    const handleIssueDateChange = (date) => {
        if (date) {
            const expireDate = date.add(1, "year");
            form.setFieldValue("expireDate", expireDate);
            setFormValues((prev) => ({
                ...prev,
                issueDate: date,
                expireDate: expireDate,
            }));
        }
    };

    // Xử lý khi giá trị form thay đổi để cập nhật preview
    const handleValuesChange = (changedValues, allValues) => {
        setFormValues(allValues);
    };

    // Format tiền tệ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // Hiển thị trạng thái thẻ
    const renderStatus = (status) => {
        const statusConfig = {
            [CARD_STATUS.ACTIVE]: {
                color: "success",
                text: "Hoạt động",
                icon: <CheckCircleOutlined />,
            },
            [CARD_STATUS.EXPIRED]: {
                color: "error",
                text: "Hết hạn",
                icon: <ClockCircleOutlined />,
            },
            [CARD_STATUS.BLOCKED]: {
                color: "default",
                text: "Đã khóa",
                icon: <StopOutlined />,
            },
        };

        return (
            <Tag
                color={statusConfig[status].color}
                icon={statusConfig[status].icon}
            >
                {statusConfig[status].text}
            </Tag>
        );
    };

    // Tạo mô phỏng thẻ
    const renderCardPreview = () => {
        if (!formValues) return null;

        const cardType = formValues.type || CARD_TYPE.SILVER;
        const typeConfig = TYPE_CONFIGS[cardType];

        return (
            <div style={{ padding: "16px 0" }}>
                <Title level={4}>Mô phỏng thẻ thành viên</Title>
                <div className="membership-card-preview">
                    <Card
                        style={{
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            background: `linear-gradient(135deg, #fff, ${typeConfig.color}22)`,
                            borderTop: `5px solid ${typeConfig.color}`,
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                }}
                            >
                                {renderStatus(
                                    formValues.status || CARD_STATUS.ACTIVE
                                )}
                            </div>

                            <Row gutter={[16, 16]} align="middle">
                                <Col span={24}>
                                    <Space align="center">
                                        <CrownOutlined
                                            style={{
                                                fontSize: "28px",
                                                color: typeConfig.color,
                                            }}
                                        />
                                        <Title
                                            level={3}
                                            style={{
                                                margin: 0,
                                                color: typeConfig.color,
                                            }}
                                        >
                                            {typeConfig.name.toUpperCase()}
                                        </Title>
                                    </Space>
                                </Col>
                            </Row>

                            <Divider style={{ margin: "16px 0" }} />

                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Space>
                                        <Avatar
                                            size={44}
                                            icon={<UserOutlined />}
                                        />
                                        <div>
                                            <Title
                                                level={4}
                                                style={{ margin: 0 }}
                                            >
                                                {customer
                                                    ? customer.name
                                                    : "Chọn khách hàng"}
                                            </Title>
                                            <Text type="secondary">
                                                Mã KH:{" "}
                                                {customer
                                                    ? customer.customer_code ||
                                                      "N/A"
                                                    : "---"}
                                            </Text>
                                        </div>
                                    </Space>
                                </Col>
                            </Row>

                            <Row
                                gutter={[16, 16]}
                                style={{ marginTop: "16px" }}
                            >
                                <Col span={12}>
                                    <Statistic
                                        title={
                                            <Text strong>
                                                <StarOutlined /> Điểm tích lũy
                                            </Text>
                                        }
                                        value={formValues.points || 0}
                                        suffix="điểm"
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Space direction="vertical">
                                        <Text strong>
                                            <DollarOutlined /> Tổng chi tiêu
                                        </Text>
                                        <Text style={{ fontSize: "16px" }}>
                                            {formatCurrency(
                                                formValues.totalSpent || 0
                                            )}
                                        </Text>
                                        <Progress
                                            percent={Math.min(
                                                100,
                                                ((formValues.totalSpent || 0) /
                                                    typeConfig.minSpent) *
                                                    100
                                            )}
                                            size="small"
                                            showInfo={false}
                                            strokeColor={typeConfig.color}
                                        />
                                    </Space>
                                </Col>
                            </Row>

                            <Divider style={{ margin: "16px 0" }} />

                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary">
                                            <CalendarOutlined /> Ngày phát hành
                                        </Text>
                                        <Text>
                                            {formValues.issueDate
                                                ? formValues.issueDate.format(
                                                      "DD/MM/YYYY"
                                                  )
                                                : "--/--/----"}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary">
                                            <CalendarOutlined /> Ngày hết hạn
                                        </Text>
                                        <Text>
                                            {formValues.expireDate
                                                ? formValues.expireDate.format(
                                                      "DD/MM/YYYY"
                                                  )
                                                : "--/--/----"}
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    <Divider orientation="left">Thông tin thẻ</Divider>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card size="small" title="Quyền lợi thành viên">
                                <ul style={{ paddingLeft: "20px" }}>
                                    {typeConfig.benefits.map((benefit, idx) => (
                                        <li key={idx}>
                                            <Text>{benefit}</Text>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    };

    return (
        <Modal
            title={
                isEditing ? "Cập nhật thẻ thành viên" : "Cấp thẻ thành viên mới"
            }
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            width={800}
            okText={isEditing ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
            maskClosable={false}
            destroyOnClose
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: "form",
                        label: (
                            <span>
                                <ReadOutlined /> Thông tin thẻ
                            </span>
                        ),
                        children: (
                            <Form
                                form={form}
                                layout="vertical"
                                initialValues={{
                                    type: CARD_TYPE.SILVER,
                                    status: CARD_STATUS.ACTIVE,
                                    points: 0,
                                    totalSpent: 0,
                                }}
                                onValuesChange={handleValuesChange}
                            >
                                {!isEditing && (
                                    <Form.Item
                                        name="customerId"
                                        label="Khách hàng"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng chọn khách hàng",
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Chọn khách hàng"
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={(value) => {
                                                console.log(
                                                    "Customer selected:",
                                                    value,
                                                    typeof value
                                                );

                                                // Không chuyển đổi UUID thành số nữa
                                                form.setFieldValue(
                                                    "customerId",
                                                    value
                                                );

                                                // Cập nhật formValues để preview được cập nhật
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    customerId: value,
                                                }));

                                                // Cập nhật customer để hiển thị
                                                const selectedCustomer =
                                                    customerList.find(
                                                        (c) => c.id === value
                                                    );
                                                setCustomer(selectedCustomer);
                                            }}
                                        >
                                            {customerList.map((customer) => (
                                                <Select.Option
                                                    key={customer.id}
                                                    value={customer.id}
                                                >
                                                    {customer.name} (
                                                    {customer.customer_code ||
                                                        "Chưa có mã"}
                                                    )
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                )}

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="type"
                                            label="Hạng thẻ"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng chọn hạng thẻ",
                                                },
                                            ]}
                                        >
                                            <Radio.Group buttonStyle="solid">
                                                {Object.entries(CARD_TYPE).map(
                                                    ([key, value]) => (
                                                        <Radio.Button
                                                            key={key}
                                                            value={value}
                                                        >
                                                            <Space>
                                                                <CrownOutlined
                                                                    style={{
                                                                        color: TYPE_CONFIGS[
                                                                            value
                                                                        ].color,
                                                                    }}
                                                                />
                                                                {
                                                                    TYPE_CONFIGS[
                                                                        value
                                                                    ].name
                                                                }
                                                            </Space>
                                                        </Radio.Button>
                                                    )
                                                )}
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="status"
                                            label="Trạng thái"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng chọn trạng thái",
                                                },
                                            ]}
                                        >
                                            <Radio.Group buttonStyle="solid">
                                                <Radio.Button
                                                    value={CARD_STATUS.ACTIVE}
                                                >
                                                    <Space>
                                                        <CheckCircleOutlined
                                                            style={{
                                                                color: "green",
                                                            }}
                                                        />
                                                        Hoạt động
                                                    </Space>
                                                </Radio.Button>
                                                <Radio.Button
                                                    value={CARD_STATUS.EXPIRED}
                                                >
                                                    <Space>
                                                        <ClockCircleOutlined
                                                            style={{
                                                                color: "orange",
                                                            }}
                                                        />
                                                        Hết hạn
                                                    </Space>
                                                </Radio.Button>
                                                <Radio.Button
                                                    value={CARD_STATUS.BLOCKED}
                                                >
                                                    <Space>
                                                        <StopOutlined
                                                            style={{
                                                                color: "red",
                                                            }}
                                                        />
                                                        Đã khóa
                                                    </Space>
                                                </Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="issueDate"
                                            label="Ngày cấp thẻ"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng chọn ngày cấp thẻ",
                                                },
                                            ]}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="DD/MM/YYYY"
                                                onChange={handleIssueDateChange}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="expireDate"
                                            label="Ngày hết hạn"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng chọn ngày hết hạn",
                                                },
                                            ]}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="DD/MM/YYYY"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="points"
                                            label="Điểm tích lũy"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng nhập số điểm",
                                                },
                                                {
                                                    type: "number",
                                                    min: 0,
                                                    message:
                                                        "Điểm không thể âm",
                                                },
                                            ]}
                                        >
                                            <InputNumber
                                                style={{ width: "100%" }}
                                                placeholder="Nhập số điểm"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="totalSpent"
                                            label="Tổng chi tiêu (VND)"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng nhập tổng chi tiêu",
                                                },
                                                {
                                                    type: "number",
                                                    min: 0,
                                                    message:
                                                        "Tổng chi tiêu không thể âm",
                                                },
                                            ]}
                                        >
                                            <InputNumber
                                                style={{ width: "100%" }}
                                                placeholder="Nhập tổng chi tiêu"
                                                formatter={(value) =>
                                                    `${value}`.replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        ","
                                                    )
                                                }
                                                parser={(value) =>
                                                    value.replace(
                                                        /\$\s?|(,*)/g,
                                                        ""
                                                    )
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <div
                                    style={{
                                        textAlign: "center",
                                        margin: "16px 0 8px",
                                    }}
                                >
                                    <Tooltip title="Xem mô phỏng thẻ">
                                        <Button
                                            type="link"
                                            onClick={() =>
                                                setActiveTab("preview")
                                            }
                                            icon={<GiftOutlined />}
                                        >
                                            Xem mô phỏng thẻ
                                        </Button>
                                    </Tooltip>
                                </div>
                            </Form>
                        ),
                    },
                    {
                        key: "preview",
                        label: (
                            <span>
                                <GiftOutlined /> Mô phỏng thẻ
                            </span>
                        ),
                        children: renderCardPreview(),
                    },
                ]}
            />
        </Modal>
    );
}
