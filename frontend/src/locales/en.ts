export const auth = {
  signIn: 'Sign In',
  signUp: 'Sign Up',
  resetPassword: 'Reset Password',
  email: 'Email',
  displayName: 'Display Name *',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  passwordsDoNotMatch: 'Passwords do not match.',
  placeholderEmail: 'you@example.com',
  placeholderName: 'Your name',
  placeholderPassword: 'password',
  placeholderRepeatPassword: 'repeat password',
};

export const common = {
  cancel: 'Cancel',
  loading: 'Loading...',
  back: 'Back',
  edit: 'Edit',
  deleteThisTrip: 'Delete this trip',
  newTrip: '+ New Trip',
  joinTrip: 'Join Trip',
  errorOccurred: 'An error occurred.',
  saveChanges: 'Save changes',
  save: 'Save',
  saving: 'Saving...',
  failedToSaveEvent: 'Failed to save event.',
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

export const trip = {
  members: 'Members',
  deleteConfirm: 'Delete "{title}"? All events will also be deleted.',
  editTrip: 'Edit Trip',
};

export const members = {
  removeConfirm: 'Remove this member?',
  inviteCopied: 'Invite code copied to clipboard!',
  inviteCopyFailed: 'Failed to copy invite code.',
  inviteShareLabel: 'Share this code to invite friends:',
  copyInviteTitle: 'Copy invite code',
};

export const join = {
  inviteCodeRequired: 'Invite code is required.',
  inviteCodeLabel: 'Invite Code *',
  inviteCodePlaceholder: 'e.g. A1B2C3D4',
  join: 'Join',
};

export const tripForm = {
  tripName: 'Trip Name *',
  tripNamePlaceholder: 'e.g. Europe 2026',
  startDate: 'Start Date',
  endDate: 'End Date',
  tripNameRequired: 'Trip name is required.',
};

export const calendar = {
  selectDate: 'Select a date to view events.',
};

export const reset = {
  newPasswordTitle: 'New password',
  passwordUpdated: 'Password updated. Redirecting to sign in...',
  updatePassword: 'Update password',
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

export default {
  hello: 'Hello',
  auth,
  common,
  home,
  trip,
  members,
  join,
  tripForm,
  calendar,
  reset,
  event,
};
