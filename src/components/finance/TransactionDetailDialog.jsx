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

// Fonction utilitaire pour formater les montants avec la devise
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
};

const TransactionDetailDialog = ({ open, onClose, transaction }) => {
    if (!transaction) return null;

    // Chip de statut basée sur le statut de la transaction
    const getStatusChip = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <Chip
                        color="success"
                        icon={<Check />}
                        label="Vérifié"
                        sx={{ fontWeight: 600 }}
                    />
                );
            case 'rejected':
                return (
                    <Chip
                        color="error"
                        icon={<Close />}
                        label="Rejeté"
                        sx={{ fontWeight: 600 }}
                    />
                );
            default:
                return (
                    <Chip
                        color="warning"
                        icon={<Warning />}
                        label="En attente"
                        sx={{ fontWeight: 600 }}
                    />
                );
        }
    };

    // Gérer le téléchargement du document si disponible
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
                        Détails de la Transaction
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* En-tête avec montant et type */}
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
                                    {transaction.transaction_type === 'income' ? 'REVENU' : 'DÉPENSE'}
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

                    {/* Détails principaux de la transaction */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <Description sx={{ fontSize: 18, mr: 1 }} />
                                Description
                            </Typography>
                            <Typography variant="body1">
                                {transaction.description || 'Aucune description fournie'}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <Category sx={{ fontSize: 18, mr: 1 }} />
                                Catégorie
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
                                    Numéro de Référence
                                </Typography>
                                <Typography variant="body1">
                                    {transaction.reference_number}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Entités liées et vérification */}
                    <Grid item xs={12} md={6}>
                        {transaction.project && transaction.project_details && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccountBalance sx={{ fontSize: 18, mr: 1 }} />
                                    Projet Associé
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
                                    {transaction.transaction_type === 'income' ? 'Donateur' : 'Payé À'}
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
                                    Vérifié Par
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
                                    le {dayjs(transaction.verification_date).format('DD MMMM YYYY, HH:mm')}
                                </Typography>
                            </Box>
                        )}

                        {transaction.verification_notes && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Notes de Vérification
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        {transaction.verification_notes}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                    </Grid>

                    {/* Section des documents justificatifs */}
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
                                            Document Justificatif
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

                    {/* Informations de création */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Créé par: {transaction.created_by_details
                                ? (transaction.created_by_details.full_name || transaction.created_by_details.email)
                                : 'Système'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ID de Transaction: {transaction.id}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fermer</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransactionDetailDialog;