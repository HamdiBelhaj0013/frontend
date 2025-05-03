import React, { useState, useEffect } from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Typography,
    Chip,
    Paper,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Warning,
    CalendarToday,
    Article,
    PictureAsPdf,
    SendRounded,
    CheckCircle,
    ExpandMore,
    ExpandLess,
    Close,
    HourglassEmpty
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AxiosInstance from '../Axios';

// Format currency function
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Enhanced component to display warnings and manage foreign donations
 */
const ForeignDonationWarning = ({ transaction, onRefresh }) => {
    // State
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expanded, setExpanded] = useState(true);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Publication details state
    const [journalReference, setJournalReference] = useState('');
    const [publicationDate, setPublicationDate] = useState(null);
    const [reportStatus, setReportStatus] = useState('pending');

    // Used to control showing success/error messages
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Helper to check if this is a foreign donation
    const isForeignDonation = () => {
        return transaction &&
            transaction.transaction_type === 'income' &&
            transaction.donor_details &&
            !transaction.donor_details.is_member &&
            !transaction.donor_details.is_internal;
    };


    // Fetch the foreign donation report for this transaction
    useEffect(() => {
        if (!isForeignDonation()) {
            return;
        }

        const fetchReport = async () => {
            try {
                setLoading(true);
                // Get all reports and filter for this transaction
                const response = await AxiosInstance.get('/finances/foreign-donation-reports/');

                // Find the report for this transaction
                const transactionReport = response.data.find(
                    r => r.transaction === transaction.id
                );

                if (transactionReport) {
                    setReport(transactionReport);
                    setJournalReference(transactionReport.journal_publication_reference || '');
                    setPublicationDate(transactionReport.journal_publication_date ?
                        dayjs(transactionReport.journal_publication_date) : null);
                    setReportStatus(transactionReport.report_status);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching foreign donation report:', err);
                setError('Erreur lors du chargement du rapport de don étranger');
                setLoading(false);
            }
        };

        fetchReport();
    }, [transaction]);

    // Handle showing notifications
    const handleNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    // Close notification
    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Generate letter function
    const handleGenerateLetter = async () => {
        if (!report) {
            // Create report first if it doesn't exist
            await handleCreateReport();
            return;
        }

        try {
            setLoadingAction(true);
            await AxiosInstance.post(`/finances/foreign-donation-reports/${report.id}/generate_letter/`);

            // Refresh report data
            const response = await AxiosInstance.get(`/finances/foreign-donation-reports/${report.id}/`);
            setReport(response.data);

            handleNotification('Lettre générée avec succès');

            if (onRefresh) onRefresh();
            setLoadingAction(false);
        } catch (err) {
            console.error('Error generating letter:', err);
            handleNotification('Erreur lors de la génération de la lettre', 'error');
            setLoadingAction(false);
        }
    };

    // Create a new report
    const handleCreateReport = async () => {
        if (!transaction) return;

        try {
            setLoadingAction(true);

            // Create a new report for this transaction
            const formData = {
                transaction: transaction.id,
                report_required: true,
                reporting_deadline: dayjs().add(30, 'day').format('YYYY-MM-DD')
            };

            const response = await AxiosInstance.post('/finances/foreign-donation-reports/', formData);
            setReport(response.data);

            // Generate the letter immediately
            await AxiosInstance.post(`/finances/foreign-donation-reports/${response.data.id}/generate_letter/`);

            // Refresh report data
            const updatedResponse = await AxiosInstance.get(`/finances/foreign-donation-reports/${response.data.id}/`);
            setReport(updatedResponse.data);
            setJournalReference(updatedResponse.data.journal_publication_reference || '');
            setPublicationDate(updatedResponse.data.journal_publication_date ?
                dayjs(updatedResponse.data.journal_publication_date) : null);
            setReportStatus(updatedResponse.data.report_status);

            handleNotification('Rapport créé et lettre générée avec succès');

            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Error creating report:', err);
            handleNotification('Erreur lors de la création du rapport', 'error');
        } finally {
            setLoadingAction(false);
        }
    };

    // Download letter function
    const handleDownloadLetter = () => {
        if (!report || !report.letter_file) return;
        window.open(report.letter_file, '_blank');
    };

    // Update report status
    const handleUpdateStatus = async () => {
        if (!report) return;

        try {
            setLoadingAction(true);
            const payload = {
                status: reportStatus,
                journal_publication_reference: journalReference,
                journal_publication_date: publicationDate ? publicationDate.format('YYYY-MM-DD') : null
            };

            await AxiosInstance.post(`/finances/foreign-donation-reports/${report.id}/update_status/`, payload);

            // Refresh report data
            const response = await AxiosInstance.get(`/finances/foreign-donation-reports/${report.id}/`);
            setReport(response.data);

            handleNotification('Statut mis à jour avec succès');
            setDetailDialogOpen(false);

            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Error updating report status:', err);
            handleNotification('Erreur lors de la mise à jour du statut', 'error');
        } finally {
            setLoadingAction(false);
        }
    };

    // Open detail dialog
    const handleOpenDetail = () => {
        setDetailDialogOpen(true);
    };

    // Close detail dialog
    const handleCloseDetail = () => {
        setDetailDialogOpen(false);
    };

    // Toggle expanded state
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // If not a foreign donation, don't render
    if (!isForeignDonation()) {
        return null;
    }

    // If the report is completed, don't show warning
    if (report && report.report_status === 'completed') {
        return null;
    }

    // Display loading state
    if (loading) {
        return (
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Vérification du statut du don étranger...</Typography>
            </Box>
        );
    }

    // Determine days left and deadline status
    const daysLeft = report ? report.days_until_deadline : 30;
    const deadlinePassed = daysLeft < 0;

    return (
        <>
            <Paper
                elevation={3}
                variant="outlined"
                sx={{
                    mt: 2,
                    mb: 2,
                    p: 0,
                    borderColor: deadlinePassed ? 'error.main' : 'warning.main',
                    borderWidth: 2,
                    overflow: 'hidden'
                }}
            >
                {/* Header with toggle */}
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: deadlinePassed ? 'error.main' : 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'white'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Warning sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Don d'origine étrangère - Déclaration Obligatoire
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={toggleExpanded}
                        sx={{ color: 'white' }}
                    >
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ p: 2 }}>
                        {/* Donor and amount info */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Donateur:
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {transaction.donor_details.name}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Montant:
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {formatCurrency(transaction.amount)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Date:
                                </Typography>
                                <Typography variant="body1">
                                    {dayjs(transaction.date).format('DD/MM/YYYY')}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Explanation */}
                        <Typography variant="body2" paragraph>
                            Selon la législation tunisienne, les dons étrangers doivent être déclarés auprès du Premier
                            Ministère et publiés dans un journal dans un délai de 30 jours.
                        </Typography>

                        {/* Deadline information */}
                        {report && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                    p: 1,
                                    bgcolor: deadlinePassed ? 'error.lighter' : 'warning.lighter',
                                    borderRadius: 1
                                }}
                            >
                                <CalendarToday
                                    fontSize="small"
                                    color={deadlinePassed ? 'error' : 'warning'}
                                    sx={{ mr: 1 }}
                                />
                                <Typography variant="body2" fontWeight="medium">
                                    Date limite: {dayjs(report.reporting_deadline).format('DD/MM/YYYY')}
                                    ({deadlinePassed ?
                                    `En retard de ${Math.abs(daysLeft)} jours` :
                                    `${daysLeft} jours restants`})
                                </Typography>
                            </Box>
                        )}

                        {/* Current status */}
                        {report && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Statut:
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        icon={
                                            report.report_status === 'pending' ? <HourglassEmpty fontSize="small" /> :
                                                report.report_status === 'sent' ? <SendRounded fontSize="small" /> :
                                                    report.report_status === 'acknowledged' ? <Article fontSize="small" /> :
                                                        <CheckCircle fontSize="small" />
                                        }
                                        label={
                                            report.report_status === 'pending' ? 'En attente' :
                                                report.report_status === 'sent' ? 'Lettre envoyée' :
                                                    report.report_status === 'acknowledged' ? 'Accusé de réception' :
                                                        report.report_status === 'completed' ? 'Processus terminé' :
                                                            report.report_status
                                        }
                                        color={
                                            report.report_status === 'pending' ? 'warning' :
                                                report.report_status === 'sent' ? 'info' :
                                                    report.report_status === 'acknowledged' ? 'primary' :
                                                        report.report_status === 'completed' ? 'success' :
                                                            'default'
                                        }
                                        size="small"
                                    />

                                    {report.letter_generated && (
                                        <Chip
                                            label="Lettre générée"
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                            icon={<PictureAsPdf fontSize="small" />}
                                        />
                                    )}

                                    {report.journal_publication_reference && (
                                        <Chip
                                            label="Publié au journal"
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                            icon={<Article fontSize="small" />}
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Actions */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {!report ? (
                                // No report exists yet
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={loadingAction ? <CircularProgress size={20} /> : <Article />}
                                    onClick={handleCreateReport}
                                    disabled={loadingAction}
                                >
                                    Créer rapport et lettre
                                </Button>
                            ) : !report.letter_generated ? (
                                // Report exists but no letter yet
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={loadingAction ? <CircularProgress size={20} /> : <PictureAsPdf />}
                                    onClick={handleGenerateLetter}
                                    disabled={loadingAction}
                                >
                                    Générer la lettre
                                </Button>
                            ) : (
                                // Letter exists
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<PictureAsPdf />}
                                    onClick={handleDownloadLetter}
                                    disabled={loadingAction}
                                >
                                    Télécharger la lettre
                                </Button>
                            )}

                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Article />}
                                onClick={handleOpenDetail}
                                disabled={loadingAction || !report}
                            >
                                Gérer la publication
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            </Paper>

            {/* Detail dialog for updating report status and journal publication */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetail}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Mettre à jour le rapport de don étranger</DialogTitle>

                <DialogContent dividers>
                    {/* Status selector */}
                    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                        <InputLabel>Statut du rapport</InputLabel>
                        <Select
                            value={reportStatus}
                            label="Statut du rapport"
                            onChange={(e) => setReportStatus(e.target.value)}
                        >
                            <MenuItem value="pending">En attente</MenuItem>
                            <MenuItem value="sent">Envoyé</MenuItem>
                            <MenuItem value="acknowledged">Accusé de réception</MenuItem>
                            <MenuItem value="completed">Processus terminé</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Journal publication details */}
                    <Typography variant="subtitle2" gutterBottom>
                        Détails de publication au journal
                    </Typography>

                    <TextField
                        label="Référence de publication"
                        fullWidth
                        value={journalReference}
                        onChange={(e) => setJournalReference(e.target.value)}
                        placeholder="Ex: Journal X, Édition du 15/05/2025, Page 8"
                        sx={{ mb: 2 }}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date de publication"
                            value={publicationDate}
                            onChange={(date) => setPublicationDate(date)}
                            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                        />
                    </LocalizationProvider>

                    {/* Instructions for completing the process */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle>Information</AlertTitle>
                        <Typography variant="body2">
                            Mettez à jour le statut du rapport en fonction de votre progression.
                            Marquez comme "Complété" uniquement lorsque tous les documents ont été déposés
                            et que la publication au journal a été effectuée.
                        </Typography>
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDetail} disabled={loadingAction}>Annuler</Button>
                    <Button
                        onClick={handleUpdateStatus}
                        variant="contained"
                        color="primary"
                        disabled={loadingAction}
                    >
                        {loadingAction ? <CircularProgress size={24} /> : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ForeignDonationWarning;