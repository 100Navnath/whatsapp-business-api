import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';

export default function PageNotFound() {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(Object)
    async function getUser() {
        const user = await getFromLocalStorage("user");
        setUserDetails(user)
        if (!user) {
            navigate("/");
        }
    }
    useEffect(() => {
        getUser()
    }, [])

    return (
        <h4>404 : Page Not Found</h4>
    )
}
