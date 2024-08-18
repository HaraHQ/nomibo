import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decodeJwt } from 'jose';

interface AuthState {
  token: string;
  setToken: (token: string) => void;
  validate: () => boolean;
  clearToken: () => void;
}

const useAuth = create(
  persist<AuthState>((set, get) => ({
    token: '',
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