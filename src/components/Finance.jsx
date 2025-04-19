import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    Divider,
    Button,
    IconButton,
    Card,
    CardContent,
    Chip,
    Alert,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Add,
    Refresh,
    AttachMoney,
    AccountBalance,
    DateRange,
    Download,
    TrendingUp,
    TrendingDown,
    ReceiptLong,
    BarChart,
    PieChart,
    ShowChart,
    Receipt,
    AssignmentTurnedIn
} from '@mui/icons-material';
import AxiosInstance from './Axios';
import { useNavigate } from 'react-router-dom';

// Import child components
import TransactionList from './finance/TransactionList.jsx';
import TransactionForm from './finance/TransactionForm';
import BudgetDashboard from './finance/BudgetDashboard';
import FinancialReports from './finance/FinancialReports';
import DashboardWidgets from './finance/DashboardWidgets';

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`finance-tabpanel-${index}`}
            aria-labelledby={`finance-tab-${index}`}
            {...other}
            style={{ paddingTop: '16px' }}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const Finance = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [statistics, setStatistics] = useState({
        total_income: 0,
        total_expenses: 0,
        net_balance: 0,
        total_donations: 0,
        total_project_expenses: 0,
        income_by_category: {},
        expenses_by_category: {},
        project_budget_utilization: [],
        recent_transactions: []
    });

    // State for transaction form modal
    const [formOpen, setFormOpen] = useState(false);
    const [formType, setFormType] = useState('income'); // 'income' or 'expense'
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // State for notifications
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        severity: 'success'
    });

    // Fetch financial statistics
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);

                // Fetch financial statistics
                const statsResponse = await AxiosInstance.get('/finances/dashboard/');
                setStatistics(statsResponse.data);

                // Fetch transactions
                const transactionsResponse = await AxiosInstance.get('/finances/transactions/');
                setTransactions(transactionsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching financial data:', err);
                setError('Failed to load financial data. Please try again later.');
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [refreshTrigger]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Open transaction form
    const handleAddTransaction = (type) => {
        setFormType(type);
        setFormOpen(true);
    };

    // Handle form submission success
    const handleFormSuccess = () => {
        setFormOpen(false);
        setRefreshTrigger(prev => prev + 1);
        setNotification({
            show: true,
            message: 'Transaction saved successfully!',
            severity: 'success'
        });

        // Hide notification after 3 seconds
        setTimeout(() => {
            setNotification({
                ...notification,
                show: false
            });
        }, 3000);
    };

    // Manually refresh data
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Tab labels and icons
    const tabs = [
        { label: 'Dashboard', icon: <BarChart fontSize="small" /> },
        { label: 'Transactions', icon: <ReceiptLong fontSize="small" /> },
        { label: 'Budgets', icon: <AccountBalance fontSize="small" /> },
        { label: 'Reports', icon: <AssignmentTurnedIn fontSize="small" /> }
    ];

    return (
        <Box>
            {/* Page Header */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={8}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Financial Management
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Track donations, expenses, and generate reports
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleRefresh}
                        startIcon={<Refresh />}
                        sx={{ mr: 1 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddTransaction('income')}
                        startIcon={<Add />}
                        sx={{ mr: 1 }}
                    >
                        Add Income
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleAddTransaction('expense')}
                        startIcon={<Add />}
                    >
                        Add Expense
                    </Button>
                </Grid>
            </Grid>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Success Notification */}
            {notification.show && (
                <Alert severity={notification.severity} sx={{ mb: 3 }}>
                    {notification.message}
                </Alert>
            )}

            {/* Main Content */}
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Tabs Bar */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        bgcolor: theme.palette.background.paper,
                        borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            label={tab.label}
                            icon={tab.icon}
                            iconPosition="start"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                minHeight: 60,
                                fontSize: '0.95rem',
                            }}
                        />
                    ))}
                </Tabs>

                {/* Loading Indicator */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Dashboard Tab */}
                        <TabPanel value={activeTab} index={0}>
                            <DashboardWidgets
                                statistics={statistics}
                                recentTransactions={statistics.recent_transactions}
                            />
                        </TabPanel>

                        {/* Transactions Tab */}
                        <TabPanel value={activeTab} index={1}>
                            <TransactionList
                                transactions={transactions}
                                onRefresh={handleRefresh}
                                onAddTransaction={handleAddTransaction}
                            />
                        </TabPanel>

                        {/* Budget Tab */}
                        <TabPanel value={activeTab} index={2}>
                            <BudgetDashboard
                                projectBudgets={statistics.project_budget_utilization}
                                onRefresh={handleRefresh}
                            />
                        </TabPanel>

                        {/* Reports Tab */}
                        <TabPanel value={activeTab} index={3}>
                            <FinancialReports onRefresh={handleRefresh} />
                        </TabPanel>
                    </>
                )}
            </Paper>

            {/* Transaction Form Modal */}
            <TransactionForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                type={formType}
                onSuccess={handleFormSuccess}
            />
        </Box>
    );
};

export default Finance;