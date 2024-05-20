"use client"
import React from 'react'

const Navbar = () => {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80px',
            backgroundColor: '#000',
            padding: '10px 0',
            margin: 0,
            width: '115vw',
        }}>
            <img src="https://cylab-temp-testing-bucket.s3.amazonaws.com/images/ultron-logo.svg" alt="Logo" style={{ height: '50px' }} />
        </nav>
    )
}

export default Navbar
