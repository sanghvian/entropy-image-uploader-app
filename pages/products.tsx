// src/components/AddProduct.tsx
import AddProduct from '@/app/src/components/AddProduct';
import Navbar from '@/app/src/components/Navbar';
import { store } from '@/app/src/store';
import React from 'react';
import { Provider } from 'react-redux';

export const ProductsPage: React.FC = () => {

    return (
        <Provider store={store}>
            <Navbar />
            <AddProduct />
        </Provider>
    );
};

export default ProductsPage;
