"use client"

import { useSelector } from 'react-redux';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/app/src/store';
import { setUser } from '@/app/src/store/userSlice';
import LoginButton from '@/app/src/components/LoginButton';
import { Button } from 'antd-mobile';
import ProductsList from './ProductsList';
import PageLayout from './PageLayout';
import dynamic from 'next/dynamic';

const NoSSR = dynamic(() => import('../components/ProductsList'), { ssr: false })

const Dashboard = () => {
    const dispatch: AppDispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams()
    const code = searchParams!.get('code')
    useEffect(() => {
        // // Get "code" from the window location object
        // if (window === undefined) return;
        // const code = window.location.search.split('code=')[1];
        if (code) {
            dispatch(setUser({
                name: '',
                email: '',
                token: code as string
            }))
        }
    }, [code])
    return (
        <PageLayout>

            <div style={{
                height: '90vh',
                width: '100%',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {code && (code.length > 0) ? <NoSSR /> : <LoginButton />
                }
            </div>
        </PageLayout>
    );
}

export default Dashboard;
