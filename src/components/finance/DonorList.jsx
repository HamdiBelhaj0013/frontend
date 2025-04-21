import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    IconButton,
    Chip,
    Box,
    TextField,
    InputAdornment,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DialogContentText,
    Grid,
    Alert
} from '@mui/material';
import {
    Edit,
    Delete,
    Visibility,
    Search,
    CurrencyExchange
} from '@mui/icons-material';
import AxiosInstance from '../Axios';
import DonorForm from './DonorForm';

// Define formatCurrency locally
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    if (amount === null || amount === undefined) return '-';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const DonorList = ({ donors = [], onRefresh }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // State for view donor details dialog
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);

    // State for edit donor dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // State for delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deleteError, setDeleteError] = useState('');

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter donors based on search term
    const filteredDonors = donors.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.email && donor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (donor.tax_id && donor.tax_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Slice the data for pagination
    const displayedDonors = filteredDonors.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Handle view donor details
    const handleViewDonor = (donor) => {
        setSelectedDonor(donor);
        setViewDialogOpen(true);
    };

    // Handle edit donor
    const handleEditDonor = (donor) => {
        setSelectedDonor(donor);
        setEditDialogOpen(true);
    };

    // Handle delete donor
    const handleDeletePrompt = (donor) => {
        setSelectedDonor(donor);
        setConfirmText('');
        setDeleteError('');
        setDeleteDialogOpen(true);
    };

    // Handle confirm text change
    const handleConfirmTextChange = (e) => {
        setConfirmText(e.target.value);
        if (deleteError) setDeleteError('');
    };

    // Confirm delete donor
    const handleDeleteDonor = async () => {
        if (!selectedDonor) return;

        if (confirmText !== 'delete') {
            setDeleteError('Please type "delete" to confirm');
            return;
        }

        setLoading(true);
        setDeleteError('');

        try {
            await AxiosInstance.delete(`/finances/donors/${selectedDonor.id}/`);
            setDeleteDialogOpen(false);
            setSelectedDonor(null);
            setConfirmText('');
            onRefresh(); // Refresh the donor list
        } catch (error) {
            console.error('Error deleting donor:', error);
            setDeleteError(error.response?.data?.detail ||
                error.response?.data?.error ||
                'Failed to delete donor. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle successful edit
    const handleEditSuccess = () => {
        setEditDialogOpen(false);
        onRefresh(); // Refresh the donor list
    };

    // Close delete dialog
    const handleCloseDeleteDialog = () => {
        if (!loading) {
            setDeleteDialogOpen(false);
            setConfirmText('');
            setDeleteError('');
        }
    };

    if (loading && !selectedDonor) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Search and filter */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="h2">
                    Donors ({filteredDonors.length})
                </Typography>
                <TextField
                    placeholder="Search donors..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Box>

            {/* Donors Table */}
            <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Contact Info</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tax ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total Donations</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedDonors.length > 0 ? (
                            displayedDonors.map((donor) => (
                                <TableRow key={donor.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {donor.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {donor.email && (
                                            <Typography variant="body2" color="text.secondary">
                                                {donor.email}
                                            </Typography>
                                        )}
                                        {donor.phone && (
                                            <Typography variant="body2" color="text.secondary">
                                                {donor.phone}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {donor.tax_id || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight="medium"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'success.main'
                                            }}
                                        >
                                            <CurrencyExchange
                                                fontSize="small"
                                                sx={{ mr: 0.5, opacity: 0.7 }}
                                            />
                                            {formatCurrency(donor.total_donations)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {donor.is_anonymous ? (
                                            <Chip
                                                label="Anonymous"
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                            />
                                        ) : (
                                            <Chip
                                                label="Public"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(donor.created_at).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            sx={{ mr: 1 }}
                                            title="View Donor Details"
                                            onClick={() => handleViewDonor(donor)}
                                        >
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            sx={{ mr: 1 }}
                                            title="Edit Donor"
                                            onClick={() => handleEditDonor(donor)}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            title="Delete Donor"
                                            onClick={() => handleDeletePrompt(donor)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {searchTerm ? 'No donors match your search criteria.' : 'No donors found.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredDonors.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* View Donor Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Donor Details</DialogTitle>
                <DialogContent>
                    {selectedDonor && (
                        <Box>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Name</Typography>
                                    <Typography variant="body1">{selectedDonor.name}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Status</Typography>
                                    <Typography variant="body1">
                                        {selectedDonor.is_anonymous ? 'Anonymous' : 'Public'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Email</Typography>
                                    <Typography variant="body1">{selectedDonor.email || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Phone</Typography>
                                    <Typography variant="body1">{selectedDonor.phone || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Tax ID</Typography>
                                    <Typography variant="body1">{selectedDonor.tax_id || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Total Donations</Typography>
                                    <Typography variant="body1" color="success.main" fontWeight="bold">
                                        {formatCurrency(selectedDonor.total_donations)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Address</Typography>
                                    <Typography variant="body1">{selectedDonor.address || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Notes</Typography>
                                    <Typography variant="body1">{selectedDonor.notes || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Created</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedDonor.created_at).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">Last Updated</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedDonor.updated_at).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => {
                            setViewDialogOpen(false);
                            handleEditDonor(selectedDonor);
                        }}
                    >
                        Edit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Donor Dialog */}
            {selectedDonor && (
                <DonorForm
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    onSuccess={handleEditSuccess}
                    donor={selectedDonor}
                    isEdit={true}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={loading ? undefined : handleCloseDeleteDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Delete sx={{ mr: 1, color: 'error.main' }} />
                        <Typography variant="h6" color="error">
                            Delete Donor
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}

                    {selectedDonor && (
                        <Box>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    You are about to delete the donor:
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {selectedDonor.name}
                                </Typography>
                                {selectedDonor.total_donations > 0 && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        This donor has contributed {formatCurrency(selectedDonor.total_donations)} in donations.
                                    </Typography>
                                )}
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    This action cannot be undone. All donor data will be permanently removed.
                                </Typography>
                            </Alert>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    To confirm, type "delete" below:
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={confirmText}
                                    onChange={handleConfirmTextChange}
                                    placeholder="delete"
                                    error={!!deleteError && deleteError.includes('delete')}
                                    disabled={loading}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteDonor}
                        variant="contained"
                        color="error"
                        disabled={loading || confirmText !== 'delete'}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete Donor'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DonorList;