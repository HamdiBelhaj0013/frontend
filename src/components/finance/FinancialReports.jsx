import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Add,
    Refresh,
    Delete,
    Download,
    FileCopy,
    Description,
    InsertDriveFile,
    CloudDownload,
    CalendarToday,
    Assignment,
    AssignmentTurnedIn,
    AssignmentLate,
    Info
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AxiosInstance from '../Axios';

// Helper function to format dates
const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
};

// Report generation dialog component with improved validation and error handling
const GenerateReportDialog = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        report_type: 'monthly',
        title: '',
        start_date: null,
        end_date: null,
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatingReport, setGeneratingReport] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormData({
                report_type: 'monthly',
                title: '',
                start_date: null,
                end_date: null,
                notes: ''
            });
            setError('');
            setGeneratingReport(false);
        }
    }, [open]);

    // Generate title based on report type
    useEffect(() => {
        // Only auto-generate title if user hasn't entered one or just changed report type
        if (formData.report_type && (!formData.title || formData.title.startsWith('Monthly Report') ||
            formData.title.startsWith('Quarterly Report') || formData.title.startsWith('Annual Report') ||
            formData.title.startsWith('Custom Report'))) {

            let newTitle = '';
            const currentDate = dayjs();

            switch (formData.report_type) {
                case 'monthly':
                    newTitle = `Monthly Report - ${currentDate.subtract(1, 'month').format('MMMM YYYY')}`;
                    break;
                case 'quarterly':
                    const currentQuarter = Math.floor((currentDate.month()) / 3);
                    newTitle = `Quarterly Report - Q${currentQuarter} ${currentDate.year()}`;
                    break;
                case 'annual':
                    newTitle = `Annual Report - ${currentDate.subtract(1, 'year').year()}`;
                    break;
                case 'custom':
                    newTitle = 'Custom Report';
                    if (formData.start_date && formData.end_date) {
                        newTitle = `Custom Report - ${formatDate(formData.start_date)} to ${formatDate(formData.end_date)}`;
                    }
                    break;
                default:
                    newTitle = 'Financial Report';
            }

            setFormData(prev => ({ ...prev, title: newTitle }));
        }
    }, [formData.report_type, formData.start_date, formData.end_date]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const handleDateChange = (name, date) => {
        setFormData({
            ...formData,
            [name]: date
        });
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Report title is required');
            return false;
        }

        if (formData.report_type === 'custom') {
            if (!formData.start_date || !formData.end_date) {
                setError('Start and end dates are required for custom reports');
                return false;
            }

            if (dayjs(formData.start_date).isAfter(formData.end_date)) {
                setError('Start date cannot be after end date');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setGeneratingReport(true);
        setError('');

        try {
            const payload = {
                report_type: formData.report_type,
                title: formData.title,
                notes: formData.notes
            };

            // Only add dates for custom reports
            if (formData.report_type === 'custom') {
                payload.start_date = dayjs(formData.start_date).format('YYYY-MM-DD');
                payload.end_date = dayjs(formData.end_date).format('YYYY-MM-DD');
            }

            console.log("Sending report generation request:", payload);

            const response = await AxiosInstance.post('/finances/financial-reports/generate_report/', payload);
            console.log("Report generation response:", response.data);

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error generating report:', err);
            let errorMessage = 'Failed to generate report';

            if (err.response) {
                if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.status === 500) {
                    errorMessage = 'Server error while generating report. Please try again later.';
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
            setGeneratingReport(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={loading}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <Description sx={{ mr: 1 }} />
                    <Typography variant="h6">
                        Generate Financial Report
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {generatingReport && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            <Typography>
                                Generating report... This may take a moment.
                            </Typography>
                        </Box>
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Report Type</InputLabel>
                            <Select
                                name="report_type"
                                value={formData.report_type}
                                onChange={handleChange}
                                label="Report Type"
                                disabled={loading}
                            >
                                <MenuItem value="monthly">Monthly Report</MenuItem>
                                <MenuItem value="quarterly">Quarterly Report</MenuItem>
                                <MenuItem value="annual">Annual Report</MenuItem>
                                <MenuItem value="custom">Custom Period</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="title"
                            label="Report Title"
                            fullWidth
                            margin="normal"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </Grid>

                    {formData.report_type === 'custom' && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start Date"
                                        value={formData.start_date}
                                        onChange={(date) => handleDateChange('start_date', date)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                margin: 'normal',
                                                required: true,
                                                disabled: loading
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End Date"
                                        value={formData.end_date}
                                        onChange={(date) => handleDateChange('end_date', date)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                margin: 'normal',
                                                required: true,
                                                disabled: loading
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            name="notes"
                            label="Notes"
                            fullWidth
                            multiline
                            rows={3}
                            margin="normal"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        <Info fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Report Information
                    </Typography>
                    <Typography variant="body2">
                        {formData.report_type === 'monthly' &&
                            "Monthly reports include financial data for the previous complete month."}
                        {formData.report_type === 'quarterly' &&
                            "Quarterly reports include financial data for the previous complete quarter."}
                        {formData.report_type === 'annual' &&
                            "Annual reports include financial data for the previous complete fiscal year."}
                        {formData.report_type === 'custom' &&
                            "Custom reports allow you to specify your own date range for the financial data."}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Report status chip component
const ReportStatusChip = ({ status }) => {
    if (status === 'finalized') {
        return (
            <Chip
                size="small"
                color="success"
                icon={<AssignmentTurnedIn fontSize="small" />}
                label="Finalized"
                sx={{ fontWeight: 500 }}
            />
        );
    }
    return (
        <Chip
            size="small"
            color="warning"
            icon={<AssignmentLate fontSize="small" />}
            label="Draft"
            sx={{ fontWeight: 500 }}
        />
    );
};

// Report type chip component
const ReportTypeChip = ({ type }) => {
    const getTypeConfig = (type) => {
        switch (type) {
            case 'monthly':
                return { label: 'Monthly', color: 'primary.light', textColor: 'primary.dark' };
            case 'quarterly':
                return { label: 'Quarterly', color: 'success.light', textColor: 'success.dark' };
            case 'annual':
                return { label: 'Annual', color: 'secondary.light', textColor: 'secondary.dark' };
            case 'custom':
                return { label: 'Custom', color: 'info.light', textColor: 'info.dark' };
            default:
                return { label: type, color: 'grey.300', textColor: 'text.primary' };
        }
    };

    const config = getTypeConfig(type);

    return (
        <Chip
            size="small"
            label={config.label}
            sx={{
                bgcolor: config.color,
                color: config.textColor,
                fontWeight: 500,
                fontSize: '0.75rem'
            }}
        />
    );
};

// Main financial reports component
const FinancialReports = ({ onRefresh }) => {
    const theme = useTheme();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch reports from API
    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get('/finances/financial-reports/');
            setReports(response.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError('Failed to load financial reports. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load reports on component mount
    useEffect(() => {
        fetchReports();
    }, []);

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle report deletion
    const handleDeleteReport = (report) => {
        setSelectedReport(report);
        setDeleteDialogOpen(true);
    };

    // Confirm report deletion
    const confirmDeleteReport = async () => {
        if (!selectedReport) return;

        setActionLoading(true);
        try {
            await AxiosInstance.delete(`/finances/financial-reports/${selectedReport.id}/`);
            setDeleteDialogOpen(false);
            setSelectedReport(null);
            fetchReports();
            if (onRefresh) {
                onRefresh();
            }
        } catch (err) {
            console.error('Error deleting report:', err);
            setError('Failed to delete report');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle report download
// Replace this function in FinancialReports.jsx
    const handleDownloadReport = (report) => {
        if (report.id) {
            // Get file from API download endpoint instead of direct URL
            AxiosInstance.get(`/finances/financial-reports/${report.id}/download/`, {
                responseType: 'blob'  // Important for file downloads
            })
                .then(response => {
                    // Get filename from Content-Disposition header if available
                    let filename;
                    const contentDisposition = response.headers['content-disposition'];
                    if (contentDisposition) {
                        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                        if (fileNameMatch.length === 2) {
                            filename = fileNameMatch[1];
                        }
                    }

                    // Default filename if not found in header
                    if (!filename) {
                        filename = `report_${report.id}.xlsx`;
                    }

                    // Create a URL for the blob
                    const url = window.URL.createObjectURL(new Blob([response.data]));

                    // Create a temporary link element and trigger download
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();

                    // Clean up
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.error('Error downloading report:', error);
                    // You can add a notification here to show the user there was an error
                });
        }
    };

    // Handle report generation success
    const handleReportGenerationSuccess = () => {
        fetchReports();
        if (onRefresh) {
            onRefresh();
        }
    };

    // Handle finalizing a report
// Replace this function in FinancialReports.jsx
    const handleFinalizeReport = async (report) => {
        try {
            // Try to use PATCH first (this will work with the ModelViewSet change)
            try {
                await AxiosInstance.patch(`/finances/financial-reports/${report.id}/`, {
                    status: 'finalized'
                });
                fetchReports();
            } catch (err) {
                // If PATCH fails, try the dedicated finalize endpoint
                if (err.response && err.response.status === 405) {
                    await AxiosInstance.post(`/finances/financial-reports/${report.id}/finalize/`);
                    fetchReports();
                } else {
                    // If it's not a Method Not Allowed error, rethrow
                    throw err;
                }
            }
        } catch (err) {
            console.error('Error finalizing report:', err);
            setError('Failed to finalize report');
        }
    };

    return (
        <Box>
            {/* Header with action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    Financial Reports
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchReports}
                        sx={{ mr: 1 }}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setGenerateDialogOpen(true)}
                        disabled={loading}
                    >
                        Generate Report
                    </Button>
                </Box>
            </Box>

            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Loading indicator */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Reports table */}
            {!loading && (
                <>
                    {reports.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <Assignment color="info" sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                            <Typography variant="h6" gutterBottom>
                                No Financial Reports
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                There are no financial reports generated yet. Generate your first report to get started.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setGenerateDialogOpen(true)}
                            >
                                Generate First Report
                            </Button>
                        </Paper>
                    ) : (
                        <>
                            <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto', borderRadius: 2 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reports
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((report) => (
                                                <TableRow key={report.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {report.title}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ReportTypeChip type={report.report_type} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDate(report.start_date)} - {formatDate(report.end_date)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ReportStatusChip status={report.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDate(report.created_at)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex' }}>
                                                            {report.report_file && (
                                                                <Tooltip title="Download Report">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="primary"
                                                                        onClick={() => handleDownloadReport(report)}
                                                                    >
                                                                        <CloudDownload fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {report.status === 'draft' && (
                                                                <Tooltip title="Finalize Report">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="success"
                                                                        onClick={() => handleFinalizeReport(report)}
                                                                    >
                                                                        <AssignmentTurnedIn fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            <Tooltip title="Delete Report">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteReport(report)}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={reports.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ borderTop: 'none' }}
                            />
                        </>
                    )}
                </>
            )}

            {/* Generate report dialog */}
            <GenerateReportDialog
                open={generateDialogOpen}
                onClose={() => setGenerateDialogOpen(false)}
                onSuccess={handleReportGenerationSuccess}
            />

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this report? This action cannot be undone.
                    </Typography>
                    {selectedReport && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 1 }}>
                            <Typography variant="subtitle2">
                                {selectedReport.title}
                            </Typography>
                            <Typography variant="body2">
                                {formatDate(selectedReport.start_date)} to {formatDate(selectedReport.end_date)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteReport}
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

export default FinancialReports;