import { React, useEffect, useState } from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from './Axios.jsx';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Warning Icon
import { motion } from 'framer-motion'; // For smooth button animation

const DeleteProject = () => {
    const { id: MyId } = useParams();
    const [myData, setMyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState(""); // Stores user input
    const [error, setError] = useState(""); // Stores error messages
    const navigate = useNavigate();

    // Fetch project details
    useEffect(() => {
        AxiosInstance.get(`api/project/${MyId}`)
            .then((res) => {
                setMyData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load project details.");
                setLoading(false);
            });
    }, [MyId]);

    // Handle delete action
    const handleDelete = () => {
        AxiosInstance.delete(`api/project/${MyId}/`)
            .then(() => {
                navigate('/projects'); // Redirect to projects page
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to delete the project.");
            });
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', textAlign: 'center', padding: 4, boxShadow: 3, borderRadius: 3 }}>
            {loading ? (
                <Typography>Loading data...</Typography>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : myData ? (
                <>
                    <WarningAmberIcon sx={{ fontSize: 50, color: '#d32f2f', marginBottom: 2 }} />
                    <Typography variant="h5" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Delete Project: {myData.name}
                    </Typography>
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                        This action <strong>cannot</strong> be undone. Please type <strong>"delete"</strong> to confirm.
                    </Typography>

                    {/* Input Field */}
                    <TextField
                        label="Type 'delete' to confirm"
                        variant="outlined"
                        fullWidth
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        error={inputValue.length > 0 && inputValue !== "delete"}
                        helperText={inputValue && inputValue !== "delete" ? "You must type 'delete' exactly." : ""}
                        sx={{ marginBottom: 2 }}
                    />

                    {/* Animated DeleteProject Button */}
                    {inputValue === "delete" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Button
                                variant="contained"
                                color="error"
                                fullWidth
                                onClick={handleDelete}
                            >
                                Delete Project
                            </Button>
                        </motion.div>
                    )}
                </>
            ) : (
                <Typography color="error">Project not found.</Typography>
            )}
        </Box>
    );
};

export default DeleteProject;
