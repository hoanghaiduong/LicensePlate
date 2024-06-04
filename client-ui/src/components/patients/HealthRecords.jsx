import React, { useEffect, useState } from 'react'
import PatientService from '../../services/patientApi'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AiFillFileText } from 'react-icons/ai';

const HealthRecords = (args) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isView, setIsView] = useState(false)
  const [healthRecord, setHealthRecord] = useState()
  const [isEdit, setIsEdit] = useState(false)

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const files = event.target.files;
    const fileList = [];
    for (let i = 0; i < files.length; i++) {
      fileList.push(files[i]);
    }
    setSelectedFiles(fileList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true)

    // FormData object is required to send file object to server
    var formData = new FormData

    var data = {
      patientID: args.patientID,
      pastIllness: e.target.past_illness.value,
      surgeries: e.target.surgeries.value,
      medications: e.target.medications.value,
      substanceAbuse: e.target.substance_abuse.value,
      diagnosticResults: e.target.diagnostic_results.value,
      treatmentPlan: e.target.treatment_plans.value,
      isPrivate: true
    }

    if (selectedFiles.length > 0) {
      for (var i = 0; i < selectedFiles.length; i++) {
        formData.append("file", selectedFiles[i])
      }
    }

    formData.append("params", JSON.stringify(data))

    try {
      let resp = await PatientService.AddPvtHealthDetails(formData);

      const response = JSON.parse(await resp.text())

      if (response.status === 'ERROR') {
        toast.error(response.description)
      }
      else if (resp.status === 200) {
        toast.success(response.description)
        getHealthRecords(args.patientID)
        setIsView(true)
      } else if (resp.status) {
        toast.error(response.description)
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Please check your server is up and running')
      } else if (error.response?.status) {
        toast.error(error.response.data)
      } else if (error.message === 'Failed to fetch') {
        toast.error('Please make sure IPFS server is up and running.')
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    if (args.mode === 'view') {
      getHealthRecords(args.patientID)
      setIsView(true)
    } else {
      setIsEdit(false)
      setHealthRecord()
    }
  }, [args])

  const getHealthRecords = async (patientID) => {
    try {
      let resp = await PatientService.GetPvtHealthRecords(patientID);

      // console.log(await resp.text())
      if (resp.status === 200) {
        const ret_obj = JSON.parse(await resp.text())
        if (ret_obj.status === 'ERROR') {
          toast.error(ret_obj.description)
          setHealthRecord()
        } else {
          setHealthRecord(JSON.parse(ret_obj?.objectBytes) ? JSON.parse(ret_obj.objectBytes) : [])
        }

      } else if (resp.status === 401) {
        localStorage.removeItem('user')
        navigate('/')
      }
    } catch (err) {
      console.log(err)
      toast.error(err.message);
    } finally {
    }
  }

  const updateHealthData = () => {
    setIsEdit(true)
    setIsView(false)
  }

  const getFileFromIPFS = async (cid, filename, mimetype) => {
    let resp = await PatientService.GetIpfsFile({ cid, mimetype });
    var bytes = new Uint8Array(resp);
    var blob = new Blob([bytes], { type: mimetype });
    window.open(URL.createObjectURL(blob), filename, 'width=800, height=600');
  }

  const getUploadedFiles = () => {
    return (
      <div className="text-slate-200">
        {healthRecord.fileLocations !== "" ? JSON.parse(healthRecord.fileLocations)?.map((file, index) => (
          <div className='flex cursor-pointer hover:text-slate-400' key={index} onClick={() => getFileFromIPFS(file.value, file.name, file.mimetype)} >
            <AiFillFileText size={20} className='mr-2' />{file.name}</div>
        )) : 'No Files have been uploaded.'}
      </div>
    )
  }

  const displayHealthData = (healthRecord) => {
    return (
      <div className='p-2 ml-0 sm:ml-4 min-w-full  border rounded-md mb-4'>
        <div className='flex-row md:flex pb-4 break-words'>
          <div className='w-full md:w-[50%] mr-2'>
            <div className='grid mb-2'>
              <label className='pl-2 font-medium'>Past Illnesses:</label>
              <div className='px-4 py-2 border border-gray-500 rounded'>{healthRecord.pastIllness}</div>
            </div>
            <div className='grid mb-2'>
              <label className='pl-2 font-medium'>Surgeries:</label>
              <div className='px-4 py-2 border border-gray-500 rounded'>{healthRecord.surgeries}</div>
            </div>
            <div className='grid mb-2'>
              <label className='pl-2 font-medium'>Medications:</label>
              <div className='px-4 py-2 border border-gray-500 rounded'>{healthRecord.medications}</div>
            </div>
          </div>
          <div className='w-full md:w-[50%] md:ml-2'>
            <div className='grid mb-2'>
              <label className='pl-2 font-medium'>Substance abuse information:</label>
              <div className='px-4 py-2 border border-gray-500 rounded'>{healthRecord.substanceAbuse}</div>
            </div>
            <div className='grid mb-2'>
              <label className='pl-2 font-medium'>Diagnostic and test results:</label>
              <div className='px-4 py-2 border border-gray-500 rounded '>{healthRecord.diagnosticResults}</div>
            </div>
            <div className='grid mb-2'>
              <label className='pl-2 font-medium'>Treatment plans:</label>
              <div className='px-4 py-2 border border-gray-500 rounded'>{healthRecord.treatmentPlan}</div>
            </div>
          </div>
        </div>
        <div className='pr-2 pb-4'>
          <div className="text-slate-200">
            {getUploadedFiles()}
          </div>
        </div>
        <div className='pb-4 text-center'>
          <button
            className='w-36 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 
              rounded focus:outline-none focus:shadow-outline' onClick={updateHealthData}>
            Modify
          </button>
        </div>
      </div>
    )
  }

  const getAddHealthData = () => {
    return (
      <div className='min-w-full border rounded-md mb-4'>
        <div className='pb-4 text-center font-bold text-2xl text-sky-700'>Add Health record</div>
        <form onSubmit={handleSubmit}>
          <div className='flex-row md:flex pb-4'>
            <div className='w-full md:w-[50%] md:ml-2'>
              <div className='grid mb-2'>
                <label className='pl-4 font-semibold'>Past Illnesses:</label>
                <textarea id='past_illness' className='input-control'
                  defaultValue={healthRecord?.pastIllness} ></textarea>
              </div>
              <div className='grid mb-2'>
                <label className='pl-4 font-semibold'>Surgeries:</label>
                <textarea id='surgeries' className='input-control'
                  defaultValue={healthRecord?.surgeries}></textarea>
              </div>
              <div className='grid mb-2'>
                <label className='pl-4 font-semibold'>Medications:</label>
                <textarea id='medications' className='input-control'
                  defaultValue={healthRecord?.medications}></textarea>
              </div>
            </div>
            <div className='w-full md:w-[50%] md:ml-2'>
              <div className='grid mb-2'>
                <label className='pl-4 font-semibold'>Substance abuse information:</label>
                <textarea id='substance_abuse' className='input-control'
                  defaultValue={healthRecord?.substanceAbuse}></textarea>
              </div>
              <div className='grid mb-2'>
                <label className='pl-4 font-semibold'>Diagnostic and test results:</label>
                <textarea id='diagnostic_results' className='input-control'
                  defaultValue={healthRecord?.diagnosticResults}></textarea>
              </div>
              <div className='grid mb-2'>
                <label className='pl-4 font-semibold'>Treatment plans:</label>
                <textarea id='treatment_plans' className='input-control'
                  defaultValue={healthRecord?.treatmentPlan}></textarea>
              </div>
            </div>
          </div>
          <div className={isEdit ? 'pl-4 pr-2 pb-4' : 'hidden'}>
            <div className='py-2 font-medium '>Files Added</div>
            {isEdit ?
              getUploadedFiles()
              : ''}
          </div>
          <div className="mb-4 pl-4">
            <label htmlFor="file" className="block font-bold mb-2">
              Upload a files
            </label>
            <input
              id="file"
              name="file"
              type="file"
              onChange={handleFileChange}
              multiple
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className='pl-4 pr-2'>
            <ul className="list-disc list-inside text-slate-200">
              {selectedFiles?.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
          <div className='text-center'>
            <button
              className={`w-36 transition duration-300 ease-in-out ${isLoading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
                } px-4 py-2 rounded-lg`}
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : 'Save'}
            </button>

          </div>
        </form>
      </div >
    )
  }

  return (
    <>
      {isView && healthRecord ?
        displayHealthData(healthRecord)
        :
        getAddHealthData()
      }
    </>
  )
}

export default HealthRecords