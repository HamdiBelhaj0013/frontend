import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress
} from '@mui/material';
import AxiosInstance from '../Axios';

const DonorForm = ({ open, onClose, onSuccess, donor = null, isEdit = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        notes: '',
        is_anonymous: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load donor data when editing
    useEffect(() => {
        if (isEdit && donor) {
            setFormData({
                name: donor.name || '',
                email: donor.email || '',
                phone: donor.phone || '',
                address: donor.address || '',
                tax_id: donor.tax_id || '',
                notes: donor.notes || '',
                is_anonymous: donor.is_anonymous || false
            });
        }
    }, [isEdit, donor, open]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit && donor) {
                // Update existing donor
                await AxiosInstance.put(`/finances/donors/${donor.id}/`, formData);
            } else {
                // Create new donor
                await AxiosInstance.post('/finances/donors/', formData);
            }
            setLoading(false);
            resetForm();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error saving donor:', err);

            // Handle different types of error responses
            let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} donor. Please try again.`;

            if (err.response) {
                // The server responded with a status code outside of 2xx range
                if (err.response.data) {
                    if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    } else if (err.response.data.detail) {
                        errorMessage = err.response.data.detail;
                    } else if (typeof err.response.data === 'object') {
                        // Format field errors from DRF
                        const fieldErrors = Object.entries(err.response.data)
                            .map(([field, errors]) => {
                                if (Array.isArray(errors)) {
                                    return `${field}: ${errors.join(', ')}`;
                                }
                                return `${field}: ${errors}`;
                            })
                            .join('; ');

                        if (fieldErrors) {
                            errorMessage = fieldErrors;
                        }
                    }
                }
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    const resetForm = () => {
        if (!isEdit) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                tax_id: '',
                notes: '',
                is_anonymous: false
            });
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>{isEdit ? 'Edit Donor' : 'Add New Donor'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="name"
                                label="Donor Name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                required
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="phone"
                                label="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="tax_id"
                                label="Tax ID"
                                value={formData.tax_id}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="address"
                                label="Address"
                                value={formData.address}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="notes"
                                label="Notes"
                                value={formData.notes}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="is_anonymous"
                                        checked={formData.is_anonymous}
                                        onChange={handleChange}
                                    />
                                }
                                label="Anonymous Donor"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update Donor' : 'Save Donor')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default DonorForm;