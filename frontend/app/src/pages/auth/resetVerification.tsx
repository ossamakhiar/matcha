import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { sendActionRequest } from "../../utils/httpRequests";
import { toast } from "../../utils/toast";

const ResetPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
        .min(12, 'Password is too short - should be 12 chars minimum.')
        .max(28, 'Password is too long - should be 28 chars maximum.')
        .matches(/(?=.*[0-9])/, 'Password must contain a number.')
        .matches(/(?=.*[a-z])/, 'Password must contain a lowercase letter.')
        .matches(/(?=.*[A-Z])/, 'Password must contain an uppercase letter.')
        .matches(/(?=.*[!@#$%^&*])/, 'Password must contain a special character.')
        .required('New password is required')
});

export default function ResetPassword() {
    const [message, setMessage] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (!token) {
        setTimeout(() => {
            navigate('/login');
        }, 2000);
        return ;
    }

    const handleSubmit = async (values: { newPassword: string }) => {
        try {
            await sendActionRequest('PATCH', import.meta.env.VITE_LOCAL_RESET_PASSWORD_API_URL as string, { password: values.newPassword }, token);
            setMessage("Password has been reset successfully.");
            toast.success('Password reset successfully');
        } catch (error) {
            setMessage("Failed to reset password. Please try again.");
            toast.error('Failed to reset password');
        } finally {
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-lg">
                <h2 className="text-2xl mb-4">Reset Password</h2>
                <Formik
                    initialValues={{ newPassword: '' }}
                    validationSchema={ResetPasswordSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block text-gray-700">New Password</label>
                                <Field
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    className="mt-2 p-2 w-full border rounded-md"
                                    placeholder="Enter your new password"
                                />
                                <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </Form>
                    )}
                </Formik>
                {message && <p className="mt-4 text-center">{message}</p>}
            </div>
        </div>
    );
}
