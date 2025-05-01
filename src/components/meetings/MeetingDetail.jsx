import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    Grid,
    Divider,
    Chip,
    Avatar,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Card,
    CardContent,
    LinearProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
    TextField,
    Badge
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import {
    Event,
    EventAvailable,
    EventBusy,
    LocationOn,
    AccessTime,
    Groups,
    Description,
    Assignment,
    ArrowBack,
    PersonAdd,
    Add,
    Cancel,
    CheckCircle,
    VideoCall,
    Download,
    PictureAsPdf,
    EditNote,
    Delete,
    Visibility,
    Person,
    Check,
    Close
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AxiosInstance from '../Axios.jsx';
import moment from 'moment';
import { motion } from 'framer-motion';
// Enhanced AttendeesTab Component
import {Checkbox, InputAdornment} from '@mui/material';
import {Search} from '@mui/icons-material';
import { usePermissions } from '../../contexts/PermissionsContext';
const HeaderContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4a6bd8, #3949AB)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    height: '100%',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiTab-root': {
        minWidth: 100,
        fontWeight: 500,
        textTransform: 'none',
        '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 600,
        }
    },
    '& .MuiTabs-indicator': {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    }
}));

const AttendeeItem = styled(ListItem)(({ theme }) => ({
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
}));

const AgendaItem = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: '8px',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    }
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`meeting-tabpanel-${index}`}
            aria-labelledby={`meeting-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Status chip component
const StatusChip = ({ status }) => {
    const theme = useTheme();

    let color, icon, label;

    switch (status) {
        case 'scheduled':
            color = theme.palette.success.main;
            icon = <EventAvailable fontSize="small" />;
            label = 'Planifiée';
            break;
        case 'cancelled':
            color = theme.palette.error.main;
            icon = <EventBusy fontSize="small" />;
            label = 'Annulée';
            break;
        case 'completed':
            color = theme.palette.text.secondary;
            icon = <Event fontSize="small" />;
            label = 'Terminée';
            break;
        case 'postponed':
            color = theme.palette.warning.main;
            icon = <Event fontSize="small" />;
            label = 'Reportée';
            break;
        case 'in_progress':
            color = theme.palette.info.main;
            icon = <Event fontSize="small" />;
            label = 'En Cours';
            break;
        default:
            color = theme.palette.primary.main;
            icon = <Event fontSize="small" />;
            label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Inconnu';
    }

    return (
        <Chip
            size="medium"
            label={label}
            icon={icon}
            sx={{
                color: color,
                bgcolor: alpha(color, 0.1),
                fontWeight: 500,
                '& .MuiChip-icon': {
                    color,
                }
            }}
        />
    );
};

// Type chip component
const TypeChip = ({ type }) => {
    const theme = useTheme();

    let color, label;

    switch (type) {
        case 'regular':
            color = theme.palette.primary.main;
            label = 'Réunion Ordinaire';
            break;
        case 'board':
            color = theme.palette.success.main;
            label = 'Réunion du Conseil';
            break;
        case 'extraordinary':
            color = theme.palette.error.main;
            label = 'Réunion Extraordinaire';
            break;
        case 'general_assembly':
            color = theme.palette.warning.main;
            label = 'Assemblée Générale';
            break;
        case 'committee':
            color = theme.palette.info.main;
            label = 'Réunion de Comité';
            break;
        default:
            color = theme.palette.grey[600];
            label = 'Autre';
    }

    return (
        <Chip
            size="medium"
            label={label}
            sx={{
                color: color,
                bgcolor: alpha(color, 0.1),
                fontWeight: 500,
            }}
        />
    );
};

// Attendance status chip
const AttendanceStatusChip = ({ status }) => {
    const theme = useTheme();

    let color, label;

    switch (status) {
        case 'present':
            color = theme.palette.success.main;
            label = 'Présent';
            break;
        case 'absent':
            color = theme.palette.error.main;
            label = 'Absent';
            break;
        case 'excused':
            color = theme.palette.warning.main;
            label = 'Excusé';
            break;
        case 'late':
            color = theme.palette.info.main;
            label = 'En Retard';
            break;
        default:
            color = theme.palette.grey[600];
            label = status ? status : 'Inconnu';
    }

    return (
        <Chip
            size="small"
            label={label}
            sx={{
                color: color,
                bgcolor: alpha(color, 0.1),
                fontWeight: 500,
            }}
        />
    );
};

const MeetingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    // Add the permissions hook
    const { can, RESOURCES, ACTIONS } = usePermissions();

    // Check if user has edit permissions
    const canEditMeetings = can(ACTIONS.EDIT, RESOURCES.MEETINGS);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meeting, setMeeting] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [agendaItems, setAgendaItems] = useState([]);
    const [reports, setReports] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openMinutesDialog, setOpenMinutesDialog] = useState(false);
    const [minutes, setMinutes] = useState('');
    const [generatingReport, setGeneratingReport] = useState(false);

    // Fetch meeting data
    useEffect(() => {
        const fetchMeetingData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch meeting details
                const meetingResponse = await AxiosInstance.get(`/meetings/meetings/${id}/`);
                setMeeting(meetingResponse.data);

                // Fetch attendees
                const attendeesResponse = await AxiosInstance.get(`/meetings/attendees/?meeting=${id}`);
                setAttendees(attendeesResponse.data);

                // Fetch agenda items
                const agendaResponse = await AxiosInstance.get(`/meetings/agenda-items/?meeting=${id}`);
                setAgendaItems(agendaResponse.data);

                // Fetch reports
                const reportsResponse = await AxiosInstance.get(`/meetings/reports/?meeting=${id}`);
                setReports(reportsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Erreur lors de la récupération des données de réunion:', err);
                setError('Échec du chargement des détails de la réunion. Veuillez réessayer.');
                setLoading(false);
            }
        };

        if (id) {
            fetchMeetingData();
        }
    }, [id]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Format date for display
    const formatDate = (date) => {
        return moment(date).format('dddd, D MMMM YYYY');
    };

    // Format time for display
    const formatTime = (date) => {
        return moment(date).format('HH:mm');
    };

    // Handle minutes submission
    const handleSubmitMinutes = async () => {
        try {
            await AxiosInstance.post(`/meetings/meetings/${id}/mark_complete/`, {
                minutes: minutes
            });

            // Update meeting data
            const updatedMeeting = { ...meeting, minutes, status: 'completed' };
            setMeeting(updatedMeeting);
            setOpenMinutesDialog(false);

            // Show generate report dialog
            setOpenGenerateDialog(true);
        } catch (err) {
            console.error('Erreur lors de la soumission du procès-verbal:', err);
            setError('Échec de la soumission du procès-verbal. Veuillez réessayer.');
        }
    };

    // Handle cancel meeting
    const handleCancelMeeting = async () => {
        try {
            await AxiosInstance.patch(`/meetings/meetings/${id}/`, {
                status: 'cancelled'
            });

            // Update meeting data
            const updatedMeeting = { ...meeting, status: 'cancelled' };
            setMeeting(updatedMeeting);
            setOpenCancelDialog(false);
        } catch (err) {
            console.error('Erreur lors de l\'annulation de la réunion:', err);
            setError('Échec de l\'annulation de la réunion. Veuillez réessayer.');
        }
    };

    // Handle generate report
    const handleGenerateReport = async () => {
        try {
            setGeneratingReport(true);

            await AxiosInstance.post(`/meetings/meetings/${id}/generate_report/`, {
                include_attendance: true,
                include_agenda_items: true,
                include_minutes: true,
                report_title: `Rapport de Réunion: ${meeting.title}`,
                summary: 'Ce rapport résume les discussions, décisions et points d\'action de la réunion.'
            });

            // Fetch updated reports
            const reportsResponse = await AxiosInstance.get(`/meetings/reports/?meeting=${id}`);
            setReports(reportsResponse.data);

            setGeneratingReport(false);
            setOpenGenerateDialog(false);

            // Switch to reports tab
            setTabValue(3);
        } catch (err) {
            console.error('Erreur lors de la génération du rapport:', err);
            setError('Échec de la génération du rapport de réunion. Veuillez réessayer.');
            setGeneratingReport(false);
        }
    };

    // Motion animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Chargement des détails de la réunion...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/meetings')}
                    >
                        Retour aux Réunions
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!meeting) {
        return (
            <Container>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Réunion introuvable ou peut avoir été supprimée.
                </Alert>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/meetings')}
                    >
                        Retour aux Réunions
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Back button */}
                <motion.div variants={itemVariants}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/meetings')}
                        sx={{
                            mb: 2,
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            }
                        }}
                    >
                        Retour aux Réunions
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div variants={itemVariants}>
                    <HeaderContainer elevation={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    {meeting.title}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <StatusChip status={meeting.status} />
                                    <TypeChip type={meeting.meeting_type} />
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Event sx={{ mr: 1 }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Date
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {formatDate(meeting.start_date)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTime sx={{ mr: 1 }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Heure
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {formatTime(meeting.start_date)} - {formatTime(meeting.end_date)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Location Information - Modified to handle hybrid meetings */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <LocationOn sx={{ mr: 1 }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Lieu
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {meeting.location || 'Lieu non spécifié'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Only show if it's virtual or hybrid (has a meeting link) */}
                                    {meeting.meeting_link && (
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <VideoCall sx={{ mr: 1 }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                        Accès Virtuel
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight="medium"
                                                        component="a"
                                                        href={meeting.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{
                                                            color: 'primary.main',
                                                            textDecoration: 'none',
                                                            '&:hover': { textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        Rejoindre la Réunion
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Groups sx={{ mr: 1 }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Participants
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {attendees.length} invités
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {meeting.status === 'scheduled' && canEditMeetings && (
                                    <>
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate(`/meetings/edit/${id}`)}
                                            startIcon={<EditNote />}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                            }}
                                        >
                                            Modifier la Réunion
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            onClick={() => setOpenCancelDialog(true)}
                                            startIcon={<Cancel />}
                                            sx={{
                                                borderColor: 'rgba(255,255,255,0.3)',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                            }}
                                        >
                                            Annuler la Réunion
                                        </Button>
                                    </>
                                )}

                                {meeting.status === 'completed' && reports.length === 0 && canEditMeetings && (
                                    <Button
                                        variant="contained"
                                        onClick={() => setOpenGenerateDialog(true)}
                                        startIcon={<PictureAsPdf />}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                        }}
                                    >
                                        Générer un Rapport
                                    </Button>
                                )}

                                {meeting.status === 'in_progress' && canEditMeetings && (
                                    <Button
                                        variant="contained"
                                        onClick={() => setOpenMinutesDialog(true)}
                                        startIcon={<Assignment />}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                        }}
                                    >
                                        Finaliser & Ajouter le Procès-Verbal
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Decorative circles */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                zIndex: 0
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -30,
                                right: 100,
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                zIndex: 0
                            }}
                        />
                    </HeaderContainer>
                </motion.div>

                {/* Content */}
                <motion.div variants={itemVariants}>
                    <StyledPaper elevation={0}>
                        <StyledTabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="meeting tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                label="Détails"
                                icon={<Description />}
                                iconPosition="start"
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Participants
                                        <Badge
                                            badgeContent={attendees.length}
                                            color="primary"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                                icon={<Groups />}
                                iconPosition="start"
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Ordre du Jour
                                        <Badge
                                            badgeContent={agendaItems.length}
                                            color="primary"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                                icon={<Assignment />}
                                iconPosition="start"
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Rapports
                                        <Badge
                                            badgeContent={reports.length}
                                            color="primary"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                                icon={<PictureAsPdf />}
                                iconPosition="start"
                            />
                        </StyledTabs>

                        <TabPanel value={tabValue} index={0}>
                            <DetailTab meeting={meeting} />
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <AttendeesTab
                                attendees={attendees}
                                meetingId={id}
                                meetingStatus={meeting.status}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <AgendaTab
                                agendaItems={agendaItems}
                                meetingId={id}
                                meetingStatus={meeting.status}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={3}>
                            <ReportsTab
                                reports={reports}
                                meetingId={id}
                                meetingStatus={meeting.status}
                                onGenerateReport={() => setOpenGenerateDialog(true)}
                            />
                        </TabPanel>
                    </StyledPaper>
                </motion.div>
            </motion.div>

            {/* Cancel Meeting Dialog */}
            <Dialog
                open={openCancelDialog}
                onClose={() => setOpenCancelDialog(false)}
                aria-labelledby="cancel-meeting-dialog-title"
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle id="cancel-meeting-dialog-title">
                    Annuler la Réunion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir annuler cette réunion ? Cette action notifiera tous les participants et ne peut être annulée.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenCancelDialog(false)}
                        color="primary"
                    >
                        Non, Maintenir la Réunion
                    </Button>
                    <Button
                        onClick={handleCancelMeeting}
                        color="error"
                        variant="contained"
                        startIcon={<Cancel />}
                    >
                        Oui, Annuler la Réunion
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Minutes Dialog */}
            <Dialog
                open={openMinutesDialog}
                onClose={() => setOpenMinutesDialog(false)}
                aria-labelledby="minutes-dialog-title"
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle id="minutes-dialog-title">
                    Ajouter le Procès-Verbal
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Ajoutez le procès-verbal de cette réunion. Cela marquera la réunion comme terminée.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        multiline
                        rows={10}
                        fullWidth
                        label="Procès-Verbal de la Réunion"
                        variant="outlined"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenMinutesDialog(false)}
                        color="inherit"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmitMinutes}
                        color="primary"
                        variant="contained"
                        disabled={!minutes.trim()}
                        startIcon={<CheckCircle />}
                    >
                        Terminer la Réunion
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Generate Report Dialog */}
            <Dialog
                open={openGenerateDialog}
                onClose={() => setOpenGenerateDialog(false)}
                aria-labelledby="generate-report-dialog-title"
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle id="generate-report-dialog-title">
                    Générer un Rapport de Réunion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Générez un rapport PDF pour cette réunion comprenant les présences, l'ordre du jour et le procès-verbal. Ce rapport sera enregistré et pourra être téléchargé ultérieurement.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenGenerateDialog(false)}
                        color="inherit"
                        disabled={generatingReport}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleGenerateReport}
                        color="primary"
                        variant="contained"
                        disabled={generatingReport}
                        startIcon={generatingReport ? <CircularProgress size={20} /> : <PictureAsPdf />}
                    >
                        {generatingReport ? 'Génération...' : 'Générer le Rapport'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

// Details Tab Content
const DetailTab = ({ meeting }) => {
    return (
        <Grid container spacing={3}>
            {/* Description */}
            <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Description
                    </Typography>
                    <Typography variant="body1">
                        {meeting.description || 'Aucune description fournie.'}
                    </Typography>
                </Box>
            </Grid>

            {/* Details Cards */}
            <Grid item xs={12} md={6}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Procès-Verbal
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ whiteSpace: 'pre-line' }}>
                            {meeting.minutes ? (
                                meeting.minutes
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Le procès-verbal sera disponible après la fin de la réunion.
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </StyledCard>
            </Grid>

            {/* Meeting Properties */}
            <Grid item xs={12}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Propriétés de la Réunion
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            {meeting.is_recurring && meeting.recurrence_pattern && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Récurrence
                                    </Typography>
                                    <Typography variant="body1">
                                        {meeting.recurrence_pattern.frequency === 'monthly' ?
                                            `Mensuelle le jour ${new Date(meeting.start_date).getDate()}` :
                                            meeting.recurrence_pattern.frequency === 'weekly' ?
                                                `Hebdomadaire le ${new Date(meeting.start_date).toLocaleDateString('fr-FR', { weekday: 'long' })}` :
                                                meeting.recurrence_pattern.frequency === 'daily' ? 'Quotidienne' : ''}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Méthode de Notification
                                </Typography>
                                <Typography variant="body1">
                                    {meeting.notification_method === 'email' ? 'Email Uniquement' :
                                        meeting.notification_method === 'platform' ? 'Plateforme Uniquement' :
                                            'Email et Plateforme'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Rappel
                                </Typography>
                                <Typography variant="body1">
                                    {meeting.reminder_days_before} {meeting.reminder_days_before === 1 ? 'jour' : 'jours'} avant la réunion
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Créé Par
                                </Typography>
                                <Typography variant="body1">
                                    {meeting.created_by_details ? meeting.created_by_details.full_name || meeting.created_by_details.email : 'Inconnu'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Date de Création
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(meeting.created_at).toLocaleDateString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Dernière Mise à Jour
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(meeting.updated_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>
            </Grid>
        </Grid>
    );
};


const AttendeesTab = ({ attendees, meetingId, meetingStatus }) => {
    const theme = useTheme();
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedAttendees, setSelectedAttendees] = useState([]);
    const [availableMembers, setAvailableMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendeeRole, setAttendeeRole] = useState('');

    // Fetch available members from API
    const fetchAvailableMembers = async () => {
        try {
            setLoadingMembers(true);
            setError(null);

            // Fetch members from your API endpoint
            const response = await AxiosInstance.get('/api/member/');
            const members = response.data;

            // Filter out already added attendees
            const attendeeIds = attendees.map(a => a.member_details?.id);
            const filteredMembers = members.filter(m => !attendeeIds.includes(m.id));

            setAvailableMembers(filteredMembers);
            setLoadingMembers(false);
        } catch (err) {
            console.error('Erreur lors de la récupération des membres:', err);
            setError('Échec du chargement des membres disponibles. Veuillez réessayer.');
            setLoadingMembers(false);
        }
    };

    // Open dialog and fetch members
    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
        fetchAvailableMembers();
    };

    // Add attendees function
    const handleAddAttendees = async () => {
        try {
            setLoading(true);
            setError(null);

            // Format data for backend
            const attendeesData = selectedAttendees.map(memberId => ({
                member: memberId,
                status: 'pending',  // Default status
                special_role: attendeeRole || ''
            }));

            // Make API call with properly formatted data
            await AxiosInstance.post(`/meetings/meetings/${meetingId}/add_attendees/`, {
                attendees: attendeesData  // Match backend expected key
            });

            // Refresh the page to show updated attendees
            window.location.reload();

        } catch (err) {
            console.error('Erreur lors de l\'ajout de participants:', err);
            setError('Échec de l\'ajout de participants. Veuillez réessayer.');
        } finally {
            setLoading(false);
            setOpenAddDialog(false);
            setSelectedAttendees([]);
        }
    };

    // Handle member selection
    const handleToggleMember = (memberId) => {
        if (selectedAttendees.includes(memberId)) {
            setSelectedAttendees(selectedAttendees.filter(id => id !== memberId));
        } else {
            setSelectedAttendees([...selectedAttendees, memberId]);
        }
    };

    // Filter members based on search term
    const filteredMembers = availableMembers.filter(member => {
        const fullName = member.name || '';
        const email = member.email || '';
        const role = member.role || '';

        const searchLower = searchTerm.toLowerCase();
        return fullName.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower) ||
            role.toLowerCase().includes(searchLower);
    });

    // Group attendees by status
    const presentAttendees = attendees.filter(a => a.status === 'present');
    const absentAttendees = attendees.filter(a => a.status === 'absent');
    const excusedAttendees = attendees.filter(a => a.status === 'excused');
    const pendingAttendees = attendees.filter(a => a.status === 'pending' || !a.status);

    return (
        <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Participants à la Réunion
                </Typography>

                {meetingStatus === 'scheduled' && (
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={handleOpenAddDialog}
                    >
                        Ajouter des Participants
                    </Button>
                )}
            </Box>

            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <Paper
                            sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            Présents: {presentAttendees.length}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper
                            sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            Absents: {absentAttendees.length}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper
                            sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                color: theme.palette.warning.main,
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            Excusés: {excusedAttendees.length}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper
                            sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            En Attente: {pendingAttendees.length}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {attendees.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucun participant ajouté pour le moment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Ajoutez des membres pour suivre les présences à cette réunion
                    </Typography>
                    {meetingStatus === 'scheduled' && (
                        <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={handleOpenAddDialog}
                        >
                            Ajouter des Participants
                        </Button>
                    )}
                </Box>
            ) : (
                <List sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}>
                    {attendees.map((attendee) => (
                        <ListItem key={attendee.id} divider>
                            <ListItemAvatar>
                                <Avatar>
                                    {attendee.member_details?.name ? attendee.member_details.name.charAt(0).toUpperCase() : '?'}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {attendee.member_details?.name || 'Membre Inconnu'}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" component="span" display="block">
                                            {attendee.member_details?.email || 'Aucun email fourni'}
                                        </Typography>
                                        <Typography variant="body2" component="span" display="block" color="text.secondary">
                                            {attendee.member_details?.role || 'Membre'}
                                            {attendee.special_role && ` • ${attendee.special_role}`}
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <AttendanceStatusChip status={attendee.status} />
                                {meetingStatus === 'in_progress' && (
                                    <Box sx={{ display: 'inline-flex', ml: 1 }}>
                                        <Tooltip title="Marquer Présent">
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={async () => {
                                                    try {
                                                        await AxiosInstance.patch(`/meetings/attendees/${attendee.id}/`, {
                                                            status: 'present'
                                                        });
                                                        window.location.reload();
                                                    } catch (err) {
                                                        console.error('Erreur lors de la mise à jour du statut:', err);
                                                    }
                                                }}
                                            >
                                                <Check />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Marquer Absent">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={async () => {
                                                    try {
                                                        await AxiosInstance.patch(`/meetings/attendees/${attendee.id}/`, {
                                                            status: 'absent'
                                                        });
                                                        window.location.reload();
                                                    } catch (err) {
                                                        console.error('Erreur lors de la mise à jour du statut:', err);
                                                    }
                                                }}
                                            >
                                                <Close />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Add Attendees Dialog */}
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                aria-labelledby="add-attendees-dialog-title"
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle id="add-attendees-dialog-title">
                    Ajouter des Participants à la Réunion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Sélectionnez les membres à ajouter comme participants à cette réunion.
                    </DialogContentText>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label="Rechercher des Membres"
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Rôle Spécial (Optionnel)"
                                    variant="outlined"
                                    value={attendeeRole}
                                    onChange={(e) => setAttendeeRole(e.target.value)}
                                    placeholder="ex., Président, Secrétaire"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {loadingMembers ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List sx={{
                            bgcolor: 'background.paper',
                            borderRadius: '8px',
                            border: `1px solid ${theme.palette.divider}`,
                            maxHeight: '350px',
                            overflow: 'auto'
                        }}>
                            {filteredMembers.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        {searchTerm ? 'Aucun membre ne correspond à votre recherche' : 'Aucun membre disponible trouvé'}
                                    </Typography>
                                </Box>
                            ) : (
                                filteredMembers.map((member) => (
                                    <ListItem
                                        key={member.id}
                                        divider
                                        secondaryAction={
                                            <Checkbox
                                                edge="end"
                                                checked={selectedAttendees.includes(member.id)}
                                                onChange={() => handleToggleMember(member.id)}
                                            />
                                        }
                                        sx={{
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {member.name || 'Membre Inconnu'}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" component="span" display="block">
                                                        {member.email || 'Aucun email fourni'}
                                                    </Typography>
                                                    {member.role && (
                                                        <Typography variant="body2" component="span" display="block" color="text.secondary">
                                                            {member.role}
                                                        </Typography>
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Box sx={{ flex: 1, pl: 2 }}>
                        {selectedAttendees.length > 0 && (
                            <Typography variant="body2" color="primary">
                                {selectedAttendees.length} membre{selectedAttendees.length !== 1 ? 's' : ''} sélectionné{selectedAttendees.length !== 1 ? 's' : ''}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        color="inherit"
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleAddAttendees}
                        color="primary"
                        variant="contained"
                        disabled={loading || selectedAttendees.length === 0}
                        startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                    >
                        {loading ? 'Ajout en cours...' : 'Ajouter les Participants Sélectionnés'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// Agenda Tab Content
const AgendaTab = ({ agendaItems, meetingId, meetingStatus }) => {
    const theme = useTheme();
    const [openAddDialog, setOpenAddDialog] = useState(false);

    return (
        <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Ordre du Jour
                </Typography>

                {(meetingStatus === 'scheduled' || meetingStatus === 'in_progress') && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenAddDialog(true)}
                    >
                        Ajouter un Point
                    </Button>
                )}
            </Box>

            {agendaItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucun point à l'ordre du jour pour le moment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Ajoutez des points pour structurer l'ordre du jour de la réunion
                    </Typography>
                    {(meetingStatus === 'scheduled' || meetingStatus === 'in_progress') && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenAddDialog(true)}
                        >
                            Ajouter un Point
                        </Button>
                    )}
                </Box>
            ) : (
                <Box>
                    {agendaItems.map((item, index) => (
                        <AgendaItem key={item.id} elevation={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="h6">
                                        {index + 1}. {item.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                                        <Chip
                                            size="small"
                                            label={`${item.duration_minutes} minutes`}
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: theme.palette.primary.main,
                                            }}
                                        />

                                        {item.presenter_details && (
                                            <Chip
                                                size="small"
                                                icon={<Person fontSize="small" />}
                                                label={item.presenter_details.name}
                                                sx={{
                                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                                    color: theme.palette.info.main,
                                                }}
                                            />
                                        )}

                                        {item.is_completed && (
                                            <Chip
                                                size="small"
                                                icon={<Check fontSize="small" />}
                                                label="Terminé"
                                                sx={{
                                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                                    color: theme.palette.success.main,
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                        {item.description}
                                    </Typography>

                                    {item.notes && (
                                        <Box sx={{ mt: 2, p: 1, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: '4px' }}>
                                            <Typography variant="subtitle2" fontWeight="bold">Notes:</Typography>
                                            <Typography variant="body2">
                                                {item.notes}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {meetingStatus === 'in_progress' && !item.is_completed && (
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        size="small"
                                        startIcon={<Check />}
                                    >
                                        Marquer Terminé
                                    </Button>
                                )}
                            </Box>
                        </AgendaItem>
                    ))}
                </Box>
            )}

            {/* Add Agenda Item Dialog - In a real app, this would have a form */}
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                aria-labelledby="add-agenda-dialog-title"
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle id="add-agenda-dialog-title">
                    Ajouter un Point à l'Ordre du Jour
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Ajoutez un nouveau point à l'ordre du jour de la réunion.
                    </DialogContentText>

                    {/* Agenda item form would go here */}
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        [Le formulaire d'ajout de point serait ici dans l'implémentation réelle]
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        color="inherit"
                    >
                        Annuler
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                    >
                        Ajouter le Point
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// Reports Tab Content
const ReportsTab = ({ reports, meetingId, meetingStatus, onGenerateReport }) => {
    const theme = useTheme();

    return (
        <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Rapports de Réunion
                </Typography>

                {meetingStatus === 'completed' && reports.length === 0 && (
                    <Button
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        onClick={onGenerateReport}
                    >
                        Générer un Rapport
                    </Button>
                )}
            </Box>

            {reports.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucun rapport disponible
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {meetingStatus === 'completed' ?
                            'Générez un rapport pour documenter cette réunion terminée' :
                            'Les rapports peuvent être générés après la fin de la réunion'}
                    </Typography>
                    {meetingStatus === 'completed' && (
                        <Button
                            variant="contained"
                            startIcon={<PictureAsPdf />}
                            onClick={onGenerateReport}
                        >
                            Générer un Rapport
                        </Button>
                    )}
                </Box>
            ) : (
                <List sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}>
                    {reports.map((report) => (
                        <ListItem key={report.id} divider>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                    <PictureAsPdf />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {report.title}
                                        </Typography>
                                        {report.is_approved && (
                                            <Chip
                                                size="small"
                                                icon={<CheckCircle fontSize="small" />}
                                                label="Approuvé"
                                                sx={{
                                                    ml: 1,
                                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                                    color: theme.palette.success.main,
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" component="span" display="block">
                                            Créé le: {new Date(report.created_at).toLocaleDateString()} par {report.created_by_details?.full_name || 'Inconnu'}
                                        </Typography>
                                        <Typography variant="body2" component="span" display="block">
                                            {report.summary}
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title="Voir le Rapport">
                                    <IconButton color="primary">
                                        <Visibility />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Télécharger le Rapport">
                                    <IconButton color="primary">
                                        <Download />
                                    </IconButton>
                                </Tooltip>
                                {!report.is_approved && (
                                    <Tooltip title="Approuver le Rapport">
                                        <IconButton color="success">
                                            <CheckCircle />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );
};

export default MeetingDetail;