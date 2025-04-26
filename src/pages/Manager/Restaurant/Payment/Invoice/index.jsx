import React, { useRef, useEffect, useState } from "react";
import { Button, Card, Space, Result, message } from "antd";
import { PrinterOutlined, RollbackOutlined, DownloadOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import InvoiceTemplate from "./InvoiceTemplate";

export default function Invoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const invoiceRef = useRef();

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(`restaurant_payment_${id}`);
            if (savedData) {
                setData(JSON.parse(savedData));
            } else {
                message.error("Không tìm thấy thông tin hóa đơn");
            }
        } catch (error) {
            message.error("Có lỗi khi tải thông tin hóa đơn");
            console.error("Lỗi:", error);
        }
    }, [id]);

    const handlePrint = useReactToPrint({
        content: () => invoiceRef.current,
        onBeforeGetContent: () => message.loading("Đang chuẩn bị in..."),
        onAfterPrint: () => message.success("In hóa đơn thành công!"),
        onError: () => message.error("Có lỗi xảy ra khi in!"),
    });

    const handleDownloadPDF = async () => {
        try {
            message.loading({ content: "Đang tạo file PDF...", key: "loading" });

            const element = invoiceRef.current;
            if (!element) {
                throw new Error("Không tìm thấy nội dung để tạo PDF");
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`hoa-don-${data.orderData.id}.pdf`);

            message.success({ content: "Tải file PDF thành công!", key: "loading" });
        } catch (error) {
            console.error("Lỗi khi tạo PDF:", error);
            message.error({
                content: "Có lỗi khi tạo file PDF: " + error.message,
                key: "loading",
            });
        }
    };

    if (!data) {
        return (
            <Result
                status="404"
                title="Không tìm thấy hóa đơn"
                subTitle="Hóa đơn bạn đang tìm không tồn tại hoặc đã bị xóa"
                extra={
                    <Button type="primary" onClick={() => navigate("/manager/restaurant/payment")}>
                        Quay lại
                    </Button>
                }
            />
        );
    }

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                        <Button icon={<RollbackOutlined />} onClick={() => navigate("/manager/restaurant/payment")}>
                            Quay lại
                        </Button>
                        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
                            In hóa đơn
                        </Button>
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
                            Tải PDF
                        </Button>
                    </Space>

                    <div ref={invoiceRef}>
                        <InvoiceTemplate orderData={data.orderData} paymentInfo={data.paymentInfo} />
                    </div>
                </Space>
            </Card>
        </div>
    );
}
