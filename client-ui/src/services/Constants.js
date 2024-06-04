export const DEFAULT_ORG = 'Hospital1';
export const API_ENDPOINT = 'http://localhost:3001';
export const API_LOGIN = API_ENDPOINT + '/user/login';
export const API_REGISTER = API_ENDPOINT + '/user/register';
export const API_AUTHENTICATE = API_ENDPOINT + '/user/authenticate';

export const API_PAT_END_POINT = 'http://localhost:3001/patient'
export const API_ADD_PATIENT = API_PAT_END_POINT + '/add';
export const API_UPDATE_PATIENT = API_PAT_END_POINT + '/update';
export const API_SEARCH_PATIENT = API_PAT_END_POINT + '/search';
export const API_GET_ALL_PATIENTS = API_PAT_END_POINT + '/getall';
export const API_GET_PATI_DETAILS = API_PAT_END_POINT + '/getone';
export const API_DELETE_PATI = API_PAT_END_POINT + '/deleterecord';
export const API_ADD_PATI_PRIVATE_DATA = API_PAT_END_POINT + '/addprivate';
export const API_GET_PATI_PVT_DATA = API_PAT_END_POINT + '/getpvtdata';
export const API_GET_PATI_IPFS_FILE = API_PAT_END_POINT + '/getipfsfile';

export const API_ADD_EMPLOYEE = API_ENDPOINT + '/employee/add';
export const API_GET_ALL_EMPLOYEES = API_ENDPOINT + '/employee/getall';
export const API_GET_EMP_DETAILS = API_ENDPOINT + '/employee/getone';
export const API_DELETE_EMP = API_ENDPOINT + '/employee/deleterecord';
export const API_ADD_PRIVATE_DATA = API_ENDPOINT + '/employee/addprivate';
export const API_GET_EMP_PVT_DATA = API_ENDPOINT + '/employee/getpvtdata';
export const API_GET_EMP_IPFS_FILE = API_ENDPOINT + '/employee/getipfsfile';

export const CURRENT_USER = () => JSON.parse(localStorage.getItem('user')) || {};
export const HTTP_HEADER = () => new Headers({ 'Content-type': 'application/json', 'cache-control': 'no-cache', 'Authorization': CURRENT_USER().jwt, org:CURRENT_USER().org, userID:CURRENT_USER().username});
export const HTTP_HEADER_FORMDATA = () => new Headers({'cache-control': 'no-cache', 'Authorization': CURRENT_USER().jwt, org:CURRENT_USER().org, userID:CURRENT_USER().username});
