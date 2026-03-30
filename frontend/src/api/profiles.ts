import { request } from './http';
import type { Profile } from '@shared/types/profile';

export const profilesApi = {
  getByIds(userIds: string[]): Promise<Profile[]> {
    return request(`/api/profiles?user_ids=${userIds.join(',')}`);
  },
  getSelf(): Promise<Profile> {
    return request('/api/profiles/self');
  },
  updateSelf(body: Partial<Pick<Profile, 'display_name' | 'preferred_locale' | 'icon'>>): Promise<Profile> {
    return request('/api/profiles/self', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
};
