import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from "react-native";
import { Mail, ShieldCheck, Database, Image as ImageIcon } from "lucide-react-native";
import Colors from "@/constants/colors";

const SUPPORT_EMAIL = "81382377@qq.com";

export default function LegalScreen() {
  const contactSupport = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("空间焕新 App 使用反馈")}`;
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert("联系我们", SUPPORT_EMAIL);
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}><ShieldCheck size={30} color={Colors.accent} /><Text style={styles.title}>隐私政策与技术支持</Text><Text style={styles.updated}>更新日期：2026 年 11 月 13 日</Text></View>
      <View style={styles.card}><View style={styles.cardTitleRow}><ImageIcon size={18} color={Colors.accent} /><Text style={styles.cardTitle}>照片如何使用</Text></View><Text style={styles.body}>只有在您主动选择或拍摄照片时，App 才会访问该照片。照片会发送到 AI 图片处理服务以生成改造创意参考图，不会用于广告或出售给第三方。请勿上传包含身份证件、联系方式或其他敏感个人信息的图片。</Text></View>
      <View style={styles.card}><View style={styles.cardTitleRow}><Database size={18} color={Colors.accent} /><Text style={styles.cardTitle}>本地数据</Text></View><Text style={styles.body}>生成的方案和相关图片保存在当前设备。App 当前不提供账号、云同步或订阅功能。删除方案或卸载 App 后，相应本地数据将无法恢复。</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>AI 与费用声明</Text><Text style={styles.body}>效果图由 AI 生成，仅作为空间设计灵感参考，不构成施工图纸、工程建议或报价。页面中的费用为基于默认面积和风格参数的估算，实际费用应以专业人员现场评估为准。</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>权限与第三方服务</Text><Text style={styles.body}>相册权限用于选择照片，相机权限用于拍摄空间。除完成图片生成所必需的网络传输外，App 不主动收集姓名、手机号、精确位置或通讯录。网络服务提供商可能为保障安全和稳定性处理必要的请求日志。</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>联系我们</Text><Text style={styles.body}>如果您对隐私、数据处理或产品使用有疑问，请通过以下邮箱联系我们。我们会在合理时间内处理反馈。</Text><Pressable style={styles.contactButton} onPress={contactSupport}><Mail size={18} color="#fff" /><Text style={styles.contactText}>{SUPPORT_EMAIL}</Text></Pressable></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, content: { padding: 20, paddingBottom: 48, gap: 14 },
  hero: { alignItems: "center", paddingVertical: 14 }, title: { marginTop: 10, fontSize: 22, fontWeight: "800", color: Colors.textPrimary }, updated: { marginTop: 6, fontSize: 12, color: Colors.textTertiary },
  card: { padding: 18, borderRadius: 16, backgroundColor: Colors.surface }, cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 }, cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary }, body: { marginTop: 10, fontSize: 14, lineHeight: 22, color: Colors.textSecondary },
  contactButton: { marginTop: 16, minHeight: 46, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.accent }, contactText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
