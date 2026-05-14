"use client";

import { useState } from "react";
import styles from "./RegisterClubForm.module.css";

import LocationAutocomplete from "./LocationAutocomplete";
import ProgressBar from "./ProgressBar";
import ClubName from "./ClubName";
import Category from "./Category";
import Description from "./Description";
import ProfileImage from "./ProfileImage";
import Time from "./Time";
import Day from "./Day";

export default function RegisterClubForm() {
  const [formData, setFormData] = useState({
    clubName: "",
    category: [],
    description: "",
    image: "",
    time: "",
    days: [],
    location: []
  });
  

  const [completedSteps, setCompletedSteps] = useState([]);

  const markComplete = (step) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    );
  };

  function handleSubmit(e) {
    /* Prevent default form behavior until backend is connected*/
    e.preventDefault();

    /* Check a catoegory has been selected */
    if(formData.category.length == 0){
      alert("Please select at least one category");
      return;
    }

    /*Check a day has been selcted */
    if (formData.days.length === 0) {
      alert("Please select at least one day your club meets.");
      return;
    }
  
    
    setFormData((prev) => ({
    ...prev,
    image: `https://ui-avatars.com/api/?name=${formData.clubName.replace(" ", "+")}=C6E0FF&uppercase=true&color=003880&rounded=true&bold=true&limit=2`,
    }));
  
    if (!formData.time) {
    alert("Please select a meeting time for your club.");
    return;
    }

    console.log("Submitted Data:", formData);

    // send to backend here
  }

  return (
    <div className={styles.page}>
    
    <form onSubmit={handleSubmit}>
      <ProgressBar completedSteps={completedSteps} />

      <ClubName
        value={formData.clubName}
        setFormData={setFormData}
        markComplete={() => markComplete(1)}
      />

      <Category
        value={formData.category}
        setFormData={setFormData}
        markComplete={() => markComplete(2)}
      />

      <Description
        value={formData.description}
        setFormData={setFormData}
        markComplete={() => markComplete(3)}
      />

      <ProfileImage
        setFormData={setFormData}
        markComplete={() => markComplete(4)}
      />

      <Time
        value={formData.time}
        setFormData={setFormData}
        markComplete={() => markComplete(5)}
      />

      <Day
        value={formData.days}
        setFormData={setFormData}
        markComplete={() => markComplete(6)}
      />

      <LocationAutocomplete
        value={formData.location}
        setFormData={setFormData}
        markComplete={() => markComplete(7)}
      
      />

      <button type="submit" className={styles.submitBtn}>
        Make Club Card
      </button>
    </form>
    </div>
  );
}

