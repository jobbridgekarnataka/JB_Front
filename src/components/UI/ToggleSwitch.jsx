
import React from 'react';
import styles from './ToggleSwitch.module.scss';



const ToggleSwitch = ({
  label,
  checked,
  onChange,
  disabled = false
}) => {
  return (
    <div className={styles.toggleSwitch}>
      <label className={styles.label}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={styles.input}
        />
        <span className={`${styles.slider} ${checked ? styles.checked : ''} ${disabled ? styles.disabled : ''}`}>
          <span className={styles.thumb} />
        </span>
        <span className={styles.text}>{label}</span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
