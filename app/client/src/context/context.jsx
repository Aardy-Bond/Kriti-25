import { createContext, useState } from "react";

export const Context = createContext()
export const ContextProvider = ({children})=>{
    const [uri , setUri] = useState("");
    const [accData , setAccData] = useState({});
    const [isConnected , setIsConnected] = useState();
    
    return (
        <Context.Provider value={{uri , setUri , accData , setAccData , isConnected , setIsConnected}}>
            {children}
        </Context.Provider>
    )
}