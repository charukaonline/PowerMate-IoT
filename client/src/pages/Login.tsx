import React, { useEffect } from "react";

const Login: React.FC = () => {

    useEffect(() => {
        document.title = "Login";
    }, []);

    return (
        <div>
            <h1 className="text-white text-3xl">Login</h1>
        </div>
    );
};

export default Login;
