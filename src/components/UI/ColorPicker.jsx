
import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import styles from './ColorPicker.module.scss';


const ColorPicker= ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE'
  ];

  return (
    <div className={styles.colorPicker}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <div 
          className={styles.colorDisplay}
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Palette size={16} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
          placeholder="#000000"
        />
      </div>
      
      {isOpen && (
        <div className={styles.colorPalette}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.nativeColorInput}
          />
          <div className={styles.predefinedColors}>
            {predefinedColors.map((color) => (
              <div
                key={color}
                className={styles.colorOption}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
