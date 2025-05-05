import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Switch,
    Card,
    Typography,
    Divider,
    Button,
    Space,
    Tag,
    message,
} from "antd";
import {
    PlusOutlined,
    UploadOutlined,
    GiftOutlined,
    DeleteOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { REWARD_STATUS, STATUS_CONFIG, REWARD_ICONS } from "../constants";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function RewardForm({
    open,
    onCancel,
    onSubmit,
    initialData,
    confirmLoading,
}) {
    const [form] = Form.useForm();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState([]);
    const [formValues, setFormValues] = useState(null);

    // Theo dõi thay đổi để cập nhật xem trước
    const handleValuesChange = (changedValues, allValues) => {
        setFormValues({ ...allValues });
    };

    // Reset form khi mở modal
    useEffect(() => {
        if (open) {
            form.resetFields();
            setFormValues(initialData || null);

            // Nếu có dữ liệu ban đầu, đặt giá trị vào form
            if (initialData) {
                form.setFieldsValue({
                    name: initialData.name,
                    points: initialData.points,
                    description: initialData.description,
                    status: initialData.status || REWARD_STATUS.ACTIVE,
                });

                // Nếu có ảnh, thêm vào fileList
                if (initialData.image) {
                    setFileList([
                        {
                            uid: "-1",
                            name: "reward-image.png",
                            status: "done",
                            url: initialData.image,
                        },
                    ]);
                } else {
                    setFileList([]);
                }
            } else {
                setFileList([]);
            }
        }
    }, [open, initialData, form]);

    // Xử lý khi upload ảnh
    const handlePreview = (file) => {
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );

    // Hàm submit form
    const handleFinish = (values) => {
        const formData = { ...values };

        // Thêm file ảnh nếu có
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.image = fileList[0].originFileObj;
        }

        onSubmit(formData);
    };

    // Render mô phỏng phần thưởng
    const renderRewardPreview = () => {
        if (!formValues) return null;

        const status = formValues.status || REWARD_STATUS.ACTIVE;
        const statusConfig = STATUS_CONFIG[status];

        return (
            <div style={{ marginBottom: 20 }}>
                <Title level={4}>Xem trước phần thưởng</Title>
                <Card
                    hoverable
                    style={{
                        width: "100%",
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                    cover={
                        fileList.length > 0 ? (
                            <div
                                style={{
                                    height: 180,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                <img
                                    alt={formValues.name || "Phần thưởng"}
                                    src={
                                        fileList[0].url ||
                                        URL.createObjectURL(
                                            fileList[0].originFileObj
                                        )
                                    }
                                    style={{
                                        maxHeight: "100%",
                                        maxWidth: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    height: 180,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                <GiftOutlined
                                    style={{ fontSize: 64, color: "#d9d9d9" }}
                                />
                            </div>
                        )
                    }
                >
                    <div style={{ position: "relative" }}>
                        <div
                            style={{
                                position: "absolute",
                                top: -25,
                                right: 0,
                            }}
                        >
                            <Tag
                                color={statusConfig.color}
                                icon={statusConfig.icon}
                            >
                                {statusConfig.text}
                            </Tag>
                        </div>
                        <Title level={4} style={{ marginTop: 0 }}>
                            {formValues.name || "Tên phần thưởng"}
                        </Title>
                        <Text type="secondary">
                            {formValues.description ||
                                "Mô tả chi tiết phần thưởng"}
                        </Text>
                        <Divider style={{ margin: "12px 0" }} />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text strong>Điểm cần đổi:</Text>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    color: "#f5222d",
                                }}
                            >
                                {formValues.points || 0}
                            </Text>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <Modal
            title={
                initialData ? "Chỉnh sửa phần thưởng" : "Thêm phần thưởng mới"
            }
            open={open}
            onCancel={onCancel}
            width={800}
            confirmLoading={confirmLoading}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={confirmLoading}
                >
                    {initialData ? "Cập nhật" : "Tạo mới"}
                </Button>,
            ]}
        >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {/* Form bên trái */}
                <div style={{ flex: "1 1 350px" }}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinish}
                        onValuesChange={handleValuesChange}
                        requiredMark="optional"
                    >
                        <Form.Item
                            name="name"
                            label="Tên phần thưởng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên phần thưởng",
                                },
                                {
                                    max: 100,
                                    message:
                                        "Tên không được vượt quá 100 ký tự",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên phần thưởng" />
                        </Form.Item>

                        <Form.Item
                            name="points"
                            label="Số điểm"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập số điểm",
                                },
                            ]}
                        >
                            <InputNumber
                                min={1}
                                placeholder="Nhập số điểm cần đổi"
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
                            />
                        </Form.Item>

                        <Form.Item name="description" label="Mô tả">
                            <TextArea
                                placeholder="Nhập mô tả chi tiết phần thưởng"
                                rows={4}
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            initialValue={REWARD_STATUS.ACTIVE}
                        >
                            <Select>
                                <Option value={REWARD_STATUS.ACTIVE}>
                                    <Space>
                                        {
                                            STATUS_CONFIG[REWARD_STATUS.ACTIVE]
                                                .icon
                                        }
                                        {
                                            STATUS_CONFIG[REWARD_STATUS.ACTIVE]
                                                .text
                                        }
                                    </Space>
                                </Option>
                                <Option value={REWARD_STATUS.INACTIVE}>
                                    <Space>
                                        {
                                            STATUS_CONFIG[
                                                REWARD_STATUS.INACTIVE
                                            ].icon
                                        }
                                        {
                                            STATUS_CONFIG[
                                                REWARD_STATUS.INACTIVE
                                            ].text
                                        }
                                    </Space>
                                </Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Hình ảnh"
                            tooltip="Tải lên hình ảnh minh họa cho phần thưởng"
                        >
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={handlePreview}
                                onChange={handleUploadChange}
                                beforeUpload={() => false}
                                maxCount={1}
                            >
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>
                            <Text type="secondary">
                                * Hình ảnh tối đa 5MB, kích thước khuyến nghị:
                                500x500px
                            </Text>
                        </Form.Item>
                    </Form>
                </div>

                {/* Xem trước bên phải */}
                <div style={{ flex: "1 1 350px" }}>{renderRewardPreview()}</div>
            </div>

            <Modal
                open={previewVisible}
                title="Xem trước hình ảnh"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img
                    alt="Preview"
                    style={{ width: "100%" }}
                    src={previewImage}
                />
            </Modal>
        </Modal>
    );
}
