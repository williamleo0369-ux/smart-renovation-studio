import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { Subscription, SubscriptionTier } from "@/types";
import {
  FREE_DAILY_LIMIT,
  PRO_DAILY_LIMIT,
  isStylePremium,
} from "@/constants/subscription";

const SUBSCRIPTION_KEY = "renovation_subscription";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getDefaultSubscription(): Subscription {
  return {
    tier: "free",
    expiryDate: null,
    dailyGenerations: 0,
    lastGenerationDate: "",
  };
}

async function loadSubscription(): Promise<Subscription> {
  try {
    const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Subscription;
      if (
        parsed.tier === "professional" &&
        parsed.expiryDate &&
        Date.now() > parsed.expiryDate
      ) {
        console.log("Subscription expired, reverting to free");
        const expired: Subscription = {
          ...getDefaultSubscription(),
          dailyGenerations: parsed.dailyGenerations,
          lastGenerationDate: parsed.lastGenerationDate,
        };
        await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(expired));
        return expired;
      }
      console.log("Loaded subscription:", parsed.tier);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load subscription:", error);
  }
  return getDefaultSubscription();
}

async function saveSubscription(sub: Subscription): Promise<Subscription> {
  try {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
    console.log("Saved subscription:", sub.tier);
  } catch (error) {
    console.error("Failed to save subscription:", error);
  }
  return sub;
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [subscription, setSubscription] = useState<Subscription>(
    getDefaultSubscription()
  );

  const subQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: loadSubscription,
  });

  const { mutate: persistSub } = useMutation({
    mutationFn: saveSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  useEffect(() => {
    if (subQuery.data) {
      setSubscription(subQuery.data);
    }
  }, [subQuery.data]);

  const isPro = subscription.tier === "professional";

  const dailyLimit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  const todayGenerations = useMemo(() => {
    const today = getTodayString();
    if (subscription.lastGenerationDate !== today) {
      return 0;
    }
    return subscription.dailyGenerations;
  }, [subscription.lastGenerationDate, subscription.dailyGenerations]);

  const canGenerate = isPro || todayGenerations < dailyLimit;

  const remainingGenerations = isPro
    ? Infinity
    : Math.max(0, dailyLimit - todayGenerations);

  const recordGeneration = useCallback(() => {
    const today = getTodayString();
    const newCount =
      subscription.lastGenerationDate === today
        ? subscription.dailyGenerations + 1
        : 1;
    const updated: Subscription = {
      ...subscription,
      dailyGenerations: newCount,
      lastGenerationDate: today,
    };
    setSubscription(updated);
    persistSub(updated);
    console.log("Recorded generation, count:", newCount);
  }, [subscription, persistSub]);

  const canAccessStyle = useCallback(
    (styleId: string) => {
      if (isPro) return true;
      return !isStylePremium(styleId);
    },
    [isPro]
  );

  const subscribe = useCallback(
    (tier: SubscriptionTier) => {
      const expiryDate =
        tier === "professional" ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null;
      const updated: Subscription = {
        ...subscription,
        tier,
        expiryDate,
      };
      setSubscription(updated);
      persistSub(updated);
      console.log("Subscribed to:", tier, "expiry:", expiryDate);
    },
    [subscription, persistSub]
  );

  const cancelSubscription = useCallback(() => {
    const updated: Subscription = {
      ...subscription,
      tier: "free",
      expiryDate: null,
    };
    setSubscription(updated);
    persistSub(updated);
    console.log("Subscription cancelled");
  }, [subscription, persistSub]);

  return {
    subscription,
    isPro,
    canGenerate,
    remainingGenerations,
    todayGenerations,
    dailyLimit,
    recordGeneration,
    canAccessStyle,
    subscribe,
    cancelSubscription,
    isLoading: subQuery.isLoading,
  };
});
