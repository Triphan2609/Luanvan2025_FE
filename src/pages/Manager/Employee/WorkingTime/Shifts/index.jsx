import React, { useState, useEffect } from "react";
import {
    Space,
    Table,
    Button,
    Typography,
    Tag,
    Row,
    Col,
    message,
    Tooltip,
    Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ShiftForm from "./ShiftForm";
import {
    getShifts,
    createShift,
    updateShift,
    deleteShift,
} from "../../../../../api/shiftsApi";

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
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch shifts on component mount
    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const data = await getShifts({ isActive: true });

            // Chuyển đổi dữ liệu từ backend sang định dạng frontend
            const formattedShifts = data.map((shift) => ({
                id: shift.id,
                shift_code: shift.shift_code,
                name: shift.name,
                type: shift.type,
                startTime: shift.start_time,
                endTime: shift.end_time,
                breakTime: shift.break_time || "",
                workingHours: shift.working_hours,
                description: shift.description || "",
                is_active: shift.is_active,
            }));

            setShifts(formattedShifts);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu ca làm việc:", error);
            message.error("Không thể tải danh sách ca làm việc");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã ca",
            dataIndex: "shift_code",
            key: "shift_code",
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
                    <small style={{ color: "#888" }}>
                        Nghỉ: {record.breakTime}
                    </small>
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
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa ca làm việc"
                            description="Bạn có chắc chắn muốn xóa ca làm việc này?"
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
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

    const handleDelete = async (record) => {
        try {
            await deleteShift(record.id);
            setShifts(shifts.filter((shift) => shift.id !== record.id));
            message.success("Xóa ca làm việc thành công");
        } catch (error) {
            console.error("Error deleting shift:", error);
            message.error("Không thể xóa ca làm việc");
        }
    };

    const handleSubmit = async (values) => {
        try {
            // Chuyển đổi dữ liệu từ định dạng frontend sang backend
            const shiftData = {
                name: values.name,
                type: values.type,
                start_time: values.startTime,
                end_time: values.endTime,
                break_time: values.breakTime,
                working_hours: values.workingHours,
                description: values.description,
                is_active: true,
            };

            if (selectedShift) {
                // Cập nhật ca làm việc
                await updateShift(selectedShift.id, shiftData);
                message.success("Cập nhật ca làm việc thành công");
            } else {
                // Tạo ca làm việc mới
                await createShift(shiftData);
                message.success("Thêm ca làm việc mới thành công");
            }

            // Tải lại danh sách ca làm việc
            fetchShifts();
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error saving shift:", error);
            message.error(
                selectedShift
                    ? "Không thể cập nhật ca làm việc"
                    : "Không thể tạo ca làm việc mới"
            );
        }
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
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Thêm ca làm việc
                    </Button>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={shifts}
                rowKey="id"
                bordered
                loading={loading}
            />

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
