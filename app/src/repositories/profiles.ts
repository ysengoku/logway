import { getDb } from '@/db/client';
import type { Db } from '@/db/types';
import type { Profile } from '@/shared/types/profile';

type ProfileUpdate = Partial<
  Pick<Profile, 'display_name' | 'preferred_locale' | 'icon' | 'icon_color' | 'icon_bg_color'>
>;

// Spec: tests/unit/api/profiles.test.ts
// Validation errors are thrown as ApiError (./errors) with the same codes the
// profile store already handles (@/shared/constants/errorCodes).
export function createProfilesApi(db: () => Promise<Db>) {
  void db;
  const notImplemented = (): never => {
    throw new Error('Not implemented');
  };

  return {
    async getSelf(): Promise<Profile> {
      return notImplemented();
    },
    async updateSelf(body: ProfileUpdate): Promise<Profile> {
      void body;
      return notImplemented();
    },
  };
}

export const profilesApi = createProfilesApi(getDb);
