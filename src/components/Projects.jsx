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
    alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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

const ProjectCard = styled(Paper)(({ theme }) => ({
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

const ProjectCardHeader = styled(Box)(({ theme, status }) => {
    // Status color mapping
    const colors = {
        'Not Started': theme.palette.info.main,
        'In Progress': theme.palette.success.main,
        'Completed': theme.palette.primary.main,
        'On Hold': theme.palette.warning.main,
        'Cancelled': theme.palette.error.main,
    };

    const bgColor = colors[status] || theme.palette.primary.main;

    return {
        backgroundColor: bgColor,
        color: theme.palette.common.white,
        padding: theme.spacing(2),
        position: 'relative',
        overflow: 'hidden',
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
    };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
    // Status color and icon mapping
    const statusConfig = {
        'Not Started': { color: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.1) },
        'In Progress': { color: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.1) },
        'Completed': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) },
        'On Hold': { color: theme.palette.warning.main, bgcolor: alpha(theme.palette.warning.main, 0.1) },
        'Cancelled': { color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) }
    };

    const config = statusConfig[status] || statusConfig['Not Started'];

    return {
        fontWeight: 500,
        color: config.color,
        backgroundColor: config.bgcolor,
        '& .MuiChip-label': {
            padding: '0 8px'
        }
    };
});

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

const Projects = () => {
    // State initialization
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [refreshing, setRefreshing] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Function to fetch data
    const fetchData = async () => {
        setRefreshing(true);
        try {
            const response = await AxiosInstance.get('api/project/');
            setMyData(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setNotification({
                open: true,
                message: 'Failed to load projects. Please try again.',
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
    const handleOpenDeleteDialog = (project) => {
        setProjectToDelete(project);
        setOpenDeleteDialog(true);
        setDeleteConfirmText('');
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setProjectToDelete(null);
        setDeleteConfirmText('');
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            await AxiosInstance.delete(`api/project/${projectToDelete.id}/`);
            setNotification({
                open: true,
                message: `Project "${projectToDelete.name}" has been deleted`,
                severity: 'success'
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting project:', error);
            setNotification({
                open: true,
                message: 'Failed to delete project. Please try again.',
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

    // Columns configuration for the table
    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Project Name',
                size: 180,
                Cell: ({ cell }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="primary" fontSize="small" />
                        <Typography fontWeight={500}>{cell.getValue()}</Typography>
                    </Box>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                size: 150,
                Cell: ({ cell }) => (
                    <StatusChip
                        label={cell.getValue()}
                        status={cell.getValue()}
                        size="small"
                    />
                ),
            },
            {
                accessorKey: 'description',
                header: 'Description',
                size: 200,
                Cell: ({ cell }) => (
                    <Tooltip title={cell.getValue()} placement="top">
                        <Typography
                            variant="body2"
                            sx={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px'
                            }}
                        >
                            {cell.getValue()}
                        </Typography>
                    </Tooltip>
                ),
            },
            {
                accessorKey: 'budget',
                header: 'Budget',
                size: 150,
                Cell: ({ cell }) => (
                    <Typography fontWeight={500} color="primary.main">
                        {formatCurrency(cell.getValue())}
                    </Typography>
                ),
            },
            {
                accessorFn: (row) => row.start_date ? Dayjs(row.start_date).format('DD-MM-YYYY') : 'Not set',
                header: 'Start Date',
                size: 120,
            },
            {
                accessorFn: (row) => row.end_date ? Dayjs(row.end_date).format('DD-MM-YYYY') : 'Not set',
                header: 'End Date',
                size: 120,
            }
        ],
        []
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

    // Render the component
    return (
        <Box>
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <HeaderContainer>
                    <BusinessIcon sx={{ mr: 2, fontSize: 28 }} />
                    <Box sx={{ zIndex: 1 }}>
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            Projects Management
                        </Typography>
                        <Typography variant="subtitle2">
                            Create, manage and track all your organization's projects
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
                    <Tooltip title="Refresh Projects">
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
                    to="/CreateProject"
                    startIcon={<AddIcon />}
                >
                    Create New Project
                </ActionButton>
            </Box>

            {/* Main Content */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
                    <CircularProgress size={50} color="primary" />
                    <Typography variant="body1" color="text.secondary">
                        Loading projects...
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
                    <Typography variant="h6" gutterBottom>No projects found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Get started by creating your first project
                    </Typography>
                    <ActionButton
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/CreateProject"
                        startIcon={<AddIcon />}
                    >
                        Create New Project
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
                                <Tooltip title="View/Edit Project">
                                    <IconButton
                                        color="primary"
                                        component={Link}
                                        to={`/projects/edit/${row.original.id}`}
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Project">
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
                        {myData.map((project) => (
                            <motion.div key={project.id} variants={itemVariants}>
                                <ProjectCard>
                                    <ProjectCardHeader status={project.status}>
                                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                                            <Typography variant="h6" fontWeight="bold" noWrap>
                                                {project.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                {project.start_date ? Dayjs(project.start_date).format('DD MMM YYYY') : 'No start date'}
                                                {' — '}
                                                {project.end_date ? Dayjs(project.end_date).format('DD MMM YYYY') : 'No end date'}
                                            </Typography>
                                        </Box>
                                    </ProjectCardHeader>

                                    <Box sx={{ p: 2, flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <StatusChip
                                                label={project.status}
                                                status={project.status}
                                                size="small"
                                            />
                                            <Chip
                                                icon={<AttachMoneyIcon fontSize="small" />}
                                                label={formatCurrency(project.budget)}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                height: '60px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {project.description}
                                        </Typography>
                                    </Box>

                                    <Box sx={{
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
                                            to={`/projects/edit/${project.id}`}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleOpenDeleteDialog(project)}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </ProjectCard>
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
                        Delete Project
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText>
                        Are you sure you want to delete "{projectToDelete?.name}"? This action <strong>cannot</strong> be undone.
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
                        onClick={handleDeleteProject}
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

export default Projects;