import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Form,
    Radio,
    Checkbox,
    Select,
    Space,
    Divider,
    Table,
    Typography,
    Input,
    Tooltip,
    Alert,
    Row,
    Col,
} from "antd";
import {
    FileExcelOutlined,
    FileTextOutlined,
    SettingOutlined,
    EyeOutlined,
    DownloadOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { exportToExcel, exportToCSV } from "../utils/exportUtils";
import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_LABELS } from "../constants/employee";

const { Text, Title } = Typography;
const { Option } = Select;

/**
 * Modal xuất dữ liệu với tùy chọn nâng cao
 */
const ExportDataModal = ({
    open,
    onCancel,
    data = [],
    title = "Xuất dữ liệu",
    dataType = "employees",
    fileName = "export",
    departments = [],
    roles = [],
}) => {
    const [form] = Form.useForm();
    const [exportFormat, setExportFormat] = useState("excel");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [customFileName, setCustomFileName] = useState(fileName);
    const [includeHeader, setIncludeHeader] = useState(true);
    const [filters, setFilters] = useState({
        status: undefined,
        department: undefined,
        role: undefined,
    });

    // Định nghĩa các cột cho loại dữ liệu nhân viên
    const employeeColumns = [
        { key: "employee_code", title: "Mã NV", dataIndex: "employee_code" },
        { key: "name", title: "Họ và tên", dataIndex: "name" },
        { key: "email", title: "Email", dataIndex: "email" },
        { key: "phone", title: "Số điện thoại", dataIndex: "phone" },
        {
            key: "department",
            title: "Phòng ban",
            dataIndex: ["department", "name"],
        },
        { key: "role", title: "Chức vụ", dataIndex: ["role", "name"] },
        { key: "join_date", title: "Ngày vào làm", dataIndex: "join_date" },
        { key: "birthday", title: "Ngày sinh", dataIndex: "birthday" },
        { key: "address", title: "Địa chỉ", dataIndex: "address" },
        { key: "status", title: "Trạng thái", dataIndex: "status" },
    ];

    // Lấy các cột phù hợp với loại dữ liệu
    const getColumns = () => {
        switch (dataType) {
            case "employees":
                return employeeColumns;
            default:
                return Object.keys(data[0] || {}).map((key) => ({
                    key,
                    title: key,
                    dataIndex: key,
                }));
        }
    };

    // Lọc dữ liệu theo bộ lọc
    const applyFilters = (sourceData) => {
        if (!sourceData || sourceData.length === 0) return [];

        return sourceData.filter((item) => {
            // Lọc theo trạng thái
            if (filters.status && item.status !== filters.status) {
                return false;
            }

            // Lọc theo phòng ban
            if (
                filters.department &&
                item.department?.id !== filters.department
            ) {
                return false;
            }

            // Lọc theo chức vụ
            if (filters.role && item.role?.id !== filters.role) {
                return false;
            }

            return true;
        });
    };

    // Cập nhật dữ liệu khi thay đổi bộ lọc
    useEffect(() => {
        const filtered = applyFilters(data);
        setFilteredData(filtered);

        // Cập nhật dữ liệu xem trước
        setPreviewData(filtered.slice(0, 5));
    }, [data, filters]);

    // Set các cột mặc định được chọn khi component khởi tạo
    useEffect(() => {
        if (data && data.length > 0) {
            // Kiểm tra dữ liệu đầu vào

            if (data.length > 0) {
                const sampleItem = data[0];
            }

            const columns = getColumns();
            setSelectedColumns(columns.map((col) => col.key));

            // Tạo dữ liệu xem trước từ 5 dòng đầu tiên
            const filtered = applyFilters(data);
            setFilteredData(filtered);
            setPreviewData(filtered.slice(0, 5));
        }
    }, [data]);

    // Xử lý khi thay đổi lựa chọn cột
    const handleColumnsChange = (checkedValues) => {
        setSelectedColumns(checkedValues);
    };

    // Xử lý khi thay đổi bộ lọc
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Xử lý khi submit form
    const handleSubmit = () => {
        form.validateFields().then((values) => {
            // Chuẩn bị tùy chọn xuất
            const exportOptions = {
                type: dataType,
                columns: selectedColumns,
                includeHeader: includeHeader,
            };

            // Chuẩn bị dữ liệu để xuất
            // Lưu ý: Khi xuất dạng employees, sẽ dùng định dạng đặc biệt
            if (dataType === "employees") {
                exportToExcel(filteredData, customFileName, exportOptions);
            } else {
                // Trường hợp dữ liệu thông thường, cần lọc theo cột
                const dataToExport = filteredData.map((item) => {
                    const filtered = {};
                    selectedColumns.forEach((key) => {
                        const column = getColumns().find(
                            (col) => col.key === key
                        );
                        if (column) {
                            // Xử lý trường hợp dataIndex là mảng (đường dẫn lồng nhau)
                            if (Array.isArray(column.dataIndex)) {
                                let value = item;
                                for (const path of column.dataIndex) {
                                    value = value?.[path];
                                    if (value === undefined) break;
                                }
                                filtered[key] = value;
                            } else {
                                filtered[key] = item[column.dataIndex];
                            }
                        }
                    });
                    return filtered;
                });

                // Xuất dữ liệu theo định dạng đã chọn
                if (exportFormat === "excel") {
                    exportToExcel(dataToExport, customFileName, exportOptions);
                } else {
                    exportToCSV(dataToExport, customFileName, exportOptions);
                }
            }

            onCancel();
        });
    };

    // Tạo các checkbox cho việc chọn cột
    const renderColumnCheckboxes = () => {
        const columns = getColumns();
        return (
            <Checkbox.Group
                style={{ width: "100%" }}
                value={selectedColumns}
                onChange={handleColumnsChange}
            >
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {columns.map((column) => (
                        <div
                            key={column.key}
                            style={{ width: "25%", marginBottom: 8 }}
                        >
                            <Checkbox value={column.key}>
                                {column.title}
                            </Checkbox>
                        </div>
                    ))}
                </div>
            </Checkbox.Group>
        );
    };

    // Chuẩn bị các cột để hiển thị xem trước
    const previewColumns = getColumns()
        .filter((col) => selectedColumns.includes(col.key))
        .map((col) => ({
            ...col,
            render: (text, record) => {
                // Xử lý trường hợp cột là phòng ban hoặc chức vụ
                if (col.key === "department") {
                    return record.department?.name || "";
                }

                if (col.key === "role") {
                    return record.role?.name || "";
                }

                // Xử lý trường hợp dataIndex là mảng (đường dẫn lồng nhau)
                if (Array.isArray(col.dataIndex)) {
                    let value = record;
                    for (const path of col.dataIndex) {
                        value = value?.[path];
                        if (value === undefined) break;
                    }
                    return value;
                }

                // Hiển thị trạng thái
                if (col.key === "status" && dataType === "employees") {
                    return EMPLOYEE_STATUS_LABELS[text] || text;
                }

                return text;
            },
        }));

    return (
        <Modal
            title={<div style={{ textAlign: "center" }}>{title}</div>}
            open={open}
            onCancel={onCancel}
            width={900}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleSubmit}
                    disabled={filteredData.length === 0}
                >
                    Xuất dữ liệu ({filteredData.length} bản ghi)
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Alert
                    message="Tùy chỉnh xuất dữ liệu"
                    description="Bạn có thể tùy chỉnh các thông tin xuất và xem trước dữ liệu trước khi xuất."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Định dạng tệp">
                            <Radio.Group
                                value={exportFormat}
                                onChange={(e) =>
                                    setExportFormat(e.target.value)
                                }
                                buttonStyle="solid"
                            >
                                <Radio.Button value="excel">
                                    <FileExcelOutlined /> Excel (.xlsx)
                                </Radio.Button>
                                <Radio.Button value="csv">
                                    <FileTextOutlined /> CSV (.csv)
                                </Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tên tệp xuất">
                            <Input
                                placeholder="Nhập tên tệp"
                                value={customFileName}
                                onChange={(e) =>
                                    setCustomFileName(e.target.value)
                                }
                                suffix={
                                    exportFormat === "excel" ? ".xlsx" : ".csv"
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider>
                    <Space>
                        <FilterOutlined />
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Bộ lọc dữ liệu {showFilters ? "(ẩn)" : "(hiện)"}
                        </span>
                    </Space>
                </Divider>

                {showFilters && (
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        {dataType === "employees" && (
                            <>
                                <Col span={8}>
                                    <Form.Item label="Trạng thái">
                                        <Select
                                            placeholder="Tất cả trạng thái"
                                            value={filters.status}
                                            onChange={(value) =>
                                                handleFilterChange(
                                                    "status",
                                                    value
                                                )
                                            }
                                            allowClear
                                            style={{ width: "100%" }}
                                        >
                                            {Object.entries(
                                                EMPLOYEE_STATUS
                                            ).map(([key, value]) => (
                                                <Option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {
                                                        EMPLOYEE_STATUS_LABELS[
                                                            value
                                                        ]
                                                    }
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item label="Phòng ban">
                                        <Select
                                            placeholder="Tất cả phòng ban"
                                            value={filters.department}
                                            onChange={(value) =>
                                                handleFilterChange(
                                                    "department",
                                                    value
                                                )
                                            }
                                            allowClear
                                            style={{ width: "100%" }}
                                        >
                                            {departments.map((dept) => (
                                                <Option
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item label="Chức vụ">
                                        <Select
                                            placeholder="Tất cả chức vụ"
                                            value={filters.role}
                                            onChange={(value) =>
                                                handleFilterChange(
                                                    "role",
                                                    value
                                                )
                                            }
                                            allowClear
                                            style={{ width: "100%" }}
                                        >
                                            {roles.map((role) => (
                                                <Option
                                                    key={role.id}
                                                    value={role.id}
                                                >
                                                    {role.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Row>
                )}

                <Divider>
                    <Space>
                        <SettingOutlined />
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            Tùy chọn nâng cao {showAdvanced ? "(ẩn)" : "(hiện)"}
                        </span>
                    </Space>
                </Divider>

                {showAdvanced && (
                    <>
                        <Form.Item label="Các cột cần xuất">
                            <div style={{ marginBottom: 8 }}>
                                <Space>
                                    <Button
                                        size="small"
                                        onClick={() =>
                                            setSelectedColumns(
                                                getColumns().map(
                                                    (col) => col.key
                                                )
                                            )
                                        }
                                    >
                                        Chọn tất cả
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedColumns([])}
                                    >
                                        Bỏ chọn tất cả
                                    </Button>
                                </Space>
                            </div>
                            {renderColumnCheckboxes()}
                        </Form.Item>

                        <Form.Item label="Tùy chọn khác">
                            <Checkbox
                                checked={includeHeader}
                                onChange={(e) =>
                                    setIncludeHeader(e.target.checked)
                                }
                            >
                                Bao gồm tiêu đề cột
                            </Checkbox>
                        </Form.Item>
                    </>
                )}

                <Divider>
                    <Space>
                        <EyeOutlined />
                        <span>Xem trước dữ liệu</span>
                    </Space>
                </Divider>

                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                        Hiển thị {Math.min(5, filteredData.length)} bản ghi đầu
                        tiên trong tổng số {filteredData.length} bản ghi đã lọc
                        {filteredData.length !== data.length &&
                            ` (từ ${data.length} bản ghi ban đầu)`}
                    </Text>
                </div>

                {filteredData.length === 0 ? (
                    <Alert
                        type="warning"
                        message="Không có dữ liệu"
                        description="Không có dữ liệu nào thỏa mãn điều kiện lọc. Vui lòng thay đổi bộ lọc."
                        showIcon
                    />
                ) : (
                    <Table
                        columns={previewColumns}
                        dataSource={previewData}
                        rowKey={(record, index) => index}
                        size="small"
                        pagination={false}
                        scroll={{ x: "max-content" }}
                    />
                )}
            </Form>
        </Modal>
    );
};

export default ExportDataModal;
