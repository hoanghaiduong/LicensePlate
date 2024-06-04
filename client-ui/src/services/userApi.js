import { API_LOGIN, API_AUTHENTICATE, API_REGISTER, HTTP_HEADER } from './Constants.js';
import axios from 'axios';

const Login = async (user) => {
    try {
        const resp = await axios.post(API_LOGIN, {
            headers: HTTP_HEADER(),
            data: user,
        })

        // If api call success, save login user info in localStorage
        if (resp.status === 200) {
            localStorage.setItem('user', JSON.stringify(resp.data));
        }
        return resp

    } catch (error) {
        // Handle the error from UI layer
        throw error;
    }
}

const CreateNewUser = async (user) => {
    try {
        const resp = await axios.post(API_REGISTER, {
            headers: HTTP_HEADER(),
            data: user,
        })
        
        return resp
    } catch (error) {
        // Handle the error from UI layer
        throw error;
    }
}

const AuthenticateUser = async () => {
    try {
        const resp = await fetch(API_AUTHENTICATE, {
            headers: HTTP_HEADER(),
            method: 'GET',
        })
        return resp
    } catch (error) {
        // Handle the error from UI layer
        throw error;
    }
}

const GetLoginUser = () => {
    const user = localStorage.getItem('user');
    return (JSON.parse(user));
}

const GetJWT = () => {
    const user = localStorage.getItem('user');
    return (JSON.parse(user).jwt);
}

export default {
    Login,
    CreateNewUser,
    GetLoginUser,
    GetJWT,
    AuthenticateUser
}

