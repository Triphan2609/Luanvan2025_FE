import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Select,
    Space,
    Typography,
    Button,
    Divider,
    Row,
    Col,
    Card,
    Tag,
    Tooltip,
    Radio,
    Alert,
    Switch,
    Checkbox,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    TeamOutlined,
    HomeOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    SearchOutlined,
    CloseCircleOutlined,
    IdcardOutlined,
    SaveOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const paymentStatuses = [
    { label: "Chưa thanh toán", value: "unpaid" },
    { label: "Đã thanh toán", value: "paid" },
    { label: "Thanh toán một phần", value: "partial" },
];

const bookingSources = [
    { label: "Khách vãng lai", value: "walkIn" },
    { label: "Đặt qua điện thoại", value: "phone" },
    { label: "Đặt từ hệ thống", value: "system" },
];

export default function FrontDeskBookingModal({
    open,
    onCancel,
    onSubmit,
    room,
    booking,
    onOpenCustomerSelect,
    selectedCustomer,
    onClearCustomer,
}) {
    const [form] = Form.useForm();
    const [totalNights, setTotalNights] = useState(1);
    const [totalAmount, setTotalAmount] = useState(0);
    const [customerType, setCustomerType] = useState("registered"); // registered or walkIn
    const [sourceValue, setSourceValue] = useState("walkIn");
    const [saveCustomerInfo, setSaveCustomerInfo] = useState(true); // Mặc định là lưu thông tin

    // Reset form when modal opens
    useEffect(() => {
        if (open && room) {
            // Reset form fields
            form.resetFields();

            // Reset component state
            setCustomerType(selectedCustomer ? "registered" : "walkIn");
            setSaveCustomerInfo(true);
            setSourceValue("walkIn");

            // Set default values
            form.setFieldsValue({
                roomId: room.id,
                branchId: room.branchId,
                dateRange: booking,
                adults: room.capacity > 0 ? room.capacity : 1,
                children: 0,
                paymentStatus: "unpaid",
                source: "walkIn",
                saveCustomer: true,
                // Reset customer fields if no customer is selected
                customerName: selectedCustomer?.name || "",
                customerPhone: selectedCustomer?.phone || "",
                customerIdCard: selectedCustomer?.idNumber || "",
                totalAmount:
                    booking && booking.length === 2 && room.price
                        ? booking[1].diff(booking[0], "day") * room.price
                        : room.price,
            });

            // Calculate nights and total amount
            calculateTotalAmount(booking, room.price);
        }
    }, [open, room, form, booking, selectedCustomer]);

    // Update form when customer is selected
    useEffect(() => {
        if (selectedCustomer) {
            setCustomerType("registered");
            form.setFieldsValue({
                customerId: selectedCustomer.id,
                customerName: selectedCustomer.name,
                customerPhone: selectedCustomer.phone,
                customerIdCard: selectedCustomer.idNumber || "",
            });
        }
    }, [selectedCustomer, form]);

    const calculateTotalAmount = (dates, roomPrice) => {
        if (dates && dates.length === 2 && roomPrice) {
            const nights = dates[1].diff(dates[0], "day");
            setTotalNights(nights);
            setTotalAmount(nights * roomPrice);
            form.setFieldsValue({ totalAmount: nights * roomPrice });
        }
    };

    const handleDateChange = (dates) => {
        if (dates && dates.length === 2 && room) {
            calculateTotalAmount(dates, room.price);
        }
    };

    const handleCustomerTypeChange = (e) => {
        const newType = e.target.value;
        setCustomerType(newType);

        // Nếu chuyển từ khách đã đăng ký sang khách vãng lai
        if (newType === "walkIn") {
            // Xóa thông tin khách hàng đã chọn nếu có
            if (selectedCustomer) {
                onClearCustomer();
            }
            form.setFieldsValue({
                customerId: null,
                source: "walkIn",
                saveCustomer: true,
            });
            setSourceValue("walkIn");
            setSaveCustomerInfo(true);
        }
    };

    const handleSourceChange = (value) => {
        setSourceValue(value);
    };

    const handleSaveCustomerChange = (checked) => {
        setSaveCustomerInfo(checked);
        form.setFieldsValue({ saveCustomer: checked });
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            const [checkInDate, checkOutDate] = values.dateRange;

            const submitData = {
                ...values,
                checkInDate: checkInDate.format("YYYY-MM-DD"),
                checkOutDate: checkOutDate.format("YYYY-MM-DD"),
            };

            // Xử lý thông tin đặt phòng khách vãng lai
            if (customerType === "walkIn") {
                submitData.isWalkInCustomer = true;
                submitData.saveCustomer = values.saveCustomer; // Thêm trường để API biết có lưu thông tin không

                // Nếu không có customerId (khách vãng lai), tạo thông tin đặt phòng tạm thời
                if (!submitData.customerId) {
                    // Giữ nguyên thông tin người dùng đã nhập để lưu vào lịch sử
                    submitData.customerTemp = {
                        name: values.customerName,
                        phone: values.customerPhone,
                        idCard: values.customerIdCard,
                    };
                }
            }

            // Remove helper fields
            delete submitData.dateRange;
            delete submitData.customerName;
            delete submitData.customerPhone;
            delete submitData.customerIdCard;

            onSubmit(submitData);
        });
    };

    const renderCustomerInfo = () => {
        if (customerType === "walkIn") {
            return (
                <div style={{ marginBottom: 16 }}>
                    <Alert
                        message="Thông tin khách vãng lai"
                        description={
                            <div>
                                <p>
                                    Nhập thông tin khách vãng lai đặt phòng.
                                    Thông tin này sẽ được sử dụng để đặt phòng.
                                </p>
                                <div style={{ marginTop: 8 }}>
                                    <Checkbox
                                        checked={saveCustomerInfo}
                                        onChange={(e) =>
                                            handleSaveCustomerChange(
                                                e.target.checked
                                            )
                                        }
                                    >
                                        <Text strong>
                                            Lưu thông tin khách hàng này vào hệ
                                            thống
                                        </Text>
                                    </Checkbox>
                                    <Tooltip title="Nếu bật tùy chọn này, thông tin khách vãng lai sẽ được lưu vào danh sách khách hàng để sử dụng cho lần sau">
                                        <InfoCircleOutlined
                                            style={{ marginLeft: 8 }}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Form.Item name="saveCustomer" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="customerName"
                        label="Tên khách hàng"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên khách hàng",
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nguyễn Văn A"
                        />
                    </Form.Item>

                    <Form.Item
                        name="customerPhone"
                        label="Số điện thoại"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập số điện thoại",
                            },
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="0901234567"
                        />
                    </Form.Item>

                    <Form.Item
                        name="customerIdCard"
                        label="Căn cước công dân"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập CCCD/CMND",
                            },
                        ]}
                    >
                        <Input
                            prefix={<IdcardOutlined />}
                            placeholder="001202123456"
                        />
                    </Form.Item>
                </div>
            );
        }

        if (selectedCustomer) {
            return (
                <Card
                    size="small"
                    title="Thông tin khách hàng"
                    style={{ marginBottom: 16 }}
                    extra={
                        <Button
                            type="text"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={onClearCustomer}
                        />
                    }
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Text strong>Tên khách hàng:</Text>{" "}
                            {selectedCustomer.name}
                        </Col>
                        <Col span={12}>
                            <Text strong>SĐT:</Text> {selectedCustomer.phone}
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                        <Col span={12}>
                            <Text strong>Loại khách hàng:</Text>{" "}
                            <Tag
                                color={
                                    selectedCustomer.type === "vip"
                                        ? "gold"
                                        : "blue"
                                }
                            >
                                {selectedCustomer.type === "vip"
                                    ? "VIP"
                                    : "Thường"}
                            </Tag>
                        </Col>
                        <Col span={12}>
                            <Text strong>Tổng đặt phòng:</Text>{" "}
                            {selectedCustomer.totalBookings || 0}
                        </Col>
                    </Row>
                </Card>
            );
        }

        return (
            <Button
                type="dashed"
                block
                icon={<SearchOutlined />}
                onClick={onOpenCustomerSelect}
                style={{ marginBottom: 16 }}
            >
                Chọn khách hàng
            </Button>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <HomeOutlined />
                    <span>Đặt phòng {room ? `- ${room.roomCode}` : ""}</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={
                customerType === "walkIn" && saveCustomerInfo
                    ? "Đặt phòng & Lưu thông tin"
                    : "Đặt phòng"
            }
            cancelText="Hủy"
            width={700}
            destroyOnClose
        >
            {room && (
                <>
                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>Mã phòng:</Text> {room.roomCode}
                            </Col>
                            <Col span={12}>
                                <Text strong>Loại phòng:</Text>{" "}
                                {room.roomType?.name}
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 8 }}>
                            <Col span={12}>
                                <Text strong>Sức chứa:</Text> {room.capacity}{" "}
                                người
                            </Col>
                            <Col span={12}>
                                <Text strong>Giá phòng:</Text>{" "}
                                <Text type="success">
                                    {room.price?.toLocaleString()}đ/đêm
                                </Text>
                            </Col>
                        </Row>
                    </Card>

                    <Radio.Group
                        value={customerType}
                        onChange={handleCustomerTypeChange}
                        style={{ marginBottom: 16, width: "100%" }}
                        buttonStyle="solid"
                    >
                        <Radio.Button
                            value="walkIn"
                            style={{ width: "50%", textAlign: "center" }}
                        >
                            Khách vãng lai
                        </Radio.Button>
                        <Radio.Button
                            value="registered"
                            style={{ width: "50%", textAlign: "center" }}
                        >
                            Khách đã đăng ký
                        </Radio.Button>
                    </Radio.Group>

                    {renderCustomerInfo()}

                    <Form form={form} layout="vertical">
                        {/* Hidden fields */}
                        <Form.Item name="customerId" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item name="roomId" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item name="branchId" hidden>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="dateRange"
                            label="Thời gian lưu trú"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn thời gian lưu trú",
                                },
                            ]}
                        >
                            <RangePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                placeholder={[
                                    "Ngày check-in",
                                    "Ngày check-out",
                                ]}
                                disabledDate={(current) =>
                                    current && current < dayjs().startOf("day")
                                }
                                onChange={handleDateChange}
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="adults"
                                    label="Số người lớn"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập số người lớn",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        min={1}
                                        max={room?.capacity || 10}
                                        style={{ width: "100%" }}
                                        prefix={<TeamOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="children"
                                    label="Số trẻ em"
                                    initialValue={0}
                                >
                                    <InputNumber
                                        min={0}
                                        max={5}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="source"
                                    label="Nguồn đặt phòng"
                                    initialValue="walkIn"
                                >
                                    <Select
                                        options={bookingSources}
                                        value={sourceValue}
                                        onChange={handleSourceChange}
                                        disabled={customerType === "walkIn"}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="paymentStatus"
                                    label="Trạng thái thanh toán"
                                    initialValue="unpaid"
                                >
                                    <Select options={paymentStatuses} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="totalAmount"
                            label="Tổng tiền"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tổng tiền",
                                },
                            ]}
                        >
                            <InputNumber
                                prefix="₫"
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                            />
                        </Form.Item>

                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary">
                                Lưu trú {totalNights} đêm x{" "}
                                {room?.price?.toLocaleString()}đ ={" "}
                                <Text strong type="success">
                                    {totalAmount.toLocaleString()}đ
                                </Text>
                            </Text>
                        </div>

                        <Form.Item name="note" label="Ghi chú">
                            <TextArea
                                rows={3}
                                maxLength={200}
                                showCount
                                placeholder="Nhập ghi chú đặt phòng nếu có"
                            />
                        </Form.Item>
                    </Form>
                </>
            )}
        </Modal>
    );
}
