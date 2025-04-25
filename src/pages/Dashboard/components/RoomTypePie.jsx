import Chart from "react-apexcharts";

export default function RoomTypePie() {
    const options = {
        chart: {
            type: "donut",
        },
        labels: ["Phòng Deluxe", "Phòng Suite", "Phòng Standard", "Phòng Family", "Phòng VIP"],
        colors: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
        legend: {
            position: "bottom",
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200,
                    },
                    legend: {
                        position: "bottom",
                    },
                },
            },
        ],
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Tổng",
                            formatter: () => "100%",
                        },
                    },
                },
            },
        },
    };

    const series = [27, 25, 18, 15, 15];

    return <Chart options={options} series={series} type="donut" height={350} />;
}
