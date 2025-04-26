import React, { useState } from "react";
import { Space, Table, Button, Typography, Tag, Row, Col, message, Tooltip, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ShiftForm from "./ShiftForm";

const { Title } = Typography;

// Constants
const SHIFT_TYPE = {
    MORNING: "morning",
    AFTERNOON: "afternoon",
    EVENING: "evening",
    NIGHT: "night",
};

export default function Shifts() {
    // States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [shifts, setShifts] = useState([
        {
            id: "CA001",
            name: "Ca Sáng",
            type: SHIFT_TYPE.MORNING,
            startTime: "07:00",
            endTime: "15:00",
            breakTime: "11:30-12:30",
            workingHours: 8,
            description: "Ca làm việc buổi sáng",
        },
        {
            id: "CA002",
            name: "Ca Chiều",
            type: SHIFT_TYPE.AFTERNOON,
            startTime: "15:00",
            endTime: "23:00",
            breakTime: "18:00-19:00",
            workingHours: 8,
            description: "Ca làm việc buổi chiều",
        },
    ]);

    const columns = [
        {
            title: "Mã ca",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Tên ca",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Loại ca",
            dataIndex: "type",
            key: "type",
            render: (type) => {
                const colors = {
                    [SHIFT_TYPE.MORNING]: "gold",
                    [SHIFT_TYPE.AFTERNOON]: "blue",
                    [SHIFT_TYPE.EVENING]: "purple",
                    [SHIFT_TYPE.NIGHT]: "black",
                };
                const labels = {
                    [SHIFT_TYPE.MORNING]: "Sáng",
                    [SHIFT_TYPE.AFTERNOON]: "Chiều",
                    [SHIFT_TYPE.EVENING]: "Tối",
                    [SHIFT_TYPE.NIGHT]: "Đêm",
                };
                return <Tag color={colors[type]}>{labels[type]}</Tag>;
            },
        },
        {
            title: "Thời gian",
            key: "time",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <span>
                        {record.startTime} - {record.endTime}
                    </span>
                    <small style={{ color: "#888" }}>Nghỉ: {record.breakTime}</small>
                </Space>
            ),
        },
        {
            title: "Số giờ",
            dataIndex: "workingHours",
            key: "workingHours",
            width: 100,
            align: "center",
            render: (hours) => `${hours}h`,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa ca làm việc"
                            description="Bạn có chắc chắn muốn xóa ca làm việc này?"
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handlers
    const handleAdd = () => {
        setSelectedShift(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedShift(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        setShifts(shifts.filter((shift) => shift.id !== record.id));
        message.success("Xóa ca làm việc thành công");
    };

    const handleSubmit = (values) => {
        if (selectedShift) {
            setShifts(shifts.map((shift) => (shift.id === selectedShift.id ? { ...shift, ...values } : shift)));
            message.success("Cập nhật ca làm việc thành công");
        } else {
            const newShift = {
                ...values,
                id: `CA${String(shifts.length + 1).padStart(3, "0")}`,
            };
            setShifts([...shifts, newShift]);
            message.success("Thêm ca làm việc mới thành công");
        }
        setIsModalVisible(false);
    };

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={4} style={{ margin: 0 }}>
                        Danh sách Ca làm việc
                    </Title>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm ca làm việc
                    </Button>
                </Col>
            </Row>

            <Table columns={columns} dataSource={shifts} rowKey="id" bordered />

            <ShiftForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingShift={selectedShift}
                SHIFT_TYPE={SHIFT_TYPE}
            />
        </Space>
    );
}
