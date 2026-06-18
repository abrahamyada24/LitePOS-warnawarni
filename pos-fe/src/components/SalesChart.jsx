"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function SalesChart({ data }) {
  const labels = data && data.length > 0
    ? data.map(item => item.label)
    : ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];

  const values = data && data.length > 0
    ? data.map(item => item.total)
    : [0, 0, 0, 0, 0, 0, 0];

  const chartData = {
    labels: labels,
    datasets: [
      {
        fill: true,
        label: 'Penjualan',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return 'Rp ' + context.parsed.y.toLocaleString('id-ID');
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          // Format angka jutaan/ribuan di sumbu Y
          callback: function (value) {
            if (value >= 1000000) return (value / 1000000) + 'jt';
            if (value >= 1000) return (value / 1000) + 'rb';
            return value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line options={options} data={chartData} />
    </div>
  );
}