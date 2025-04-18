import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Chip,
    Divider,
    Link,
    Avatar,
    Paper,
    IconButton
} from '@mui/material';
import {
    Receipt,
    CalendarToday,
    AccountBalance,
    Person,
    Description,
    Category,
    AttachMoney,
    Assignment,
    Check,
    Close,
    CloudDownload,
    Warning
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Helper function to format amount with currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

const TransactionDetailDialog = ({ open, onClose, transaction }) => {
    if (!transaction) return null;

    // Status chip based on transaction status
    const getStatusChip = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <Chip
                        color="success"
                        icon={<Check />}
                        label="Verified"
                        sx={{ fontWeight: 600 }}
                    />
                );
            case 'rejected':
                return (
                    <Chip
                        color="error"
                        icon={<Close />}
                        label="Rejected"
                        sx={{ fontWeight: 600 }}
                    />
                );
            default:
                return (
                    <Chip
                        color="warning"
                        icon={<Warning />}
                        label="Pending"
                        sx={{ fontWeight: 600 }}
                    />
                );
        }
    };

    // Handle document download if available
    const handleDocumentDownload = () => {
        if (transaction.document) {
            window.open(transaction.document, '_blank');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <Receipt sx={{ mr: 1 }} />
                    <Typography variant="h6" component="span">
                        Transaction Details
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Header with amount and type */}
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                backgroundColor: transaction.transaction_type === 'income'
                                    ? 'rgba(46, 125, 50, 0.1)'
                                    : 'rgba(211, 47, 47, 0.1)',
                                borderRadius: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Box>
                                <Typography variant="overline" sx={{ fontWeight: 'bold' }}>
                                    {transaction.transaction_type === 'income' ? 'INCOME' : 'EXPENSE'}
                                </Typography>
                                <Typography variant="h4" sx={{
                                    fontWeight: 'bold',
                                    color: transaction.transaction_type === 'income' ? 'success.main' : 'error.main'
                                }}>
                                    {transaction.transaction_type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                </Typography>
                            </Box>
                            {getStatusChip(transaction.status)}
                        </Paper>
                    </Grid>

                    {/* Main transaction details */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <Description sx={{ fontSize: 18, mr: 1 }} />
                                Description
                            </Typography>
                            <Typography variant="body1">
                                {transaction.description || 'No description provided'}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <Category sx={{ fontSize: 18, mr: 1 }} />
                                Category
                            </Typography>
                            <Typography variant="body1">
                                {transaction.category.split('_').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ fontSize: 18, mr: 1 }} />
                                Date
                            </Typography>
                            <Typography variant="body1">
                                {dayjs(transaction.date).format('DD MMMM YYYY')}
                            </Typography>
                        </Box>

                        {transaction.reference_number && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Assignment sx={{ fontSize: 18, mr: 1 }} />
                                    Reference Number
                                </Typography>
                                <Typography variant="body1">
                                    {transaction.reference_number}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Related entities and verification */}
                    <Grid item xs={12} md={6}>
                        {transaction.project && transaction.project_details && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccountBalance sx={{ fontSize: 18, mr: 1 }} />
                                    Related Project
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 30,
                                            height: 30,
                                            mr: 1,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {transaction.project_details.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body1">
                                        {transaction.project_details.name}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {transaction.donor && transaction.donor_details && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Person sx={{ fontSize: 18, mr: 1 }} />
                                    {transaction.transaction_type === 'income' ? 'Donor' : 'Paid To'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Avatar sx={{ width: 30, height: 30, mr: 1, fontSize: '0.875rem' }}>
                                        {transaction.donor_details.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body1">
                                        {transaction.donor_details.name}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {transaction.verified_by && transaction.verified_by_details && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Check sx={{ fontSize: 18, mr: 1 }} />
                                    Verified By
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Avatar sx={{ width: 30, height: 30, mr: 1, fontSize: '0.875rem' }}>
                                        {transaction.verified_by_details.full_name
                                            ? transaction.verified_by_details.full_name.charAt(0)
                                            : transaction.verified_by_details.email.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body1">
                                        {transaction.verified_by_details.full_name || transaction.verified_by_details.email}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    on {dayjs(transaction.verification_date).format('DD MMMM YYYY, HH:mm')}
                                </Typography>
                            </Box>
                        )}

                        {transaction.verification_notes && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Verification Notes
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        {transaction.verification_notes}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                    </Grid>

                    {/* Supporting document section */}
                    {transaction.document && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    bgcolor: 'action.hover',
                                    borderRadius: 1
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 40,
                                            height: 40,
                                            mr: 2
                                        }}
                                    >
                                        <Receipt />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Supporting Document
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {transaction.document.split('/').pop()}
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton
                                    color="primary"
                                    onClick={handleDocumentDownload}
                                    sx={{ bgcolor: 'background.paper' }}
                                >
                                    <CloudDownload />
                                </IconButton>
                            </Box>
                        </Grid>
                    )}

                    {/* Created info */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Created by: {transaction.created_by_details
                                ? (transaction.created_by_details.full_name || transaction.created_by_details.email)
                                : 'System'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Transaction ID: {transaction.id}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransactionDetailDialog;