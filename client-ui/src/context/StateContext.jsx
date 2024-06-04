import { createContext, useContext, useState } from "react";

const SharedDataContext = createContext();

export const useSharedData = () => {
    return useContext(SharedDataContext);
};

export const SharedDataProvider = ({ children }) => {
    const [sharedData, setSharedData] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false) 

    return (
        <SharedDataContext.Provider
            value={{
                isLoggedIn, setIsLoggedIn,
                sharedData, setSharedData
            }}>
            {children}
        </SharedDataContext.Provider>
    );
};