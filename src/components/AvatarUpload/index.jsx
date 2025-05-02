import React, { useState, useEffect } from "react";
import {
    Upload,
    message,
    Modal,
    Slider,
    Button,
    Space,
    Image,
    Tooltip,
} from "antd";
import {
    LoadingOutlined,
    PlusOutlined,
    EyeOutlined,
    ScissorOutlined,
} from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { uploadBase64Avatar } from "../../api/employeesApi";

const AvatarUpload = ({ value, onChange, shape = "circle" }) => {
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [cropModalVisible, setCropModalVisible] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [tempImageUrl, setTempImageUrl] = useState(""); // Lưu ảnh tạm trước khi upload
    const [quality, setQuality] = useState(80);

    // Đồng bộ giá trị từ prop khi có thay đổi
    useEffect(() => {
        if (value) {
            console.log("AvatarUpload - value changed:", value);
            setImageUrl(value);
        }
    }, [value]);

    // Xử lý tải file lên
    const handleChange = async (info) => {
        console.log("AvatarUpload - handle change:", info.file.status);

        if (info.file.status === "uploading") {
            setLoading(true);
            return;
        }

        if (info.file.status === "error") {
            setLoading(false);
            message.error(`${info.file.name} tải lên thất bại.`);
        }
    };

    // Chuyển đổi file thành base64
    const getBase64 = (file, callback) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => callback(reader.result));
        reader.readAsDataURL(file);
    };

    // Sau khi crop ảnh
    const handleCrop = async () => {
        try {
            setLoading(true);

            if (!tempImageUrl) {
                throw new Error("Không có dữ liệu ảnh");
            }

            console.log(
                "AvatarUpload - uploading image with quality:",
                quality
            );

            // Nén ảnh và tải lên server
            const result = await uploadBase64Avatar(tempImageUrl, {
                quality: quality / 100,
                maxWidth: 1000,
                maxHeight: 1000,
            });

            console.log("AvatarUpload - upload result:", result);

            // Cập nhật giá trị
            setImageUrl(result.url);
            if (onChange) {
                console.log(
                    "AvatarUpload - calling onChange with:",
                    result.url
                );
                onChange(result.url);
            }

            // Đóng modal
            setCropModalVisible(false);
            message.success("Tải ảnh lên thành công!");
        } catch (error) {
            console.error("AvatarUpload - upload error:", error);
            message.error("Tải ảnh lên thất bại. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Chức năng xem trước
    const handlePreview = () => {
        setPreviewVisible(true);
    };

    // Hiển thị thông tin về ảnh
    const showImageInfo = () => {
        const imageToShow = cropModalVisible ? tempImageUrl : imageUrl;

        if (!imageToShow) return null;

        // Nếu ảnh đã được tải lên server (có url http://...)
        if (imageToShow.startsWith("http")) {
            return (
                <div style={{ marginTop: 8 }}>
                    <Tooltip title="Xem ảnh">
                        <Button
                            type="text"
                            onClick={handlePreview}
                            icon={<EyeOutlined />}
                        >
                            Xem ảnh
                        </Button>
                    </Tooltip>
                </div>
            );
        }

        // Nếu ảnh là base64
        if (imageToShow.startsWith("data:image")) {
            const base64Size = Math.round((imageToShow.length * 3) / 4 / 1024);
            return (
                <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: "12px", marginBottom: 4 }}>
                        Kích thước: {base64Size} KB
                    </div>
                    <Tooltip title="Xem ảnh">
                        <Button
                            type="text"
                            onClick={handlePreview}
                            icon={<EyeOutlined />}
                        >
                            Xem ảnh
                        </Button>
                    </Tooltip>
                </div>
            );
        }

        return null;
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    beforeUpload={(file) => {
                        // Kiểm tra loại file
                        const isImage = file.type.startsWith("image/");
                        if (!isImage) {
                            message.error("Vui lòng tải lên file hình ảnh!");
                            return Upload.LIST_IGNORE;
                        }

                        // Kiểm tra kích thước file
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                            message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
                            return Upload.LIST_IGNORE;
                        }

                        // Xem trước ảnh trước khi upload
                        getBase64(file, (base64Data) => {
                            setTempImageUrl(base64Data);
                            setCropModalVisible(true);
                        });

                        return false; // Ngăn tải lên tự động, chúng ta sẽ tự xử lý
                    }}
                    onChange={handleChange}
                >
                    {imageUrl ? (
                        <div
                            style={{
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt="avatar"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: "rgba(0,0,0,0.45)",
                                    padding: "4px",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Tooltip title="Thay đổi ảnh">
                                    <PlusOutlined
                                        style={{
                                            color: "white",
                                            fontSize: "16px",
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ) : (
                        uploadButton
                    )}
                </Upload>

                {showImageInfo()}
            </div>

            {/* Modal xem trước */}
            <Modal
                open={previewVisible}
                title="Xem ảnh avatar"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                centered
                width={600}
            >
                <div style={{ textAlign: "center" }}>
                    <Image
                        alt="Preview"
                        src={tempImageUrl || imageUrl}
                        style={{ maxWidth: "100%", maxHeight: "500px" }}
                        preview={false}
                    />
                </div>
            </Modal>

            {/* Modal tùy chỉnh ảnh */}
            <Modal
                open={cropModalVisible}
                title="Tùy chỉnh ảnh avatar"
                onCancel={() => setCropModalVisible(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setCropModalVisible(false)}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="preview"
                        onClick={handlePreview}
                        icon={<EyeOutlined />}
                    >
                        Xem ảnh
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleCrop}
                    >
                        Tải lên
                    </Button>,
                ]}
                width={700}
                centered
                destroyOnClose
            >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <Image
                        src={tempImageUrl}
                        alt="Crop preview"
                        style={{ maxWidth: "100%", maxHeight: "350px" }}
                        preview={false}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <div>
                            <strong>Chất lượng ảnh:</strong> {quality}%
                        </div>
                        <Slider
                            min={10}
                            max={100}
                            value={quality}
                            onChange={setQuality}
                            marks={{
                                10: "10%",
                                50: "50%",
                                100: "100%",
                            }}
                        />
                        <div style={{ color: "gray", fontSize: "12px" }}>
                            Chất lượng thấp hơn sẽ giúp giảm kích thước ảnh và
                            tăng tốc tải lên
                        </div>
                    </Space>
                </div>
            </Modal>
        </>
    );
};

export default AvatarUpload;
