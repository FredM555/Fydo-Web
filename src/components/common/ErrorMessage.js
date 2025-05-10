// src/components/common/ErrorMessage.js
import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
      {message}
    </div>
  );
};

export default ErrorMessage;