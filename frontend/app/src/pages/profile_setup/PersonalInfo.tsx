import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { sendFormDataRequest, sendLoggedInGetRequest } from "../../utils/httpRequests";
import { getFormError, isOfBriefProfileInfoType } from "../../utils/typeGuards";
import { BriefProfileInfo } from "../../types/profile";
import { getCookie } from "../../utils/generalPurpose";
import ErrorOccurred from "../../components/utils/error-occurred/ErrorOccurred";
import { CompleteProfileNextStep } from "../../types/enums";
import { toast } from "../../utils/toast";

type SelectOptions = {
    value: string;
    label: string;
}

type SelectProps = {
    name: string;
    defaultOption: string;
    options: SelectOptions[];
}

const Select = ({name, defaultOption, options }: SelectProps) => {
    return (
        <Field as="select" name={name} className="text-gray-600 w-full outline-none border bg-white rounded-lg p-2 pl-3 pr-8">
            <option value="" className="" defaultChecked>{defaultOption}</option>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Field>
    );
}

type FormValues = {
    firstname: string;
    lastname: string;
    username: string;
    age: number;
    biography: string;
    gender: string;
    sexualPreference: string;
}

const PersonalInfo = () => {
    const [image, setImage] = useState<File>();
    const [defaultProfileInfo, setDefaultProfileInfo] = useState<BriefProfileInfo>();
    const [errorOccurred, setErrorOccurred] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const completeProfileCookie = getCookie('CompleteProfile');

        if (completeProfileCookie) {
            const navRoute = completeProfileCookie == CompleteProfileNextStep.INTERESTS_NEXT ? '/complete-info/2'
                : completeProfileCookie == CompleteProfileNextStep.PHOTOS_NEXT ? '/complete-info/3' : '/profile'

            setTimeout(() => {
                navigate(navRoute);
            }, 300);

            return ;
        }

        (async function fetchDefaultPersonalInfo() {
            try {
                const responseBody = await sendLoggedInGetRequest(import.meta.env.VITE_LOCAL_CURR_USER_BRIEF_INFO_API_URL);
                if (!responseBody || !isOfBriefProfileInfoType(responseBody.profileInfo)) {
                    setErrorOccurred(true);
                    setIsLoading(false);
                    toast.error('Failed to load profile information');
                    return ;
                }

                setDefaultProfileInfo(responseBody.profileInfo);
                setIsLoading(false);
            }
            catch (err) {
                toast.error('An error occurred while loading profile');
                setIsLoading(false);
            }
        })();
    }, [])

    if (isLoading) {
        return (null);
    }

    if (!defaultProfileInfo) {
        return (null);
    }

    if (errorOccurred) {
        return (
            <ErrorOccurred />
        )
    }

    const validationSchema = Yup.object({
        firstname: Yup.string()
            .min(2, 'firstname must be at least 2 characters')
            .max(20, 'firstname must be at most 20 characters')
            .matches(/^[a-zA-Z]+$/, 'only alphabets are allowed'),
        lastname: Yup.string()
            .min(2, 'lastname must be at least 2 characters')
            .max(20, 'lastname must be at most 20 characters')
            .matches(/^[a-zA-Z]+$/, 'only alphabets are allowed'),
        username: Yup.string()
            .min(4, 'Username must be at least 4 characters')
            .max(12, 'Username must be at most 12 characters')
            .matches(/^(?!_)/, 'Username cannot start with an underscore')
            .matches(/^(?!.*__)/, 'Username cannot contain consecutive underscores')
            .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
            .matches(/(?<!_)$/, 'Username cannot end with an underscore'),
        age: Yup.number()
            .min(18, 'Must be at least 18')
            .max(30, 'Must be 30 or less')
            .required('age required!'),
        biography: Yup.string()
            .max(150, 'Biography must be no more than 150 characters'),
        gender: Yup.string()
            .required('gender required'),
        SexualPreferences: Yup.string()
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedPic = event.target.files && event.target.files[0];

        if (!uploadedPic) return;
        setImage(uploadedPic);
    }

    const handleSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        const { setSubmitting, setErrors } = formikHelpers;
        const formData = new FormData();

        formData.append('firstname', values.firstname);
        formData.append('lastname', values.lastname);
        formData.append('username', values.username);
        formData.append('age', String(values.age));
        formData.append('biography', values.biography);
        formData.append('gender', values.gender);
        formData.append('sexualPreference', values.sexualPreference);
        if (image) {
            formData.append('profilePicture', image);
        }
        // console.log(...formData);

        try {
            await sendFormDataRequest('POST', import.meta.env.VITE_LOCAL_COMPLETE_PERSONAL_INFO_API_URL as string, formData);

            toast.success('Personal information saved successfully');
            // pass to next complete-info page
            setTimeout(() => {
                navigate('/complete-info/2');
            }, 1000);
        } catch (error) {
            let formError = getFormError(error);

            if (formError === undefined) {
                toast.error('An unexpected error occurred');
                return ;
            }

            const message = formError.message as string;
            const field = formError.field as string;

            if (field === 'username') {
                setErrors({ username: message });
                return ;
            }

            if (field === 'sexualPreference') {
                setErrors({ sexualPreference: message});
                return ;
            }

            toast.error(`Error with ${field}: ${message}`);

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <h1 className="text-xl my-9">1/3</h1>
            <h1 className="text-4xl md:text-5xl mb-10 text-center">Tell us a little bit about yourself</h1>

            <Formik
                initialValues={{
                    firstname: defaultProfileInfo.firstName,
                    lastname: defaultProfileInfo.lastName,
                    username: defaultProfileInfo.userName,
                    age: defaultProfileInfo.age,
                    biography: defaultProfileInfo.biography,
                    gender: defaultProfileInfo.gender,
                    sexualPreference: defaultProfileInfo.sexualPreferences,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="w-full flex flex-col justify-center gap-3">
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <div className="w-full flex gap-3">
                                    <div className="w-full">
                                        <label htmlFor="firstname" className="block">First Name</label>
                                        <Field
                                            id="firstname"
                                            name="firstname"
                                            type="text"
                                            className="border p-2 rounded-lg outline-none w-full"
                                            placeholder="John"
                                        />
                                        <ErrorMessage name="firstname" component="div" className="text-red-600 text-sm mt-1" />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="lastname" className="block">Last Name</label>
                                        <Field
                                            id="lastname"
                                            name="lastname"
                                            type="text"
                                            className="border p-2 rounded-lg outline-none w-full"
                                            placeholder="Doe"
                                        />
                                        <ErrorMessage name="lastname" component="div" className="text-red-600 text-sm mt-1" />
                                    </div>
                                </div>
                                <div className="w-full flex gap-3">
                                    <div className="w-full">
                                        <label htmlFor="username" className="block">Username</label>
                                        <Field
                                            id="username"
                                            name="username"
                                            type="text"
                                            className="border p-2 rounded-lg outline-none w-full"
                                            placeholder="username"
                                        />
                                        <ErrorMessage name="username" component="div" className="text-red-600 text-sm mt-1" />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="username" className="block">Age</label>
                                        <Field id="age" name="age" className="border p-2 rounded-lg outline-none w-full" placeholder="Age" />
                                        <ErrorMessage name="age" component="div" className="text-red-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col h-full gap-1">
                                <label htmlFor="biography">Biography</label>
                                <Field
                                    as="textarea"
                                    id="biography"
                                    name="biography"
                                    className="border outline-none p-2 rounded-lg focus:ring-2 h-48 resize-none"
                                    placeholder="bio"
                                />
                                <ErrorMessage name="biography" component="div" className="text-red-600 text-sm mt-1" />
                            </div>

                            <div className="flex gap-3 mb-3">
                                <div className="flex flex-col h-full w-2/5">
                                    <label htmlFor="gender">Gender</label>
                                    <Select name='gender' defaultOption='Gender' options={[{ value: 'male', label: "Male" }, { value: 'female', label: "Female" }, { value: 'transgender-male', label: 'Transgender_Male' }, { value: 'transgender-female', label: 'Transgender_Female' } ]} />
                                    <ErrorMessage name="gender" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                <div className="flex flex-col h-full w-3/5">
                                    <label htmlFor="sexualPreference">Sexual Preference</label>
                                    <Select name='sexualPreference' defaultOption='Sexual Preference' options={[{ value: 'heterosexual', label: "Heterosexual" }, { value: 'bisexual-male', label: "Bisexual-male" }, { value: 'bisexual-female', label: 'Bisexual-female' }, { value: 'lesbian', label: 'Lesbian' }, { value: 'homosexual', label: 'Homosexual' }]} />
                                    <ErrorMessage name="sexualPreference" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <label htmlFor="upload-pic" className="flex items-center gap-2">
                                    <div className="bg-gray-200 h-20 w-20 rounded-lg flex justify-center items-center cursor-pointer">
                                        {!image ? <FaUserCircle size={40} className="fill-gray-600" /> : <img src={URL.createObjectURL(image)} alt="pic" className="object-cover h-full w-full rounded-lg" />}
                                    </div>
                                    {!image ? "upload profile picture" : image.name}
                                </label>
                                <input
                                    name="profile_picture"
                                    id="upload-pic"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mb-7">
                            <button
                                type="submit"
                                className="mt-6 px-6 py-2 bg-pastel-pink-100 rounded-lg font-semibold tracking-wide text-white hover:text-black focus:ring"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Continue'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default PersonalInfo;
