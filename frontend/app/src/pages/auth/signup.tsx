// export default SignUp;
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { sendActionRequest } from '../../utils/httpRequests';
import { getFormError } from '../../utils/typeGuards';
import { toast } from '../../utils/toast';

const SignupSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email')
        .required('Email is required'),

    username: Yup.string()
        .min(4, 'Username must be at least 4 characters')
        .max(12, 'Username must be at most 12 characters')
        .matches(/^(?!_)/, 'Username cannot start with an underscore')
        .matches(/^(?!.*__)/, 'Username cannot contain consecutive underscores')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .matches(/(?<!_)$/, 'Username cannot end with an underscore')
        .required('username is required'),
    firstname: Yup.string().required('first name is required')
            .min(2, 'firstname must be at least 2 characters')
            .max(20, 'firstname must be at most 20 characters')
            .matches(/^[a-zA-Z]+$/, 'only alphabets are allowed'),
    lastname: Yup.string().required('last name is required')
            .min(2, 'lastname must be at least 2 characters')
            .max(20, 'lastname must be at most 20 characters')
            .matches(/^[a-zA-Z]+$/, 'only alphabets are allowed'),
    password: Yup.string()
        .min(12, 'Password must be at least 12 characters')
        .max(28, 'Password must be at most 28 characters')
        .matches(/[a-z]/, 'Password must include at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must include at least one uppercase letter')
        .matches(/[0-9]/, 'Password must include at least one digit')
        .matches(/[\W_]/, 'Password must include at least one special character')
        .matches(/^[a-zA-Z\d!@#$%^&*() ]*$/, 'Password can only contain letters, digits, special characters, and spaces')
        .required('Password is required'),
});

type FormValues = {
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
};

const SignUp = () => {
    // const [formData, setFormData] = useState({ email: '', username: '', firstname: '', lastname: '', password: '' });
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);

    const handleSignupWithEmailSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        const { setSubmitting, setErrors } = formikHelpers;

        try {
            await sendActionRequest('POST', import.meta.env.VITE_LOCAL_SIGNUP_API_URL as string, values);

            setShowVerificationMessage(true);
            toast.success('Account created! Please check your email to verify');
        } catch (error) {
            let formError = getFormError(error);

            if (formError === undefined) {
                toast.error('An unexpected error occurred during signup');
                return ;
            }

            const message = formError.message;
            const field = formError.field;

            if (field === 'email') {
                setErrors({ email: message });
                return ;
            }

            if (field === 'username') {
                setErrors({ username: message });
                return ;
            }

            if (field === 'password') {
                setErrors({ password: message });
                return ;
            }

            toast.error(`Error with ${field}: ${message}`);

        } finally {
            setSubmitting(false);
        }
    };

    const handleSignupWithGoogle = async () => {
        window.location.href = import.meta.env.VITE_SIGNIN_WITH_GOOGLE_API_URL as string;
    }

    return (
        <div className="flex w-full">
            <div className="w-full md:w-3/5 flex flex-col items-center justify-center">
                <h1 className="text-5xl poetsen-one-regular">Sign up!</h1>
                <h1 className="mb-4 text-5xl poetsen-one-regular text-center">and find your partner</h1>
                <Formik
                    initialValues={{ email: '', username: '', firstname: '', lastname: '', password: '' }}
                    validationSchema={SignupSchema}
                    onSubmit={handleSignupWithEmailSubmit}
                    >
                    {({ isSubmitting }) => (
                        <Form className="flex flex-col justify-start" noValidate>
                            <div className="mb-4">
                                <label htmlFor="email" className="block mb-2">Email</label>
                                <Field
                                id="email"
                                name="email"
                                type="text"
                                className="p-3 bg-light-gray border border-e0 w-96 rounded-lg outline-none focus:ring focus:ring-blue-300 mb-1"
                                placeholder="john@example.com"
                                autoComplete="off"
                                />
                                <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="username" className="block mb-2">username</label>
                                <Field
                                id="username"
                                name="username"
                                type="text"
                                className="p-3 bg-light-gray border border-e0 w-96 rounded-lg outline-none focus:ring focus:ring-blue-300 mb-1"
                                placeholder="username"
                                />
                                <ErrorMessage name="username" component="div" className="text-red-600 text-sm mt-1" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="firstname" className="block mb-2">first name</label>
                                <Field
                                id="firstname"
                                name="firstname"
                                type="text"
                                className="p-3 bg-light-gray border border-e0 w-96 rounded-lg outline-none focus:ring focus:ring-blue-300 mb-1"
                                placeholder="firstname"
                                />
                                <ErrorMessage name="firstname" component="div" className="text-red-600 text-sm mt-1" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="lastname" className="block mb-2">last name</label>
                                <Field
                                id="lastname"
                                name="lastname"
                                type="text"
                                className="p-3 bg-light-gray border border-e0 w-96 rounded-lg outline-none focus:ring focus:ring-blue-300 mb-1"
                                placeholder="lastname"
                                />
                                <ErrorMessage name="lastname" component="div" className="text-red-600 text-sm mt-1" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="block mb-2">Password</label>
                                <Field
                                id="password"
                                name="password"
                                type="password"
                                className="p-3 bg-light-gray border border-e0 w-96 rounded-lg outline-none focus:ring focus:ring-blue-300 mb-1"
                                placeholder="password"
                                />
                                <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                            </div>
                            
                            <button type="submit" className="w-full bg-black font-semibold text-white py-2 px-5 rounded-lg mt-4" disabled={isSubmitting}>
                                Sign up with email
                            </button>
                        </Form>
                    )}
                </Formik>

                {showVerificationMessage && (
                    <p className="text-green-600 mt-4">Please verify your email. Check your inbox for further instructions.</p>
                )}

                <div className="flex items-center gap-2 my-3">
                    <hr className="w-24 border-none h-[1px] bg-gray-300" />
                    <p className="text-continue">or continue with</p>
                    <hr className="w-24 border-none h-[1px] bg-gray-300" />
                </div>
                <button onClick={handleSignupWithGoogle} className="bg-light-gray flex justify-center items-center font-semibold gap-2 w-96 py-3 rounded-lg" style={{color: "#5865f2"}}>
                    <img src="/discord.svg" alt="Discord" />
                    Discord
                </button>
                <p className="text-center w-96 mt-3">
                By clicking continue, you agree to our
                <a className="text-blue-900" href="#"> Terms of Service </a>
                and
                <a className="text-blue-900" href="#"> Privacy Policy</a>
                </p>
            </div>
            <div className="hidden md:block w-2/5">
                <img src="/imgs/lovers.jpg" className="w-full h-full object-cover" alt="Lovers" />
            </div>
        </div>
    );
};

export default SignUp;