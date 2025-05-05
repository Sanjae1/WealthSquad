import  React from "react"
import { View, Text, StyleSheet } from "react-native"

export const Card: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
)

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.cardHeader}>{children}</View>
)

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.cardTitle}>{children}</Text>
)

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.cardContent}>{children}</View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardContent: {
    // Add any specific styles for card content if needed
  },
})

