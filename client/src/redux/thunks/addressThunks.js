import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// --- Thunks (שליפות מהשרת) ---

// שליפת כל הכתובות של המשתמש
export const fetchAddresses = createAsyncThunk("addresses/fetchAll", async () => {
  const res = await axios.get(`${API_BASE}/addresses`, {
    withCredentials: true,
  });
  return res.data; // מחזיר מערך כתובות
});

// הוספת כתובת חדשה
export const addAddress = createAsyncThunk("addresses/add", async (addressData) => {
  const res = await axios.post(`${API_BASE}/addresses`, addressData, {
    withCredentials: true,
  });
  return res.data; // הכתובת החדשה שנשמרה
});

// עדכון כתובת קיימת
export const updateAddress = createAsyncThunk("addresses/update", async ({ id, data }) => {
  const res = await axios.put(`${API_BASE}/addresses/${id}`, data, {
    withCredentials: true,
  });
  return res.data; // הכתובת המעודכנת
});

// מחיקת כתובת
export const deleteAddress = createAsyncThunk("addresses/delete", async (id) => {
  await axios.delete(`${API_BASE}/addresses/${id}`, {
    withCredentials: true,
  });
  return id; // נחזיר רק את ה־id שנמחק
});

// שינוי כתובת לברירת מחדל
export const setDefaultAddress = createAsyncThunk("addresses/setDefault", async (id) => {
  const res = await axios.patch(`${API_BASE}/addresses/${id}/default`, {}, {
    withCredentials: true,
  });
  return res.data; // מחזיר את הכתובת שעכשיו היא ברירת מחדל
});
