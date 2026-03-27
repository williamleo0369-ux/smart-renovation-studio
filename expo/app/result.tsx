import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/colors";
import { useProjects } from "@/hooks/useProjects";
import { ResultView } from "@/components/ResultView";

export default function ResultScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { getProject } = useProjects();

  const project = projectId ? getProject(projectId) : undefined;

  if (!project) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: "方案详情" }} />
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: project.title,
          headerTintColor: Colors.textPrimary,
          headerStyle: { backgroundColor: Colors.background },
        }}
      />
      {project.generatedPhoto ? (
        <ResultView
          originalPhoto={project.originalPhoto}
          generatedPhoto={project.generatedPhoto}
          styleId={project.styleId}
          estimatedCost={project.estimatedCost ?? 0}
          costRange={project.costRange ?? [0, 0]}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>效果图尚未生成</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
