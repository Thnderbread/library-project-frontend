import useAuth from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { handleServerResponseError } from "../common/utils";
import useUserBooksContext from "../context/UserBooksContextProvider";
import useBlacklistedBooksContext from "../context/BlacklistedBooksContextProvider";

const CHECKIN_URL = '/books/checkout?';
const USER_CHECKOUTS_URL = '/users/checkouts';

const UserCheckouts = () => {
    const { auth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();

    const errorRef = useRef();
    const successRef = useRef();

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [isLoading, setLoading] = useState(false);

    const { checkouts, setCheckouts, } = useUserBooksContext();
    const { setCannotWaitlist, setCannotCheckout } = useBlacklistedBooksContext();

    useEffect(() => {
        // make sure success message is clear once an error occurs
        setSuccessMsg('');
    }, [errorMsg])

    // ? Can't remember what this is for...
    // useEffect(() => {

    //     try {
    //         // ! delete these
    //         console.log('getting info!');
    //         const parsedCheckouts = JSON.parse(localStorage.getItem("checkouts"));
    //         console.log('checkouts:', parsedCheckouts); // check checkouts state;
    //     } catch (error) {
    //         setErrorMsg("Couldn't get checkouts. try reloading the page.")
    //         console.error(error);
    //     }
    // }, [checkouts])

    const handleCheckin = async (bookIsbn) => {
        // check for undefined explicitly, if a book id is 0 it could fail here.
        if (bookIsbn === undefined) {
            setErrorMsg("Can't complete request, no book id.");
            return;
        }

        const sanitizedId = encodeURIComponent(bookIsbn);

        setLoading(true);

        try {
            const response = await axiosPrivate.delete(CHECKIN_URL + `book=${sanitizedId}`);
            localStorage.setItem("checkouts", JSON.stringify(response.data.checkouts));

            setCheckouts(prevCheckouts => [...response.data.checkouts]);
            setCannotWaitlist(prevWaitlistBlacklist => {
                return [...prevWaitlistBlacklist.filter(book => book !== bookIsbn)] // remove book from blacklists
            });
            setCannotCheckout(prevCheckoutsBlacklist => {
                return [...prevCheckoutsBlacklist.filter(book => book !== bookIsbn)] // remove book from blacklists
            });
            setSuccessMsg('Success! Book was removed from your checkouts.')
        } catch (error) {
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg);
        } finally {
            setLoading(false);
            return;
        }
    }

    const retrieveUserCheckouts = async () => {
        setLoading(true);

        try {
            const response = await axiosPrivate.get(USER_CHECKOUTS_URL);

            localStorage.setItem("checkouts", JSON.stringify(response.data));
            setCheckouts(prevCheckouts => [...response.data]);

            const blacklistedIds = response.data.map(book => book.isbn); // extract ids from response
            setCannotWaitlist(prevWaitlistBlacklist => {
                return [...new Set([...prevWaitlistBlacklist, ...blacklistedIds])]
            }) // ensure unique values via Set constructor

            setCannotCheckout(prevCheckoutsBlacklist => {
                return [...new Set([...prevCheckoutsBlacklist, ...blacklistedIds])]
            }) // ensure unique values via Set constructor

            setSuccessMsg('Reloaded.')
        } catch (error) {
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg);
        } finally {
            setLoading(false);
            return;
        }
    }

    const renderCheckouts = () => {
        return (
            <div>
                <h2>Your Checkouts:</h2>
                <div className="userCheckouts">
                    {checkouts && checkouts.length > 0 ? (
                        checkouts.map((book) => (
                            <div key={book.isbn} className="bookContainer">
                                <div className="bookDetailsImgContainer">
                                    <div className="bookDetails">
                                        <h2 className="bookTitle">Title: {book.title}</h2>
                                        <p>Author: {book.author}</p>
                                        <p>Published: {book.published_year}</p>
                                        <p>Description:</p>
                                        <br />
                                        <div className="descriptionContainer">
                                            <p className="description">
                                                {!book.description
                                                    ? 'No description available.'
                                                    : book.description.length > 470
                                                        ? book.description.substring(0, 470) + "..."
                                                        : book.description.trim()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bookImage">
                                        {/* can't use image url directly because paths are not formatted correctly 
                                    - they have a single '\' which is escaped by javascript.*/}
                                        <img src={book.image_url ?
                                            "/images/bookCovers/" + book.title.split(" ").join("_") + "_cover_image.png"
                                            : "/images/bookCovers/notAvailable(1).png"} alt="Book Cover" />
                                    </div>
                                </div>
                                <div className="bookActionButtons">
                                    <button
                                        className={`checkoutButton${isLoading ? " loading" : ""}`}
                                        disabled={isLoading || errorMsg || successMsg}
                                        onClick={() => handleCheckin(book.isbn)}
                                    >
                                        Check-In
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="noResults">
                            <p>No checkouts.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderError = () => {
        return (
            <p ref={errorRef} className={errorMsg ? "errorMessage" : "offscreen"} aria-live="assertive">{errorMsg} {errorMsg && (
                <button className="errorButton" onClick={() => setErrorMsg('')} disabled={!auth?.isAuthenticated}>x</button>
            )}
            </p>
        )
    }

    const renderSuccess = () => {
        return (
            <p ref={successRef} className={successMsg ? "successMessage" : "offscreen"} aria-live="assertive">{successMsg} {successMsg && (
                <button className="errorButton" onClick={() => setSuccessMsg('')}>x</button>
            )}
            </p>
        )
    }

    const renderReloadButton = () => {
        return (
            <button
                className={`refreshButton${isLoading ? " loading" : ""}`}
                onClick={() => retrieveUserCheckouts()}
                disabled={errorMsg || successMsg || isLoading}
            >Reload Checkouts</button>
        )
    }

    return (
        <div>
            {/* Render Error */}
            {renderError()}

            {/* Render Success */}
            {renderSuccess()}

            {/* Render Checkouts */}
            {renderCheckouts()}

            {/* Render Reload Button */}
            {renderReloadButton()}

            <div className="navLinks">
                <br />
                <Link className="navLink" to='/home'>Home</Link>
                <br />
                <Link className="navLink" to='/books/search'>Search</Link>
                <br />
                <Link className="navLink" to='/users/waitlist'>Your Waitlist</Link>
            </div>
        </div>
    );
}

export default UserCheckouts;