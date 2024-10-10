import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';



const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate(); 

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/status'); 
                if(response.data.isAuthenticated){
                    setIsAuthenticated(true); 
                }
            } catch (error) {
                setIsAuthenticated(false); 
                navigate('/login'); 
            }
        };
        checkAuth();
    }, [navigate]);

    return isAuthenticated ? children : null; 
};

export default ProtectedRoute;