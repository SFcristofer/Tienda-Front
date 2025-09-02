import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { adminGetAllUsers, adminGetAllStores, adminGetAllProducts, adminGetAllOrders, GET_ALL_CATEGORIES, ADMIN_GET_DASHBOARD_STATS, GET_ALL_STORE_CATEGORIES, ADMIN_GET_ALL_COUNTRIES } from '../graphql/queries';
import { ADMIN_UPDATE_USER_ROLE, ADMIN_UPDATE_USER_STATUS, ADMIN_UPDATE_CATEGORY, ADMIN_DELETE_CATEGORY, CREATE_CATEGORY, ADMIN_UPDATE_STORE_STATUS, ADMIN_UPDATE_PRODUCT_STATUS, ADMIN_CREATE_STORE_CATEGORY, ADMIN_UPDATE_STORE_CATEGORY, ADMIN_DELETE_STORE_CATEGORY, ADMIN_DELETE_USER, ADMIN_CREATE_COUNTRY, ADMIN_UPDATE_COUNTRY, ADMIN_DELETE_COUNTRY } from '../graphql/mutations';
import { Container, Typography, CircularProgress, Alert, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Menu, MenuItem, Tabs, Tab, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Card, CardContent, FormControlLabel, Switch } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AnalyticsDashboard from './AnalyticsDashboard';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(adminGetAllUsers);
  const { data: storesData, loading: storesLoading, error: storesError, refetch: refetchStores } = useQuery(adminGetAllStores);
  const { data: productsData, loading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery(adminGetAllProducts);
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery(adminGetAllOrders);
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useQuery(GET_ALL_CATEGORIES);
  const { data: storeCategoriesData, loading: storeCategoriesLoading, error: storeCategoriesError, refetch: refetchStoreCategories } = useQuery(GET_ALL_STORE_CATEGORIES);
  const { data: countriesData, loading: countriesLoading, error: countriesError, refetch: refetchCountries } = useQuery(ADMIN_GET_ALL_COUNTRIES);
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(ADMIN_GET_DASHBOARD_STATS);

  const [updateUserRole] = useMutation(ADMIN_UPDATE_USER_ROLE);
  const [updateUserStatus] = useMutation(ADMIN_UPDATE_USER_STATUS);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(ADMIN_UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(ADMIN_DELETE_CATEGORY);
  const [updateStoreStatus] = useMutation(ADMIN_UPDATE_STORE_STATUS);
  const [updateProductStatus] = useMutation(ADMIN_UPDATE_PRODUCT_STATUS);

  const [createStoreCategory] = useMutation(ADMIN_CREATE_STORE_CATEGORY);
  const [updateStoreCategory] = useMutation(ADMIN_UPDATE_STORE_CATEGORY);
  const [deleteStoreCategory] = useMutation(ADMIN_DELETE_STORE_CATEGORY);
  const [deleteUser] = useMutation(ADMIN_DELETE_USER);

  const [createCountry] = useMutation(ADMIN_CREATE_COUNTRY);
  const [updateCountry] = useMutation(ADMIN_UPDATE_COUNTRY);
  const [deleteCountry] = useMutation(ADMIN_DELETE_COUNTRY);

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

  const [openCreateStoreCatDialog, setOpenCreateStoreCatDialog] = useState(false);
  const [openEditStoreCatDialog, setOpenEditStoreCatDialog] = useState(false);
  const [newStoreCategoryName, setNewStoreCategoryName] = useState('');
  const [editStoreCategoryName, setEditStoreCategoryName] = useState('');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState(null);

  const [openCreateCountryDialog, setOpenCreateCountryDialog] = useState(false);
  const [openEditCountryDialog, setOpenEditCountryDialog] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryCurrencyCode, setNewCountryCurrencyCode] = useState('');
  const [newCountryCurrencySymbol, setNewCountryCurrencySymbol] = useState('');
  const [newCountryIsActive, setNewCountryIsActive] = useState(true);
  const [editCountryName, setEditCountryName] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('');
  const [editCountryCurrencyCode, setEditCountryCurrencyCode] = useState('');
  const [editCountryCurrencySymbol, setEditCountryCurrencySymbol] = useState('');
  const [editCountryIsActive, setEditCountryIsActive] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleUserMenuClick = (event, user) => { setAnchorElUser(event.currentTarget); setSelectedUser(user); };
  const handleUserMenuClose = () => { setAnchorElUser(null); setSelectedUser(null); };
  const handleStoreMenuClick = (event, store) => { setAnchorElStore(event.currentTarget); setSelectedStore(store); };
  const handleStoreMenuClose = () => { setAnchorElStore(null); setSelectedStore(null); };
  const handleProductMenuClick = (event, product) => { setAnchorElProduct(event.currentTarget); setSelectedProduct(product); };
  const handleProductMenuClose = () => { setAnchorElProduct(null); setSelectedProduct(null); };

  const handleRoleChange = async (newRole) => { try { await updateUserRole({ variables: { userId: selectedUser.id, role: newRole } }); refetchUsers(); } catch (err) { alert(`Failed to update role: ${err.message}`); } handleUserMenuClose(); };
  const handleUserStatusChange = async (newStatus) => { try { await updateUserStatus({ variables: { userId: selectedUser.id, status: newStatus } }); refetchUsers(); } catch (err) { alert(`Failed to update status: ${err.message}`); } handleUserMenuClose(); };
  const handleStoreStatusChange = async (newStatus) => { try { await updateStoreStatus({ variables: { storeId: selectedStore.id, status: newStatus } }); refetchStores(); } catch (err) { alert(`Failed to update status: ${err.message}`); } handleStoreMenuClose(); };
  const handleProductStatusChange = async (newStatus) => { try { await updateProductStatus({ variables: { productId: selectedProduct.id, status: newStatus } }); refetchProducts(); } catch (err) { alert(`Failed to update status: ${err.message}`); } handleProductMenuClose(); };
  const handleCreateCategory = async () => { try { await createCategory({ variables: { name: newCategoryName } }); setNewCategoryName(''); setOpenCreateDialog(false); refetchCategories(); } catch (err) { alert(`Failed to create category: ${err.message}`); } };
  const handleUpdateCategory = async () => { if (!selectedCategory) return; try { await updateCategory({ variables: { id: selectedCategory.id, name: editCategoryName } }); setOpenEditDialog(false); setEditCategoryName(''); setSelectedCategory(null); refetchCategories(); } catch (err) { alert(`Failed to update category: ${err.message}`); } };
  const handleDeleteCategory = async (id) => { if (window.confirm(t('areYouSureDeleteCategory'))) { try { await deleteCategory({ variables: { id } }); refetchCategories(); } catch (err) { alert(`Failed to delete category: ${err.message}`); } } };

  const handleCreateStoreCategory = async () => { try { await createStoreCategory({ variables: { name: newStoreCategoryName } }); setNewStoreCategoryName(''); setOpenCreateStoreCatDialog(false); refetchStoreCategories(); } catch (err) { alert(`Failed to create store category: ${err.message}`); } };
  const handleUpdateStoreCategory = async () => { if (!selectedStoreCategory) return; try { await updateStoreCategory({ variables: { id: selectedStoreCategory.id, name: editStoreCategoryName } }); setOpenEditStoreCatDialog(false); setEditStoreCategoryName(''); setSelectedStoreCategory(null); refetchStoreCategories(); } catch (err) { alert(`Failed to update store category: ${err.message}`); } };
  const handleDeleteStoreCategory = async (id) => { if (window.confirm(t('areYouSureDeleteCategory'))) { try { await deleteStoreCategory({ variables: { id } }); refetchStoreCategories(); } catch (err) { alert(`Failed to delete store category: ${err.message}`); } } };

  const handleDeleteUser = async (id) => {
    if (window.confirm(t('areYouSureDeleteUser'))) {
      try {
        await deleteUser({ variables: { userId: id } });
        refetchUsers();
        alert(t('userDeletedSuccessfully'));
      } catch (err) {
        alert(`Failed to delete user: ${err.message}`);
      }
    }
    handleUserMenuClose();
  };

  const handleCreateCountry = async () => {
    try {
      await createCountry({ variables: { name: newCountryName, code: newCountryCode, currencyCode: newCountryCurrencyCode, currencySymbol: newCountryCurrencySymbol, isActive: newCountryIsActive } });
      setNewCountryName('');
      setNewCountryCode('');
      setNewCountryCurrencyCode('');
      setNewCountryCurrencySymbol('');
      setNewCountryIsActive(true);
      setOpenCreateCountryDialog(false);
      refetchCountries();
    } catch (err) {
      alert(`Failed to create country: ${err.message}`);
    }
  };

  const handleUpdateCountry = async () => {
    if (!selectedCountry) return;
    try {
      await updateCountry({ variables: { id: selectedCountry.id, name: editCountryName, code: editCountryCode, currencyCode: editCountryCurrencyCode, currencySymbol: editCountryCurrencySymbol, isActive: editCountryIsActive } });
      setOpenEditCountryDialog(false);
      setEditCountryName('');
      setEditCountryCode('');
      setEditCountryCurrencyCode('');
      setEditCountryCurrencySymbol('');
      setEditCountryIsActive(true);
      setSelectedCountry(null);
      refetchCountries();
    } catch (err) {
      alert(`Failed to update country: ${err.message}`);
    }
  };

  const handleDeleteCountry = async (id) => {
    if (window.confirm(t('areYouSureDeleteCountry'))) {
      try {
        await deleteCountry({ variables: { id } });
        refetchCountries();
      } catch (err) {
        alert(`Failed to delete country: ${err.message}`);
      }
    }
  };

  if (usersLoading || storesLoading || productsLoading || ordersLoading || categoriesLoading || storeCategoriesLoading || countriesLoading || statsLoading) return <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /><Typography>{t('loadingAdminData')}</Typography></Container>;
  if (usersError || storesError || productsError || ordersError || categoriesError || storeCategoriesError || countriesError || statsError) return <Alert severity="error">Error loading data.</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>{t('adminDashboard')}</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6" color="textSecondary" gutterBottom>{t('totalUsers')}</Typography><Typography variant="h4">{statsData?.adminGetDashboardStats?.totalUsers || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6" color="textSecondary" gutterBottom>{t('totalStores')}</Typography><Typography variant="h4">{statsData?.adminGetDashboardStats?.totalStores || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6" color="textSecondary" gutterBottom>{t('totalProducts')}</Typography><Typography variant="h4">{statsData?.adminGetDashboardStats?.totalProducts || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6" color="textSecondary" gutterBottom>{t('totalOrders')}</Typography><Typography variant="h4">{statsData?.adminGetDashboardStats?.totalOrders || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6" color="textSecondary" gutterBottom>{t('totalSalesVolume')}</Typography><Typography variant="h4">${statsData?.adminGetDashboardStats?.totalSalesVolume?.toFixed(2) || '0.00'}</Typography></CardContent></Card></Grid>
      </Grid>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}><Tabs value={tabValue} onChange={handleTabChange}><Tab label={t('users')} /><Tab label={t('stores')} /><Tab label={t('products')} /><Tab label={t('orders')} /><Tab label={t('productCategories')} /><Tab label={t('storeCategories')} /><Tab label={t('countries')} /><Tab label={t('analytics')} /></Tabs></Box>
      <TabPanel value={tabValue} index={0}><Paper sx={{ p: 2 }}><Typography variant="h5">{t('users')} ({usersData?.adminGetAllUsers?.length || 0})</Typography><TableContainer><Table><TableHead><TableRow><TableCell>{t('id')}</TableCell><TableCell>{t('name')}</TableCell><TableCell>{t('emailAddress')}</TableCell><TableCell>{t('role')}</TableCell><TableCell>{t('verified')}</TableCell><TableCell>{t('status')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead><TableBody>{usersData?.adminGetAllUsers?.map(user => <TableRow key={user.id}><TableCell>{user.id}</TableCell><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.role}</TableCell><TableCell>{user.isVerified ? t('yes') : t('no')}</TableCell><TableCell>{user.status}</TableCell><TableCell align="right"><IconButton onClick={(e) => handleUserMenuClick(e, user)}><MoreVertIcon /></IconButton></TableCell></TableRow>)}</TableBody></Table></TableContainer></Paper></TabPanel>
      <TabPanel value={tabValue} index={1}><Paper sx={{ p: 2 }}><Typography variant="h5">{t('stores')} ({storesData?.adminGetAllStores?.length || 0})</Typography><TableContainer><Table><TableHead><TableRow><TableCell>{t('id')}</TableCell><TableCell>{t('name')}</TableCell><TableCell>{t('description')}</TableCell><TableCell>{t('owner')}</TableCell><TableCell>{t('status')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead><TableBody>{storesData?.adminGetAllStores?.map(store => <TableRow key={store.id}><TableCell>{store.id}</TableCell><TableCell>{store.name}</TableCell><TableCell>{store.description}</TableCell><TableCell>{store.owner.name}</TableCell><TableCell>{store.status}</TableCell><TableCell align="right"><IconButton onClick={(e) => handleStoreMenuClick(e, store)}><MoreVertIcon /></IconButton></TableCell></TableRow>)}</TableBody></Table></TableContainer></Paper></TabPanel>
      <TabPanel value={tabValue} index={2}><Paper sx={{ p: 2 }}><Typography variant="h5">{t('products')} ({productsData?.adminGetAllProducts?.length || 0})</Typography><TableContainer><Table><TableHead><TableRow><TableCell>{t('id')}</TableCell><TableCell>{t('name')}</TableCell><TableCell>{t('price')}</TableCell><TableCell>{t('stock')}</TableCell><TableCell>{t('store')}</TableCell><TableCell>{t('category')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead><TableBody>{productsData?.adminGetAllProducts?.map(product => <TableRow key={product.id}><TableCell>{product.id}</TableCell><TableCell>{product.name}</TableCell><TableCell>{product.price}</TableCell><TableCell>{product.stock}</TableCell><TableCell>{product.store.name}</TableCell><TableCell>{product.category.name}</TableCell><TableCell align="right"><IconButton onClick={(e) => handleProductMenuClick(e, product)}><MoreVertIcon /></IconButton></TableCell></TableRow>)}</TableBody></Table></TableContainer></Paper></TabPanel>
      <TabPanel value={tabValue} index={3}><Paper sx={{ p: 2 }}><Typography variant="h5">{t('orders')} ({ordersData?.adminGetAllOrders?.length || 0})</Typography><TableContainer><Table><TableHead><TableRow><TableCell>{t('id')}</TableCell><TableCell>{t('totalAmount')}</TableCell><TableCell>{t('status')}</TableCell><TableCell>{t('deliveryAddress')}</TableCell><TableCell>{t('customer')}</TableCell><TableCell>{t('store')}</TableCell><TableCell>{t('createdAt')}</TableCell></TableRow></TableHead><TableBody>{ordersData?.adminGetAllOrders?.map(order => <TableRow key={order.id}><TableCell>{order.id}</TableCell><TableCell>{order.totalAmount}</TableCell><TableCell>{order.status}</TableCell><TableCell>{order.deliveryAddress}</TableCell><TableCell>{order.customer.name}</TableCell><TableCell>{order.store.name}</TableCell><TableCell>{new Date(parseInt(order.createdAt)).toLocaleString()}</TableCell></TableRow>)}</TableBody></Table></TableContainer></Paper></TabPanel>
      <TabPanel value={tabValue} index={4}><Paper sx={{ p: 2 }}><Box display="flex" justifyContent="space-between" alignItems="center"><Typography variant="h5">{t('productCategories')} ({categoriesData?.getAllCategories?.length || 0})</Typography><Button variant="contained" onClick={() => setOpenCreateDialog(true)}>{t('createNewCategory')}</Button></Box><TableContainer><Table><TableHead><TableRow><TableCell>{t('id')}</TableCell><TableCell>{t('name')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead><TableBody>{categoriesData?.getAllCategories?.map(cat => <TableRow key={cat.id}><TableCell>{cat.id}</TableCell><TableCell>{cat.name}</TableCell><TableCell align="right"><IconButton onClick={() => { setSelectedCategory(cat); setEditCategoryName(cat.name); setOpenEditDialog(true); }}><EditIcon /></IconButton><IconButton onClick={() => handleDeleteCategory(cat.id)}><DeleteIcon /></IconButton></TableCell></TableRow>)}</TableBody></Table></TableContainer></Paper></TabPanel>
      <TabPanel value={tabValue} index={5}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{t('storeCategories')} ({storeCategoriesData?.getAllStoreCategories?.length || 0})</Typography>
            <Button variant="contained" onClick={() => setOpenCreateStoreCatDialog(true)}>{t('createNewStoreCategory')}</Button>
          </Box>
          <TableContainer><Table><TableHead><TableRow><TableCell>{t('id')}</TableCell><TableCell>{t('name')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead><TableBody>
            {storeCategoriesData?.getAllStoreCategories?.map(cat => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setSelectedStoreCategory(cat); setEditStoreCategoryName(cat.name); setOpenEditStoreCatDialog(true); }}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteStoreCategory(cat.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody></Table></TableContainer>
        </Paper>
      </TabPanel>
      <TabPanel value={tabValue} index={6}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{t('countries')} ({countriesData?.adminGetAllCountries?.length || 0})</Typography>
            <Button variant="contained" onClick={() => setOpenCreateCountryDialog(true)}>{t('createNewCountry')}</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('id')}</TableCell>
                  <TableCell>{t('name')}</TableCell>
                  <TableCell>{t('code')}</TableCell>
                  <TableCell>{t('currencyCode')}</TableCell>
                  <TableCell>{t('currencySymbol')}</TableCell>
                  <TableCell>{t('isActive')}</TableCell>
                  <TableCell align="right">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {countriesData?.adminGetAllCountries?.map(country => (
                  <TableRow key={country.id}>
                    <TableCell>{country.id}</TableCell>
                    <TableCell>{country.name}</TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{country.currencyCode}</TableCell>
                    <TableCell>{country.currencySymbol}</TableCell>
                    <TableCell>{country.isActive ? t('yes') : t('no')}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => { setSelectedCountry(country); setEditCountryName(country.name); setEditCountryCode(country.code); setEditCountryCurrencyCode(country.currencyCode); setEditCountryCurrencySymbol(country.currencySymbol); setEditCountryIsActive(country.isActive); setOpenEditCountryDialog(true); }}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteCountry(country.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
      <TabPanel value={tabValue} index={7}><AnalyticsDashboard /></TabPanel>
      <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleUserMenuClose}><MenuItem disabled>{t('changeRoleTo')}</MenuItem><MenuItem onClick={() => handleRoleChange('customer')}>{t('customer')}</MenuItem><MenuItem onClick={() => handleRoleChange('seller')}>{t('seller')}</MenuItem><MenuItem onClick={() => handleRoleChange('admin')}>{t('admin')}</MenuItem><MenuItem disabled>{t('changeStatusTo')}</MenuItem><MenuItem onClick={() => handleUserStatusChange('active')}>{t('active')}</MenuItem><MenuItem onClick={() => handleUserStatusChange('inactive')}>{t('inactive')}</MenuItem><MenuItem onClick={() => handleDeleteUser(selectedUser.id)}>{t('deleteUser')}</MenuItem></Menu>
      <Menu anchorEl={anchorElStore} open={Boolean(anchorElStore)} onClose={handleStoreMenuClose}><MenuItem disabled>{t('changeStatusTo')}</MenuItem><MenuItem onClick={() => handleStoreStatusChange('active')}>{t('active')}</MenuItem><MenuItem onClick={() => handleStoreStatusChange('inactive')}>{t('inactive')}</MenuItem></Menu>
      
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}><DialogTitle>{t('createNewCategory')}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label={t('categoryName')} type="text" fullWidth value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} /></DialogContent><DialogActions><Button onClick={() => setOpenCreateDialog(false)}>{t('cancel')}</Button><Button onClick={handleCreateCategory}>{t('create')}</Button></DialogActions></Dialog>
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}><DialogTitle>{t('editCategory')}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label={t('categoryName')} type="text" fullWidth value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} /></DialogContent><DialogActions><Button onClick={() => setOpenEditDialog(false)}>{t('cancel')}</Button><Button onClick={handleUpdateCategory}>{t('update')}</Button></DialogActions></Dialog>

      <Dialog open={openCreateStoreCatDialog} onClose={() => setOpenCreateStoreCatDialog(false)}><DialogTitle>{t('createNewStoreCategory')}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label={t('categoryName')} type="text" fullWidth value={newStoreCategoryName} onChange={(e) => setNewStoreCategoryName(e.target.value)} /></DialogContent><DialogActions><Button onClick={() => setOpenCreateStoreCatDialog(false)}>{t('cancel')}</Button><Button onClick={handleCreateStoreCategory}>{t('create')}</Button></DialogActions></Dialog>
      <Dialog open={openEditStoreCatDialog} onClose={() => setOpenEditStoreCatDialog(false)}><DialogTitle>{t('editStoreCategory')}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label={t('categoryName')} type="text" fullWidth value={editStoreCategoryName} onChange={(e) => setEditStoreCategoryName(e.target.value)} /></DialogContent><DialogActions><Button onClick={() => setOpenEditStoreCatDialog(false)}>{t('cancel')}</Button><Button onClick={handleUpdateStoreCategory}>{t('update')}</Button></DialogActions></Dialog>

      <Dialog open={openCreateCountryDialog} onClose={() => setOpenCreateCountryDialog(false)}><DialogTitle>{t('createNewCountry')}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label={t('countryName')} type="text" fullWidth value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} /><TextField margin="dense" label={t('countryCode')} type="text" fullWidth value={newCountryCode} onChange={(e) => setNewCountryCode(e.target.value)} /><TextField margin="dense" label={t('currencyCode')} type="text" fullWidth value={newCountryCurrencyCode} onChange={(e) => setNewCountryCurrencyCode(e.target.value)} /><TextField margin="dense" label={t('currencySymbol')} type="text" fullWidth value={newCountryCurrencySymbol} onChange={(e) => setNewCountryCurrencySymbol(e.target.value)} /><FormControlLabel control={<Switch checked={newCountryIsActive} onChange={(e) => setNewCountryIsActive(e.target.checked)} />} label={t('isActive')} /></DialogContent><DialogActions><Button onClick={() => setOpenCreateCountryDialog(false)}>{t('cancel')}</Button><Button onClick={handleCreateCountry}>{t('create')}</Button></DialogActions></Dialog>
      <Dialog open={openEditCountryDialog} onClose={() => setOpenEditCountryDialog(false)}><DialogTitle>{t('editCountry')}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label={t('countryName')} type="text" fullWidth value={editCountryName} onChange={(e) => setEditCountryName(e.target.value)} /><TextField margin="dense" label={t('countryCode')} type="text" fullWidth value={editCountryCode} onChange={(e) => setEditCountryCode(e.target.value)} /><TextField margin="dense" label={t('currencyCode')} type="text" fullWidth value={editCountryCurrencyCode} onChange={(e) => setEditCountryCurrencyCode(e.target.value)} /><TextField margin="dense" label={t('currencySymbol')} type="text" fullWidth value={editCountryCurrencySymbol} onChange={(e) => setEditCountryCurrencySymbol(e.target.value)} /><FormControlLabel control={<Switch checked={editCountryIsActive} onChange={(e) => setEditCountryIsActive(e.target.checked)} />} label={t('isActive')} /></DialogContent><DialogActions><Button onClick={() => setOpenEditCountryDialog(false)}>{t('cancel')}</Button><Button onClick={handleUpdateCountry}>{t('update')}</Button></DialogActions></Dialog>
    </Container>
  );
};

export default AdminDashboard;