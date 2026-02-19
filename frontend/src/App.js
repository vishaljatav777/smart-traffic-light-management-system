import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function App() {

  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://127.0.0.1:8000/live-status")
        .then(res => res.json())
        .then(newData => {
          setData(newData);

          setHistory(prev => [
            ...prev,
            {
              cycle: prev.length,
              wait: newData.average_wait,
              throughput: newData.throughput
            }
          ]);
        })
        .catch(err => console.log(err));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🚦 Smart Traffic Dashboard</h1>

      <h2>🟢 Active Side: {data.active_side}</h2>

      <h3>🚗 Vehicle Counts</h3>
      <ul>
        {Object.entries(data.vehicle_counts || {}).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>

      <h3>📊 Live Performance</h3>

      <LineChart width={600} height={300} data={history}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="cycle" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="wait" stroke="#ff7300" name="Avg Wait" />
        <Line type="monotone" dataKey="throughput" stroke="#387908" name="Throughput" />
      </LineChart>
    </div>
  );
}

export default App;
