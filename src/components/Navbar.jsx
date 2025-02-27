import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from '@mui/material';
import logo from '../assets/logowhite.png';
import Axios from './Axios'; // Assuming you have an Axios instance to manage API calls

export default function NavBar(props) {
    const { drawerWidth, content } = props;
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Assuming user's name is stored in localStorage after login
        const storedUser = localStorage.getItem('userName');
        if (storedUser) {
            setUserName(storedUser);
        }
    }, []);

    const handleLogout = () => {
        // Call API to log out from the server (optional)
        Axios.post('/users/logout/')
            .then(() => {
                // Clear local storage items (including the token)
                localStorage.removeItem('userName');
                localStorage.removeItem('token'); // Remove the authentication token
                navigate('/'); // Redirect to login page
            })
            .catch((error) => {
                console.error('Logout failed:', error);
                // Handle logout failure (optional)
                localStorage.removeItem('userName');
                localStorage.removeItem('token');
                navigate('/');
            });
    };

    const changeOpenStatus = () => {
        setOpen(!open);
    };

    const myDrawer = (
        <div>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/home" selected={"/home" === path}>
                            <ListItemIcon><HomeIcon /></ListItemIcon>
                            <ListItemText primary={"Home"} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/about" selected={"/about" === path}>
                            <ListItemIcon><InfoIcon /></ListItemIcon>
                            <ListItemText primary={"About"} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/members" selected={"/members" === path}>
                            <ListItemIcon><GroupIcon /></ListItemIcon>
                            <ListItemText primary={"Members"} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/projects" selected={"/projects" === path}>
                            <ListItemIcon><BusinessIcon /></ListItemIcon>
                            <ListItemText primary={"Projects"} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/finance" selected={"/finance" === path}>
                            <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
                            <ListItemText primary={"Finance"} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ backgroundColor: '#00897B', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" onClick={changeOpenStatus} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <img src={logo} alt="Logo" style={{ height: 60, marginRight: 15 }} />
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        myOrg
                    </Typography>

                    {userName && (
                        <Typography variant="h6" sx={{ marginRight: 2 }}>
                            {userName}
                        </Typography>
                    )}

                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Permanent Drawer for larger screens */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                {myDrawer}
            </Drawer>

            {/* Temporary Drawer for smaller screens */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={changeOpenStatus}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                {myDrawer}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {content}
            </Box>
        </Box>
    );
}
