import { Box } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Axios from './Axios.jsx'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const AssociationRegister = () => {
    const navigate = useNavigate()

    const schema = yup
        .object({
            name: yup.string().required('Association name is required'),
            email: yup.string().email('Field expects an email address').required('Email is a required field'),
            password: yup.string()
                .required('Password is a required field')
                .min(8, 'Password must be at least 8 characters')
                .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                .matches(/[0-9]/, 'Password must contain at least one number')
                .matches(/[!@#$%^&*(),.?":;{}|<>+]/, 'Password must contain at least one special character'),
            password2: yup.string().required('Password confirmation is a required field')
                .oneOf([yup.ref('password'), null], 'Passwords must match'),
            matricule_fiscale: yup.string().required('Matricule Fiscale is required'),
            patente_image: yup.mixed().required('Patente image is required').test('fileType', 'Unsupported File Format', value => {
                return value && ['image/jpeg', 'image/png'].includes(value.type)
            })
        })

    const { handleSubmit, control } = useForm({ resolver: yupResolver(schema) })

    const submission = (data) => {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('email', data.email)
        formData.append('password', data.password)
        formData.append('matricule_fiscale', data.matricule_fiscale)
        formData.append('patente_image', data.patente_image[0])

        Axios.post(`/users/associations/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                navigate(`/`)
            })
    }

    return (
        <div className={"myBackground"}>
            <form onSubmit={handleSubmit(submission)} encType="multipart/form-data">
                <Box className={"whiteBox"}>
                    <Box className={"itemBox"}>
                        <Box className={"title"}> Association Registration </Box>
                    </Box>

                    <Box className={"itemBox"}>
                        <MyTextField
                            label={"Association Name"}
                            name={"name"}
                            control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyTextField
                            label={"Email"}
                            name={"email"}
                            control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyPassField
                            label={"Password"}
                            name={"password"}
                            control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyPassField
                            label={"Confirm Password"}
                            name={"password2"}
                            control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyTextField
                            label={"Matricule Fiscale"}
                            name={"matricule_fiscale"}
                            control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <input
                            type="file"
                            name="patente_image"
                            accept="image/*"
                            ref={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyButton
                            type={"submit"}
                            label={"Register"}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <Link to="/">Already registered? Please login!</Link>
                    </Box>
                </Box>
            </form>
        </div>
    )
}

export default AssociationRegister
