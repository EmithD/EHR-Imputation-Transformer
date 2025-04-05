import React from 'react'

const LogoSVG = () => {
  return (
    <div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

            <circle cx="6" cy="6" r="1" fill="currentColor" />
            <circle cx="12" cy="6" r="1" fill="currentColor" />
            <circle cx="18" cy="6" r="1" fill="currentColor" />
            <circle cx="6" cy="12" r="1" fill="currentColor" />
            <circle cx="18" cy="12" r="1" fill="currentColor" />

            <circle cx="6" cy="18" r="1" fill="currentColor" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
            <circle cx="18" cy="18" r="1" fill="currentColor" />

            <line x1="10" y1="12" x2="14" y2="12" strokeWidth="1" />
            <line x1="12" y1="10" x2="12" y2="14" strokeWidth="1" />
        </svg>
    </div>
  )
}

export default LogoSVG
