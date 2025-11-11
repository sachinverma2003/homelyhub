import {createSlice} from "@reduxjs/toolkit"

const propertySlice = createSlice({
    name: "property",
    initialState:{
        properties:[],
        totalProperties:0,
        searchParams:{ 
            page: 1,  // <-- FIXED
            guests: '',
            city: '',
            dateIn: '',
            dateOut: ''
        },
        error:null,
        loading:false
    },
    reducers:{
        getRequest(state){
            state.loading = true
        },
        getProperties(state,action){
            state.properties= action.payload.data;
            state.totalProperties= action.payload.all_properties;
            state.loading= false;
        },
        updateSearchParams:(state,action) =>{
            // This logic is complex but generally correct for merging search params
            state.searchParams = Object.keys(action.payload).length === 0 ?{}: {
                ...state.searchParams,
                ...action.payload
            }
        },
        getErrors(state,action){
            state.error = action.payload
        }

    }
})

export const propertyAction = propertySlice.actions;
export default propertySlice