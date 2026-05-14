import styles from "./RegisterClubForm.module.css";
function ProfileImage({ setFormData, markComplete }) {

  const handleUploadImage = (e) => {

    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];

      // save image file in parent state
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // mark progress complete
      markComplete();
    }
  };

  return (
    <div className={styles.profileImgCat}>

      <label className={styles.formQuestion}>
        Upload a Club Profile Image (optional)
      </label>

      <h2 className={styles.descriptionInstructions}>
        Your club's profile image will show on the card with the rest
        of the information provided. If none is uploaded, a default
        image will be provided.
      </h2>

      <input
        onChange={handleUploadImage}
        type="file"
        accept="image/png, image/jpeg, image/gif"
        className={styles.chooseFileBtn}
      />

    </div>
  );
}

export default ProfileImage;