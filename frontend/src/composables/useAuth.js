import axios from "axios";

import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const clientId = import.meta.env.VITE_CLIENT_ID;
const authorizeUrl = import.meta.env.VITE_AUTHORIZE_URL;
const tokenEndpoint = import.meta.env.VITE_TOKEN_ENDPOINT;
const userApiEndpoint = import.meta.env.VITE_USER_API_ENDPOINT;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

const useAuth = () => {
  const authStore = useAuthStore();
  const {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
  } = storeToRefs(authStore);
  const router = useRouter();

  const createRandomString = (length) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  };

  const createCodeChallenge = async (verifier) => {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(verifier)
    );

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const redirectToProvider = async () => {
    const state = createRandomString(40);
    const verifier = createRandomString(128);
    const challenge = await createCodeChallenge(verifier);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "*",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    localStorage.setItem("state", state);
    localStorage.setItem("verifier", verifier);
    window.location.assign(`${authorizeUrl}?${params}`);
  };

  const getAccessToken = async (verifier, code) => {
    const { data } = await axios.post(tokenEndpoint, {
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      code: code,
    });

    accessToken.value = data.access_token;
    refreshToken.value = data.refresh_token;

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
  };

  const getUserInfo = async (allowRefresh = true) => {
    try {
      const { data } = await axios.post(userApiEndpoint, null, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });

      user.value = data;
      isLoggedIn.value = true;
    } catch (error) {
      if (allowRefresh && error.response?.status === 401 && refreshToken.value) {
        await refreshAccessToken();
        return getUserInfo(false);
      }

      logout();
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    const currentRefreshToken =
      refreshToken.value || localStorage.getItem("refresh_token");

    if (!currentRefreshToken) {
      logout();
      throw new Error("No refresh token is available");
    }

    const { data } = await axios.post(tokenEndpoint, {
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: currentRefreshToken,
    });

    accessToken.value = data.access_token;
    refreshToken.value = data.refresh_token || currentRefreshToken;
    localStorage.setItem("access_token", accessToken.value);
    localStorage.setItem("refresh_token", refreshToken.value);

    return data;
  };

  const logout = () => {
    localStorage.clear();
    isLoggedIn.value = false;
    router.push("/login");
  };

  return {
    // Variables
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    // Functions
    redirectToProvider,
    getAccessToken,
    getUserInfo,
    refreshAccessToken,
    logout,
  };
};

export default useAuth;
