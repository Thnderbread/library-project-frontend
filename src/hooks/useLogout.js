import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        localStorage.clear();
        setAuth({ isAuthenticated: false, accessToken: null })
        try {
            await axios.post('/logout', {
                withCredentials: true
            });
        } catch (error) {
            console.error(error);
        }
    }

    return logout;
}

export default useLogout;