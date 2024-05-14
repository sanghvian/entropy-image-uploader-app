"use client"
import './page.module.css';
import { Provider } from 'react-redux';
import { AppDispatch, store } from './src/store';
import { Toaster } from 'react-hot-toast';
import App from './src/components/Dashboard';
import { Auth0Provider } from '@auth0/auth0-react';
import Dashboard from './src/components/Dashboard';
import Navbar from './src/components/Navbar';


export default function Home() {


  return (
    <Auth0Provider
      domain="dev-54vh7efulm7mwdr8.us.auth0.com"
      clientId="P0BqA8aECdq02i6uYWOU1pexqGkfaI7h"
      authorizationParams={{
        redirect_uri: process.env.NEXT_PUBLIC_DOMAIN
      }}
    >
      <Provider store={store}>
        <Toaster />
        <div>
          <Navbar />
          <Dashboard />
        </div>
      </Provider>
    </Auth0Provider>
  );
}





