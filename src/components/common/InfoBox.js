// src/components/common/InfoBox.js
import React from 'react';

const InfoBox = ({ title, children, className = '' }) => {
  return (
    <div className={className}>
      <h3 className="font-semibold text-green-800 mb-2">{title}</h3>
      {children}
    </div>
  );
};

export default InfoBox;