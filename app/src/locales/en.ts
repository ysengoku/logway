export const auth = {
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  resetPassword: 'Reset Password',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  currentPassword: 'Current Password',
  dontHaveAccount: "Don't have an account yet?",
  placeholderEmail: "you{'@'}example.com",
  placeholderPassword: 'password',
  placeholderRepeatPassword: 'repeat password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  showPasswordConfirmation: 'Show password confirmation',
  hidePasswordConfirmation: 'Hide password confirmation',
  emailConfirmationInstructions: 'Check your email to confirm your account, then sign in.',
  resetPasswordInstructions: 'Check your email for password reset link.',
  newPasswordTitle: 'New password',
  passwordUpdated: 'Password updated. Redirecting to sign in...',
  updatePassword: 'Update password',
  errors: {
    emailRequired: 'Email is required.',
    invalidEmail: 'Please enter a valid email address.',
    emailExists: 'This email address is already in use.',
    emailNotConfirmed: 'Please confirm your current email address first.',
    emailProviderDisabled: 'Email sign-in is currently unavailable.',
    emailSsoManaged: 'This account is managed by single sign-on.',
    passwordRequired: 'Password is required.',
    weakPassword:
      'Password must be at least 12 characters and include uppercase, lowercase, a number, and a symbol.',
    samePassword: 'Please enter a different password.',
    missingPassword: 'Enter both password and confirmation.',
    passwordsDoNotMatch: 'Password and confirmation do not match.',
    reauthenticationNeeded: 'Please sign in again and retry.',
    validationFailed: 'Please review your input and try again.',
    tooManyRequests: 'Too many requests. Please try again later.',
    requestTimeout: 'Request timed out. Please try again.',
  },
};

export const calendar = {
  selectDate: 'Select a date to view events.',
};

export const day = {
  timeline: 'Timeline',
  byType: 'By Type',
  noEvents: 'No events on this day yet.',
};

export const common = {
  cancel: 'Cancel',
  loading: 'Loading...',
  back: 'Back',
  edit: 'Edit',
  add: 'Add',
  deleteThisTrip: 'Delete this trip',
  newTrip: '+ New Trip',
  errorOccurred: 'An error occurred.',
  saveChanges: 'Save changes',
  save: 'Save',
  saving: 'Saving...',
  failedToSaveEvent: 'Failed to save event.',
  failedToDeleteEvent: 'Failed to delete event.',
  failedToDeleteTrip: 'Failed to delete trip.',
  backToSignIn: 'Back to Sign In',
  unknownError: 'An error occurred. Please try again.',
  openInAnotherTab: 'LogWay is already open in another tab. Please use that tab.',
  databaseError: {
    title: 'LogWay could not start',
    description: 'The local database could not be opened, so changes could not be saved.',
    causesIntro: 'Check the following, then try again:',
    causes: {
      privateWindow: 'The browser is in a private window.',
      blockedStorage: 'The browser settings block site data.',
      outdatedBrowser: 'The browser version is too old.',
      storageFull: 'The device storage is full.',
    },
    reload: 'Try again',
  },
};

export const event = {
  checkIn: 'CHECK IN',
  checkOut: 'CHECK OUT',
  ref: 'Ref: {ref}',
  event: 'Event',
  addEvent: 'Add Event',
  type: {
    flight: 'Flight',
    transport: 'Transport',
    hotel: 'Hotel',
    restaurant: 'Restaurant',
    activity: 'Activity',
    link: 'Link',
  },
};

export const form = {
  title: 'Title',
  trip: {
    namePlaceholder: 'e.g. Europe 2026',
    startDate: 'Start Date',
    endDate: 'End Date',
    nameRequired: 'Trip name is required.',
    dateRequired: 'Start and end dates are required.',
    dateOrder: 'End date must not be before start date.',
  },
  event: {
    errors: {
      flightRequired: 'Flight number, departure and arrival place, date and time are required.',
      transportRequired: 'Departure and arrival place, date and time are required.',
      hotelRequired: 'Property name, check-in date and check-out date are required.',
      checkoutAfterCheckin: 'Check-out date must be after check-in date.',
      restaurantRequired: 'Restaurant name, reservation date and time are required.',
      activityRequired: 'Name and date are required.',
      linkRequired: 'Title, URL and date are required.',
    },
    name: 'Name',
    reference: 'Booking Reference',
    from: 'From',
    to: 'To',
    date: 'Date',
    time: 'Time',
    timeZone: 'Time Zone',
    departure: 'Departure',
    departureTime: 'Departure Time',
    arrival: 'Arrival',
    arrivalTime: 'Arrival Time',
    address: 'Address',
    website: 'Website / Booking Page',
    notes: 'Notes',
    timezoneHint:
      'For overnight or cross-timezone journeys, enter each time in its local timezone.',
    flight: {
      number: 'Flight Number',
    },
    transport: {
      line: 'Service / Line',
    },
    hotel: {
      checkinDate: 'Check-in Date',
      checkinTime: 'Check-in Time',
      checkoutDate: 'Check-out Date',
      checkoutTime: 'Check-out Time',
    },
    link: {
      url: 'URL',
      relatedDate: 'Related Date',
    },
  },
};

export const home = {
  myTrips: 'My Trips',
  upcoming: 'Upcoming Trips',
  past: 'Past Trips',
  noUpcoming: 'No upcoming trips. Plan your next adventure!',
  noPast: 'No past trips yet.',
  loadFailed: 'Trips could not be loaded.',
  showLess: 'Show less',
  showAll: 'Show all ({count})',
};

export const trip = {
  deleteConfirm: 'Delete "{title}"? All events will also be deleted.',
  editTrip: 'Edit Trip',
  deleteTrip: 'Delete Trip',
  notFound: 'This trip could not be found.',
  loadFailed: 'This trip could not be loaded.',
};

export const datetimeFormats = {
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  },
  withTime: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
} as const;

export default {
  auth,
  calendar,
  common,
  day,
  event,
  form,
  home,
  trip,
};
