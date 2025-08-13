import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useApolloClient, useLazyQuery } from '@apollo/client';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Badge,
  IconButton,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications'; // Added import
import axios from 'axios'; // Import axios
import NotificationCenter from './NotificationCenter'; // New import
import { ME_QUERY, GET_ALL_PRODUCTS } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png'; // Importa el logo

const Navbar = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const token = localStorage.getItem('token');
  const { data } = useQuery(ME_QUERY, {
    skip: !token,
    onError: (err) => {
      console.warn('ME_QUERY error (handled in Navbar):', err.message);
    },
  });
  console.log('Navbar - token:', token);
  console.log('Navbar - user data:', data?.me);
  const { getTotalItems } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const [options, setOptions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // New state for notification count

  const [getProducts, { loading: queryLoading }] = useLazyQuery(GET_ALL_PRODUCTS);

  // Effect to fetch notifications
  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setNotificationCount(0);
        return;
      }
      try {
        const res = await axios.get('https://store-ehnr.onrender.com/api/notifications', {
          headers: {
            'x-auth-token': token,
          },
        });
        const unreadCount = res.data.filter(notif => !notif.isRead).length;
        setNotificationCount(unreadCount);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotificationCount(0);
      }
    };

    fetchNotifications(); // Fetch initially

    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [token]); // Re-run when token changes

  React.useEffect(() => {
    let active = true;

    if (searchTerm === '') {
      setOptions([]);
      setLoadingSearch(false); // Ensure loading is false when search term is empty
      return undefined;
    }

    setLoadingSearch(true);

    const timer = setTimeout(async () => {
      const { data } = await getProducts({
        variables: { search: searchTerm },
      });

      if (active) {
        setOptions(data?.getAllProducts || []);
        setLoadingSearch(false);
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(timer);
      active = false;
    };
  }, [searchTerm, getProducts]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null); // New state for notification menu

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuClick = (event) => { // New handler
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => { // New handler
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    navigate('/');
    try {
      await client.clearStore(); // Limpia el caché inmediatamente
      await client.resetStore(); // Luego reinicia y refetch las consultas activas (que ahora deberían ser saltadas)
    } catch (error) {
      console.warn('Error during Apollo store reset after logout:', error);
    }
    handleClose(); // Cierra el menú después de cerrar sesión
  };

  const user = data?.me;

  return (
    <AppBar
      position="sticky"
      sx={{ bgcolor: 'background.paper', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <RouterLink to="/" style={{ textDecoration: 'none', flexGrow: 1 }}>
            <img
              src={logo}
              alt="LaPlaza Logo"
              style={{ height: '40px', verticalAlign: 'middle' }}
            />
          </RouterLink>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Autocomplete
              id="product-search"
              sx={{ width: 300, mr: 2 }}
              open={openSearch}
              onOpen={() => setOpenSearch(true)}
              onClose={() => setOpenSearch(false)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option.name}
              options={options}
              loading={loadingSearch || queryLoading}
              noOptionsText={searchTerm === '' ? 'Start typing to search' : 'No products found'}
              onChange={(event, value) => {
                if (value) {
                  navigate(`/products/${value.id}`);
                  setSearchTerm(''); // Clear search term after selection
                  setOptions([]); // Clear options
                }
              }}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search products..."
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loadingSearch || queryLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            {user ? (
              <>
                <Button component={RouterLink} to="/" sx={{ color: 'text.primary' }}>
                  Home
                </Button>
                <Button component={RouterLink} to="/stores" sx={{ color: 'text.primary' }}>
                  Stores
                </Button>
                <IconButton component={RouterLink} to="/cart" color="secondary">
                  <Badge badgeContent={getTotalItems()} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
                {/* Notification Bell Icon */}
                <IconButton
                  color="secondary" // Changed color to secondary
                  aria-label="show notifications"
                  onClick={handleNotificationMenuClick} // New handler
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <NotificationCenter
                  anchorEl={notificationAnchorEl} // New state
                  open={Boolean(notificationAnchorEl)} // New state
                  handleClose={handleNotificationMenuClose} // New handler
                  onNotificationCountChange={setNotificationCount} // Pass setter to update Navbar's count
                />
                <IconButton
                  onClick={handleMenu}
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  color="inherit"
                >
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : ''}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem
                    onClick={() => {
                      navigate('/profile');
                      handleClose();
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate('/dashboard');
                      handleClose();
                    }}
                  >
                    Dashboard
                  </MenuItem>
                  {user && user.role === 'admin' && (
                    <MenuItem
                      onClick={() => {
                        navigate('/admin');
                        handleClose();
                      }}
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/stores" sx={{ color: 'text.primary' }}>
                  Stores
                </Button>
                <Button variant="outlined" color="secondary" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button variant="contained" color="secondary" component={RouterLink} to="/register">
                  Register
                </Button>
                <IconButton component={RouterLink} to="/cart" color="secondary">
                  <Badge badgeContent={getTotalItems()} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
