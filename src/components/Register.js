import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$/;
const REGISTER_URL = '/register';

const Register = () => {
    const errRef = useRef();
    const userRef = useRef();

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState('');
    const [matchFocus, setMatchFocus] = useState('');

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState('');
    const [emailFocus, setEmailFocus] = useState('');

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setValidName(USERNAME_REGEX.test(user));
    }, [user])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email));
    }, [email])

    useEffect(() => {
        // clears error message when fields are updated
        setErrMsg('');
    }, [user, email, pwd, matchPwd])

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const v1 = PWD_REGEX.test(pwd);
        const v2 = EMAIL_REGEX.test(email);
        const v3 = USERNAME_REGEX.test(user);

        if (!v1 || !v2 || !v3) {
            setErrMsg("Invalid Entry.");
            return;
        }
        try {
            // const response = 
            await axios.post(REGISTER_URL,
                JSON.stringify({
                    username: user,
                    password: pwd,
                    email: email,
                    matchPassword: matchPwd
                }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            // console.log(JSON.stringify(response?.data));
            setSuccess(true);

            setPwd('');
            setUser('');
            setEmail('');
            setMatchPwd('');

            // navigate to login

        } catch (error) {
            if (!error?.response) {
                setErrMsg('No server response.')
            } else if (error.response?.status === 400) {
                setErrMsg('Please fill all fields.')
            } else if (error.response?.status === 409) {
                setErrMsg(error.response.data.error)
            } else {
                setErrMsg('Something went wrong. Please try again.')
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {success ? (
                <section>
                    <h1>Your account has been created! Click below to sign in:</h1>
                    <p><Link to='/login'>Sign in</Link></p>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className={errMsg ? "errorMessage" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Register</h1>
                    <form onSubmit={handleRegisterSubmit}>
                        <label htmlFor="username">
                            Username:
                            <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required
                            aria-invalid={validName ? "false" : "true"}
                            aria-describedby="usernamenote"
                            onFocus={() => setUserFocus(true)}
                            onBlur={() => setUserFocus(false)}
                        />
                        <p id="usernamenote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            4 to 24 characters.<br />
                            Must begin with a letter. <br />
                            Letters, numbers, and underscores allowed.
                        </p>

                        <label htmlFor="email">
                            Email:
                            <FontAwesomeIcon icon={faCheck} className={validEmail ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                            aria-invalid={validEmail ? "false" : "true"}
                            aria-describedby="emailnote"
                            onFocus={() => setEmailFocus(true)}
                            onBlur={() => setEmailFocus(false)}
                        />
                        <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Make sure the email contains an '@' symbol<br />
                            Make sure there is a valid domain name after the @.
                        </p>

                        <label htmlFor="password">
                            Password:
                            <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby="pwdnote"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />
                        <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            8 to 24 characters.<br />
                            Must include uppercase and lowercase characters.<br />
                            Must include at least 1 number.<br />
                            Must include special character.<br />
                            Allowed special characters:
                            <span aria-label="exclamation mark"> !,</span> <span aria-label="at symbol"> @,</span>
                            <span aria-label="hashtag"> #,</span>
                            <span aria-label="asterisk"> *,</span>
                            <span aria-label="percent sign"> %,</span>
                            <span aria-label="question mark"> ?,</span>
                            <span aria-label="dollar sign"> $,</span>
                            <span aria-label="ampersand / and sign"> &.</span>
                        </p>

                        <label htmlFor="confirm_pwd">
                            Confirm Password:
                            <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            onChange={(e) => setMatchPwd(e.target.value)}
                            value={matchPwd}
                            required
                            aria-invalid={validMatch ? "false" : "true"}
                            aria-describedby="confirmnote"
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                        />
                        <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Passwords must match.
                        </p>

                        <button disabled={!validPwd || !validMatch || !validEmail || isLoading}>Sign Up</button>
                    </form>
                    <p>
                        <Link to='/login'>Sign In</Link>
                    </p>
                </section>
            )}
        </>
    )
}

export default Register