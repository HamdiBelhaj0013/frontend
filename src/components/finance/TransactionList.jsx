import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Button,
    Tooltip,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Grid,
    CircularProgress,
    useTheme,
    Alert
} from '@mui/material';
import {
    Edit,
    Delete,
    Search,
    FilterList,
    Download,
    Visibility,
    MoreVert,
    Check,
    Close,
    FileDownload,
    Warning
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AxiosInstance from '../Axios';
import TransactionDetailDialog from './TransactionDetailDialog';

// Helper function to format amount with currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

// Verify transaction dialog component
const VerifyTransactionDialog = ({ open, onClose, transaction, onVerify }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [budgetAllocations, setBudgetAllocations] = useState([]);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');

    // Fetch budget allocations for the project when dialog opens
    useEffect(() => {
        const fetchBudgetAllocations = async () => {
            if (!transaction || !transaction.project || transaction.transaction_type !== 'expense') {
                setBudgetAllocations([]);
                return;
            }

            try {
                const response = await AxiosInstance.get('/finances/budget-allocations/', {
                    params: { project: transaction.project }
                });
                setBudgetAllocations(response.data);

                // If transaction already has a budget allocation, select it
                if (transaction.budget_allocation) {
                    setSelectedBudget(transaction.budget_allocation);
                } else if (response.data.length > 0) {
                    // Otherwise select the budget with most remaining funds
                    const sortedBudgets = [...response.data].sort((a, b) =>
                        b.remaining_amount - a.remaining_amount
                    );
                    setSelectedBudget(sortedBudgets[0].id);
                }
            } catch (error) {
                console.error('Error fetching budget allocations:', error);
                setError('Failed to load budget allocations');
            }
        };

        if (open && transaction) {
            fetchBudgetAllocations();
            setVerificationNotes('');
            setError('');
        }
    }, [open, transaction]);

    const handleVerify = async (verified) => {
        // Don't require budget selection for income transactions
        if (verified && transaction.transaction_type === 'expense' &&
            !transaction.budget_allocation && !selectedBudget) {
            setError('Please select a budget allocation for this expense');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                status: verified ? 'verified' : 'rejected',
                verification_notes: verificationNotes
            };

            // Add budget allocation to payload if selected and not already set
            if (verified && transaction.transaction_type === 'expense' &&
                !transaction.budget_allocation && selectedBudget) {
                payload.budget_allocation = selectedBudget;
            }

            await AxiosInstance.post(`/finances/transactions/${transaction.id}/verify/`, payload);
            onVerify();
        } catch (error) {
            console.error('Error verifying transaction:', error);
            setError(error.response?.data?.error || 'Failed to verify transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => loading ? null : onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Verify Transaction</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography>
                    Do you want to approve or reject this transaction?
                </Typography>

                {transaction && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="subtitle2">
                            {transaction.transaction_type === 'income' ? 'Income' : 'Expense'}: {formatCurrency(transaction.amount)}
                        </Typography>
                        <Typography variant="body2">
                            {transaction.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Date: {dayjs(transaction.date).format('DD/MM/YYYY')}
                        </Typography>
                        {transaction.document && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Supporting document: {transaction.document.split('/').pop()}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Budget Allocation selection for expenses */}
                {transaction && transaction.transaction_type === 'expense' &&
                    !transaction.budget_allocation && budgetAllocations.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Select Budget Allocation</InputLabel>
                                <Select
                                    value={selectedBudget || ''}
                                    onChange={(e) => setSelectedBudget(e.target.value)}
                                    label="Select Budget Allocation"
                                >
                                    {budgetAllocations.map((budget) => (
                                        <MenuItem key={budget.id} value={budget.id}>
                                            {formatCurrency(budget.allocated_amount)} - Remaining: {formatCurrency(budget.remaining_amount)}
                                            {budget.remaining_amount < transaction.amount &&
                                                ' (Insufficient funds)'}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    Select which budget this expense should be deducted from
                                </FormHelperText>
                            </FormControl>
                        </Box>
                    )}

                {/* No budgets available warning */}
                {transaction && transaction.transaction_type === 'expense' &&
                    !transaction.budget_allocation && budgetAllocations.length === 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            No budget allocations found for this project. You can still verify the transaction,
                            but it won't be linked to any budget.
                        </Alert>
                    )}

                {/* Already has budget allocation info */}
                {transaction && transaction.budget_allocation && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        This transaction is already linked to a budget allocation.
                    </Alert>
                )}

                <TextField
                    label="Verification Notes"
                    fullWidth
                    multiline
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={() => handleVerify(false)}
                    color="error"
                    variant="outlined"
                    disabled={loading}
                >
                    Reject
                </Button>
                <Button
                    onClick={() => handleVerify(true)}
                    color="success"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Verify'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const TransactionList = ({ transactions, onRefresh, onAddTransaction }) => {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMenuTransaction, setSelectedMenuTransaction] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        status: '',
        startDate: null,
        endDate: null
    });
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    // Effect to filter transactions based on search and filters
    useEffect(() => {
        if (!transactions) return;

        let filtered = [...transactions];

        // Apply text search
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(transaction =>
                transaction.description.toLowerCase().includes(searchLower) ||
                (transaction.reference_number && transaction.reference_number.toLowerCase().includes(searchLower)) ||
                (transaction.project_details && transaction.project_details.name.toLowerCase().includes(searchLower)) ||
                (transaction.donor_details && transaction.donor_details.name.toLowerCase().includes(searchLower))
            );
        }

        // Apply filters
        if (filters.type) {
            filtered = filtered.filter(t => t.transaction_type === filters.type);
        }

        if (filters.category) {
            filtered = filtered.filter(t => t.category === filters.category);
        }

        if (filters.status) {
            filtered = filtered.filter(t => t.status === filters.status);
        }

        if (filters.startDate) {
            filtered = filtered.filter(t => new Date(t.date) >= filters.startDate.toDate());
        }

        if (filters.endDate) {
            filtered = filtered.filter(t => new Date(t.date) <= filters.endDate.toDate());
        }

        setFilteredTransactions(filtered);
    }, [transactions, search, filters]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleFilterDialogOpen = () => {
        setFilterDialogOpen(true);
    };

    const handleFilterDialogClose = () => {
        setFilterDialogOpen(false);
    };

    const handleFilterChange = (name, value) => {
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const resetFilters = () => {
        setFilters({
            type: '',
            category: '',
            status: '',
            startDate: null,
            endDate: null
        });
        setFilterDialogOpen(false);
    };

    const handleMenuOpen = (event, transaction) => {
        setAnchorEl(event.currentTarget);
        setSelectedMenuTransaction(transaction);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMenuTransaction(null);
    };

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setDetailDialogOpen(true);
        handleMenuClose();
    };

    const handleEditTransaction = (transaction) => {
        // For future implementation - Edit transaction
        console.log('Edit transaction:', transaction);
        handleMenuClose();
    };

    const handleDeleteDialog = (transaction) => {
        setSelectedTransaction(transaction);
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleVerifyDialog = (transaction) => {
        setSelectedTransaction(transaction);
        setVerifyDialogOpen(true);
        handleMenuClose();
    };

    const handleVerificationSuccess = () => {
        setVerifyDialogOpen(false);
        setSelectedTransaction(null);
        onRefresh();
    };

    const handleDeleteTransaction = async () => {
        if (!selectedTransaction) return;

        setActionLoading(true);
        try {
            await AxiosInstance.delete(`/finances/transactions/${selectedTransaction.id}/`);
            setDeleteDialogOpen(false);
            setSelectedTransaction(null);
            onRefresh();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportTransactions = async () => {
        try {
            // Build query parameters based on current filters
            const params = new URLSearchParams();
            if (filters.type) params.append('transaction_type', filters.type);
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('start_date', filters.startDate.format('YYYY-MM-DD'));
            if (filters.endDate) params.append('end_date', filters.endDate.format('YYYY-MM-DD'));

            // Make API request with responseType blob for file download
            const response = await AxiosInstance.get(`/finances/transactions/export/?${params.toString()}`, {
                responseType: 'blob'
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting transactions:', error);
        }
    };

    // Get active filter count for badge
    const getActiveFilterCount = () => {
        return Object.values(filters).filter(value => value !== '' && value !== null).length;
    };

    // Status chip based on transaction status
    const getStatusChip = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <Chip
                        size="small"
                        color="success"
                        icon={<Check fontSize="small" />}
                        label="Verified"
                        sx={{ fontWeight: 600 }}
                    />
                );
            case 'rejected':
                return (
                    <Chip
                        size="small"
                        color="error"
                        icon={<Close fontSize="small" />}
                        label="Rejected"
                        sx={{ fontWeight: 600 }}
                    />
                );
            default:
                return (
                    <Chip
                        size="small"
                        color="warning"
                        icon={<Warning fontSize="small" />}
                        label="Pending"
                        sx={{ fontWeight: 600 }}
                    />
                );
        }
    };

    // Transaction type chip based on type
    const getTypeChip = (type) => {
        if (type === 'income') {
            return (
                <Chip
                    size="small"
                    label="Income"
                    sx={{
                        bgcolor: 'rgba(46, 125, 50, 0.1)',
                        color: 'success.main',
                        fontWeight: 600,
                        borderRadius: '4px'
                    }}
                />
            );
        }
        return (
            <Chip
                size="small"
                label="Expense"
                sx={{
                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                    color: 'error.main',
                    fontWeight: 600,
                    borderRadius: '4px'
                }}
            />
        );
    };

    return (
        <Box>
            {/* Search and filter toolbar */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1
                }}
            >
                <TextField
                    placeholder="Search transactions..."
                    size="small"
                    value={search}
                    onChange={handleSearchChange}
                    sx={{ flexGrow: 1, maxWidth: 500 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={handleFilterDialogOpen}
                        startIcon={<FilterList />}
                        color={getActiveFilterCount() > 0 ? "primary" : "inherit"}
                        sx={{
                            borderRadius: '8px',
                            position: 'relative'
                        }}
                    >
                        Filters
                        {getActiveFilterCount() > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                {getActiveFilterCount()}
                            </Box>
                        )}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleExportTransactions}
                        startIcon={<FileDownload />}
                        sx={{ borderRadius: '8px' }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            {/* Transactions table */}
            <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto', borderRadius: 2 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Related To</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No transactions found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((transaction) => (
                                    <TableRow key={transaction.id} hover>
                                        <TableCell>{dayjs(transaction.date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{getTypeChip(transaction.transaction_type)}</TableCell>
                                        <TableCell>
                                            <Tooltip title={transaction.category}>
                        <span>
                          {transaction.category.split('_').map(word =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={transaction.description}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxWidth: 150,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {transaction.description}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {transaction.project_details ? (
                                                <Tooltip title={transaction.project_details.name}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            maxWidth: 100,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {transaction.project_details.name}
                                                    </Typography>
                                                </Tooltip>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.donor_details ? (
                                                <Tooltip title={transaction.donor_details.name}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            maxWidth: 100,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {transaction.donor_details.name}
                                                    </Typography>
                                                </Tooltip>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: transaction.transaction_type === 'income' ? 'success.main' : 'error.main'
                                                }}
                                            >
                                                {transaction.transaction_type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{getStatusChip(transaction.status)}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, transaction)}
                                                aria-label="transaction options"
                                            >
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: 'none' }}
            />

            {/* Action menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={() => handleViewDetails(selectedMenuTransaction)}>
                    <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
                </MenuItem>
                <MenuItem
                    onClick={() => handleVerifyDialog(selectedMenuTransaction)}
                    disabled={selectedMenuTransaction?.status === 'verified' || selectedMenuTransaction?.status === 'rejected'}
                >
                    <Check fontSize="small" sx={{ mr: 1 }} /> Verify Transaction
                </MenuItem>
                <MenuItem onClick={() => handleEditTransaction(selectedMenuTransaction)}>
                    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={() => handleDeleteDialog(selectedMenuTransaction)}>
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Filter dialog */}
            <Dialog open={filterDialogOpen} onClose={handleFilterDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Filter Transactions</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Transaction Type</InputLabel>
                                <Select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    label="Transaction Type"
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    <MenuItem value="income">Income</MenuItem>
                                    <MenuItem value="expense">Expense</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    label="Status"
                                >
                                    <MenuItem value="">All Statuses</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="verified">Verified</MenuItem>
                                    <MenuItem value="rejected">Rejected</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    label="Category"
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    <MenuItem value="donation">Donation</MenuItem>
                                    <MenuItem value="membership_fee">Membership Fee</MenuItem>
                                    <MenuItem value="grant">Grant</MenuItem>
                                    <MenuItem value="project_expense">Project Expense</MenuItem>
                                    <MenuItem value="operational_cost">Operational Cost</MenuItem>
                                    <MenuItem value="salary">Salary</MenuItem>
                                    <MenuItem value="tax">Tax Payment</MenuItem>
                                    <MenuItem value="other_income">Other Income</MenuItem>
                                    <MenuItem value="other_expense">Other Expense</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start Date"
                                    value={filters.startDate}
                                    onChange={(date) => handleFilterChange('startDate', date)}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="End Date"
                                    value={filters.endDate}
                                    onChange={(date) => handleFilterChange('endDate', date)}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetFilters}>Reset Filters</Button>
                    <Button onClick={handleFilterDialogClose} variant="contained">Apply Filters</Button>
                </DialogActions>
            </Dialog>

            {/* View details dialog */}
            {selectedTransaction && (
                <TransactionDetailDialog
                    open={detailDialogOpen}
                    onClose={() => setDetailDialogOpen(false)}
                    transaction={selectedTransaction}
                />
            )}

            {/* Verify transaction dialog */}
            <VerifyTransactionDialog
                open={verifyDialogOpen}
                onClose={() => setVerifyDialogOpen(false)}
                transaction={selectedTransaction}
                onVerify={handleVerificationSuccess}
            />

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </Typography>
                    {selectedTransaction && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 1 }}>
                            <Typography variant="subtitle2">
                                {selectedTransaction.transaction_type === 'income' ? 'Income' : 'Expense'}: {formatCurrency(selectedTransaction.amount)}
                            </Typography>
                            <Typography variant="body2">
                                {selectedTransaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Date: {dayjs(selectedTransaction.date).format('DD/MM/YYYY')}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleDeleteTransaction}
                        color="error"
                        variant="contained"
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TransactionList;