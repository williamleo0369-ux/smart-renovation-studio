import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Paintbrush,
  Check,
  ChevronRight,
} from "lucide-react-native";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { useRouter } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_HEIGHT * 0.38;

const PHONE_REGEX = /^1[3-9]\d{9}$/;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("homeowner");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const phoneInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroOpacity, fadeAnim, slideAnim]);

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
    router.replace("/(tabs)/(home)");
  }, [phone, code, agreedToTerms, selectedRole, login, router, buttonScale]);

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
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View style={[styles.heroSection, { opacity: heroOpacity }]}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
          }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(28,28,30,0.3)", "rgba(250,250,247,0.95)", Colors.background]}
          locations={[0, 0.4, 0.75, 1]}
          style={styles.heroGradient}
        />
        <View style={[styles.heroContent, { paddingTop: insets.top + 16 }]}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Sparkles size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>空间焕新</Text>
          </View>
          <Text style={styles.heroTagline}>AI 智能空间焕新</Text>
          <Text style={styles.heroSubtitle}>一键生成专业改造效果图</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formWrapper}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.formTitle}>登录 / 注册</Text>
            <Text style={styles.formSubtitle}>
              首次登录将自动创建账户
            </Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconBox}>
                  <Phone size={18} color={Colors.accent} />
                </View>
                <Text style={styles.inputPrefix}>+86</Text>
                <View style={styles.inputDivider} />
                <TextInput
                  ref={phoneInputRef}
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
                  <ShieldCheck size={18} color={Colors.accent} />
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
                    size={20}
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
                      <Check size={12} color="#FFFFFF" />
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
                    size={20}
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
                      <Check size={12} color="#FFFFFF" />
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
                {agreedToTerms && <Check size={12} color="#FFFFFF" />}
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
                    <ChevronRight size={18} color="#FFFFFF" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    height: HERO_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  heroContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroTagline: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  formWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HERO_HEIGHT - 40,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: "rgba(28,28,30,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 14,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  inputDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    height: "100%",
  },
  codeInput: {
    marginRight: 8,
  },
  sendCodeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.accentMuted,
  },
  sendCodeButtonDisabled: {
    backgroundColor: Colors.surfaceElevated,
  },
  sendCodeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  sendCodeTextDisabled: {
    color: Colors.textTertiary,
  },
  roleSection: {
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  roleCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  roleTextActive: {
    color: Colors.accent,
  },
  roleCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
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
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.accent,
    fontWeight: "500" as const,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.accent,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.accentLight,
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  thirdPartySection: {
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  thirdPartyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },
  thirdPartyButton: {
    alignItems: "center",
    gap: 6,
  },
  thirdPartyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  thirdPartyIconText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  thirdPartyLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
