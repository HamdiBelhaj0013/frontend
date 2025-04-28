import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    Button,
    Alert,
    useTheme
} from '@mui/material';
import {
    Add,
    Refresh,
    AccountBalance,
    ReceiptLong,
    BarChart,
    AssignmentTurnedIn,
    People
} from '@mui/icons-material';
import AxiosInstance from './Axios';

// Import permission components
import { PermissionRequired } from '../contexts/ConditionalUI.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';

// Import child components
import TransactionList from './finance/TransactionList.jsx';
import TransactionForm from './finance/TransactionForm';
import BudgetDashboard from './finance/BudgetDashboard';
import FinancialReports from './finance/FinancialReports';
import DashboardWidgets from './finance/DashboardWidgets';
import DonorForm from './finance/DonorForm.jsx';
import DonorList from './finance/DonorList';

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
    // Get permission context
    const { can, RESOURCES, ACTIONS, userRole } = usePermissions();

    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [donors, setDonors] = useState([]);
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

    // State for donor form modal
    const [donorFormOpen, setDonorFormOpen] = useState(false);

    // State for notifications
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        severity: 'success'
    });

    // Fetch financial statistics - FIXED to avoid infinite loops
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Use regular Axios instance, not secureApi which is causing the issues
                const statsResponse = await AxiosInstance.get('/finances/dashboard/');
                setStatistics(statsResponse.data);

                // Only fetch transactions if user has permission to view them
                if (can(ACTIONS.VIEW, RESOURCES.FINANCE) && userRole !== 'member') {
                    const transactionsResponse = await AxiosInstance.get('/finances/transactions/');
                    setTransactions(transactionsResponse.data);

                    const donorsResponse = await AxiosInstance.get('/finances/donors/');
                    setDonors(donorsResponse.data);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching financial data:', err);
                setError('Failed to load financial data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
        // Removed api from dependencies to prevent loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger, can, ACTIONS, RESOURCES, userRole]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        // Check permissions before allowing tab change
        const tabPermissionMap = {
            0: true, // Dashboard - always visible
            1: userRole !== 'member', // Transactions
            2: userRole !== 'member', // Budgets
            3: userRole !== 'member', // Donors
            4: userRole !== 'member', // Reports
        };

        // Only change tab if user has permission
        if (tabPermissionMap[newValue]) {
            setActiveTab(newValue);
        } else {
            setNotification({
                show: true,
                message: 'You do not have permission to view this tab.',
                severity: 'error'
            });

            // Hide notification after 3 seconds
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
        }
    };

    // Open transaction form
    const handleAddTransaction = (type) => {
        // Check if user has create permission
        if (!can(ACTIONS.CREATE, RESOURCES.FINANCE)) {
            setNotification({
                show: true,
                message: 'You do not have permission to add transactions.',
                severity: 'error'
            });

            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
            return;
        }

        setFormType(type);
        setFormOpen(true);
    };

    // Open donor form
    const handleAddDonor = () => {
        // Check if user has create permission
        if (!can(ACTIONS.CREATE, RESOURCES.FINANCE)) {
            setNotification({
                show: true,
                message: 'You do not have permission to add donors.',
                severity: 'error'
            });

            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
            return;
        }

        setDonorFormOpen(true);
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
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Handle donor form submission success
    const handleDonorFormSuccess = () => {
        setDonorFormOpen(false);
        setRefreshTrigger(prev => prev + 1);
        setNotification({
            show: true,
            message: 'Donor added successfully!',
            severity: 'success'
        });

        // Hide notification after 3 seconds
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Manually refresh data
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Calculate visible tabs based on permissions
    // Moved outside of render to avoid rerenders and recalculations
    const visibleTabs = [
        { label: 'Dashboard', icon: <BarChart fontSize="small" /> }, // Dashboard is always visible
    ];

    // Add other tabs only if user has proper permissions
    if (can(ACTIONS.VIEW, RESOURCES.FINANCE) && userRole !== 'member') {
        visibleTabs.push(
            { label: 'Transactions', icon: <ReceiptLong fontSize="small" /> },
            { label: 'Budgets', icon: <AccountBalance fontSize="small" /> },
            { label: 'Donors', icon: <People fontSize="small" /> },
            { label: 'Reports', icon: <AssignmentTurnedIn fontSize="small" /> }
        );
    }

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

                    {/* Only show these buttons if user has create permission */}
                    {can(ACTIONS.CREATE, RESOURCES.FINANCE) && (
                        <>
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
                        </>
                    )}
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
                    {visibleTabs.map((tab, index) => (
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
                        {/* Dashboard Tab - Always visible */}
                        <TabPanel value={activeTab} index={0}>
                            <DashboardWidgets
                                statistics={statistics}
                                recentTransactions={statistics.recent_transactions}
                            />
                        </TabPanel>

                        {/* Only render these tabs if user has permission */}
                        {can(ACTIONS.VIEW, RESOURCES.FINANCE) && userRole !== 'member' && (
                            <>
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

                                {/* Donors Tab */}
                                <TabPanel value={activeTab} index={3}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                        {can(ACTIONS.CREATE, RESOURCES.FINANCE) && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleAddDonor}
                                                startIcon={<Add />}
                                            >
                                                Add Donor
                                            </Button>
                                        )}
                                    </Box>
                                    <DonorList
                                        donors={donors}
                                        onRefresh={handleRefresh}
                                    />
                                </TabPanel>

                                {/* Reports Tab */}
                                <TabPanel value={activeTab} index={4}>
                                    <FinancialReports onRefresh={handleRefresh} />
                                </TabPanel>
                            </>
                        )}
                    </>
                )}
            </Paper>

            {/* Transaction Form Modal - Only render if user has permission */}
            {can(ACTIONS.CREATE, RESOURCES.FINANCE) && (
                <>
                    <TransactionForm
                        open={formOpen}
                        onClose={() => setFormOpen(false)}
                        type={formType}
                        onSuccess={handleFormSuccess}
                    />

                    <DonorForm
                        open={donorFormOpen}
                        onClose={() => setDonorFormOpen(false)}
                        onSuccess={handleDonorFormSuccess}
                    />
                </>
            )}
        </Box>
    );
};

export default Finance;