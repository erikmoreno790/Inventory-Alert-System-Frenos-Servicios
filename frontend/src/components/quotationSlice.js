import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cliente: '',
    nit: '',
    telefono: '',
    email: '',
    placa: '',
    vehiculo: '',
    modelo: '',
    kilometraje: '',
    fechaVencimiento: '',
    items: [],
    discountPercent: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    empresa: {
        nombre: 'Frenos & Servicios',
        direccion: 'Calle 123, Barranquilla',
        telefono: '3001234567',
        email: 'contacto@test.com',
        redes: '@frenosyservicios',
    },
};

const quotationSlice = createSlice({
    name: 'quotation',
    initialState,
    reducers: {
        updateFormData: (state, action) => {
            return { ...state, ...action.payload };
        },
        updateItem: (state, action) => {
            const { index, field, value } = action.payload;
            state.items[index][field] = value;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        removeItem: (state, action) => {
            state.items = state.items.filter((_, i) => i !== action.payload);
        },
        resetForm: (state) => {
            return { ...initialState, empresa: state.empresa };
        },
        updateCalculations: (state) => {
            const subtotal = state.items.reduce(
                (sum, item) => sum + item.cantidad * item.precio,
                0
            );
            const discount = (subtotal * state.discountPercent) / 100;
            const total = subtotal - discount;
            state.subtotal = subtotal;
            state.discount = discount;
            state.total = total;
        },
    },
});

export const {
    updateFormData,
    updateItem,
    addItem,
    removeItem,
    resetForm,
    updateCalculations,
} = quotationSlice.actions;
export default quotationSlice.reducer;