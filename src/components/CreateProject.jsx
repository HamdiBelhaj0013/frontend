import { React } from 'react';
import { Box, Typography, Button } from "@mui/material";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import AxiosInstance from './Axios.jsx';

// Import Form Fields
import MyDatePickerField from "./forms/MyDatePickerField.jsx";
import MyTextField from "./forms/MyTextField.jsx";
import MyMultilineField from "./forms/MyMultilineField.jsx";
import MySelectField from "./forms/MySelectField.jsx";

// Import CSS
import '../assets/Styles/CreateProject.css';

const CreateProject = () => {
    const navigate = useNavigate();

    const schema = yup.object({
        name: yup.string().required('Name is required'),
        budget: yup.number()
            .typeError('Budget must be a number')
            .positive('Budget must be a positive number')
            .required('Budget is required'),
        start_date: yup.date().required('Start date is required'),
        end_date: yup.date()
            .required('End date is required')
            .min(yup.ref('start_date'),'The end date should be after the start date'),
        status: yup.string().required('Status is required'),
        description: yup.string().required('Description is required'),
    });

    const { handleSubmit, control } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            budget: '',
            status: '',
            start_date: null,
            end_date: null,
        },
    });

    // Form submission handler
    const submission = (data) => {
        const start_date = data.start_date ? Dayjs(data.start_date).format('YYYY-MM-DD') : null;
        const end_date = data.end_date ? Dayjs(data.end_date).format('YYYY-MM-DD') : null;

        AxiosInstance.post('api/project/', {
            name: data.name,
            start_date: start_date,
            end_date: end_date,
            description: data.description,
            status: data.status,
            budget: data.budget,
        })
            .then(() => {
                navigate('/projects');
            })
            .catch((err) => console.error(err));
    };

    return (
        <form onSubmit={handleSubmit(submission)}>
            <div className="create-project-container">
                {/* Header */}
                <div className="create-project-header">
                    <Typography className="header-text">Create Project</Typography>
                </div>

                {/* Form Container */}
                <div className="form-container">
                    {/* First Row: Name & Dates */}
                    <div className="form-row">
                        <MyTextField
                            label="Name"
                            name="name"
                            placeholder="Provide your project name"
                            width="30%"
                            control={control}
                        />
                        <MyDatePickerField
                            label="Start Date"
                            name="start_date"
                            placeholder="Provide your project start date"
                            width="30%"
                            control={control}
                        />
                        <MyDatePickerField
                            label="End Date"
                            name="end_date"
                            placeholder="Provide your project end date"
                            width="30%"
                            control={control}
                        />
                    </div>

                    {/* Second Row: Description & Budget */}
                    <div className="form-row">
                        <MyMultilineField
                            label="Description"
                            name="description"
                            placeholder="Provide your project description"
                            width="65%"
                            control={control}
                        />
                        <MyTextField
                            label="Budget"
                            name="budget"
                            placeholder="Provide your project budget"
                            width="30%"
                            control={control}
                        />
                    </div>

                    {/* Third Row: Status */}
                    <div className="form-row">
                        <MySelectField
                            label="Status"
                            name="status"
                            placeholder="Select your project status"
                            width="30%"
                            control={control}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="submit-button-container">
                        <Button
                            variant="contained"
                            type="submit"
                            className="submit-button"
                        >
                            Create Project
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CreateProject;