import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Share,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking, // For opening reference links
  Platform,
} from 'react-native';
import { Headline, Subheading, Paragraph, Caption, Button, Divider, Chip, Title } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../supabaseClient';
import StudentLoanCalculator from '../Components/StudentLoanCalculator'; // Adjust path if needed

const screenWidth = Dimensions.get('window').width;

// Re-use AppColors or define them if this is a standalone context
const AppColors = {
  primary: '#4CAF50',
  accent: '#FFC107',
  background: '#f0f2f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#757575',
  disabled: '#BDBDBD',
  chipOutline: '#A5D6A7',
  sectionBackground: '#F9F9F9', // Slightly off-white for sections
};

// Consistent category icon helper
const getCategoryIcon = (category) => {
  const icons = {
    Investing: 'trending-up', Saving: 'account-balance-wallet', Budgeting: 'calculate', Credit: 'credit-card',
    'Real Estate': 'home-work', Retirement: 'elderly', Taxes: 'receipt-long',
  };
  return icons[category] || 'article';
};

const FinanceTipDetail = ({ route, navigation }) => {
  const { tipId, tipTitle: initialTitle } = route.params;
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set initial title and allow update after fetch
  useEffect(() => {
    if (initialTitle) {
      navigation.setOptions({ title: initialTitle });
    }
  }, [initialTitle, navigation]);

  const fetchTipDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('finance_tips')
        .select('*') // You can select specific columns or related data: '*, author:author_id(*)'
        .eq('id', tipId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Tip not found.');

      setTip(data);
      navigation.setOptions({ title: data.title }); // Update title with fetched data
    } catch (e) {
      console.error('Error fetching tip detail:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tipId, navigation]);

  useEffect(() => {
    fetchTipDetail();
  }, [fetchTipDetail]);

  const handleShare = async () => {
    if (!tip) return;
    try {
      // Create a more engaging share message, perhaps with a link to your app/website
      const shareMessage = `${tip.title}\n\n${tip.content.substring(0, 200)}...\n\nShared from WealthSquad.`;
      await Share.share({
        message: shareMessage,
        title: tip.title,
        // url: `yourapp://tip/${tip.id}` // If you have deep linking
      });
    } catch (sharingError) {
      console.error('Error sharing:', sharingError.message);
    }
  };

  // Handle potential string format for key_points/references
  const parseListString = (listString) => {
    if (!listString) return [];
    if (Array.isArray(listString)) return listString; // Already an array
    if (typeof listString === 'string') {
      return listString.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  if (loading) {
    return (
      <View style={styles.centeredMessage}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{ marginTop: 10, color: AppColors.textSecondary }}>Loading Tip Details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredMessage}>
        <Icon name="error-outline" size={48} color="red" />
        <Subheading style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          Oops! Something went wrong.
        </Subheading>
        <Paragraph style={{color: AppColors.textSecondary, textAlign: 'center', marginVertical: 8}}>{error}</Paragraph>
        <Button mode="outlined" onPress={fetchTipDetail} textColor={AppColors.primary} >
          Try Again
        </Button>
      </View>
    );
  }

  if (!tip) return null; // Should be handled by error state

  const keyPoints = parseListString(tip.key_points);
  const references = parseListString(tip.references); // Assume references are strings or simple objects with 'text'/'url'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      {tip.image_url ? (
        <Image source={{ uri: tip.image_url }} style={styles.headerImage} resizeMode="cover" />
      ) : (
        <View style={[styles.headerImage, styles.placeholderImageContainer]}>
          <Icon name={getCategoryIcon(tip.category)} size={80} color={AppColors.primary} style={{ opacity: 0.6 }}/>
        </View>
      )}

      <View style={styles.contentWrapper}>
        <Chip
            icon={() => <Icon name={getCategoryIcon(tip.category)} size={16} color={AppColors.primary} />}
            style={styles.categoryTag}
            textStyle={styles.categoryTagText}
            mode="outlined"
        >
            {tip.category}
        </Chip>

        <Headline style={styles.mainTitle}>{tip.title}</Headline>

        <View style={styles.metaInfo}>
          <View style={styles.authorDetails}>
            {tip.author_avatar_url ? (
              <Image source={{ uri: tip.author_avatar_url }} style={styles.authorAvatarDetail} />
            ) : (
              <Icon name="person-outline" size={18} color={AppColors.textSecondary} style={{ marginRight: 6 }} />
            )}
            <Caption style={styles.metaTextDetail}>{tip.author || 'WealthSquad Team'}</Caption>
          </View>
          <Caption style={styles.metaTextDetail}>
            {new Date(tip.created_at).toLocaleDateString()}
          </Caption>
        </View>

        <Divider style={styles.contentDivider} />

        <Paragraph style={styles.tipBodyContent}>{tip.content}</Paragraph>

        {keyPoints.length > 0 && (
          <View style={styles.infoSection}>
            <Title style={styles.sectionHeader}>Key Takeaways</Title>
            {keyPoints.map((point, index) => (
              <View key={index} style={styles.bulletPointItem}>
                <Icon name="check-circle-outline" size={22} color={AppColors.primary} style={styles.bulletIcon} />
                <Paragraph style={styles.bulletText}>{point}</Paragraph>
              </View>
            ))}
          </View>
        )}

        {references.length > 0 && (
          <View style={styles.infoSection}>
            <Title style={styles.sectionHeader}>References</Title>
            {references.map((ref, index) => (
              <TouchableOpacity
                key={index}
                // Assuming ref can be a string (URL) or an object { text: 'Display', url: 'ActualURL' }
                onPress={() => {
                  const urlToOpen = typeof ref === 'string' ? ref : ref.url;
                  if (urlToOpen && (urlToOpen.startsWith('http://') || urlToOpen.startsWith('https://'))) {
                    Linking.openURL(urlToOpen).catch(err => console.warn("Couldn't load page", err));
                  }
                }}
              >
                <View style={styles.bulletPointItem}>
                  <Icon name="link" size={20} color={AppColors.primary} style={styles.bulletIcon} />
                  <Paragraph style={[styles.bulletText, (typeof ref === 'string' || ref.url) && styles.linkText]}>
                    {typeof ref === 'string' ? ref : ref.text || ref.url}
                  </Paragraph>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          icon="share-variant" // MaterialCommunityIcon name if using Paper's default
          mode="contained"
          onPress={handleShare}
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
          textColor={AppColors.surface} // Explicitly set text color for contained button
          buttonColor={AppColors.primary} // Set background color
        >
          Share this Tip
        </Button>
      </View>

      {/* Conditionally render calculator - consider if `show_calculator_cta` exists in your tip data */}
      {tip.category === 'Student Loans' && tip.show_calculator_cta && (
        <View style={styles.calculatorContainerSection}>
          <Divider style={styles.contentDivider} />
          <Title style={[styles.sectionHeader, { marginLeft: 16, marginTop:20 }]}>Related Tools</Title>
          <View style={styles.embeddedCalculatorWrapper}>
             <StudentLoanCalculator />
          </View>
          {/* Alternative: Button to navigate */}
          {/* <Button
            mode="outlined"
            icon="calculator"
            style={{ margin: 16 }}
            onPress={() => navigation.navigate('StudentLoanCalculatorRoute')} // Ensure this route exists
          >
            Open Student Loan Calculator
          </Button> */}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.surface, // Main background for the detail screen content area
  },
  scrollContentContainer: {
    paddingBottom: 32, // Ensures spacing at the end of scroll
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: AppColors.background,
  },
  headerImage: {
    width: screenWidth,
    height: screenWidth * 0.6, // Aspect ratio for image
    backgroundColor: AppColors.disabled, // Fallback bg
  },
  placeholderImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth:1,
    borderBottomColor: AppColors.background,
  },
  contentWrapper: {
    padding: 20,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    borderColor: AppColors.chipOutline,
    marginBottom: 12,
  },
  categoryTagText: {
    color: AppColors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  mainTitle: {
    // fontSize: 24 (Headline)
    // fontWeight: 'bold' (Headline)
    color: AppColors.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatarDetail: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  metaTextDetail: {
    // fontSize: 14 (Caption)
    color: AppColors.textSecondary,
  },
  contentDivider: {
    marginVertical: 16,
    backgroundColor: AppColors.background,
  },
  tipBodyContent: {
    fontSize: 16,
    lineHeight: 26, // Good line height for readability
    color: AppColors.text,
    marginBottom: 24,
    textAlign: Platform.OS === 'ios' ? 'justify' : 'left', // Justify text on iOS
  },
  infoSection: {
    backgroundColor: AppColors.sectionBackground, // Subtle background for sections
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  sectionHeader: {
    // fontSize: 18 (Title)
    // fontWeight: 'bold' (Title)
    color: AppColors.text,
    marginBottom: 16,
  },
  bulletPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top for multi-line text
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: Platform.OS === 'ios' ? 1 : 3, // Fine-tune icon alignment
  },
  bulletText: {
    flex: 1, // Allow text to wrap
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.textSecondary,
  },
  linkText: {
    color: AppColors.primary,
    textDecorationLine: 'underline',
  },
  actionButton: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 25, // Pill shape
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  calculatorContainerSection: {
    marginTop: 16, // Space above the calculator section
    // backgroundColor: AppColors.background, // Optional distinct background
    // paddingTop: 16,
  },
  embeddedCalculatorWrapper: {
    // Add styling if the calculator needs to be constrained or visually separated
    // e.g. margin, padding, border
    marginHorizontal: 8, // Example
  }
});

export default FinanceTipDetail;