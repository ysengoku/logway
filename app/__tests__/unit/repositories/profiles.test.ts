import { beforeEach, describe, expect, it } from 'vitest';
import { createProfilesApi } from '@/repositories/profiles';
import {
  ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
  ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
  ERROR_CODE_PROFILE_ICON_INVALID,
} from '@/shared/constants/errorCodes';
import { PROFILE_ICON_NAMES } from '@/shared/types/profileIcon';
import { createMemoryDb } from '../helpers/memoryDb';
import type { Profile } from '@/shared/types/profile';

describe('profilesApi (SQLite)', () => {
  let profilesApi: ReturnType<typeof createProfilesApi>;

  beforeEach(async () => {
    const db = await createMemoryDb();
    profilesApi = createProfilesApi(async () => db);
  });

  it('creates a default profile on first access and keeps it afterwards', async () => {
    const first = await profilesApi.getSelf();
    const second = await profilesApi.getSelf();

    expect(first.display_name).toBe('Traveler');
    expect(PROFILE_ICON_NAMES).toContain(first.icon);
    expect(first.icon_color).toBe('#c38e1d');
    expect(first.icon_bg_color).toBe('#1B3A5C');
    expect(second).toEqual(first);
  });

  it('updates the profile', async () => {
    const updated = await profilesApi.updateSelf({
      display_name: 'Yuko',
      preferred_locale: 'fr',
      icon: 'cat',
      icon_color: '#123ABC',
    });

    expect(updated).toMatchObject({
      display_name: 'Yuko',
      preferred_locale: 'fr',
      icon: 'cat',
      icon_color: '#123ABC',
    });
  });

  it.each([
    ['', ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY, 'emptyDisplayName'],
    ['a', ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID, 'displayNameLength'],
    ['admin', ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID, 'displayNameReserved'],
  ])('rejects display name %j', async (displayName, code, message) => {
    await expect(profilesApi.updateSelf({ display_name: displayName })).rejects.toMatchObject({
      status: 400,
      code,
      message,
    });
  });

  it.each([
    { icon: 'dragon' },
    { icon_color: 'red' },
    { icon_bg_color: '#12345' },
  ] as Partial<Profile>[])('rejects invalid icon settings %j', async (updates) => {
    await expect(profilesApi.updateSelf(updates)).rejects.toMatchObject({
      status: 400,
      code: ERROR_CODE_PROFILE_ICON_INVALID,
    });
  });

  it('rejects an update without editable fields', async () => {
    await expect(profilesApi.updateSelf({})).rejects.toMatchObject({ status: 400 });
  });
});
