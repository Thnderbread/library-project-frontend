import useAuth from './useAuth';
import axios from "../api/axios";
import useBlacklistedBooksContext from '../context/BlacklistedBooksContextProvider';
import useUserBooksContext from '../context/UserBooksContextProvider';

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const { setWaitlist, setCheckouts } = useUserBooksContext();
    const { setCannotWaitlist, setCannotCheckout } = useBlacklistedBooksContext();

    const refresh = async () => {
        try {
            const response = await axios.post('/refresh', {
                withCredentials: true
            });
            // console.log('Response:', response);
            setAuth(prev => { // prev is previous state
                // console.log("Prev:", JSON.stringify(prev));
                // console.log("New:", response.data.accessToken);
                return { ...prev, isAuthenticated: true, accessToken: response.data.accessToken }
            });

            setWaitlist(prevWaitlist => [...prevWaitlist]);
            setCheckouts(prevCheckouts => [...prevCheckouts]);

            setCannotWaitlist(prevWaitlistBlacklist => [...prevWaitlistBlacklist]);
            setCannotCheckout(prevCheckoutsBlacklist => [...prevCheckoutsBlacklist]);

            return response.data.accessToken;
        } catch (error) {
            if (error?.response && error.response?.status === 403) {
                setTimeout(() => {
                    setAuth(prev => ({ ...prev, isAuthenticated: false, accessToken: null }))
                }, 2000)
            }
            // ! delete this
            console.log('Error:', error);
            throw error;
        }
    }
    return refresh;

}

export default useRefreshToken;