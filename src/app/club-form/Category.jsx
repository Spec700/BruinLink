import styles from "./RegisterClubForm.module.css";
import Image from 'next/image'
/* Image imports */
import cultureimage from "./images/Culture.png";
import careerimage from "./images/Careers-Image.png";
import outdoorsimage from "./images/outdoors.png";
import serviceimage from "./images/Service.png";
import creativeimage from "./images/Creative.png";

function Category({ value, setFormData, markComplete }) {

  function handleClick(e) {

    let category;

    if (e.target.id) {
      category = e.target.id;
    } else {
      category = e.target.parentElement.id;
    }

    let updatedCategories;

    if (value.includes(category)) {
      updatedCategories = value.filter((item) => item !== category);
    } else {
      updatedCategories = [...value, category];
    }

    // update parent form state
    setFormData((prev) => ({
      ...prev,
      category: updatedCategories,
    }));

    // mark progress step complete
    if (updatedCategories.length > 0) {
      markComplete();
    }
  }

  return (
    <div className={styles.question2}>


      <label className={styles.formQuestion} id={styles.categoryQuestion}>
        What is the category of your club?
      </label>

      <div className={styles.categories}>

        <button
          type="button"
          className={`${styles.btn} ${
            value.includes("Culture&Idenity") ? styles.clicked : ""
          }`}
          id="Culture&Idenity"
          onClick={handleClick}
        >
          <Image src={cultureimage} alt="Culture & Identity" className={styles.categoryImage}/>

          <h2 className={styles.categoryDescription}>
            Culture & Identity
          </h2>
        </button>

        <button
          type="button"
          className={`${styles.btn} ${
            value.includes("Careers") ? styles.clicked : ""
          }`}
          id="Careers"
          onClick={handleClick}
        >
          <Image src={careerimage} alt="Careers" className={styles.categoryImage}/>

          <h2 className={styles.categoryDescription}>
            Careers
          </h2>
        </button>

        <button
          type="button"
          className={`${styles.btn} ${
            value.includes("Service") ? styles.clicked : ""
          }`}
          id="Service"
          onClick={handleClick}
        >
          <Image src={serviceimage} className={styles.categoryImage} alt="Service" />

          <h2 className={styles.categoryDescription}>
            Service
          </h2>
        </button>

        <button
          type="button"
          className={`${styles.btn} ${
            value.includes("Creative") ? styles.clicked : ""
          }`}
          id="Creative"
          onClick={handleClick}
        >
          <Image src={creativeimage} className={styles.categoryImage} alt="Creative" />

          <h2 className={styles.categoryDescription}>
            Creative
          </h2>
        </button>

        <button
          type="button"
          className={`${styles.btn} ${
            value.includes("Sports&Outdoors") ? styles.clicked : ""
          }`}
          id="Sports&Outdoors"
          onClick={handleClick}
        >
          <Image
            src={outdoorsimage}
            className={styles.categoryImage}
            alt="Sports & Outdoors"
          />

          <h2 className={styles.categoryDescription}>
            Sports & Outdoors
          </h2>
        </button>

      </div>
    </div>
  );
}

export default Category;