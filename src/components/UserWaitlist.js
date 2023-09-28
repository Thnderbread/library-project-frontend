import useAuth from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserBooksContext from "../context/UserBooksContextProvider";
import { handleServerResponseError, validateBookAction } from "../common/utils";
import useBlacklistedBooksContext from "../context/BlacklistedBooksContextProvider";

const CHECKOUT_URL = '/books/checkout?';
const UNWAITLIST_URL = '/books/waitlist?';
const USER_WAITLIST_URL = '/users/waitlist';

const UserWaitlist = () => {

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const navigate = useNavigate();
    const location = useLocation();

    const errorRef = useRef();
    const successRef = useRef();

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const { waitlist, setWaitlist, setCheckouts } = useUserBooksContext();
    const { setCannotWaitlist, cannotCheckout, setCannotCheckout } = useBlacklistedBooksContext();

    useEffect(() => {
        setSuccessMsg('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorMsg])

    // ? Can't remember what this is for...
    // useEffect(() => {

    //     // ! delete these
    //     try {
    //         console.log('getting info!');
    //         const parsedWaitlist = JSON.parse(localStorage.getItem("waitlist"));
    //         console.log('waitlist:', parsedWaitlist); // check checkouts state
    //     } catch (error) {
    //         setErrorMsg("Couldn't get checkouts. try reloading the page.")
    //         console.error(error);
    //     }
    // }, [waitlist])

    const handleCheckout = async (bookIsbn) => {
        if (bookIsbn === undefined) {
            setErrorMsg("Can't complete request, no book id.");
            return;
        }

        const canUserCheckout = validateBookAction(bookIsbn, cannotCheckout, "checkouts");

        if (typeof canUserCheckout === 'string') {
            setErrorMsg(canUserCheckout);
            setCannotCheckout(prevCheckouts => [...prevCheckouts, bookIsbn]);
            return;
        } else if (canUserCheckout === undefined) {
            setErrorMsg("Could not complete the request.");
            return;
        }

        const sanitizedId = encodeURIComponent(bookIsbn);

        setIsLoading(true);

        try {
            const response = await axiosPrivate.post(CHECKOUT_URL + `book=${sanitizedId}`);

            localStorage.setItem("waitlist", JSON.stringify(response.data.waitlist)); // update waitlist local storage
            localStorage.setItem("checkouts", JSON.stringify(response.data.checkouts)); // update checkouts local storage

            setWaitlist(prevWaitlist => [...response.data.waitlist]); // update global waitlist state
            setCheckouts(prevCheckouts => [...response.data.checkouts]); // update global checkouts state

            const blacklistedWaitlistIds = response.data.waitlist.map(book => book.isbn);
            const blacklistedCheckoutIds = response.data.checkouts.map(book => book.isbn);

            setCannotWaitlist(prevWaitlistBlacklist => {
                return [...new Set([...prevWaitlistBlacklist, ...blacklistedWaitlistIds])]
            }) // ensure unique values via Set constructor

            setCannotCheckout(prevCheckoutsBlacklist => {
                return [...new Set([...prevCheckoutsBlacklist, ...blacklistedCheckoutIds])]
            }) // ensure unique values via Set constructor

            setSuccessMsg('Success! Book is now in your checkouts.');
        } catch (error) {
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg);
            // if error.response.status is 409, update blacklisted checkouts
        } finally {
            setIsLoading(false);
            return;
        }
    }

    const removeBookFromWaitlist = async (bookIsbn) => {
        if (bookIsbn === undefined) {
            setErrorMsg("Can't complete request, no book id.");
            return;
        }

        const sanitizedId = encodeURIComponent(bookIsbn);

        setIsLoading(true);

        try {
            const response = await axiosPrivate.delete(UNWAITLIST_URL + `book=${sanitizedId}`);
            const updatedWaitlist = response.data.waitlist;

            localStorage.setItem("waitlist", JSON.stringify(updatedWaitlist));
            setWaitlist(prevWaitlist => [...updatedWaitlist]);
            setSuccessMsg('Removed book from waitlist successfully.')
        } catch (error) {
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg);
        } finally {
            setIsLoading(false);
            return;
        }
    }

    const retrieveUserWaitlist = async () => {
        setIsLoading(true);

        try {
            const response = await axiosPrivate.get(USER_WAITLIST_URL);
            localStorage.setItem("waitlist", JSON.stringify(response.data));
            setWaitlist(prevWaitlist => [...response.data]);
            setCannotWaitlist(prevWaitlistBlacklist => {
                return [...response.data.map(book => book.isbn)]
            })
            setSuccessMsg('Reload successful.')
        } catch (error) {
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg);
        } finally {
            setIsLoading(false);
            return;
        }
    }

    const renderWaitlist = () => {
        return (
            <div>
                <h2>Your Waitlist:</h2>
                <div className="userWaitlist">
                    {waitlist && waitlist.length > 0 ? (
                        waitlist.map((book) =>
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
                                        disabled={cannotCheckout.includes(book.isbn) || isLoading || errorMsg || successMsg}
                                        onClick={() => handleCheckout(book.isbn)}
                                    >
                                        Checkout This Book
                                    </button>
                                    <button
                                        className={`waitlistButton${isLoading ? " loading" : ""}`}
                                        disabled={isLoading || errorMsg || successMsg}
                                        onClick={() => removeBookFromWaitlist(book.isbn)}
                                    >
                                        Remove From Waitlist
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="noResults">
                            <p>Empty waitlist.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderReloadButton = () => {
        return (
            <button
                className={`refreshButton${isLoading ? " loading" : ""}`}
                onClick={() => retrieveUserWaitlist()}
                disabled={errorMsg || successMsg || isLoading}
            >Reload Waitlist
            </button>
        )
    }

    const renderErrorMessage = () => {
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

    return (
        <div>
            {/* Render Error */}
            {renderErrorMessage()}

            {/* Render Success */}
            {renderSuccess()}

            {/* Render Waitlist */}
            {renderWaitlist()}

            {/* debugging... */}
            {renderReloadButton()}

            <div className="navLinks">
                <br />
                <Link className="navLink" to='/home'>Home</Link>
                <br />
                <Link className="navLink" to='/books/search'>Search</Link>
                <br />
                <Link className="navLink" to='/users/checkouts'>Your Checkouts</Link>
            </div>
        </div>
    );
}

export default UserWaitlist;