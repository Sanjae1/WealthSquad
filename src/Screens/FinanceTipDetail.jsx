import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Share,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StudentLoanCalculator from '../Components/StudentLoanCalculator';

const screenWidth = Dimensions.get('window').width;

const FinanceTipDetail = ({ route, navigation }) => {
  const { tip } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${tip.title}\n\n${tip.content}\n\nShared from WealthSquad`,
        title: tip.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {tip.image_url && (
          <Image
            source={{ uri: tip.image_url }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <View style={styles.categoryChip}>
            <Text style={styles.chipText}>{tip.category}</Text>
          </View>

          <Text style={styles.title}>{tip.title}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.authorInfo}>
              <Icon name="person" size={16} color="#666" />
              <Text style={styles.authorText}>{tip.author}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(tip.created_at).toLocaleDateString()}
            </Text>
          </View>

          <Text style={styles.tipContent}>{tip.content}</Text>

          {tip.key_points && (
            <View style={styles.keyPoints}>
              <Text style={styles.keyPointsTitle}>Key Takeaways:</Text>
              {tip.key_points.map((point, index) => (
                <View key={index} style={styles.keyPoint}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          )}

          {tip.references && (
            <View style={styles.references}>
              <Text style={styles.referencesTitle}>References:</Text>
              {tip.references.map((ref, index) => (
                <Text key={index} style={styles.referenceText}>
                  • {ref}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Icon name="share" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share this tip</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {tip.category === 'Student Loans' && <StudentLoanCalculator />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  headerImage: {
    width: screenWidth - 32,
    height: 250,
  },
  content: {
    padding: 16,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  tipContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  keyPoints: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  keyPointsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  keyPointText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  references: {
    marginBottom: 24,
  },
  referencesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  referenceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FinanceTipDetail; 