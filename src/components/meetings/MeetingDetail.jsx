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
            label = 'Scheduled';
            break;
        case 'cancelled':
            color = theme.palette.error.main;
            icon = <EventBusy fontSize="small" />;
            label = 'Cancelled';
            break;
        case 'completed':
            color = theme.palette.text.secondary;
            icon = <Event fontSize="small" />;
            label = 'Completed';
            break;
        case 'postponed':
            color = theme.palette.warning.main;
            icon = <Event fontSize="small" />;
            label = 'Postponed';
            break;
        case 'in_progress':
            color = theme.palette.info.main;
            icon = <Event fontSize="small" />;
            label = 'In Progress';
            break;
        default:
            color = theme.palette.primary.main;
            icon = <Event fontSize="small" />;
            label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
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
            label = 'Regular Meeting';
            break;
        case 'board':
            color = theme.palette.success.main;
            label = 'Board Meeting';
            break;
        case 'extraordinary':
            color = theme.palette.error.main;
            label = 'Extraordinary Meeting';
            break;
        case 'general_assembly':
            color = theme.palette.warning.main;
            label = 'General Assembly';
            break;
        case 'committee':
            color = theme.palette.info.main;
            label = 'Committee Meeting';
            break;
        default:
            color = theme.palette.grey[600];
            label = 'Other';
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
            label = 'Present';
            break;
        case 'absent':
            color = theme.palette.error.main;
            label = 'Absent';
            break;
        case 'excused':
            color = theme.palette.warning.main;
            label = 'Excused';
            break;
        case 'late':
            color = theme.palette.info.main;
            label = 'Late';
            break;
        default:
            color = theme.palette.grey[600];
            label = status ? status : 'Unknown';
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
                console.error('Error fetching meeting data:', err);
                setError('Failed to load meeting details. Please try again.');
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
        return moment(date).format('dddd, MMMM D, YYYY');
    };

    // Format time for display
    const formatTime = (date) => {
        return moment(date).format('h:mm A');
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
            console.error('Error submitting minutes:', err);
            setError('Failed to submit meeting minutes. Please try again.');
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
            console.error('Error cancelling meeting:', err);
            setError('Failed to cancel meeting. Please try again.');
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
                report_title: `Meeting Report: ${meeting.title}`,
                summary: 'This report summarizes the meeting discussions, decisions, and action items.'
            });

            // Fetch updated reports
            const reportsResponse = await AxiosInstance.get(`/meetings/reports/?meeting=${id}`);
            setReports(reportsResponse.data);

            setGeneratingReport(false);
            setOpenGenerateDialog(false);

            // Switch to reports tab
            setTabValue(3);
        } catch (err) {
            console.error('Error generating report:', err);
            setError('Failed to generate meeting report. Please try again.');
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
                        Loading meeting details...
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
                        Back to Meetings
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!meeting) {
        return (
            <Container>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Meeting not found or may have been deleted.
                </Alert>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/meetings')}
                    >
                        Back to Meetings
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
                        Back to Meetings
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
                                                    Time
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {formatTime(meeting.start_date)} - {formatTime(meeting.end_date)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {meeting.is_virtual ? (
                                                <VideoCall sx={{ mr: 1 }} />
                                            ) : (
                                                <LocationOn sx={{ mr: 1 }} />
                                            )}
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    {meeting.is_virtual ? 'Virtual Meeting' : 'Location'}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {meeting.is_virtual ?
                                                        (meeting.meeting_link || 'Link not provided') :
                                                        (meeting.location || 'Location not specified')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Groups sx={{ mr: 1 }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Attendees
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {attendees.length} invited
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
                                            Edit Meeting
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
                                            Cancel Meeting
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
                                        Generate Report
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
                                        Complete & Add Minutes
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
                                label="Details"
                                icon={<Description />}
                                iconPosition="start"
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Attendees
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
                                        Agenda
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
                                        Reports
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
                    Cancel Meeting
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel this meeting? This action will notify all attendees and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenCancelDialog(false)}
                        color="primary"
                    >
                        No, Keep Meeting
                    </Button>
                    <Button
                        onClick={handleCancelMeeting}
                        color="error"
                        variant="contained"
                        startIcon={<Cancel />}
                    >
                        Yes, Cancel Meeting
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
                    Add Meeting Minutes
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Add the minutes for this meeting. This will mark the meeting as completed.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        multiline
                        rows={10}
                        fullWidth
                        label="Meeting Minutes"
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
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitMinutes}
                        color="primary"
                        variant="contained"
                        disabled={!minutes.trim()}
                        startIcon={<CheckCircle />}
                    >
                        Complete Meeting
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
                    Generate Meeting Report
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Generate a PDF report for this meeting including attendance, agenda items, and minutes. This report will be stored and can be downloaded later.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenGenerateDialog(false)}
                        color="inherit"
                        disabled={generatingReport}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerateReport}
                        color="primary"
                        variant="contained"
                        disabled={generatingReport}
                        startIcon={generatingReport ? <CircularProgress size={20} /> : <PictureAsPdf />}
                    >
                        {generatingReport ? 'Generating...' : 'Generate Report'}
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
                        {meeting.description || 'No description provided.'}
                    </Typography>
                </Box>
            </Grid>

            {/* Details Cards */}
            <Grid item xs={12} md={6}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Minutes
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ whiteSpace: 'pre-line' }}>
                            {meeting.minutes ? (
                                meeting.minutes
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Minutes will be available after the meeting is completed.
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
                            Meeting Properties
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            {meeting.is_recurring && meeting.recurrence_pattern && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Recurrence
                                    </Typography>
                                    <Typography variant="body1">
                                        {meeting.recurrence_pattern.frequency === 'monthly' ?
                                            `Monthly on day ${new Date(meeting.start_date).getDate()}` :
                                            meeting.recurrence_pattern.frequency === 'weekly' ?
                                                `Weekly on ${new Date(meeting.start_date).toLocaleDateString('en-US', { weekday: 'long' })}` :
                                                meeting.recurrence_pattern.frequency}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Notification Method
                                </Typography>
                                <Typography variant="body1">
                                    {meeting.notification_method === 'email' ? 'Email Only' :
                                        meeting.notification_method === 'platform' ? 'Platform Only' :
                                            'Email and Platform'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Reminder
                                </Typography>
                                <Typography variant="body1">
                                    {meeting.reminder_days_before} {meeting.reminder_days_before === 1 ? 'day' : 'days'} before meeting
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Created By
                                </Typography>
                                <Typography variant="body1">
                                    {meeting.created_by_details ? meeting.created_by_details.full_name || meeting.created_by_details.email : 'Unknown'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Created Date
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(meeting.created_at).toLocaleDateString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Last Updated
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
            console.error('Error fetching members:', err);
            setError('Failed to load available members. Please try again.');
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
            console.error('Error adding attendees:', err);
            setError('Failed to add attendees. Please try again.');
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
                    Meeting Attendees
                </Typography>

                {meetingStatus === 'scheduled' && (
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={handleOpenAddDialog}
                    >
                        Add Attendees
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
                            Present: {presentAttendees.length}
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
                            Absent: {absentAttendees.length}
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
                            Excused: {excusedAttendees.length}
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
                            Pending: {pendingAttendees.length}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {attendees.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No attendees added yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Add members to track attendance for this meeting
                    </Typography>
                    {meetingStatus === 'scheduled' && (
                        <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={handleOpenAddDialog}
                        >
                            Add Attendees
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
                                        {attendee.member_details?.name || 'Unknown Member'}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" component="span" display="block">
                                            {attendee.member_details?.email || 'No email provided'}
                                        </Typography>
                                        <Typography variant="body2" component="span" display="block" color="text.secondary">
                                            {attendee.member_details?.role || 'Member'}
                                            {attendee.special_role && ` • ${attendee.special_role}`}
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <AttendanceStatusChip status={attendee.status} />
                                {meetingStatus === 'in_progress' && (
                                    <Box sx={{ display: 'inline-flex', ml: 1 }}>
                                        <Tooltip title="Mark Present">
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
                                                        console.error('Error updating status:', err);
                                                    }
                                                }}
                                            >
                                                <Check />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Mark Absent">
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
                                                        console.error('Error updating status:', err);
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
                    Add Meeting Attendees
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Select members to add as attendees for this meeting.
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
                                    label="Search Members"
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
                                    label="Special Role (Optional)"
                                    variant="outlined"
                                    value={attendeeRole}
                                    onChange={(e) => setAttendeeRole(e.target.value)}
                                    placeholder="e.g., Chair, Secretary"
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
                                        {searchTerm ? 'No members match your search' : 'No available members found'}
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
                                                    {member.name || 'Unknown Member'}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" component="span" display="block">
                                                        {member.email || 'No email provided'}
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
                                {selectedAttendees.length} member{selectedAttendees.length !== 1 ? 's' : ''} selected
                            </Typography>
                        )}
                    </Box>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        color="inherit"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddAttendees}
                        color="primary"
                        variant="contained"
                        disabled={loading || selectedAttendees.length === 0}
                        startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                    >
                        {loading ? 'Adding...' : 'Add Selected Attendees'}
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
                    Meeting Agenda
                </Typography>

                {(meetingStatus === 'scheduled' || meetingStatus === 'in_progress') && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenAddDialog(true)}
                    >
                        Add Agenda Item
                    </Button>
                )}
            </Box>

            {agendaItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No agenda items added yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Add items to structure the meeting agenda
                    </Typography>
                    {(meetingStatus === 'scheduled' || meetingStatus === 'in_progress') && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenAddDialog(true)}
                        >
                            Add Agenda Item
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
                                                label="Completed"
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
                                        Mark Complete
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
                    Add Agenda Item
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Add a new item to the meeting agenda.
                    </DialogContentText>

                    {/* Agenda item form would go here */}
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        [Agenda item form would be here in the actual implementation]
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                    >
                        Add Agenda Item
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
                    Meeting Reports
                </Typography>

                {meetingStatus === 'completed' && reports.length === 0 && (
                    <Button
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        onClick={onGenerateReport}
                    >
                        Generate Report
                    </Button>
                )}
            </Box>

            {reports.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No reports available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {meetingStatus === 'completed' ?
                            'Generate a report to document this completed meeting' :
                            'Reports can be generated after the meeting is completed'}
                    </Typography>
                    {meetingStatus === 'completed' && (
                        <Button
                            variant="contained"
                            startIcon={<PictureAsPdf />}
                            onClick={onGenerateReport}
                        >
                            Generate Report
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
                                                label="Approved"
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
                                            Created: {new Date(report.created_at).toLocaleDateString()} by {report.created_by_details?.full_name || 'Unknown'}
                                        </Typography>
                                        <Typography variant="body2" component="span" display="block">
                                            {report.summary}
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title="View Report">
                                    <IconButton color="primary">
                                        <Visibility />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Download Report">
                                    <IconButton color="primary">
                                        <Download />
                                    </IconButton>
                                </Tooltip>
                                {!report.is_approved && (
                                    <Tooltip title="Approve Report">
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