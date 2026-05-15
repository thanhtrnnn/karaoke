import { describe, it, expect, beforeEach } from 'vitest';
import { hasRouteAccess, getUserFromStorage } from './rbac';

describe('RBAC Config', () => {
  describe('hasRouteAccess', () => {
    it('allows ADMIN to access anything', () => {
      expect(hasRouteAccess('ADMIN', '/some-random-route')).toBe(true);
      expect(hasRouteAccess('ADMIN', '/login')).toBe(true);
    });

    it('allows BRANCH_MANAGER to access allowed routes', () => {
      expect(hasRouteAccess('BRANCH_MANAGER', '/reports')).toBe(true);
      expect(hasRouteAccess('BRANCH_MANAGER', '/rooms/123')).toBe(true); // sub-route
      expect(hasRouteAccess('BRANCH_MANAGER', '/unknown')).toBe(false);
    });

    it('denies SERVICE_STAFF access to reports', () => {
      expect(hasRouteAccess('SERVICE_STAFF', '/reports')).toBe(false);
      expect(hasRouteAccess('SERVICE_STAFF', '/orders')).toBe(true);
    });
  });

  describe('getUserFromStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns null if empty', () => {
      expect(getUserFromStorage()).toBeNull();
    });

    it('returns parsed user object', () => {
      const user = { id: '1', username: 'test', email: 'test@t.com', role: 'ADMIN', token: '123' };
      localStorage.setItem('user', JSON.stringify(user));
      expect(getUserFromStorage()).toEqual(user);
    });

    it('returns null on bad JSON', () => {
      localStorage.setItem('user', 'bad json');
      expect(getUserFromStorage()).toBeNull();
    });
  });
});
