import { useState } from "react";
import Chart from "react-apexcharts";

export default function OccupancyChart() {
    const [year, setYear] = useState(new Date().getFullYear());

    const options = {
        chart: {
            type: "line",
            height: 350,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
        },
        colors: ["#FF4560", "#775DD0"],
        stroke: {
            curve: "smooth",
            width: [3, 3],
        },
        markers: {
            size: 5,
        },
        xaxis: {
            categories: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
        },
        yaxis: {
            min: 0,
            max: 100,
            labels: {
                formatter: (value) => `${value}%`,
            },
        },
        tooltip: {
            y: {
                formatter: (value) => `${value}%`,
            },
        },
        legend: {
            position: "top",
        },
    };

    const series = [
        {
            name: "Tỷ lệ lấp đầy",
            data: [65, 70, 75, 80, 85, 82, 78, 85, 90, 88, 85, 92],
        },
        {
            name: "Mục tiêu",
            data: [70, 70, 70, 75, 75, 80, 80, 85, 85, 85, 90, 90],
        },
    ];

    return (
        <div>
            <Chart options={options} series={series} type="line" height={350} />
        </div>
    );
}
