import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Card, Searchbar, Chip } from 'react-native-paper';
import { supabase } from '../../supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const FinanceTips = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Investing',
    'Saving',
    'Budgeting',
    'Credit',
    'Real Estate',
    'Retirement',
    'Taxes',
  ];

  useEffect(() => {
    fetchTips();
  }, [selectedCategory]);

  const fetchTips = async () => {
    try {
      let query = supabase.from('finance_tips').select('*').order('created_at', { ascending: false });
      
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = tips.filter(tip =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTipCard = (tip) => (
    <Card
      key={tip.id}
      style={styles.tipCard}
      onPress={() => navigation.navigate('FinanceTipDetail', { tip })}
    >
      {tip.image_url && (
        <Card.Cover source={{ uri: tip.image_url }} style={styles.cardImage} />
      )}
      <Card.Content>
        <View style={styles.categoryChip}>
          <Text style={styles.chipText}>{tip.category}</Text>
        </View>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipExcerpt} numberOfLines={3}>
          {tip.content}
        </Text>
        <View style={styles.tipMeta}>
          <View style={styles.authorInfo}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.authorText}>{tip.author}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(tip.created_at).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search tips..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip,
            ]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView style={styles.tipsContainer}>
        {loading ? (
          <Text style={styles.loadingText}>Loading tips...</Text>
        ) : filteredTips.length === 0 ? (
          <Text style={styles.noTipsText}>No tips found</Text>
        ) : (
          filteredTips.map(renderTipCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  selectedCategoryChip: {
    backgroundColor: '#4CAF50',
  },
  tipsContainer: {
    paddingHorizontal: 16,
  },
  tipCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardImage: {
    height: 200,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipExcerpt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tipMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#666',
  },
  noTipsText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#666',
  },
});

export default FinanceTips; 