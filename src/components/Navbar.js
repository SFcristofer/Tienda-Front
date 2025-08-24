
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useApolloClient, useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { AppBar, Toolbar, Button, Box, Badge, IconButton, Container, Avatar, Menu, MenuItem, Typography, TextField, Autocomplete, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language'; // Using a more appropriate icon
import NotificationCenter from './NotificationCenter';
import { ME_QUERY, GET_ALL_PRODUCTS, MY_NOTIFICATIONS_QUERY } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const client = useApolloClient();
  const token = localStorage.getItem('token');
  const { data } = useQuery(ME_QUERY, { skip: !token });
  const { getTotalItems } = useCart();

  const [notificationCount, setNotificationCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);

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
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <RouterLink to="/" style={{ textDecoration: 'none', flexGrow: 1 }}>
            <img src={logo} alt="UniShopp Logo" style={{ height: '50px', width: 'auto', verticalAlign: 'middle', borderRadius: '8px' }} />
          </RouterLink>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  <NotificationCenter onUnreadCountChange={setNotificationCount} />
                </Menu>
                <IconButton onClick={handleMenu} size="large"><Avatar sx={{ bgcolor: 'secondary.main' }}>{user.name?.charAt(0).toUpperCase()}</Avatar></IconButton>
                <Menu id="menu-appbar" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>{t('profile')}</MenuItem>
                                    {user.role !== 'customer' && <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>{t('dashboard')}</MenuItem>}
                  {user.role === 'admin' && <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>{t('adminDashboard')}</MenuItem>}
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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
