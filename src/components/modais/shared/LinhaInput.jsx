// src/components/modais/shared/LinhaInput.jsx
import React from "react";

const LinhaInput = React.memo(function LinhaInput({ label, children }) {
  return (
    <div className="processo-input-wrapper">
      <label className="processo-label">{label}</label>
      {children}
    </div>
  );
});

export default LinhaInput;      // ✅ default export
export { LinhaInput };          // (opcional) também como nomeado
