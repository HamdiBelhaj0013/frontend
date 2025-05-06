import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Link,
    Divider,
    Chip,
    Avatar,
    Tooltip,
    Zoom,
    Alert,
    LinearProgress,
    Container,
    Skeleton,
    SwipeableDrawer,
    useMediaQuery,
    Fade,
    Badge,
    Collapse
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';
import BugReportIcon from '@mui/icons-material/BugReport';
import ArticleIcon from '@mui/icons-material/Article';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ForumIcon from '@mui/icons-material/Forum';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import FeedbackIcon from '@mui/icons-material/Feedback';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Axios from './Axios.jsx';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Enhanced loading indicator messages with more personality
const loadingMessages = [
    "Je recherche les articles juridiques pertinents...",
    "J'analyse le contexte juridique...",
    "Je formule une réponse précise...",
    "Je vérifie les références légales...",
    "Je m'assure que ma réponse est claire et complète...",
];

// Styled components with refined aesthetics
const GlassHeader = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #00897B, #004D40)',
    color: 'white',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 6px 20px rgba(0, 105, 92, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 8px 25px rgba(0, 105, 92, 0.25)',
    },
}));

const MessageBubble = styled(Paper)(({ isUser, theme }) => ({
    maxWidth: '85%',
    padding: theme.spacing(2),
    borderRadius: isUser
        ? '18px 18px 0 18px'
        : '18px 18px 18px 0',
    backgroundColor: isUser
        ? theme.palette.primary.main
        : theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.8)
            : '#f5f5f5',
    color: isUser
        ? 'white'
        : theme.palette.text.primary,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'relative',
    '&:hover': {
        boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
    },
    transition: 'box-shadow 0.3s ease, transform 0.2s ease',
    '& a': {
        color: isUser ? '#FFFFFF' : theme.palette.primary.main,
        textDecoration: 'underline',
        fontWeight: 500,
    },
    '& pre': {
        background: isUser
            ? alpha('#000', 0.2)
            : theme.palette.mode === 'dark'
                ? alpha('#000', 0.3)
                : alpha('#000', 0.05),
        padding: theme.spacing(1.5),
        borderRadius: theme.shape.borderRadius,
        overflowX: 'auto',
        fontSize: '0.85rem',
    },
    '& code': {
        fontFamily: 'monospace',
    },
    '& ul, & ol': {
        paddingLeft: theme.spacing(2.5),
        marginBottom: theme.spacing(1),
    },
    '& li': {
        marginBottom: theme.spacing(0.5),
    }
}));

const SuggestedQuestionButton = styled(Button)(({ theme }) => ({
    borderRadius: '20px',
    background: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.6)
        : alpha(theme.palette.background.paper, 0.95),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    textTransform: 'none',
    fontWeight: 500,
    color: theme.palette.text.primary,
    padding: '6px 16px',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
    },
}));

const CircleDecoration = styled(Box)({
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    zIndex: 0,
});

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '14px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    '& .MuiButton-startIcon': {
        marginRight: theme.spacing(1),
    }
}));

const SendMessageButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    width: 44,
    height: 44,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'scale(1.05)',
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.15)
            : '#e0e0e0',
        color: theme.palette.mode === 'dark'
            ? alpha(theme.palette.common.white, 0.3)
            : '#9e9e9e'
    },
    transition: 'all 0.2s ease',
    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
    borderRadius: '14px',
}));

const ArticleChip = styled(Chip)(({ theme }) => ({
    margin: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    height: 28,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
}));

// Enhanced input field styling
const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '14px',
        backgroundColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : '#fff',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        '&.Mui-focused': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        '& fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.2),
            transition: 'border-color 0.3s ease',
        },
        '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        padding: '14px 16px',
    },
    '& .MuiInputAdornment-root': {
        marginRight: theme.spacing(1),
    },
}));

// Message action buttons
const MessageActionButton = styled(IconButton)(({ theme }) => ({
    padding: 6,
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    transition: 'all 0.2s ease',
}));

// Side drawer component
const SideDrawer = styled(SwipeableDrawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        width: 300,
        padding: theme.spacing(2),
        background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.9)
            : '#fff',
    }
}));

// Animated scroll button
const ScrollButton = styled(IconButton)(({ theme, visible }) => ({
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

// Enhanced NGO Chatbot Component
const NGOChatbot = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDarkMode = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State variables
    const [chatbotSettings, setChatbotSettings] = useState({
        name: "Assistant Juridique pour les ONG",
        greeting: "Bonjour! Je suis votre assistant virtuel spécialisé dans la législation tunisienne sur les associations. Comment puis-je vous aider?",
        farewell: "Merci de votre visite. N'hésitez pas à revenir si vous avez d'autres questions!"
    });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [conversationId, setConversationId] = useState(null);
    const [showSources, setShowSources] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [errorInfo, setErrorInfo] = useState(null);
    const [articleHighlights, setArticleHighlights] = useState([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // Refs
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const loadingIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const requestStartTimeRef = useRef(null);
    const inputRef = useRef(null);

    // Load chatbot settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsInitializing(true);
                const response = await Axios.get('/chatbot/conversations/get_chatbot_settings/');
                if (response.data) {
                    setChatbotSettings({
                        name: response.data.name || "Assistant Juridique pour les ONG",
                        greeting: response.data.greeting || "Bonjour! Comment puis-je vous aider aujourd'hui?",
                        farewell: response.data.farewell || "Merci de votre visite. N'hésitez pas à revenir si vous avez d'autres questions!"
                    });
                }
            } catch (error) {
                console.warn("Could not fetch chatbot settings:", error);
                // Continue with default settings
            } finally {
                setIsInitializing(false);
            }
        };

        fetchSettings();
    }, []);

    // Initialize conversation and greeting message
    useEffect(() => {
        const initialize = async () => {
            const convId = await createNewConversation();

            // Add initial greeting only after settings and conversation are loaded
            setMessages([{
                id: 'greeting',
                role: 'assistant',
                content: chatbotSettings.greeting
            }]);

            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 1000);
        };

        if (!isInitializing) {
            initialize();
        }

        return () => {
            clearInterval(loadingIntervalRef.current);
            clearInterval(timerIntervalRef.current);
        };
    }, [isInitializing, chatbotSettings.greeting]);

    // Auto-scroll and update scroll button visibility
    useEffect(() => {
        scrollToBottom();

        // Setup scroll event listener for scroll button visibility
        const container = messagesContainerRef.current;
        if (container) {
            const handleScroll = () => {
                const { scrollTop, scrollHeight, clientHeight } = container;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                setShowScrollButton(!isNearBottom && messages.length > 3);
            };

            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [messages]);

    // Update loading animation
    useEffect(() => {
        if (isLoading) {
            let counter = 0;
            // Update loading message every 3 seconds (faster updates for better UX)
            loadingIntervalRef.current = setInterval(() => {
                setLoadingMessage(loadingMessages[counter % loadingMessages.length]);
                // More realistic progress that reflects actual processing
                setLoadingProgress((prevProgress) => {
                    // Faster initial progress, then slower as it approaches 100%
                    const increment = prevProgress < 30 ? 5 :
                        prevProgress < 60 ? 2 :
                            prevProgress < 85 ? 0.7 : 0.3;
                    return Math.min(prevProgress + increment, 98);
                });
                counter++;
            }, 3000);

            // Timer for elapsed time display
            requestStartTimeRef.current = Date.now();
            timerIntervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - requestStartTimeRef.current) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            clearInterval(loadingIntervalRef.current);
            clearInterval(timerIntervalRef.current);
            setElapsedTime(0);

            // Reset progress when loading completes
            setTimeout(() => {
                setLoadingProgress(0);
            }, 300);
        }

        return () => {
            clearInterval(loadingIntervalRef.current);
            clearInterval(timerIntervalRef.current);
        };
    }, [isLoading]);

    // Scroll to the bottom of the messages
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: messages.length <= 3 ? 'auto' : 'smooth',
                block: 'end'
            });
        }
    };

    // Create a new conversation
    const createNewConversation = async () => {
        try {
            console.log("Creating new conversation...");
            setIsLoading(true);

            let conversationIdValue = null;

            try {
                const response = await Axios.post('/chatbot/conversations/');
                console.log("Conversation created:", response.data);
                conversationIdValue = response.data.id;
                setConversationId(conversationIdValue);
            } catch (convError) {
                console.warn("Could not create conversation, using direct-chat mode:", convError);
                conversationIdValue = "direct-chat";
                setConversationId(conversationIdValue);
            }

            // Reset messages - we'll add greeting after settings are loaded
            setMessages([]);
            setArticleHighlights([]);
            setErrorInfo(null);

            return conversationIdValue;
        } catch (error) {
            console.error('Error in conversation initialization:', error);
            setConversationId("fallback-mode");
            setErrorInfo({
                type: 'initialization',
                message: 'Erreur d\'initialisation de la conversation'
            });
            return "fallback-mode";
        } finally {
            setIsLoading(false);
        }
    };

    // Extract article references from message
    const extractArticleReferences = (text) => {
        // Match both "article X" and "Art. X" formats
        const articleRegex = /(?:article|art\.)\s+(\d+)(?:\s+du\s+décret-loi|\s|$)/gi;
        const articleMatches = [...text.matchAll(articleRegex)];

        const articleNumbers = articleMatches.map(match => match[1]);
        return [...new Set(articleNumbers)]; // Remove duplicates
    };

    // Handle message submission
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const currentInput = input.trim();
        if (!currentInput || !conversationId || isLoading) return;

        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: currentInput
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setErrorInfo(null);
        requestStartTimeRef.current = Date.now();

        // Close drawer on mobile when sending message
        if (isMobile && drawerOpen) {
            setDrawerOpen(false);
        }

        try {
            console.log(`Sending message to conversation ${conversationId}: ${currentInput}`);
            let response;

            if (conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode") {
                try {
                    response = await Axios.post(`/chatbot/conversations/${conversationId}/chat/`, {
                        message: currentInput
                    });
                } catch (convError) {
                    console.warn("Error with conversation endpoint, falling back to direct-chat:", convError);
                    response = await Axios.post('/chatbot/direct-chat/', {
                        query: currentInput
                    });
                }
            } else {
                response = await Axios.post('/chatbot/direct-chat/', {
                    query: currentInput
                });
            }

            // Calculate response time
            const endTime = Date.now();
            const responseTime = (endTime - requestStartTimeRef.current) / 1000;

            // Process response based on endpoint format
            let content, sources, messageId;

            if (response.data.content) {
                // Conversation endpoint format
                content = response.data.content;
                sources = response.data.relevant_documents || [];
                messageId = response.data.message_id;
            } else if (response.data.response) {
                // Direct-chat endpoint format
                content = response.data.response;
                sources = response.data.relevant_chunks ?
                    response.data.relevant_chunks.map(chunk => ({
                        title: "Document",
                        excerpt: chunk.content
                    })) : [];
                messageId = `direct-${Date.now()}`;
            } else {
                throw new Error("Unexpected response format");
            }

            // Extract article references for highlighting
            const articleNumbers = extractArticleReferences(content);
            if (articleNumbers.length > 0) {
                setArticleHighlights(prev => {
                    const newArticles = articleNumbers.filter(num => !prev.includes(num));
                    return [...prev, ...newArticles];
                });
            }

            const assistantMessage = {
                id: messageId || `assistant-${Date.now()}`,
                role: 'assistant',
                content: content,
                sources: sources,
                responseTime: responseTime.toFixed(2)
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Error querying chatbot:', error);

            const errorMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "Désolé, j'ai rencontré un problème de communication avec le serveur. Veuillez réessayer votre question. Si le problème persiste, le serveur est peut-être surchargé.",
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);

            setErrorInfo({
                type: 'communication',
                message: 'Erreur de communication avec le serveur'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle feedback submission
    const provideFeedback = async (messageId, isPositive) => {
        if (!messageId || !conversationId || conversationId === "direct-chat" || conversationId === "fallback-mode") return;

        try {
            await Axios.post(`/chatbot/conversations/${conversationId}/feedback/`, {
                message_id: messageId,
                rating: isPositive ? 5 : 1,
                comment: isPositive ? "Réponse utile" : "Réponse à améliorer"
            });

            console.log("Feedback submitted successfully");

            // Update UI to show feedback was received
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? {...msg, feedbackGiven: true, feedbackPositive: isPositive}
                        : msg
                )
            );
        } catch (error) {
            console.error('Error handling feedback:', error);
        }
    };

    // Handle suggested question selection
    const handleSuggestedQuestion = useCallback((question) => {
        setInput(question);
        // Focus the input
        if (inputRef.current) {
            inputRef.current.focus();
        }
        // Submit after a small delay to ensure UI updates
        setTimeout(() => {
            handleSubmit();
        }, 100);
    }, []);

    // Copy message content to clipboard
    const handleCopyMessage = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(content.substring(0, 20)); // Use content substring as ID
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };


    const startVoiceInput = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'fr-FR';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };

            recognition.start();
        } else {
            alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
        }
    };

    // Suggested questions based on the decree-law content
    const suggestedQuestions = [
        "Comment créer une association en Tunisie?",
        "Quels documents sont requis pour les statuts?",
        "Comment financer une association?",
        "Quelles sont les conditions pour être membre?",
        "Comment dissoudre une association?",
        "Quels sont les droits d'une association?"
    ];

    // Render timestamp in a readable format
    const renderTimestamp = (responseTime) => {
        if (!responseTime) return null;

        // Group response times into categories for better UX
        let speedCategory;
        let color;

        if (responseTime < 5) {
            speedCategory = "Très rapide";
            color = "success.main";
        } else if (responseTime < 15) {
            speedCategory = "Rapide";
            color = "success.main";
        } else if (responseTime < 30) {
            speedCategory = "Normal";
            color = "text.secondary";
        } else {
            speedCategory = `${responseTime}s`;
            color = "warning.main";
        }

        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                mt: 1,
                color: color,
                fontSize: '0.75rem',
                opacity: 0.8
            }}>
                <Typography variant="caption" sx={{ fontWeight: 500, color: 'inherit' }}>
                    {speedCategory}
                </Typography>
            </Box>
        );
    };

    return (
        <Container maxWidth="lg" sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            p: isMobile ? 1 : 2,
            position: 'relative'
        }}>
            {/* Header with brand and controls */}
            <GlassHeader elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
                    {isMobile ? (
                        <IconButton
                            sx={{ color: 'white', mr: 1 }}
                            onClick={() => setDrawerOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            sx={{ color: 'white', mr: 1 }}
                            onClick={() => navigate('/home')}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    )}

                    <Avatar
                        sx={{
                            bgcolor: 'primary.dark',
                            mr: 2,
                            boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                            width: 38,
                            height: 38
                        }}
                    >
                        <SmartToyIcon />
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            fontSize: isMobile ? '1.2rem' : '1.5rem'
                        }}>
                            {chatbotSettings.name}
                        </Typography>
                        <Typography variant="body2" sx={{
                            opacity: 0.9,
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                            Décret-loi n° 2011-88 du 24 septembre 2011
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip
                            title={showSources ? "Masquer les sources" : "Afficher les sources"}
                            TransitionComponent={Zoom}
                        >
                            <IconButton
                                sx={{ color: 'white' }}
                                onClick={() => setShowSources(!showSources)}
                            >
                                <InfoOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Nouvelle conversation" TransitionComponent={Zoom}>
                            <IconButton
                                sx={{ color: 'white' }}
                                onClick={createNewConversation}
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Decorative circles */}
                <CircleDecoration sx={{ top: -80, right: -80, width: 200, height: 200 }} />
                <CircleDecoration sx={{ bottom: -50, right: 100, width: 150, height: 150 }} />
                <CircleDecoration sx={{ top: 50, left: -30, width: 80, height: 80 }} />
            </GlassHeader>

            {/* Error alert if needed */}
            <AnimatePresence>
                {errorInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Alert
                            severity="error"
                            icon={<WarningAmberIcon />}
                            action={
                                <IconButton
                                    color="inherit"
                                    size="small"
                                    onClick={() => setErrorInfo(null)}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                            sx={{
                                mb: 2,
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                            }}
                        >
                            {errorInfo.type === 'communication' && "Problème de communication avec le serveur. Veuillez réessayer."}
                            {errorInfo.type === 'initialization' && "Erreur d'initialisation. Essayez de rafraîchir la page."}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Article highlights - now with improved styling */}
            {articleHighlights.length > 0 && (
                <Paper
                    elevation={2}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: '14px',
                        background: isDarkMode
                            ? alpha(theme.palette.background.paper, 0.6)
                            : alpha('#f5f5f5', 0.8),
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Articles mentionnés
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {articleHighlights.map((articleNum, index) => (
                            <ArticleChip
                                key={index}
                                label={`Article ${articleNum}`}
                                onClick={() => handleSuggestedQuestion(`Que dit l'article ${articleNum} du décret-loi?`)}
                                clickable
                                icon={<AutoAwesomeIcon fontSize="small" />}
                                variant="outlined"
                                color="primary"
                            />
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Mobile drawer for navigation options */}
            <SideDrawer
                anchor="left"
                open={drawerOpen}
                onOpen={() => setDrawerOpen(true)}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setDrawerOpen(false)}
                            sx={{ mr: 2 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Menu</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Button
                        startIcon={<ArrowBackIcon />}
                        sx={{ mb: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                        onClick={() => navigate('/home')}
                    >
                        Retour à l'accueil
                    </Button>

                    <Button
                        startIcon={<ReplayIcon />}
                        sx={{ mb: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                        onClick={() => {
                            createNewConversation();
                            setDrawerOpen(false);
                        }}
                    >
                        Nouvelle conversation
                    </Button>

                    <Button
                        startIcon={<InfoOutlinedIcon />}
                        sx={{ mb: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                        onClick={() => {
                            setShowSources(!showSources);
                            setDrawerOpen(false);
                        }}
                    >
                        {showSources ? "Masquer les sources" : "Afficher les sources"}
                    </Button>

                    <Button
                        startIcon={<HelpOutlineIcon />}
                        sx={{ mb: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                        onClick={() => {
                            handleSuggestedQuestion("Que pouvez-vous me dire sur la législation des associations en Tunisie?");
                            setDrawerOpen(false);
                        }}
                    >
                        Aide
                    </Button>

                    <Box sx={{ mt: 'auto' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Cet assistant est spécialisé dans la législation tunisienne sur les associations selon le décret-loi n° 2011-88.
                        </Typography>
                    </Box>
                </Box>
            </SideDrawer>

            {/* Suggested questions panel - shown at start or when conversation is empty */}
            {(messages.length <= 1 || messages.length === 2 && messages[1].role === 'user') && (
                <Paper
                    elevation={2}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: '14px',
                        background: isDarkMode
                            ? alpha(theme.palette.background.paper, 0.7)
                            : alpha('#f8f9fa', 0.95),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.07)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <ForumIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Pour commencer
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Voici quelques questions fréquentes pour débuter votre consultation:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {suggestedQuestions.map((question, index) => (
                            <SuggestedQuestionButton
                                key={index}
                                variant="outlined"
                                size="medium"
                                onClick={() => handleSuggestedQuestion(question)}
                                component={motion.button}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                sx={{ mb: 1 }}
                            >
                                {question}
                            </SuggestedQuestionButton>
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Main chat container with improved styling and animations */}
            <Paper
                elevation={2}
                ref={messagesContainerRef}
                sx={{
                    flexGrow: 1,
                    p: 2,
                    mb: 2,
                    overflowY: 'auto',
                    borderRadius: '16px',
                    background: isDarkMode
                        ? alpha(theme.palette.background.default, 0.7)
                        : '#f9f9f9',
                    backgroundImage: isDarkMode
                        ? 'linear-gradient(to bottom, rgba(25, 25, 25, 0.8), rgba(18, 18, 18, 0.6))'
                        : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(248, 249, 250, 0.6))',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    position: 'relative',
                    scrollBehavior: 'smooth'
                }}
            >
                {/* Loading skeleton for initialization */}
                {isInitializing ? (
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1.5 }} />
                            <Box sx={{ width: '60%' }}>
                                <Skeleton variant="rounded" height={80} sx={{ borderRadius: '16px' }} />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                            <Box sx={{ width: '40%', mr: 1.5 }}>
                                <Skeleton variant="rounded" height={40} sx={{ borderRadius: '16px' }} />
                            </Box>
                            <Skeleton variant="circular" width={32} height={32} />
                        </Box>
                    </Box>
                ) : (
                    // Actual chat messages
                    messages.map((message, index) => (
                        <Box
                            key={message.id}
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * Math.min(index, 3) }}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                                mb: 3,
                                mx: 0.5
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                mb: 0.5,
                                ml: message.role === 'user' ? 0 : 1,
                                mr: message.role === 'user' ? 1 : 0
                            }}>
                                {message.role !== 'user' && (
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            mr: 1.5,
                                            bgcolor: message.isError ? 'error.main' : 'primary.main',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {message.isError
                                            ? <BugReportIcon sx={{ fontSize: 20 }} />
                                            : <SmartToyIcon sx={{ fontSize: 20 }} />
                                        }
                                    </Avatar>
                                )}

                                <MessageBubble
                                    isUser={message.role === 'user'}
                                    elevation={1}
                                    sx={{
                                        minWidth: isMobile ? '60%' : message.role === 'user' ? '30%' : '40%',
                                        position: 'relative'
                                    }}
                                >
                                    <Markdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Customize markdown rendering
                                            p: (props) => <Typography {...props} sx={{ mb: 1.5 }} />,
                                            h1: (props) => <Typography variant="h5" {...props} sx={{ mt: 2, mb: 1.5, fontWeight: 600 }} />,
                                            h2: (props) => <Typography variant="h6" {...props} sx={{ mt: 2, mb: 1.5, fontWeight: 600 }} />,
                                            h3: (props) => <Typography variant="subtitle1" {...props} sx={{ mt: 1.5, mb: 1, fontWeight: 600 }} />,
                                            ul: (props) => <Box component="ul" {...props} sx={{ mb: 1.5, pl: 2 }} />,
                                            ol: (props) => <Box component="ol" {...props} sx={{ mb: 1.5, pl: 2 }} />,
                                            li: (props) => <Box component="li" {...props} sx={{ mb: 0.5 }} />,
                                            a: (props) => <Link {...props} target="_blank" rel="noopener" />,
                                        }}
                                    >
                                        {message.content}
                                    </Markdown>

                                    {/* Response time indicator */}
                                    {message.role === 'assistant' && message.responseTime && renderTimestamp(message.responseTime)}

                                    {/* Message action buttons */}
                                    {!message.isError && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 5,
                                                right: 5,
                                                opacity: 0.7,
                                                transition: 'opacity 0.2s',
                                                '&:hover': { opacity: 1 }
                                            }}
                                        >
                                            <Tooltip title="Copier le texte">
                                                <MessageActionButton
                                                    size="small"
                                                    onClick={() => handleCopyMessage(message.content)}
                                                >
                                                    {copiedMessageId === message.content.substring(0, 20) ? (
                                                        <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                                                    ) : (
                                                        <ContentCopyIcon fontSize="small" />
                                                    )}
                                                </MessageActionButton>
                                            </Tooltip>
                                        </Box>
                                    )}

                                    {/* Show sources if available and showSources is true */}
                                    {showSources && message.sources && message.sources.length > 0 && (
                                        <Box sx={{
                                            mt: 1.5,
                                            pt: 1.5,
                                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                            fontSize: '0.8rem',
                                            color: message.role === 'user'
                                                ? alpha(theme.palette.common.white, 0.8)
                                                : theme.palette.text.secondary
                                        }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    mb: 1,
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                                                Sources utilisées:
                                            </Typography>

                                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                {message.sources.map((source, index) => (
                                                    <Box component="li" key={index} sx={{ mb: 0.5 }}>
                                                        <Typography component="span" sx={{ fontWeight: 600 }}>
                                                            {source.title}
                                                        </Typography>
                                                        : {source.excerpt}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </MessageBubble>

                                {message.role === 'user' && (
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            ml: 1.5,
                                            bgcolor: theme.palette.primary.dark,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 20 }} />
                                    </Avatar>
                                )}
                            </Box>

                            {/* Feedback buttons with improved styling */}
                            {message.role === 'assistant' && message.id !== 'greeting' && !message.isError &&
                                conversationId && conversationId !== "direct-chat" && conversationId !== "fallback-mode" && (
                                    <Box sx={{ mt: 0.5, display: 'flex', gap: 1, alignSelf: 'flex-start', ml: 5 }}>
                                        {message.feedbackGiven ? (
                                            <Chip
                                                size="small"
                                                icon={message.feedbackPositive ? <ThumbUpIcon fontSize="small" /> : <FeedbackIcon fontSize="small" />}
                                                color={message.feedbackPositive ? "success" : "default"}
                                                label={message.feedbackPositive
                                                    ? 'Merci pour votre évaluation positive!'
                                                    : 'Merci pour votre retour.'}
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: '12px',
                                                    '& .MuiChip-label': {
                                                        px: 1.5,
                                                        fontWeight: 500
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5, duration: 0.3 }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    p: 0.5,
                                                    px: 1,
                                                    borderRadius: '20px',
                                                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                                                    backdropFilter: 'blur(8px)',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                }}>
                                                    <Tooltip title="Réponse utile" TransitionComponent={Zoom}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => provideFeedback(message.id, true)}
                                                            sx={{
                                                                color: alpha(theme.palette.success.main, 0.9),
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                                    transform: 'scale(1.1)'
                                                                },
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <ThumbUpIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Réponse peu utile" TransitionComponent={Zoom}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => provideFeedback(message.id, false)}
                                                            sx={{
                                                                color: alpha(theme.palette.error.main, 0.7),
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                    transform: 'scale(1.1)'
                                                                },
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <ThumbDownIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </motion.div>
                                        )}
                                    </Box>
                                )}
                        </Box>
                    ))
                )}

                {/* Enhanced loading indicator */}
                {isLoading && (
                    <Box
                        sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, ml: 1 }}
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                mr: 1.5,
                                bgcolor: 'primary.main',
                                animation: 'pulse 1.5s infinite'
                            }}
                        >
                            <SmartToyIcon sx={{ fontSize: 20 }} />
                        </Avatar>

                        <MessageBubble
                            elevation={1}
                            sx={{
                                minWidth: isMobile ? '70%' : '350px',
                                maxWidth: '85%'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <CircularProgress
                                    size={16}
                                    thickness={5}
                                    sx={{
                                        mr: 1.5,
                                        color: theme.palette.primary.main
                                    }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {loadingMessage}
                                </Typography>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={loadingProgress}
                                sx={{
                                    borderRadius: 2,
                                    height: 5,
                                    mb: 1.5,
                                    background: alpha(theme.palette.primary.main, 0.2)
                                }}
                            />

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        fontStyle: 'italic',
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {elapsedTime < 30
                                        ? "Traitement en cours..."
                                        : "Ce type de question prend plus de temps..."
                                    }
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: elapsedTime > 30
                                            ? theme.palette.warning.main
                                            : theme.palette.text.secondary
                                    }}
                                >
                                    {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
                                </Typography>
                            </Box>
                        </MessageBubble>
                    </Box>
                )}

                {/* Scroll to bottom indicator button */}
                <Fade in={showScrollButton}>
                    <ScrollButton
                        onClick={scrollToBottom}
                        visible={showScrollButton}
                        size="small"
                    >
                        <ArrowBackIcon sx={{ transform: 'rotate(-90deg)' }} />
                    </ScrollButton>
                </Fade>

                <div ref={messagesEndRef} />
            </Paper>

            {/* Enhanced input form with voice input option */}
            <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={3}
                sx={{
                    display: 'flex',
                    p: 1.5,
                    borderRadius: '16px',
                    background: isDarkMode
                        ? alpha(theme.palette.background.paper, 0.9)
                        : '#fff',
                    backdropFilter: 'blur(10px)',
                    boxShadow: inputFocused
                        ? '0 8px 32px rgba(0,0,0,0.1)'
                        : '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${alpha(theme.palette.primary.main, inputFocused ? 0.3 : 0.1)}`,
                }}
            >
                <StyledTextField
                    id="chatInput"
                    fullWidth
                    variant="outlined"
                    size="medium"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Posez une question juridique..."
                    disabled={isLoading || !conversationId}
                    inputRef={inputRef}
                    inputProps={{
                        sx: { lineHeight: '1.5' }
                    }}
                    // Voice input button
                    InputProps={{
                        endAdornment: (
                            <Tooltip title="Dictée vocale (si disponible)" arrow>
                                <IconButton
                                    onClick={startVoiceInput}
                                    disabled={isLoading || !conversationId}
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        opacity: 0.7,
                                        '&:hover': { opacity: 1 }
                                    }}
                                >
                                    <MicIcon />
                                </IconButton>
                            </Tooltip>
                        ),
                    }}
                    sx={{ mr: 1.5 }}
                />

                <SendMessageButton
                    type="submit"
                    disabled={isLoading || !input.trim() || !conversationId}
                    size="large"
                    aria-label="Envoyer le message"
                >
                    <SendIcon />
                </SendMessageButton>
            </Paper>

            {/* Help & Reset Panel with improved styling */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 1.5,
                    mb: 2,
                }}
            >
                <ActionButton
                    startIcon={<ReplayIcon />}
                    variant="text"
                    color="primary"
                    size="medium"
                    onClick={createNewConversation}
                    disabled={isLoading}
                >
                    Nouvelle conversation
                </ActionButton>

                <ActionButton
                    startIcon={<HelpOutlineIcon />}
                    variant="text"
                    color="primary"
                    size="medium"
                    onClick={() => handleSuggestedQuestion("Que pouvez-vous me dire sur la législation des associations en Tunisie?")}
                    disabled={isLoading}
                >
                    Aide
                </ActionButton>
            </Box>

            {/* Footer with login link */}
            <Box sx={{ textAlign: 'center', mt: 'auto', mb: 1.5 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontSize: '0.85rem',
                        opacity: 0.9
                    }}
                >
                    Vous êtes administrateur d'une association?
                    <Link
                        href="/home"
                        sx={{
                            ml: 1,
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        Connectez-vous
                    </Link>
                </Typography>
            </Box>

            {/* Global styling */}
            <style jsx global>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            `}</style>
        </Container>
    );
};

export default NGOChatbot;