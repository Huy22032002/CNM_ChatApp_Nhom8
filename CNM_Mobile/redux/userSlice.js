import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      state.userId = null;
    },
    login: (state, action) => {
      state.userId = action.payload.userId;
    },
  },
});

export const { setUser, logout, login } = userSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default userSlice.reducer;
