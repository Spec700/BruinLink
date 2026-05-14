import { useEffect, useState } from "react";
import styles from "./RegisterClubForm.module.css";

export default function LocationAutocomplete({
  value,
  setFormData,
  markComplete,
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep local input synced with parent state
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            query
          )}&limit=5`
        );

        const data = await res.json();

        setResults(data.features || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (feature) => {
    const props = feature.properties;

    const label = [
      props.name,
      props.city,
      props.state,
      props.country,
    ]
      .filter(Boolean)
      .join(", ");

    // update parent state
    setFormData((prev) => ({
      ...prev,
      location: label,
    }));

    // update local input
    setQuery(label);

    // hide dropdown
    setResults([]);

    // mark complete
    markComplete();
  };

  return (
    <div className={styles.locationCat}>
      <label className={styles.formQuestion}>
        Please enter where your club meets:
      </label>

      <input
        type="text"
        placeholder="Enter location here"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);

          setFormData((prev) => ({
            ...prev,
            location: e.target.value,
          }));
        }}
        className={styles.locationInput}
      />

      {results.length > 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #ddd",
            borderTop: "none",
            fontFamily: "Freeman, sans-serif",
            zIndex: 1000,
            maxHeight: 250,
            overflowY: "auto",
          }}
        >
          {results.map((feature, index) => {
            const props = feature.properties;

            const label = [
              props.name,
              props.city,
              props.state,
              props.country,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={index}
                onClick={() => handleSelect(feature)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  color: "#3A5186",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#3A5186";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                  e.target.style.color = "#3A5186";
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}

      {loading && <div style={{ marginTop: 8 }}>Searching...</div>}
    </div>
  );
}