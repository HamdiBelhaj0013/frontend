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
    Divider,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import {
    AttachMoney,
    Description,
    AccountBalance,
    Person,
    Close,
    AttachFile,
    UploadFile,
    Delete,
    Business,
    Receipt,
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

// Define income categories that don't need project association
const nonProjectIncomeCategories = ['membership_fee', 'other_income'];

// Common expense recipients based on the expense report
const commonExpenseRecipients = [
    { id: 'team_member', name: 'Team Member' },
    { id: 'non_member', name: 'Non-Member (External)' },
    { id: 'cnss', name: 'CNSS (Social Security)' },
    { id: 'internet', name: 'Internet Provider' },
    { id: 'rent', name: 'Office Rent' },
    { id: 'attaysir', name: 'Attaysir Rent Car' },
    { id: 'vendor', name: 'Vendor/Supplier' },
    { id: 'utility', name: 'Utility Payment' },
    { id: 'tax_authority', name: 'Tax Authority' },
    { id: 'other', name: 'Other' }
];

// Helper function to format amount with currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

// Form validation schema with conditional validation for project and donor
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
    // Project is required only for specific conditions:
    // 1. For expenses that are project-wide
    // 2. For income that is not membership fee or other income
    project: yup.number().nullable().when(['transaction_type', 'category', 'is_project_wide'], {
        is: (type, category, isProjectWide) =>
            (type === 'expense' && isProjectWide) ||
            (type === 'income' && !nonProjectIncomeCategories.includes(category)),
        then: schema => schema.required('Project is required'),
        otherwise: schema => schema.nullable()
    }),
    budget_allocation: yup.number().nullable(),
    paid_to: yup.string().nullable(), // For expense recipients
    paid_to_notes: yup.string().when('recipient_type', {
        is: 'non_member',
        then: schema => schema.required('Notes are required for non-member recipients')
    }),
    // Donor is required only for specific conditions:
    // For now, just for donations
    donor: yup.number().nullable().when(['transaction_type', 'category'], {
        is: (type, category) => type === 'income' && category === 'donation',
        then: schema => schema.required('Donor is required for donations'),
        otherwise: schema => schema.nullable()
    }),
    reference_number: yup.string().nullable(),
    recipient_type: yup.string().when('transaction_type', {
        is: 'expense',
        then: schema => schema.required('Recipient type is required')
    }),
    is_project_wide: yup.boolean().default(false)
});

const TransactionForm = ({ open, onClose, type = 'income', onSuccess }) => {
    // States
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [donors, setDonors] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [nonMemberRecipients, setNonMemberRecipients] = useState([]);
    const [budgetAllocations, setBudgetAllocations] = useState([]);
    const [submitError, setSubmitError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [recipientType, setRecipientType] = useState('');
    const [customRecipient, setCustomRecipient] = useState('');
    const [recipientNotes, setRecipientNotes] = useState('');
    const [isProjectWide, setIsProjectWide] = useState(false);

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
            budget_allocation: null,
            donor: null,
            paid_to: '',
            paid_to_notes: '',
            reference_number: '',
            recipient_type: '',
            is_project_wide: false
        }
    });

    // Watch values for conditional rendering
    const watchTransactionType = watch('transaction_type');
    const watchCategory = watch('category');
    const watchProject = watch('project');
    const watchRecipientType = watch('recipient_type');
    const watchIsProjectWide = watch('is_project_wide');

    // Check if project is required
    const isProjectRequired =
        (watchTransactionType === 'expense' && watchIsProjectWide) ||
        (watchTransactionType === 'income' && !nonProjectIncomeCategories.includes(watchCategory));

    // Fetch team members from API
    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await AxiosInstance.get('/api/member/');
                setTeamMembers(response.data.map(member => ({
                    id: member.id,
                    name: member.name || member.full_name || member.username // Use name from your API response first
                })));
                console.log('Team members fetched:', response.data); // Add this for debugging
            } catch (error) {
                console.error('Error fetching team members:', error);
                // Fallback to empty array if API fails
                setTeamMembers([]);
            }
        };

        fetchTeamMembers();
    }, []);

    // Load projects, donors, and non-member recipients on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch projects
                const projectsResponse = await AxiosInstance.get('/api/project/');
                setProjects(projectsResponse.data);

                // Fetch donors (only needed for income transactions)
                if (watchTransactionType === 'income') {
                    const donorsResponse = await AxiosInstance.get('/finances/donors/');
                    setDonors(donorsResponse.data);
                }

                // Fetch non-member recipients (for expense transactions)
                if (watchTransactionType === 'expense') {
                    try {
                        const nonMembersResponse = await AxiosInstance.get('/api/non-members/');
                        setNonMemberRecipients(nonMembersResponse.data);
                    } catch (err) {
                        // If the endpoint doesn't exist or fails, we'll just leave the list empty
                        console.warn('Could not fetch non-member recipients', err);
                        setNonMemberRecipients([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [watchTransactionType]);

    // Load budget allocations when a project is selected
    useEffect(() => {
        const fetchBudgetAllocations = async () => {
            if (!watchProject) {
                setBudgetAllocations([]);
                setValue('budget_allocation', null);
                return;
            }

            try {
                // Fetch budget allocations for the selected project
                const response = await AxiosInstance.get('/finances/budget-allocations/', {
                    params: { project: watchProject }
                });
                setBudgetAllocations(response.data);
            } catch (error) {
                console.error('Error fetching budget allocations:', error);
            }
        };

        fetchBudgetAllocations();
    }, [watchProject, setValue]);

    // Update form when income category changes
    useEffect(() => {
        // If switched to a non-project income category, clear the project field
        if (watchTransactionType === 'income' && nonProjectIncomeCategories.includes(watchCategory)) {
            setValue('project', null);
        }
    }, [watchCategory, watchTransactionType, setValue]);

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
                budget_allocation: null,
                donor: null,
                paid_to: '',
                paid_to_notes: '',
                reference_number: '',
                recipient_type: '',
                is_project_wide: false
            });
            setSelectedFile(null);
            setFileError('');
            setSubmitError('');
            setRecipientType('');
            setCustomRecipient('');
            setRecipientNotes('');
            setIsProjectWide(false);
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

    // Handle recipient type change
    const handleRecipientTypeChange = (e) => {
        const newRecipientType = e.target.value;
        setRecipientType(newRecipientType);
        setValue('recipient_type', newRecipientType);

        // Reset the paid_to field when changing recipient types
        setValue('paid_to', '');

        // Reset notes when changing away from non_member
        if (newRecipientType !== 'non_member') {
            setValue('paid_to_notes', '');
            setRecipientNotes('');
        }
    };

    // Handle team member selection
    const handleTeamMemberChange = (event) => {
        setValue('paid_to', event.target.value);
    };

    // Handle non-member selection
    const handleNonMemberChange = (event) => {
        setValue('paid_to', event.target.value);
    };

    // Handle custom recipient input
    const handleCustomRecipientChange = (e) => {
        setCustomRecipient(e.target.value);
        setValue('paid_to', e.target.value);
    };

    // Handle recipient notes change
    const handleRecipientNotesChange = (e) => {
        setRecipientNotes(e.target.value);
        setValue('paid_to_notes', e.target.value);
    };

    // Handle project-wide toggle
    const handleProjectWideChange = (e) => {
        const isChecked = e.target.checked;
        setIsProjectWide(isChecked);
        setValue('is_project_wide', isChecked);

        // If not project-wide, we don't require project selection
        if (!isChecked && !watchProject) {
            setValue('project', null);
        }
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

            // Only include project if selected
            if (data.project !== null) {
                formData.append('project', data.project);
            }

            // Add budget_allocation if selected
            if (data.budget_allocation !== null) {
                formData.append('budget_allocation', data.budget_allocation);
            }

            // For income transactions, always include donor field if available
            if (data.transaction_type === 'income') {
                if (data.donor !== null) {
                    console.log("Adding donor ID to request:", data.donor);
                    formData.append('donor', data.donor);
                }
            }
            // For expense transactions with a recipient
            else if (data.transaction_type === 'expense' && data.paid_to) {
                // Enhanced handling based on recipient type
                switch(data.recipient_type) {
                    case 'team_member':
                        // For team members, we might have an API to find their ID
                        // For now, add to the description
                        const teamMemberDescription = `${data.description} (Paid to team member: ${data.paid_to})`;
                        formData.set('description', teamMemberDescription);

                        // If you have a team member ID, you could use it here
                        // formData.append('team_member_id', teamMemberId);
                        break;

                    case 'non_member':
                        // For non-members, include both name and notes
                        const nonMemberDescription = `${data.description} (Paid to: ${data.paid_to})`;
                        formData.set('description', nonMemberDescription);

                        // Add notes as a separate field if your API supports it
                        if (data.paid_to_notes) {
                            formData.append('recipient_notes', data.paid_to_notes);
                        }
                        break;

                    default:
                        // For other recipient types (CNSS, vendors, etc.)
                        const recipientDescription = `${data.description} (Paid to ${data.recipient_type}: ${data.paid_to})`;
                        formData.set('description', recipientDescription);
                }

                // You could also store the recipient type in a custom field
                formData.append('recipient_type', data.recipient_type);
                formData.append('paid_to', data.paid_to);

                // Flag whether this is a project-wide expense
                formData.append('is_project_wide', data.is_project_wide ? '1' : '0');
            }

            if (data.reference_number) {
                formData.append('reference_number', data.reference_number);
            }

            // Append file if selected
            if (selectedFile) {
                formData.append('document', selectedFile);
            }

            // Log FormData entries for debugging
            console.log("Submitting transaction with data:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            // Submit form
            const response = await AxiosInstance.post('/finances/transactions/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Transaction saved successfully:", response.data);

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

    // Determine if donor is required based on income category
    const isDonorRequired =
        watchTransactionType === 'income' &&
        watchCategory === 'donation'; // Only require donor for donation category

    // Render recipient selection based on transaction type
    const renderRecipientField = () => {
        if (watchTransactionType === 'income') {
            // For income transactions, show donor selection
            return (
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
                                console.log("Donor selected:", newValue ? newValue.id : null);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={isDonorRequired ? "Donor (Required)" : "Donor"}
                                    error={!!errors.donor}
                                    helperText={errors.donor?.message ||
                                        (watchCategory === 'membership_fee' ?
                                            "For membership fees, donor is optional" : "")}
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
            );
        } else {
            // For expense transactions, show recipient type selection and conditional fields
            return (
                <>
                    <Controller
                        name="recipient_type"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth error={!!errors.recipient_type}>
                                <InputLabel>Recipient Type</InputLabel>
                                <Select
                                    {...field}
                                    label="Recipient Type"
                                >
                                    <MenuItem value="">
                                        <em>Select recipient type</em>
                                    </MenuItem>
                                    {commonExpenseRecipients.map((recipient) => (
                                        <MenuItem key={recipient.id} value={recipient.id}>
                                            {recipient.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.recipient_type && (
                                    <FormHelperText>{errors.recipient_type.message}</FormHelperText>
                                )}
                            </FormControl>
                        )}
                    />

                    {watchRecipientType === 'team_member' && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Team Member</InputLabel>
                            <Select
                                value={watch('paid_to') || ''}
                                onChange={handleTeamMemberChange}
                                label="Team Member"
                                error={!!errors.paid_to}
                            >
                                <MenuItem value="">
                                    <em>Select team member</em>
                                </MenuItem>
                                {teamMembers.map((member) => (
                                    <MenuItem key={member.id} value={member.name}>
                                        {member.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.paid_to && (
                                <FormHelperText error>{errors.paid_to.message}</FormHelperText>
                            )}
                            {teamMembers.length === 0 && (
                                <FormHelperText>No team members found. Please check API connection.</FormHelperText>
                            )}
                        </FormControl>
                    )}

                    {watchRecipientType === 'non_member' && (
                        <>
                            <TextField
                                fullWidth
                                label="Recipient Name"
                                value={watch('paid_to') || ''}
                                onChange={handleCustomRecipientChange}
                                error={!!errors.paid_to}
                                helperText={errors.paid_to?.message}
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Recipient Notes (Required)"
                                value={recipientNotes}
                                onChange={handleRecipientNotesChange}
                                error={!!errors.paid_to_notes}
                                helperText={errors.paid_to_notes?.message || "Please provide details about this non-member recipient"}
                                multiline
                                rows={2}
                                sx={{ mt: 2 }}
                            />
                        </>
                    )}

                    {watchRecipientType === 'other' && (
                        <TextField
                            fullWidth
                            label="Recipient Name"
                            value={customRecipient}
                            onChange={handleCustomRecipientChange}
                            error={!!errors.paid_to}
                            helperText={errors.paid_to?.message}
                            sx={{ mt: 2 }}
                        />
                    )}

                    {/* Project-wide expense checkbox - only show for expense transactions */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isProjectWide}
                                onChange={handleProjectWideChange}
                                name="is_project_wide"
                            />
                        }
                        label="This expense applies to the entire project"
                        sx={{ mt: 2, display: 'block' }}
                    />
                </>
            );
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

                        {/* Project - only required for certain scenarios */}
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
                                        disabled={watchTransactionType === 'income' && nonProjectIncomeCategories.includes(watchCategory)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={isProjectRequired ? "Related Project (Required)" : "Related Project"}
                                                error={!!errors.project}
                                                helperText={
                                                    errors.project?.message ||
                                                    (watchTransactionType === 'income' && nonProjectIncomeCategories.includes(watchCategory) ?
                                                        "Project not required for this income type" : "")
                                                }
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

                        {/* Budget Allocation - Only show for expenses when a project is selected */}
                        {watchTransactionType === 'expense' && watchProject && (
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="budget_allocation"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <FormControl fullWidth error={!!errors.budget_allocation}>
                                            <InputLabel>Budget Allocation</InputLabel>
                                            <Select
                                                value={value || ''}
                                                onChange={(e) => onChange(e.target.value || null)}
                                                label="Budget Allocation"
                                            >
                                                <MenuItem value="">
                                                    <em>Select a budget allocation</em>
                                                </MenuItem>
                                                {budgetAllocations.map((budget) => (
                                                    <MenuItem key={budget.id} value={budget.id}>
                                                        {formatCurrency(budget.allocated_amount)} - Remaining: {formatCurrency(budget.remaining_amount)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {budgetAllocations.length === 0 && (
                                                <FormHelperText>
                                                    No budget allocations found for this project
                                                </FormHelperText>
                                            )}
                                            {errors.budget_allocation && (
                                                <FormHelperText>{errors.budget_allocation.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        )}

                        {/* Donor (for income) or Paid To (for expense) */}
                        <Grid item xs={12} sm={6}>
                            {renderRecipientField()}
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Receipt fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
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