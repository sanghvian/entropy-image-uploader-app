"use client"
import React, { useEffect } from 'react'
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import toast from 'react-hot-toast';
import { setUser } from '../store/userSlice';


// interface GoogleAuthResponseInterface {
//     tokens: {
//         access_token: string,
//         expires_date: number,
//         id_token: string,
//         scope: string,
//         token_type: string,
//         refresh_token: string,
//     },
//     userDetails: {
//         email: string
//         name: string,
//         photoUrl: string
//     }
// }

const GoogleAuth2: React.FC = () => {
    const userToken = useSelector((state: RootState) => state.user.token);
    const dispatch: AppDispatch = useDispatch();
    const CLIENT_ID = process.env.REACT_APP_GCP_CLIENT_ID;
    const API_KEY = process.env.REACT_APP_GCP_API_KEY;
    // const DISCOVERY_DOC = ['https://www.googleapis.com/discovery/v1/apis/people/v1/rest'];
    // Updated SCOPES to include Google Sheets and Google Drive
    const SCOPES = 'openid email profile'
    // 'https://www.googleapis.com/auth/calendar ' +
    // 'https://www.googleapis.com/auth/calendar.events ' +
    // 'https://www.googleapis.com/auth/spreadsheets ' +
    // 'https://www.googleapis.com/auth/drive';

    useEffect(() => {
        function start() {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                // discoveryDocs: DISCOVERY_DOC,
                scope: SCOPES,
            });
        }
        gapi.load('client:auth2', start);
    }, [API_KEY, CLIENT_ID, SCOPES]);

    const onSuccess = async (response: { code: string }) => {
        const toastId = toast.loading('Signing you in...');
        dispatch(setUser({
            name: '',
            email: '',
            token: response.code
        }))
        console.log('response', response);
    };
    const onFailure = (response: any) => {
    };
    const onLogoutSuccess = () => {
        dispatch(setUser({
            name: '',
            email: '',
            token: ''
        }))
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '100vw',
                color: '#fff',
                height: '100vh',
                overflowX: 'hidden',
            }}
        >
            <div className='auth-container'>
                {!userToken &&
                    (<div className='login-container'>
                        <GoogleLogin
                            clientId={CLIENT_ID as string}
                            onSuccess={async (response: any) => await onSuccess(response)}
                            onFailure={onFailure}
                            cookiePolicy='single_host_origin'
                            responseType='code'
                            accessType='offline'
                            prompt='consent'
                        >
                            Login with Google
                        </GoogleLogin>
                    </div>)
                }
                {userToken && <GoogleLogout
                    clientId={CLIENT_ID as string}
                    onLogoutSuccess={onLogoutSuccess}
                />}
            </div>
        </div>
    );

}
export default GoogleAuth2
