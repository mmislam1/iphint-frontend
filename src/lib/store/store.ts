import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import pricingReducer from './slices/pricingSlice';
import scanReducer from './slices/scanSlice';
import monitoringReducer from './slices/monitoringSlice';
import adminReducer from './slices/adminSlice';
import accountReducer from './slices/accountSlice';
import themeReducer from './slices/themeSlice';
import contactModalReducer from './slices/contactModalSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      scan: scanReducer,
      user: userReducer,
      pricing: pricingReducer,
      monitoring: monitoringReducer,
      admin: adminReducer,
      account: accountReducer,
      theme: themeReducer,
      contactModal: contactModalReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
