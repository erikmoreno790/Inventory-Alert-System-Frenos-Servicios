import { configureStore } from '@reduxjs/toolkit';
import quotationReducer from './components/quotationSlice';

export const store = configureStore({
    reducer: {
        quotation: quotationReducer,
    },
});