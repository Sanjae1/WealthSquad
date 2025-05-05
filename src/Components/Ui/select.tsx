"use client"

import  React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, options, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <View>
      <TouchableOpacity style={styles.select} onPress={() => setModalVisible(true)}>
        <Text>{selectedOption ? selectedOption.label : placeholder || "Select an option"}</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onValueChange(item.value)
                  setModalVisible(false)
                }}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  )
}

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>
export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => <Text>{placeholder}</Text>
export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>
export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ children }) => (
  <Text>{children}</Text>
)

const styles = StyleSheet.create({
  select: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
})

