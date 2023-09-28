import useAuth from "../hooks/useAuth";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";

const PersistLogin = () => {

    const { auth, persist } = useAuth();
    const refresh = useRefreshToken();

    const [isLoading, setIsLoading] = useState(true);
    // const [refreshing, setRefreshing] = useState(false);

    // This use effect intentionally omits the dependency array
    // in order to prevent unwanted refreshes whenever the auth state
    // changes, like during logout or refreshes, and only have it run on 
    // initial component load.
    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                console.log('refreshing');
                await refresh();
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        if (persist && !auth?.accessToken) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }

        return () => isMounted = false;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {!persist
                ? <Outlet />
                : isLoading
                    ? <p>Loading...</p>
                    : <Outlet />
            }
        </>
    )
}

export default PersistLogin;