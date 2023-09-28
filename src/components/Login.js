import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const LOGIN_URL = '/auth'

const Login = () => {
    const { setAuth, persist, setPersist } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';

    const userRef = useRef();
    const errorRef = useRef();

    const [pwd, setPwd] = useState('');
    const [user, setUser] = useState('');
    const [errMsg, setErrMsg] = useState('');

    const [isLoading, setIsLoading] = useState('');

    useEffect(() => { // focuses username field on load
        userRef.current.focus();
    }, [])

    useEffect(() => { // clears error message on pwd or user field update
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            const accessToken = response?.data?.accessToken;
            const checkouts = response?.data?.checkouts;
            const waitlist = response?.data?.waitlist;

            localStorage.setItem("waitlist", JSON.stringify(waitlist));
            localStorage.setItem("checkouts", JSON.stringify(checkouts));
            setAuth({ isAuthenticated: true, accessToken: accessToken });

            navigate(from, { replace: true });

            // store stuff in auth state, local storage
        } catch (error) {
            if (!error?.response) {
                setErrMsg('No Server Response.');
            } else if (error.response?.status === 400) {
                setErrMsg(error.response.data.error)
            } else if (error.response?.status === 403) {
                setErrMsg('Incorrect password.')
            } else {
                setErrMsg('Something went wrong. Please try again later.')
            }
            errorRef.current.focus(); // set the focus on error display for screen reader
        } finally {
            setIsLoading(false);
        }
    }

    const togglePersist = () => {
        setPersist((prev) => !prev)
    }

    useEffect(() => {
        localStorage.setItem("persist", persist)
    }, [persist])

    return (
        <section>
            <p ref={errorRef} className={errMsg ? "errorMessage" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <button disabled={isLoading}>Sign In</button>
                <div className="persistCheck">
                    <input
                        type="checkbox"
                        id="persist"
                        onChange={togglePersist}
                        checked={persist}
                    />
                    <label htmlFor="persist">Remember Me On This Device</label>
                </div>
            </form>
            <p>
                <br />
                <span className="line">
                    <Link to="/register">Create an account</Link>
                </span>
            </p>
        </section>

    )
}

export default Login;;