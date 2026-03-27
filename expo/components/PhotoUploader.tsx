import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Camera, ImagePlus, X } from "lucide-react-native";
import Colors from "@/constants/colors";

interface PhotoUploaderProps {
  photo: string | null;
  onPhotoSelected: (uri: string, base64: string) => void;
  onPhotoClear: () => void;
}

function PhotoUploaderComponent({
  photo,
  onPhotoSelected,
  onPhotoClear,
}: PhotoUploaderProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [compressing, setCompressing] = React.useState(false);

  const compressImage = useCallback(async (uri: string): Promise<{ uri: string; base64: string }> => {
    try {
      console.log("Compressing image from:", uri);
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      console.log("Compressed image base64 length:", manipulated.base64?.length ?? 0);
      return { uri: manipulated.uri, base64: manipulated.base64 ?? "" };
    } catch (error) {
      console.error("Image compression failed, falling back to original:", error);
      return { uri, base64: "" };
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log("Image picked:", asset.uri, "width:", asset.width, "height:", asset.height);
        setCompressing(true);
        try {
          const compressed = await compressImage(asset.uri);
          if (compressed.base64) {
            onPhotoSelected(compressed.uri, compressed.base64);
          } else {
            console.error("Failed to get base64 from compressed image");
          }
        } finally {
          setCompressing(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setCompressing(false);
    }
  }, [onPhotoSelected, compressImage]);

  const takePhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        console.log("Camera permission denied");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log("Photo taken:", asset.uri, "width:", asset.width, "height:", asset.height);
        setCompressing(true);
        try {
          const compressed = await compressImage(asset.uri);
          if (compressed.base64) {
            onPhotoSelected(compressed.uri, compressed.base64);
          } else {
            console.error("Failed to get base64 from compressed image");
          }
        } finally {
          setCompressing(false);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      setCompressing(false);
    }
  }, [onPhotoSelected, compressImage]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  if (compressing) {
    return (
      <View style={[styles.uploadArea, styles.compressingArea]}>
        <ActivityIndicator size="small" color={Colors.accent} />
        <Text style={styles.compressingText}>正在优化图片...</Text>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: photo }}
          style={styles.previewImage}
          contentFit="cover"
          transition={300}
        />
        <Pressable style={styles.clearButton} onPress={onPhotoClear}>
          <X size={16} color="#fff" />
        </Pressable>
        <View style={styles.previewOverlay}>
          <Text style={styles.previewText}>原始空间照片</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={pickImage}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.uploadArea}
      >
        <View style={styles.iconCircle}>
          <ImagePlus size={28} color={Colors.accent} />
        </View>
        <Text style={styles.uploadTitle}>上传房屋照片</Text>
        <Text style={styles.uploadSubtitle}>
          支持 JPG、PNG 格式，建议横向拍摄
        </Text>
        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={pickImage}>
            <ImagePlus size={16} color={Colors.accent} />
            <Text style={styles.actionText}>从相册选择</Text>
          </Pressable>
          {Platform.OS !== "web" && (
            <Pressable style={styles.actionButton} onPress={takePhoto}>
              <Camera size={16} color={Colors.accent} />
              <Text style={styles.actionText}>拍摄照片</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const PhotoUploader = React.memo(PhotoUploaderComponent);

const styles = StyleSheet.create({
  uploadArea: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.accentMuted,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  previewContainer: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors.primaryLight,
  },
  previewImage: {
    width: "100%",
    height: 220,
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  previewText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500" as const,
  },
  compressingArea: {
    borderStyle: "solid" as const,
    flexDirection: "row" as const,
    gap: 10,
  },
  compressingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
