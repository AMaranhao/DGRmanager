// src/components/forms/DiaDoMesPicker.jsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import "@/styles/components_styles.css";

export default function DiaDoMesPicker({ selectedDate, onChange }) {
  const handleSelect = (date) => {
    if (date instanceof Date && !isNaN(date)) {
      onChange(date); // Retorna Date completo
    }
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-sm p-2">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        captionLayout="dropdown" // ou "buttons" se preferir setas
        showOutsideDays={true}
        modifiersClassNames={{
          selected: 'dia-selecionado',
          today: 'text-blue-500 font-bold',
        }}
        className="bg-white rounded-lg p-2 shadow-md"
      />
    </div>
  );
}
