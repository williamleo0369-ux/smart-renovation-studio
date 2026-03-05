import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { User, UserRole } from "@/types";

const AUTH_STORAGE_KEY = "renovation_auth_user";

async function loadUser(): Promise<User | null> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      console.log("Loaded user:", parsed.phone);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load user:", error);
  }
  return null;
}

async function saveUser(user: User | null): Promise<User | null> {
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      console.log("Saved user:", user.phone);
    } else {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      console.log("Cleared user");
    }
  } catch (error) {
    console.error("Failed to save user:", error);
  }
  return user;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  const userQuery = useQuery({
    queryKey: ["auth_user"],
    queryFn: loadUser,
  });

  const { mutate: persistUser } = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth_user"] });
    },
  });

  useEffect(() => {
    if (userQuery.isFetched) {
      setUser(userQuery.data ?? null);
      setIsReady(true);
    }
  }, [userQuery.data, userQuery.isFetched]);

  const login = useCallback(
    (phone: string, role: UserRole) => {
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        phone,
        role,
        createdAt: Date.now(),
      };
      setUser(newUser);
      persistUser(newUser);
      console.log("User logged in:", phone, role);
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    persistUser(null);
    console.log("User logged out");
  }, [persistUser]);

  const isLoggedIn = user !== null;

  return {
    user,
    isLoggedIn,
    isReady,
    login,
    logout,
  };
});
