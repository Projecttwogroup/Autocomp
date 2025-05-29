import React, { useEffect, useState } from "react";

interface Ticket {
  id: string;
  userName: string;
  status: string;
  createdAt: string;
  department: string;
  officeHoursStart: string;
}

const statusColor = {
  Completed: "bg-green-500",
  "In Progress": "bg-yellow-500",
  Received: "bg-blue-500",
};

const RecentRequests: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch("https://localhost:7181/api/ticket/admin/all")
      .then((res) => res.json())
      .then((data) => setTickets(data.slice(0, 5)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket, i) => (
            <tr key={i}>
              <td className="px-6 py-4 whitespace-nowrap">{ticket.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{ticket.userName}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColor[ticket.status as keyof typeof statusColor] ||
                    "bg-gray-400"
                  }`}
                >
                  {ticket.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {ticket.createdAt?.split("T")[0]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {ticket.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {(() => {
                  const hour = parseInt(ticket.officeHoursStart?.split(":")[0]);
                  if (hour >= 8 && hour < 12) return "Morning";
                  if (hour >= 12 && hour < 16) return "Afternoon";
                  if (hour >= 16 && hour <= 20) return "Evening";
                  return "Unknown";
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentRequests;
