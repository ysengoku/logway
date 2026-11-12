import { config, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

import {
  faBed,
  faBus,
  faCableCar,
  faCar,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faCopy,
  faDesktop,
  faEye,
  faEyeSlash,
  faGlobe,
  faLink,
  faLocationDot,
  faPen,
  faPlane,
  faRoute,
  faSailboat,
  faTrain,
  faTrash,
  faUmbrellaBeach,
  faUser,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faBed,
  faBus,
  faCableCar,
  faCar,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faCopy,
  faDesktop,
  faEye,
  faEyeSlash,
  faGlobe,
  faLink,
  faLocationDot,
  faPen,
  faPlane,
  faRoute,
  faSailboat,
  faTrain,
  faTrash,
  faUmbrellaBeach,
  faUser,
  faUtensils,
);

export function getFaIcon(iconName: string): string {
  return iconName.startsWith('fa-') ? `fa-solid ${iconName}` : `fa-solid fa-${iconName}`;
}
