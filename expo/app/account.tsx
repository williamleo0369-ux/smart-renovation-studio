import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CircleUserRound, LogIn, LogOut, ShieldCheck, WalletCards } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";

export default function AccountScreen() {
  const router = useRouter();
  const { user, isReady, logout } = useAuth();
  const confirmLogout = () => Alert.alert("退出登录", "退出后，本机已有方案不会被删除。", [
    { text: "取消", style: "cancel" },
    { text: "退出", style: "destructive", onPress: async () => { await logout(); router.replace('/login'); } },
  ]);
  return <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.profile}><CircleUserRound size={52} color={Colors.accent} /><Text style={styles.name}>{!isReady ? "正在读取账户…" : user?.displayName ?? "尚未登录"}</Text><Text style={styles.meta}>{user ? `${user.role === 'designer' ? '设计师' : '业主'} · 通过 Apple 登录` : "登录后可保存身份偏好"}</Text>{user?.email ? <Text style={styles.email}>{user.email}</Text> : null}</View>
    {user ? <Pressable style={styles.action} onPress={confirmLogout}><LogOut size={19} color={Colors.error} /><Text style={[styles.actionText,{color:Colors.error}]}>退出登录</Text></Pressable> : <Pressable style={styles.primary} onPress={() => router.push('/login')}><LogIn size={19} color="#fff" /><Text style={styles.primaryText}>登录 / 注册</Text></Pressable>}
    <View style={styles.planCard}><View style={styles.planHeader}><View style={styles.planIcon}><WalletCards size={20} color={Colors.accent} /></View><View style={styles.planCopy}><Text style={styles.planLabel}>当前方案</Text><Text style={styles.planName}>免费版 · 无自动续费</Text></View></View><Text style={styles.planBody}>当前版本没有付费订阅，图片生成、风格浏览和本机方案记录均无需购买。未来如提供付费功能，会在付款前明确说明价格、周期与取消方式。</Text></View>
    <Pressable style={styles.action} onPress={() => router.push('/legal')}><ShieldCheck size={19} color={Colors.accent} /><Text style={styles.actionText}>用户协议、隐私与支持</Text></Pressable>
    <Text style={styles.note}>退出登录不会删除保存在本机的改造方案。</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:Colors.background},content:{padding:20,paddingBottom:40},profile:{alignItems:'center',padding:28,borderRadius:20,backgroundColor:Colors.surface,marginBottom:18},name:{marginTop:12,fontSize:21,fontWeight:'800',color:Colors.textPrimary},meta:{marginTop:6,fontSize:13,color:Colors.textSecondary},email:{marginTop:5,fontSize:12,color:Colors.textTertiary},primary:{height:52,borderRadius:14,backgroundColor:Colors.accent,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginBottom:12},primaryText:{fontSize:15,fontWeight:'700',color:'#fff'},action:{minHeight:52,borderRadius:14,paddingHorizontal:16,backgroundColor:Colors.surface,flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},actionText:{fontSize:15,fontWeight:'600',color:Colors.textPrimary},planCard:{padding:18,borderRadius:17,backgroundColor:Colors.surface,marginBottom:12,borderWidth:1,borderColor:Colors.borderLight},planHeader:{flexDirection:'row',alignItems:'center'},planIcon:{width:42,height:42,borderRadius:13,backgroundColor:Colors.accentMuted,alignItems:'center',justifyContent:'center'},planCopy:{marginLeft:11},planLabel:{fontSize:12,color:Colors.textTertiary},planName:{fontSize:16,fontWeight:'800',color:Colors.textPrimary,marginTop:2},planBody:{fontSize:13,lineHeight:20,color:Colors.textSecondary,marginTop:13},note:{fontSize:12,lineHeight:19,textAlign:'center',color:Colors.textTertiary,marginTop:4}});
