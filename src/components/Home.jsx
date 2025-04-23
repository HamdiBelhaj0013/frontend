import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Divider,
    Button,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    LinearProgress,
    Tooltip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
    Dashboard,
    Business,
    Group,
    AccountBalance,
    VolunteerActivism,
    TrendingUp,
    TrendingDown,
    Paid,
    Receipt,
    Assignment,
    CalendarToday,
    Add,
    CheckCircle,
    Warning,
    ArrowForward,
    Refresh,
    Visibility,
    Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AxiosInstance from './Axios';
import dayjs from 'dayjs';

// Styled components
const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    '& svg': {
        marginRight: theme.spacing(1),
    },
}));

const StatsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    borderRadius: 12,
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
}));

const DashboardCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    height: '100%',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
}));

const ShortcutCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minHeight: 80,
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateY(-4px) scale(1.01)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    }
}));

// Helper function to format amount with currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

// Status chip based on verification status
const StatusChip = ({ status }) => {
    if (status === 'verified') {
        return (
            <Chip
                size="small"
                color="success"
                icon={<CheckCircle fontSize="small" />}
                label="Vérifié"
                sx={{ fontWeight: 500 }}
            />
        );
    } else if (status === 'failed') {
        return (
            <Chip
                size="small"
                color="error"
                icon={<Warning fontSize="small" />}
                label="Échec"
                sx={{ fontWeight: 500 }}
            />
        );
    } else {
        return (
            <Chip
                size="small"
                color="warning"
                icon={<Info fontSize="small" />}
                label="En attente"
                sx={{ fontWeight: 500 }}
            />
        );
    }
};

const Home = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        association: null,
        members: [],
        projects: [],
        recentTransactions: [],
        financialStats: {
            totalIncome: 0,
            totalExpenses: 0,
            netBalance: 0,
            budgetUtilization: []
        },
        verificationStatus: null
    });

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get user profile to get association info
                const profileResponse = await AxiosInstance.get('/users/profile/');
                const userProfile = profileResponse.data;
                const association = userProfile.association || null;

                // Get members
                const membersResponse = await AxiosInstance.get('/api/member/');
                const members = membersResponse.data;

                // Get projects
                const projectsResponse = await AxiosInstance.get('/api/project/');
                const projects = projectsResponse.data;

                // Get financial data
                const financialResponse = await AxiosInstance.get('/finances/dashboard/');
                const financialData = financialResponse.data;

                // Get recent transactions
                const transactionsResponse = await AxiosInstance.get('/finances/transactions/?limit=5');
                const recentTransactions = transactionsResponse.data.slice(0, 5);

                // Get association verification status if available
                let verificationStatus = null;
                if (association) {
                    try {
                        const verificationResponse = await AxiosInstance.get(`/users/association-verification/${association.id}/`);
                        verificationStatus = verificationResponse.data;
                    } catch (err) {
                        console.warn('Could not fetch verification status:', err);
                    }
                }

                // Combine all data
                setDashboardData({
                    association,
                    members,
                    projects,
                    recentTransactions,
                    financialStats: {
                        totalIncome: financialData.total_income || 0,
                        totalExpenses: financialData.total_expenses || 0,
                        netBalance: financialData.net_balance || 0,
                        budgetUtilization: financialData.project_budget_utilization || []
                    },
                    verificationStatus
                });
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Erreur lors du chargement des données. Veuillez réessayer.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    // Calculate statistics
    const memberCount = dashboardData.members.length;
    const projectCount = dashboardData.projects.length;
    const activeProjectCount = dashboardData.projects.filter(p => p.status === 'In Progress').length;

    // Render loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Chargement du tableau de bord...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Welcome header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #00897B, #00695C)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Bienvenue, {dashboardData.association ? dashboardData.association.name : 'Admin'}
                    </Typography>
                    <Typography variant="body1">
                        Consultez vos statistiques et gérez votre association depuis votre tableau de bord personnalisé
                    </Typography>

                    {dashboardData.verificationStatus && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                                Statut de vérification:
                            </Typography>
                            <StatusChip status={dashboardData.verificationStatus.verification_status} />
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', mt: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                            onClick={handleRefresh}
                            startIcon={<Refresh />}
                        >
                            Rafraîchir
                        </Button>
                    </Box>
                </Box>

                {/* Decorative circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
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
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 0
                    }}
                />
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Quick Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary" gutterBottom>
                                    Membres
                                </Typography>
                                <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                    <Group fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                                {memberCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Membres enregistrés
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary" gutterBottom>
                                    Projets
                                </Typography>
                                <Avatar sx={{ bgcolor: 'success.light', width: 40, height: 40 }}>
                                    <Business fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                                {projectCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {activeProjectCount} projets actifs
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary" gutterBottom>
                                    Revenus
                                </Typography>
                                <Avatar sx={{ bgcolor: 'success.light', width: 40, height: 40 }}>
                                    <TrendingUp fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                                {formatCurrency(dashboardData.financialStats.totalIncome)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Revenus totaux
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary" gutterBottom>
                                    Dépenses
                                </Typography>
                                <Avatar sx={{ bgcolor: 'error.light', width: 40, height: 40 }}>
                                    <TrendingDown fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                                {formatCurrency(dashboardData.financialStats.totalExpenses)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Dépenses totales
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>
            </Grid>

            {/* Quick Actions Section */}
            <SectionTitle variant="h6">
                <Dashboard /> Actions Rapides
            </SectionTitle>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={4} md={2}>
                    <ShortcutCard>
                        <CardActionArea
                            component={Link}
                            to="/CreateMember"
                            sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Group color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="body2" fontWeight="medium" align="center">
                                Ajouter un Membre
                            </Typography>
                        </CardActionArea>
                    </ShortcutCard>
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                    <ShortcutCard>
                        <CardActionArea
                            component={Link}
                            to="/CreateProject"
                            sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Business color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="body2" fontWeight="medium" align="center">
                                Créer un Projet
                            </Typography>
                        </CardActionArea>
                    </ShortcutCard>
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                    <ShortcutCard>
                        <CardActionArea
                            onClick={() => navigate('/finance', { state: { activeTab: 0 } })}
                            sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <AccountBalance color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="body2" fontWeight="medium" align="center">
                                Tableau Financier
                            </Typography>
                        </CardActionArea>
                    </ShortcutCard>
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                    <ShortcutCard>
                        <CardActionArea
                            onClick={() => navigate('/finance', { state: { activeTab: 1 } })}
                            sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Receipt color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="body2" fontWeight="medium" align="center">
                                Transactions
                            </Typography>
                        </CardActionArea>
                    </ShortcutCard>
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                    <ShortcutCard>
                        <CardActionArea
                            onClick={() => navigate('/finance', { state: { activeTab: 2 } })}
                            sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Paid color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="body2" fontWeight="medium" align="center">
                                Budgets
                            </Typography>
                        </CardActionArea>
                    </ShortcutCard>
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                    <ShortcutCard>
                        <CardActionArea
                            onClick={() => navigate('/finance', { state: { activeTab: 3 } })}
                            sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Assignment color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="body2" fontWeight="medium" align="center">
                                Rapports
                            </Typography>
                        </CardActionArea>
                    </ShortcutCard>
                </Grid>
            </Grid>

            {/* Main Dashboard Content */}
            <Grid container spacing={3}>
                {/* Recent Projects */}
                <Grid item xs={12} md={6}>
                    <DashboardCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <SectionTitle variant="h6" sx={{ mb: 0 }}>
                                    <Business /> Projets Récents
                                </SectionTitle>
                                <Button
                                    component={Link}
                                    to="/projects"
                                    endIcon={<ArrowForward />}
                                    size="small"
                                >
                                    Voir Tout
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {dashboardData.projects.length === 0 ? (
                                <Box sx={{ py: 2, textAlign: 'center' }}>
                                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                                        Aucun projet trouvé
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        component={Link}
                                        to="/CreateProject"
                                        startIcon={<Add />}
                                    >
                                        Créer un Projet
                                    </Button>
                                </Box>
                            ) : (
                                <List>
                                    {dashboardData.projects.slice(0, 4).map((project) => (
                                        <ListItem key={project.id} divider sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: project.status === 'In Progress' ? 'success.light' : 'warning.light' }}>
                                                    <Business />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={project.name}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2">
                                                            Budget: {formatCurrency(project.budget)}
                                                        </Typography>
                                                        <br />
                                                        <Chip
                                                            label={project.status}
                                                            size="small"
                                                            color={project.status === 'In Progress' ? 'success' : 'warning'}
                                                            sx={{ mt: 0.5 }}
                                                        />
                                                    </>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Voir détails">
                                                    <IconButton
                                                        edge="end"
                                                        component={Link}
                                                        to={`/projects/edit/${project.id}`}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </DashboardCard>
                </Grid>

                {/* Recent Members */}
                <Grid item xs={12} md={6}>
                    <DashboardCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <SectionTitle variant="h6" sx={{ mb: 0 }}>
                                    <Group /> Membres Récents
                                </SectionTitle>
                                <Button
                                    component={Link}
                                    to="/members"
                                    endIcon={<ArrowForward />}
                                    size="small"
                                >
                                    Voir Tout
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {dashboardData.members.length === 0 ? (
                                <Box sx={{ py: 2, textAlign: 'center' }}>
                                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                                        Aucun membre trouvé
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        component={Link}
                                        to="/CreateMember"
                                        startIcon={<Add />}
                                    >
                                        Ajouter un Membre
                                    </Button>
                                </Box>
                            ) : (
                                <List>
                                    {dashboardData.members.slice(0, 4).map((member) => (
                                        <ListItem key={member.id} divider sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar>
                                                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={member.name}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2">
                                                            {member.email}
                                                        </Typography>
                                                        <br />
                                                        <Chip
                                                            label={member.role || 'Membre'}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ mt: 0.5 }}
                                                        />
                                                    </>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Voir détails">
                                                    <IconButton
                                                        edge="end"
                                                        component={Link}
                                                        to={`/member/editmember/${member.id}`}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </DashboardCard>
                </Grid>

                {/* Project Budget Utilization */}
                <Grid item xs={12} md={6}>
                    <DashboardCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <SectionTitle variant="h6" sx={{ mb: 0 }}>
                                    <AccountBalance /> Utilisation des Budgets
                                </SectionTitle>
                                <Button
                                    onClick={() => navigate('/finance', { state: { activeTab: 2 } })}
                                    endIcon={<ArrowForward />}
                                    size="small"
                                >
                                    Gérer les Budgets
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {!dashboardData.financialStats.budgetUtilization ||
                            dashboardData.financialStats.budgetUtilization.length === 0 ? (
                                <Box sx={{ py: 2, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        Aucune allocation budgétaire trouvée
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    {dashboardData.financialStats.budgetUtilization.slice(0, 4).map((budget, index) => {
                                        // Determine color based on utilization percentage
                                        let color = theme.palette.success.main;
                                        if (budget.utilization > 75) color = theme.palette.error.main;
                                        else if (budget.utilization > 50) color = theme.palette.warning.main;

                                        return (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {budget.project}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {Math.round(budget.utilization)}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(budget.utilization, 100)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5,
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: color
                                                        }
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Utilisé: {formatCurrency(budget.used)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Budget: {formatCurrency(budget.allocated)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </CardContent>
                    </DashboardCard>
                </Grid>

                {/* Recent Transactions */}
                <Grid item xs={12} md={6}>
                    <DashboardCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <SectionTitle variant="h6" sx={{ mb: 0 }}>
                                    <Receipt /> Transactions Récentes
                                </SectionTitle>
                                <Button
                                    onClick={() => navigate('/finance', { state: { activeTab: 1 } })}
                                    endIcon={<ArrowForward />}
                                    size="small"
                                >
                                    Toutes les Transactions
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {!dashboardData.recentTransactions ||
                            dashboardData.recentTransactions.length === 0 ? (
                                <Box sx={{ py: 2, textAlign: 'center' }}>
                                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                                        Aucune transaction trouvée
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/finance', { state: { activeTab: 1 } })}
                                        startIcon={<Add />}
                                    >
                                        Ajouter une Transaction
                                    </Button>
                                </Box>
                            ) : (
                                <List>
                                    {dashboardData.recentTransactions.map((transaction) => (
                                        <ListItem key={transaction.id} divider sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{
                                                    bgcolor: transaction.transaction_type === 'income'
                                                        ? 'success.light'
                                                        : 'error.light'
                                                }}>
                                                    {transaction.transaction_type === 'income'
                                                        ? <TrendingUp />
                                                        : <TrendingDown />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography noWrap style={{ maxWidth: '180px' }}>
                                                        {transaction.description}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2">
                                                            {dayjs(transaction.date).format('DD/MM/YYYY')}
                                                        </Typography>
                                                        <br />
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            sx={{
                                                                color: transaction.transaction_type === 'income'
                                                                    ? 'success.main'
                                                                    : 'error.main',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {transaction.transaction_type === 'income' ? '+' : '-'}
                                                            {formatCurrency(transaction.amount)}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <StatusChip status={transaction.status} />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </DashboardCard>
                </Grid>
            </Grid>

            {/* Assistant AI */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mt: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Assistant IA
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Notre assistant virtuel spécialisé dans la législation tunisienne est disponible pour répondre à vos questions
                    </Typography>

                    <Button
                        variant="contained"
                        component={Link}
                        to="/chatbot"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                        startIcon={<VolunteerActivism />}
                    >
                        Consulter l'Assistant
                    </Button>
                </Box>

                {/* Decorative circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 0
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -40,
                        left: 100,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 0
                    }}
                />
            </Paper>

            {/* Calendar Section (Placeholder for future development) */}
            <Box sx={{ mt: 4 }}>
                <SectionTitle variant="h6">
                    <CalendarToday /> Calendrier des Événements
                </SectionTitle>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center'
                    }}
                >
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                        La fonctionnalité de calendrier sera disponible prochainement.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vous pourrez planifier et suivre les événements de votre association.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Home;