"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export function RsvpChart({
  accepted,
  declined,
  pending,
}: {
  accepted: number;
  declined: number;
  pending: number;
}) {
  const data = [
    { name: "Accepted", value: accepted },
    { name: "Declined", value: declined },
    { name: "Pending", value: pending },
  ];
  const total = accepted + declined + pending;

  if (total === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
        No RSVP data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={208}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
