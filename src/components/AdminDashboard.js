import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  adminGetAllUsers as ADMIN_GET_ALL_USERS,
  adminGetAllStores,
  adminGetAllProducts,
  adminGetAllOrders,
  GET_ALL_CATEGORIES,
  ADMIN_GET_DASHBOARD_STATS,
} from '../graphql/queries';
import {
  ADMIN_UPDATE_USER_ROLE,
  ADMIN_UPDATE_USER_STATUS,
  ADMIN_UPDATE_CATEGORY,
  ADMIN_DELETE_CATEGORY,
  CREATE_CATEGORY,
  ADMIN_UPDATE_STORE_STATUS,
  ADMIN_UPDATE_PRODUCT_STATUS,
} from '../graphql/mutations';
import { 
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AnalyticsDashboard from './AnalyticsDashboard';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AdminDashboard = () => {
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(ADMIN_GET_ALL_USERS);
  const { data: storesData, loading: storesLoading, error: storesError, refetch: refetchStores } = useQuery(adminGetAllStores);
  const { data: productsData, loading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery(adminGetAllProducts);
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery(adminGetAllOrders);
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useQuery(GET_ALL_CATEGORIES);
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(ADMIN_GET_DASHBOARD_STATS);

  const [updateUserRole] = useMutation(ADMIN_UPDATE_USER_ROLE);
  const [updateUserStatus] = useMutation(ADMIN_UPDATE_USER_STATUS);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(ADMIN_UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(ADMIN_DELETE_CATEGORY);
  const [updateStoreStatus] = useMutation(ADMIN_UPDATE_STORE_STATUS);
  const [updateProductStatus] = useMutation(ADMIN_UPDATE_PRODUCT_STATUS);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [anchorElStore, setAnchorElStore] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  const [anchorElProduct, setAnchorElProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [tabValue, setTabValue] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUserMenuClick = (event, user) => {
    setAnchorElUser(event.currentTarget);
    setSelectedUser(user);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
    setSelectedUser(null);
  };

  const handleStoreMenuClick = (event, store) => {
    setAnchorElStore(event.currentTarget);
    setSelectedStore(store);
  };

  const handleStoreMenuClose = () => {
    setAnchorElStore(null);
    setSelectedStore(null);
  };

  const handleProductMenuClick = (event, product) => {
    setAnchorElProduct(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleProductMenuClose = () => {
    setAnchorElProduct(null);
    setSelectedProduct(null);
  };

  const handleRoleChange = async (newRole) => {
    if (!selectedUser) return;
    try {
      await updateUserRole({ variables: { userId: selectedUser.id, role: newRole } });
      refetchUsers(); // Refetch users to update the table
    } catch (err) {
      console.error('Error updating user role:', err);
      alert(`Failed to update role: ${err.message}`);
    }
    handleUserMenuClose();
  };

  const handleUserStatusChange = async (newStatus) => {
    if (!selectedUser) return;
    try {
      await updateUserStatus({ variables: { userId: selectedUser.id, status: newStatus } });
      refetchUsers(); // Refetch users to update the table
    } catch (err) {
      console.error('Error updating user status:', err);
      alert(`Failed to update status: ${err.message}`);
    }
    handleUserMenuClose();
  };

  const handleStoreStatusChange = async (newStatus) => {
    if (!selectedStore) return;
    try {
      await updateStoreStatus({ variables: { storeId: selectedStore.id, status: newStatus } });
      refetchStores(); // Refetch stores to update the table
    } catch (err) {
      console.error('Error updating store status:', err);
      alert(`Failed to update status: ${err.message}`);
    }
    handleStoreMenuClose();
  };

  const handleProductStatusChange = async (newStatus) => {
    if (!selectedProduct) return;
    try {
      await updateProductStatus({ variables: { productId: selectedProduct.id, status: newStatus } });
      refetchProducts(); // Refetch products to update the table
    } catch (err) {
      console.error('Error updating product status:', err);
      alert(`Failed to update status: ${err.message}`);
    }
    handleProductMenuClose();
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory({ variables: { name: newCategoryName } });
      setNewCategoryName('');
      setOpenCreateDialog(false);
      refetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      alert(`Failed to create category: ${err.message}`);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    try {
      await updateCategory({ variables: { id: selectedCategory.id, name: editCategoryName } });
      setOpenEditDialog(false);
      setEditCategoryName('');
      setSelectedCategory(null);
      refetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      alert(`Failed to update category: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory({ variables: { id } });
        refetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        alert(`Failed to delete category: ${err.message}`);
      }
    }
  };

  if (usersLoading || storesLoading || productsLoading || ordersLoading || categoriesLoading || statsLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading Admin Data...</Typography>
      </Container>
    );
  }

  if (usersError) return <Alert severity="error">Error loading users: {usersError.message}</Alert>;
  if (storesError) return <Alert severity="error">Error loading stores: {storesError.message}</Alert>;
  if (productsError) return <Alert severity="error">Error loading products: {productsError.message}</Alert>;
  if (ordersError) return <Alert severity="error">Error loading orders: {ordersError.message}</Alert>;
  if (categoriesError) return <Alert severity="error">Error loading categories: {categoriesError.message}</Alert>;
  if (statsError) return <Alert severity="error">Error loading stats: {statsError.message}</Alert>;

  const users = usersData?.adminGetAllUsers || [];
  const stores = storesData?.adminGetAllStores || [];
  const products = productsData?.adminGetAllProducts || [];
  const orders = ordersData?.adminGetAllOrders || [];
  const categories = categoriesData?.getAllCategories || [];
  const stats = statsData?.adminGetDashboardStats || {};

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Stores
              </Typography>
              <Typography variant="h4">{stats.totalStores}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">{stats.totalProducts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">{stats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Sales Volume
              </Typography>
              <Typography variant="h4">${stats.totalSalesVolume?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab label="Users" {...a11yProps(0)} />
          <Tab label="Stores" {...a11yProps(1)} />
          <Tab label="Products" {...a11yProps(2)} />
          <Tab label="Orders" {...a11yProps(3)} />
          <Tab label="Categories" {...a11yProps(4)} />
          <Tab label="Analytics" {...a11yProps(5)} />
        </Tabs>
      </Box>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={0}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Users ({users.length})</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.isVerified ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="actions"
                        onClick={(e) => handleUserMenuClick(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Stores Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Stores ({stores.length})</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.id}</TableCell>
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.owner?.name || 'N/A'}</TableCell>
                    <TableCell>{store.products?.length || 0}</TableCell>
                    <TableCell>{store.status}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="actions"
                        onClick={(e) => handleStoreMenuClick(e, store)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Products Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Products ({products.length})</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.store?.name || 'N/A'}</TableCell>
                    <TableCell>{product.category?.name || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="actions"
                        onClick={(e) => handleProductMenuClick(e, product)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Orders Tab */}
      <TabPanel value={tabValue} index={3}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Orders ({orders.length})</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Items</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{order.store?.name || 'N/A'}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={4}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" gutterBottom>Categories ({categories.length})</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenCreateDialog(true)}>
              Create New Category
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="edit"
                        onClick={() => {
                          setSelectedCategory(category);
                          setEditCategoryName(category.name);
                          setOpenEditDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={5}>
        <AnalyticsDashboard />
      </TabPanel>

      {/* Actions Menu for Users */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
      >
        <MenuItem disabled>Change Role to:</MenuItem>
        <MenuItem onClick={() => handleRoleChange('customer')}>Customer</MenuItem>
        <MenuItem onClick={() => handleRoleChange('seller')}>Seller</MenuItem>
        <MenuItem onClick={() => handleRoleChange('admin')}>Admin</MenuItem>
        <MenuItem disabled>Change Status to:</MenuItem>
        <MenuItem onClick={() => handleUserStatusChange('active')}>Active</MenuItem>
        <MenuItem onClick={() => handleUserStatusChange('inactive')}>Inactive</MenuItem>
      </Menu>

      {/* Actions Menu for Stores */}
      <Menu
        anchorEl={anchorElStore}
        open={Boolean(anchorElStore)}
        onClose={handleStoreMenuClose}
      >
        <MenuItem disabled>Change Status to:</MenuItem>
        <MenuItem onClick={() => handleStoreStatusChange('active')}>Active</MenuItem>
        <MenuItem onClick={() => handleStoreStatusChange('inactive')}>Inactive</MenuItem>
      </Menu>

      {/* Actions Menu for Products */}
      <Menu
        anchorEl={anchorElProduct}
        open={Boolean(anchorElProduct)}
        onClose={handleProductMenuClose}
      >
        <MenuItem disabled>Change Status to:</MenuItem>
        <MenuItem onClick={() => handleProductStatusChange('active')}>Active</MenuItem>
        <MenuItem onClick={() => handleProductStatusChange('inactive')}>Inactive</MenuItem>
      </Menu>

      {/* Create Category Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            variant="standard"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            variant="standard"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateCategory}>Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
