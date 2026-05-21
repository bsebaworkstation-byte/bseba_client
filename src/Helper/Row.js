import React from "react";

const Row = ({ text }) => {
  return (
    <p style={{
      border: "1px solid #ccc",
      padding: "10px",
      margin: "5px 0",
      borderRadius: "5px"
    }}>
      {text}
    </p>
  );
};

export default Row;
