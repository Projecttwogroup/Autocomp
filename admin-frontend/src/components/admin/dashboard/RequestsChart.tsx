import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface ChartProps {
  technicianName: string;
}

const RequestsChart: React.FC<ChartProps> = ({ technicianName }) => {
  const [data, setData] = useState<
    { name: string; completed: number; inProgress: number }[]
  >([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch(
          `https://localhost:7181/api/technician/${technicianName}/chart`
        );
        const chartData = await res.json();
        setData(chartData);
      } catch (err) {
        console.error("Failed to load chart data", err);
      }
    };

    if (technicianName) fetchChartData();
  }, [technicianName]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar
            dataKey="completed"
            name="Completed"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="inProgress"
            name="In Progress"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RequestsChart;
