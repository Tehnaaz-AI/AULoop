import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      token: "",
      user: null,
      saved: [],
      notifications: [],
      theme: "light",
      setSession: ({ token, user }) => set({ token, user }),
      clearSession: () => set({ token: "", user: null, saved: [], notifications: [] }),
      setSaved: (saved) => set({ saved }),
      setNotifications: (notifications) => set({ notifications }),
      setUser: (user) => set({ user }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      toggleSavedLocal: (id) =>
        set((state) => ({
          saved: state.saved.includes(id)
            ? state.saved.filter((item) => item !== id)
            : [...state.saved, id],
        })),
    }),
    {
      name: "auloop-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        theme: state.theme,
      }),
    }
  )
);
