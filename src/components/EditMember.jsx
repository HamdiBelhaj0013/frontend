import React, { useEffect } from 'react';
import { Box, Typography, Button } from "@mui/material";
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios.jsx';
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

// Import Form Fields
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MySelectField from "./forms/MySelectField.jsx";

const EditMember = () => {
    const { id: MyId } = useParams();
    const navigate = useNavigate();

    const { handleSubmit, control, setValue } = useForm({
        defaultValues: {
            name: '',
            address: '',
            email: '',
            nationality: '',
            birth_date: null,
            job: '',
            joining_date: null,
            role: ''
        },
    });

    // Fetch member data
    const GetData = () => {
        AxiosInstance.get(`api/member/${MyId}/`)
            .then((res) => {
                const { name, address, email, nationality, birth_date, job, joining_date, role } = res.data;
                setValue("name", name);
                setValue("address", address);
                setValue("email", email);
                setValue("nationality", nationality);
                setValue("birth_date", birth_date ? dayjs(birth_date) : null);
                setValue("job", job);
                setValue("joining_date", joining_date ? dayjs(joining_date) : null);
                setValue("role", role);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        GetData();
    }, [MyId]);

    // Form submission handler
    const submission = (data) => {
        AxiosInstance.put(`api/member/${MyId}/`, {
            name: data.name,
            address: data.address,
            email: data.email,
            nationality: data.nationality,
            birth_date: data.birth_date ? dayjs(data.birth_date).format('YYYY-MM-DD') : null,
            job: data.job,
            joining_date: data.joining_date ? dayjs(data.joining_date).format('YYYY-MM-DD') : null,
            role: data.role,
        })
            .then(() => {
                navigate('/members');
            })
            .catch((err) => console.error(err));
    };

    return (
        <form onSubmit={handleSubmit(submission)}>
            <Box sx={{ width: "100%", animation: 'fadeIn 1s ease-in-out' }}>
                {/* Header */}
                <Box sx={{
                    display: "flex",
                    width: "100%",
                    backgroundColor: '#1a237e',
                    marginBottom: "10px",
                    padding: 2,
                    borderRadius: '5px',
                }}>
                    <Typography sx={{
                        marginLeft: '20px',
                        fontSize: "18px",
                        fontWeight: 'bold',
                        color: "white",
                    }}>
                        Edit Member
                    </Typography>
                </Box>

                {/* Form Container */}
                <Box sx={{
                    width: "100%",
                    boxShadow: 3,
                    padding: 4,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {/* First Row: Name & Dates */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: '20px' }}>
                        <MyTextField label="Name" name="name" placeholder="Enter member's name" width="30%" control={control} />
                        <MyDatePickerField label="Birth Date" name="birth_date" placeholder="Enter birth date" width="30%" control={control} />
                        <MyDatePickerField label="Joining Date" name="joining_date" placeholder="Enter joining date" width="30%" control={control} />
                    </Box>

                    {/* Second Row: Address, Email, Nationality */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: '20px' }}>
                        <MyTextField label="Address" name="address" placeholder="Enter address" width="30%" control={control} />
                        <MyTextField label="Email" name="email" placeholder="Enter email" width="30%" control={control} />
                        <MyTextField label="Nationality" name="nationality" placeholder="Enter nationality" width="30%" control={control} />
                    </Box>

                    {/* Third Row: Job & Role */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: '20px' }}>
                        <MyTextField label="Job" name="job" placeholder="Enter job title" width="30%" control={control} />
                        <MyTextField label="Role" name="role" placeholder="Select role" width="30%" control={control} />
                    </Box>

                    {/* Submit Button */}
                    <Box sx={{ textAlign: "right", marginTop: 2 }}>
                        <Button variant="contained" type="submit" sx={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            padding: '10px 25px',
                            fontSize: '16px',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                                transform: 'scale(1.1)',
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

export default EditMember;
