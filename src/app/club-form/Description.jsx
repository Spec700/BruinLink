import styles from "./RegisterClubForm.module.css";
function Description({ value, setFormData, markComplete }) {

  function handleChange(e) {
    const newValue = e.target.value;

    // update parent form state
    setFormData((prev) => ({
      ...prev,
      description: newValue,
    }));
  }

  return (
    <div className={styles.descriptionCat}>

      <label className={styles.formQuestion}>
        What is the description of your club?
      </label>

      <h2 className={styles.descriptionInstructions}>
        Providing a description should allow viewers to get a brief
        overview of a club's mission and atmosphere. Good descriptions
        are no longer than 2 sentences or 45 words.
      </h2>

      <textarea
        onChange={handleChange}
        onBlur={() => {
          if (value.trim().length > 0) {
            markComplete();
          }
        }}
        value={value}
        required
        cols="50"
        className={styles.descriptionBox}
        autoFocus
        required
      />

    </div>
  );
}

export default Description;