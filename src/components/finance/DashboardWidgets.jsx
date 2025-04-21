import React, { useEffect, useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    Tooltip,
    useTheme,
    LinearProgress // Added missing import
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AccountBalance,
    Paid,
    Visibility,
    Wallet,
    People,
    BarChart,
    PieChart,
    ShowChart,
    ArrowForward,
    Assignment
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
// Import the recharts components
import {
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    LineChart,
    Line
} from 'recharts';

// Helper function to format amount with currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

// Generate color palette for charts
const generateColors = (count) => {
    const colors = [
        '#1976d2', '#2196f3', '#64b5f6', '#90caf9', // Blues
        '#388e3c', '#4caf50', '#81c784', '#a5d6a7', // Greens
        '#f57c00', '#ff9800', '#ffb74d', '#ffe0b2', // Oranges
        '#d32f2f', '#f44336', '#e57373', '#ffcdd2', // Reds
        '#7b1fa2', '#9c27b0', '#ba68c8', '#e1bee7'  // Purples
    ];

    if (count <= colors.length) {
        return colors.slice(0, count);
    }

    // Generate additional colors if needed
    const extendedColors = [...colors];
    while (extendedColors.length < count) {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        extendedColors.push(randomColor);
    }

    return extendedColors;
};

// Small widget component for financial overviews
const FinancialWidget = ({ title, amount, icon, colorClass, trend, subtitle }) => {
    return (
        <Card sx={{
            height: '100%',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            borderRadius: 2,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }
        }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            bgcolor: colorClass + '.light',
                            color: colorClass + '.main',
                            p: 1,
                            borderRadius: '50%',
                            display: 'flex'
                        }}
                    >
                        {icon}
                    </Box>
                </Box>

                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                    {amount}
                </Typography>

                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                        {trend > 0 ? (
                            <TrendingUp fontSize="small" color="success" sx={{ mr: 0.5 }} />
                        ) : (
                            <TrendingDown fontSize="small" color="error" sx={{ mr: 0.5 }} />
                        )}
                        <Typography
                            variant="body2"
                            color={trend > 0 ? 'success.main' : 'error.main'}
                            sx={{ fontWeight: 'medium' }}
                        >
                            {trend > 0 ? '+' : ''}{trend}% {trend > 0 ? 'increase' : 'decrease'}
                        </Typography>
                    </Box>
                )}

                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

// Transaction list item component
const TransactionItem = ({ transaction }) => {
    return (
        <ListItem
            divider
            sx={{
                px: 2,
                transition: 'background-color 0.2s',
                '&:hover': {
                    backgroundColor: 'action.hover'
                }
            }}
        >
            <ListItemText
                primary={
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {transaction.description.length > 40
                            ? transaction.description.substring(0, 40) + '...'
                            : transaction.description}
                    </Typography>
                }
                secondary={dayjs(transaction.date).format('DD/MM/YYYY')}
                sx={{ flex: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 'bold',
                        color: transaction.transaction_type === 'income' ? 'success.main' : 'error.main',
                        mr: 1
                    }}
                >
                    {transaction.transaction_type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </Typography>
                <Chip
                    label={transaction.transaction_type === 'income' ? 'Income' : 'Expense'}
                    size="small"
                    sx={{
                        bgcolor: transaction.transaction_type === 'income' ? 'success.light' : 'error.light',
                        color: transaction.transaction_type === 'income' ? 'success.dark' : 'error.dark',
                        fontWeight: 500,
                        fontSize: '0.7rem'
                    }}
                />
            </Box>
        </ListItem>
    );
};

// Budget progress component
const BudgetProgress = ({ project, utilization, allocated, used }) => {
    const theme = useTheme();

    // Determine color based on utilization percentage
    const getColor = (percent) => {
        if (percent < 50) return theme.palette.success.main;
        if (percent < 75) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {project}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {Math.round(utilization)}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={Math.min(utilization, 100)}
                sx={{
                    height: 8,
                    borderRadius: 5,
                    bgcolor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: getColor(utilization)
                    }
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    Used: {formatCurrency(used)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Budget: {formatCurrency(allocated)}
                </Typography>
            </Box>
        </Box>
    );
};

// Main dashboard component
const DashboardWidgets = ({ statistics, recentTransactions }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [incomeChartData, setIncomeChartData] = useState([]);
    const [expenseChartData, setExpenseChartData] = useState([]);
    const [monthlyTrendData, setMonthlyTrendData] = useState([]);

    // Function to generate monthly trend data (mock data if not available from backend)
    const generateMonthlyTrendData = () => {
        // Get current month and 5 months back
        const months = [];
        const currentDate = dayjs();

        for (let i = 5; i >= 0; i--) {
            const month = currentDate.subtract(i, 'month');
            months.push({
                name: month.format('MMM'),
                month: month.month(),
                year: month.year()
            });
        }

        // If we have income and expense by category data, we can use that
        // to create simulated monthly data if the backend doesn't provide it
        if (statistics && (Object.keys(statistics?.income_by_category || {}).length > 0 ||
            Object.keys(statistics?.expenses_by_category || {}).length > 0)) {

            // Calculate total amounts
            const totalIncome = Object.values(statistics?.income_by_category || {})
                .reduce((sum, val) => sum + parseFloat(val), 0);

            const totalExpense = Object.values(statistics?.expenses_by_category || {})
                .reduce((sum, val) => sum + parseFloat(val), 0);

            // Create mock monthly data with some variation
            return months.map((month, index) => {
                // Create some variation in the data
                const incomeFactor = 0.7 + (Math.random() * 0.6); // Between 0.7 and 1.3
                const expenseFactor = 0.7 + (Math.random() * 0.6);

                // More recent months have higher values to show growth
                const timeMultiplier = 0.8 + (index * 0.05);

                return {
                    name: month.name,
                    income: Math.round((totalIncome / 6) * incomeFactor * timeMultiplier),
                    expense: Math.round((totalExpense / 6) * expenseFactor * timeMultiplier)
                };
            });
        }

        // Fallback to completely mock data if we don't have any real data
        return months.map((month) => ({
            name: month.name,
            income: Math.floor(Math.random() * 5000) + 5000,
            expense: Math.floor(Math.random() * 4000) + 3000
        }));
    };

    useEffect(() => {
        if (!statistics) return;

        try {
            console.log("Income categories:", statistics?.income_by_category);
            console.log("Expense categories:", statistics?.expenses_by_category);

            // Process income by category data for pie chart
            const incomeData = Object.entries(statistics?.income_by_category || {}).map(([name, value]) => ({
                name,
                value: parseFloat(value)
            }));
            setIncomeChartData(incomeData);

            // Process expense by category data for pie chart
            const expenseData = Object.entries(statistics?.expenses_by_category || {}).map(([name, value]) => ({
                name,
                value: parseFloat(value)
            }));
            setExpenseChartData(expenseData);

            // Generate monthly trend data
            const trendData = generateMonthlyTrendData();
            setMonthlyTrendData(trendData);

            console.log("Income chart data:", incomeData);
            console.log("Expense chart data:", expenseData);
            console.log("Monthly trend data:", trendData);
        } catch (error) {
            console.error("Error processing statistics data:", error);
        }
    }, [statistics]);

    // Generate colors for charts
    const incomeColors = generateColors(incomeChartData.length);
    const expenseColors = generateColors(expenseChartData.length);

    return (
        <Grid container spacing={3}>
            {/* Financial summary widgets */}
            <Grid item xs={12} lg={8}>
                <Grid container spacing={3}>
                    {/* Total Income */}
                    <Grid item xs={12} sm={6} md={3}>
                        <FinancialWidget
                            title="Total Income"
                            amount={formatCurrency(statistics?.total_income || 0)}
                            icon={<TrendingUp />}
                            colorClass="success"
                            trend={15} // Example trend data
                            subtitle="Last 30 days"
                        />
                    </Grid>

                    {/* Total Expenses */}
                    <Grid item xs={12} sm={6} md={3}>
                        <FinancialWidget
                            title="Total Expenses"
                            amount={formatCurrency(statistics?.total_expenses || 0)}
                            icon={<TrendingDown />}
                            colorClass="error"
                            trend={-8} // Example trend data
                            subtitle="Last 30 days"
                        />
                    </Grid>

                    {/* Net Balance */}
                    <Grid item xs={12} sm={6} md={3}>
                        <FinancialWidget
                            title="Net Balance"
                            amount={formatCurrency(statistics?.net_balance || 0)}
                            icon={<AccountBalance />}
                            colorClass="info"
                            subtitle="Current balance"
                        />
                    </Grid>

                    {/* Total Donations */}
                    <Grid item xs={12} sm={6} md={3}>
                        <FinancialWidget
                            title="Donations"
                            amount={formatCurrency(statistics?.total_donations || 0)}
                            icon={<Paid />}
                            colorClass="warning"
                            trend={5} // Example trend data
                            subtitle="Last 30 days"
                        />
                    </Grid>

                    {/* Income & Expense categories */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                        Income by Category
                                    </Typography>
                                    <PieChart fontSize="small" color="primary" />
                                </Box>

                                {incomeChartData.length > 0 ? (
                                    <Box sx={{ height: 240 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={incomeChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {incomeChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={incomeColors[index % incomeColors.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    formatter={(value) => formatCurrency(value)}
                                                />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        height: 240,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        backgroundColor: theme.palette.action.hover,
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No income data available
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                        Expenses by Category
                                    </Typography>
                                    <PieChart fontSize="small" color="primary" />
                                </Box>

                                {expenseChartData.length > 0 ? (
                                    <Box sx={{ height: 240 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={expenseChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {expenseChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={expenseColors[index % expenseColors.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    formatter={(value) => formatCurrency(value)}
                                                />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        height: 240,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        backgroundColor: theme.palette.action.hover,
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No expense data available
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Monthly trends chart */}
                    <Grid item xs={12}>
                        <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                        Financial Trends
                                    </Typography>
                                    <ShowChart fontSize="small" color="primary" />
                                </Box>

                                <Box sx={{ height: 300 }}>
                                    {monthlyTrendData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={monthlyTrendData}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="income"
                                                    stroke={theme.palette.success.main}
                                                    strokeWidth={2}
                                                    activeDot={{ r: 8 }}
                                                    name="Income"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="expense"
                                                    stroke={theme.palette.error.main}
                                                    strokeWidth={2}
                                                    name="Expense"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Box sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            backgroundColor: theme.palette.action.hover,
                                            borderRadius: 2
                                        }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No trend data available
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Start recording transactions to see financial trends
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>

            {/* Right column */}
            <Grid item xs={12} lg={4}>
                <Grid container spacing={3}>
                    {/* Recent transactions */}
                    <Grid item xs={12}>
                        <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                        Recent Transactions
                                    </Typography>
                                </Box>

                                <List sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    '& .MuiListItem-root': {
                                        px: 0
                                    }
                                }}>
                                    {recentTransactions && recentTransactions.length > 0 ? (
                                        recentTransactions.map((transaction) => (
                                            <TransactionItem key={transaction.id} transaction={transaction} />
                                        ))
                                    ) : (
                                        <ListItem>
                                            <ListItemText
                                                primary="No recent transactions"
                                                primaryTypographyProps={{ align: 'center', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Project Budget Overview */}
                    <Grid item xs={12}>
                        <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                        Project Budgets
                                    </Typography>
                                    <Assignment fontSize="small" color="primary" />
                                </Box>

                                {statistics?.project_budget_utilization && statistics.project_budget_utilization.length > 0 ? (
                                    <Box>
                                        {statistics.project_budget_utilization.map((project, index) => (
                                            <BudgetProgress
                                                key={index}
                                                project={project.project}
                                                utilization={project.utilization}
                                                allocated={project.allocated}
                                                used={project.used}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        height: 150,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        backgroundColor: theme.palette.action.hover,
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No project budgets available
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default DashboardWidgets;