import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Wand2,
  Crown,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { RENOVATION_STYLES, STYLE_CATEGORIES } from "@/constants/styles";
import { DEFAULT_CONSTRAINTS } from "@/constants/constraints";
import { EngineeringConstraint } from "@/types";
import { buildRenovationPrompt, calculateEstimatedCost } from "@/utils/prompt";
import { PhotoUploader } from "@/components/PhotoUploader";
import { StyleCard } from "@/components/StyleCard";
import { ConstraintToggle } from "@/components/ConstraintToggle";
import { useProjects } from "@/hooks/useProjects";
import { useSubscription } from "@/hooks/useSubscription";

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addProject } = useProjects();
  const { isPro, canGenerate, remainingGenerations, canAccessStyle, recordGeneration } = useSubscription();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [selectedStyleId, setSelectedStyleId] = useState<string>("nordic");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("emotional-healing");
  const [constraints, setConstraints] =
    useState<EngineeringConstraint[]>(DEFAULT_CONSTRAINTS);
  const [showConstraints, setShowConstraints] = useState<boolean>(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const selectedStyle = RENOVATION_STYLES.find((s) => s.id === selectedStyleId);
  const costEstimate = selectedStyle
    ? calculateEstimatedCost(selectedStyle, constraints)
    : null;

  const handlePhotoSelected = useCallback((uri: string, base64: string) => {
    setPhotoUri(uri);
    setPhotoBase64(base64);
    console.log("Photo selected, base64 length:", base64.length);
  }, []);

  const handlePhotoClear = useCallback(() => {
    setPhotoUri(null);
    setPhotoBase64("");
  }, []);

  const handleStyleSelect = useCallback((id: string) => {
    if (!canAccessStyle(id)) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      Alert.alert(
        "专业版风格",
        "该风格为专业版专属，开通后即可使用全量 12 大进阶风格。",
        [
          { text: "稍后再说", style: "cancel" },
          { text: "查看订阅", onPress: () => router.push("/subscription") },
        ]
      );
      return;
    }
    setSelectedStyleId(id);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [canAccessStyle, router]);

  const handleConstraintToggle = useCallback((id: string) => {
    setConstraints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  }, []);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStyle || !photoBase64) {
        throw new Error("请先上传照片并选择风格");
      }

      const prompt = buildRenovationPrompt(selectedStyle, constraints, isPro);
      console.log("Generation prompt:", prompt);

      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();

      const response = await fetch(
        "https://toolkit.rork.com/images/edit/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            images: [{ type: "image", image: photoBase64 }],
            aspectRatio: "16:9",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Generation API error:", errorText);
        throw new Error("生成失败，请重试");
      }

      const data = await response.json();
      console.log("Generation successful, mime:", data.image?.mimeType);
      return data;
    },
    onSuccess: (data) => {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);

      if (!selectedStyle || !photoUri) return;

      const cost = calculateEstimatedCost(selectedStyle, constraints);
      const projectId = `proj_${Date.now()}`;

      const constraintMap: Record<string, boolean> = {};
      constraints.forEach((c) => {
        constraintMap[c.id] = c.enabled;
      });

      addProject({
        id: projectId,
        title: `${selectedStyle.name}改造方案`,
        originalPhoto: photoUri,
        generatedPhoto: data.image.base64Data,
        styleId: selectedStyleId,
        constraints: constraintMap,
        estimatedCost: cost.total,
        costRange: cost.range,
        createdAt: Date.now(),
        status: "completed",
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.push({
        pathname: "/result",
        params: { projectId },
      });
    },
    onError: (error) => {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      console.error("Generation failed:", error);
      Alert.alert("生成失败", error.message || "请稍后重试");
    },
  });

  const handleGenerate = useCallback(() => {
    if (!photoUri) {
      Alert.alert("提示", "请先上传一张房屋照片");
      return;
    }
    if (!photoBase64) {
      Alert.alert("提示", "照片加载中，请稍后重试");
      return;
    }
    if (!canGenerate) {
      Alert.alert(
        "今日额度已用完",
        "免费版每日仅可生成 1 次。升级专业版享无限生成。",
        [
          { text: "知道了", style: "cancel" },
          { text: "升级专业版", onPress: () => router.push("/subscription") },
        ]
      );
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    recordGeneration();
    generateMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUri, photoBase64, buttonScale, canGenerate, router, recordGeneration]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>创建改造方案</Text>
          <Text style={styles.subtitle}>
            上传照片 → 选择风格 → AI 智能生成
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>第一步</Text>
          <Text style={styles.sectionTitle}>上传空间照片</Text>
          <PhotoUploader
            photo={photoUri}
            onPhotoSelected={handlePhotoSelected}
            onPhotoClear={handlePhotoClear}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>第二步</Text>
          <Text style={styles.sectionTitle}>选择改造风格</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {STYLE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryTab,
                  activeCategoryId === cat.id && styles.categoryTabActive,
                ]}
                onPress={() => {
                  setActiveCategoryId(cat.id);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text
                  style={[
                    styles.categoryTabName,
                    activeCategoryId === cat.id && styles.categoryTabNameActive,
                  ]}
                >
                  {cat.name}
                </Text>
                <Text
                  style={[
                    styles.categoryTabDesc,
                    activeCategoryId === cat.id && styles.categoryTabDescActive,
                  ]}
                >
                  {cat.nameEn}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {STYLE_CATEGORIES.filter((cat) => cat.id === activeCategoryId).map(
            (cat) => (
              <View key={cat.id}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryDescription}>{cat.description}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.stylesScroll}
                >
                  {cat.styles.map((style) => {
                    const locked = !canAccessStyle(style.id);
                    return (
                      <View key={style.id} style={{ position: "relative" as const }}>
                        <StyleCard
                          style={style}
                          selected={style.id === selectedStyleId}
                          onSelect={handleStyleSelect}
                        />
                        {locked && (
                          <View style={styles.lockedOverlay}>
                            <View style={styles.lockedBadge}>
                              <Crown size={10} color="#D4A76A" />
                              <Text style={styles.lockedText}>PRO</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.constraintHeader}
            onPress={() => setShowConstraints(!showConstraints)}
          >
            <View>
              <Text style={styles.sectionLabel}>第三步</Text>
              <Text style={styles.sectionTitle}>工程约束条件</Text>
            </View>
            {showConstraints ? (
              <ChevronUp size={20} color={Colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={Colors.textSecondary} />
            )}
          </Pressable>
          {showConstraints && (
            <View style={styles.constraintList}>
              {constraints.map((constraint) => (
                <ConstraintToggle
                  key={constraint.id}
                  constraint={constraint}
                  onToggle={handleConstraintToggle}
                />
              ))}
            </View>
          )}
        </View>

        {costEstimate && (
          <View style={styles.costPreview}>
            <Text style={styles.costPreviewLabel}>预估费用参考</Text>
            <View style={styles.costPreviewRow}>
              <Text style={styles.costPreviewAmount}>
                ¥{(costEstimate.range[0] / 10000).toFixed(1)}万 -{" "}
                ¥{(costEstimate.range[1] / 10000).toFixed(1)}万
              </Text>
              <Text style={styles.costPreviewNote}>基于80㎡</Text>
            </View>
          </View>
        )}

        {generateMutation.isPending && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressBar, { width: progressWidth }]}
              />
            </View>
            <Text style={styles.progressText}>
              AI 正在为您生成改造效果图，请稍候...
            </Text>
          </View>
        )}

        {!isPro && (
          <Pressable
            style={styles.upgradeBar}
            onPress={() => router.push("/subscription")}
          >
            <Crown size={16} color="#D4A76A" />
            <Text style={styles.upgradeBarText}>
              {canGenerate
                ? `今日剩余 ${remainingGenerations} 次生成`
                : "今日额度已用完"}
            </Text>
            <Text style={styles.upgradeBarLink}>升级专业版 →</Text>
          </Pressable>
        )}

        {isPro && (
          <View style={styles.proBadgeBar}>
            <Crown size={14} color="#D4A76A" />
            <Text style={styles.proBadgeBarText}>专业版 · 超清渲染 · 无限生成</Text>
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={[
              styles.generateButton,
              (!photoUri || generateMutation.isPending) &&
                styles.generateButtonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!photoUri || generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Wand2 size={20} color="#fff" />
            )}
            <Text style={styles.generateButtonText}>
              {generateMutation.isPending ? "生成中..." : "AI 智能生成效果图"}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.accent,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  categoryTabs: {
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoryTabActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  categoryTabName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  categoryTabNameActive: {
    color: Colors.accent,
  },
  categoryTabDesc: {
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
  categoryTabDescActive: {
    color: Colors.accent,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
  },
  stylesScroll: {
    gap: 12,
  },
  constraintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  constraintList: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  costPreview: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.accentMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.accentLight,
  },
  costPreviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  costPreviewRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  costPreviewAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  costPreviewNote: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: Colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700" as const,
  },
  lockedOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(28,28,30,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  lockedText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: "#D4A76A",
    letterSpacing: 0.5,
  },
  upgradeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "rgba(212,167,106,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212,167,106,0.2)",
  },
  upgradeBarText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  upgradeBarLink: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  proBadgeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 10,
    backgroundColor: "rgba(212,167,106,0.08)",
    borderRadius: 12,
    justifyContent: "center",
  },
  proBadgeBarText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#D4A76A",
  },
});
