import styles from "./RegisterClubForm.module.css";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function Day({ value, setFormData, markComplete }) {

  const toggleDay = (day) => {

    let updatedDays;

    if (value.includes(day)) {
      updatedDays = value.filter((d) => d !== day);
    } else {
      updatedDays = [...value, day];
    }

    // update parent form state
    setFormData((prev) => ({
      ...prev,
      days: updatedDays,
    }));

    // mark step complete if at least one day selected
    if (updatedDays.length > 0) {
      markComplete();
    }
  };

  return (
    <div className={styles.dayCat}>
      <label
        className={styles.formQuestion}
        style={{
          marginBottom: ".3em",
        }}
      >
        Please select which day(s) your club meets:
      </label>

      {days.map((day) => (
        <button
          key={day}
          type="button"
          className={styles.dayButton}
          onClick={() => toggleDay(day)}
          style={{
            background: value.includes(day) ? "#3A5186" : "#ddd",
            color: value.includes(day) ? "#fff" : "#3A5186",
            padding: ".5em .4em",
            margin: ".3em auto",
          }}
        >
          {day}
        </button>
      ))}
    </div>
  );
}

export default Day;