import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,  // Import TimeScale
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement 
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { server } from '../../server';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,  // Register TimeScale
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const SellerTotalSales = () => {
  const [orders, setOrders] = useState([]); // Ensure it's an array by default
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  
  const { shopId } = useSelector((state) => state.order);

  useEffect(() => {

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${server}/order/get-seller-all-orders/${shopId}`);
        console.log('API Response:', response.data);

        if (Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else {
          console.error('Unexpected response structure:', response.data);
          setOrders([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [shopId]);

  const filteredOrders = orders
    .filter(order => order.carts.some(cart => cart.shopId === shopId))
    .filter(order => {
      const orderDate = parseISO(order.createdAt);
      const isInDateRange = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
      const isInSelectedMonth = selectedMonth ? format(orderDate, 'MMMM yyyy') === selectedMonth : true;
      return isInDateRange && isInSelectedMonth;
    });

  const salesData = filteredOrders.reduce((acc, order) => {
    order.carts
      .filter(cart => cart.shopId === shopId)
      .forEach(cart => {
        const date = format(parseISO(order.createdAt), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = 0;
        acc[date] += cart.totalPrice;
      });
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(salesData).sort(),
    datasets: [
      {
        label: 'Total Sales',
        data: Object.keys(salesData).sort().map(date => salesData[date]),
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        fill: true,
        tension: 0.1
      }
    ],
  };

  const uniqueMonths = [...new Set(filteredOrders.map(order => format(parseISO(order.createdAt), 'MMMM yyyy')))];

  const getScreenWidth = () => window.innerWidth;

  const containerStyle = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    fontSize: getScreenWidth() < 600 ? '14px' : '16px',
  };

  const datePickerStyle = {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: getScreenWidth() < 600 ? 'column' : 'row',
    alignItems: 'flex-start',
  };

  const selectStyle = {
    marginLeft: getScreenWidth() < 600 ? '0' : '5px',
    marginTop: getScreenWidth() < 600 ? '10px' : '0',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    maxWidth: getScreenWidth() < 600 ? '100%' : 'auto',
  };

  const chartStyle = {
    width: '100%',
    height: getScreenWidth() < 600 ? '200px' : '250px',
  };

  const headingStyle = {
    fontSize: getScreenWidth() < 600 ? '18px' : '22px',
    marginBottom: '16px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Total Sales</h2>

      <div style={datePickerStyle}>
        <label>Start Date: </label>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        <label style={{ marginTop: getScreenWidth() < 600 ? '10px' : '0' }}>End Date: </label>
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
      </div>

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
          <Line 
            data={chartData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { display: true }, 
                tooltip: { mode: 'index' } 
              },
              scales: {
                x: { type: 'time', time: { unit: 'day' } },
                y: { beginAtZero: true }
              }
            }} 
          />
        </div>
      )}
    </div>
  );
}

export default SellerTotalSales;
