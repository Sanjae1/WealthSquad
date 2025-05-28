import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList, // Use FlatList
  ActivityIndicator,
  Image, // For author avatar
  Platform,
  ScrollView, // For categories
} from 'react-native';
import { Card, Searchbar, Chip, Title, Paragraph, Caption, Subheading } from 'react-native-paper';
import { supabase } from '../../supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

// Define your app's color palette
const AppColors = {
  primary: '#4CAF50',
  accent: '#FFC107',
  background: '#f0f2f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#757575',
  disabled: '#BDBDBD',
  chipOutline: '#A5D6A7', // Lighter green for chip outlines
};

// Helper for category icons (customize as needed)
const getCategoryIcon = (category) => {
  const icons = {
    Investing: 'trending-up',
    Saving: 'account-balance-wallet', // or 'savings' if available and suitable
    Budgeting: 'calculate',
    Credit: 'credit-card',
    'Real Estate': 'home-work',
    Retirement: 'elderly',
    Taxes: 'receipt-long',
    All: 'apps',
  };
  return icons[category] || 'article'; // Default icon
};


const FinanceTips = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All', 'Investing', 'Saving', 'Budgeting', 'Credit', 'Real Estate', 'Retirement', 'Taxes',
  ];

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('finance_tips').select('*').order('created_at', { ascending: false });
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }
      const { data, error } = await query;
      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error('Error fetching tips:', error.message);
      // TODO: Show user-friendly error message (e.g., Toast)
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]); // Re-fetch when category changes

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const filteredTips = tips.filter(tip =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tip.author && tip.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCategoryPress = (category) => {
    setSearchQuery(''); // Clear search when category changes for better UX
    setSelectedCategory(category);
  };

  const renderTipCard = ({ item: tip }) => (
    <Card
      style={styles.tipCard}
      onPress={() => navigation.navigate('FinanceTipDetail', { tipId: tip.id, tipTitle: tip.title })} // Pass ID and title
      elevation={Platform.OS === 'ios' ? 3 : 5}
    >
      {tip.image_url && (
        <Card.Cover source={{ uri: tip.image_url }} style={styles.cardImage} />
      )}
      <Card.Content style={styles.cardContent}>
        <Chip
          icon={() => <Icon name={getCategoryIcon(tip.category)} size={14} color={AppColors.primary} />}
          style={styles.cardCategoryChip}
          textStyle={styles.cardCategoryChipText}
          mode="outlined"
        >
          {tip.category}
        </Chip>
        <Title style={styles.tipTitle}>{tip.title}</Title>
        <Paragraph style={styles.tipExcerpt} numberOfLines={3}>
          {tip.content}
        </Paragraph>
        <View style={styles.tipMeta}>
          <View style={styles.authorInfo}>
            {/* Add author_avatar_url to your Supabase table if you have avatars */}
            {tip.author_avatar_url ? (
              <Image source={{ uri: tip.author_avatar_url }} style={styles.authorAvatar} />
            ) : (
              <Icon name="person-outline" size={16} color={AppColors.textSecondary} style={{ marginRight: 4 }} />
            )}
            <Caption style={styles.metaText}>{tip.author || 'WealthSquad Team'}</Caption>
          </View>
          <Caption style={styles.metaText}>
            {new Date(tip.created_at).toLocaleDateString()}
          </Caption>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="upcoming" size={60} color={AppColors.disabled} />
      <Subheading style={styles.emptyStateText}>No Tips Found</Subheading>
      <Paragraph style={styles.emptyStateSubText}>
        {searchQuery ? "Try a different search or clear filters." : "We're cooking up new tips! Check back soon."}
      </Paragraph>
    </View>
  );

  // Initial full-screen loader
  if (loading && tips.length === 0) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingTextLabel}>Fetching Financial Wisdom...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Searchbar
          placeholder="Search tips, authors..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={AppColors.primary}
          inputStyle={{ fontSize: 15 }}
          elevation={1}
        />
      </View>

      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContainer}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              icon={() => <Icon name={getCategoryIcon(category)} size={16} color={selectedCategory === category ? AppColors.surface : AppColors.primary} />}
              selected={selectedCategory === category}
              onPress={() => handleCategoryPress(category)}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.selectedFilterChip,
              ]}
              textStyle={[
                styles.filterChipText,
                selectedCategory === category && styles.selectedFilterChipText,
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTips}
        renderItem={renderTipCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.tipsListContainer}
        ListEmptyComponent={!loading ? renderEmptyState : null} // Show empty state only if not actively loading
        onRefresh={fetchTips} // Pull to refresh
        refreshing={loading && tips.length > 0} // Show refresh control only if loading more while data exists
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingTextLabel: {
    marginTop: 12,
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  headerSection: {
    backgroundColor: AppColors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    // elevation: 2, // Shadow for header
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  searchBar: {
    borderRadius: 25, // More rounded
    backgroundColor: AppColors.background, // Slightly different bg for search
  },
  categoriesSection: {
    paddingVertical: 12,
    backgroundColor: AppColors.surface, // Or AppColors.background
  },
  categoriesScrollContainer: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: AppColors.surface,
    borderColor: AppColors.chipOutline,
    borderWidth: 1,
    height: 38, // Consistent height
    justifyContent: 'center',
  },
  filterChipText: {
    color: AppColors.primary,
    fontWeight: '500',
  },
  selectedFilterChip: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  selectedFilterChipText: {
    color: AppColors.surface,
    fontWeight: 'bold',
  },
  tipsListContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24, // Space at the bottom of the list
  },
  tipCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
  },
  cardImage: {
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardCategoryChip: { // Style for the chip *inside* the card
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderColor: AppColors.chipOutline, // Use a lighter version of primary or accent
    backgroundColor: 'transparent',
  },
  cardCategoryChipText: {
    color: AppColors.primary, // Or a darker shade of the border
    fontSize: 11,
    fontWeight: '600',
  },
  tipTitle: {
    // fontSize: 18 (from Paper Title)
    // fontWeight: 'bold' (from Paper Title)
    lineHeight: 24,
    color: AppColors.text,
    marginBottom: 6,
  },
  tipExcerpt: {
    // fontSize: 14 (from Paper Paragraph)
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tipMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.background, // Subtle separator
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  metaText: {
    // fontSize: 12 (from Paper Caption)
    color: AppColors.textSecondary,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: screenWidth * 0.1, // Adjust as needed
  },
  emptyStateText: {
    marginTop: 16,
    color: AppColors.text,
    fontWeight: '600',
  },
  emptyStateSubText: {
    textAlign: 'center',
    marginTop: 8,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
});

export default FinanceTips;