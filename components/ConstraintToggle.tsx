import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Shield, ShieldOff } from "lucide-react-native";
import Colors from "@/constants/colors";
import { EngineeringConstraint } from "@/types";

interface ConstraintToggleProps {
  constraint: EngineeringConstraint;
  onToggle: (id: string) => void;
}

function ConstraintToggleComponent({
  constraint,
  onToggle,
}: ConstraintToggleProps) {
  const slideAnim = useRef(new Animated.Value(constraint.enabled ? 1 : 0)).current;

  const handleToggle = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: constraint.enabled ? 0 : 1,
      friction: 8,
      useNativeDriver: false,
    }).start();
    onToggle(constraint.id);
  }, [constraint.enabled, constraint.id, onToggle, slideAnim]);

  const trackColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.borderLight, Colors.sage],
  });

  const thumbTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <Pressable onPress={handleToggle} style={styles.container}>
      <View style={styles.info}>
        {constraint.enabled ? (
          <Shield size={16} color={Colors.sage} />
        ) : (
          <ShieldOff size={16} color={Colors.textTertiary} />
        )}
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.label,
              !constraint.enabled && styles.labelDisabled,
            ]}
          >
            {constraint.label}
          </Text>
          <Text style={styles.description}>{constraint.description}</Text>
        </View>
      </View>
      <Animated.View
        style={[styles.track, { backgroundColor: trackColor }]}
      >
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: thumbTranslate }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export const ConstraintToggle = React.memo(ConstraintToggleComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  info: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 10,
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  labelDisabled: {
    color: Colors.textTertiary,
  },
  description: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
