
import React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const RequestsChart = () => {
  // Mock data for the chart - removed "pending" data
  const data = [
    {
      name: "Jan",
      inProgress: 8,
      completed: 24,
    },
    {
      name: "Feb",
      inProgress: 10,
      completed: 22,
    },
    {
      name: "Mar",
      inProgress: 12,
      completed: 28,
    },
    {
      name: "Apr",
      inProgress: 8,
      completed: 30,
    },
    {
      name: "May",
      inProgress: 15,
      completed: 24,
    },
    {
      name: "Jun",
      inProgress: 12,
      completed: 28,
    },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="inProgress" name="In Progress" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          {/* Removed "pending" bar */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RequestsChart;
