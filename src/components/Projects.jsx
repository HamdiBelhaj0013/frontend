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

// Import permission components
import { PermissionRequired } from '../contexts/ConditionalUI.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { secureApi } from '../utils/secureApi.js';

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
        'Non commencé': theme.palette.info.main,
        'En cours': theme.palette.success.main,
        'Terminé': theme.palette.primary.main,
        'En pause': theme.palette.warning.main,
        'Annulé': theme.palette.error.main,
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
        'Non commencé': { color: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.1) },
        'En cours': { color: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.1) },
        'Terminé': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) },
        'En pause': { color: theme.palette.warning.main, bgcolor: alpha(theme.palette.warning.main, 0.1) },
        'Annulé': { color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) }
    };

    const config = statusConfig[status] || statusConfig['Non commencé'];

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
    // Get permission context
    const { can, RESOURCES, ACTIONS } = usePermissions();
    const api = secureApi();

    // State initialization
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [refreshing, setRefreshing] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Debug permissions
    useEffect(() => {
        console.log("User can delete projects:", can(ACTIONS.DELETE, RESOURCES.PROJECTS));
    }, [can, ACTIONS, RESOURCES]);

    // Add view dialog state
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // View dialog handlers
    const handleOpenViewDialog = (project) => {
        setSelectedProject(project);
        setOpenViewDialog(true);
    };

    const handleCloseViewDialog = () => {
        setOpenViewDialog(false);
        setSelectedProject(null);
    };

    // Function to fetch data
    const fetchData = async () => {
        setRefreshing(true);
        try {
            // Using secure API to ensure permission check
            const response = await api.get(RESOURCES.PROJECTS, 'api/project/');
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
                message: location.state.message || 'Opération terminée avec succès',
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
            // Check permissions before making the API call
            if (!can(ACTIONS.DELETE, RESOURCES.PROJECTS)) {
                console.error('Permission denied: Cannot delete projects');
                setNotification({
                    open: true,
                    message: 'You do not have permission to delete projects.',
                    severity: 'error'
                });
                handleCloseDeleteDialog();
                return;
            }

            // Using secure API for delete operation
            await api.delete(RESOURCES.PROJECTS, `api/project/${projectToDelete.id}/`);

            setNotification({
                open: true,
                message: `Projet "${projectToDelete.name}" a été supprimé`,
                severity: 'success'
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting project:', error);
            setNotification({
                open: true,
                message: error.message || 'Échec de la suppression du projet. Veuillez réessayer.',
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
                header: 'Nom du Projet',
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
                header: 'Statut',
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
                header: 'Date de début',
                size: 120,
            },
            {
                accessorFn: (row) => row.end_date ? Dayjs(row.end_date).format('DD-MM-YYYY') : 'Not set',
                header: 'Date de fin',
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
                            Gestion de projets
                        </Typography>
                        <Typography variant="subtitle2">
                            Créez, gérez et suivez tous les projets de votre organisation
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

                {/* Only show Create button if user has create permission */}
                <PermissionRequired
                    resource={RESOURCES.PROJECTS}
                    action={ACTIONS.CREATE}
                >
                    <ActionButton
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/CreateProject"
                        startIcon={<AddIcon />}
                    >
                        Créer un nouveau projet
                    </ActionButton>
                </PermissionRequired>
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

                    {/* Only show Create button if user has create permission */}
                    <PermissionRequired
                        resource={RESOURCES.PROJECTS}
                        action={ACTIONS.CREATE}
                    >
                        <ActionButton
                            variant="contained"
                            color="primary"
                            component={Link}
                            to="/CreateProject"
                            startIcon={<AddIcon />}
                        >
                            Create New Project
                        </ActionButton>
                    </PermissionRequired>
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
                                <Tooltip title="Voir le projet">
                                    <IconButton
                                        color="info"
                                        onClick={() => handleOpenViewDialog(row.original)}
                                        sx={{
                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                                        }}
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                {/* Edit button with permission check */}
                                <PermissionRequired
                                    resource={RESOURCES.PROJECTS}
                                    action={ACTIONS.EDIT}
                                >
                                    <Tooltip title="Modifier le projet">
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
                                </PermissionRequired>

                                {/* Delete button with permission check */}
                                <PermissionRequired
                                    resource={RESOURCES.PROJECTS}
                                    action={ACTIONS.DELETE}
                                >
                                    <Tooltip title="Supprimer le projet">
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
                                </PermissionRequired>
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
                                            onClick={() => handleOpenViewDialog(project)}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            Voir
                                        </Button>

                                        {/* Edit button with permission check */}
                                        <PermissionRequired
                                            resource={RESOURCES.PROJECTS}
                                            action={ACTIONS.EDIT}
                                            fallback={<Box sx={{ width: '64px' }} />} // Spacer to maintain layout
                                        >
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                component={Link}
                                                to={`/projects/edit/${project.id}`}
                                                sx={{ borderRadius: '8px' }}
                                            >
                                                Modifier
                                            </Button>
                                        </PermissionRequired>

                                        {/* Delete button with permission check */}
                                        <PermissionRequired
                                            resource={RESOURCES.PROJECTS}
                                            action={ACTIONS.DELETE}
                                            fallback={<Box sx={{ width: '75px' }} />} // Spacer to maintain layout
                                        >
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDeleteDialog(project)}
                                                sx={{ borderRadius: '8px' }}
                                            >
                                                Supprimer
                                            </Button>
                                        </PermissionRequired>
                                    </Box>
                                </ProjectCard>
                            </motion.div>
                        ))}
                    </Box>
                </motion.div>
            )}

            {/* View Project Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={handleCloseViewDialog}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h6" component="span" color="primary.main">
                        Détails du projet
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2, minWidth: 400 }}>
                    {selectedProject && (
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight="bold">
                                {selectedProject.name}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <StatusChip
                                    label={selectedProject.status}
                                    status={selectedProject.status}
                                    size="small"
                                />
                            </Box>

                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Description
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {selectedProject.description}
                            </Typography>

                            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Budget
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {formatCurrency(selectedProject.budget)}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Chronologie
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedProject.start_date ? Dayjs(selectedProject.start_date).format('DD MMM YYYY') : 'No start date'}
                                        {' — '}
                                        {selectedProject.end_date ? Dayjs(selectedProject.end_date).format('DD MMM YYYY') : 'No end date'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleCloseViewDialog}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                    >
                        Close
                    </Button>

                    {/* Edit button in dialog with permission check */}
                    <PermissionRequired
                        resource={RESOURCES.PROJECTS}
                        action={ACTIONS.EDIT}
                    >
                        <Button
                            component={Link}
                            to={`/projects/edit/${selectedProject?.id}`}
                            color="primary"
                            variant="contained"
                            startIcon={<EditIcon />}
                            sx={{
                                borderRadius: '8px',
                                px: 3
                            }}
                        >
                            Edit Project
                        </Button>
                    </PermissionRequired>
                </DialogActions>
            </Dialog>

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
                        Supprimer le projet
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer "{projectToDelete?.name}"? Cette action <strong>ne peut pas</strong> être défait.
                    </DialogContentText>
                    <DialogContentText sx={{ mt: 2, mb: 1 }}>
                        Taper <strong>supprimer</strong> pour confirmer:
                    </DialogContentText>
                    <TextField
                        fullWidth
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Tapez « supprimer » ici"
                        variant="outlined"
                        error={deleteConfirmText.length > 0 && deleteConfirmText !== 'delete'}
                        helperText={deleteConfirmText.length > 0 && deleteConfirmText !== 'delete' ?
                            "Veuillez taper « supprimer » exactement pour confirmer" : ""}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeleteProject}
                        color="error"
                        variant="contained"
                        disabled={deleteConfirmText !== 'supprimer'}
                        sx={{
                            borderRadius: '8px',
                            px: 3
                        }}
                    >
                        Supprimer
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