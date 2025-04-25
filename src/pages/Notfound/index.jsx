import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie-player";
import animationData from "../../assets/lottie/404-animation.json";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#fafafa",
            }}
        >
            {/* Chỉ giữ Lottie animation */}
            <div style={{ maxWidth: 400, width: "100%" }}>
                <Lottie loop animationData={animationData} play style={{ width: "100%", height: "auto" }} />
            </div>

            {/* AntD Result không hiển thị icon */}
            <Result
                icon={null}
                title="Xin lỗi, trang bạn tìm không tồn tại!"
                extra={
                    <Button type="primary" size="large" onClick={() => navigate("/")}>
                        Quay về Trang chủ
                    </Button>
                }
                style={{ background: "#fff", borderRadius: 8 }}
            />
        </div>
    );
}
