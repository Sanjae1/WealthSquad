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
  Appearance,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AmortizationModal from '../Components/AmmortizationModal'; // Assuming this path is correct

// --- Theme Constants (for easy styling and rebranding) ---
const theme = {
  COLORS: {
    primary: '#00796B', // Teal
    primaryLight: '#B2DFDB',
    background: { light: '#F4F7F9', dark: '#121212' },
    card: { light: '#FFFFFF', dark: '#1E1E1E' },
    text: { light: '#212121', dark: '#EAEAEA' },
    textSecondary: { light: '#757575', dark: '#A0A0A0' },
    inputBg: { light: '#F0F0F0', dark: '#333333' },
    border: { light: '#DCDCDC', dark: '#444444' },
    white: '#FFFFFF',
    black: '#000000',
    warning: '#FFA726', // Orange
    error: '#D32F2F',   // Red
    link: '#1E90FF',    // DodgerBlue
  },
  SPACING: {
    small: 8,
    medium: 16,
    large: 24,
  },
  FONT_SIZES: {
    title: 28,
    subtitle: 18,
    body: 16,
    caption: 12,
  },
};

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
  if (monthlyRate === 0) return principal / numberOfPayments;
  return (
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

// --- Data (Unchanged) ---
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
  { label: "Select Housing Category...", value: "" },
  { label: "Open Market Purchase", value: "openMarket" },
  { label: "Build-On-Own-Land", value: "buildOnLand" },
  { label: "House Lot Loan (Land Purchase)", value: "houseLot" },
  { label: "New Housing Developments", value: "newHousing" },
  { label: "Existing House (Price $12M or less)", value: "housePriceUnder12M" },
  { label: "Existing House (Price Over $12M) / Other", value: "otherwise" },
];

const nhtLoanEligibilityRules = [
  { applicantType: 'Single', housingCategory: 'openMarket', maxLoan: 9000000 },
  { applicantType: 'Joint', housingCategory: 'openMarket', maxLoan: 17000000 },
  { applicantType: 'Three', housingCategory: 'openMarket', maxLoan: 23000000 },
  { applicantType: 'Single', housingCategory: 'buildOnLand', maxLoan: 11000000 },
  { applicantType: 'Joint', housingCategory: 'buildOnLand', maxLoan: 17000000 },
  { applicantType: 'Three', housingCategory: 'buildOnLand', maxLoan: 23000000 },
  { applicantType: 'Single', housingCategory: 'houseLot', maxLoan: 5000000 },
  { applicantType: 'Joint', housingCategory: 'houseLot', maxLoan: 7000000 },
  { applicantType: 'Three', housingCategory: 'houseLot', maxLoan: 10500000 },
  { applicantType: 'Single', housingCategory: 'newHousing', maxLoan: 9000000 },
  { applicantType: 'Joint', housingCategory: 'newHousing', maxLoan: 17000000 },
  { applicantType: 'Three', housingCategory: 'newHousing', maxLoan: 23000000 },
  { applicantType: 'Single', housingCategory: 'housePriceUnder12M', maxLoan: 8500000 },
  { applicantType: 'Joint', housingCategory: 'housePriceUnder12M', maxLoan: 17000000 },
  { applicantType: 'Three', housingCategory: 'housePriceUnder12M', maxLoan: 25500000 },
  { applicantType: 'Single', housingCategory: 'otherwise', maxLoan: 5500000 },
  { applicantType: 'Joint', housingCategory: 'otherwise', maxLoan: 11000000 },
  { applicantType: 'Three', housingCategory: 'otherwise', maxLoan: 16500000 },
];


// --- Custom Hook for Calculator Logic ---
const useMortgageCalculator = () => {
    // Inputs
    const [applicantType, setApplicantType] = useState(applicantTypes[0].value);
    const [incomeBand, setIncomeBand] = useState(incomeBandsData[0].value);
    const [housingCategory, setHousingCategory] = useState(housingCategories[1].value); // Default to a valid category
    const [saleAmount, setSaleAmount] = useState('25000000');
    const [includeNHT, setIncludeNHT] = useState(true);
    const [nhtLoanAmount, setNhtLoanAmount] = useState('7500000');
    const [nhtYears, setNhtYears] = useState('30');
    const [bankInterestRate, setBankInterestRate] = useState('8.00');
    const [bankYears, setBankYears] = useState('30');
    
    // Derived & Calculated State
    const [nhtMaxLoanPossible, setNhtMaxLoanPossible] = useState(0);
    const [nhtEffectiveRate, setNhtEffectiveRate] = useState(0);
    const [downPayment, setDownPayment] = useState(0);
    const [amountToBorrow, setAmountToBorrow] = useState(0);
    const [nhtMonthlyPayment, setNhtMonthlyPayment] = useState(0);
    const [bankLoanAmount, setBankLoanAmount] = useState(0);
    const [bankMonthlyPayment, setBankMonthlyPayment] = useState(0);
    const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

    // Effect for NHT Max Loan and Rate
    useEffect(() => {
        const selectedIncomeBand = incomeBandsData.find(band => band.value === incomeBand);
        const currentRate = selectedIncomeBand ? selectedIncomeBand.nhtRate : 0;
        setNhtEffectiveRate(currentRate);

        if (!applicantType || !housingCategory) {
            setNhtMaxLoanPossible(0);
            return;
        }

        let maxLoan = 0;
        if (applicantType === 'Single' && housingCategory === 'openMarket' && parseCurrency(saleAmount) <= 14000000) {
            maxLoan = 12000000;
        } else {
            const rule = nhtLoanEligibilityRules.find(r => r.applicantType === applicantType && r.housingCategory === housingCategory);
            maxLoan = rule ? rule.maxLoan : 0;
        }
        setNhtMaxLoanPossible(maxLoan);

        const currentNhtLoanNum = parseCurrency(nhtLoanAmount);
        if (maxLoan > 0 && (currentNhtLoanNum > maxLoan || currentNhtLoanNum === 0)) {
            setNhtLoanAmount(String(maxLoan));
        } else if (maxLoan === 0) {
            setNhtLoanAmount('0');
        }
    }, [applicantType, housingCategory, incomeBand, saleAmount]);

    // Main Calculation Logic
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
            }
            finalNhtMonthly = calculateMonthlyPayment(actualNhtLoanTaken, nhtEffectiveRate, parseInt(nhtYears, 10) || 0);
            finalBankLoanAmount = Math.max(0, calcAmountToBorrow - actualNhtLoanTaken);
        }

        setNhtMonthlyPayment(finalNhtMonthly);
        setBankLoanAmount(finalBankLoanAmount);

        const finalBankMonthly = calculateMonthlyPayment(finalBankLoanAmount, parseFloat(bankInterestRate) || 0, parseInt(bankYears, 10) || 0);
        setBankMonthlyPayment(finalBankMonthly);
        setTotalMonthlyPayment(finalNhtMonthly + finalBankMonthly);
    }, [saleAmount, includeNHT, nhtLoanAmount, nhtEffectiveRate, nhtYears, nhtMaxLoanPossible, bankInterestRate, bankYears]);

    useEffect(() => {
        calculateMortgage();
    }, [calculateMortgage]);

    return {
        // State values
        applicantType, incomeBand, housingCategory, saleAmount, includeNHT, nhtLoanAmount, nhtYears, bankInterestRate, bankYears,
        nhtMaxLoanPossible, nhtEffectiveRate, downPayment, amountToBorrow, nhtMonthlyPayment, bankLoanAmount, bankMonthlyPayment, totalMonthlyPayment,
        // Setter functions
        setApplicantType, setIncomeBand, setHousingCategory, setSaleAmount, setIncludeNHT, setNhtLoanAmount, setNhtYears, setBankInterestRate, setBankYears
    };
};

// --- Dynamic Styles ---
const getDynamicStyles = (isDarkMode) => {
    const C = theme.COLORS;
    const S = theme.SPACING;
    const F = theme.FONT_SIZES;
    const mode = isDarkMode ? 'dark' : 'light';

    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: C.background[mode] },
        container: { padding: S.medium },
        title: { fontSize: F.title, fontWeight: 'bold', textAlign: 'center', marginBottom: S.large, color: C.text[mode] },
        
        // Results
        resultsContainer: { backgroundColor: C.primary, borderRadius: 12, padding: S.medium, marginBottom: S.large, alignItems: 'center' },
        resultsLabel: { color: C.primaryLight, fontSize: F.body, textTransform: 'uppercase' },
        resultsValue: { color: C.white, fontSize: 36, fontWeight: 'bold', marginVertical: S.small },
        resultsBreakdown: { flexDirection: 'row', justifyContent: 'center', gap: S.medium },
        resultsBreakdownText: { color: C.white, fontSize: F.body },
        
        // Cards
        card: { backgroundColor: C.card[mode], borderRadius: 12, padding: S.medium, marginBottom: S.medium, borderWidth: 1, borderColor: C.border[mode] },
        cardTitle: { fontSize: F.subtitle, fontWeight: 'bold', marginBottom: S.medium, color: C.text[mode] },
        
        // Forms
        formGroup: { marginBottom: S.medium },
        label: { fontSize: F.body, color: C.textSecondary[mode], marginBottom: S.small },
        input: { backgroundColor: C.inputBg[mode], color: C.text[mode], borderWidth: 1, borderColor: C.border[mode], borderRadius: 8, padding: 12, fontSize: F.body },
        readOnlyInput: { opacity: 0.7 },
        pickerContainer: { borderWidth: 1, borderColor: C.border[mode], borderRadius: 8, overflow: 'hidden' }, // For Android border
        picker: { backgroundColor: C.inputBg[mode], color: C.text[mode], height: Platform.OS === 'ios' ? 120 : 50, justifyContent: 'center' },
        pickerItem: { color: C.text[mode] }, // For iOS picker wheel text
        
        // Toggle Buttons
        toggleContainer: { flexDirection: 'row', marginBottom: S.medium, backgroundColor: C.inputBg[mode], borderRadius: 20, padding: 4 },
        toggleButton: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
        toggleButtonActive: { backgroundColor: C.primary },
        toggleButtonText: { color: C.text[mode], fontWeight: 'bold' },
        toggleButtonTextActive: { color: C.white },

        // Info & Notes
        infoText: { fontSize: F.body, color: C.textSecondary[mode], fontStyle: 'italic', marginBottom: S.small },
        infoTextBold: { fontSize: F.body, color: C.text[mode], fontWeight: 'bold', marginBottom: S.small },
        infoHighlight: { fontSize: 14, color: C.primary, fontWeight: '600', marginBottom: S.small },
        warningText: { color: C.warning, fontSize: F.caption, marginTop: 4 },
        noteText: { fontSize: 14, color: C.textSecondary[mode], lineHeight: 20, marginBottom: S.medium },
        link: { color: C.link, textDecorationLine: 'underline', textAlign: 'center', paddingVertical: S.small },

        // Amortization Button
        amortizationButton: { backgroundColor: C.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: S.small },
        amortizationButtonText: { color: C.white, fontWeight: 'bold', fontSize: F.body },
    });
};

// --- Reusable UI Components ---
const SectionCard = ({ title, children, style, styles }) => (
    <View style={[styles.card, style]}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

const FormInput = ({ label, value, onChangeText, keyboardType = 'numeric', placeholder, editable = true, onBlur, styles }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, !editable && styles.readOnlyInput]}
            value={String(value)}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={theme.COLORS.textSecondary.dark}
            editable={editable}
            onBlur={onBlur}
        />
    </View>
);

const FormPicker = ({ label, selectedValue, onValueChange, items, styles }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} itemStyle={styles.pickerItem}>
                {items.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
            </Picker>
        </View>
    </View>
);

const ResultsDisplay = ({ total, nhtPayment, bankPayment, includeNHT, styles }) => (
    <View style={styles.resultsContainer}>
        <Text style={styles.resultsLabel}>Total Monthly Payment</Text>
        <Text style={styles.resultsValue}>{formatCurrency(total)}</Text>
        <View style={styles.resultsBreakdown}>
            {includeNHT && <Text style={styles.resultsBreakdownText}>NHT: {formatCurrency(nhtPayment)}</Text>}
            <Text style={styles.resultsBreakdownText}>Bank: {formatCurrency(bankPayment)}</Text>
        </View>
    </View>
);

const ToggleButton = ({ options, selectedValue, onSelect, styles }) => (
  <View style={styles.toggleContainer}>
    {options.map(option => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.toggleButton,
          selectedValue === option.value && styles.toggleButtonActive,
        ]}
        onPress={() => onSelect(option.value)}
      >
        <Text
          style={[
            styles.toggleButtonText,
            selectedValue === option.value && styles.toggleButtonTextActive,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);


// --- Main Screen Component ---
const MortgageCalculatorScreen = () => {
    const {
        applicantType, setApplicantType, incomeBand, setIncomeBand, housingCategory, setHousingCategory, saleAmount, setSaleAmount,
        includeNHT, setIncludeNHT, nhtLoanAmount, setNhtLoanAmount, nhtYears, setNhtYears, bankInterestRate, setBankInterestRate, bankYears, setBankYears,
        nhtMaxLoanPossible, nhtEffectiveRate, downPayment, amountToBorrow, nhtMonthlyPayment, bankLoanAmount, bankMonthlyPayment, totalMonthlyPayment
    } = useMortgageCalculator();
    
    const [isAmortizationModalVisible, setAmortizationModalVisible] = useState(false);
    const [currentAmortizationDetails, setCurrentAmortizationDetails] = useState(null);

    const openAmortizationModal = (type) => {
        let details = null;
        if (type === 'NHT' && includeNHT) {
            const principal = Math.min(parseCurrency(nhtLoanAmount), nhtMaxLoanPossible);
            if (principal > 0 && nhtMonthlyPayment > 0) {
                details = { loanName: 'NHT Loan', principal, annualRate: nhtEffectiveRate, years: parseInt(nhtYears), monthlyPayment: nhtMonthlyPayment };
            }
        } else if (type === 'Bank') {
            if (bankLoanAmount > 0 && bankMonthlyPayment > 0) {
                details = { loanName: 'Bank Loan', principal: bankLoanAmount, annualRate: parseFloat(bankInterestRate), years: parseInt(bankYears), monthlyPayment: bankMonthlyPayment };
            }
        }
        
        if (details) {
            setCurrentAmortizationDetails(details);
            setAmortizationModalVisible(true);
        } else {
            alert("Loan details are incomplete or invalid for an amortization schedule.");
        }
    };
    
    const isDarkMode = Appearance.getColorScheme() === 'dark';
    const styles = getDynamicStyles(isDarkMode); // Generate styles based on theme

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Mortgage Calculator</Text>

                <ResultsDisplay
                    total={totalMonthlyPayment}
                    nhtPayment={nhtMonthlyPayment}
                    bankPayment={bankMonthlyPayment}
                    includeNHT={includeNHT}
                    styles={styles}
                />

                <SectionCard title="Loan Details" styles={styles}>
                    <FormInput
                        label="Sale Amount ($)"
                        value={saleAmount}
                        onChangeText={setSaleAmount}
                        placeholder="e.g., 25000000"
                        styles={styles}
                    />
                    <Text style={styles.infoText}>Down Payment (10%): {formatCurrency(downPayment)}</Text>
                    <Text style={styles.infoText}>Total Amount to Borrow: {formatCurrency(amountToBorrow)}</Text>

                    <FormPicker label="Applicant Type" selectedValue={applicantType} onValueChange={setApplicantType} items={applicantTypes} styles={styles} />
                    <FormPicker label="Housing Category" selectedValue={housingCategory} onValueChange={setHousingCategory} items={housingCategories} styles={styles} />
                    <FormPicker label="Weekly Income Band" selectedValue={incomeBand} onValueChange={setIncomeBand} items={incomeBandsData} styles={styles} />
                </SectionCard>
                
                <ToggleButton 
                    options={[{label: 'With NHT', value: true}, {label: 'Without NHT', value: false}]}
                    selectedValue={includeNHT}
                    onSelect={setIncludeNHT}
                    styles={styles}
                />

                {includeNHT && (
                    <SectionCard title="NHT Contribution" styles={styles}>
                        <Text style={styles.infoHighlight}>Max Possible Loan: {formatCurrency(nhtMaxLoanPossible)}</Text>
                        <Text style={styles.infoHighlight}>Interest Rate: {nhtEffectiveRate.toFixed(2)}%</Text>
                        
                        <FormInput
                            label="Desired NHT Loan Amount ($)"
                            value={nhtLoanAmount}
                            onChangeText={setNhtLoanAmount}
                            onBlur={() => { // Auto-correct if value exceeds max
                                const numericValue = parseCurrency(nhtLoanAmount);
                                if (numericValue > nhtMaxLoanPossible && nhtMaxLoanPossible > 0) {
                                    setNhtLoanAmount(String(nhtMaxLoanPossible));
                                }
                            }}
                            styles={styles}
                        />
                        {parseCurrency(nhtLoanAmount) > nhtMaxLoanPossible && nhtMaxLoanPossible > 0 && (
                          <Text style={styles.warningText}>
                            Amount cannot exceed {formatCurrency(nhtMaxLoanPossible)}.
                          </Text>
                        )}
                        <FormInput label="Loan Term (Years)" value={nhtYears} onChangeText={setNhtYears} styles={styles} />
                         <TouchableOpacity style={styles.amortizationButton} onPress={() => openAmortizationModal('NHT')}>
                            <Text style={styles.amortizationButtonText}>View NHT Amortization</Text>
                        </TouchableOpacity>
                    </SectionCard>
                )}

                <SectionCard title="Bank Loan" styles={styles}>
                    <Text style={styles.infoTextBold}>Bank Loan Amount: {formatCurrency(bankLoanAmount)}</Text>
                    <FormInput label="Interest Rate (%)" value={bankInterestRate} onChangeText={setBankInterestRate} styles={styles} />
                    <FormInput label="Loan Term (Years)" value={bankYears} onChangeText={setBankYears} styles={styles} />
                    <TouchableOpacity style={styles.amortizationButton} onPress={() => openAmortizationModal('Bank')}>
                        <Text style={styles.amortizationButtonText}>View Bank Amortization</Text>
                    </TouchableOpacity>
                </SectionCard>
                
                <SectionCard title="Important Notes" styles={styles}>
                    <Text style={styles.noteText}>• Loan limits and interest rates are based on NHT's 2023 policies. Always verify with the NHT and your bank for the most current information.</Text>
                    <Text style={styles.noteText}>• This calculation does not include closing costs, insurance, or other fees.</Text>
                     <TouchableOpacity onPress={() => Linking.openURL('https://www.nht.gov.jm/loans/affordability')}>
                        <Text style={styles.link}>Visit nht.gov.jm for Official Info</Text>
                    </TouchableOpacity>
                </SectionCard>

                <AmortizationModal
                    visible={isAmortizationModalVisible}
                    onClose={() => setAmortizationModalVisible(false)}
                    loanDetails={currentAmortizationDetails}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default MortgageCalculatorScreen;