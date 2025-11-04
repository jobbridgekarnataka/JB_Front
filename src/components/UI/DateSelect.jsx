import styles from './Date.module.scss'
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enGB } from "date-fns/locale"; // en-GB uses dd/MM/yyyy
export default function DateSelect({
  label,
  value,
  onChange,
  min,
  max,
  required,
  error,
}) {
  // Ensure value is never undefined - use null instead
  const dateValue = value === undefined ? null : value;
   // ✅ Format selected date to Local Date (YYYY-MM-DD)
  const handleDateChange = (date) => {
    if (!date) {
      onChange(null);
      return;
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    // Return a proper Date object (local midnight) so DatePicker works correctly
    onChange(localDate);
  };
  return (
    <div style={{ padding: "20px" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB} >
        <DatePicker
          label={label || "Select Date"}
          value={dateValue}
          onChange={handleDateChange}
          minDate={min}
          maxDate={max}
          required={required}
          error={error}
          slotProps={{
            textField: {
              //  // ✅ same as before
               error:false,
              sx: {
                "& .MuiInputBase-root": {
                  borderRadius: "10px",
                  backgroundColor: "#ffffffff",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4f46e5",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4338ca",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2563eb",
                  borderWidth: "2px",
                },
              },
            },
          }}
        />
      </LocalizationProvider>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
