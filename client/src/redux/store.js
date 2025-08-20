
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer'; 
import { favoritesApi } from './api/favoritesApi';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(favoritesApi.middleware),
});
