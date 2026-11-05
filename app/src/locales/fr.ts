export const auth = {
  signIn: 'Se connecter',
  signUp: "S'inscrire",
  signOut: 'Se déconnecter',
  resetPassword: 'Réinitialiser le mot de passe',
  email: 'Email',
  emailAddress: 'Adresse e-mail',
  newEmail: 'Nouvelle adresse e-mail',
  changeEmail: 'Modifier',
  password: 'mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  currentPassword: 'mot de passe actuel',
  newPassword: 'Nouveau mot de passe',
  confirmNewPassword: 'Confirmer le nouveau mot de passe',
  passwordsDoNotMatch: 'Le mot de passe et sa confirmation ne correspondent pas.',
  dontHaveAccount: "Vous n'avez pas encore de compte ?",
  placeholderEmail: "vous{'@'}exemple.com",
  placeholderPassword: 'mot de passe',
  placeholderRepeatPassword: 'répétez le mot de passe',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  showNewPassword: 'Afficher le nouveau mot de passe',
  hideNewPassword: 'Masquer le nouveau mot de passe',
  showPasswordConfirmation: 'Afficher la confirmation du mot de passe',
  hidePasswordConfirmation: 'Masquer la confirmation du mot de passe',
  emailConfirmationInstructions:
    'Vérifiez votre email pour confirmer votre compte, puis connectez-vous.',
  resetPasswordInstructions: 'Vérifiez votre email pour le lien de réinitialisation.',
  newPasswordTitle: 'Nouveau mot de passe',
  passwordUpdated: 'mot de passe mis à jour. Redirection vers la connexion...',
  updatePassword: 'Mettre à jour le mot de passe',
  errors: {
    emailRequired: "L'adresse e-mail est requise.",
    invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
    sameEmail: 'Veuillez saisir une adresse e-mail différente.',
    emailExists: 'Cette adresse e-mail est déjà utilisée.',
    emailNotConfirmed: "Veuillez d'abord confirmer votre adresse e-mail actuelle.",
    emailProviderDisabled: 'La connexion par e-mail est actuellement indisponible.',
    emailSsoManaged: 'Ce compte est géré via le SSO.',
    passwordRequired: 'Le mot de passe est requis.',
    weakPassword:
      'Le mot de passe doit contenir au moins 12 caractères, avec majuscule, minuscule, chiffre et symbole.',
    samePassword: 'Veuillez saisir un mot de passe différent.',
    missingPassword: 'Saisissez le mot de passe et sa confirmation.',
    passwordsDoNotMatch: 'Le mot de passe et sa confirmation ne correspondent pas.',
    reauthenticationNeeded: 'Veuillez vous reconnecter puis réessayer.',
    validationFailed: 'Veuillez vérifier vos saisies puis réessayer.',
    tooManyRequests: 'Trop de requêtes. Veuillez réessayer plus tard.',
    requestTimeout: 'La requête a expiré. Veuillez réessayer.',
  },
};

export const calendar = {
  selectDate: 'Sélectionnez une date pour voir les événements.',
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
  failedToSaveEvent: "Echec de l'enregistrement de l'événement.",
  failedToDeleteEvent: "Echec de la suppression de l'événement.",
  failedToDeleteTrip: 'Echec de la suppression du voyage.',
  backToSignIn: 'Retour à la connexion',
  unknownError: "Une erreur s'est produite. Veuillez réessayer.",
  openInAnotherTab: 'LogWay est déjà ouvert dans un autre onglet. Veuillez utiliser cet onglet.',
  databaseError: {
    title: "LogWay n'a pas pu démarrer",
    description:
      "La base de données locale n'a pas pu être ouverte. Les modifications ne pourraient pas être enregistrées.",
    causesIntro: 'Vérifiez les points suivants, puis réessayez :',
    causes: {
      privateWindow: 'Le navigateur est en navigation privée.',
      blockedStorage: 'Les paramètres du navigateur bloquent les données de site.',
      outdatedBrowser: 'La version du navigateur est trop ancienne.',
      storageFull: "Le stockage de l'appareil est plein.",
    },
    reload: 'Réessayer',
  },
};

export const day = {
  timeline: 'Chronologie',
  byType: 'Par type',
  noEvents: 'Aucun événement ce jour-la.',
};

export const event = {
  checkIn: 'ARRIVEE',
  checkOut: 'DEPART',
  ref: 'Réf : {ref}',
  event: 'Evénement',
  addEvent: 'Ajouter un événement',
  type: {
    flight: 'Vol',
    transport: 'Transport',
    hotel: 'Hôtel',
    restaurant: 'Restaurant',
    activity: 'Activité',
    link: 'Lien',
  },
};

export const form = {
  title: 'Titre',
  trip: {
    namePlaceholder: 'ex. Europe 2026',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    nameRequired: 'Le nom du voyage est obligatoire.',
    dateRequired: 'Les dates de début et de fin sont obligatoires.',
    dateOrder: 'La date de fin ne doit pas être antérieure à la date de début.',
  },
  join: {
    inviteCodeRequired: "Le code d'invitation est obligatoire.",
    inviteCodeLabel: "Code d'invitation *",
    inviteCodePlaceholder: 'ex. A1B2C3D4',
    join: 'Rejoindre',
    alreadyJoined: 'Vous avez déjà rejoint ce voyage.',
  },
  event: {
    errors: {
      flightRequired:
        "Le numéro de vol ainsi que le lieu, la date et l'heure de départ et d'arrivée sont obligatoires.",
      transportRequired: "Le lieu, la date et l'heure de départ et d'arrivée sont obligatoires.",
      hotelRequired:
        "Le nom de l'établissement et les dates d'arrivée et de départ sont obligatoires.",
      checkoutAfterCheckin: "La date de départ doit être postérieure à la date d'arrivée.",
      restaurantRequired:
        "Le nom du restaurant, la date et l'heure de réservation sont obligatoires.",
      activityRequired: 'Le nom et la date sont obligatoires.',
      linkRequired: "Le titre, l'URL et la date sont obligatoires.",
    },
    name: 'Nom',
    reference: 'Référence de réservation',
    from: 'De',
    to: 'A',
    date: 'Date',
    time: 'Heure',
    timeZone: 'Fuseau horaire',
    departure: 'Départ',
    departureTime: 'Heure de départ',
    arrival: 'Arrivée',
    arrivalTime: "Heure d'arrivée",
    address: 'Adresse',
    website: 'Site web / Page de réservation',
    notes: 'Notes',
    timezoneHint:
      'Pour les trajets de nuit ou entre fuseaux horaires, saisissez chaque heure dans son fuseau local.',
    flight: {
      number: 'Numéro de vol',
    },
    transport: {
      line: 'Service / Ligne',
    },
    hotel: {
      checkinDate: "Date d'arrivée",
      checkinTime: "Heure d'arrivée",
      checkoutDate: 'Date de départ',
      checkoutTime: 'Heure de départ',
    },
    link: {
      url: 'URL',
      relatedDate: 'Date associée',
    },
  },
};

export const home = {
  myTrips: 'Mes voyages',
  upcoming: 'A venir',
  past: 'Passés',
  noUpcoming: 'Aucun voyage à venir. Planifiez votre prochaine aventure !',
  noPast: "Aucun voyage passé pour l'instant.",
  loadFailed: 'Impossible de charger les voyages.',
  showLess: 'Voir moins',
  showAll: 'Tout afficher ({count})',
};

export const settings = {
  settings: 'Paramètres',
  updateSuccess: 'Mis à jour avec succès.',
  emailChangePending: 'Vérifiez votre boîte mail pour confirmer votre nouvelle adresse e-mail.',
};

export const trip = {
  deleteConfirm: 'Supprimer "{title}" ? Tous les événements seront aussi supprimés.',
  editTrip: 'Modifier le voyage',
  deleteTrip: 'Supprimer le voyage',
  notFound: 'Ce voyage est introuvable.',
  loadFailed: 'Impossible de charger ce voyage.',
  members: {
    members: 'Membres',
    removeConfirm: 'Supprimer ce membre ?',
    inviteCopied: "Code d'invitation copié dans le presse-papiers !",
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
