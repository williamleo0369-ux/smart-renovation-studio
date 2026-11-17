import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Trash2, Clock, ChevronRight, FolderOpen, ShieldCheck } from "lucide-react-native";
import Colors from "@/constants/colors";
import { RENOVATION_STYLES } from "@/constants/styles";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types";
import { formatCurrency } from "@/utils/prompt";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { projects, deleteProject } = useProjects();
  const handleDelete = useCallback((id: string) => {
    Alert.alert("删除方案", "确定删除这个保存在本机的方案吗？", [
      { text: "取消", style: "cancel" },
      { text: "删除", style: "destructive", onPress: () => deleteProject(id) },
    ]);
  }, [deleteProject]);
  const renderItem = useCallback(({ item }: { item: Project }) => {
    const style = RENOVATION_STYLES.find((candidate) => candidate.id === item.styleId);
    return (
      <Pressable style={styles.card} onPress={() => item.generatedPhoto && router.push({ pathname: "/result", params: { projectId: item.id } })}>
        <View style={styles.images}>
          <Image source={{ uri: item.originalPhoto }} style={styles.image} contentFit="cover" />
          {item.generatedPhoto ? <Image source={{ uri: `data:image/png;base64,${item.generatedPhoto}` }} style={styles.image} contentFit="cover" /> : <View style={[styles.image, styles.imagePlaceholder]}><Text style={styles.placeholderText}>暂无效果图</Text></View>}
        </View>
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}><Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text><Text style={styles.cardStyle}>{style?.name ?? "未指定风格"}</Text></View>
            <Pressable onPress={() => handleDelete(item.id)} hitSlop={10} accessibilityLabel="删除方案"><Trash2 size={18} color={Colors.error} /></Pressable>
          </View>
          <View style={styles.metaRow}><Clock size={13} color={Colors.textTertiary} /><Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString("zh-CN")}</Text>{item.estimatedCost ? <Text style={styles.cost}>{formatCurrency(item.estimatedCost)}</Text> : null}{item.generatedPhoto ? <ChevronRight size={16} color={Colors.textTertiary} /> : null}</View>
        </View>
      </Pressable>
    );
  }, [handleDelete, router]);
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View><Text style={styles.title}>方案库</Text><Text style={styles.subtitle}>方案仅保存在当前设备，可随时查看或删除</Text></View>
          <Pressable style={styles.legalButton} onPress={() => router.push("/legal" as never)} accessibilityLabel="隐私与支持">
            <ShieldCheck size={20} color={Colors.accent} />
          </Pressable>
        </View>
      </View>
      {projects.length === 0 ? (
        <View style={styles.empty}><View style={styles.emptyIcon}><FolderOpen size={38} color={Colors.textTertiary} /></View><Text style={styles.emptyTitle}>还没有改造方案</Text><Text style={styles.emptyText}>前往「创建」上传空间照片并生成第一个方案</Text><Pressable style={styles.createButton} onPress={() => router.push("/create")}><Text style={styles.createButtonText}>创建方案</Text></Pressable></View>
      ) : <FlatList data={projects} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  legalButton: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
  title: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary }, subtitle: { marginTop: 6, fontSize: 13, color: Colors.textSecondary },
  list: { paddingHorizontal: 20, paddingBottom: 110, gap: 16 }, card: { backgroundColor: Colors.surface, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  images: { flexDirection: "row", gap: 2, height: 145 }, image: { flex: 1, height: "100%", backgroundColor: Colors.primaryLight }, imagePlaceholder: { alignItems: "center", justifyContent: "center" }, placeholderText: { fontSize: 12, color: Colors.textTertiary },
  cardBody: { padding: 15 }, titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, titleBlock: { flex: 1 }, cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary }, cardStyle: { marginTop: 3, fontSize: 12, color: Colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }, metaText: { fontSize: 12, color: Colors.textTertiary }, cost: { marginLeft: "auto", fontSize: 13, fontWeight: "600", color: Colors.accent },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36, paddingBottom: 80 }, emptyIcon: { width: 76, height: 76, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceElevated }, emptyTitle: { marginTop: 20, fontSize: 19, fontWeight: "700", color: Colors.textPrimary }, emptyText: { marginTop: 8, fontSize: 14, lineHeight: 21, textAlign: "center", color: Colors.textSecondary }, createButton: { marginTop: 22, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.accent }, createButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
