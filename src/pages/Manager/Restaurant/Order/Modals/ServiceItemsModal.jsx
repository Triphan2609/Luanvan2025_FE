import React, { useState, useEffect } from "react";
import {
    Modal,
    List,
    Card,
    Input,
    Row,
    Col,
    Button,
    Tag,
    Select,
    message,
    Tabs,
    Badge,
    Divider,
    Spin,
} from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import { getServices, getServiceTypes } from "../../../../../api/servicesApi";

const { TabPane } = Tabs;
const { Search } = Input;

const ServiceItemsModal = ({
    visible,
    onClose,
    onAddToCart,
    selectedBranchId,
}) => {
    const [services, setServices] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState("all");
    const [selectedServices, setSelectedServices] = useState([]);

    useEffect(() => {
        if (visible && selectedBranchId) {
            fetchServicesAndTypes();
        }
    }, [visible, selectedBranchId]);

    const fetchServicesAndTypes = async () => {
        setLoading(true);
        try {
            const [servicesData, typesData] = await Promise.all([
                getServices(selectedBranchId),
                getServiceTypes(selectedBranchId),
            ]);

            // Chuẩn hóa serviceTypeId về string, gán lại nếu thiếu
            const activeServices = servicesData
                .filter(
                    (service) =>
                        service.status === "active" || service.isActive === true
                )
                .map((service) => {
                    let serviceTypeId = service.serviceTypeId;
                    if (
                        !serviceTypeId &&
                        service.serviceType &&
                        service.serviceType.id
                    ) {
                        serviceTypeId = service.serviceType.id;
                    }
                    return {
                        ...service,
                        id: String(service.id),
                        serviceTypeId: serviceTypeId
                            ? String(serviceTypeId)
                            : undefined,
                    };
                })
                // Loại bỏ dịch vụ không có loại
                .filter((service) => !!service.serviceTypeId);

            // Chuẩn hóa id của loại dịch vụ về string
            const normalizedTypes = (typesData || []).map((type) => ({
                ...type,
                id: String(type.id),
            }));

            setServices(activeServices);
            setServiceTypes(normalizedTypes);
        } catch (error) {
            console.error("Error fetching services:", error);
            message.error("Không thể tải danh sách dịch vụ!");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleSelectService = (service) => {
        setSelectedServices((prev) => {
            const existing = prev.find((s) => s.id === service.id);
            if (existing) {
                return prev.map((s) =>
                    s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
                );
            }
            return [...prev, { ...service, quantity: 1 }];
        });
    };

    const handleRemoveService = (serviceId) => {
        setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
    };

    const handleQuantityChange = (serviceId, newQuantity) => {
        if (newQuantity < 1) return;
        setSelectedServices((prev) =>
            prev.map((s) =>
                s.id === serviceId ? { ...s, quantity: newQuantity } : s
            )
        );
    };

    const handleConfirm = () => {
        if (selectedServices.length === 0) {
            message.warning("Vui lòng chọn ít nhất một dịch vụ!");
            return;
        }
        const servicesWithStatus = selectedServices.map((service) => {
            const serviceTypeObj =
                service.serviceType ||
                serviceTypes.find((t) => t.id === service.serviceTypeId);
            const typeName = serviceTypeObj?.name?.toLowerCase() || "";
            console.log(
                "service:",
                service.name,
                "typeName:",
                typeName,
                "serviceTypeObj:",
                serviceTypeObj
            );
            const requiresKitchen = isServiceRequiresKitchen({
                ...service,
                serviceType: serviceTypeObj,
            });
            return {
                ...service,
                status: requiresKitchen ? "new" : "served",
            };
        });
        console.log("servicesWithStatus:", servicesWithStatus);
        onAddToCart(servicesWithStatus);
        setSelectedServices([]);
        onClose();
    };

    const getStockStatus = (stock) => {
        if (stock <= 0) return { color: "red", text: "Hết hàng" };
        if (stock <= 5) return { color: "orange", text: "Sắp hết" };
        return { color: "green", text: "Còn hàng" };
    };

    const filteredServices = services.filter((service) => {
        const matchesSearch = service.name
            .toLowerCase()
            .includes(searchText.toLowerCase());
        const matchesType =
            selectedType === "all" || service.serviceTypeId === selectedType;
        return matchesSearch && matchesType;
    });

    // Thêm hàm kiểm tra dịch vụ có cần gửi bếp không
    const isServiceRequiresKitchen = (service) => {
        const typeObj =
            service.serviceType ||
            serviceTypes.find((t) => t.id === service.serviceTypeId);
        const typeName = typeObj?.name?.toLowerCase() || "";
        if (typeName.trim() === "đồ dùng kèm") {
            console.log("==> Đồ dùng kèm: trả về FALSE (Dùng ngay)", {
                typeName,
                service,
            });
            return false;
        }
        if (typeName.trim() === "đồ ăn kèm") {
            console.log("==> Đồ ăn kèm: trả về TRUE (Cần gửi bếp)", {
                typeName,
                service,
            });
            return true;
        }
        // Các từ khóa KHÔNG cần gửi bếp trước
        const notKitchenKeywords = [
            "đồ dùng bàn",
            "khăn",
            "dụng cụ ăn",
            "đũa",
            "chén",
            "ly",
            "cốc",
            "bát",
            "muỗng",
            "thìa",
            "tăm",
            "khay",
            "khay đựng",
            "giấy",
            "giấy ăn",
            "khay giấy",
            "bình nước",
            "bình giữ nhiệt",
            "bình trà",
            "ấm trà",
            "ấm nước",
            "khăn giấy",
            "khăn ướt",
            "khăn lạnh",
        ];
        for (const kw of notKitchenKeywords) {
            if (typeName.includes(kw)) {
                console.log(
                    `==> Từ khóa '${kw}' KHÔNG cần gửi bếp: trả về FALSE (Dùng ngay)`,
                    { typeName, service }
                );
                return false;
            }
        }
        // Các từ khóa CẦN gửi bếp
        const kitchenKeywords = [
            "đồ ăn kèm",
            "món thêm",
            "thức ăn",
            "món ăn",
            "món chính",
            "món phụ",
            "thức uống pha chế",
            "đồ uống pha chế",
            "nước ép",
            "nước uống",
            "đồ ăn",
            "thức uống",
            "món gọi thêm",
            "gọi thêm",
            "phục vụ bếp",
            "bếp",
        ];
        for (const kw of kitchenKeywords) {
            if (typeName.includes(kw)) {
                console.log(
                    `==> Từ khóa '${kw}' CẦN gửi bếp: trả về TRUE (Cần gửi bếp)`,
                    { typeName, service }
                );
                return true;
            }
        }
        if (typeName.includes("dịch vụ") || typeName.includes("tiện ích")) {
            console.log(
                "==> Có từ 'dịch vụ' hoặc 'tiện ích': trả về FALSE (Dùng ngay)",
                { typeName, service }
            );
            return false;
        }
        console.log("==> Không xác định, trả về TRUE (Cần gửi bếp)", {
            typeName,
            service,
        });
        return true;
    };

    return (
        <Modal
            title="Chọn dịch vụ"
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    onClick={handleConfirm}
                    disabled={selectedServices.length === 0}
                >
                    Xác nhận
                </Button>,
            ]}
        >
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm kiếm dịch vụ..."
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: "100%" }}
                />
            </div>

            <div style={{ display: "flex", gap: 16 }}>
                {/* Danh sách dịch vụ */}
                <div style={{ flex: 1 }}>
                    <h3>Danh sách dịch vụ</h3>
                    <Spin spinning={loading}>
                        <List
                            dataSource={filteredServices}
                            renderItem={(service) => {
                                const stockStatus = getStockStatus(
                                    service.stock
                                );
                                const requiresKitchen =
                                    isServiceRequiresKitchen(service);
                                return (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="primary"
                                                onClick={() =>
                                                    handleSelectService(service)
                                                }
                                                disabled={service.stock <= 0}
                                            >
                                                Chọn
                                            </Button>,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <span>{service.name}</span>
                                                    <Tag
                                                        color={
                                                            requiresKitchen
                                                                ? "blue"
                                                                : "green"
                                                        }
                                                    >
                                                        {requiresKitchen
                                                            ? "Cần gửi bếp"
                                                            : "Dùng ngay"}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div>
                                                        Giá:{" "}
                                                        {service.price.toLocaleString()}
                                                        đ
                                                    </div>
                                                    <div
                                                        style={{ marginTop: 4 }}
                                                    >
                                                        <Tag
                                                            color={
                                                                stockStatus.color
                                                            }
                                                        >
                                                            {stockStatus.text}
                                                        </Tag>
                                                        {service.stock > 0 && (
                                                            <span
                                                                style={{
                                                                    marginLeft: 8,
                                                                }}
                                                            >
                                                                Còn lại:{" "}
                                                                {service.stock}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </Spin>
                </div>

                {/* Dịch vụ đã chọn */}
                <div style={{ flex: 1 }}>
                    <h3>Dịch vụ đã chọn</h3>
                    <List
                        dataSource={selectedServices}
                        renderItem={(service) => {
                            const requiresKitchen =
                                isServiceRequiresKitchen(service);
                            return (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="link"
                                            danger
                                            onClick={() =>
                                                handleRemoveService(service.id)
                                            }
                                        >
                                            Xóa
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <span>{service.name}</span>
                                                <Tag
                                                    color={
                                                        requiresKitchen
                                                            ? "blue"
                                                            : "green"
                                                    }
                                                >
                                                    {requiresKitchen
                                                        ? "Cần gửi bếp"
                                                        : "Dùng ngay"}
                                                </Tag>
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div>
                                                    Giá:{" "}
                                                    {service.price.toLocaleString()}
                                                    đ
                                                </div>
                                                <div style={{ marginTop: 8 }}>
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                service.id,
                                                                service.quantity -
                                                                    1
                                                            )
                                                        }
                                                    >
                                                        -
                                                    </Button>
                                                    <span
                                                        style={{
                                                            margin: "0 8px",
                                                        }}
                                                    >
                                                        {service.quantity}
                                                    </span>
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                service.id,
                                                                service.quantity +
                                                                    1
                                                            )
                                                        }
                                                        disabled={
                                                            service.quantity >=
                                                            service.stock
                                                        }
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ServiceItemsModal;
