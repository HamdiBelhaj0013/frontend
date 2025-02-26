import { React, useEffect } from 'react';
import { Box, Typography, Button } from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import Dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
// Import Form Fields
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MyMultilineField from "./forms/MyMultilineField.jsx";
import MySelectField from "./forms/MySelectField.jsx";

const EditProject = () => {
    const { id: MyId } = useParams();
    const navigate = useNavigate();

    const { handleSubmit, control, setValue } = useForm({
        defaultValues: {
            name: '',
            description: '',
            budget: '',
            status: 'Active',
            start_date: null,
            end_date: null,
        },
    });

    const GetData = () => {
        AxiosInstance.get(`api/project/${MyId}`)
            .then((res) => {
                const { name, description, budget, status, start_date, end_date } = res.data;
                setValue("name", name);
                setValue("description", description);
                setValue("budget", budget);
                setValue("status", status);
                setValue("start_date", start_date ? Dayjs(start_date) : null);
                setValue("end_date", end_date ? Dayjs(end_date) : null);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        GetData();
    }, [MyId]); // Added MyId as a dependency to prevent warnings

    // Form submission handler
    const submission = (data) => {
        const start_date = data.start_date ? Dayjs(data.start_date).format('YYYY-MM-DD') : null;
        const end_date = data.end_date ? Dayjs(data.end_date).format('YYYY-MM-DD') : null;

        AxiosInstance.put(`api/project/${MyId}/`, {
            name: data.name,
            start_date: start_date,
            end_date: end_date,
            description: data.description,
            status: data.status,
            budget: parseFloat(data.budget),
        })
            .then(() => {
                navigate('/projects');
            })
            .catch((err) => console.error(err));
    };

    return (
        <form onSubmit={handleSubmit(submission)}>
            <Box sx={{
                width: "100%",
                animation: 'fadeIn 1s ease-in-out', // Fade-in animation for the whole form
            }}>
                {/* Header: Improved EditProject Project Bar with Animation */}
                <Box sx={{
                    display: "flex",
                    width: "100%",
                    backgroundColor: '#1a237e',
                    marginBottom: "10px",
                    padding: 2,
                    borderRadius: '5px',
                    animation: 'slideIn 0.8s ease-out', // Slide-in effect for header
                }}>
                    <Typography sx={{
                        marginLeft: '20px',
                        fontSize: "18px",
                        fontWeight: 'bold',
                        color: "white",
                        opacity: 0,
                        animation: 'fadeInText 1s forwards', // Text fade-in
                    }}>
                        Edit Project
                    </Typography>
                </Box>

                {/* Form Container */}
                <Box sx={{
                    width: "100%",
                    boxShadow: 3,
                    padding: 4,
                    display: "flex",
                    flexDirection: "column",
                    animation: 'fadeInUp 1s ease-out', // Animation for the form container
                }}>
                    {/* First Row: Name & Dates */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: '20px',
                        animation: 'fadeInUp 1s ease-out', // Animation for form rows
                    }}>
                        <MyTextField label="Name" name="name" placeholder="Provide your project name" width="30%" control={control} />
                        <MyDatePickerField label="Start Date" name="start_date" placeholder="Provide your project start date" width="30%" control={control} />
                        <MyDatePickerField label="End Date" name="end_date" placeholder="Provide your project end date" width="30%" control={control} />
                    </Box>

                    {/* Second Row: Description & Budget */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: '20px',
                        animation: 'fadeInUp 1s ease-out',
                    }}>
                        <MyMultilineField label="Description" name="description" placeholder="Provide your project description" width="65%" control={control} />
                        <MyTextField label="Budget" name="budget" placeholder="Provide your project budget" width="30%" control={control} />
                    </Box>

                    {/* Third Row: Status */}
                    <Box sx={{
                        marginBottom: '20px',
                        animation: 'fadeInUp 1s ease-out',
                    }}>
                        <MySelectField label="Status" name="status" placeholder="Select your project status" width="30%" control={control} />
                    </Box>

                    {/* Submit Button */}
                    <Box sx={{
                        textAlign: "right",
                        marginTop: 2,
                        animation: 'fadeInUp 1s ease-out',
                    }}>
                        <Button variant="contained" type="submit" sx={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            padding: '10px 25px',
                            fontSize: '16px',
                            transition: 'transform 0.2s ease-in-out', // Hover effect
                            '&:hover': {
                                backgroundColor: '#1565c0', // Correct hover color
                                transform: 'scale(1.1)', // Hover scale effect
                            },
                        }}>
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Box>
        </form>
    );
};

export default EditProject;
