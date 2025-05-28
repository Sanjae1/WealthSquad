import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
  Appearance, // For dark mode detection if desired
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // yarn add @react-native-picker/picker or expo install @react-native-picker/picker


import AmortizationModal from '../Components/AmmortizationModal';

// --- Helper Functions ---
const parseCurrency = (value) => {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
};

const formatCurrency = (value, showSymbol = true) => {
  const num = Number(value);
  if (isNaN(num)) return showSymbol ? '$0.00' : '0.00';
  return (showSymbol ? '$' : '') + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

const calculateMonthlyPayment = (principal, annualRate, years) => {
  if (principal <= 0 || annualRate < 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  if (monthlyRate === 0) return principal / numberOfPayments; // Simple division for 0% interest
  return (
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

// --- Data ---
const incomeBandsData = [
  { label: "Over $100,000", value: "over100k", nhtRate: 5.00 },
  { label: "$42,001 - $100,000.99", value: "42k-100k", nhtRate: 4.00 },
  { label: "$30,001 - $42,000.99", value: "30k-42k", nhtRate: 2.00 },
  { label: "less than $30,001", value: "under30k", nhtRate: 0.00 },
];

const applicantTypes = [
  { label: "Single Applicant", value: "Single" },
  { label: "Joint Applicants (2)", value: "Joint" },
  { label: "Three Applicants", value: "Three" },
];

const housingCategories = [
  { label: "Select Housing Category...", value: ""},
  { label: "New Housing Developments", value: "newHousing" },
  { label: "Existing House (Price $12M or less)", value: "housePriceUnder12M" },
  { label: "Existing House (Price Over $12M) / Other", value: "otherwise" },
];

const nhtLoanEligibilityRules = [
  { applicantType: 'Single', housingCategory: 'newHousing', maxLoan: 7500000 },
  { applicantType: 'Joint', housingCategory: 'newHousing', maxLoan: 15000000 },
  { applicantType: 'Three', housingCategory: 'newHousing', maxLoan: 21000000 },
  { applicantType: 'Single', housingCategory: 'housePriceUnder12M', maxLoan: 8500000 },
  { applicantType: 'Single', housingCategory: 'otherwise', maxLoan: 5500000 },
];

// --- Main Component ---
const MortgageCalculatorScreen = () => {
  const [applicantType, setApplicantType] = useState(applicantTypes[0].value);
  const [incomeBand, setIncomeBand] = useState(incomeBandsData[0].value);
  const [housingCategory, setHousingCategory] = useState(housingCategories[0].value);
  
  const [saleAmount, setSaleAmount] = useState('25000000');
  const [includeNHT, setIncludeNHT] = useState(true);

  // NHT Specific
  const [nhtLoanAmount, setNhtLoanAmount] = useState('7500000');
  const [nhtYears, setNhtYears] = useState('30');
  
  // New NHT derived values
  const [nhtMaxLoanPossible, setNhtMaxLoanPossible] = useState(0);
  const [nhtEffectiveRate, setNhtEffectiveRate] = useState(0);
  const [nhtInterestRateDisplay, setNhtInterestRateDisplay] = useState('0.00');

  // Bank Specific
  const [bankInterestRate, setBankInterestRate] = useState('8.00');
  const [bankYears, setBankYears] = useState('30');

  // --- Calculated Values State ---
  const [downPayment, setDownPayment] = useState(0);
  const [amountToBorrow, setAmountToBorrow] = useState(0);
  const [nhtMonthlyPayment, setNhtMonthlyPayment] = useState(0);
  const [bankLoanAmount, setBankLoanAmount] = useState(0);
  const [bankMonthlyPayment, setBankMonthlyPayment] = useState(0);
  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

  const [isAmortizationModalVisible, setIsAmortizationModalVisible] = useState(false);
  const [currentAmortizationDetails, setCurrentAmortizationDetails] = useState(null);

  // Effect to determine NHT Max Loan and Effective Rate
  useEffect(() => {
    const selectedIncomeBandDetail = incomeBandsData.find(band => band.value === incomeBand);
    const currentRate = selectedIncomeBandDetail ? selectedIncomeBandDetail.nhtRate : 0;
    setNhtEffectiveRate(currentRate);
    setNhtInterestRateDisplay(currentRate.toFixed(2));

    if (!applicantType || !housingCategory) {
      setNhtMaxLoanPossible(0);
      return;
    }

    const rule = nhtLoanEligibilityRules.find(r =>
      r.applicantType === applicantType && r.housingCategory === housingCategory
    );

    const maxLoan = rule ? rule.maxLoan : 0;
    setNhtMaxLoanPossible(maxLoan);

    const currentNhtLoanNum = parseCurrency(nhtLoanAmount);
    if (maxLoan > 0 && (currentNhtLoanNum > maxLoan || currentNhtLoanNum === 0 || nhtLoanAmount === '' || !rule)) {
      setNhtLoanAmount(String(maxLoan));
    } else if (maxLoan === 0) {
      setNhtLoanAmount('0');
    }
  }, [applicantType, housingCategory, incomeBand]);

  // Update calculation logic trigger
  const calculateMortgage = useCallback(() => {
    const parsedSaleAmount = parseCurrency(saleAmount);
    const calcDownPayment = parsedSaleAmount * 0.10;
    const calcAmountToBorrow = parsedSaleAmount * 0.90;

    setDownPayment(calcDownPayment);
    setAmountToBorrow(calcAmountToBorrow);

    let finalNhtMonthly = 0;
    let finalBankLoanAmount = calcAmountToBorrow;
    let actualNhtLoanTaken = 0;

    if (includeNHT) {
      actualNhtLoanTaken = Math.min(parseCurrency(nhtLoanAmount), nhtMaxLoanPossible);
      if (parseCurrency(nhtLoanAmount) > nhtMaxLoanPossible) {
        setNhtLoanAmount(String(nhtMaxLoanPossible));
        actualNhtLoanTaken = nhtMaxLoanPossible;
      }

      const parsedNhtYears = parseInt(nhtYears, 10) || 0;

      if (actualNhtLoanTaken > 0 && nhtEffectiveRate >= 0 && parsedNhtYears > 0) {
        finalNhtMonthly = calculateMonthlyPayment(actualNhtLoanTaken, nhtEffectiveRate, parsedNhtYears);
      } else {
        finalNhtMonthly = 0;
      }
      finalBankLoanAmount = Math.max(0, calcAmountToBorrow - actualNhtLoanTaken);
    }

    setNhtMonthlyPayment(finalNhtMonthly);
    setBankLoanAmount(finalBankLoanAmount);

    const parsedBankRate = parseFloat(bankInterestRate) || 0;
    const parsedBankYears = parseInt(bankYears, 10) || 0;
    const finalBankMonthly = calculateMonthlyPayment(finalBankLoanAmount, parsedBankRate, parsedBankYears);

    setBankMonthlyPayment(finalBankMonthly);
    setTotalMonthlyPayment(finalNhtMonthly + finalBankMonthly);

  }, [
    saleAmount, includeNHT,
    nhtLoanAmount, nhtEffectiveRate, nhtYears, nhtMaxLoanPossible,
    bankInterestRate, bankYears
  ]);

  // Recalculate whenever relevant inputs change
  useEffect(() => {
    calculateMortgage();
  }, [calculateMortgage]);

  const currentYear = new Date().getFullYear();
  const lastUpdatedDate = "September 28, 2023"; // From CSV

  // Basic theme detection for text color
  const isDarkMode = Appearance.getColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const inputBgColor = isDarkMode ? '#333333' : '#FFFFFF';
  const inputTextColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#555555' : '#CCCCCC';

  const openAmortizationModal = (loanType) => {
    if (loanType === 'NHT' && includeNHT) {
      const actualNhtLoanTaken = Math.min(parseCurrency(nhtLoanAmount), nhtMaxLoanPossible);
      const pNhtYears = parseInt(nhtYears, 10);
      if (actualNhtLoanTaken > 0 && nhtEffectiveRate >= 0 && pNhtYears > 0 && nhtMonthlyPayment > 0) {
        setCurrentAmortizationDetails({
          loanName: 'NHT Loan',
          principal: actualNhtLoanTaken,
          annualRate: nhtEffectiveRate,
          years: pNhtYears,
          monthlyPayment: nhtMonthlyPayment,
        });
        setIsAmortizationModalVisible(true);
      } else {
        alert("NHT loan details (Amount, Rate from Income, Years) are incomplete or invalid for amortization schedule.");
      }
    } else if (loanType === 'Bank') {
      const pBankLoan = bankLoanAmount;
      const pBankRate = parseFloat(bankInterestRate);
      const pBankYears = parseInt(bankYears, 10);

      if (pBankLoan > 0 && pBankRate >= 0 && pBankYears > 0 && bankMonthlyPayment > 0) {
        setCurrentAmortizationDetails({
          loanName: 'Bank Loan',
          principal: pBankLoan,
          annualRate: pBankRate,
          years: pBankYears,
          monthlyPayment: bankMonthlyPayment,
        });
        setIsAmortizationModalVisible(true);
      } else {
        alert("Bank loan details are incomplete or invalid for amortization schedule.");
      }
    }
  };

  const closeAmortizationModal = () => {
    setIsAmortizationModalVisible(false);
    setCurrentAmortizationDetails(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#F0F0F0' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Mortgage Calculator</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>by @MsGillyJ</Text>
        <TouchableOpacity onPress={() => Linking.openURL('http://www.financialcentsibility.com')}>
          <Text style={styles.link}>www.financialcentsibility.com</Text>
        </TouchableOpacity>
        <Text style={[styles.metaText, { color: textColor }]}>Last updated: {lastUpdatedDate}</Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Select Applicant Type:</Text>
          <Picker
            selectedValue={applicantType}
            style={[styles.picker, { backgroundColor: inputBgColor, color: inputTextColor }]}
            itemStyle={{ color: inputTextColor }}
            onValueChange={(itemValue) => setApplicantType(itemValue)}
          >
            {applicantTypes.map(type => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>

          <Text style={[styles.label, { color: textColor }]}>Select Housing Category:</Text>
          <Picker
            selectedValue={housingCategory}
            style={[styles.picker, { backgroundColor: inputBgColor, color: inputTextColor }]}
            itemStyle={{ color: inputTextColor }}
            onValueChange={(itemValue) => setHousingCategory(itemValue)}
          >
            {housingCategories.map(cat => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>

          <Text style={[styles.label, { color: textColor }]}>Enter Weekly Income Band:</Text>
          <Picker
            selectedValue={incomeBand}
            style={[styles.picker, { backgroundColor: inputBgColor, color: inputTextColor }]}
            itemStyle={{ color: inputTextColor }}
            onValueChange={(itemValue) => setIncomeBand(itemValue)}
          >
            {incomeBandsData.map(band => (
              <Picker.Item key={band.value} label={band.label} value={band.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Sale Amount:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor, borderColor }]}
            keyboardType="numeric"
            value={saleAmount}
            onChangeText={setSaleAmount}
            placeholder="e.g., 25000000"
            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
          />
          <Text style={[styles.calculatedValue, { color: textColor }]}>
            90% Financing - Down Payment (10%): {formatCurrency(downPayment)}
          </Text>
          <Text style={[styles.calculatedValue, { color: textColor }]}>
            Amount to Borrow: {formatCurrency(amountToBorrow)}
          </Text>
        </View>
        
        <View style={styles.toggleContainer}>
            <TouchableOpacity 
                style={[styles.toggleButton, includeNHT && styles.toggleButtonActive]}
                onPress={() => setIncludeNHT(true)}>
                <Text style={[styles.toggleButtonText, includeNHT && styles.toggleButtonTextActive]}>With NHT</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.toggleButton, !includeNHT && styles.toggleButtonActive]}
                onPress={() => setIncludeNHT(false)}>
                <Text style={[styles.toggleButtonText, !includeNHT && styles.toggleButtonTextActive]}>Without NHT</Text>
            </TouchableOpacity>
        </View>

        {includeNHT && (
          <View style={[styles.section, styles.nhtSection]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>NHT Contribution</Text>

            <Text style={[styles.infoText, { color: textColor }]}>
              Max NHT Loan Possible (based on selections): {formatCurrency(nhtMaxLoanPossible)}
            </Text>
            <Text style={[styles.infoText, { color: textColor }]}>
              NHT Interest Rate (from income band): {nhtEffectiveRate.toFixed(2)}%
            </Text>
            {nhtMaxLoanPossible === 0 && (applicantType && housingCategory) && (
              <Text style={[styles.warningText, { color: 'orange' }]}>
                No specific NHT rule found for the selected Applicant Type and Housing Category combination.
                Max loan set to 0. Please verify with NHT.
              </Text>
            )}

            <Text style={[styles.label, { color: textColor }]}>Desired NHT Loan Amount:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor, borderColor }]}
              keyboardType="numeric"
              value={nhtLoanAmount}
              onChangeText={(text) => {
                const numericValue = parseCurrency(text);
                if (numericValue > nhtMaxLoanPossible && nhtMaxLoanPossible > 0) {
                  setNhtLoanAmount(String(nhtMaxLoanPossible));
                } else {
                  setNhtLoanAmount(text);
                }
              }}
              placeholder={`Max ${formatCurrency(nhtMaxLoanPossible, false)}`}
              placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
            />
            {parseCurrency(nhtLoanAmount) > nhtMaxLoanPossible && nhtMaxLoanPossible > 0 && (
              <Text style={styles.warningText}>
                Desired amount cannot exceed {formatCurrency(nhtMaxLoanPossible)}.
              </Text>
            )}

            <Text style={[styles.label, { color: textColor }]}>NHT Interest Rate (%):</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput, { backgroundColor: isDarkMode ? '#424242' : '#E0E0E0', color: inputTextColor, borderColor }]}
              keyboardType="numeric"
              value={nhtInterestRateDisplay}
              editable={false}
            />
            <Text style={[styles.metaText, { color: textColor, fontStyle: 'italic' }]}>
              *Rate determined by income band. Max loan amounts vary by applicant & housing type.
            </Text>

            <Text style={[styles.label, { color: textColor }]}>NHT Years:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor, borderColor }]}
              keyboardType="numeric"
              value={nhtYears}
              onChangeText={setNhtYears}
              placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
            />
            <Text style={[styles.calculatedValue, { color: textColor }]}>
              NHT Monthly Payment: {formatCurrency(nhtMonthlyPayment)}
            </Text>
            <TouchableOpacity
              style={[styles.amortizationButton, {backgroundColor: isDarkMode ? '#004D40' : '#00796B' }]}
              onPress={() => openAmortizationModal('NHT')}>
              <Text style={styles.amortizationButtonText}>View NHT Amortization</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Bank Loan</Text>
           <Text style={[styles.calculatedValue, { color: textColor, fontWeight: 'bold' }]}>
              Bank Loan Amount: {formatCurrency(bankLoanAmount)}
            </Text>
          <Text style={[styles.label, { color: textColor }]}>Bank Interest Rate (%):</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor, borderColor }]}
            keyboardType="numeric"
            value={bankInterestRate}
            onChangeText={setBankInterestRate}
            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
          />
          <Text style={[styles.label, { color: textColor }]}>Bank Years:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor, borderColor }]}
            keyboardType="numeric"
            value={bankYears}
            onChangeText={setBankYears}
            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
          />
          <Text style={[styles.calculatedValue, { color: textColor }]}>
            Bank Monthly Payment: {formatCurrency(bankMonthlyPayment)}
          </Text>
          <TouchableOpacity 
              style={[styles.amortizationButton, {backgroundColor: isDarkMode ? '#004D40' : '#00796B' }]} 
              onPress={() => openAmortizationModal('Bank')}>
              <Text style={styles.amortizationButtonText}>View Bank Amortization</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.totalSection, {backgroundColor: isDarkMode ? '#004D40' : '#E0F2F1'}]}>
          <Text style={[styles.totalLabel, {color: isDarkMode ? '#B2DFDB' : '#00796B'}]}>TOTAL MONTHLY PAYMENTS</Text>
          <Text style={[styles.totalValue, {color: isDarkMode ? '#FFFFFF' : '#004D40'}]}>{formatCurrency(totalMonthlyPayment)}</Text>
        </View>
        
        <View style={styles.notesSection}>
            <Text style={[styles.noteTitle, { color: textColor }]}>Important Notes:</Text>
            <Text style={[styles.noteText, { color: textColor }]}>
                - Click 'Amortization Schedule' (not implemented here) to see monthly payments over time.
            </Text>
            <Text style={[styles.noteText, { color: textColor }]}>
                - For NHT: Maximum loan amounts and rates vary. Effective March 17, 2023, e.g., Single Applicant for New Housing Developments $7.5M @ (rate based on income). House price $12M or less $8.5M @ (rate). Otherwise $5.5M @ (rate).
            </Text>
             <TouchableOpacity onPress={() => Linking.openURL('https://www.nht.gov.jm/loans/affordability')}>
                <Text style={styles.link}>Visit nht.gov.jm for updated NHT info</Text>
            </TouchableOpacity>
            <Text style={[styles.noteText, { color: textColor }]}>
                - For Bank Loan: Interest Rates may vary. Repayment period may be shorter/longer. Downpayment may be more/less than 10%. Adjust accordingly after discussions with your mortgage officer.
            </Text>
            <Text style={[styles.disclaimer, { color: textColor }]}>
                ** THIS DOES NOT INCLUDE FEES OR INSURANCE ASSOCIATED WITH A MORTGAGE. **
            </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textColor }]}>Contact: financialcentsibility@gmail.com</Text>
          <Text style={[styles.footerText, { color: textColor }]}>Twitter: @MsGillyJ</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://jis.gov.jm/media/2023/03/FINAL-PMS-SPEECH.pdf')}>
            <Text style={styles.link}>Reference: JIS PM Speech PDF</Text>
          </TouchableOpacity>
        </View>

        <AmortizationModal
          visible={isAmortizationModalVisible}
          onClose={closeAmortizationModal}
          loanDetails={currentAmortizationDetails}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  link: {
    color: '#1E90FF', // DodgerBlue
    textAlign: 'center',
    marginVertical: 5,
    textDecorationLine: 'underline',
  },
  metaText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)', // Light grey with transparency
  },
  nhtSection: {
    borderColor: '#00796B', // Teal
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50, // iOS picker needs more height for wheel
    width: '100%',
    justifyContent: 'center', // For Android to center text
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: Platform.OS === 'android' ? '#CCCCCC' : 'transparent',
    borderRadius: Platform.OS === 'android' ? 5 : 0,
  },
  calculatedValue: {
    fontSize: 16,
    marginTop: 5,
    fontStyle: 'italic',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00796B', // Teal
  },
  toggleButtonActive: {
    backgroundColor: '#00796B', // Teal
  },
  toggleButtonText: {
    color: '#00796B',
    fontWeight: 'bold',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  totalSection: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  notesSection: {
      marginTop: 15,
      padding: 10,
      backgroundColor: 'rgba(128,128,128,0.05)',
      borderRadius: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  disclaimer: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#D32F2F', // Red
      marginTop: 10,
      textAlign: 'center',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 3,
  },
  amortizationButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  amortizationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 5,
  },
  readOnlyInput: {
    opacity: 0.8,
  },
});

export default MortgageCalculatorScreen;