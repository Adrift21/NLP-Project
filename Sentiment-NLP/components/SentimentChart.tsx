
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats;
}

const SentimentChart: React.FC<Props> = ({ stats }) => {
  const pieData = [
    { name: 'Positive', value: stats.positive, color: '#10b981' },
    { name: 'Neutral', value: stats.neutral, color: '#64748b' },
    { name: 'Negative', value: stats.negative, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Sentiment Count', Positive: stats.positive, Neutral: stats.neutral, Negative: stats.negative }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Sentiment Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Volume Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Neutral" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentChart;
