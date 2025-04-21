import React, { useEffect, useMemo, useState } from 'react';
import AxiosInstance from './Axios.jsx';
import { MaterialReactTable } from 'material-react-table';
import Dayjs from "dayjs";
import {
    Box,
    IconButton,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Chip,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Snackbar,
    Alert,
    useTheme,
    alpha,
    Avatar,
    Card,
    CardContent,
    CardActions,
    Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PublicIcon from '@mui/icons-material/Public';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';

// Styled components
const HeaderContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: theme.spacing(2, 3),
    borderRadius: '8px',
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
        zIndex: 0,
    }
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    fontWeight: 600,
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
    },
    '&:active': {
        transform: 'translateY(0)',
    }
}));

const MemberCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.12)',
    }
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
    width: 70,
    height: 70,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: '1.8rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: `3px solid ${theme.palette.background.paper}`,
    margin: '-50px auto 10px auto',
    position: 'relative',
    zIndex: 1
}));

const RoleChip = styled(Chip)(({ theme, role }) => {
    // Role color mapping
    const roleMap = {
        'Président': { color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) },
        'Secrétaire générale': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) },
        'Trésorier': { color: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.1) },
        'Membre': { color: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.1) }
    };

    const roleStyle = roleMap[role] || { color: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.1) };

    return {
        fontWeight: 500,
        color: roleStyle.color,
        backgroundColor: roleStyle.bgcolor,
        '& .MuiChip-label': {
            padding: '0 8px'
        }
    };
});

const MemberCardHeader = styled(Box)(({ theme }) => ({
    backgroundImage: 'linear-gradient(135deg, #00897B, #00695C)',
    height: 80,
    width: '100%',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 80%)',
        zIndex: 0,
    }
}));

const Members = () => {
    // State initialization
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [refreshing, setRefreshing] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Function to fetch data
    const fetchData = async () => {
        setRefreshing(true);
        try {
            const response = await AxiosInstance.get('/api/member/');
            setMyData(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
            setNotification({
                open: true,
                message: 'Failed to load members. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch data on component mount or when coming back to page
    useEffect(() => {
        fetchData();

        // Check for success message from create/edit/delete
        if (location.state?.success) {
            setNotification({
                open: true,
                message: location.state.message || 'Operation completed successfully',
                severity: 'success'
            });

            // Clear location state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname]);

    // Handle delete dialog
    const handleOpenDeleteDialog = (member) => {
        setMemberToDelete(member);
        setOpenDeleteDialog(true);
        setDeleteConfirmText('');
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setMemberToDelete(null);
        setDeleteConfirmText('');
    };

    const handleDeleteMember = async () => {
        if (!memberToDelete) return;

        try {
            await AxiosInstance.delete(`/api/member/${memberToDelete.id}/`);
            setNotification({
                open: true,
                message: `Member "${memberToDelete.name}" has been deleted`,
                severity: 'success'
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting member:', error);
            setNotification({
                open: true,
                message: 'Failed to delete member. Please try again.',
                severity: 'error'
            });
        }

        handleCloseDeleteDialog();
    };

    // Handle notification close
    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    // Helper function to get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Columns configuration for the table
    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                size: 170,
                Cell: ({ cell, row }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 36,
                                height: 36
                            }}
                        >
                            {getInitials(cell.getValue())}
                        </Avatar>
                        <Box>
                            <Typography fontWeight={500}>{cell.getValue()}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {row.original.email}
                            </Typography>
                        </Box>
                    </Box>
                ),
            },
            {
                accessorKey: 'role',
                header: 'Role',
                size: 150,
                Cell: ({ cell }) => (
                    <RoleChip
                        label={cell.getValue() || 'Member'}
                        role={cell.getValue()}
                        size="small"
                    />
                ),
            },
            {
                accessorKey: 'job',
                header: 'Job',
                size: 150,
                Cell: ({ cell }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="action" />
                        <Typography variant="body2">{cell.getValue() || '-'}</Typography>
                    </Box>
                ),
            },
            {
                accessorKey: 'nationality',
                header: 'Nationality',
                size: 130,
                Cell: ({ cell }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PublicIcon fontSize="small" color="action" />
                        <Typography variant="body2">{cell.getValue() || '-'}</Typography>
                    </Box>
                ),
            },
            {
                accessorFn: (row) => row.birth_date ? Dayjs(row.birth_date).format('DD-MM-YYYY') : '-',
                header: 'Birth Date',
                size: 120,
                Cell: ({ cell }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CakeIcon fontSize="small" color="action" />
                        <Typography variant="body2">{cell.getValue()}</Typography>
                    </Box>
                ),
            },
            {
                accessorFn: (row) => row.joining_date ? Dayjs(row.joining_date).format('DD-MM-YYYY') : '-',
                header: 'Joined',
                size: 120,
                Cell: ({ cell }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2">{cell.getValue()}</Typography>
                    </Box>
                ),
            }
        ],
        [theme]
    );

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3 }
        }
    };

    return (
        <Box>
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <HeaderContainer>
                    <PersonIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box sx={{ zIndex: 1 }}>
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            Members Management
                        </Typography>
                        <Typography variant="subtitle2">
                            Manage your organization's members information
                        </Typography>
                    </Box>
                    {/* Decorative circles */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            zIndex: 0
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -30,
                            right: 100,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            zIndex: 0
                        }}
                    />
                </HeaderContainer>
            </motion.div>

            {/* Action Bar */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: 2
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Grid View">
                        <IconButton
                            color={viewMode === 'grid' ? 'primary' : 'default'}
                            onClick={() => setViewMode('grid')}
                            sx={{
                                bgcolor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                            }}
                        >
                            <GridViewIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Table View">
                        <IconButton
                            color={viewMode === 'table' ? 'primary' : 'default'}
                            onClick={() => setViewMode('table')}
                            sx={{
                                bgcolor: viewMode === 'table' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                            }}
                        >
                            <ViewListIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh Members">
                        <IconButton
                            onClick={fetchData}
                            disabled={refreshing}
                            sx={{
                                ml: 1,
                                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' }
                                }
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <ActionButton
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/CreateMember"
                    startIcon={<AddIcon />}
                >
                    Add New Member
                </ActionButton>
            </Box>

            {/* Main Content */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
                    <CircularProgress size={50} color="primary" />
                    <Typography variant="body1" color="text.secondary">
                        Loading members...
                    </Typography>
                </Box>
            ) : myData.length === 0 ? (
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: '12px',
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        border: `1px dashed ${theme.palette.divider}`
                    }}
                >
                    <Typography variant="h6" gutterBottom>No members found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Get started by adding your first organization member
                    </Typography>
                    <ActionButton
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/CreateMember"
                        startIcon={<AddIcon />}
                    >
                        Add New Member
                    </ActionButton>
                </Paper>
            ) : viewMode === 'table' ? (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <MaterialReactTable
                        columns={columns}
                        data={myData}
                        enableRowActions
                        muiTablePaperProps={{
                            elevation: 0,
                            sx: {
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: `1px solid ${theme.palette.divider}`
                            },
                        }}
                        muiTableHeadProps={{
                            sx: {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }
                        }}
                        muiTableBodyRowProps={({ row }) => ({
                            sx: {
                                transition: 'background-color 0.2s ease',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                },
                            },
                        })}
                        renderRowActions={({ row }) => (
                            <Box sx={{ display: 'flex', gap: '8px' }}>
                                <Tooltip title="View/Edit Member">
                                    <IconButton
                                        color="primary"
                                        component={Link}
                                        to={`/member/editmember/${row.original.id}`}
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Member">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleOpenDeleteDialog(row.original)}
                                        sx={{
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    />
                </motion.div>
            ) : (
                /* Grid View */
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(4, 1fr)'
                            },
                            gap: 3
                        }}
                    >
                        {myData.map((member) => (
                            <motion.div key={member.id} variants={itemVariants}>
                                <MemberCard>
                                    <MemberCardHeader />

                                    <MemberAvatar>
                                        {getInitials(member.name)}
                                    </MemberAvatar>

                                    <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {member.name}
                                        </Typography>

                                        <RoleChip
                                            label={member.role || 'Member'}
                                            role={member.role}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}>
                                            <WorkIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {member.job || 'No job specified'}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}>
                                            <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {member.email}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                                            <Chip
                                                icon={<PublicIcon fontSize="small" />}
                                                label={member.nationality}
                                                size="small"
                                                sx={{ bgcolor: alpha(theme.palette.background.default, 0.8) }}
                                            />
                                            <Chip
                                                icon={<EventIcon fontSize="small" />}
                                                label={member.joining_date ? Dayjs(member.joining_date).format('DD/MM/YYYY') : 'No date'}
                                                size="small"
                                                sx={{ bgcolor: alpha(theme.palette.background.default, 0.8) }}
                                            />
                                        </Box>
                                    </CardContent>

                                    <Box sx={{ flexGrow: 1 }} />

                                    <CardActions sx={{
                                        p: 2,
                                        pt: 0,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        borderTop: `1px solid ${theme.palette.divider}`
                                    }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            component={Link}
                                            to={`/member/editmember/${member.id}`}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleOpenDeleteDialog(member)}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            Delete
                                        </Button>
                                    </CardActions>
                                </MemberCard>
                            </motion.div>
                        ))}
                    </Box>
                </motion.div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <WarningAmberIcon color="error" />
                    <Typography variant="h6" component="span" color="error.main">
                        Delete Member
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText>
                        Are you sure you want to delete "{memberToDelete?.name}"? This action <strong>cannot</strong> be undone.
                    </DialogContentText>
                    <DialogContentText sx={{ mt: 2, mb: 1 }}>
                        Type <strong>delete</strong> to confirm:
                    </DialogContentText>
                    <TextField
                        fullWidth
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type 'delete' here"
                        variant="outlined"
                        error={deleteConfirmText.length > 0 && deleteConfirmText !== 'delete'}
                        helperText={deleteConfirmText.length > 0 && deleteConfirmText !== 'delete' ?
                            "Please type 'delete' exactly to confirm" : ""}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteMember}
                        color="error"
                        variant="contained"
                        disabled={deleteConfirmText !== 'delete'}
                        sx={{
                            borderRadius: '8px',
                            px: 3
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ borderRadius: '8px' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Members;