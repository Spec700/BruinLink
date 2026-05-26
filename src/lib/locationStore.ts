export type ClubLocation = {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
};

let selectedLocation: ClubLocation = {};

export function getSelectedLocation() {
  return selectedLocation;
}

export function setSelectedLocation(location: ClubLocation) {
  selectedLocation = location;
}