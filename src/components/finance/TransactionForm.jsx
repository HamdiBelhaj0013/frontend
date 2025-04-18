import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Box,
    Typography,
    InputAdornment,
    Autocomplete,
    CircularProgress,
    Alert,
    IconButton,
    Divider
} from '@mui/material';
import {
    AttachMoney,
    Description,
    AccountBalance,
    Person,
    Close,
    AttachFile,
    UploadFile,
    Delete
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AxiosInstance from '../Axios';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Define income categories
const incomeCategories = [
    { value: 'donation', label: 'Donation' },
    { value: 'membership_fee', label: 'Membership Fee' },
    { value: 'grant', label: 'Grant' },
    { value: 'other_income', label: 'Other Income' }
];

// Define expense categories
const expenseCategories = [
    { value: 'project_expense', label: 'Project Expense' },
    { value: 'operational_cost', label: 'Operational Cost' },
    { value: 'salary', label: 'Salary' },
    { value: 'tax', label: 'Tax Payment' },
    { value: 'other_expense', label: 'Other Expense' }
];

// Form validation schema
const createTransactionSchema = yup.object({
    transaction_type: yup.string().required('Transaction type is required'),
    category: yup.string().required('Category is required'),
    amount: yup
        .number()
        .typeError('Amount must be a number')
        .positive('Amount must be greater than zero')
        .required('Amount is required'),
    description: yup.string().required('Description is required'),
    date: yup.date().required('Date is required'),
    project: yup.number().nullable(),
    donor: yup.number().nullable(),
    reference_number: yup.string().nullable()
});

const TransactionForm = ({ open, onClose, type = 'income', onSuccess }) => {
    // States
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [donors, setDonors] = useState([]);
    const [submitError, setSubmitError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState('');

    // Form setup
    const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(createTransactionSchema),
        defaultValues: {
            transaction_type: type,
            category: '',
            amount: '',
            description: '',
            date: dayjs(),
            project: null,
            donor: null,
            reference_number: ''
        }
    });

    // Watch values for conditional rendering
    const watchTransactionType = watch('transaction_type');
    const watchCategory = watch('category');
    const watchProject = watch('project');

    // Load projects and donors on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch projects
                const projectsResponse = await AxiosInstance.get('/api/project/');
                setProjects(projectsResponse.data);

                // Fetch donors
                const donorsResponse = await AxiosInstance.get('/finances/donors/');
                setDonors(donorsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            reset({
                transaction_type: type,
                category: '',
                amount: '',
                description: '',
                date: dayjs(),
                project: null,
                donor: null,
                reference_number: ''
            });
            setSelectedFile(null);
            setFileError('');
            setSubmitError('');
        }
    }, [open, type, reset]);

    // Handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setFileError('File size exceeds 10MB limit');
            setSelectedFile(null);
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setFileError('Only PDF, JPEG, and PNG files are allowed');
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setFileError('');
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    // Form submission handler
    const onSubmit = async (data) => {
        setLoading(true);
        setSubmitError('');

        try {
            // Create FormData object
            const formData = new FormData();

            // Append form data
            formData.append('transaction_type', data.transaction_type);
            formData.append('category', data.category);
            formData.append('amount', data.amount);
            formData.append('description', data.description);
            formData.append('date', dayjs(data.date).format('YYYY-MM-DD'));

            if (data.project !== null) {
                formData.append('project', data.project);
            }

            if (data.donor !== null) {
                formData.append('donor', data.donor);
            }

            if (data.reference_number) {
                formData.append('reference_number', data.reference_number);
            }

            // Append file if selected
            if (selectedFile) {
                formData.append('document', selectedFile);
            }

            // Submit form
            await AxiosInstance.post('/finances/transactions/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Call success callback
            onSuccess();
        } catch (error) {
            console.error('Error submitting transaction:', error);
            setSubmitError(
                error.response?.data?.detail ||
                'An error occurred while saving the transaction. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="md"
            fullWidth
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">
                            {watchTransactionType === 'income' ? 'Add Income' : 'Add Expense'}
                        </Typography>
                        <IconButton onClick={onClose} disabled={loading}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Transaction Type */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="transaction_type"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.transaction_type}>
                                        <InputLabel>Transaction Type</InputLabel>
                                        <Select
                                            {...field}
                                            label="Transaction Type"
                                        >
                                            <MenuItem value="income">Income</MenuItem>
                                            <MenuItem value="expense">Expense</MenuItem>
                                        </Select>
                                        {errors.transaction_type && (
                                            <FormHelperText>{errors.transaction_type.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Category */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.category}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            {...field}
                                            label="Category"
                                        >
                                            {watchTransactionType === 'income' ? (
                                                incomeCategories.map(category => (
                                                    <MenuItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                expenseCategories.map(category => (
                                                    <MenuItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                        {errors.category && (
                                            <FormHelperText>{errors.category.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Amount */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Amount"
                                        type="number"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AttachMoney />
                                                </InputAdornment>
                                            ),
                                        }}
                                        error={!!errors.amount}
                                        helperText={errors.amount?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Date */}
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Controller
                                    name="date"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.date,
                                                    helperText: errors.date?.message
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={3}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Description />
                                                </InputAdornment>
                                            ),
                                        }}
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider textAlign="left">
                                <Typography variant="body2" color="text.secondary">
                                    Additional Details
                                </Typography>
                            </Divider>
                        </Grid>

                        {/* Project */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="project"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Autocomplete
                                        options={projects}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={projects.find(project => project.id === value) || null}
                                        onChange={(_, newValue) => {
                                            onChange(newValue ? newValue.id : null);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Related Project"
                                                error={!!errors.project}
                                                helperText={errors.project?.message}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <InputAdornment position="start">
                                                                <AccountBalance />
                                                            </InputAdornment>
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Donor */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="donor"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Autocomplete
                                        options={donors}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={donors.find(donor => donor.id === value) || null}
                                        onChange={(_, newValue) => {
                                            onChange(newValue ? newValue.id : null);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={watchTransactionType === 'income' ? "Donor" : "Paid To"}
                                                error={!!errors.donor}
                                                helperText={errors.donor?.message}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <InputAdornment position="start">
                                                                <Person />
                                                            </InputAdornment>
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Reference Number */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="reference_number"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Reference Number"
                                        placeholder="Check #, Invoice #, etc."
                                        error={!!errors.reference_number}
                                        helperText={errors.reference_number?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* File Upload */}
                        <Grid item xs={12}>
                            <Box sx={{ border: '1px dashed', borderColor: fileError ? 'error.main' : 'divider', borderRadius: 1, p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Supporting Document
                                </Typography>

                                {!selectedFile ? (
                                    <Box>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            startIcon={<UploadFile />}
                                            sx={{ mt: 1 }}
                                        >
                                            Upload Document
                                            <input
                                                type="file"
                                                hidden
                                                onChange={handleFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                        </Button>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                                            Attach receipts, invoices, or other supporting documents (PDF, JPEG, PNG, max 10MB)
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: 'action.hover',
                                        p: 1,
                                        borderRadius: 1
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AttachFile sx={{ mr: 1 }} />
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                                {selectedFile.name}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" onClick={handleRemoveFile} color="error">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}

                                {fileError && (
                                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        {fileError}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color={watchTransactionType === 'income' ? 'primary' : 'secondary'}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save Transaction'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TransactionForm;