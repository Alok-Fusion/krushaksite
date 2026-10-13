import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  allLands: [],
  lands: [],
  pagination: {
    totalLands: 0,
    totalPages: 1,
    currentPage: 1,
  },
  error: null,
  success: false,
  message: null,
};

export const landsReducer = createReducer(initialState, {
  landsCreateRequest: (state) => {
    state.isLoading = true;
  },
  landsCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.lands = action.payload;
    state.success = true;
  },
  landsCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // get all lands of the seller
  getAllLandsShopRequest: (state) => {
    state.isLoading = true;
  },
  getAllLandsShopSuccess: (state, action) => {
    state.isLoading = false;
    state.lands = action.payload;
  },
  getAllLandsShopFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // delete a land data
  deleteLandsRequest: (state) => {
    state.isLoading = true;
  },
  deleteLandsSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  },
  deleteLandsfailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all lands
  getAllLandsRequest: (state) => {
    state.isLoading = true;
  },
  getAllLandsSuccess: (state, action) => {
    state.isLoading = false;
    state.allLands = action.payload;
    state.pagination = action.pagination || {
      totalLands: action.payload?.length || 0,
      totalPages: 1,
      currentPage: 1,
    };
  },
  getAllLandsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
});