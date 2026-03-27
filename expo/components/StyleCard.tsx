import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { RenovationStyle } from "@/types";

interface StyleCardProps {
  style: RenovationStyle;
  selected: boolean;
  onSelect: (id: string) => void;
}

function StyleCardComponent({ style, selected, onSelect }: StyleCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => onSelect(style.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, selected && styles.cardSelected]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: style.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          {selected && (
            <View style={styles.checkBadge}>
              <Check size={14} color="#fff" strokeWidth={3} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{style.name}</Text>
          <Text style={styles.nameEn}>{style.nameEn}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {style.description}
          </Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>参考单价</Text>
            <Text style={styles.costValue}>
              ¥{style.costRange[0]}-{style.costRange[1]}/㎡
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const StyleCard = React.memo(StyleCardComponent);

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardSelected: {
    borderColor: Colors.accent,
  },
  imageContainer: {
    width: "100%",
    height: 130,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  nameEn: {
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  costLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  costValue: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
});
