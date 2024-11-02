import React, { createContext, useEffect, useState } from "react"; 
import axios from 'axios';


export const ApiContext = createContext();

const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'; 


export const ApiProvider = (props) => {
    const [apiData, setApiData] = useState({sleep: null});

    
    useEffect(() => {
        
        let isMounted = true; // track component mount status

        const urls = [
            `https://671165104eca2acdb5f4b7e2.mockapi.io/api/test/topics`,
            // `/api/idling/${startDate}`,
            // `/api/walking/${startDate}`
        ];

        const fetchData = async () => {
            try {
                const responses = await Promise.all(urls.map(url => axios.get(url)));
                const [topicsData] = responses.map(response => response.data);
                setApiData({
                    topics: topicsData,
                });
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching data:", err.message);
                }
            }
        };

        fetchData();
    }, []);


                    
    return (
        <ApiContext.Provider value={ {apiData} }>
            { props.children }
        </ApiContext.Provider>
    );
};
