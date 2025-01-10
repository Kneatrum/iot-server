
import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './devicesSlice';


const store = configureStore({
    reducer: {
        devices: deviceReducer,
    },
}); 

export default store;


 
