"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import PageLayout from '@/app/src/components/PageLayout'
import Navbar from '@/app/src/components/Navbar'

const NoSSR = dynamic(() => import('../app/src/components/ImageGallery'), { ssr: false })

const gallery = () => {
    return (
        <PageLayout>
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#000',
                }}
            >
                <Navbar />
                <NoSSR />
            </div>
        </PageLayout>
    )
}

export default gallery
