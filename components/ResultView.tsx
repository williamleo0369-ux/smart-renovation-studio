import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import {
  Download,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  Info,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { RENOVATION_STYLES } from "@/constants/styles";
import { formatCurrency } from "@/utils/prompt";

interface ResultViewProps {
  originalPhoto: string;
  generatedPhoto: string;
  styleId: string;
  estimatedCost: number;
  costRange: [number, number];
}

function ResultViewComponent({
  originalPhoto,
  generatedPhoto,
  styleId,
  estimatedCost,
  costRange,
}: ResultViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const style = RENOVATION_STYLES.find((s) => s.id === styleId);

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
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBooking = () => {
    Alert.alert(
      "预约成功",
      "我们的设计顾问将在24小时内与您联系，为您安排免费上门量房设计服务。",
      [{ text: "好的" }]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.comparisonContainer}>
          <View style={styles.imageCard}>
            <Image
              source={{ uri: originalPhoto }}
              style={styles.comparisonImage}
              contentFit="cover"
            />
            <View style={styles.imageLabel}>
              <Text style={styles.imageLabelText}>改造前</Text>
            </View>
          </View>
          <View style={styles.imageCard}>
            <Image
              source={{ uri: `data:image/png;base64,${generatedPhoto}` }}
              style={styles.comparisonImage}
              contentFit="cover"
            />
            <View style={[styles.imageLabel, styles.imageLabelAfter]}>
              <Text style={styles.imageLabelText}>改造后</Text>
            </View>
          </View>
        </View>

        {style && (
          <View style={styles.styleInfo}>
            <Text style={styles.styleTag}>{style.name}</Text>
            <Text style={styles.styleName}>{style.nameEn}</Text>
          </View>
        )}

        <View style={styles.costCard}>
          <View style={styles.costHeader}>
            <TrendingUp size={18} color={Colors.accent} />
            <Text style={styles.costTitle}>动态预估费用</Text>
          </View>
          <Text style={styles.costAmount}>{formatCurrency(estimatedCost)}</Text>
          <Text style={styles.costRange}>
            预估范围：{formatCurrency(costRange[0])} -{" "}
            {formatCurrency(costRange[1])}
          </Text>
          <View style={styles.costNote}>
            <Info size={12} color={Colors.textTertiary} />
            <Text style={styles.costNoteText}>
              基于80㎡标准面积估算，实际费用以现场量房为准
            </Text>
          </View>
        </View>

        <Pressable style={styles.ctaButton} onPress={handleBooking}>
          <CalendarCheck size={20} color="#fff" />
          <Text style={styles.ctaText}>预约免费上门设计</Text>
          <ArrowRight size={18} color="#fff" />
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            Alert.alert("提示", "效果图已保存到方案库")
          }
        >
          <Download size={18} color={Colors.accent} />
          <Text style={styles.secondaryText}>保存到方案库</Text>
        </Pressable>

        <View style={styles.disclaimer}>
          <Info size={14} color={Colors.textTertiary} />
          <Text style={styles.disclaimerText}>
            AI 免责声明：本效果图由 AI 生成，仅供创意灵感参考，不构成施工图纸。实际装修效果可能因材料、光照、施工工艺等因素存在差异。建议以专业设计师现场方案为准。
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

export const ResultView = React.memo(ResultViewComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {},
  comparisonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  imageCard: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors.primaryLight,
  },
  comparisonImage: {
    width: "100%",
    height: 200,
  },
  imageLabel: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  imageLabelAfter: {
    backgroundColor: Colors.accent,
  },
  imageLabelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  styleInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  styleTag: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  styleName: {
    fontSize: 13,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    marginTop: 2,
  },
  costCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  costHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  costTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  costAmount: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  costRange: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  costNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  costNoteText: {
    fontSize: 11,
    color: Colors.textTertiary,
    flex: 1,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    marginBottom: 24,
  },
  secondaryText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: "600" as const,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 17,
  },
});
