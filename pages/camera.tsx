"use client"
import CameraComponent from '@/app/src/components/CameraComponent'
import Navbar from '@/app/src/components/Navbar'
import PageLayout from '@/app/src/components/PageLayout'
import React from 'react'

const CameraPage = () => {
    return (
        <PageLayout>
            <Navbar />
            <div
                style={{
                    height: '90vh',
                    width: '100%',
                    backgroundColor: '#000',
                    display: 'flex',
                    justifyContent: 'stretch',
                }}
            >
                <CameraComponent />
            </div>
        </PageLayout>
    )
}

export default CameraPage
