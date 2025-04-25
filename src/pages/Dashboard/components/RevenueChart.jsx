import { useState } from "react";
import { Radio, Space } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
    { name: "Th1", revenue: 4000, expenses: 2400 },
    { name: "Th2", revenue: 3000, expenses: 1398 },
    { name: "Th3", revenue: 9800, expenses: 2000 },
    { name: "Th4", revenue: 3908, expenses: 2780 },
    { name: "Th5", revenue: 4800, expenses: 1890 },
    { name: "Th6", revenue: 10900, expenses: 3500 },
    { name: "Th7", revenue: 12500, expenses: 4300 },
    { name: "Th8", revenue: 11500, expenses: 4100 },
    { name: "Th9", revenue: 9500, expenses: 3800 },
    { name: "Th10", revenue: 10500, expenses: 4000 },
    { name: "Th11", revenue: 13500, expenses: 4500 },
    { name: "Th12", revenue: 15000, expenses: 5000 },
];

export default function RevenueChart() {
    const [viewMode, setViewMode] = useState("revenue");

    return (
        <div>
            <div style={{ textAlign: "right", marginBottom: 16 }}>
                <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                    <Space direction="horizontal">
                        <Radio.Button value="revenue">Doanh thu</Radio.Button>
                        <Radio.Button value="all">Tất cả</Radio.Button>
                    </Space>
                </Radio.Group>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} triệu VND`, value === "revenue" ? "Doanh thu" : "Chi phí"]} />
                    <Legend />
                    {viewMode !== "expenses" && <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />}
                    {viewMode !== "revenue" && <Bar dataKey="expenses" fill="#82ca9d" name="Chi phí" />}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
