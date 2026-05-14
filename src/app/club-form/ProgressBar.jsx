import styles from "./RegisterClubForm.module.css";
const steps = [
  "Club Name",
  "Category",
  "Description",
  "Image",
  "Time",
  "Day(s)",
  "Location"
];

function ProgressBar({ completedSteps }) {
  return (
    <div className={styles.progressContainer}>
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const active = completedSteps.includes(stepNumber);

        return (
          <div className={styles.stepWrapper} key={label}>
            <div className={`${styles.step} ${active ? styles.active  : ""}`}>
              {stepNumber}. {label}
            </div>

            {stepNumber !== steps.length && (
              <div
                className={`${styles.line} ${
                  completedSteps.includes(stepNumber)
                    ? styles.activeLine
                    : ""
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressBar;