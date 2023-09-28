import useAuth from "../../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { validateParams } from "./searchUtils";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { handleServerResponseError, validateBookAction } from "../../common/utils";
import useBlacklistedBooksContext from "../../context/BlacklistedBooksContextProvider";
import useUserBooksContext from "../../context/UserBooksContextProvider";

const SEARCH_URL = '/books/search?';
const CHECKOUT_URL = '/books/checkout?';
const WAITLIST_URL = '/books/waitlist?';

const Search = () => {
    const { auth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();

    const errorRef = useRef();
    const successRef = useRef();

    const [page, setPage] = useState(1); // page we are on
    const [year, setYear] = useState('');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');

    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const { setWaitlist, setCheckouts } = useUserBooksContext();
    const {
        cannotWaitlist,
        cannotCheckout,
        setCannotWaitlist,
        setCannotCheckout,
    } = useBlacklistedBooksContext();

    // clear success message on error change
    useEffect(() => {
        setSuccessMsg('');
    }, [errorMsg])

    useEffect(() => {
        renderSearchResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results])

    useEffect(() => {
        if (!searched) return; // make sure this doesn't run on component load.
        handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    const handleSearch = async () => {
        // let isMounted = true;
        // const controller = new AbortController();
        const invalidParams = validateParams(year, title, author, page);

        if (invalidParams) {
            setErrorMsg(invalidParams);
            return;
        }

        const sanitizedYear = encodeURIComponent(year);
        const sanitizedPage = encodeURIComponent(page);
        const sanitizedTitle = encodeURIComponent(title);
        const sanitizedAuthor = encodeURIComponent(author);

        try {
            const response = await axiosPrivate.get(SEARCH_URL +
                `page=${sanitizedPage}
            &year=${sanitizedYear}
            &title=${sanitizedTitle}
            &author=${sanitizedAuthor}`
            )

            setSearched(true);
            setResults(response.data.results || []); // default to empty array

        } catch (error) {
            console.log(error);
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg)
        }
    }

    const handleCheckout = async (bookIsbn) => {
        if (bookIsbn === undefined) {
            setErrorMsg("Can't complete request, no book id.");
            return;
        }

        const canUserCheckout = validateBookAction(bookIsbn, cannotCheckout, "checkouts");

        if (typeof canUserCheckout === 'string') {
            setErrorMsg(canUserCheckout);
            setCannotCheckout(prevCheckouts => [...new Set([...prevCheckouts, bookIsbn])]);
            return;
        } else if (canUserCheckout === undefined) {
            setErrorMsg("Could not complete the request.");
            return;
        }

        const sanitizedId = encodeURIComponent(bookIsbn);

        setIsLoading(true);

        try {
            const response = await axiosPrivate.post(CHECKOUT_URL + `book=${sanitizedId}`);

            localStorage.setItem("waitlist", JSON.stringify(response.data.waitlist)); // update waitlist
            localStorage.setItem("checkouts", JSON.stringify(response.data.checkouts)); // update checkouts

            setWaitlist(prevWaitlist => [...response.data.waitlist]); // update global waitlist state
            setCheckouts(prevCheckouts => [...response.data.checkouts]); // update global checkouts state

            setCannotWaitlist(prevWaitlistBlacklist => [...prevWaitlistBlacklist, bookIsbn]); // update global blacklists
            setCannotCheckout(prevCheckoutsBlacklist => [...prevCheckoutsBlacklist, bookIsbn]); // update global blacklists

            setSuccessMsg('Success! Book is now in your checkouts.');
            successRef.current.focus();
        } catch (error) {
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg);

            if (error?.response?.status === 409) {
                // ? If book checkout limit is reached, is this a 409?
                setCannotCheckout(prevCheckouts => [...prevCheckouts, bookIsbn]);
                setCannotWaitlist(prevWaitlist => [...prevWaitlist, bookIsbn]);
            }
            // if error.response.status is 409, update blacklisted checkouts
        } finally {
            setIsLoading(false);
            return;
        }
    }

    // FIXME: Doesn't stop request from hitting server if book is checked out or in waitlist - update validate function logic
    const handleWaitlist = async (bookIsbn) => {
        if (bookIsbn === undefined) {
            setErrorMsg("Cannot complete request, no book id.");
            return;
        }

        const canUserWaitlist = validateBookAction(bookIsbn, cannotWaitlist, "waitlist");

        if (typeof canUserWaitlist === 'string') {
            setErrorMsg(canUserWaitlist);
            setCannotWaitlist(prevWaitlist => [...prevWaitlist, bookIsbn]);
            errorRef.current.focus();
            return;
        } else if (canUserWaitlist === undefined) {
            setErrorMsg("Could not complete the request.");
            errorRef.current.focus();
            return;
        }

        // forgot to make validateBookAction also check checkouts array when trying to waitlist,
        // so just calling it again because i'm too lazy to fix the function
        const canUserWaitlistPT2 = validateBookAction(bookIsbn, cannotCheckout, "checkouts");

        if (typeof canUserWaitlistPT2 === 'string') {
            setErrorMsg(canUserWaitlistPT2);
            setCannotWaitlist(prevWaitlist => [...prevWaitlist, bookIsbn]);
            errorRef.current.focus();
            return;
        } else if (canUserWaitlistPT2 === undefined) {
            setErrorMsg("Could not complete the request.");
            errorRef.current.focus();
            return;
        }

        const sanitizedId = encodeURIComponent(bookIsbn);

        setIsLoading(true);

        // after response, update local storage and global waitlist state. update wailist blacklist with current book id.
        try {
            const response = await axiosPrivate.post(WAITLIST_URL + `book=${sanitizedId}`);
            localStorage.setItem("waitlist", JSON.stringify(response.data.waitlist));
            setCannotWaitlist(prevWaitlist => [...prevWaitlist, bookIsbn]);
            setWaitlist(prevWaitlist => [...response.data.waitlist]);
            setIsLoading(false);
            setSuccessMsg('Success! Book is now in your waitlist.');
            successRef.current.focus();
        } catch (error) {
            handleServerResponseError(error, navigate, location, errorRef, setErrorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    const renderSearchBars = () => {
        return (
            <div className="searchContainer">
                <input
                    type="text"
                    value={title}
                    className="searchBar"
                    onChange={(e) => setTitle(e.target.value)} // once something is entered here, we should set searched to false?
                    placeholder="Search By Title..."
                />
                <input
                    type="text"
                    value={author}
                    className="searchBar"
                    onChange={(e) => setAuthor(e.target.value)} // once something is entered here, we should set searched to false?
                    placeholder="Search By Author..."
                />
                <input
                    type="text"
                    value={year}
                    className="searchBar"
                    title="Search By Publication Year..."
                    onChange={(e) => setYear(e.target.value)} // once something is entered here, we should set searched to false?
                    placeholder="Search By Publication Year"
                />
                <button
                    className="searchButton"
                    title="An empty field will return random results."
                    onClick={() => handleSearch()}
                >Search</button>
            </div>
        )
    }

    const renderSearchResults = () => {
        return (
            <div className="searchResults sticky">
                {results && results.length > 0 ? (
                    results.map((book) =>
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
                                        '/images/bookCovers/' + book.title.split(" ").join("_") + "_cover_image.png"
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
                                    disabled={cannotWaitlist.includes(book.isbn) || isLoading || errorMsg || successMsg}
                                    onClick={() => handleWaitlist(book.isbn)}
                                >
                                    Waitlist This Book
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="noResults">
                        <p>No results.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderPagination = () => {
        return (
            <div className="searchNavButtons">
                {/* back button to the left */}
                {/* disable button if there are prev results. */}
                <button className="pageButtons" disabled={!(page - 1 > 0) || errorMsg || successMsg} onClick={() => setPage(page - 1)}>
                    &lt;
                </button>
                <p className="pageNumber">{page}</p>
                {/* Disable button if results is < 10, meaning no more results to get from server. */}
                <button className="pageButtons" disabled={results.length < 10 || errorMsg || successMsg} onClick={() => setPage(page + 1)}>&gt;</button>
            </div>
        )
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

    return (
        <div>
            {/* Error Message */}
            {renderError()}

            {/* Succcss Message */}
            {renderSuccess()}

            {/* Search bars */}
            {renderSearchBars()}

            {/* Search Results */}
            {searched ? renderSearchResults() : <p className="placeholderText">Waiting For a Search...</p>}

            {/* Pagination */}
            {renderPagination()}

            <div className="navLinks">
                <br />
                <Link className="navLink" to='/users/waitlist'>Your Waitlist</Link>
                <br />
                <Link className="navLink" to='/home'>Home</Link>
                <br />
                <Link className="navLink" to='/users/checkouts'>Your Checkouts</Link>
            </div>
        </div>
    )
}

export default Search;