export const auth = {
  signIn: 'Se connecter',
  signUp: "S'inscrire",
  signOut: 'Se déconnecter',
  signOutAll: 'Déconnecter tous les appareils',
  resetPassword: 'Réinitialiser le mot de passe',
  email: 'Email',
  password: 'mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  currentPassword: 'mot de passe actuel',
  passwordsDoNotMatch: 'Le mot de passe et sa confirmation ne correspondent pas.',
  dontHaveAccount: "Vous n'avez pas encore de compte ?",
  placeholderEmail: "vous{'@'}exemple.com",
  placeholderPassword: 'mot de passe',
  placeholderRepeatPassword: 'répétez le mot de passe',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
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
  selectDate: 'Sélectionnez une date pour voir les éléments.',
};

export const common = {
  cancel: 'Annuler',
  loading: 'Chargement...',
  back: 'Retour',
  edit: 'Modifier',
  add: 'Ajouter',
  deleteThisTrip: 'Supprimer ce voyage',
  newTrip: '+ Nouveau voyage',
  errorOccurred: "Une erreur s'est produite.",
  saveChanges: 'Enregistrer les modifications',
  save: 'Enregistrer',
  saving: 'Enregistrement...',
  failedToSaveEvent: "Echec de l'enregistrement de l'élément.",
  failedToDeleteEvent: "Echec de la suppression de l'élément.",
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
  maintenance: {
    rebuilding: 'LogWay fait ses valises pour un nouveau voyage.',
    availableSoon: 'De retour bientôt, prêt pour vos prochains voyages.',
  },
};

export const day = {
  timeline: 'Chronologie',
  byType: 'Par type',
  noEvents: 'Aucun élément ce jour-là.',
};

export const errors = {
  notFound: 'Introuvable.',
  trip: {
    titleRequired: 'Le titre est obligatoire.',
    invalidDate: 'Date invalide.',
    dateOrder: 'La date de fin ne doit pas être antérieure à la date de début.',
    eventsOutsideDates: '{count} élément(s) en dehors des nouvelles dates.',
  },
  event: {
    tripIdRequired: "L'identifiant du voyage est obligatoire.",
    tripNotFound: 'Voyage introuvable.',
    typeChanged: 'Le type ne peut pas être modifié.',
    invalidDates: 'Date de début et/ou de fin invalide.',
    outsideTrip: 'Les dates doivent être comprises dans le voyage.',
    titleAndUrlRequired: "Le titre et l'URL sont obligatoires.",
    flightNumberRequired: 'Le numéro de vol est obligatoire.',
    placesRequired: "Les lieux de départ et d'arrivée sont obligatoires.",
    invalidTransportDateTime: "Date, heure ou fuseau horaire de départ ou d'arrivée invalide.",
    arrivalBeforeDeparture: "L'arrivée ne doit pas être antérieure au départ.",
    nameRequired: 'Le nom est obligatoire.',
    checkoutAfterCheckin: "La date de départ doit être postérieure à la date d'arrivée.",
    invalidHotelTime: "Heure d'arrivée ou de départ invalide.",
    startTimeRequired: 'Heure de début manquante ou invalide.',
    invalidStartTime: 'Heure de début invalide.',
  },
};

export const event = {
  checkIn: 'ARRIVEE',
  checkOut: 'DEPART',
  ref: 'Réf : {ref}',
  event: 'Elément',
  addEvent: 'Ajouter un élément',
  deleteConfirm: 'Supprimer cet élément ?',
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

export const privacyPolicy = {
  title: 'Politique de confidentialité',
  lastUpdated: 'Dernière mise à jour : {date}',
  intro:
    'LogWay est un outil de planification de voyages. Cette page explique quelles données LogWay utilise, où elles sont stockées et comment les supprimer.',
  storage: {
    title: 'Où sont stockées vos données',
    description:
      'LogWay ne stocke pas vos voyages sur ses serveurs. Vos voyages et leurs éléments sont stockés uniquement à ces deux endroits :',
    items: {
      browser: 'Dans votre navigateur, sous forme de copie locale sur votre appareil.',
      drive:
        "Dans votre Google Drive, dans un dossier masqué auquel seul LogWay a accès. Il n'apparaît pas dans vos fichiers Drive.",
    },
  },
  googleData: {
    title: 'Données de votre compte Google',
    description: 'Lorsque vous vous connectez avec Google, LogWay demande les accès suivants :',
    items: {
      profile:
        "Votre nom et votre photo de profil, pour les afficher dans l'application. Ils sont gardés en mémoire et ne sont pas enregistrés.",
      appData:
        "Le dossier masqué de l'application dans votre Google Drive, pour enregistrer et charger vos voyages.",
      appFiles:
        'Les fichiers créés par LogWay dans votre Google Drive, pour créer des liens de partage. LogWay ne peut pas voir vos autres fichiers Drive.',
    },
    noEmail: 'LogWay ne demande pas votre adresse e-mail.',
    limitedUse:
      "L'utilisation et le transfert par LogWay des informations reçues des API Google respectent les {policy}, y compris les exigences d'utilisation limitée (Limited Use). Ces données servent uniquement à fournir les fonctionnalités de LogWay. Elles ne sont ni vendues, ni utilisées à des fins publicitaires, ni partagées avec qui que ce soit.",
    policyLink: 'règles relatives aux données utilisateur des services API Google',
  },
  share: {
    title: 'Liens de partage',
    items: {
      snapshot:
        'Lorsque vous partagez un voyage, LogWay en crée une copie en lecture seule dans votre Google Drive. Toute personne disposant du lien peut la consulter.',
      excluded: 'Les numéros de réservation et les notes ne sont jamais inclus.',
      stop: 'Lorsque vous arrêtez le partage, la copie est supprimée et le lien ne fonctionne plus.',
    },
  },
  device: {
    title: 'Cookies et stockage local',
    items: {
      cookie:
        "Un cookie vous permet de rester connecté. Il contient un jeton de connexion Google chiffré. Vous devez vous reconnecter au plus tard au bout de 30 jours. Ce cookie est nécessaire au fonctionnement de l'application.",
      localStorage: 'Votre préférence de langue est enregistrée dans votre navigateur.',
      noTracking: "LogWay n'utilise aucun cookie de mesure d'audience, de publicité ou de suivi.",
    },
  },
  providers: {
    title: 'Prestataires',
    items: {
      google: 'Google : connexion et stockage de vos données dans votre Google Drive.',
      vercel:
        "Vercel : hébergement de l'application. Comme la plupart des hébergeurs, Vercel peut traiter des données techniques, comme votre adresse IP, dans ses journaux.",
    },
  },
  deletion: {
    title: 'Comment supprimer vos données',
    items: {
      revoke:
        'Retirez LogWay des {permissions}. LogWay ne pourra alors plus accéder à votre Drive.',
      drive:
        "Dans Google Drive, ouvrez Paramètres, puis Gérer les applications. Trouvez LogWay et sélectionnez Supprimer les données d'application masquées.",
      browser:
        'Effacez les données du site LogWay dans les paramètres de votre navigateur pour supprimer la copie locale.',
    },
    permissionsLink: 'autorisations de votre compte Google',
  },
  rights: {
    title: 'Vos droits',
    items: {
      access:
        'LogWay ne conserve ni vos voyages ni votre profil sur ses serveurs. Vos données se trouvent dans votre propre Google Drive et votre navigateur : vous pouvez les consulter, les modifier et les supprimer vous-même à tout moment, comme indiqué ci-dessus.',
      complaint:
        "Vous pouvez aussi introduire une réclamation auprès de l'autorité de protection des données de votre pays.",
    },
  },
  changes: {
    title: 'Modifications de cette politique',
    description:
      'Si cette politique change, la nouvelle version sera publiée sur cette page avec une nouvelle date.',
  },
  contact: {
    title: 'Contact',
    description: 'Pour toute question sur cette politique, écrivez à {email}.',
    showEmail: "Afficher l'adresse e-mail",
  },
};

export const trip = {
  deleteConfirm: 'Supprimer "{title}" ? Tous les éléments seront aussi supprimés.',
  editTrip: 'Modifier le voyage',
  deleteTrip: 'Supprimer le voyage',
  notFound: 'Ce voyage est introuvable.',
  loadFailed: 'Impossible de charger ce voyage.',
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
