export const auth = {
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  resetPassword: 'Reset Password',
  email: 'Email',
  emailAddress: 'Email Address',
  newEmail: 'New Email Address',
  changeEmail: 'Change',
  displayName: 'Display Name *',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmNewPassword: 'Confirm New Password',
  dontHaveAccount: "Don't have an account yet?",
  placeholderEmail: "you{'@'}example.com",
  placeholderName: 'Your name',
  placeholderPassword: 'password',
  placeholderRepeatPassword: 'repeat password',
  emailConfirmationInstructions: 'Check your email to confirm your account, then sign in.',
  resetPasswordInstructions: 'Check your email for password reset link.',
  newPasswordTitle: 'New password',
  passwordUpdated: 'Password updated. Redirecting to sign in...',
  updatePassword: 'Update password',
  errors: {
    emailRequired: 'Email is required.',
    invalidEmail: 'Please enter a valid email address.',
    sameEmail: 'Please enter a different email address.',
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
  close: 'Close',
  loading: 'Loading...',
  back: 'Back',
  edit: 'Edit',
  add: 'Add',
  deleteThisTrip: 'Delete this trip',
  newTrip: '+ New Trip',
  joinTrip: 'Join Trip',
  errorOccurred: 'An error occurred.',
  saveChanges: 'Save changes',
  save: 'Save',
  saving: 'Saving...',
  failedToSaveEvent: 'Failed to save event.',
  backToSignIn: 'Back to Sign In',
  unknownError: 'An error occurred. Please try again.',
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
  },
  join: {
    inviteCodeRequired: 'Invite code is required.',
    inviteCodeLabel: 'Invite Code *',
    inviteCodePlaceholder: 'e.g. A1B2C3D4',
    join: 'Join',
    alreadyJoined: 'You have already joined this trip.',
  },
  event: {
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
  showLess: 'Show less',
  showAll: 'Show all ({count})',
};

export const icons = {
  cat: 'Cat',
  dog: 'Dog',
  dove: 'Dove',
  fish: 'Fish',
  frog: 'Frog',
  shrimp: 'Shrimp',
  'apple-whole': 'Apple',
  seedling: 'Seedling',
  'user-astronaut': 'Astronaut',
  'user-secret': 'Mysterious Man',
  'chess-knight': 'Chess Knight',
  'face-grin-hearts': 'Grinning Hearts',
  'face-grin-squint-tears': 'Lol',
  'face-smile': 'Smiling Face',
  'face-smile-wink': 'Winking Face',
};

export const settings = {
  settings: 'Settings',
  updateSuccess: 'Updated successfully.',
  emailChangePending: 'Check your inbox to confirm your new email address.',
  errors: {
    emptyDisplayName: 'Display name cannot be empty.',
    displayNameLength: 'Display name must be between 2 and 16 characters.',
    displayNameCharacters: 'Display name can only contain letters, numbers, spaces, _ and -.',
    displayNameLeadingOrTrailingSpaces: 'Display name cannot start or end with spaces.',
    displayNameConsecutiveSpaces: 'Display name cannot contain consecutive spaces.',
    displayNameReserved: 'This display name is reserved and cannot be used.',
    invalidIcon: 'Selected icon is invalid.',
    invalidIconColor: 'Icon color must be a hex color.',
    invalidIconBgColor: 'Icon background color must be a hex color.',
  },
};

export const trip = {
  deleteConfirm: 'Delete "{title}"? All events will also be deleted.',
  editTrip: 'Edit Trip',
  deleteTrip: 'Delete Trip',
  members: {
    members: 'Members',
    removeConfirm: 'Remove this member?',
    inviteCopied: 'Invite code copied to clipboard!',
    inviteCopyFailed: 'Failed to copy invite code.',
    inviteShareLabel: 'Share this code to invite friends:',
    copyInviteTitle: 'Copy invite code',
  },
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
  icons,
  settings,
  trip,
};
