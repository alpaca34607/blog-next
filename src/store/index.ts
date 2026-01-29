import { configureStore, createSlice } from "@reduxjs/toolkit";

// Placeholder slice - replace with your actual reducers
const placeholderSlice = createSlice({
  name: "placeholder",
  initialState: {},
  reducers: {},
});

const store = configureStore({
  reducer: {
    placeholder: placeholderSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
