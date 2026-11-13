import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Check, Paintbrush, Sparkles, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signInWithApple } = useAuth();
  const [role, setRole] = useState<UserRole>("homeowner");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAppleLogin = async () => {
    if (!agreed) return Alert.alert("请先确认", "请阅读并同意用户协议与隐私政策。 ");
    try {
      setLoading(true);
      await signInWithApple(role);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/(home)");
    } catch (error) {
      if ((error as { code?: string }).code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("登录未完成", "Apple 登录暂时无法完成，请稍后再试。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} bounces={false}>
      <View style={styles.hero}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&q=85" }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient colors={["rgba(0,0,0,0.18)", "rgba(28,28,30,0.5)"]} style={StyleSheet.absoluteFill} />
        <View style={[styles.heroContent, { paddingTop: insets.top + 24 }]}>
          <View style={styles.logo}><Sparkles size={20} color="#fff" /><Text style={styles.logoText}>空间焕新</Text></View>
          <Text style={styles.heroTitle}>让每个空间，都值得期待</Text>
          <Text style={styles.heroSubtitle}>上传空间照片，生成专属改造灵感</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>登录 / 注册</Text>
        <Text style={styles.subtitle}>使用 Apple ID 安全登录，不会获取您的 Apple 密码</Text>
        <Text style={styles.label}>您的身份</Text>
        <View style={styles.roles}>
          {([['homeowner', '业主', User], ['designer', '设计师', Paintbrush]] as const).map(([value, label, Icon]) => {
            const active = role === value;
            return <Pressable key={value} style={[styles.role, active && styles.roleActive]} onPress={() => setRole(value)}><Icon size={20} color={active ? Colors.accent : Colors.textTertiary} /><Text style={[styles.roleText, active && styles.roleTextActive]}>{label}</Text>{active && <View style={styles.check}><Check size={11} color="#fff" /></View>}</Pressable>;
          })}
        </View>
        <Pressable style={styles.terms} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>{agreed && <Check size={12} color="#fff" />}</View>
          <Text style={styles.termsText}>我已阅读并同意 <Text style={styles.link} onPress={() => router.push('/legal')}>《用户协议与隐私政策》</Text></Text>
        </Pressable>
        {Platform.OS === "ios" ? <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN} buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK} cornerRadius={12} style={[styles.appleButton, (!agreed || loading) && styles.disabled]} onPress={handleAppleLogin} /> : null}
        {loading && <Text style={styles.loading}>正在安全登录…</Text>}
        <Pressable style={styles.skip} onPress={() => router.replace('/(tabs)/(home)')}><Text style={styles.skipText}>暂不登录，先体验</Text></Pressable>
        <Text style={styles.note}>登录用于保存您的身份偏好；改造方案仍只保存在当前设备。</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},hero:{height:320,overflow:'hidden'},heroContent:{flex:1,paddingHorizontal:24,justifyContent:'flex-end',paddingBottom:48},logo:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:18},logoText:{color:'#fff',fontSize:20,fontWeight:'800'},heroTitle:{color:'#fff',fontSize:28,fontWeight:'800',lineHeight:36},heroSubtitle:{color:'rgba(255,255,255,.86)',fontSize:15,marginTop:8},card:{marginTop:-24,marginHorizontal:18,padding:24,borderRadius:24,backgroundColor:Colors.surface,shadowColor:'#000',shadowOpacity:.1,shadowRadius:20,shadowOffset:{width:0,height:8}},title:{fontSize:23,fontWeight:'800',color:Colors.textPrimary},subtitle:{fontSize:13,lineHeight:20,color:Colors.textSecondary,marginTop:6,marginBottom:22},label:{fontSize:13,fontWeight:'600',color:Colors.textSecondary,marginBottom:10},roles:{flexDirection:'row',gap:12},role:{flex:1,height:56,borderRadius:14,borderWidth:1,borderColor:Colors.borderLight,backgroundColor:Colors.surfaceElevated,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},roleActive:{borderColor:Colors.accent,backgroundColor:Colors.accentMuted},roleText:{fontSize:15,fontWeight:'600',color:Colors.textSecondary},roleTextActive:{color:Colors.accent},check:{width:18,height:18,borderRadius:9,alignItems:'center',justifyContent:'center',backgroundColor:Colors.accent},terms:{flexDirection:'row',alignItems:'center',marginVertical:20},checkbox:{width:20,height:20,borderRadius:6,borderWidth:1,borderColor:Colors.border,alignItems:'center',justifyContent:'center',marginRight:9},checkboxActive:{borderColor:Colors.accent,backgroundColor:Colors.accent},termsText:{flex:1,fontSize:12,color:Colors.textSecondary},link:{color:Colors.accent,fontWeight:'600'},appleButton:{height:52,width:'100%'},disabled:{opacity:.45},loading:{textAlign:'center',marginTop:10,fontSize:13,color:Colors.textSecondary},skip:{alignItems:'center',paddingVertical:15},skipText:{fontSize:14,fontWeight:'600',color:Colors.accent},note:{fontSize:11,lineHeight:17,textAlign:'center',color:Colors.textTertiary},
});
