import {
    API_ADD_PATIENT, API_UPDATE_PATIENT, API_SEARCH_PATIENT, HTTP_HEADER, API_GET_ALL_PATIENTS,
    API_GET_PATI_DETAILS, API_ADD_PATI_PRIVATE_DATA, API_GET_PATI_PVT_DATA, HTTP_HEADER_FORMDATA,
    API_GET_PATI_IPFS_FILE, API_DELETE_PATI
} from './Constants.js';

const AddPatient = async (patient) => {
    try {
        const resp = await fetch(API_ADD_PATIENT, {
            headers: HTTP_HEADER(),
            method: 'POST',
            body: JSON.stringify(patient),
        })
        return (resp)
    } catch (error) {
        throw error;
    }
}

const UpdatePatient = async (patient) => {
    try {
        const resp = await fetch(API_UPDATE_PATIENT, {
            headers: HTTP_HEADER(),
            method: 'POST',
            body: JSON.stringify(patient),
        })
        return (resp)
    } catch (error) {
        throw error;
    }
}


const SearchPatient = async (searchString) => {
    try {
        const resp = await fetch(API_SEARCH_PATIENT, {
            headers: HTTP_HEADER(),
            method: 'POST',
            body: JSON.stringify({ searchString }),
        })
   
        return resp
        
    } catch (error) {
        throw error;
    }
}

const AddPvtHealthDetails = async (privateData) => {
    try {
        const resp = await fetch(API_ADD_PATI_PRIVATE_DATA, {
            headers: HTTP_HEADER_FORMDATA(),
            method: 'POST',
            body: privateData,
        })
        
        return resp

    } catch (error) {
        throw error;
    }
}

const GetPvtHealthRecords = async (patientID) => {
    console.log(patientID)
    try {
        const resp = await fetch(API_GET_PATI_PVT_DATA, {
            headers: HTTP_HEADER(),
            method: 'POST',
            body: JSON.stringify({ patientID }),
        })
        return resp
    } catch (error) {
        throw error;
    }
}

const GetPatientDetails = async (patientID) => {
    try {
        const resp = await fetch(API_GET_PATI_DETAILS, {
            headers: HTTP_HEADER(),
            method: 'POST',
            body: JSON.stringify({ patientID }),
        })

        return resp
    } catch (error) {
        return error;
    }
}

const GetPatientList = async () => {
    try {
        const resp = await fetch(API_GET_ALL_PATIENTS, {
            headers: HTTP_HEADER(),
            method: 'GET',
        })

        return resp
    } catch (error) {
        throw error;
    }
}

const DeletePatient = async (patientID) => {
    try {
        const resp = await fetch(API_DELETE_PATI, {
            headers: HTTP_HEADER(),
            method: 'POST',
            body: JSON.stringify({ patientID }),
        })
        const empstr = await resp.text()
        return empstr
    } catch (error) {
        return error;
    }
}

const GetIpfsFile = async (props) => {
    try {
        const resp = await fetch(API_GET_PATI_IPFS_FILE, {
            headers: HTTP_HEADER(),
            method: 'POST',
            body: JSON.stringify({ props }),

        })
        var buffer = await resp.arrayBuffer();
        return buffer;
    } catch (error) {
        return error;
    }
}


export default {
    AddPatient,
    UpdatePatient,
    SearchPatient,
    GetPatientList,
    GetPatientDetails,
    DeletePatient,
    AddPvtHealthDetails,
    GetPvtHealthRecords,
    GetIpfsFile
}