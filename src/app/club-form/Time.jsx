import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";
import dayjs from "dayjs";
import styles from "./RegisterClubForm.module.css";

function Time({ value, setFormData, markComplete }) {

  const handleChange = (newTime) => {
    setFormData((prev) => ({
      ...prev,
      time: newTime,
    }));
  };

  return (
    <div className="time-cat">

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticTimePicker
          orientation="landscape"
          value={value || dayjs()}
          onChange={handleChange}

          // This is the IMPORTANT part for progress tracking
          onAccept={(val) => {
            if (val) {
              setFormData((prev) => ({
                ...prev,
                time: val,
              }));

              markComplete();
            }
          }}

          localeText={{
            toolbarTitle: "Select time your club meets",
            okButtonLabel: "Confirm",
            cancelButtonLabel: "Back",
          }}

          sx={{
            
            border: "solid #AAB9DB 2px",
            width: "70%",
            display: "flex",
            justifyContent: "center",
            padding: "1em 6em",
            margin: "2em auto",

            "& .MuiTypography-root": {
              fontFamily: "Freeman, sans-serif",
              color: "#3A5186",
              lineHeight: "1.4",
            },

            "& .MuiButton-root": {
              color: "#3A5186",
              fontFamily: "Freeman, sans-serif",
              fontWeight: "bold",
            },
          }}
        />
      </LocalizationProvider>

    </div>
  );
}

export default Time;