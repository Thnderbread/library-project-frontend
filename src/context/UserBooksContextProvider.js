import React, { createContext, useContext, useState } from 'react'

const UserBooksContext = createContext();

export const UserBooksProvider = ({ children }) => {
    const [waitlist, setWaitlist] = useState(JSON.parse(localStorage.getItem("waitlist")) || []);
    const [checkouts, setCheckouts] = useState(JSON.parse(localStorage.getItem("checkouts")) || []);

    return (
        <UserBooksContext.Provider value={{ waitlist, setWaitlist, checkouts, setCheckouts }}>
            {children}
        </UserBooksContext.Provider>
    )
}

const useUserBooksContext = () => {
    return useContext(UserBooksContext);
}

export default useUserBooksContext;