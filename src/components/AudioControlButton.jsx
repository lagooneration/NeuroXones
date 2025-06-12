// Audio control button component
import React from 'react';
import PropTypes from 'prop-types';

const AudioControlButton = ({ icon, label, onClick, bgColor, hoverColor }) => {
  return (
    <button
      onClick={onClick}
      className={`${bgColor} hover:${hoverColor} text-white px-4 py-2 rounded-full flex items-center space-x-2 text-sm shadow-lg transform hover:scale-105 transition-all duration-300`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

AudioControlButton.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  bgColor: PropTypes.string,
  hoverColor: PropTypes.string
};

AudioControlButton.defaultProps = {
  bgColor: 'bg-blue-600',
  hoverColor: 'bg-blue-700'
};

export default AudioControlButton;
