// src/store/productSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProductState {
    products: Array<{
        name: string;
        imageUrls: string[];
        productBarcode?: string;
    }>,
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
        addProduct: (state, action: PayloadAction<{ name: string; imageUrls: string[] }>) => {
            state.products.push(action.payload);
        },
        setActiveProductId: (state, action: PayloadAction<string>) => {
            state.activeProductId = action.payload;
        },
        setProductBarcode: (state, action: PayloadAction<{ productId: string, barcode: string }>) => {
            const product = state.products.find(product => product.name === action.payload.productId);
            if (product) {
                product.productBarcode = action.payload.barcode;
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
    setProductBarcode,
    updateProduct
} = productSlice.actions;

export default productSlice.reducer;
