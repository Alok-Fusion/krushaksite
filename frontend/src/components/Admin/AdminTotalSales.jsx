import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { server } from '../../server';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminTotalSales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const dispatch = useDispatch();
  const salesData = useSelector((state) => state.orders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders from the server
        const response = await axios.get(`${server}/order/admin-all-orders`, {
          withCredentials: true,
        });
        setOrders(response.data.orders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dispatch]);

  // Filter orders based on date range and selected month
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.createdAt);

    // Check if order is within selected date range
    const isInDateRange = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);

    // Check if order is in the selected month
    const isInSelectedMonth = selectedMonth ? format(orderDate, 'MMMM yyyy') === selectedMonth : true;

    return isInDateRange && isInSelectedMonth;
  });

  // Prepare data for the chart
  const chartData = {
    labels: filteredOrders.map(order => format(parseISO(order.createdAt), 'MMM dd, yyyy')),
    datasets: [
      {
        label: 'Total Sales',
        data: filteredOrders.map(order => order.totalPrice),
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        borderColor: '#42A5F5',
        borderWidth: 1,
      },
      {
        label: "Admin's Earnings",
        data: filteredOrders.map(order => order.totalPrice * 0.01),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Generate a list of unique months for the month selector
  const uniqueMonths = [...new Set(orders.map(order => format(parseISO(order.createdAt), 'MMMM yyyy')))];

  // Get screen width
  const getScreenWidth = () => window.innerWidth;

  // Inline styles
  const containerStyle = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    fontSize: getScreenWidth() < 600 ? '14px' : '16px', // Adjust font size for mobile
  };

  const datePickerStyle = {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: getScreenWidth() < 600 ? 'column' : 'row', // Stack vertically on mobile
    alignItems: 'flex-start',
  };

  const selectStyle = {
    marginLeft: getScreenWidth() < 600 ? '0' : '5px',
    marginTop: getScreenWidth() < 600 ? '10px' : '0',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%', // Full width on mobile
    maxWidth: getScreenWidth() < 600 ? '100%' : 'auto',
  };

  const chartStyle = {
    width: '100%',
    height: getScreenWidth() < 600 ? '200px' : '250px', // Adjust chart height for mobile
  };

  const headingStyle = {
    fontSize: getScreenWidth() < 600 ? '18px' : '22px', // Adjust font size for mobile
    marginBottom: '16px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Total Sales and Admin's Earnings</h2>

      {/* Date range pickers */}
      <div style={datePickerStyle}>
        <label>Start Date: </label>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        <label style={{ marginTop: getScreenWidth() < 600 ? '10px' : '0' }}>End Date: </label>
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
      </div>

      {/* Month selector */}
      <div style={datePickerStyle}>
        <label>Select Month: </label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={selectStyle}>
          <option value="">All Months</option>
          {uniqueMonths.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={chartStyle}>
          <Bar 
            data={chartData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { display: true }, 
                tooltip: { mode: 'index' } 
              } 
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default AdminTotalSales;
