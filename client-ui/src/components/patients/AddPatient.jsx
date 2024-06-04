import React, { useEffect, useState } from 'react'
import PatientService from '../../services/patientApi'
import { useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const AddPatient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams()
  const [isEdit, setIsEdit] = useState(false)

  let pati_data = {
    fName: "",
    lName: "",
    dob: "",
    gender: "",
    mobile: "",
    emergency_phone: "",
    address: "",
  }

  // Get Patient record from blockchain
  const getPatientRecord = async (patientID) => {
    try {
      let resp = await PatientService.GetPatientDetails(patientID);

      if (resp.status === 200) {
        const ret_obj = JSON.parse(await resp.text())
        if (ret_obj.status === 'SUCCESS') {
          const data = JSON.parse(ret_obj.objectBytes)
          setFormData(data)
          console.log(data.dob)
          setSelectedDate(new Date(data.dob.split('/').reverse().join('-')))
        } else {
          toast.error(ret_obj.description)
        }
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  const [formData, setFormData] = useState(pati_data);

  const handleChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    console.log('GSHDGDSH')
    // Check the querystring value for Patient edit mode
    if (searchParams.get('ref')) {
      console.log(searchParams.get('ref'))
      setIsEdit(true)
      getPatientRecord(searchParams.get('ref'))
    } else {
      setIsEdit(false)
      setFormData(pati_data)
      setSelectedDate(null)
    }
  }, [searchParams.get('ref')])


  // Generate Unique id for Patient record
  const generateUniqueId = async () => {
    // Remove any spaces from the first and last name, and concatenate them with the DOB
    const nameAndDob = formData.fName.replace(/\s/g, '') + formData.lName.replace(/\s/g, '') + formData.dob;
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(nameAndDob));

    // Convert the hash to a hexadecimal string and return the first 16 characters as the unique ID
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .slice(0, 16)
      .join("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    validate();

    try {
      setIsLoading(true)

      var resp

      if (isEdit) {
        resp = await PatientService.UpdatePatient(formData)
      } else {
        formData.dob = selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        formData.patientID = await generateUniqueId()
        resp = await PatientService.AddPatient(formData)
      }

      const response = JSON.parse(await resp.text())

      if (resp.status === 200) {
        toast.success(response.description)
        setFormData(pati_data)
        setSelectedDate(null)
      } else if (resp.status) {
        toast.error(response.description)
      }

    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Please check your server is up and running')
      } else if (error.response?.status) {
        toast.error(error.response.data)
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    if (formData.fName === "" || formData.lName === "") {
      toast.error('Please fill Patient details and submit.')
    } else if (!selectedDate) {
      toast.error("Please enter Patient's Date of Birth.")
    }
  }

  const resetForm = () => {
    // You can't change Name and DOB as it create the unique id for patient
    if (isEdit) {
      pati_data.fName = formData.fName
      pati_data.lName = formData.lName
      pati_data.dob = formData.dob
      setFormData(pati_data)
    } else {
      setFormData(pati_data)
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh_-_150px)] pt-24 sm:pt-20 pb-10 items-center">
        <h1 className="text-3xl font-medium text-zinc-700 my-4 ">{isEdit ? 'Modify Patient data' : 'Add Patient'}</h1>
        <form onSubmit={handleSubmit} className="w-full pr-2 sm:pr-0 pt-4 max-w-lg">
          <div className='grid md:flex px-2 sm:px-0 sm:-mx-3 mb-4 sm:mb-5'>
            <div className={`${'w-full pb-4 sm:pb-0 sm:w-1/2'} ${isEdit ? 'pointer-events-none' : ''}`}>
              <input
                type="text"
                name="fName"
                id="fName"
                placeholder="First Name"
                value={formData.fName}
                onChange={handleChange}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-2 px-4 outline-none focus:shadow-md"
              />
            </div>
            <div className={`${'w-full sm:pl-3 sm:w-1/2'} ${isEdit ? 'pointer-events-none' : ''}`}>
              <input
                type="text"
                name="lName"
                id="lName"
                placeholder="Last Name"
                value={formData.lName}
                onChange={handleChange}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-2 px-4 outline-none focus:shadow-md"
              />

            </div>
          </div>
          <div className='grid md:flex px-2 sm:px-0 sm:-mx-3 pb-4 sm:pb-5'>
            <div className={`${'w-full pb-4 sm:pb-0 sm:w-1/2'} ${isEdit ? 'pointer-events-none' : ''}`}>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                defaultValue={new Date()}
                placeholderText='DOB (dd/MM/yyyy)'
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                yearDropdownItemNumber={10}
                dateFormat="dd/MM/yyyy"
                className='block w-full border rounded py-2 px-4 leading-tight outline-none focus:shadow-md'
              />
            </div>
            <div className="w-full sm:pl-3 sm:w-1/2">
              <select
                className="block w-full border bg-white rounded py-2 px-4  
              leading-tight outline-none focus:shadow-md"
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select patient gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

            </div>
          </div>
          <div className="grid md:flex px-2 sm:px-0 sm:-mx-3 mb-5">
            <div className="w-full pb-4 sm:pb-0 sm:w-1/2">
              <input
                className="appearance-none block w-full  outline-none  rounded py-2 px-4 focus:shadow-md"
                id="mobile"
                name="mobile"
                type="text"
                placeholder="Patient phone number"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div className="w-full sm:pl-3 sm:w-1/2">
              <input
                className="appearance-none block w-full outline-none rounded py-2 px-4 focus:shadow-md"
                id="emergency_phone"
                name="emergency_phone"
                type="text"
                placeholder="Emergency Number"
                value={formData.emergency_phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="md:flex px-2 sm:px-0 sm:-mx-3 mb-5">
            <div className="w-full">
              <textarea
                className="appearance-none block w-full rounded py-2 px-4 mb-3 outline-none focus:shadow-md"
                id="address"
                name="address"
                placeholder="Enter patient address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex items-center px-2 sm:-mx-3 sm:px-0 justify-between">
            <button
              className={`w-[45%] transition duration-300 ease-in-out ${isLoading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
                } px-4 py-2 rounded-lg`}
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : 'Submit'}
            </button>

            <button
              className="w-[45%] bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
              type="button" onClick={resetForm}> Reset
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default AddPatient