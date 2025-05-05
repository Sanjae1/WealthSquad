import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '80%',
        marginTop: 20,
    }
});

const BankLoginScreen = () => {
    const navigation = useNavigation();
    const route = useRoute(); // Get route object to access parameters

    // Get the parameters passed from SelectBankScreen
    const { bankId, bankName } = route.params;

    // Mock function to simulate the linking process
    const handleConnect = () => {
        console.log(`Simulating connection to ${bankName} (ID: ${bankId})...`);
        // ---- TODO ----
        // In the next step, this is where we will:
        // 1. Get the current Supabase user ID.
        // 2. Find the mock bank account(s) for `bankId`.
        // 3. Call Supabase to create entries in the `user_linked_accounts` table.
        // 4. Handle success/failure.
        // ---------------

        // For now, just show an alert and navigate back home
        Alert.alert(
            "Connection Successful (Mock)",
            `You have successfully linked your ${bankName} account.`,
            [
                { text: "OK", onPress: () => navigation.navigate('Home') } // Navigate back to Home
                // Or maybe pop to top if the stack gets deeper: navigation.popToTop()
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connect to {bankName}</Text>
            <Text style={styles.message}>
                You would normally see a secure login prompt here. For this demo, just click "Connect".
            </Text>
            <View style={styles.buttonContainer}>
                <Button
                    title={`Connect ${bankName}`}
                    onPress={handleConnect}
                />
            </View>
             <View style={styles.buttonContainer}>
                 <Button title="Cancel" onPress={() => navigation.goBack()} />
            </View>
        </View>
    );
};

export default BankLoginScreen;