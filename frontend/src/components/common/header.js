import React from 'react';


const Header = ({ title, buttonText, onButtonClick, children }) => {
    return (
        <div className="header-container">
            <h1 className="header-title">{title}</h1>
            <div className="header-actions-container">
                {/* This will render any extra buttons you pass in */}
                {children}
                <button className="primary-button" onClick={onButtonClick}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
};
export default Header;