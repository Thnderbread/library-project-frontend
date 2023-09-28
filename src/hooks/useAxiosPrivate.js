import useAuth from "./useAuth";
import { useEffect } from "react";
import { axiosPrivate } from "../api/axios";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const requestInterceptor = axiosPrivate.interceptors.request.use(
            (config) => { // before request goes through, make sure access token is present. if it isn't, this is the first time the request is being sent - so attach a token from auth state. if it's not there, null will be attached.
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`
                }
                return config;
            }, (error) => { throw error } // throw error to be handled in components
        );

        const responseInterceptor = axiosPrivate.interceptors.response.use(
            (response) => response, // if good response, just return it
            async (error) => {
                console.log('Running response interceptor!');
                const prevRequest = error?.config; // contains previous request
                // if bad response AND previous request was already sent, 
                // don't want to repeatedly send and get 403s
                if (error?.response.status === 403 && !prevRequest?.sent) {
                    console.log('Bad response, refreshing token...');
                    prevRequest.sent = true;

                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    console.log('retrying request...');
                    return axiosPrivate(prevRequest)
                } throw error
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestInterceptor);
            axiosPrivate.interceptors.response.eject(responseInterceptor);
        }
    }, [auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;