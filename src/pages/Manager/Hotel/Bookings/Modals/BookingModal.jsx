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
    Spin,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    TeamOutlined,
    HomeOutlined,
    CalendarOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getRooms } from "../../../../../api/roomsApi";
import { getRoomTypes } from "../../../../../api/roomTypesApi";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function BookingModal({ open, onCancel, onSave, initialData }) {
    const [form] = Form.useForm();
    const [totalNights, setTotalNights] = useState(1);
    const [totalAmount, setTotalAmount] = useState(0);
    const [roomTypes, setRoomTypes] = useState([]);
    const [roomsByType, setRoomsByType] = useState({});
    const [roomPrices, setRoomPrices] = useState({});
    const [loading, setLoading] = useState(false);

    // Lấy dữ liệu loại phòng và phòng khi form mở
    useEffect(() => {
        if (open) {
            fetchRoomData();
        }
    }, [open]);

    // Xử lý khi mở modal chỉnh sửa hoặc thêm mới
    useEffect(() => {
        if (open) {
            if (initialData) {
                form.setFieldsValue({
                    ...initialData,
                    dateRange: [
                        dayjs(initialData.checkIn),
                        dayjs(initialData.checkOut),
                    ],
                    // Tính tổng số người từ adults và children nếu có
                    people:
                        (initialData.adults || 0) + (initialData.children || 0),
                });

                // Tính tổng số đêm và tổng tiền
                const nights = dayjs(initialData.checkOut).diff(
                    dayjs(initialData.checkIn),
                    "day"
                );
                setTotalNights(nights);
                setTotalAmount(initialData.totalAmount || 0);
            } else {
                form.resetFields();
                form.setFieldsValue({
                    people: 1, // Giá trị mặc định cho số người
                    dateRange: [dayjs(), dayjs().add(1, "day")], // Mặc định 1 đêm
                });

                // Khởi tạo giá trị mặc định
                setTotalNights(1);
                setTotalAmount(0);
            }
        }
    }, [open, initialData, form]);

    const fetchRoomData = async () => {
        try {
            setLoading(true);
            // Lấy danh sách loại phòng
            const roomTypesData = await getRoomTypes();
            const roomTypesOptions = roomTypesData.map((type) => ({
                label: type.name,
                value: type.name,
                price: type.basePrice,
            }));
            setRoomTypes(roomTypesOptions);

            // Tạo object giá phòng
            const priceObj = {};
            roomTypesOptions.forEach((type) => {
                priceObj[type.value] = type.price;
            });
            setRoomPrices(priceObj);

            // Lấy danh sách phòng
            const roomsData = await getRooms();

            // Phân loại phòng theo loại
            const roomsGroup = {};
            roomsData.forEach((room) => {
                const typeName = room.roomType?.name;
                if (!roomsGroup[typeName]) {
                    roomsGroup[typeName] = [];
                }
                roomsGroup[typeName].push({
                    label: room.roomCode,
                    value: room.roomCode,
                    id: room.id,
                    price: room.price,
                });
            });
            setRoomsByType(roomsGroup);
        } catch (error) {
            console.error("Error fetching room data:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalAmount = (dates, roomType) => {
        if (dates && dates.length === 2 && roomType) {
            const nights = dates[1].diff(dates[0], "day");
            const price = roomPrices[roomType] || 0;

            setTotalNights(nights);
            setTotalAmount(nights * price);
            form.setFieldsValue({ totalAmount: nights * price });
        }
    };

    const handleDateChange = (dates) => {
        if (dates && dates.length === 2) {
            const roomType = form.getFieldValue("roomType");
            if (roomType) {
                calculateTotalAmount(dates, roomType);
            }
        }
    };

    const handleRoomTypeChange = (roomType) => {
        form.setFieldValue("roomNumber", undefined);

        const dates = form.getFieldValue("dateRange");
        if (dates && dates.length === 2) {
            calculateTotalAmount(dates, roomType);
        }
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            const [checkIn, checkOut] = values.dateRange;
            const submitData = {
                ...values,
                checkIn: checkIn.format("YYYY-MM-DD"),
                checkOut: checkOut.format("YYYY-MM-DD"),
                adults: values.people, // Sử dụng số người làm adults
                children: 0, // Mặc định 0 trẻ em
            };
            delete submitData.dateRange;
            onSave(submitData);
        });
    };

    return (
        <Modal
            title={initialData ? "Chỉnh sửa đặt phòng" : "Thêm đặt phòng mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu"
            cancelText="Hủy"
            width={700}
            destroyOnClose
        >
            {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="customerName"
                        label="Tên khách hàng"
                        rules={[{ required: true }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nguyễn Văn A"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                            { required: true },
                            {
                                pattern: /^[0-9]{10}$/,
                                message: "Số điện thoại không hợp lệ",
                            },
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="0901234567"
                        />
                    </Form.Item>

                    <Space style={{ width: "100%" }}>
                        <Form.Item
                            name="roomType"
                            label="Loại phòng"
                            rules={[{ required: true }]}
                            style={{ width: "200px" }}
                        >
                            <Select
                                options={roomTypes}
                                placeholder="Chọn loại phòng"
                                onChange={handleRoomTypeChange}
                            />
                        </Form.Item>

                        <Form.Item
                            name="roomNumber"
                            label="Số phòng"
                            rules={[{ required: true }]}
                            style={{ width: "200px" }}
                        >
                            <Select
                                placeholder="Chọn số phòng"
                                disabled={!form.getFieldValue("roomType")}
                                options={
                                    form.getFieldValue("roomType") &&
                                    roomsByType[form.getFieldValue("roomType")]
                                        ? roomsByType[
                                              form.getFieldValue("roomType")
                                          ]
                                        : []
                                }
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian lưu trú"
                        rules={[{ required: true }]}
                    >
                        <RangePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            placeholder={["Check-in", "Check-out"]}
                            disabledDate={(current) =>
                                current && current < dayjs().startOf("day")
                            }
                            onChange={handleDateChange}
                        />
                    </Form.Item>

                    <Form.Item
                        name="people"
                        label="Số người"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập số người",
                            },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={10}
                            style={{ width: "100%" }}
                            prefix={<TeamOutlined />}
                            placeholder="Nhập số người"
                        />
                    </Form.Item>

                    <Form.Item
                        name="totalAmount"
                        label="Tổng tiền"
                        rules={[{ required: true }]}
                    >
                        <InputNumber
                            prefix="₫"
                            style={{ width: "100%" }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            min={0}
                            step={100000}
                        />
                    </Form.Item>

                    {form.getFieldValue("roomType") && (
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary">
                                Lưu trú {totalNights} đêm x{" "}
                                {roomPrices[
                                    form.getFieldValue("roomType")
                                ]?.toLocaleString()}
                                đ ={" "}
                                <Text strong type="success">
                                    {totalAmount.toLocaleString()}đ
                                </Text>
                            </Text>
                        </div>
                    )}

                    <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={3} maxLength={200} showCount />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
}
