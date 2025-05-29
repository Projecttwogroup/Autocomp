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

type ChartData = {
  name: string;
  Completed: number;
  "In Progress": number;
};

interface Props {
  data: {
    name: string;
    completed: number;
    inProgress: number;
  }[];
}

const RequestsStatusChart = ({ data }: Props) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();

  const shiftedMonthNames = [
    ...monthNames.slice(currentMonthIndex + 1),
    ...monthNames.slice(0, currentMonthIndex + 1),
  ];

  const paddedData: ChartData[] = shiftedMonthNames.map((month) => {
    const match = data.find((d) => d.name === month);
    return {
      name: month,
      Completed: match?.completed || 0,
      "In Progress": match?.inProgress || 0,
    };
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={paddedData}>
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
            dataKey="Completed"
            name="Completed"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="In Progress"
            name="In Progress"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RequestsStatusChart;
