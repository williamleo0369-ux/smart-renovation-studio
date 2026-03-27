import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  Palette,
  SlidersHorizontal,
  ShoppingBag,
  History,
  ChevronLeft,
  Gift,
  Star,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { SUBSCRIPTION_PLANS } from "@/constants/subscription";
import { useSubscription } from "@/hooks/useSubscription";

const FEATURE_ICONS = [Zap, Sparkles, Palette, SlidersHorizontal, ShoppingBag, History];

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { subscription, isPro, subscribe, cancelSubscription } = useSubscription();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const crownScale = useRef(new Animated.Value(0.5)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(crownScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, crownScale, shimmerAnim]);

  const handleSubscribe = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "确认订阅",
      "确认订阅专业版（¥98/月）？\n\n模拟支付：点击确认即刻开通",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确认订阅",
          onPress: () => {
            subscribe("professional");
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert(
              "订阅成功",
              "恭喜您成为专业版会员！\n已赠送：线下设计师免费测量券 ×1",
              [{ text: "开始体验", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  }, [subscribe, router]);

  const handleCancel = useCallback(() => {
    Alert.alert("取消订阅", "确定要取消专业版订阅吗？取消后将在到期日失效。", [
      { text: "保留订阅", style: "cancel" },
      {
        text: "确认取消",
        style: "destructive",
        onPress: () => {
          cancelSubscription();
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        },
      },
    ]);
  }, [cancelSubscription]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  const expiryText = subscription.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>会员订阅</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#2C2216", "#1C1C1E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBg}
          >
            <View style={styles.heroDecoLeft} />
            <View style={styles.heroDecoRight} />

            <Animated.View style={[styles.crownWrapper, { transform: [{ scale: crownScale }] }]}>
              <LinearGradient
                colors={["#D4A76A", "#C8956C", "#B8834A"]}
                style={styles.crownCircle}
              >
                <Crown size={32} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            {isPro ? (
              <>
                <Text style={styles.heroTitle}>专业版会员</Text>
                <Text style={styles.heroSubtitle}>
                  到期时间：{expiryText}
                </Text>
                <View style={styles.proBadge}>
                  <Star size={12} color="#D4A76A" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.heroTitle}>解锁全部创作能力</Text>
                <Text style={styles.heroSubtitle}>
                  专业级渲染 · 全量风格 · 无限生成
                </Text>
              </>
            )}
          </LinearGradient>
        </Animated.View>

        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan, planIndex) => {
            const isCurrentPlan =
              (plan.id === "free" && !isPro) || (plan.id === "professional" && isPro);

            return (
              <Animated.View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.highlighted && styles.planCardHighlighted,
                  isCurrentPlan && styles.planCardCurrent,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: Animated.multiply(slideAnim, planIndex + 1) },
                    ],
                  },
                ]}
              >
                {plan.highlighted && !isPro && (
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendText}>推荐</Text>
                  </View>
                )}

                {isCurrentPlan && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>当前方案</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planNameEn}>{plan.nameEn}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text
                      style={[
                        styles.planPrice,
                        plan.highlighted && styles.planPriceHighlighted,
                      ]}
                    >
                      {plan.priceLabel}
                    </Text>
                    {plan.period ? (
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => {
                    const IconComponent = FEATURE_ICONS[index] ?? Check;
                    const isHighlighted = plan.highlighted;
                    return (
                      <View key={index} style={styles.featureRow}>
                        <View
                          style={[
                            styles.featureIcon,
                            isHighlighted && styles.featureIconHighlighted,
                          ]}
                        >
                          <IconComponent
                            size={12}
                            color={isHighlighted ? "#D4A76A" : Colors.textTertiary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.featureText,
                            isHighlighted && styles.featureTextHighlighted,
                          ]}
                        >
                          {feature}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {!isPro && (
          <Animated.View style={{ opacity: shimmerOpacity }}>
            <Pressable style={styles.subscribeButton} onPress={handleSubscribe}>
              <LinearGradient
                colors={["#D4A76A", "#C8956C", "#B8834A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeGradient}
              >
                <Crown size={20} color="#FFFFFF" />
                <Text style={styles.subscribeText}>立即开通专业版</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {isPro && (
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>取消订阅</Text>
          </Pressable>
        )}

        <View style={styles.couponCard}>
          <LinearGradient
            colors={["rgba(200,149,108,0.08)", "rgba(200,149,108,0.02)"]}
            style={styles.couponGradient}
          >
            <View style={styles.couponIcon}>
              <Gift size={20} color={Colors.accent} />
            </View>
            <View style={styles.couponContent}>
              <Text style={styles.couponTitle}>订阅即赠</Text>
              <Text style={styles.couponDesc}>
                线下设计师免费上门测量券 ×1
              </Text>
              <Text style={styles.couponNote}>
                订阅成功后自动发放至账户
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>权益对比</Text>
          {[
            { label: "生成额度", free: "1次/天", pro: "无限" },
            { label: "画面质量", free: "1080P", pro: "4K/8K 超清" },
            { label: "风格数量", free: "8 种", pro: "12 种全量" },
            { label: "工程参数", free: "基础", pro: "进阶调节" },
            { label: "商品匹配", free: "通用", pro: "品牌深度匹配" },
            { label: "方案记忆", free: "最近1次", pro: "无限迭代" },
            { label: "AI水印", free: "有", pro: "无" },
          ].map((row, index) => (
            <View
              key={index}
              style={[
                styles.comparisonRow,
                index % 2 === 0 && styles.comparisonRowAlt,
              ]}
            >
              <Text style={styles.comparisonLabel}>{row.label}</Text>
              <View style={styles.comparisonValues}>
                <Text style={styles.comparisonFree}>{row.free}</Text>
                <Text style={styles.comparisonPro}>{row.pro}</Text>
              </View>
            </View>
          ))}
          <View style={styles.comparisonHeader}>
            <View style={styles.comparisonHeaderSpacer} />
            <View style={styles.comparisonHeaderValues}>
              <Text style={styles.comparisonHeaderFree}>基础版</Text>
              <Text style={styles.comparisonHeaderPro}>专业版</Text>
            </View>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          订阅将自动续期，可随时取消。本服务为虚拟商品，开通后不支持退款。
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroBg: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    overflow: "hidden",
  },
  heroDecoLeft: {
    position: "absolute",
    top: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(200,149,108,0.08)",
  },
  heroDecoRight: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(200,149,108,0.06)",
  },
  crownWrapper: {
    marginBottom: 16,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D4A76A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(212,167,106,0.15)",
    borderWidth: 1,
    borderColor: "rgba(212,167,106,0.3)",
  },
  proBadgeText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#D4A76A",
    letterSpacing: 1,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  planCardHighlighted: {
    borderColor: "rgba(200,149,108,0.4)",
    shadowColor: "rgba(200,149,108,0.2)",
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  planCardCurrent: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  recommendBadge: {
    position: "absolute",
    top: -1,
    right: 20,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  recommendText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  currentBadge: {
    position: "absolute",
    top: -1,
    left: 20,
    backgroundColor: Colors.sage,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  planNameEn: {
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.textPrimary,
  },
  planPriceHighlighted: {
    color: Colors.accent,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  featuresList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconHighlighted: {
    backgroundColor: "rgba(212,167,106,0.12)",
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  featureTextHighlighted: {
    color: Colors.textPrimary,
    fontWeight: "500" as const,
  },
  subscribeButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#C8956C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  subscribeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  subscribeText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  couponCard: {
    marginBottom: 28,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.accentMuted,
  },
  couponGradient: {
    flexDirection: "row",
    padding: 16,
    gap: 14,
    alignItems: "center",
  },
  couponIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  couponContent: {
    flex: 1,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.accent,
    marginBottom: 2,
  },
  couponDesc: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "600" as const,
  },
  couponNote: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  comparisonSection: {
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  comparisonHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    position: "absolute",
    top: 32,
    left: 0,
    right: 0,
  },
  comparisonHeaderSpacer: {
    flex: 1,
  },
  comparisonHeaderValues: {
    flex: 1.2,
    flexDirection: "row",
  },
  comparisonHeaderFree: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  comparisonHeaderPro: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.accent,
    textAlign: "center",
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  comparisonRowAlt: {
    backgroundColor: Colors.surfaceElevated,
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "500" as const,
  },
  comparisonValues: {
    flex: 1.2,
    flexDirection: "row",
  },
  comparisonFree: {
    flex: 1,
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  comparisonPro: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
