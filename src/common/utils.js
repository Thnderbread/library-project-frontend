// handles error logic based on server response. NOT for client-side errors like rendering, etc. 
export const handleServerResponseError = (error, navigate, location, errorRef, setErrorMsg) => {
    if (!error?.response) {
        setErrorMsg("No response received.")
    }
    const responseCode = error.response?.status;
    const responseErrorMessage = error.response?.data.error;

    if (responseCode === 400) {
        setErrorMsg(responseErrorMessage)
    } else if (responseCode === 404) {
        setErrorMsg(responseErrorMessage)
    } else if (responseCode === 409) {
        setErrorMsg(responseErrorMessage)
    } else if (responseCode === 403) {
        setErrorMsg("Session expired. You will be logged out.")
        errorRef.current.focus();
        setTimeout(() => {
            navigate('/login', { state: { from: location }, replace: true })
            setErrorMsg('');
        }, 3000)
    } else {
        setErrorMsg("Some error occured. Please try again.")
    }
    errorRef.current.focus();
}

// searches array blacklist and localStorage for bookIsbn. If found, returns false. 
// returns true if it isn't. returns undefined if a parameter is not found or does not match expected datatype.
// blacklistType defines what value in local storage will be evaluated. should be "checkouts" or "waitlist".
// expects blacklist to be an array. expects localStorage(blacklistType) to be an array of objects.
export const validateBookAction = (bookIsbn, blacklist, blacklistType) => {
    const CHECKOUT_LIMIT = 3;
    const WAITLIST_LIMIT = 10;

    if (bookIsbn === undefined || blacklist === undefined || !blacklistType || typeof blacklistType !== 'string') {
        return undefined;
    }

    // look in the state for the book id 
    if (blacklist.includes(bookIsbn)) {
        return `This book is already in your ${blacklistType}!`;
    }

    let currentUserItems;

    try {
        currentUserItems = JSON.parse(localStorage.getItem(blacklistType.toLowerCase()))
    } catch (error) {
        return undefined; // denoting some error occurred
    }

    // check state and local storage to make sure user is not at limit.
    if (blacklistType.toLowerCase() === "checkouts") {
        if (blacklist.length >= CHECKOUT_LIMIT || currentUserItems.length >= CHECKOUT_LIMIT) {
            return `You've reached your ${blacklistType} limit.`;
        }
    } else if (blacklistType.toLowerCase() === "waitlist") {
        if (blacklist.length >= WAITLIST_LIMIT || currentUserItems.length >= WAITLIST_LIMIT) {
            return `You've reached your ${blacklistType} limit.`;
        }
    }

    if (currentUserItems.find(book => book.isbn === bookIsbn)) {
        return `This book is already in your ${blacklistType}!`;
    }
    return true;
}