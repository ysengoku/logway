import type { ProfileIconName } from './profileIcon';

export interface Profile {
  id: string;
  display_name: string;
  preferred_locale?: string | null;
  icon: ProfileIconName;
  icon_color: string;
  icon_bg_color: string;
  updated_at: string;
}

export interface ProfileForm {
  displayName: string;
  icon: ProfileIconName;
  iconColor: string;
  iconBgColor: string;
}

export interface UserForm {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}
