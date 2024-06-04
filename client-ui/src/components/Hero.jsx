import React, { useState } from 'react'
import Signup from './Signup';

const Hero = () => {
    const [showModal, setShowModal] = useState(false);

    const handleSignupClick = () => {
        setShowModal(true);
    };

    return (
        <div className=' text-slate-700 min-h-[calc(100vh_-_20px)] drop-shadow-xl'>
            <div className='max-w-[800px] mt-[-96px] w-full pt-56 h-[100vh - 56px] mx-auto text-center flex flex-col '>
                <p className='text-[#1d4c4d] font-bold p-2 mx-2 drop-shadow-sm'>
                    YOUR GATEWAY TO THE CONNECTED WORLD
                </p>
                <h1 className='md:text-6xl sm:text-6xl text-4xl font-bold pt-10 mx-4 md:pt-6 pb-10'>
                    Secure, Immutable Records Management
                </h1>
                <div className='flex justify-center items-center'>
                    <p className='md:text-4xl sm:text-4xl text-cyan-800 text-xl font-bold py-4'>
                        Connecting Organizations using Hyperledger Fabric Blockchain
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Hero