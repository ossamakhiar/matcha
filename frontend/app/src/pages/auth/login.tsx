import { Link, useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { sendActionRequest } from "../../utils/httpRequests";
import { useState } from "react";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModel";
import { toast } from "../../utils/toast";

// Validation schema
const LoginSchema = Yup.object().shape({
    username: Yup.string(),
    password: Yup.string()
});

type FormValues = {
    username: string;
    password: string;
};

export default function Login() {
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [showForgotPasswordErrorMessage, setShowForgotPasswordErrorMessage] = useState(false);
    const [showForgotPasswordMessage, setShowForgotPasswordMessage] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        const { setSubmitting } = formikHelpers;

        try {
            await sendActionRequest('POST', import.meta.env.VITE_LOCAL_LOGIN_API_URL as string, values);

            toast.success('Login successful!');
            setTimeout(() => {
                navigate('/profile');
            }, 500);
            setShowErrorMessage(false);
            setShowForgotPasswordErrorMessage(false);
        } catch (error) {
            setShowForgotPasswordMessage(false);
            setShowErrorMessage(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleForgotPassword = async (email: string) => {
        try {
            await sendActionRequest('POST', import.meta.env.VITE_LOCAL_FORGOT_PASSWORD_API_URL as string, { email });
            setShowForgotPasswordMessage(true);
            setShowForgotPasswordErrorMessage(false);
            toast.success('Password reset email sent');
        } catch (error) {
            setShowForgotPasswordErrorMessage(true);
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleSigninWithGoogle = async () => {
        window.location.href = import.meta.env.VITE_SIGNIN_WITH_GOOGLE_API_URL as string;
    }

    return (
        <div className="flex  w-screen h-screen">
            <div className="flex justify-center w-full md:w-[60%]">
                <div className="flex flex-col items-center justify-center">
                    <h1 className="mb-4 text-5xl poetsen-one-regular text-center">Login to your account</h1>
                    <p className="mb-4">Enter your username and password to sign in</p>
                    <Formik
                        initialValues={{ username: '', password: '' }}
                        validationSchema={LoginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <>
                                <Form className="flex flex-col items-center justify-center">
                                    <div className="flex flex-col items-start mb-4">
                                        <div className="flex flex-col items-start mb-2">
                                            <label htmlFor="username">Username</label>
                                            <Field
                                                id="username"
                                                name="username"
                                                type="text"
                                                className="p-3 bg-light-gray border border-e0 w-96 rounded-lg outline-none focus:ring focus:ring-blue-300"
                                                placeholder="username"
                                                autoComplete="off"
                                            />
                                            <ErrorMessage name="username" component="div" className="text-red-600 text-sm mt-1" />
                                        </div>
                                        <div className="flex flex-col items-start mb-1">
                                            <label htmlFor="password">Password</label>
                                            <Field
                                                id="password"
                                                name="password"
                                                type="password"
                                                className="p-3 bg-light-gray border border-e0 w-96 rounded-lg outline-none focus:ring focus:ring-blue-300"
                                                placeholder="password"
                                                autoComplete="off"
                                            />
                                            <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                                        </div>
                                        <div className="cursor-pointer text-blue-400" onClick={(e) => { e.preventDefault(); setIsModalOpen(true)} }>Forgot password?</div>
                                        {showForgotPasswordErrorMessage &&
                                            <p className="text-red-600 mt-4">Invalid email</p>
                                        }
                                        {showErrorMessage && (
                                            <p className="text-red-600 mt-4">Invalid username or password.</p>
                                        )}
                                        {showForgotPasswordMessage && (
                                            <p className="text-green-600 mt-4">If the email is registered, you will receive password reset instructions.</p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-7 py-2 border border-e0 rounded-lg tracking-wider bg-pastel-pink-100 text-white font-semibold text-md hover:text-black"
                                        disabled={isSubmitting}
                                    >
                                        Login
                                    </button>
                                </Form>
                            </>
                        )}
                    </Formik>

                    <div className="flex items-center gap-2 my-3">
                        <hr className="w-24 border-none h-[1px] bg-gray-300" />
                        <p className="text-continue">or continue with</p>
                        <hr className="w-24 border-none h-[1px] bg-gray-300" />
                    </div>
                    <button onClick={handleSigninWithGoogle} className="bg-light-gray flex justify-center items-center font-semibold gap-3 w-96 py-3 rounded-lg" style={{color: "#5865f2"}}>
                        <img src="/discord.svg" alt="Discord" />
                        Discord
                    </button>
                </div>
            </div>

            <div className="hidden p-8 md:flex flex-col justify-center items-center w-[40%] bg-pastel-pink">
                <div className="flex flex-col mb-10">
                    <h1 className="poetsen-one-regular text-6xl text-white">New here?</h1>
                    <p className="poetsen-one-regular text-xl">
                        New here? Sign up now and start your journey to find your life partner. With our easy-to-use platform, you'll connect with like-minded individuals who share your interests and values. Don't wait—your perfect match could be just a click away! Join us today and discover the love of your life.
                    </p>
                </div>

                <Link to="/signup" className="px-7 py-2 font-semibold rounded-lg tracking-wider bg-pink text-white hover:text-pastel-pink">Sign up</Link>
            </div>
            <ForgotPasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleForgotPassword}
            />
        </div>
    );
}
