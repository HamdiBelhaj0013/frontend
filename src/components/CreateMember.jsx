import { React } from 'react';
import { Box, Typography, Button } from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import Dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// Import Form Fields
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MySelectField from "./forms/MySelectField.jsx";

const CreateMember = () => {
    const navigate = useNavigate();
    const schema = yup
        .object({
            name: yup.string().required('Name is required'),
            address: yup.string().required('Address is required'),
            email: yup.string().email('Invalid email').required('Email is required'),
            nationality: yup.string().required('Nationality is required'),
            birth_date: yup.date().required('Birth date is required'),
            job: yup.string().required('Job is required'),
            joining_date: yup.date().required('Joining date is required'),
            role: yup.string().required('Role is required'),
        });

    const { handleSubmit, control } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            address: '',
            email: '',
            nationality: '',
            birth_date: null,
            job: '',
            joining_date: null,
            role: '',
        },
    });

    // Form submission handler
    const submission = (data) => {
        const birth_date = data.birth_date ? Dayjs(data.birth_date).format('YYYY-MM-DD') : null;
        const joining_date = data.joining_date ? Dayjs(data.joining_date).format('YYYY-MM-DD') : null;

        AxiosInstance.post('/api/member/', {
            name: data.name,
            address: data.address,
            email: data.email,
            nationality: data.nationality,
            birth_date: birth_date,
            job: data.job,
            joining_date: joining_date,
            role: data.role,
        })
            .then(() => {
                navigate('/members');
            })
            .catch((err) => console.error(err));
    };

    return (
        <form onSubmit={handleSubmit(submission)}>
            <Box sx={{
                width: "100%",
                animation: 'fadeIn 1s ease-in-out', // Fade-in animation for the whole form
            }}>
                {/* Header: CreateProject Member Header with Animation */}
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
                        Create Member
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
                    {/* First Row: Name, Address, Email */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: '20px',
                    }}>
                        <MyTextField label="Name" name="name" placeholder="Enter member's name" width="30%" control={control} />
                        <MyTextField label="Address" name="address" placeholder="Enter member's address" width="30%" control={control} />
                        <MyTextField label="Email" name="email" placeholder="Enter member's email" width="30%" control={control} />
                    </Box>

                    {/* Second Row: Nationality, Job, Role */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: '20px',
                    }}>
                        <MyTextField label="Nationality" name="nationality" placeholder="Enter member's nationality" width="30%" control={control} />
                        <MyTextField label="Job" name="job" placeholder="Enter member's job" width="30%" control={control} />
                        <MyTextField label="Role" name="role" placeholder="Select member's role" width="30%" control={control} />
                    </Box>

                    {/* Third Row: Birth Date, Joining Date */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: '20px',
                    }}>
                        <MyDatePickerField label="Birth Date" name="birth_date" placeholder="Select member's birth date" width="30%" control={control} />
                        <MyDatePickerField label="Joining Date" name="joining_date" placeholder="Select member's joining date" width="30%" control={control} />
                    </Box>

                    {/* Submit Button */}
                    <Box sx={{
                        textAlign: "right",
                        marginTop: 2,
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
                            Create Member
                        </Button>
                    </Box>
                </Box>
            </Box>
        </form>
    );
};

export default CreateMember;
