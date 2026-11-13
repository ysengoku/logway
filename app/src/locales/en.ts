export const auth = {
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  signOutAll: 'Sign Out of All Devices',
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
  selectDate: 'Select a date to view items.',
};

export const day = {
  timeline: 'Timeline',
  byType: 'By Type',
  noEvents: 'No items on this day yet.',
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
  failedToSaveEvent: 'Failed to save item.',
  failedToDeleteEvent: 'Failed to delete item.',
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
  maintenance: {
    rebuilding: 'LogWay is packing its bags for a new journey.',
    availableSoon: 'Back soon, ready for your next trips.',
  },
};

export const errors = {
  notFound: 'Not found.',
  trip: {
    titleRequired: 'Title is required.',
    invalidDate: 'Invalid date.',
    dateOrder: 'End date must not be before start date.',
    eventsOutsideDates: '{count} item(s) are outside the new dates.',
  },
  event: {
    tripIdRequired: 'Trip ID is required.',
    tripNotFound: 'Trip not found.',
    typeChanged: 'Type cannot be changed.',
    invalidDates: 'Invalid start and/or end date.',
    outsideTrip: 'Dates must be within the trip.',
    titleAndUrlRequired: 'Title and URL are required.',
    flightNumberRequired: 'Flight number is required.',
    placesRequired: 'Departure and arrival places are required.',
    invalidTransportDateTime: 'Invalid departure or arrival date, time or time zone.',
    arrivalBeforeDeparture: 'Arrival must not be earlier than departure.',
    nameRequired: 'Name is required.',
    checkoutAfterCheckin: 'Check-out date must be after check-in date.',
    invalidHotelTime: 'Invalid check-in or check-out time.',
    startTimeRequired: 'Missing or invalid start time.',
    invalidStartTime: 'Invalid start time.',
  },
};

export const event = {
  checkIn: 'CHECK IN',
  checkOut: 'CHECK OUT',
  ref: 'Ref: {ref}',
  event: 'Item',
  addEvent: 'Add Item',
  deleteConfirm: 'Delete this item?',
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

export const privacyPolicy = {
  title: 'Privacy Policy',
  lastUpdated: 'Last updated: {date}',
  intro:
    'LogWay is a travel planner. This page explains what data LogWay uses, where it is stored and how you can delete it.',
  storage: {
    title: 'Where your data is stored',
    description:
      'LogWay does not store your trips on its servers. Your trips and items are stored only in these two places:',
    items: {
      browser: 'In your browser, as a local copy on your device.',
      drive:
        'In your Google Drive, in a hidden folder that only LogWay can access. It does not appear in your Drive files.',
    },
  },
  googleData: {
    title: 'Data from your Google account',
    description: 'When you sign in with Google, LogWay asks for the following access:',
    items: {
      profile:
        'Your name and profile picture, to show them in the app. They are kept in memory and are not saved.',
      appData: 'The hidden app folder in your Google Drive, to save and load your trips.',
      appFiles:
        'Files that LogWay creates in your Google Drive, to make share links. LogWay cannot see your other Drive files.',
    },
    noEmail: 'LogWay does not ask for your email address.',
    limitedUse:
      "LogWay's use and transfer of information received from Google APIs will adhere to the {policy}, including the Limited Use requirements. This data is used only to provide LogWay's features. It is not sold, not used for advertising and not shared with anyone else.",
    policyLink: 'Google API Services User Data Policy',
  },
  share: {
    title: 'Share links',
    items: {
      snapshot:
        'When you share a trip, LogWay creates a read-only copy of it in your Google Drive. Anyone with the link can view it.',
      excluded: 'Booking references and notes are never included.',
      stop: 'When you stop sharing, the copy is deleted and the link no longer works.',
    },
  },
  device: {
    title: 'Cookies and local storage',
    items: {
      cookie:
        'One cookie keeps you signed in. It contains an encrypted Google sign-in token. You need to sign in again after 30 days at most. This cookie is necessary for the app to work.',
      localStorage: 'Your language preference is saved in your browser.',
      noTracking: 'LogWay does not use analytics, advertising or tracking cookies.',
    },
  },
  providers: {
    title: 'Service providers',
    items: {
      google: 'Google: sign-in and storage of your data in your Google Drive.',
      vercel:
        'Vercel: hosting of the app. Like most hosting services, Vercel may process technical data such as your IP address in its logs.',
    },
  },
  deletion: {
    title: 'How to delete your data',
    items: {
      revoke: 'Remove LogWay from your {permissions}. LogWay can then no longer access your Drive.',
      drive:
        'In Google Drive, open Settings, then Manage apps. Find LogWay and select Delete hidden app data.',
      browser: 'Clear the site data for LogWay in your browser settings to delete the local copy.',
    },
    permissionsLink: 'Google account permissions',
  },
  rights: {
    title: 'Your rights',
    items: {
      access:
        'LogWay does not keep your trips or your profile on its servers. Your data is in your own Google Drive and browser, so you can view, change and delete it yourself at any time, as described above.',
      complaint:
        'You can also file a complaint with the data protection authority of your country.',
    },
  },
  changes: {
    title: 'Changes to this policy',
    description:
      'If this policy changes, the new version will be published on this page with a new date.',
  },
  contact: {
    title: 'Contact',
    description: 'For questions about this policy, please email {email}.',
    showEmail: 'Show email address',
  },
};

export const trip = {
  deleteConfirm: 'Delete "{title}"? All items will also be deleted.',
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
  errors,
  event,
  form,
  home,
  privacyPolicy,
  trip,
};
