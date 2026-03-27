import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  Plus,
  Sparkles,
  Clock,
  ChevronRight,
  Layers,
  Crown,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { RENOVATION_STYLES, STYLE_CATEGORIES } from "@/constants/styles";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { isStylePremium } from "@/constants/subscription";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { recentProjects, completedProjects } = useProjects();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>空间焕新</Text>
              <Text style={styles.subtitle}>
                {user ? (user.role === "designer" ? "设计师" : "业主") : ""} · {user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") ?? ""}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {isPro && (
                <Pressable style={styles.proBadge} onPress={() => router.push("/subscription")}>
                  <Crown size={12} color="#D4A76A" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </Pressable>
              )}
              <View style={styles.statBadge}>
                <Layers size={14} color={Colors.accent} />
                <Text style={styles.statText}>
                  {completedProjects.length} 个方案
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.heroCard}
            onPress={() => router.push("/create")}
          >
            <View style={styles.heroGradient}>
              <View style={styles.heroContent}>
                <View style={styles.heroIconCircle}>
                  <Sparkles size={24} color="#fff" />
                </View>
                <Text style={styles.heroTitle}>开始新的空间改造</Text>
                <Text style={styles.heroSubtitle}>
                  上传房屋照片，AI 为您生成专业级改造效果图
                </Text>
                <View style={styles.heroButton}>
                  <Plus size={18} color={Colors.accent} />
                  <Text style={styles.heroButtonText}>创建方案</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {STYLE_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.section}>
              <View style={styles.categoryTitleRow}>
                <Text style={styles.sectionTitle}>{category.name}</Text>
                <Text style={styles.categorySubtitle}>{category.description}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stylesRow}
              >
                {category.styles.map((style) => (
                  <Pressable
                    key={style.id}
                    style={styles.styleChip}
                    onPress={() => router.push("/create")}
                  >
                    <Image
                      source={{ uri: style.image }}
                      style={styles.styleChipImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.styleChipOverlay}>
                      <Text style={styles.styleChipName}>{style.name}</Text>
                      <Text style={styles.styleChipEn}>{style.nameEn}</Text>
                    </View>
                    {isStylePremium(style.id) && !isPro && (
                      <View style={styles.premiumTag}>
                        <Crown size={9} color="#D4A76A" />
                        <Text style={styles.premiumTagText}>PRO</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))}

          {recentProjects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>最近方案</Text>
                <Pressable
                  style={styles.seeAllButton}
                  onPress={() => router.push("/history")}
                >
                  <Text style={styles.seeAllText}>查看全部</Text>
                  <ChevronRight size={14} color={Colors.accent} />
                </Pressable>
              </View>
              {recentProjects.map((project) => {
                const style = RENOVATION_STYLES.find(
                  (s) => s.id === project.styleId
                );
                return (
                  <Pressable
                    key={project.id}
                    style={styles.projectCard}
                    onPress={() =>
                      project.status === "completed" &&
                      project.generatedPhoto
                        ? router.push({
                            pathname: "/result",
                            params: { projectId: project.id },
                          })
                        : undefined
                    }
                  >
                    <Image
                      source={{ uri: project.originalPhoto }}
                      style={styles.projectThumb}
                      contentFit="cover"
                    />
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectTitle} numberOfLines={1}>
                        {project.title}
                      </Text>
                      <Text style={styles.projectStyle}>
                        {style?.name ?? "未知风格"} · {style?.nameEn ?? ""}
                      </Text>
                      <View style={styles.projectStatusRow}>
                        <View
                          style={[
                            styles.statusDot,
                            project.status === "completed" &&
                              styles.statusCompleted,
                            project.status === "generating" &&
                              styles.statusGenerating,
                            project.status === "failed" && styles.statusFailed,
                          ]}
                        />
                        <Text style={styles.statusText}>
                          {project.status === "completed"
                            ? "已完成"
                            : project.status === "generating"
                              ? "生成中..."
                              : project.status === "failed"
                                ? "生成失败"
                                : "草稿"}
                        </Text>
                        <Clock size={12} color={Colors.textTertiary} />
                        <Text style={styles.timeText}>
                          {new Date(project.createdAt).toLocaleDateString(
                            "zh-CN",
                            { month: "short", day: "numeric" }
                          )}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={Colors.textTertiary} />
                  </Pressable>
                );
              })}
            </View>
          )}

          {recentProjects.length === 0 && (
            <View style={styles.emptySection}>
              <View style={styles.emptyIcon}>
                <Sparkles size={32} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>还没有方案</Text>
              <Text style={styles.emptySubtitle}>
                上传一张房屋照片，开启您的第一次 AI 空间改造
              </Text>
            </View>
          )}
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
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
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.accentMuted,
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(212,167,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,167,106,0.25)",
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#D4A76A",
    letterSpacing: 0.5,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 28,
  },
  heroGradient: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  heroContent: {
    padding: 24,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 20,
    marginBottom: 20,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  categorySubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: "600" as const,
  },
  stylesRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  styleChip: {
    width: 140,
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  styleChipImage: {
    width: "100%",
    height: "100%",
  },
  styleChipOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  styleChipName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
  },
  styleChipEn: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  premiumTag: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(28,28,30,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumTagText: {
    fontSize: 8,
    fontWeight: "700" as const,
    color: "#D4A76A",
    letterSpacing: 0.5,
  },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  projectThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  projectStyle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  projectStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  statusCompleted: {
    backgroundColor: Colors.sage,
  },
  statusGenerating: {
    backgroundColor: Colors.accent,
  },
  statusFailed: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 19,
  },
});
