// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    name: string,
    email: string,
    token: string
}

const initialState: UserState = {
    name: '',
    email: '',
    token: ''
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            // state.name = action.payload.name;
            // state.email = action.payload.email;
            // state.token = action.payload.token;
        }
    },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
