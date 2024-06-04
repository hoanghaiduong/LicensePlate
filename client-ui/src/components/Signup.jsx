import React, { useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { ToastContainer, toast } from 'react-toastify';
import UserService from '../services/userApi'

const Signup = (props) => {
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        // Handle signup logic here
        e.preventDefault();

        if (e.target.password.value !== e.target.confirmPassword.value) {
            toast.error("Confirm Password not matching.")
            return false;
        }

        setLoading(true);

        var data = {
            name: e.target.name.value,
            userID: e.target.email.value,
            password: e.target.password.value,
            phone: e.target.mobile.value,
            org: e.target.orgs.value
        }

        try {
            let resp = await UserService.CreateNewUser(data)
            if (resp.status === 200) {
                toast.success("Your profile has been successfully registered.")
                props.closeModal()
            }

        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Please check your server is up and running')
            } else if (error.response?.status === 401) {
                toast.error('There is some issue in the digital certificate. Please regenerate the crypto materials and retry.')
            } else {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="bg-gray-100 min-w-full flex flex-col z-[9999] justify-center py-6 sm:px-6 lg:px-8">
            <div className='flex justify-end'>
                <div className='rounded-full p-2 hover:bg-red-300 hover:cursor-pointer'>
                    <AiOutlineClose strokeWidth='32' size={22}
                        className='text-red-600 '
                        onClick={props.closeModal} />
                </div>
            </div>
            <div className="pb-4 w-96">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign Up</h2>
            </div>

            <form className="space-y-4 px-2" onSubmit={handleSignup}>
                <div>
                    <input required className="border rounded w-full py-2 px-3 
                    text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        type="text"
                        placeholder="Full Name" />
                </div>
                <div>
                    <input required className="aborder rounded w-full py-2 px-3
                     text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder="Email (Login ID)"
                        autoComplete="email" />
                </div>
                <div>
                    <input required className="border rounded w-full py-2 px-3 
                    text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="Password" />
                </div>
                <div>
                    <input required className="border rounded w-full py-2 px-3 text-gray-700 
                    leading-tight focus:outline-none focus:shadow-outline"
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm Password" />
                </div>
                <div>
                    <input required className="border rounded w-full py-2 px-3 
                    text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="mobile"
                        type="text"
                        placeholder="Mobile Number" />
                </div>
                <div>
                    <label htmlFor="orgs" className="block text-gray-700 font-bold mb-2">
                        Select your Organization
                    </label>
                    <div className="mt-1  text-slate-700">
                        <select name="orgs" id="orgs" className='bg-white border rounded w-full 
                        py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'>
                            <option value="org1">org1</option>
                            <option value="org2">org2</option>

                        </select>
                    </div>
                </div>
                <div className="flex items-center pt-4 justify-between">
                    {
                        !loading ?
                            <button type='submit' className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" >
                                Signup
                            </button>
                            : <button className='rounded-md bg-blue-200 inline-flex px-5 py-2 shadow-md w-full justify-center' disabled>
                                <span className="relative flex h-3 w-3 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                </span>
                                Please wait...</button>
                    }
                </div>
            </form>
        </div>
    )
}

export default Signup

