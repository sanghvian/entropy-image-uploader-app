// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ImagesState {
    // images: { [key: string]: string },
    // imagePreviews: { [key: string]: string }
    images: any,
    imagePreviews: any
}

const initialState: ImagesState = {
    images: {},
    imagePreviews: {}
};

export const userSlice = createSlice({
    name: 'images',
    initialState,
    reducers: {
        setImagesState(state, action: PayloadAction<ImagesState>) {
            state.images = action.payload.images;
            state.imagePreviews = action.payload.imagePreviews;
        },
        removeImage(state, action: PayloadAction<string>) {
            // Removes an image by key
            const key = action.payload;
            delete state.images[key];
            delete state.imagePreviews[key];
        },
        setImagePreviews(state, action: PayloadAction<{ [key: string]: string }>) {
            state.imagePreviews = action.payload;
        },
        setImages(state, action: PayloadAction<{ [key: string]: string }>) {
            state.images = action.payload;
        }
    },
});

export const {
    setImagesState,
    removeImage,
    setImagePreviews,
    setImages
} = userSlice.actions;

export default userSlice.reducer;
