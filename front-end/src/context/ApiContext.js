import React, { createContext, useEffect, useState } from "react"; 
import { api } from '../api/api';


export const ApiContext = createContext();

const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'; 


export const ApiProvider = (props) => {
    const [apiData, setApiData] = useState({sleep: null});
    const [refresh, setRefresh] = useState(false);

    const triggerReload = () => setRefresh(prev => !prev);

    
    useEffect(() => {
        
        let isMounted = true; // track component mount status

        const urls = [
            `/topic`,
            // `/api/idling/${startDate}`,
            // `/api/walking/${startDate}`
        ];

        const fetchData = async () => {
            try {
                const responses = await Promise.all(urls.map(url => api.get(url)));
                const [topicsData] = responses.map(response => response.data);
                if(isMounted){
                    setApiData({
                        topics: topicsData,
                    });
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching data:", err.message);
                }
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [refresh]);


                    
    return (
        <ApiContext.Provider value={ {apiData, triggerReload} }>
            { props.children }
        </ApiContext.Provider>
    );
};
