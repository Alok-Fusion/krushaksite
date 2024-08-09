import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, LabelList } from "recharts";
import { useSelector } from "react-redux";

// Define colors for each category slice
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Adjust label positioning for better centering
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12px"
      fontFamily="'Poppins', sans-serif"
    >
      {`${name}: ${value}`}
    </text>
  );
};

const AdminChart = () => {
  const { adminOrders } = useSelector((state) => state.order);

  // Process the orders to get the count of each category
  const categoryData = useMemo(() => {
    const categoryCount = {};

    adminOrders?.forEach((order) => {
      order.cart.forEach((item) => {
        const category = item.category;
        if (category) {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));
  }, [adminOrders]);

  // Responsive sizes based on window width
  const windowWidth = window.innerWidth;
  const chartSize = windowWidth < 600 ? 200 : windowWidth < 900 ? 250 : 300;
  const outerRadius = chartSize / 2.5;

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "500px",
        margin: "20px auto",
        padding: "20px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          fontFamily: "'Poppins', sans-serif",
          paddingBottom: "10px",
        }}
      >
        Order Categories
      </h3>
      <PieChart width={chartSize} height={chartSize} style={{ margin: '0 auto' }}>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={renderCustomizedLabel}
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default AdminChart;
