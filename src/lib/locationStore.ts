export type ClubLocation = {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
};

export let selectedLocation: ClubLocation = {};

export function setSelectedLocation(location: ClubLocation) {
  selectedLocation = location;
}