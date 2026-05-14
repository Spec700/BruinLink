import styles from "./RegisterClubForm.module.css";
function ClubName({ value, setFormData, markComplete }) {
  function handleChange(e) {
    const newValue = e.target.value;

    setFormData((prev) => ({
      ...prev,
      clubName: newValue,
    }));
  }

  return (
    <div className={styles.clubNameCat}>
      <label className={styles.formQuestion}>
        What is the name of your club?

        <input
          type="text"
          value={value}
          required
          onChange={handleChange}
          onBlur={() => {
            if (value.trim().length > 0) {
              markComplete();
            }
          }}
          className={styles.clubNameInput}
        />
      </label>
    </div>
  );
}

export default ClubName;