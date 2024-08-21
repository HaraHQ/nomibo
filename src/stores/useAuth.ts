import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decodeJwt } from 'jose';

interface AuthState {
  token: string;
  getUID: () => string | void;
  checkScope: (scope: string) => boolean;
  setToken: (token: string) => void;
  validate: () => boolean;
  clearToken: () => void;
}

const useAuth = create(
  persist<AuthState>((set, get) => ({
    token: '',
    getUID: () => {
      try {
        const decode = decodeJwt(get().token as string);
        return decode.id as string;
      } catch (error) {
        get().clearToken()
      }
    },
    checkScope: (scope: string) => {
      try {
        const decode = decodeJwt(get().token as string);
        return (decode.scopes as string[])?.includes(scope);
      } catch (error) {
        return false;
      }
    },
    setToken: (token: string) => set({ token }),
    validate: () => {
      try {
        const decode = decodeJwt(get().token as string);
        if (decode.exp as number * 1000 < Date.now() || !decode) {
          return false
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    clearToken: () => set({ token: '' }),
  }), {
    name: 'auth',
  })
)

export default useAuth;