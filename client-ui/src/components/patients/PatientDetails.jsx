import React, { useEffect, useState } from 'react'
import HealthRecords from './HealthRecords'
import PatientService from '../../services/patientApi'
import { TiArrowBack } from 'react-icons/ti'
import { useNavigate } from 'react-router-dom'

const PatientDetails = (props) => {
    const [patients, setPatients] = useState([])
    const [patientNames, setPatientNames] = useState()
    const [patientDetails, setPatientDetails] = useState()
    const [healthRecords, setHealthRecords] = useState()
    const [showHealthRecords, setShowHealthRecords] = useState(false)
    const [curPatient, setCurPatient] = useState()

    const navigate = useNavigate()

    useEffect(() => {
        setPatients(props.patients)
        getNames()
        getDetails(props.index)
    }, [props.patients, showHealthRecords])

    const updatePatient = (patient_id) => {
        navigate(`/addpatient?ref=${patient_id}`)
    }

    const getDetails = (i) => {
        const patient = props.patients[i]
        setCurPatient(patient)

        setPatientDetails(
            <>
                <div className="shadow-md rounded-md p-2">
                    <h2 className="text-lg font-medium mb-2">
                        {patient.fName}&nbsp; {patient.lName}
                    </h2>
                    <div className="flex flex-col md:flex-row md:justify-between">
                        <div className="flex-1 md:pr-4">
                            <p className="text-gray-700 text-sm mb-1">Date of Birth:</p>
                            <p className="text-sky-700 font-medium mb-4">{patient.dob}</p>
                            <p className="text-gray-700 text-sm mb-1">Gender:</p>
                            <p className="text-sky-700 font-medium pb-4">{patient.gender}</p>
                            <p className="text-gray-700 text-sm mb-1">Phone:</p>
                            <p className="text-sky-700 font-medium">{patient.mobile}</p>
                        </div>
                        {!showHealthRecords &&
                            <div className="flex-1 md:pl-4">
                                <p className="text-gray-700 text-sm mb-1">Address:</p>
                                <p className="text-sky-700 font-medium mb-4">{patient.address}</p>
                                <p className="text-gray-700 text-sm mb-1">Emergency Contact:</p>
                                <p className="text-sky-700 font-medium">{patient.emergency_phone}</p>
                            </div>
                        }
                    </div>
                    {!showHealthRecords &&
                        <div className='text-center'>
                            <button
                                className='mb-2 bg-blue-500 hover:bg-blue-700 text-white mt-4 font-bold py-2 px-6
                                rounded focus:outline-none focus:shadow-outline' onClick={() => updatePatient(patient.patientID)}>
                                Modify
                            </button>
                        </div>
                    }
                </div>
            </>
        )
    }

    const getNames = () => {
        setPatientNames(
            <div>
                {
                    props.patients.map((item, index) => {
                        return <div className='rounded-md hover:cursor-pointer hover:bg-[#d4d8d4] py-1 px-2'
                            key={index} onClick={() => getDetails(index)}>{item.fName + ' ' + item.lName}
                        </div>
                    })
                }
            </div>
        )
    }

    const viewHealthRecords = (mode) => {
        setShowHealthRecords(true)
        setHealthRecords(<HealthRecords patientID={curPatient.patientID} mode={mode} />)
    }

    const goBack = () => {
        if (showHealthRecords) {
            setShowHealthRecords(false)
        } else {
            props.fun('search')
        }
    }

    return (
        <>
            <div className='flex-rox w-full max-w-[1240px] pt-4 mx-auto '>
                <div className='flex pl-4 pb-2 text-sky-700 hover:cursor-pointer' onClick={goBack}>
                    <TiArrowBack size={20} className='mr-2 mt-[2px]' /> Back
                </div>
                <div className='flex flex-col sm:flex-row pt-2 pl-4 md:pl-0 min-w-full pr-4 ' >
                    <div className={!showHealthRecords ? 'h-fit p-2 ml-0 sm:ml-4 sm:w-[30%] border border-gray-400 rounded-md mb-4' : 'hidden'}>
                        <div className='text-lg font-semibold text-gray-700 pb-2'>Patient Names:</div>
                        {patientNames}
                    </div>
                    {/* <div className='w-full sm:w-[70%]'> */}
                    <div className={!showHealthRecords ? 'w-full sm:w-[70%]' : 'w-full sm:w-[20%]'}>
                        <div className='ml-0 sm:ml-4  border rounded-md mb-4'>
                            {patientDetails}
                        </div>

                        {!showHealthRecords &&
                            <div className='flex-row md:flex sm:pl-4 md:pl-0 pb-4 justify-between'>
                                <button
                                    className='md:ml-4 mb-2 w-full md:w-[50%] md:mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 
                                rounded focus:outline-none focus:shadow-outline' onClick={() => viewHealthRecords('add')}>
                                    Add Health Records
                                </button>
                                <button
                                    className="bg-cyan-500 mb-2 w-full md:w-[50%] md:ml-2 hover:bg-cyan-700 text-white font-bold py-2 px-4 
                                rounded focus:outline-none focus:shadow-outline" onClick={() => viewHealthRecords('view')}>
                                    Show Health Records
                                </button>
                            </div>
                        }
                    </div>
                    <div className={showHealthRecords ? 'w-full sm:w-[80%]' : 'hidden'}>
                        {healthRecords}
                    </div>

                </div>
            </div>
        </>
    )
}

export default PatientDetails