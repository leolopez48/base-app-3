import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref(null);
  const refreshToken = ref(null);
  const user = ref(null);
  const isLoggedIn = ref(false);

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
  };
});
