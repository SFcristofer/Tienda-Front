
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useApolloClient, useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { AppBar, Toolbar, Button, Box, Badge, IconButton, Container, Avatar, Menu, MenuItem, Typography, TextField, Autocomplete, CircularProgress, useMediaQuery, Drawer, List, ListItemButton, ListItemText, ListItemIcon, Divider, FormControl, InputLabel, Select } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language'; // Using a more appropriate icon
import MenuIcon from '@mui/icons-material/Menu';
import NotificationCenter from './NotificationCenter';
import { ME_QUERY, MY_NOTIFICATIONS_QUERY, GET_AVAILABLE_STORE_COUNTRIES } from '../graphql/queries'; // Added GET_AVAILABLE_STORE_COUNTRIES
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext'; // Import useRegion hook
import logo from '../assets/logo.png';
import theme from '../theme';

const countryNames = {
  US: 'United States',
  MX: 'Mexico',
  NI: 'Nicaragua',
  CA: 'Canada',
};

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const client = useApolloClient();
  const token = localStorage.getItem('token');
  const { data } = useQuery(ME_QUERY, { skip: !token });
  const { country, setRegion } = useRegion(); // Get country and setRegion from RegionContext
  const { getTotalItems } = useCart();

  const { data: countriesData } = useQuery(GET_AVAILABLE_STORE_COUNTRIES); // Fetch available countries

  const availableCountries = countriesData?.getAvailableStoreCountries || [];

  console.log('Current selected country (from context):', country);
  console.log('Available countries:', availableCountries);

  const handleCountryChange = (event) => {
    const newCountry = event.target.value;
    setRegion(newCountry);
    localStorage.setItem('userCountry', newCountry); // Save preference
  };

  const [notificationCount, setNotificationCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false); // New state for drawer
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // New media query

  // Fetch notifications for the badge count
  const { data: notificationsData } = useQuery(MY_NOTIFICATIONS_QUERY, {
    skip: !token || !data?.me, // Skip if not logged in
    onCompleted: (data) => {
      const unread = data?.myNotifications.filter(n => !n.isRead).length || 0;
      setNotificationCount(unread);
    },
    pollInterval: 30000, // Poll every 30 seconds for new notifications
  });

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNotificationMenuClick = (event) => setNotificationAnchorEl(event.currentTarget);
  const handleNotificationMenuClose = () => setNotificationAnchorEl(null);

  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    handleLanguageMenuClose();
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    navigate('/');
    await client.resetStore();
    handleClose();
  };

  const user = data?.me;

  return (
    <>
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <RouterLink to="/" style={{ textDecoration: 'none', flexGrow: 1 }}>
            <img src={logo} alt="UniShopp Logo" style={{ height: '80px', width: 'auto', verticalAlign: 'middle', borderRadius: '8px' }} />
          </RouterLink>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ ml: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {country && (
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mr: 1 }}>
                  {countryNames[country] || country}
                </Typography>
              )}
              {user ? (
                <>
                  <Button component={RouterLink} to="/" sx={{ color: 'text.primary' }}>{t('home')}</Button>
                  <Button component={RouterLink} to="/products" sx={{ color: 'text.primary' }}>{t('products')}</Button>
                  <Button component={RouterLink} to="/stores" sx={{ color: 'text.primary' }}>{t('stores')}</Button>
                  <IconButton component={RouterLink} to="/cart" color="secondary"><Badge badgeContent={getTotalItems()} color="error"><ShoppingCartIcon /></Badge></IconButton>
                  <IconButton color="secondary" onClick={handleNotificationMenuClick}>
                    <Badge badgeContent={notificationCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <Menu
                    anchorEl={notificationAnchorEl}
                    open={Boolean(notificationAnchorEl)}
                    onClose={handleNotificationMenuClose}
                    PaperProps={{
                      style: {
                        maxHeight: 400,
                        width: '30ch',
                      },
                    }}
                  >
                    <NotificationCenter onUnreadCountChange={setNotificationCount} userRole={user?.role} />
                  </Menu>
                  <IconButton onClick={handleMenu} size="large"><Avatar sx={{ bgcolor: 'secondary.main' }}>{user.name?.charAt(0).toUpperCase()}</Avatar></IconButton>
                  <Menu id="menu-appbar" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>{t('profile')}</MenuItem>
                                        {user.role !== 'customer' && <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>{t('dashboard')}</MenuItem>}
                    {user.role === 'admin' && <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>{t('adminDashboard')}</MenuItem>}
                    {user.role === 'admin' && <MenuItem onClick={() => { navigate('/admin/monetization'); handleClose(); }}>{t('monetizationPanel')}</MenuItem>}
                    <MenuItem onClick={handleLogout}>{t('logout')}</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/products" sx={{ color: 'text.primary' }}>{t('products')}</Button>
                  <Button component={RouterLink} to="/stores" sx={{ color: 'text.primary' }}>{t('stores')}</Button>
                  <Button variant="outlined" color="secondary" component={RouterLink} to="/login">{t('login')}</Button>
                  <Button variant="contained" color="secondary" component={RouterLink} to="/register">{t('register')}</Button>
                  <IconButton component={RouterLink} to="/cart" color="secondary"><Badge badgeContent={getTotalItems()} color="error"><ShoppingCartIcon /></Badge></IconButton>
                </>
              )}
              {/* Country Selector */}
              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="country-select-label" sx={{ color: 'text.primary' }}>{t('country')}</InputLabel>
                <Select
                  labelId="country-select-label"
                  value={country || ''}
                  onChange={handleCountryChange}
                  label={t('country')}
                  sx={{ color: 'text.primary', '& .MuiSelect-icon': { color: 'text.primary' } }}
                  renderValue={(selected) => countryNames[selected] || selected} // Render the full country name or code
                >
                  {availableCountries.map((code) => (
                    <MenuItem key={code} value={code}>
                      {countryNames[code] || code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* End Country Selector */}
              <Box>
                <Button
                  onClick={handleLanguageMenuOpen}
                  color="secondary"
                  sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                  startIcon={<LanguageIcon />}
                >
                  {i18n.language.split('-')[0]}
                </Button>
                <Menu
                  anchorEl={languageAnchorEl}
                  open={Boolean(languageAnchorEl)}
                  onClose={handleLanguageMenuClose}
                >
                  <MenuItem onClick={() => handleLanguageChange('en')} selected={i18n.language === 'en'}>EN</MenuItem>
                  <MenuItem onClick={() => handleLanguageChange('es-MX')} selected={i18n.language === 'es-MX'}>ES</MenuItem>
                </Menu>
              </Box>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            {user ? (
              <>
                <ListItemButton component={RouterLink} to="/">
                  <ListItemText primary={t('home')} />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/products">
                  <ListItemText primary={t('products')} />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/stores">
                  <ListItemText primary={t('stores')} />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/cart">
                  <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                  <ListItemText primary={t('cart')} />
                </ListItemButton>
                <ListItemButton onClick={handleNotificationMenuClick}>
                  <ListItemIcon><NotificationsIcon /></ListItemIcon>
                  <ListItemText primary={t('notifications')} />
                </ListItemButton>
                <ListItemButton onClick={() => navigate('/profile')}>
                  <ListItemText primary={t('profile')} />
                </ListItemButton>
                {user.role !== 'customer' && (
                  <ListItemButton onClick={() => navigate('/dashboard')}>
                    <ListItemText primary={t('dashboard')} />
                  </ListItemButton>
                )}
                {user.role === 'admin' && (
                  <ListItemButton onClick={() => navigate('/admin')}>
                    <ListItemText primary={t('adminDashboard')} />
                  </ListItemButton>
                )}
                {user.role === 'admin' && (
                  <ListItemButton onClick={() => navigate('/admin/monetization')}>
                    <ListItemText primary={t('monetizationPanel')} />
                  </ListItemButton>
                )}
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary={t('logout')} />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton component={RouterLink} to="/products">
                  <ListItemText primary={t('products')} />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/stores">
                  <ListItemText primary={t('stores')} />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/login">
                  <ListItemText primary={t('login')} />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/register">
                  <ListItemText primary={t('register')} />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/cart">
                  <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                  <ListItemText primary={t('cart')} />
                </ListItemButton>
              </>
            )}
            <Divider />
            <ListItemButton onClick={handleLanguageMenuOpen}>
              <ListItemIcon><LanguageIcon /></ListItemIcon>
              <ListItemText primary={t('language')} />
            </ListItemButton>
            <Menu
              anchorEl={languageAnchorEl}
              open={Boolean(languageAnchorEl)}
              onClose={handleLanguageMenuClose}
            >
              <MenuItem onClick={() => handleLanguageChange('en')} selected={i18n.language === 'en'}>EN</MenuItem>
              <MenuItem onClick={() => handleLanguageChange('es-MX')} selected={i18n.language === 'es-MX'}>ES</MenuItem>
            </Menu>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
