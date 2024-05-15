// src/store/productSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
    id: string;
    name: string;
    imageUrls: string[];
    productBarcode: string;
}


interface ProductState {
    products: Array<Product>,
    activeProductId: string;
}

const initialState: ProductState = {
    products: [],
    activeProductId: "",
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        addProduct: (state, action: PayloadAction<Product>) => {
            state.products.push(action.payload);
        },
        setActiveProductId: (state, action: PayloadAction<string>) => {
            state.activeProductId = action.payload;
        },
        setProductBarcode: (state, action: PayloadAction<{ productId: string, barcode: string }>) => {
            const product = state.products.find(product => product.name === action.payload.productId);
            if (product) {
                product.id = action.payload.barcode;
            }
        },
        updateProduct(state, action: { payload: { productId: string, imageUrls: string[] } }) {
            const { productId, imageUrls } = action.payload;
            const product = state.products.find(product => product.name === productId);
            if (product) {
                product.imageUrls = imageUrls;
            }
        }
    },
});

export const {
    addProduct,
    setActiveProductId,
    updateProduct,
    setProductBarcode
} = productSlice.actions;

export default productSlice.reducer;
