import { useState } from "react";
import { Modal, Form, Input, Upload, Button, message, Avatar, Row, Col } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";

const EditProfileModal = ({ visible, onCancel, onSave, initialValues }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(initialValues?.avatar);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            await onSave({ ...values, avatar });
            message.success("Cập nhật thông tin thành công");
        } catch (error) {
            message.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (info) => {
        if (info.file.status === "done") {
            // Giả lập upload thành công
            const url = URL.createObjectURL(info.file.originFileObj);
            setAvatar(url);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa thông tin cá nhân"
            visible={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            width={700}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Lưu thay đổi
                </Button>,
            ]}
        >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Upload
                    name="avatar"
                    showUploadList={false}
                    accept="image/*"
                    beforeUpload={(file) => {
                        const isImage = file.type.startsWith("image/");
                        if (!isImage) {
                            message.error("Chỉ được upload file ảnh!");
                        }
                        return isImage;
                    }}
                    onChange={handleAvatarChange}
                >
                    <Avatar size={128} src={avatar} icon={<UserOutlined />} style={{ cursor: "pointer" }} />
                    <div style={{ marginTop: 8 }}>
                        <Button icon={<CameraOutlined />}>Đổi ảnh đại diện</Button>
                    </div>
                </Upload>
            </div>

            <Form form={form} layout="vertical" initialValues={initialValues}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input placeholder="Nhập email" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: "Vui lòng nhập số điện thoại" },
                                { pattern: /^[0-9]+$/, message: "Số điện thoại không hợp lệ" },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="position" label="Chức vụ" rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}>
                            <Input placeholder="Nhập chức vụ" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Địa chỉ">
                    <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditProfileModal;
