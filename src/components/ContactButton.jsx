import React from 'react';
import styled from 'styled-components';

const ContactButton = ({ className }) => {
  return (
    <StyledWrapper className={className}>
      <button>
        <p>Reach Out</p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  button {
    --primary-color: #888;
    --hovered-color:rgb(240, 240, 240);
    position: relative;
    display: flex;
    font-weight: 500;
    font-size: 20px;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  button p {
    margin: 0;
    position: relative;
    font-size: 14px;
    color: var(--primary-color);
  }

  button::after {
    position: absolute;
    content: "";
    width: 0;
    left: 0;
    bottom: -7px;
    background: var(--hovered-color);
    height: 2px;
    transition: 0.3s ease-out;
  }

  button p::before {
    position: absolute;
    /*   box-sizing: border-box; */
    content: "Reach Out";
    width: 0%;
    inset: 0;
    color: var(--hovered-color);
    overflow: hidden;
    transition: 0.3s ease-out;
  }

  button:hover::after {
    width: 100%;
  }

  button:hover p::before {
    width: 100%;
  }

  button:hover svg {
    transform: translateX(4px);
    color: var(--hovered-color);
  }

  button svg {
    color: var(--primary-color);
    transition: 0.2s;
    position: relative;
    width: 15px;
    transition-delay: 0.2s;
  }`;

export default ContactButton; 
