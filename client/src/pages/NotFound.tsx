import React from "react";

const NotFound: React.FC = () => {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <h1 className=" text-lg">404 - Not Found | This is not a valid url</h1>
            </div>
        </div>
    );
}

export default NotFound;