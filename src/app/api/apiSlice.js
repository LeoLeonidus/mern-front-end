import {createApi,fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { setCredentials } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://mern-back-end-6r0h.onrender.com',
    // baseUrl: 'http://localhost:3500',
    credentials: 'include',
    prepareHeaders:(headers,{getState}) => {
        const token = getState().auth.token

        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args,api,extraOptions) => {

    //console.log("apiSlice baseQueryWithReauth args=",args,"-------");
    let result = await baseQuery(args,api,extraOptions)

    if (result?.error?.status){
        //console.log("apiSlice baseQueryWithReauth status=",result.error.status,"-------");
    }

    if (result?.error?.status === 403) {
        //console.log("Sending Refresh Token");

        const refreshResult = await baseQuery('/auth/refresh',api,extraOptions)

        if (refreshResult?.data) {
            // store new token
            //console.log("store new token");
            api.dispatch(setCredentials({ ...refreshResult.data}))
            // retry original query with new access token
            result = baseQuery(args,api,extraOptions)
        } else {
            if (refreshResult?.error?.status === 403){
                refreshResult.error.data.message = "your login is expired. "
            }
            return refreshResult
        }
    }

    return result
}


export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Note','User'],
    endpoints: buider => ({})
})