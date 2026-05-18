import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView } from 'react-native';
import { ArrowLeft, Search, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ALL_BILLERS, MyColours } from '../Data/billers';

const AddBillerScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBillers = ALL_BILLERS.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.shortName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = (biller) => {
        Alert.alert('Add Biller', `Would you like to add ${biller.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Biller</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.searchBar}>
                <Search size={20} color="#757575" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search billers (JPS, Flow, NWC...)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <ScrollView style={styles.content}>
                {filteredBillers.map(biller => (
                    <TouchableOpacity
                        key={biller.id}
                        style={styles.billerCard}
                        onPress={() => handleAdd(biller)}
                    >
                        <View style={[styles.iconBg, { backgroundColor: (biller.brandColor || '#53b175') + '15' }]}>
                             <Plus size={20} color={biller.brandColor || '#53b175'} />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{biller.name}</Text>
                            <Text style={styles.category}>{biller.category}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    backButton: { padding: 8, borderRadius: 12, backgroundColor: '#fff' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    content: { paddingHorizontal: 16 },
    billerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0' },
    iconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '700', color: '#333' },
    category: { fontSize: 12, color: '#757575', textTransform: 'capitalize' },
});

export default AddBillerScreen;
