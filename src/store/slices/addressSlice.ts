import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for location data
export interface Province {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
}

export interface Ward {
  id: string;
  name: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressDetail: string;
  province: string;
  district: string;
  ward: string;
  provinceId: string;
  districtId: string;
  wardId: string;
}

// Define state type
export interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  addressFormData: {
    addressName: string;
    addressPhone: string;
    addressDetail: string;
    selectedProvince: string | null;
    selectedDistrict: string | null;
    selectedWard: string | null;
  };
}

// Initial state
const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  addressFormData: {
    addressName: '',
    addressPhone: '',
    addressDetail: '',
    selectedProvince: null,
    selectedDistrict: null,
    selectedWard: null,
  },
};

// Create slice
const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    // Add a new address
    addAddress: (state, action: PayloadAction<Address>) => {
      state.addresses.push(action.payload);
    },

    // Remove an address
    removeAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter((address) => address.id !== action.payload);
    },

    // Set selected address
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },

    // Update address form data
    updateAddressFormData: (state, action: PayloadAction<Partial<AddressState['addressFormData']>>) => {
      state.addressFormData = {
        ...state.addressFormData,
        ...action.payload,
      };
    },

    // Reset address form data
    resetAddressFormData: (state) => {
      state.addressFormData = initialState.addressFormData;
    },

    // Set all addresses
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
    },

    clearAddresses: (state) => {
      state.addresses = [];
      state.addressFormData = initialState.addressFormData;
    },
  },
});

// Export actions
export const {
  addAddress,
  removeAddress,
  setSelectedAddress,
  updateAddressFormData,
  resetAddressFormData,
  setAddresses,
  clearAddresses,
} = addressSlice.actions;

// Export reducer
export default addressSlice.reducer;
