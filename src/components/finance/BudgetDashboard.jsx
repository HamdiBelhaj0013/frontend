import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Alert,
    Divider,
    CircularProgress,
    useTheme
} from '@mui/material';
import {
    Add,
    Edit,
    Refresh,
    AccountBalance,
    TrendingUp,
    TrendingDown,
    Warning,
    Info,
    Delete
} from '@mui/icons-material';
import AxiosInstance from '../Axios';

// Helper function to format amount with currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

// Budget adjustment dialog component
const BudgetAdjustmentDialog = ({ open, onClose, budget, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (budget && open) {
            setAmount(budget.allocated_amount);
        }
    }, [budget, open]);

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
        setError('');
    };

    const handleSubmit = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Veuillez saisir un montant valide');
            return;
        }

        // Check if amount is less than used amount
        if (parseFloat(amount) < parseFloat(budget.used_amount)) {
            setError('Le nouveau budget ne peut pas être inférieur au montant déjà utilisé');
            return;
        }

        setLoading(true);
        try {
            await AxiosInstance.post(`/finances/budget-allocations/${budget.id}/adjust_budget/`, {
                allocated_amount: amount
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error adjusting budget:', err);
            setError(err.response?.data?.error || 'Échec de l\'ajustement du budget');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <AccountBalance sx={{ mr: 1 }} />
                    <Typography variant="h6">
                        Ajuster l'Allocation Budgétaire
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {budget && (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Projet : {budget.project_details?.name}
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Budget Actuel : {formatCurrency(budget.allocated_amount)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Montant Utilisé : {formatCurrency(budget.used_amount)}
                                </Typography>
                            </Grid>
                        </Grid>

                        <TextField
                            label="Nouveau Montant du Budget"
                            fullWidth
                            type="number"
                            margin="normal"
                            value={amount}
                            onChange={handleAmountChange}
                            error={!!error}
                            inputProps={{ min: budget.used_amount }}
                            disabled={loading}
                            helperText={error ? error : "Le montant doit être supérieur ou égal au montant déjà utilisé"}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Annuler
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Enregistrer les Modifications'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Delete budget dialog component
const DeleteBudgetDialog = ({ open, onClose, budget, onSuccess }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirmTextChange = (e) => {
        setConfirmText(e.target.value);
        setError('');
    };

    const handleDelete = async () => {
        if (confirmText !== 'delete') {
            setError('Veuillez taper "delete" pour confirmer');
            return;
        }

        setLoading(true);
        try {
            await AxiosInstance.delete(`/finances/budget-allocations/${budget.id}/`);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error deleting budget:', err);
            setError(err.response?.data?.error || 'Échec de la suppression du budget');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <Delete sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="h6" color="error">
                        Supprimer le Budget
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {budget && (
                    <Box>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body1" gutterBottom>
                                Vous êtes sur le point de supprimer l'allocation budgétaire pour :
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {budget.project_details?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Cette action ne peut pas être annulée. Toutes les données d'allocation budgétaire seront définitivement supprimées.
                            </Typography>
                        </Alert>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                Pour confirmer, tapez "delete" ci-dessous :
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={confirmText}
                                onChange={handleConfirmTextChange}
                                placeholder="delete"
                                error={!!error}
                                helperText={error}
                                disabled={loading}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Annuler
                </Button>
                <Button
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                    disabled={loading || confirmText !== 'delete'}
                >
                    {loading ? <CircularProgress size={24} /> : 'Supprimer le Budget'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// New budget allocation dialog component
const NewBudgetDialog = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        project: '',
        allocated_amount: '',
        notes: ''
    });
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(false);

    // Load projects when dialog opens
    useEffect(() => {
        if (open) {
            fetchProjects();
        }
    }, [open]);

    const fetchProjects = async () => {
        setProjectsLoading(true);
        try {
            const response = await AxiosInstance.get('/api/project/');
            setProjects(response.data);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Échec du chargement des projets');
        } finally {
            setProjectsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const handleSubmit = async () => {
        // Validate form
        if (!formData.project) {
            setError('Veuillez sélectionner un projet');
            return;
        }

        if (!formData.allocated_amount || isNaN(formData.allocated_amount) || parseFloat(formData.allocated_amount) <= 0) {
            setError('Veuillez saisir un montant valide');
            return;
        }

        setLoading(true);
        try {
            await AxiosInstance.post('/finances/budget-allocations/', formData);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating budget allocation:', err);
            setError(err.response?.data?.detail || 'Échec de la création de l\'allocation budgétaire');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <AccountBalance sx={{ mr: 1 }} />
                    <Typography variant="h6">
                        Nouvelle Allocation Budgétaire
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    select
                    label="Projet"
                    name="project"
                    fullWidth
                    margin="normal"
                    value={formData.project}
                    onChange={handleChange}
                    disabled={loading || projectsLoading}
                    SelectProps={{
                        native: true,
                    }}
                >
                    <option value=""></option>
                    {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </TextField>

                <TextField
                    label="Montant du Budget"
                    name="allocated_amount"
                    fullWidth
                    type="number"
                    margin="normal"
                    value={formData.allocated_amount}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{ min: 0 }}
                />

                <TextField
                    label="Notes"
                    name="notes"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={loading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Annuler
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Créer le Budget'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Budget card component
const BudgetCard = ({ budget, onAdjust, onDelete }) => {
    const theme = useTheme();

    // Determine color based on utilization percentage
    const getColor = (percent) => {
        if (percent < 50) return theme.palette.success.main;
        if (percent < 75) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const utilization = budget.utilization_percentage;
    const progressColor = getColor(utilization);

    return (
        <Card
            sx={{
                height: '100%',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 500 }}>
                        {budget.project_details.name}
                    </Typography>
                    <Box>
                        <Tooltip title="Ajuster le Budget">
                            <IconButton size="small" onClick={() => onAdjust(budget)} sx={{ mr: 0.5 }}>
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer le Budget">
                            <IconButton size="small" onClick={() => onDelete(budget)} color="error">
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Utilisation du Budget
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" sx={{ color: progressColor }}>
                            {Math.round(utilization)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(utilization, 100)}
                        sx={{
                            height: 8,
                            borderRadius: 5,
                            mt: 1,
                            bgcolor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: progressColor
                            }
                        }}
                    />
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" component="div">
                            Budget Total
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(budget.allocated_amount)}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" component="div">
                            Utilisé
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color={theme.palette.error.main}>
                            {formatCurrency(budget.used_amount)}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" component="div">
                            Restant
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color={theme.palette.success.main}>
                            {formatCurrency(budget.remaining_amount)}
                        </Typography>
                    </Grid>
                </Grid>

                {budget.notes && (
                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                            Notes :
                        </Typography>
                        <Typography variant="body2">
                            {budget.notes}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// Main budget dashboard component
const BudgetDashboard = ({ projectBudgets, onRefresh }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newBudgetDialogOpen, setNewBudgetDialogOpen] = useState(false);

    // Fetch budgets from API
    const fetchBudgets = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get('/finances/budget-allocations/');
            setBudgets(response.data);
        } catch (err) {
            console.error('Error fetching budgets:', err);
            setError('Échec du chargement des allocations budgétaires. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // Load budgets on component mount and when refreshTrigger changes
    useEffect(() => {
        fetchBudgets();
    }, []);

    // Handle opening the budget adjustment dialog
    const handleAdjustBudget = (budget) => {
        setSelectedBudget(budget);
        setAdjustDialogOpen(true);
    };

    // Handle opening the budget deletion dialog
    const handleDeleteBudget = (budget) => {
        setSelectedBudget(budget);
        setDeleteDialogOpen(true);
    };

    // Handle successful budget operations
    const handleSuccess = () => {
        fetchBudgets();
        if (onRefresh) {
            onRefresh();
        }
    };

    return (
        <Box>
            {/* Header with action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    Budget des Projets
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchBudgets}
                        sx={{ mr: 1 }}
                        disabled={loading}
                    >
                        Actualiser
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setNewBudgetDialogOpen(true)}
                        disabled={loading}
                    >
                        Nouveau Budget
                    </Button>
                </Box>
            </Box>

            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Loading indicator */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Budget cards grid */}
            {!loading && (
                <>
                    {budgets.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <Info color="info" sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                            <Typography variant="h6" gutterBottom>
                                Aucune Allocation Budgétaire
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Aucune allocation budgétaire n'a encore été créée. Créez votre premier budget pour commencer à suivre les dépenses par projet.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setNewBudgetDialogOpen(true)}
                            >
                                Créer le Premier Budget
                            </Button>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {budgets.map((budget) => (
                                <Grid item xs={12} sm={6} md={4} key={budget.id}>
                                    <BudgetCard
                                        budget={budget}
                                        onAdjust={handleAdjustBudget}
                                        onDelete={handleDeleteBudget}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {/* Budget adjustment dialog */}
            <BudgetAdjustmentDialog
                open={adjustDialogOpen}
                onClose={() => setAdjustDialogOpen(false)}
                budget={selectedBudget}
                onSuccess={handleSuccess}
            />

            {/* Budget deletion dialog */}
            <DeleteBudgetDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                budget={selectedBudget}
                onSuccess={handleSuccess}
            />

            {/* New budget dialog */}
            <NewBudgetDialog
                open={newBudgetDialogOpen}
                onClose={() => setNewBudgetDialogOpen(false)}
                onSuccess={handleSuccess}
            />
        </Box>
    );
};

export default BudgetDashboard;