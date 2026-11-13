import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CircleUserRound, LogIn, LogOut, ShieldCheck } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";

export default function AccountScreen() {
  const router = useRouter();
  const { user, isReady, logout } = useAuth();
  const confirmLogout = () => Alert.alert("退出登录", "退出后，本机已有方案不会被删除。", [
    { text: "取消", style: "cancel" },
    { text: "退出", style: "destructive", onPress: async () => { await logout(); router.replace('/login'); } },
  ]);
  return <View style={styles.container}>
    <View style={styles.profile}><CircleUserRound size={52} color={Colors.accent} /><Text style={styles.name}>{!isReady ? "正在读取账户…" : user?.displayName ?? "尚未登录"}</Text><Text style={styles.meta}>{user ? `${user.role === 'designer' ? '设计师' : '业主'} · 通过 Apple 登录` : "登录后可保存身份偏好"}</Text>{user?.email ? <Text style={styles.email}>{user.email}</Text> : null}</View>
    {user ? <Pressable style={styles.action} onPress={confirmLogout}><LogOut size={19} color={Colors.error} /><Text style={[styles.actionText,{color:Colors.error}]}>退出登录</Text></Pressable> : <Pressable style={styles.primary} onPress={() => router.push('/login')}><LogIn size={19} color="#fff" /><Text style={styles.primaryText}>登录 / 注册</Text></Pressable>}
    <Pressable style={styles.action} onPress={() => router.push('/legal')}><ShieldCheck size={19} color={Colors.accent} /><Text style={styles.actionText}>用户协议、隐私与支持</Text></Pressable>
    <Text style={styles.note}>退出登录不会删除保存在本机的改造方案。</Text>
  </View>;
}
const styles=StyleSheet.create({container:{flex:1,padding:20,backgroundColor:Colors.background},profile:{alignItems:'center',padding:28,borderRadius:20,backgroundColor:Colors.surface,marginBottom:18},name:{marginTop:12,fontSize:21,fontWeight:'800',color:Colors.textPrimary},meta:{marginTop:6,fontSize:13,color:Colors.textSecondary},email:{marginTop:5,fontSize:12,color:Colors.textTertiary},primary:{height:52,borderRadius:14,backgroundColor:Colors.accent,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginBottom:12},primaryText:{fontSize:15,fontWeight:'700',color:'#fff'},action:{minHeight:52,borderRadius:14,paddingHorizontal:16,backgroundColor:Colors.surface,flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},actionText:{fontSize:15,fontWeight:'600',color:Colors.textPrimary},note:{fontSize:12,lineHeight:19,textAlign:'center',color:Colors.textTertiary,marginTop:4}});
