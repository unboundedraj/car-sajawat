// Fixed choices for the "Interested in" dropdown on the callback form.
// Kept here (not loaded from the database) so the list stays short and stable.
export const ENQUIRY_INTERESTS = {
  Products: [
    "Car lighting & electrical accessories",
    "Floor mats & essentials",
    "Body styling (spoilers, kits, chrome)",
    "Seat covers & interior accessories",
    "Music systems & infotainment",
  ],
  Services: [
    "Paint protection film (PPF)",
    "Ceramic coating",
    "Detailing & polishing",
    "Sun film & window tint",
    "Installation & fitting",
    "Custom modification",
  ],
} as const;
