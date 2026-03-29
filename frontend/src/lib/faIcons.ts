import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBed,
  faBus,
  faCableCar,
  faCar,
  faChevronLeft,
  faChevronRight,
  faCopy,
  faDesktop,
  faGlobe,
  faLink,
  faLocationDot,
  faPen,
  faPlane,
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
  faCopy,
  faDesktop,
  faGlobe,
  faLink,
  faLocationDot,
  faPen,
  faPlane,
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
