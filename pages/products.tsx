"use client"
import Navbar from '@/app/src/components/Navbar';
import PageLayout from '@/app/src/components/PageLayout';
import dynamic from 'next/dynamic'
import React from 'react';


const NoSSR = dynamic(() => import('../app/src/components/ProductsList'), { ssr: false })

export const ProductsPage: React.FC = () => {

    return (
        <PageLayout>
            <Navbar />
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'red',
                color: '#fff'
            }}>
                <NoSSR />
            </div>
        </PageLayout>
    );
};


export default ProductsPage;
