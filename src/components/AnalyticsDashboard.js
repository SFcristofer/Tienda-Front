import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  ADMIN_GET_SALES_DATA,
  ADMIN_GET_USER_REGISTRATIONS,
  ADMIN_GET_TOP_SELLING_PRODUCTS,
  ADMIN_GET_ORDER_STATUS_DISTRIBUTION,
  ADMIN_GET_TOP_PERFORMING_STORES,
  ADMIN_GET_CATEGORY_SALES,
  ADMIN_GET_PRODUCTS_PUBLISHED_BY_STORE,
  ADMIN_GET_PRODUCTS_SOLD,
  ADMIN_GET_ORDERS_CREATED_BY_STORES,
  ADMIN_GET_ORDERS_CREATED_BY_BUYERS,
  ADMIN_GET_NEW_USERS_COUNT,
  ADMIN_GET_NEW_STORES_COUNT,
  ADMIN_GET_CANCELLED_ORDERS,
} from '../graphql/queries';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Modal,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const GridLayout = WidthProvider(Responsive);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '82ca9d'];

const chartOptions = [
  { id: 'salesOverview', name: 'Sales Overview', defaultFilters: { period: 'monthly', startDate: null, endDate: null } },
  { id: 'userRegistrations', name: 'User Registrations', defaultFilters: { period: 'monthly', startDate: null, endDate: null } },
  { id: 'topSellingProducts', name: 'Top Selling Products', defaultFilters: { period: 'monthly', startDate: null, endDate: null } },
  { id: 'orderStatusDistribution', name: 'Order Status Distribution', defaultFilters: { period: 'monthly', startDate: null, endDate: null } },
  { id: 'topPerformingStores', name: 'Top Performing Stores', defaultFilters: { period: 'monthly', startDate: null, endDate: null } },
  { id: 'categorySales', name: 'Category Sales', defaultFilters: { period: 'monthly', startDate: null, endDate: null } },
  { id: 'productsPublishedByStore', name: 'Products Published by Store', defaultFilters: { period: 'monthly', startDate: null, endDate: null } }, // New
  { id: 'productsSold', name: 'Products Sold', defaultFilters: { period: 'monthly', startDate: null, endDate: null } }, // New
  { id: 'ordersCreatedByStores', name: 'Orders Created by Stores', defaultFilters: { period: 'monthly', startDate: null, endDate: null } }, // New
  { id: 'ordersCreatedByBuyers', name: 'Orders Created by Buyers', defaultFilters: { period: 'monthly', startDate: null, endDate: null } }, // New
  { id: 'newUsersCount', name: 'New Users Count', defaultFilters: { period: 'monthly', startDate: null, endDate: null } }, // New
  { id: 'newStoresCount', name: 'New Stores Count', defaultFilters: { period: 'monthly', startDate: null, endDate: null } }, // New
  { id: 'cancelledOrders', name: 'Cancelled Orders', defaultFilters: { period: 'monthly', startDate: null, endDate: null } }, // New
  { id: 'sampleRechartsBarChart', name: 'Sample Recharts Bar Chart', defaultFilters: { period: 'monthly', startDate: null, endDate: null } },
];

const AnalyticsDashboard = () => {
  const [openModal, setOpenModal] = useState(false); // New state for modal
  const [activeWidgets, setActiveWidgets] = useState([]); // New state for active widgets

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const addWidget = (widgetId) => {
    const selectedOption = chartOptions.find(option => option.id === widgetId);
    if (selectedOption) {
      setActiveWidgets((prevWidgets) => [...prevWidgets, {
        id: widgetId,
        i: widgetId,
        x: 0,
        y: Infinity,
        w: 6,
        h: 4,
        filters: selectedOption.defaultFilters // Initialize with default filters
      }]);
    }
    handleClose(); // Close the modal
  };

  // Helper to format dates for GraphQL
  const formatDate = (date) => (date ? dayjs(date).format('YYYY-MM-DD') : '');

  // Apollo Client useQuery hooks for each data type
  const { loading: salesLoading, error: salesError, data: salesData } = useQuery(ADMIN_GET_SALES_DATA, {
    variables: {
      period: activeWidgets.find(w => w.id === 'salesOverview')?.filters?.period || 'monthly',
      startDate: formatDate(activeWidgets.find(w => w.id === 'salesOverview')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'salesOverview')?.filters?.endDate),
    },
  });

  const { loading: userRegLoading, error: userRegError, data: userRegData } = useQuery(ADMIN_GET_USER_REGISTRATIONS, {
    variables: {
      period: activeWidgets.find(w => w.id === 'userRegistrations')?.filters?.period || 'monthly',
      startDate: formatDate(activeWidgets.find(w => w.id === 'userRegistrations')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'userRegistrations')?.filters?.endDate),
    },
  });

  const { loading: topProductsLoading, error: topProductsError, data: topProductsData } = useQuery(ADMIN_GET_TOP_SELLING_PRODUCTS, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'topSellingProducts')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'topSellingProducts')?.filters?.endDate),
    },
  });

  const { loading: orderStatusLoading, error: orderStatusError, data: orderStatusData } = useQuery(ADMIN_GET_ORDER_STATUS_DISTRIBUTION, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'orderStatusDistribution')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'orderStatusDistribution')?.filters?.endDate),
    },
  });

  const { loading: topStoresLoading, error: topStoresError, data: topStoresData } = useQuery(ADMIN_GET_TOP_PERFORMING_STORES, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'topPerformingStores')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'topPerformingStores')?.filters?.endDate),
    },
  });

  const { loading: categorySalesLoading, error: categorySalesError, data: categorySalesData } = useQuery(ADMIN_GET_CATEGORY_SALES, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'categorySales')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'categorySales')?.filters?.endDate),
    },
  });

  const { loading: productsPublishedByStoreLoading, error: productsPublishedByStoreError, data: productsPublishedByStoreData } = useQuery(ADMIN_GET_PRODUCTS_PUBLISHED_BY_STORE, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'productsPublishedByStore')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'productsPublishedByStore')?.filters?.endDate),
    },
  });

  const { loading: productsSoldLoading, error: productsSoldError, data: productsSoldData } = useQuery(ADMIN_GET_PRODUCTS_SOLD, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'productsSold')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'productsSold')?.filters?.endDate),
    },
  });

  const { loading: ordersCreatedByStoresLoading, error: ordersCreatedByStoresError, data: ordersCreatedByStoresData } = useQuery(ADMIN_GET_ORDERS_CREATED_BY_STORES, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'ordersCreatedByStores')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'ordersCreatedByStores')?.filters?.endDate),
    },
  });

  const { loading: ordersCreatedByBuyersLoading, error: ordersCreatedByBuyersError, data: ordersCreatedByBuyersData } = useQuery(ADMIN_GET_ORDERS_CREATED_BY_BUYERS, {
    variables: {
      startDate: formatDate(activeWidgets.find(w => w.id === 'ordersCreatedByBuyers')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'ordersCreatedByBuyers')?.filters?.endDate),
    },
  });

  const { loading: newUsersCountLoading, error: newUsersCountError, data: newUsersCountData } = useQuery(ADMIN_GET_NEW_USERS_COUNT, {
    variables: {
      period: activeWidgets.find(w => w.id === 'newUsersCount')?.filters?.period || 'monthly',
      startDate: formatDate(activeWidgets.find(w => w.id === 'newUsersCount')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'newUsersCount')?.filters?.endDate),
    },
  });

  const { loading: newStoresCountLoading, error: newStoresCountError, data: newStoresCountData } = useQuery(ADMIN_GET_NEW_STORES_COUNT, {
    variables: {
      period: activeWidgets.find(w => w.id === 'newStoresCount')?.filters?.period || 'monthly',
      startDate: formatDate(activeWidgets.find(w => w.id === 'newStoresCount')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'newStoresCount')?.filters?.endDate),
    },
  });

  const { loading: cancelledOrdersLoading, error: cancelledOrdersError, data: cancelledOrdersData } = useQuery(ADMIN_GET_CANCELLED_ORDERS, {
    variables: {
      period: activeWidgets.find(w => w.id === 'cancelledOrders')?.filters?.period || 'monthly',
      startDate: formatDate(activeWidgets.find(w => w.id === 'cancelledOrders')?.filters?.startDate),
      endDate: formatDate(activeWidgets.find(w => w.id === 'cancelledOrders')?.filters?.endDate),
    },
  });

  const getChartComponent = (widgetId, widgetFilters, onUpdateWidgetFilters) => {
    // Determine loading state for the specific widget
    let widgetLoading = false;
    switch (widgetId) {
      case 'salesOverview': widgetLoading = salesLoading; break;
      case 'userRegistrations': widgetLoading = userRegLoading; break;
      case 'topSellingProducts': widgetLoading = topProductsLoading; break;
      case 'orderStatusDistribution': widgetLoading = orderStatusLoading; break;
      case 'topPerformingStores': widgetLoading = topStoresLoading; break;
      case 'categorySales': widgetLoading = categorySalesLoading; break;
      case 'productsPublishedByStore': widgetLoading = productsPublishedByStoreLoading; break;
      case 'productsSold': widgetLoading = productsSoldLoading; break;
      case 'ordersCreatedByStores': widgetLoading = ordersCreatedByStoresLoading; break;
      case 'ordersCreatedByBuyers': widgetLoading = ordersCreatedByBuyersLoading; break;
      case 'newUsersCount': widgetLoading = newUsersCountLoading; break;
      case 'newStoresCount': widgetLoading = newStoresCountLoading; break;
      case 'cancelledOrders': widgetLoading = cancelledOrdersLoading; break;
      default: widgetLoading = false; // For sample charts or unknown types
    }


    if (widgetLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading Chart Data...</Typography>
        </Box>
      );
    }

    // Determine error state for the specific widget
    let widgetError = null;
    switch (widgetId) {
      case 'salesOverview': widgetError = salesError; break;
      case 'userRegistrations': widgetError = userRegError; break;
      case 'topSellingProducts': widgetError = topProductsError; break;
      case 'orderStatusDistribution': widgetError = orderStatusError; break;
      case 'topPerformingStores': widgetError = topStoresError; break;
      case 'categorySales': widgetError = categorySalesError; break;
      case 'productsPublishedByStore': widgetError = productsPublishedByStoreError; break;
      case 'productsSold': widgetError = productsSoldError; break;
      case 'ordersCreatedByStores': widgetError = ordersCreatedByStoresError; break;
      case 'ordersCreatedByBuyers': widgetError = ordersCreatedByBuyersError; break;
      case 'newUsersCount': widgetError = newUsersCountError; break;
      case 'newStoresCount': widgetError = newStoresCountError; break;
      case 'cancelledOrders': widgetError = cancelledOrdersError; break;
      default: widgetError = null;
    }

    if (widgetError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Alert severity="error">
            Error loading chart: {widgetError.message}
          </Alert>
        </Box>
      );
    }

    switch (widgetId) {
      case 'salesOverview':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="period-select-label">Period</InputLabel>
                    <Select
                      labelId="period-select-label"
                      id="period-select"
                      value={widgetFilters.period}
                      label="Period"
                      onChange={(e) => onUpdateWidgetFilters({ ...widgetFilters, period: e.target.value })}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData?.adminGetSalesData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalSales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'userRegistrations':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="period-select-label">Period</InputLabel>
                    <Select
                      labelId="period-select-label"
                      id="period-select"
                      value={widgetFilters.period}
                      label="Period"
                      onChange={(e) => onUpdateWidgetFilters({ ...widgetFilters, period: e.target.value })}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRegData?.adminGetUserRegistrations || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'topSellingProducts':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData?.adminGetTopSellingProducts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#ffc658" name="Total Revenue" />
                <Bar dataKey="totalQuantitySold" fill="#8884d8" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'orderStatusDistribution':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData?.adminGetOrderStatusDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ status, percentage }) => `${status} (${percentage.toFixed(1)}%)`}
                >
                  { (orderStatusData?.adminGetOrderStatusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage.toFixed(1)}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'topPerformingStores':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStoresData?.adminGetTopPerformingStores || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="storeName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#a4de6c" name="Total Revenue" />
                <Bar dataKey="totalOrders" fill="#d0ed57" name="Total Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'categorySales':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySalesData?.adminGetCategorySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#ff7300" name="Total Revenue" />
                <Bar dataKey="totalQuantitySold" fill="#387908" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      // Add cases for new chart types here
      case 'productsPublishedByStore':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsPublishedByStoreData?.adminGetProductsPublishedByStore || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="storeName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="productCount" fill="#8884d8" name="Product Count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'productsSold':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsSoldData?.adminGetProductsSold || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalQuantitySold" fill="#82ca9d" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'ordersCreatedByStores':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersCreatedByStoresData?.adminGetOrdersCreatedByStores || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="storeName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orderCount" fill="#ffc658" name="Order Count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'ordersCreatedByBuyers':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersCreatedByBuyersData?.adminGetOrdersCreatedByBuyers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="userName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orderCount" fill="#a4de6c" name="Order Count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'newUsersCount':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="period-select-label">Period</InputLabel>
                    <Select
                      labelId="period-select-label"
                      id="period-select"
                      value={widgetFilters.period}
                      label="Period"
                      onChange={(e) => onUpdateWidgetFilters({ ...widgetFilters, period: e.target.value })}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newUsersCountData?.adminGetNewUsersCount || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'newStoresCount':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="period-select-label">Period</InputLabel>
                    <Select
                      labelId="period-select-label"
                      id="period-select"
                      value={widgetFilters.period}
                      label="Period"
                      onChange={(e) => onUpdateWidgetFilters({ ...widgetFilters, period: e.target.value })}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newStoresCountData?.adminGetNewStoresCount || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" activeDot={{ r: 8 }} name="New Stores" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'cancelledOrders':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="period-select-label">Period</InputLabel>
                    <Select
                      labelId="period-select-label"
                      id="period-select"
                      value={widgetFilters.period}
                      label="Period"
                      onChange={(e) => onUpdateWidgetFilters({ ...widgetFilters, period: e.target.value })}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cancelledOrdersData?.adminGetCancelledOrders || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff7300" name="Cancelled Orders Count" />
                <Bar dataKey="totalAmount" fill="#387908" name="Total Cancelled Amount" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'sampleRechartsBarChart':
        const sampleData = [
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 200 },
          { name: 'Apr', value: 278 },
          { name: 'May', value: 189 },
        ];
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="period-select-label">Period</InputLabel>
                    <Select
                      labelId="period-select-label"
                      id="period-select"
                      value={widgetFilters.period}
                      label="Period"
                      onChange={(e) => onUpdateWidgetFilters({ ...widgetFilters, period: e.target.value })}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Start Date"
                    value={widgetFilters.startDate ? dayjs(widgetFilters.startDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, startDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="End Date"
                    value={widgetFilters.endDate ? dayjs(widgetFilters.endDate) : null}
                    onChange={(newValue) => onUpdateWidgetFilters({ ...widgetFilters, endDate: newValue ? newValue.toISOString() : null })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      default:
        return <Typography>Unknown Chart Type</Typography>;
    }
  };

  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Las tablas de datos se agregarán en futuras actualizaciones.
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}> {/* New Grid item for the button */}
              <Button variant="contained" onClick={handleOpen}>
                Add Widget
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <GridLayout
          className="layout"
          layouts={{ lg: activeWidgets }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
          rowHeight={30}
          onLayoutChange={(layout) => {
            // Update activeWidgets with new positions
            setActiveWidgets(layout);
          }}
        >
          {activeWidgets.map((widget, index) => (
            <div key={widget.i} data-grid={widget}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                {getChartComponent(
                  widget.id,
                  widget.filters,
                  (newFilters) => {
                    setActiveWidgets((prevWidgets) => {
                      const updatedWidgets = [...prevWidgets];
                      updatedWidgets[index] = { ...updatedWidgets[index], filters: newFilters };
                      return updatedWidgets;
                    });
                  }
                )}
              </Paper>
            </div>
          ))}
        </GridLayout>
      </Container>
    </LocalizationProvider>

    <Modal
      open={openModal}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Select Chart Type
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <Grid container spacing={1}>
            {chartOptions.map((option) => (
              <Grid item xs={12} key={option.id}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addWidget(option.id)}
                >
                  {option.name}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Button onClick={handleClose} sx={{ mt: 2 }}>Close</Button>
        </Typography>
      </Box>
    </Modal>
  </>
  );
};

export default AnalyticsDashboard;