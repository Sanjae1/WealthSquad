import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';

const GroceryCalculator = () => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1'); // Default to 1
  const [items, setItems] = useState([]);

  // Calculate total whenever items change
  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleAddItem = () => {
    Keyboard.dismiss(); // Dismiss keyboard

    const price = parseFloat(itemPrice);
    const quantity = parseInt(itemQuantity, 10);

    if (!itemName.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive price.');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive quantity.');
      return;
    }

    const newItem = {
      id: Date.now().toString(), // Simple unique ID
      name: itemName.trim(),
      price: price,
      quantity: quantity,
    };

    setItems(prevItems => [...prevItems, newItem]);

    // Clear inputs
    setItemName('');
    setItemPrice('');
    setItemQuantity('1');
  };

  const handleRemoveItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      "Confirm Clear",
      "Are you sure you want to clear all items?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", onPress: () => setItems([]), style: "destructive" }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name} ({item.quantity}x)</Text>
        <Text style={styles.itemPrice}>
          ${item.price.toFixed(2)} each = ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grocery Calculator</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Item Name"
          value={itemName}
          onChangeText={setItemName}
        />
        <View style={styles.priceQuantityRow}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Price ($)"
            value={itemPrice}
            onChangeText={setItemPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.quantityInput]}
            placeholder="Qty"
            value={itemQuantity}
            onChangeText={setItemQuantity}
            keyboardType="numeric"
          />
        </View>
        <Button title="Add Item" onPress={handleAddItem} color="#007AFF" />
      </View>

      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyListText}>No items added yet. Start adding!</Text>
      )}


      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.totalText}>Total: ${totalCost.toFixed(2)}</Text>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 0.6, // Takes 60% of the row
    marginRight: 10,
  },
  quantityInput: {
    flex: 0.35, // Takes 35% of the row
  },
  list: {
    flex: 1, // Allows list to grow
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FF3B30', // iOS red
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 13,
  },
  summaryContainer: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
    color: '#2c3e50',
  },
  clearAllButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#777',
  },
});

export default GroceryCalculator;