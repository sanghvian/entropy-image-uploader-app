"use client"
import { Auth0Provider } from '@auth0/auth0-react'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../../store'
import { Toaster } from 'react-hot-toast'

const PageLayout = ({ children }: any) => {
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

                {children}
            </Provider>
        </Auth0Provider>
    )
}

export default PageLayout
