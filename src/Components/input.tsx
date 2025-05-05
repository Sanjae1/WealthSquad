import  React from "react"
import { TextInput, StyleSheet } from "react-native"

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: "default" | "numeric" | "email-address"
  style?: object
}

export const Input: React.FC<InputProps> = ({ value, onChangeText, placeholder, keyboardType = "default", style }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
})

