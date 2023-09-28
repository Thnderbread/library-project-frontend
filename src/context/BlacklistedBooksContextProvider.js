import { createContext, useContext, useState } from "react";

const BlacklistedBooksContext = createContext();

export const BlacklistedBooksProvider = ({ children }) => {
    const [cannotCheckout, setCannotCheckout] = useState(
        (JSON.parse(localStorage.getItem("waitlist"))?.map(book => book.isbn) || [])); // grab ids from local storage

    const [cannotWaitlist, setCannotWaitlist] = useState(
        (JSON.parse(localStorage.getItem("checkouts"))?.map(book => book.isbn) || [])); // grab ids from local storage

    return (
        <BlacklistedBooksContext.Provider value={{ cannotCheckout, setCannotCheckout, cannotWaitlist, setCannotWaitlist }}>
            {children}
        </BlacklistedBooksContext.Provider>
    )
}

const useBlacklistedBooksContext = () => {
    return useContext(BlacklistedBooksContext);
}

export default useBlacklistedBooksContext;