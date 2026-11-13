import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppleAuthentication from "expo-apple-authentication";
import createContextHook from "@nkzw/create-context-hook";
import { User, UserRole } from "@/types";

const AUTH_STORAGE_KEY = "renovation_apple_user_v1";

async function readStoredUser(): Promise<User | null> {
  const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!value) return null;
  const user = JSON.parse(value) as User;
  try {
    const state = await AppleAuthentication.getCredentialStateAsync(user.id);
    if (state === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED) return user;
  } catch {
    // The API is unavailable outside a supported Apple device.
  }
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    readStoredUser()
      .then(setUser)
      .finally(() => setIsReady(true));
  }, []);

  const signInWithApple = useCallback(async (role: UserRole) => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const displayName = [credential.fullName?.familyName, credential.fullName?.givenName]
      .filter(Boolean)
      .join("") || "Apple 用户";
    const nextUser: User = {
      id: credential.user,
      provider: "apple",
      displayName,
      email: credential.email ?? undefined,
      role,
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, isLoggedIn: Boolean(user), isReady, signInWithApple, logout };
});
