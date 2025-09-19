import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

import logo from '../assets/logo.png';

function Navbar() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for user menu
  const [anchorElUser, setAnchorElUser] = useState(null);
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Inicio', path: '/', icon: <HomeIcon /> },
    { text: 'Productos', path: '/products', icon: <CategoryIcon /> },
    { text: 'Tiendas', path: '/stores', icon: <StorefrontIcon /> },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }} role="presentation">
      <Typography variant="h6" sx={{ my: 2 }}>
        UniShopp
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} component={RouterLink} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
        <Toolbar>
          {/* Hamburger Menu */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img src={logo} alt="UniShopp Logo" style={{ height: '40px', marginRight: '10px' }} />
          </Typography>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{ color: 'black' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Cart and User/Auth Section */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <IconButton component={RouterLink} to="/cart" size="large" color="inherit">
              <Badge badgeContent={0} color="error"> {/* TODO: Connect to CartContext */}
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {isLoggedIn ? (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
                  <AccountCircleIcon sx={{ fontSize: 30 }} />
                </IconButton>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem disabled>
                    <Typography textAlign="center" sx={{ fontWeight: 'bold' }}>
                      {user?.name || user?.email}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                    <ListItemIcon><AccountBoxIcon fontSize="small" /></ListItemIcon>
                    Perfil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Button component={RouterLink} to="/register" color="inherit" startIcon={<AppRegistrationIcon />}>
                  Registrar
                </Button>
                <Button component={RouterLink} to="/login" color="inherit" startIcon={<LoginIcon />}>
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;