import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    InputNumber,
    Switch,
    Upload,
    Button,
    message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { menuApi } from "../../../../../api/menuApi";
import { getBranches } from "../../../../../api/branchesApi";
import { uploadPromotionImage } from "../../../../../api/promotionApi";

const { RangePicker } = DatePicker;

const PROMOTION_TYPES = [
    { label: "Theo món", value: "ITEM" },
    { label: "Theo hóa đơn", value: "BILL" },
    { label: "Combo", value: "COMBO" },
    { label: "Khung giờ vàng", value: "TIME" },
];

const VALUE_TYPES = [
    { label: "Phần trăm (%)", value: "PERCENT" },
    { label: "Số tiền (VNĐ)", value: "AMOUNT" },
];

export default function PromotionModal({
    open,
    onClose,
    onSubmit,
    initialValues,
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [menus, setMenus] = useState([]);
    const [combos, setCombos] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedType, setSelectedType] = useState("ITEM");

    useEffect(() => {
        if (open) {
            fetchBranches();
            fetchMenus();
            fetchCombos();
            fetchItems();
            if (!initialValues) {
                setSelectedType("ITEM");
                form.setFieldsValue({ type: "ITEM" });
            } else {
                setSelectedType(initialValues.type || "ITEM");
            }
        }
    }, [open]);

    const fetchBranches = async () => {
        try {
            const res = await getBranches();
            setBranches(res.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách chi nhánh");
        }
    };

    const fetchMenus = async () => {
        try {
            const res = await menuApi.getMenus();
            setMenus(res.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách menu");
        }
    };

    const fetchCombos = async () => {
        try {
            const res = await menuApi.getCombos();
            setCombos(res.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách combo");
        }
    };

    const fetchItems = async () => {
        try {
            const res = await menuApi.getItems();
            setItems(res.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách món ăn");
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const data = {
                ...values,
                startDate: values.dateRange[0].toISOString(),
                endDate: values.dateRange[1].toISOString(),
            };
            delete data.dateRange;
            await onSubmit(data);
            form.resetFields();
            onClose();
        } catch (error) {
            message.error("Lỗi khi lưu khuyến mãi");
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        form.setFieldsValue({
            value: undefined,
            valueType: undefined,
            minOrderValue: undefined,
            menus: undefined,
            combos: undefined,
            items: undefined,
            timeRange: undefined,
        });
    };

    return (
        <Modal
            title={
                initialValues ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi mới"
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={
                    initialValues
                        ? {
                              ...initialValues,
                              dateRange: [
                                  dayjs(initialValues.startDate),
                                  dayjs(initialValues.endDate),
                              ],
                          }
                        : undefined
                }
            >
                <Form.Item
                    name="name"
                    label="Tên khuyến mãi"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên khuyến mãi",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Loại khuyến mãi"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn loại khuyến mãi",
                        },
                    ]}
                >
                    <Select
                        options={PROMOTION_TYPES}
                        onChange={handleTypeChange}
                    />
                </Form.Item>

                {selectedType === "COMBO" && (
                    <>
                        <Form.Item
                            name="combos"
                            label="Chọn combo"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn combo",
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                options={
                                    combos?.map((c) => ({
                                        label: c.name,
                                        value: c.id,
                                    })) || []
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            name="valueType"
                            label="Kiểu giá trị"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn kiểu giá trị",
                                },
                            ]}
                        >
                            <Select options={VALUE_TYPES} />
                        </Form.Item>
                        <Form.Item
                            name="value"
                            label="Giá trị khuyến mãi"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá trị khuyến mãi",
                                },
                            ]}
                        >
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </>
                )}

                {selectedType === "ITEM" && (
                    <>
                        <Form.Item
                            name="items"
                            label="Chọn món ăn"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn món ăn",
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                options={
                                    items?.map((i) => ({
                                        label: i.name,
                                        value: i.id,
                                    })) || []
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            name="valueType"
                            label="Kiểu giá trị"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn kiểu giá trị",
                                },
                            ]}
                        >
                            <Select options={VALUE_TYPES} />
                        </Form.Item>
                        <Form.Item
                            name="value"
                            label="Giá trị khuyến mãi"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá trị khuyến mãi",
                                },
                            ]}
                        >
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </>
                )}

                {selectedType === "BILL" && (
                    <>
                        <Form.Item
                            name="minOrderValue"
                            label="Giá trị hóa đơn tối thiểu"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá trị tối thiểu",
                                },
                            ]}
                        >
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="valueType"
                            label="Kiểu giá trị"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn kiểu giá trị",
                                },
                            ]}
                        >
                            <Select options={VALUE_TYPES} />
                        </Form.Item>
                        <Form.Item
                            name="value"
                            label="Giá trị khuyến mãi"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá trị khuyến mãi",
                                },
                            ]}
                        >
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </>
                )}

                {selectedType === "TIME" && (
                    <>
                        <Form.Item
                            name="timeRange"
                            label="Khung giờ vàng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn khung giờ",
                                },
                            ]}
                        >
                            <RangePicker format="HH:mm" />
                        </Form.Item>
                    </>
                )}

                <Form.Item
                    name="dateRange"
                    label="Thời gian áp dụng"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn thời gian áp dụng",
                        },
                    ]}
                >
                    <RangePicker />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Không hoạt động"
                    />
                </Form.Item>

                <Form.Item name="branch" label="Chi nhánh">
                    <Select
                        options={
                            branches?.map((b) => ({
                                label: b.name,
                                value: b.id,
                            })) || []
                        }
                    />
                </Form.Item>

                <Form.Item name="image" label="Ảnh banner">
                    <Upload
                        beforeUpload={async (file) => {
                            try {
                                const res = await uploadPromotionImage(file);
                                form.setFieldsValue({ imageUrl: res.url });
                                return false;
                            } catch (error) {
                                message.error("Lỗi khi tải lên ảnh");
                                return false;
                            }
                        }}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        {initialValues ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
