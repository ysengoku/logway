export const auth = {
  signIn: 'Se connecter',
  signUp: "S'inscrire",
  signOut: 'Se deconnecter',
  resetPassword: 'Reinitialiser le mot de passe',
  email: 'Email',
  emailAddress: 'Adresse e-mail',
  newEmail: 'Nouvelle adresse e-mail',
  changeEmail: 'Modifier',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  currentPassword: 'Mot de passe actuel',
  newPassword: 'Nouveau mot de passe',
  confirmNewPassword: 'Confirmer le nouveau mot de passe',
  passwordsDoNotMatch: 'Le mot de passe et sa confirmation ne correspondent pas.',
  dontHaveAccount: "Vous n'avez pas encore de compte ?",
  placeholderEmail: "vous{'@'}exemple.com",
  placeholderPassword: 'mot de passe',
  placeholderRepeatPassword: 'repetez le mot de passe',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  showNewPassword: 'Afficher le nouveau mot de passe',
  hideNewPassword: 'Masquer le nouveau mot de passe',
  showPasswordConfirmation: 'Afficher la confirmation du mot de passe',
  hidePasswordConfirmation: 'Masquer la confirmation du mot de passe',
  emailConfirmationInstructions:
    'Verifiez votre email pour confirmer votre compte, puis connectez-vous.',
  resetPasswordInstructions: 'Verifiez votre email pour le lien de reinitialisation.',
  newPasswordTitle: 'Nouveau mot de passe',
  passwordUpdated: 'Mot de passe mis a jour. Redirection vers la connexion...',
  updatePassword: 'Mettre a jour le mot de passe',
  errors: {
    emailRequired: "L'adresse e-mail est requise.",
    invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
    sameEmail: 'Veuillez saisir une adresse e-mail differente.',
    emailExists: 'Cette adresse e-mail est deja utilisee.',
    emailNotConfirmed: "Veuillez d'abord confirmer votre adresse e-mail actuelle.",
    emailProviderDisabled: 'La connexion par e-mail est actuellement indisponible.',
    emailSsoManaged: 'Ce compte est gere via le SSO.',
    passwordRequired: 'Le mot de passe est requis.',
    weakPassword:
      'Le mot de passe doit contenir au moins 12 caracteres, avec majuscule, minuscule, chiffre et symbole.',
    samePassword: 'Veuillez saisir un mot de passe different.',
    missingPassword: 'Saisissez le mot de passe et sa confirmation.',
    passwordsDoNotMatch: 'Le mot de passe et sa confirmation ne correspondent pas.',
    reauthenticationNeeded: 'Veuillez vous reconnecter puis reessayer.',
    validationFailed: 'Veuillez verifier vos saisies puis reessayer.',
    tooManyRequests: 'Trop de requetes. Veuillez reessayer plus tard.',
    requestTimeout: 'La requete a expire. Veuillez reessayer.',
  },
};

export const calendar = {
  selectDate: 'Selectionnez une date pour voir les evenements.',
};

export const common = {
  cancel: 'Annuler',
  close: 'Fermer',
  loading: 'Chargement...',
  back: 'Retour',
  edit: 'Modifier',
  add: 'Ajouter',
  deleteThisTrip: 'Supprimer ce voyage',
  newTrip: '+ Nouveau voyage',
  joinTrip: 'Rejoindre un voyage',
  errorOccurred: "Une erreur s'est produite.",
  saveChanges: 'Enregistrer les modifications',
  save: 'Enregistrer',
  saving: 'Enregistrement...',
  failedToSaveEvent: "Echec de l'enregistrement de l'evenement.",
  backToSignIn: 'Retour a la connexion',
  unknownError: "Une erreur s'est produite. Veuillez reessayer.",
  openInAnotherTab: 'LogWay est deja ouvert dans un autre onglet. Veuillez utiliser cet onglet.',
};

export const day = {
  timeline: 'Chronologie',
  byType: 'Par type',
  noEvents: 'Aucun evenement ce jour-la.',
};

export const event = {
  checkIn: 'ARRIVEE',
  checkOut: 'DEPART',
  ref: 'Ref : {ref}',
  event: 'Evenement',
  addEvent: 'Ajouter un evenement',
  type: {
    flight: 'Vol',
    transport: 'Transport',
    hotel: 'Hotel',
    restaurant: 'Restaurant',
    activity: 'Activite',
    link: 'Lien',
  },
};

export const form = {
  title: 'Titre',
  trip: {
    namePlaceholder: 'ex. Europe 2026',
    startDate: 'Date de debut',
    endDate: 'Date de fin',
    nameRequired: 'Le nom du voyage est obligatoire.',
    dateRequired: 'Les dates de debut et de fin sont obligatoires.',
    dateOrder: 'La date de fin ne doit pas etre anterieure a la date de debut.',
  },
  join: {
    inviteCodeRequired: "Le code d'invitation est obligatoire.",
    inviteCodeLabel: "Code d'invitation *",
    inviteCodePlaceholder: 'ex. A1B2C3D4',
    join: 'Rejoindre',
    alreadyJoined: 'Vous avez deja rejoint ce voyage.',
  },
  event: {
    errors: {
      flightRequired:
        "Le numero de vol ainsi que le lieu, la date et l'heure de depart et d'arrivee sont obligatoires.",
      transportRequired: "Le lieu, la date et l'heure de depart et d'arrivee sont obligatoires.",
      hotelRequired:
        "Le nom de l'etablissement et les dates d'arrivee et de depart sont obligatoires.",
      checkoutAfterCheckin: "La date de depart doit etre posterieure a la date d'arrivee.",
      restaurantRequired:
        "Le nom du restaurant, la date et l'heure de reservation sont obligatoires.",
      activityRequired: 'Le nom et la date sont obligatoires.',
      linkRequired: "Le titre, l'URL et la date sont obligatoires.",
    },
    name: 'Nom',
    reference: 'Reference de reservation',
    from: 'De',
    to: 'A',
    date: 'Date',
    time: 'Heure',
    timeZone: 'Fuseau horaire',
    departure: 'Depart',
    departureTime: 'Heure de depart',
    arrival: 'Arrivee',
    arrivalTime: "Heure d'arrivee",
    address: 'Adresse',
    website: 'Site web / Page de reservation',
    notes: 'Notes',
    timezoneHint:
      'Pour les trajets de nuit ou entre fuseaux horaires, saisissez chaque heure dans son fuseau local.',
    flight: {
      number: 'Numero de vol',
    },
    transport: {
      line: 'Service / Ligne',
    },
    hotel: {
      checkinDate: "Date d'arrivee",
      checkinTime: "Heure d'arrivee",
      checkoutDate: 'Date de depart',
      checkoutTime: 'Heure de depart',
    },
    link: {
      url: 'URL',
      relatedDate: 'Date associee',
    },
  },
};

export const home = {
  myTrips: 'Mes voyages',
  upcoming: 'A venir',
  past: 'Passes',
  noUpcoming: 'Aucun voyage a venir. Planifiez votre prochaine aventure !',
  noPast: "Aucun voyage passe pour l'instant.",
  showLess: 'Voir moins',
  showAll: 'Tout afficher ({count})',
};

export const settings = {
  settings: 'Paramètres',
  updateSuccess: 'Mis à jour avec succès.',
  emailChangePending: 'Verifiez votre boite mail pour confirmer votre nouvelle adresse e-mail.',
};

export const trip = {
  deleteConfirm: 'Supprimer "{title}" ? Tous les evenements seront aussi supprimes.',
  editTrip: 'Modifier le voyage',
  deleteTrip: 'Supprimer le voyage',
  members: {
    members: 'Membres',
    removeConfirm: 'Supprimer ce membre ?',
    inviteCopied: "Code d'invitation copie dans le presse-papiers !",
    inviteCopyFailed: "Impossible de copier le code d'invitation.",
    inviteShareLabel: 'Partagez ce code pour inviter des amis :',
    copyInviteTitle: "Copier le code d'invitation",
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
  settings,
  trip,
};
