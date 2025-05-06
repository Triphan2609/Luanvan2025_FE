import React, { useState } from "react";
import {
    Modal,
    Upload,
    Button,
    message,
    Typography,
    Space,
    Alert,
    Divider,
    Table,
    Spin,
    Tabs,
} from "antd";
import {
    UploadOutlined,
    DownloadOutlined,
    InboxOutlined,
    FileExcelOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Text, Title } = Typography;
const { Dragger } = Upload;

const CustomerImportModal = ({ open, onCancel, onImport, branches = [] }) => {
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [validationResults, setValidationResults] = useState({
        valid: true,
        errors: [],
        warnings: [],
    });

    const validateData = (data) => {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
        };

        // Kiểm tra mảng dữ liệu
        if (!Array.isArray(data) || data.length === 0) {
            result.valid = false;
            result.errors.push("Không có dữ liệu trong file");
            return result;
        }

        // Kiểm tra từng dòng dữ liệu
        data.forEach((item, index) => {
            const rowErrors = [];
            const rowWarnings = [];
            const rowNum = index + 2; // +2 vì Excel bắt đầu từ 1 và có header

            // Kiểm tra các trường bắt buộc
            if (!item["Họ và tên"]) rowErrors.push("Thiếu họ tên");
            if (!item["Số điện thoại"]) rowErrors.push("Thiếu số điện thoại");
            if (!item["CCCD/Passport"]) rowErrors.push("Thiếu CCCD/Passport");
            if (!item["Loại khách hàng"])
                rowErrors.push("Thiếu loại khách hàng");

            // Kiểm tra giá trị của các trường enum
            if (
                item["Loại khách hàng"] &&
                !["normal", "vip"].includes(item["Loại khách hàng"])
            ) {
                rowErrors.push(
                    `Loại khách hàng '${item["Loại khách hàng"]}' không hợp lệ (phải là 'normal' hoặc 'vip')`
                );
            }

            if (
                item["Giới tính"] &&
                !["male", "female", "other"].includes(item["Giới tính"])
            ) {
                rowErrors.push(
                    `Giới tính '${item["Giới tính"]}' không hợp lệ (phải là 'male', 'female' hoặc 'other')`
                );
            }

            // Kiểm tra định dạng số điện thoại
            if (item["Số điện thoại"] && !/^\d+$/.test(item["Số điện thoại"])) {
                rowWarnings.push(
                    `Số điện thoại '${item["Số điện thoại"]}' không đúng định dạng`
                );
            }

            // Kiểm tra định dạng ngày sinh
            if (
                item["Ngày sinh (YYYY-MM-DD)"] &&
                !/^\d{4}-\d{2}-\d{2}$/.test(item["Ngày sinh (YYYY-MM-DD)"])
            ) {
                rowWarnings.push(
                    `Ngày sinh '${
                        item["Ngày sinh (YYYY-MM-DD)"] || ""
                    }' không đúng định dạng YYYY-MM-DD`
                );
            }

            // Kiểm tra định dạng email
            if (
                item["Email"] &&
                !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                    item["Email"]
                )
            ) {
                rowWarnings.push(
                    `Email '${item["Email"]}' không đúng định dạng`
                );
            }

            // Thêm kết quả kiểm tra vào danh sách
            if (rowErrors.length > 0) {
                result.valid = false;
                result.errors.push({
                    row: rowNum,
                    name: item["Họ và tên"] || `Dòng ${rowNum}`,
                    errors: rowErrors,
                });
            }

            if (rowWarnings.length > 0) {
                result.warnings.push({
                    row: rowNum,
                    name: item["Họ và tên"] || `Dòng ${rowNum}`,
                    warnings: rowWarnings,
                });
            }
        });

        return result;
    };

    const handleDownloadTemplate = () => {
        // Tạo file mẫu Excel
        const templateData = [
            {
                "Họ và tên": "Nguyễn Văn A",
                "Số điện thoại": "0123456789",
                Email: "example@gmail.com",
                "CCCD/Passport": "123456789",
                "Ngày sinh (YYYY-MM-DD)": "1990-01-01",
                "Địa chỉ": "Hà Nội",
                "Loại khách hàng": "normal",
                "Chi nhánh ID": "1",
                "Ghi chú": "Ghi chú về khách hàng",
                "Giới tính": "male",
            },
            {
                "Họ và tên": "Trần Thị B",
                "Số điện thoại": "0987654321",
                Email: "example2@gmail.com",
                "CCCD/Passport": "987654321",
                "Ngày sinh (YYYY-MM-DD)": "1995-05-15",
                "Địa chỉ": "Hồ Chí Minh",
                "Loại khách hàng": "vip",
                "Chi nhánh ID": "2",
                "Ghi chú": "",
                "Giới tính": "female",
            },
        ];

        // Tạo worksheet và thêm comments
        const worksheet = XLSX.utils.json_to_sheet(templateData);

        // Thêm comment cho các cột
        const comments = {
            A1: "Họ và tên khách hàng (Bắt buộc)",
            B1: "Số điện thoại khách hàng (Bắt buộc, định dạng số)",
            C1: "Email (Tùy chọn, phải đúng định dạng email)",
            D1: "Số CCCD hoặc Passport (Bắt buộc)",
            E1: "Ngày sinh theo định dạng YYYY-MM-DD (Tùy chọn)",
            F1: "Địa chỉ của khách hàng (Tùy chọn)",
            G1: "Loại khách hàng: 'normal' hoặc 'vip' (Bắt buộc)",
            H1: "ID Chi nhánh, để trống nếu không thuộc chi nhánh nào",
            I1: "Ghi chú thêm về khách hàng (Tùy chọn)",
            J1: "Giới tính: 'male', 'female' hoặc 'other' (Tùy chọn)",
        };

        // Thiết lập độ rộng cột
        const colWidths = [
            { wch: 20 }, // Họ và tên
            { wch: 15 }, // Số điện thoại
            { wch: 25 }, // Email
            { wch: 15 }, // CCCD
            { wch: 20 }, // Ngày sinh
            { wch: 30 }, // Địa chỉ
            { wch: 15 }, // Loại khách hàng
            { wch: 10 }, // Chi nhánh ID
            { wch: 30 }, // Ghi chú
            { wch: 10 }, // Giới tính
        ];

        // Áp dụng độ rộng cột
        worksheet["!cols"] = colWidths;

        // Tạo workbook và thêm worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mẫu Khách Hàng");

        // Thêm worksheet hướng dẫn
        const guideData = [
            ["Hướng dẫn nhập dữ liệu"],
            [
                "1. Các trường bắt buộc: Họ và tên, Số điện thoại, CCCD/Passport, Loại khách hàng",
            ],
            [
                "2. Loại khách hàng chỉ nhận một trong hai giá trị: 'normal' hoặc 'vip'",
            ],
            [
                "3. Giới tính chỉ nhận một trong ba giá trị: 'male', 'female', hoặc 'other'",
            ],
            ["4. Ngày sinh phải theo định dạng YYYY-MM-DD, ví dụ: 1990-01-01"],
            [
                "5. Mỗi số điện thoại và CCCD/Passport phải là duy nhất trong hệ thống",
            ],
            ["6. Email phải đúng định dạng nếu được cung cấp"],
            ["7. Chi nhánh ID phải là ID hợp lệ của chi nhánh trong hệ thống"],
            [""],
            ["Danh sách chi nhánh hiện có:"],
        ];

        // Thêm danh sách chi nhánh hiện có vào hướng dẫn
        if (branches && branches.length > 0) {
            branches.forEach((branch) => {
                guideData.push([
                    `ID: ${branch.id} - Tên chi nhánh: ${branch.name}`,
                ]);
            });
        } else {
            guideData.push(["Không có thông tin chi nhánh"]);
        }

        const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
        guideSheet["!cols"] = [{ wch: 80 }];
        XLSX.utils.book_append_sheet(workbook, guideSheet, "Hướng Dẫn");

        // Xuất file
        XLSX.writeFile(workbook, "Mẫu_import_khach_hang.xlsx");
    };

    const handleFileChange = async ({ fileList: newFileList }) => {
        setFileList(newFileList);

        if (newFileList.length > 0) {
            try {
                const file = newFileList[0].originFileObj;
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                setPreviewData(jsonData);

                // Kiểm tra dữ liệu
                const validationResult = validateData(jsonData);
                setValidationResults(validationResult);

                // Hiển thị preview
                setPreviewVisible(true);
            } catch (error) {
                console.error("Lỗi khi đọc file:", error);
                message.error(
                    "Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file."
                );
                setFileList([]);
            }
        } else {
            setPreviewData([]);
            setPreviewVisible(false);
            setValidationResults({ valid: true, errors: [], warnings: [] });
        }
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning("Vui lòng chọn file để import!");
            return;
        }

        if (!validationResults.valid) {
            message.error(
                "Dữ liệu không hợp lệ. Vui lòng sửa các lỗi trước khi import!"
            );
            return;
        }

        setLoading(true);
        try {
            // Dữ liệu đã được đọc ở handleFileChange
            // Gửi dữ liệu import lên server
            onImport(previewData);
            setFileList([]);
            setPreviewData([]);
            setPreviewVisible(false);
            onCancel();
        } catch (error) {
            console.error("Lỗi khi import file:", error);
            message.error("Không thể import danh sách khách hàng!");
        } finally {
            setLoading(false);
        }
    };

    // Cột cho preview table
    const previewColumns = [
        {
            title: "Họ và tên",
            dataIndex: "Họ và tên",
            key: "name",
            width: 150,
        },
        {
            title: "Số điện thoại",
            dataIndex: "Số điện thoại",
            key: "phone",
            width: 120,
        },
        {
            title: "CCCD/Passport",
            dataIndex: "CCCD/Passport",
            key: "idNumber",
            width: 120,
        },
        {
            title: "Email",
            dataIndex: "Email",
            key: "email",
            width: 150,
        },
        {
            title: "Loại khách hàng",
            dataIndex: "Loại khách hàng",
            key: "type",
            width: 120,
        },
        {
            title: "Giới tính",
            dataIndex: "Giới tính",
            key: "gender",
            width: 100,
        },
        {
            title: "Ngày sinh",
            dataIndex: "Ngày sinh (YYYY-MM-DD)",
            key: "birthday",
            width: 120,
        },
        {
            title: "Chi nhánh",
            dataIndex: "Chi nhánh ID",
            key: "branchId",
            width: 100,
            render: (branchId) => {
                if (!branchId) return "";
                // Tìm chi nhánh theo ID và hiển thị tên chi nhánh
                const branch = branches.find(
                    (b) => String(b.id) === String(branchId)
                );
                return branch ? branch.name : `Chi nhánh ${branchId}`;
            },
        },
    ];

    const renderValidationStatus = () => {
        const { errors, warnings } = validationResults;

        return (
            <div style={{ marginBottom: 16 }}>
                {errors.length > 0 && (
                    <Alert
                        message={`Có ${errors.length} lỗi cần sửa trước khi import`}
                        type="error"
                        showIcon
                        style={{ marginBottom: 8 }}
                    />
                )}

                {warnings.length > 0 && (
                    <Alert
                        message={`Có ${warnings.length} cảnh báo (vẫn có thể import)`}
                        type="warning"
                        showIcon
                    />
                )}

                {errors.length === 0 &&
                    warnings.length === 0 &&
                    previewData.length > 0 && (
                        <Alert
                            message={`Dữ liệu hợp lệ, có thể import ${previewData.length} khách hàng`}
                            type="success"
                            showIcon
                        />
                    )}
            </div>
        );
    };

    const renderValidationDetails = () => {
        const { errors, warnings } = validationResults;

        const errorColumns = [
            {
                title: "Dòng",
                dataIndex: "row",
                key: "row",
                width: 60,
            },
            {
                title: "Khách hàng",
                dataIndex: "name",
                key: "name",
                width: 150,
            },
            {
                title: "Lỗi",
                dataIndex: "errors",
                key: "errors",
                render: (errors) => (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {errors.map((error, i) => (
                            <li key={i}>{error}</li>
                        ))}
                    </ul>
                ),
            },
        ];

        const warningColumns = [
            {
                title: "Dòng",
                dataIndex: "row",
                key: "row",
                width: 60,
            },
            {
                title: "Khách hàng",
                dataIndex: "name",
                key: "name",
                width: 150,
            },
            {
                title: "Cảnh báo",
                dataIndex: "warnings",
                key: "warnings",
                render: (warnings) => (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                        ))}
                    </ul>
                ),
            },
        ];

        return (
            <div>
                {errors.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Title level={5} style={{ color: "#ff4d4f" }}>
                            <WarningOutlined /> Lỗi cần sửa
                        </Title>
                        <Table
                            columns={errorColumns}
                            dataSource={errors}
                            size="small"
                            pagination={false}
                            rowKey={(record) => `error-${record.row}`}
                        />
                    </div>
                )}

                {warnings.length > 0 && (
                    <div>
                        <Title level={5} style={{ color: "#faad14" }}>
                            <WarningOutlined /> Cảnh báo
                        </Title>
                        <Table
                            columns={warningColumns}
                            dataSource={warnings}
                            size="small"
                            pagination={false}
                            rowKey={(record) => `warning-${record.row}`}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            title="Import danh sách khách hàng"
            open={open}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={handleUpload}
                    loading={loading}
                    disabled={fileList.length === 0 || !validationResults.valid}
                >
                    Import
                </Button>,
            ]}
        >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Alert
                    message="Hướng dẫn"
                    description={
                        <>
                            <Text>
                                1. Tải file mẫu và điền đầy đủ thông tin khách
                                hàng theo hướng dẫn.
                            </Text>
                            <br />
                            <Text>
                                2. File mẫu có 2 sheet: Mẫu Khách Hàng (dữ liệu)
                                và Hướng Dẫn (chi tiết cách nhập).
                            </Text>
                            <br />
                            <Text>
                                3. Các trường bắt buộc: Họ và tên, Số điện
                                thoại, CCCD/Passport, Loại khách hàng.
                            </Text>
                            <br />
                            <Text>
                                4. Mỗi số điện thoại và CCCD phải là duy nhất
                                trong hệ thống.
                            </Text>
                            <br />
                            <Text>5. Chỉ sử dụng định dạng Excel (.xlsx).</Text>
                        </>
                    }
                    type="info"
                    showIcon
                />

                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadTemplate}
                    block
                >
                    Tải file mẫu
                </Button>

                {!previewVisible && (
                    <>
                        <Divider>Tải lên file Excel</Divider>

                        <Dragger
                            fileList={fileList}
                            onChange={handleFileChange}
                            beforeUpload={() => false}
                            accept=".xlsx"
                            maxCount={1}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                                Nhấp hoặc kéo file vào khu vực này để tải lên
                            </p>
                            <p className="ant-upload-hint">
                                Chỉ hỗ trợ file Excel (.xlsx) theo mẫu đã cung
                                cấp
                            </p>
                        </Dragger>
                    </>
                )}

                {fileList.length > 0 && !previewVisible && (
                    <div style={{ textAlign: "center" }}>
                        <Spin tip="Đang đọc file..." />
                    </div>
                )}

                {previewVisible && previewData.length > 0 && (
                    <>
                        <Divider>
                            <Space>
                                <FileExcelOutlined />
                                <span>
                                    Xem trước dữ liệu ({previewData.length}{" "}
                                    khách hàng)
                                </span>
                            </Space>
                        </Divider>

                        {renderValidationStatus()}

                        <Tabs
                            items={[
                                {
                                    key: "1",
                                    label: "Dữ liệu",
                                    children: (
                                        <div style={{ overflowX: "auto" }}>
                                            <Table
                                                dataSource={previewData}
                                                columns={previewColumns}
                                                size="small"
                                                rowKey={(record, index) =>
                                                    index
                                                }
                                                pagination={{
                                                    pageSize: 5,
                                                    showSizeChanger: true,
                                                    pageSizeOptions: [
                                                        "5",
                                                        "10",
                                                        "20",
                                                    ],
                                                }}
                                                scroll={{ x: 1000 }}
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: "2",
                                    label: "Kiểm tra",
                                    children: renderValidationDetails(),
                                },
                            ]}
                        />

                        <Space
                            style={{ width: "100%", justifyContent: "center" }}
                        >
                            <Button
                                onClick={() => {
                                    setFileList([]);
                                    setPreviewData([]);
                                    setPreviewVisible(false);
                                }}
                            >
                                Chọn file khác
                            </Button>

                            <Button
                                type="primary"
                                icon={<UploadOutlined />}
                                onClick={handleUpload}
                                loading={loading}
                                disabled={!validationResults.valid}
                            >
                                Import
                            </Button>
                        </Space>
                    </>
                )}
            </Space>
        </Modal>
    );
};

export default CustomerImportModal;
