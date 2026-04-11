export const auth = {
  signIn: 'Se connecter',
  signUp: "S'inscrire",
  signOut: 'Se deconnecter',
  resetPassword: 'Reinitialiser le mot de passe',
  email: 'Email',
  emailAddress: 'Adresse e-mail',
  newEmail: 'Nouvelle adresse e-mail',
  changeEmail: 'Modifier',
  displayName: "Nom d'affichage *",
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  currentPassword: 'Mot de passe actuel',
  newPassword: 'Nouveau mot de passe',
  confirmNewPassword: 'Confirmer le nouveau mot de passe',
  passwordsDoNotMatch: 'Les mots de passe ne correspondent pas.',
  dontHaveAccount: "Vous n'avez pas encore de compte ?",
  placeholderEmail: 'vous@exemple.com',
  placeholderName: 'Votre nom',
  placeholderPassword: 'mot de passe',
  placeholderRepeatPassword: 'repetez le mot de passe',
  emailConfirmationInstructions:
    'Verifiez votre email pour confirmer votre compte, puis connectez-vous.',
  resetPasswordInstructions: 'Verifiez votre email pour le lien de reinitialisation.',
  newPasswordTitle: 'Nouveau mot de passe',
  passwordUpdated: 'Mot de passe mis a jour. Redirection vers la connexion...',
  updatePassword: 'Mettre a jour le mot de passe',
  errors: {
    emailRequired: "L'adresse e-mail est obligatoire.",
    invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
    sameEmail: 'Veuillez saisir une adresse e-mail differente.',
    emailExists: 'Cette adresse e-mail est deja utilisee.',
    emailNotConfirmed: "Veuillez d'abord confirmer votre adresse e-mail actuelle.",
    emailProviderDisabled: 'La connexion par e-mail est actuellement indisponible.',
    emailSsoManaged: 'Ce compte est gere via le SSO.',
    weakPassword: 'Veuillez choisir un mot de passe plus robuste.',
    samePassword: 'Veuillez saisir un mot de passe different.',
    reauthenticationNeeded: 'Veuillez vous reconnecter puis reessayer.',
    validationFailed: 'Veuillez verifier vos saisies puis reessayer.',
    tooManyRequests: 'Trop de requetes. Veuillez reessayer plus tard.',
    requestTimeout: 'La requete a expire. Veuillez reessayer.',
    unknown: "Une erreur s'est produite. Veuillez reessayer.",
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
  },
  join: {
    inviteCodeRequired: "Le code d'invitation est obligatoire.",
    inviteCodeLabel: "Code d'invitation *",
    inviteCodePlaceholder: 'ex. A1B2C3D4',
    join: 'Rejoindre',
    alreadyJoined: 'Vous avez deja rejoint ce voyage.',
  },
  event: {
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

export const icons = {
  cat: 'Chat',
  dog: 'Chien',
  dove: 'Colombe',
  fish: 'Poisson',
  frog: 'Grenouille',
  shrimp: 'Crevette',
  'apple-whole': 'Pomme',
  seedling: 'Pousse',
  'user-astronaut': 'Astronaute',
  'user-secret': 'Homme Mystérieux',
  'chess-knight': "Chevalier d'échecs",
  'face-grin-hearts': 'Sourire aux Cœurs',
  'face-grin-squint-tears': 'Mort de Rire',
  'face-smile': 'Sourire',
  'face-smile-wink': "Sourire Clin d'œil",
};

export const settings = {
  settings: 'Paramètres',
  updateSuccess: 'Mis à jour avec succès.',
  emailChangePending: 'Verifiez votre boite mail pour confirmer votre nouvelle adresse e-mail.',
  errors: {
    emptyDisplayName: "Le nom d'affichage ne peut pas être vide.",
    invalidIcon: "Le nom de l'icône est invalide.",
    invalidIconColor: "La couleur de l'icône doit être un code hexadécimal.",
    invalidIconBgColor: "La couleur de fond de l'icône doit être un code hexadécimal.",
    missingPassword:
      'Le nouveau mot de passe et sa confirmation sont requis pour changer le mot de passe.',
    passwordMismatch: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.',
  },
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
  icons,
  settings,
  trip,
};
