import { getDb } from '@/db/client';
import { validateDisplayName } from '@/validators';
import {
  ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
  ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
  ERROR_CODE_PROFILE_ICON_INVALID,
} from '@shared/constants/errorCodes';
import { HEX_COLOR_REGEX } from '@shared/constants/regex';
import { PROFILE_ICON_NAMES } from '@shared/types/profileIcon';
import { ApiError } from './errors';
import { pickColumns, updateStatement } from './sql';
import type { Db } from '@/db/types';
import type { Profile } from '@shared/types/profile';
import type { ProfileIconName } from '@shared/types/profileIcon';

type ProfileUpdate = Partial<
  Pick<Profile, 'display_name' | 'preferred_locale' | 'icon' | 'icon_color' | 'icon_bg_color'>
>;

type ProfileRow = Omit<Profile, 'id'> & { id: number };

const EDITABLE_COLUMNS = [
  'display_name',
  'preferred_locale',
  'icon',
  'icon_color',
  'icon_bg_color',
] as const;

// Same defaults as the former Supabase signup trigger.
const DEFAULT_DISPLAY_NAME = 'Traveler';
const DEFAULT_ICON_COLOR = '#c38e1d';
const DEFAULT_ICON_BG_COLOR = '#1B3A5C';

function validateUpdate(updates: ProfileUpdate) {
  if (updates.display_name !== undefined) {
    const errorKey = validateDisplayName(updates.display_name);
    if (errorKey) {
      const code =
        errorKey === 'emptyDisplayName'
          ? ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY
          : ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID;
      throw new ApiError(errorKey, 400, code);
    }
  }
  if (updates.icon !== undefined && !PROFILE_ICON_NAMES.includes(updates.icon as ProfileIconName)) {
    throw new ApiError('invalidIcon', 400, ERROR_CODE_PROFILE_ICON_INVALID);
  }
  if (updates.icon_color !== undefined && !HEX_COLOR_REGEX.test(updates.icon_color)) {
    throw new ApiError('invalidIconColor', 400, ERROR_CODE_PROFILE_ICON_INVALID);
  }
  if (updates.icon_bg_color !== undefined && !HEX_COLOR_REGEX.test(updates.icon_bg_color)) {
    throw new ApiError('invalidIconBgColor', 400, ERROR_CODE_PROFILE_ICON_INVALID);
  }
}

export function createProfilesApi(db: () => Promise<Db>) {
  async function getSelf(): Promise<Profile> {
    const database = await db();
    let [row] = await database.query<ProfileRow>('SELECT * FROM profile WHERE id = 1');
    if (!row) {
      const icon = PROFILE_ICON_NAMES[Math.floor(Math.random() * PROFILE_ICON_NAMES.length)]!;
      await database.exec([
        {
          sql: 'INSERT INTO profile (id, display_name, icon, icon_color, icon_bg_color, updated_at) VALUES (1, ?, ?, ?, ?, ?)',
          bind: [
            DEFAULT_DISPLAY_NAME,
            icon,
            DEFAULT_ICON_COLOR,
            DEFAULT_ICON_BG_COLOR,
            new Date().toISOString(),
          ],
        },
      ]);
      [row] = await database.query<ProfileRow>('SELECT * FROM profile WHERE id = 1');
    }
    return { ...row!, id: String(row!.id) };
  }

  return {
    getSelf,
    async updateSelf(body: ProfileUpdate): Promise<Profile> {
      validateUpdate(body);
      const values = pickColumns(body, EDITABLE_COLUMNS);
      if (values.length === 0) throw new ApiError('No updatable fields provided.', 400);
      await getSelf();
      await (await db()).exec([
        updateStatement('profile', '1', [...values, ['updated_at', new Date().toISOString()]]),
      ]);
      return getSelf();
    },
  };
}

export const profilesApi = createProfilesApi(getDb);
