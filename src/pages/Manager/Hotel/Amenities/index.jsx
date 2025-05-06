import React, { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    message,
    Typography,
    Tooltip,
    Tag,
    Input,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    getAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
} from "../../../../api/amenitiesApi";
import AddEditAmenityModal from "./AddEditAmenityModal";

const { Title } = Typography;
const { confirm } = Modal;

export default function AmenitiesManagement() {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const data = await getAmenities();
            setAmenities(data);
        } catch (error) {
            console.error("Error fetching amenities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (values) => {
        try {
            setLoading(true);
            await createAmenity(values);
            message.success("Thêm tiện nghi thành công");
            fetchAmenities();
        } catch (error) {
            console.error("Error adding amenity:", error);
            message.error("Không thể thêm tiện nghi");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (values) => {
        try {
            setLoading(true);
            await updateAmenity(editingAmenity.id, values);
            message.success("Cập nhật tiện nghi thành công");
            fetchAmenities();
        } catch (error) {
            console.error("Error editing amenity:", error);
            message.error("Không thể cập nhật tiện nghi");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (amenity) => {
        confirm({
            title: "Xác nhận xóa tiện nghi",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa tiện nghi "${amenity.name}" không?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    setLoading(true);
                    await deleteAmenity(amenity.id);
                    message.success("Xóa tiện nghi thành công");
                    fetchAmenities();
                } catch (error) {
                    console.error("Error deleting amenity:", error);
                    message.error("Không thể xóa tiện nghi");
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const filteredAmenities = amenities.filter(
        (amenity) =>
            amenity.name.toLowerCase().includes(searchText.toLowerCase()) ||
            amenity.value.toLowerCase().includes(searchText.toLowerCase()) ||
            (amenity.description &&
                amenity.description
                    .toLowerCase()
                    .includes(searchText.toLowerCase()))
    );

    const columns = [
        {
            title: "Tên hiển thị",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Giá trị",
            dataIndex: "value",
            key: "value",
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingAmenity(record);
                                setIsModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <Space size="middle">
                    <Title level={4} style={{ margin: 0 }}>
                        Quản lý tiện nghi phòng
                    </Title>
                </Space>
            }
            extra={
                <Space>
                    <Input
                        placeholder="Tìm kiếm tiện nghi..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditingAmenity(null);
                            setIsModalVisible(true);
                        }}
                        icon={<PlusOutlined />}
                    >
                        Thêm tiện nghi
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={fetchAmenities}>
                        Làm mới
                    </Button>
                </Space>
            }
        >
            <Table
                dataSource={filteredAmenities}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                }}
            />

            <AddEditAmenityModal
                open={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setEditingAmenity(null);
                }}
                onSubmit={editingAmenity ? handleEdit : handleAdd}
                initialData={editingAmenity}
            />
        </Card>
    );
}
