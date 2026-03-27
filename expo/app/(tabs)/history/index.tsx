import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  Trash2,
  Clock,
  ChevronRight,
  FolderOpen,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Paintbrush,
  Check,
  LogOut,
  Crown,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { RENOVATION_STYLES } from "@/constants/styles";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Project, UserRole } from "@/types";
import { formatCurrency } from "@/utils/prompt";

const PHONE_REGEX = /^1[3-9]\d{9}$/;

function LoginSection() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("homeowner");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const codeInputRef = useRef<TextInput>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = useCallback(() => {
    if (!PHONE_REGEX.test(phone)) {
      Alert.alert("提示", "请输入正确的11位手机号码");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCodeSent(true);
    startCountdown();
    console.log("Verification code sent to:", phone);
    Alert.alert("验证码已发送", "模拟验证码：1234");
    codeInputRef.current?.focus();
  }, [phone, startCountdown]);

  const handleLogin = useCallback(async () => {
    if (!PHONE_REGEX.test(phone)) {
      Alert.alert("提示", "请输入正确的手机号码");
      return;
    }
    if (code.length !== 4) {
      Alert.alert("提示", "请输入4位验证码");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("提示", "请先阅读并同意用户协议与隐私政策");
      return;
    }
    if (code !== "1234") {
      Alert.alert("验证码错误", "请输入正确的验证码（模拟：1234）");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoggingIn(true);

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await new Promise((resolve) => setTimeout(resolve, 800));

    login(phone, selectedRole);
    console.log("Login successful:", phone, selectedRole);
    setIsLoggingIn(false);
  }, [phone, code, agreedToTerms, selectedRole, login, buttonScale]);

  const handleButtonPressIn = useCallback(() => {
    Animated.timing(buttonScale, {
      toValue: 0.96,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const handleButtonPressOut = useCallback(() => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const isLoginEnabled =
    PHONE_REGEX.test(phone) && code.length === 4 && agreedToTerms && !isLoggingIn;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.loginContainer}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={[styles.loginScroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.loginHero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
            }}
            style={styles.loginHeroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(250,250,247,0.85)", Colors.background]}
            locations={[0, 0.6, 1]}
            style={styles.loginHeroGradient}
          />
          <View style={styles.loginHeroContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Sparkles size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.logoText}>空间焕新</Text>
            </View>
            <Text style={styles.loginHeroTitle}>登录 / 注册</Text>
            <Text style={styles.loginHeroSubtitle}>首次登录将自动创建账户</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Phone size={16} color={Colors.accent} />
              </View>
              <Text style={styles.inputPrefix}>+86</Text>
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.textInput}
                placeholder="请输入手机号"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
                testID="phone-input"
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <ShieldCheck size={16} color={Colors.accent} />
              </View>
              <TextInput
                ref={codeInputRef}
                style={[styles.textInput, styles.codeInput]}
                placeholder="请输入验证码"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                maxLength={4}
                value={code}
                onChangeText={setCode}
                testID="code-input"
              />
              <Pressable
                style={[
                  styles.sendCodeButton,
                  (countdown > 0 || !PHONE_REGEX.test(phone)) &&
                    styles.sendCodeButtonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={countdown > 0 || !PHONE_REGEX.test(phone)}
                testID="send-code-button"
              >
                <Text
                  style={[
                    styles.sendCodeText,
                    (countdown > 0 || !PHONE_REGEX.test(phone)) &&
                      styles.sendCodeTextDisabled,
                  ]}
                >
                  {countdown > 0
                    ? `${countdown}s`
                    : codeSent
                      ? "重新获取"
                      : "获取验证码"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>选择身份</Text>
            <View style={styles.roleRow}>
              <Pressable
                style={[
                  styles.roleCard,
                  selectedRole === "designer" && styles.roleCardActive,
                ]}
                onPress={() => {
                  setSelectedRole("designer");
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                }}
                testID="role-designer"
              >
                <Paintbrush
                  size={18}
                  color={selectedRole === "designer" ? Colors.accent : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === "designer" && styles.roleTextActive,
                  ]}
                >
                  设计师
                </Text>
                {selectedRole === "designer" && (
                  <View style={styles.roleCheck}>
                    <Check size={10} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
              <Pressable
                style={[
                  styles.roleCard,
                  selectedRole === "homeowner" && styles.roleCardActive,
                ]}
                onPress={() => {
                  setSelectedRole("homeowner");
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                }}
                testID="role-homeowner"
              >
                <User
                  size={18}
                  color={selectedRole === "homeowner" ? Colors.accent : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === "homeowner" && styles.roleTextActive,
                  ]}
                >
                  业主
                </Text>
                {selectedRole === "homeowner" && (
                  <View style={styles.roleCheck}>
                    <Check size={10} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.termsRow}
            onPress={() => {
              setAgreedToTerms((v) => !v);
              if (Platform.OS !== "web") {
                Haptics.selectionAsync();
              }
            }}
            testID="terms-checkbox"
          >
            <View
              style={[
                styles.checkbox,
                agreedToTerms && styles.checkboxChecked,
              ]}
            >
              {agreedToTerms && <Check size={10} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              我已阅读并同意
              <Text style={styles.termsLink}>《用户协议》</Text>
              与
              <Text style={styles.termsLink}>《隐私政策》</Text>
            </Text>
          </Pressable>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[
                styles.loginButton,
                !isLoginEnabled && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              disabled={!isLoginEnabled}
              testID="login-button"
            >
              {isLoggingIn ? (
                <Text style={styles.loginButtonText}>登录中...</Text>
              ) : (
                <>
                  <Text style={styles.loginButtonText}>登录</Text>
                  <ChevronRight size={16} color="#FFFFFF" />
                </>
              )}
            </Pressable>
          </Animated.View>

          <View style={styles.thirdPartySection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>其他登录方式</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.thirdPartyRow}>
              <Pressable style={styles.thirdPartyButton}>
                <View style={[styles.thirdPartyIcon, { backgroundColor: "#07C160" }]}>
                  <Text style={styles.thirdPartyIconText}>微</Text>
                </View>
                <Text style={styles.thirdPartyLabel}>微信</Text>
              </Pressable>
              <Pressable style={styles.thirdPartyButton}>
                <View style={[styles.thirdPartyIcon, { backgroundColor: "#1C1C1E" }]}>
                  <Text style={styles.thirdPartyIconText}>A</Text>
                </View>
                <Text style={styles.thirdPartyLabel}>Apple</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.disclaimer}>
          本应用使用 AI 生成效果图仅供设计参考，不作为施工依据
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function HistoryList() {
  const router = useRouter();
  const { projects, deleteProject } = useProjects();
  const { user, logout } = useAuth();
  const { isPro, subscription } = useSubscription();

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("删除方案", "确定要删除这个改造方案吗？此操作不可撤销。", [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => deleteProject(id),
        },
      ]);
    },
    [deleteProject]
  );

  const handleLogout = useCallback(() => {
    Alert.alert("退出登录", "确定要退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "退出",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  }, [logout]);

  const renderItem = useCallback(
    ({ item }: { item: Project }) => {
      const style = RENOVATION_STYLES.find((s) => s.id === item.styleId);

      return (
        <Pressable
          style={styles.card}
          onPress={() =>
            item.status === "completed"
              ? router.push({
                  pathname: "/result",
                  params: { projectId: item.id },
                })
              : undefined
          }
        >
          <View style={styles.cardTop}>
            <Image
              source={{ uri: item.originalPhoto }}
              style={styles.originalImage}
              contentFit="cover"
            />
            {item.generatedPhoto ? (
              <Image
                source={{
                  uri: `data:image/png;base64,${item.generatedPhoto}`,
                }}
                style={styles.generatedImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {item.status === "generating" ? "生成中..." : "未生成"}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "completed" && styles.statusBadgeCompleted,
                    item.status === "failed" && styles.statusBadgeFailed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === "completed" &&
                        styles.statusBadgeTextCompleted,
                      item.status === "failed" &&
                        styles.statusBadgeTextFailed,
                    ]}
                  >
                    {item.status === "completed"
                      ? "已完成"
                      : item.status === "generating"
                        ? "生成中"
                        : item.status === "failed"
                          ? "失败"
                          : "草稿"}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardStyle}>
                {style?.name ?? "未知"} · {style?.nameEn ?? ""}
              </Text>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Clock size={12} color={Colors.textTertiary} />
                <Text style={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                {item.estimatedCost && (
                  <Text style={styles.cardCost}>
                    {formatCurrency(item.estimatedCost)}
                  </Text>
                )}
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                  hitSlop={8}
                >
                  <Trash2 size={16} color={Colors.error} />
                </Pressable>
                {item.status === "completed" && (
                  <ChevronRight size={16} color={Colors.textTertiary} />
                )}
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [handleDelete, router]
  );

  const roleLabel = user?.role === "designer" ? "设计师" : "业主";

  return (
    <View style={styles.historyContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <User size={22} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profilePhone}>{user?.phone ?? ""}</Text>
            <View style={styles.profileRoleBadge}>
              <Text style={styles.profileRoleText}>{roleLabel}</Text>
            </View>
          </View>
          <Pressable style={styles.logoutButton} onPress={handleLogout} hitSlop={8}>
            <LogOut size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.subscriptionCard}
        onPress={() => router.push("/subscription")}
      >
        <View style={styles.subscriptionLeft}>
          <View style={[styles.subscriptionIcon, isPro && styles.subscriptionIconPro]}>
            <Crown size={16} color={isPro ? "#D4A76A" : Colors.textTertiary} />
          </View>
          <View>
            <Text style={styles.subscriptionTitle}>
              {isPro ? "专业版会员" : "基础版"}
            </Text>
            <Text style={styles.subscriptionDesc}>
              {isPro
                ? `到期：${subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString("zh-CN") : ""}`
                : "升级解锁全部功能"}
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color={isPro ? "#D4A76A" : Colors.textTertiary} />
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>方案库</Text>
        <Text style={styles.sectionCount}>{projects.length} 个方案</Text>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <FolderOpen size={36} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>暂无方案</Text>
          <Text style={styles.emptySubtitle}>
            前往「创建」标签页开始您的第一个改造方案
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isLoggedIn ? <HistoryList /> : <LoginSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loginContainer: {
    flex: 1,
  },
  loginScroll: {
    paddingHorizontal: 20,
  },
  loginHero: {
    height: 180,
    marginHorizontal: -20,
    marginBottom: -20,
    overflow: "hidden",
  },
  loginHeroImage: {
    width: "100%",
    height: "100%",
  },
  loginHeroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "80%",
  },
  loginHeroContent: {
    position: "absolute",
    bottom: 28,
    left: 24,
    right: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  loginHeroTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  loginHeroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "rgba(28,28,30,0.1)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  inputGroup: {
    gap: 12,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  inputPrefix: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  inputDivider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: "100%",
  },
  codeInput: {
    marginRight: 6,
  },
  sendCodeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.accentMuted,
  },
  sendCodeButtonDisabled: {
    backgroundColor: Colors.surfaceElevated,
  },
  sendCodeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  sendCodeTextDisabled: {
    color: Colors.textTertiary,
  },
  roleSection: {
    marginBottom: 14,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  roleCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  roleTextActive: {
    color: Colors.accent,
  },
  roleCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  termsLink: {
    color: Colors.accent,
    fontWeight: "500" as const,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.accentLight,
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  thirdPartySection: {
    marginTop: 20,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  thirdPartyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 36,
  },
  thirdPartyButton: {
    alignItems: "center",
    gap: 4,
  },
  thirdPartyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  thirdPartyIconText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  thirdPartyLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 14,
    paddingHorizontal: 16,
  },

  historyContainer: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profilePhone: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  profileRoleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.accentMuted,
    marginTop: 4,
  },
  profileRoleText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    height: 140,
  },
  originalImage: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  generatedImage: {
    flex: 1,
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
  },
  statusBadgeCompleted: {
    backgroundColor: Colors.sageMuted,
  },
  statusBadgeFailed: {
    backgroundColor: Colors.errorMuted,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  statusBadgeTextCompleted: {
    color: Colors.sage,
  },
  statusBadgeTextFailed: {
    color: Colors.error,
  },
  cardStyle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  cardCost: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
    lineHeight: 18,
  },
  subscriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  subscriptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  subscriptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  subscriptionIconPro: {
    backgroundColor: "rgba(212,167,106,0.12)",
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  subscriptionDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
