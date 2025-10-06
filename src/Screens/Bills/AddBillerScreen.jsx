import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radii } from '../../DesignSystem/theme';
import { BILLER_CATEGORIES, BILLERS, POPULAR_BILLERS } from '../../Data/billers';

const AddBillerScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return BILLERS;
    return BILLERS.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const onSelectBiller = (billerId) => navigation.navigate('LinkBiller', { billerId });

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>Add a Bill</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.search}
          placeholder="Search for a company"
          placeholderTextColor={colors.mutedText}
          value={query}
          onChangeText={setQuery}
        />

        <Text style={styles.section}>Popular Billers</Text>
        <View style={styles.popularRow}>
          {POPULAR_BILLERS.map(id => {
            const b = BILLERS.find(x => x.id === id);
            return (
              <TouchableOpacity key={id} style={styles.popularItem} onPress={() => onSelectBiller(id)}>
                <Text style={styles.popularText}>{b?.shortName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.section, { marginTop: spacing.xl }]}>Browse by Category</Text>
        {BILLER_CATEGORIES.map(cat => (
          <TouchableOpacity key={cat.id} style={styles.categoryRow} onPress={() => {}}>
            <Text style={styles.categoryText}>{cat.name}</Text>
            <Text style={styles.categoryArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.section, { marginTop: spacing.xl }]}>All Billers</Text>
        {filtered.map(b => (
          <TouchableOpacity key={b.id} style={styles.categoryRow} onPress={() => onSelectBiller(b.id)}>
            <Text style={styles.categoryText}>{b.name}</Text>
            <Text style={styles.categoryArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxl, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1 },
  headerText: { fontSize: typography.heading1, color: colors.text, fontFamily: typography.headingFamily },
  content: { padding: spacing.xl },
  search: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  section: { color: colors.mutedText, fontSize: typography.small, marginBottom: spacing.sm },
  popularRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  popularItem: { backgroundColor: colors.white, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  popularText: { color: colors.text },
  categoryRow: { backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryText: { color: colors.text },
  categoryArrow: { color: colors.mutedText, fontSize: typography.body },
});

export default AddBillerScreen;

