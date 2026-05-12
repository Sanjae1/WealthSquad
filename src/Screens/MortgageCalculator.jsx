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
    StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    RotateCcw,
    DollarSign,
    Percent,
    Calendar,
    Home,
    Briefcase,
    Info,
    AlertTriangle,
    CheckCircle2,
    Shield
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AmortizationModal from '../Components/AmortizationModal';

// --- Theme (fallback if FS not available) ---
const FS = {
    primary: '#2563EB',
    primaryContainer: '#1D4ED8',
    surface: '#F8FAFC',
    onSurface: '#1E293B',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#D97706'
};

// --- Helper Functions ---
const parseCurrency = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
};

const formatCurrency = (value, showSymbol = true) => {
    const num = Number(value);
    if (isNaN(num)) return showSymbol ? 'J$0.00' : '0.00';
    return (showSymbol ? 'J$' : '') + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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

// --- Data: Jamaica Banks (2026) ---
const BANK_OPTIONS = [
    { label: "Enter Custom Rate", value: "custom", rate: null, note: null },
    { label: "Scotia Bank (8.50% - 12.49%)", value: "scotiabank", rate: 9.50, note: "Rates vary by term and security. APR/EAIR." },
    { label: "JN Bank — Home Loan (9.85%)", value: "jn_home", rate: 9.85, note: "Up to 90% financing" },
    { label: "JN Bank — Refinancing (9.75%)", value: "jn_refi", rate: 9.75, note: "Up to 85% financing" },
    { label: "JN Bank — Investment (10.35%)", value: "jn_invest", rate: 10.35, note: "Up to 66.67% financing" },
    { label: "JN Bank — Resort (10.50%)", value: "jn_resort", rate: 10.50, note: "Up to 66.67% financing" },
    { label: "First Global — 1% Program*", value: "first_global", rate: 1.00, note: "*Limited to specific developments only" },
    { label: "NCB (est. ~8.50%)", value: "ncb", rate: 8.50, note: "NHT partnership available. Rate confirmed on application." },
    { label: "JMMB (negotiated)", value: "jmmb", rate: 8.50, note: "Rate confirmed on application" },
    { label: "Sagicor (negotiated)", value: "sagicor", rate: 8.75, note: "Rate confirmed on application" },
    { label: "CIBC FirstCaribbean (negotiated)", value: "cibc", rate: 8.50, note: "Rate confirmed on application" },
];

// --- Data: NHT ---
const incomeBandsData = [
    { label: "Select your weekly income...", value: "", nhtRate: 0 },
    { label: "Less than $30,001", value: "under30k", nhtRate: 0.00 },
    { label: "$30,001 - $42,000.99", value: "30k-42k", nhtRate: 2.00 },
    { label: "$42,001 - $100,000.99", value: "42k-100k", nhtRate: 4.00 },
    { label: "Over $100,000", value: "over100k", nhtRate: 5.00 },
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

const OCCUPATIONS = [
    { label: "None / Other", value: "none", reduction: 0 },
    { label: "Teacher", value: "teacher", reduction: 1.0 },
    { label: "Nurse", value: "nurse", reduction: 1.0 },
    { label: "Firefighter", value: "firefighter", reduction: 1.0 },
    { label: "Security Forces", value: "security", reduction: 1.0 },
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

// --- Closing Costs Calculator (Jamaica) ---
const calculateClosingCosts = (salePrice) => {
    const price = parseCurrency(salePrice);
    if (price <= 0) return null;

    const stampDuty = 5000;
    const agreementForSale = price * 0.002;
    const gctOnAgreement = agreementForSale * 0.165;
    const registrationFee = price * 0.005;
    const surveyorFee = 60000;
    const attorneyFee = price * 0.03;
    const letterOfPossession = 7500;

    const buyerShare = {
        stampDuty: stampDuty * 0.5,
        agreementForSale: agreementForSale * 0.5,
        gctOnAgreement: gctOnAgreement * 0.5,
        registrationFee: registrationFee * 0.5,
        surveyorFee: surveyorFee,
        attorneyFee: attorneyFee,
        letterOfPossession: letterOfPossession * 0.5,
    };

    const total = Object.values(buyerShare).reduce((a, b) => a + b, 0);

    return {
        ...buyerShare,
        total,
        asPercentOfPrice: ((total / price) * 100).toFixed(1)
    };
};

// --- Custom Hook ---
const useMortgageCalculator = () => {
    // Buyer mode
    const [isCashBuyer, setIsCashBuyer] = useState(false);

    // Property
    const [applicantType, setApplicantType] = useState(applicantTypes[0].value);
    const [incomeBand, setIncomeBand] = useState(incomeBandsData[0].value);
    const [housingCategory, setHousingCategory] = useState(housingCategories[1].value);
    const [saleAmount, setSaleAmount] = useState('');

    // NHT
    const [includeNHT, setIncludeNHT] = useState(true);
    const [occupation, setOccupation] = useState('none');
    const [yearsOfService, setYearsOfService] = useState('');
    const [nhtLoanAmount, setNhtLoanAmount] = useState('');
    const [nhtYears, setNhtYears] = useState('30');

    // Bank
    const [selectedBank, setSelectedBank] = useState('custom');
    const [bankInterestRate, setBankInterestRate] = useState('8.00');
    const [bankYears, setBankYears] = useState('30');

    // Affordability
    const [monthlySalary, setMonthlySalary] = useState('');
    const [otherDebts, setOtherDebts] = useState('');

    // Results
    const [nhtMaxLoanPossible, setNhtMaxLoanPossible] = useState(0);
    const [nhtEffectiveRate, setNhtEffectiveRate] = useState(0);
    const [downPayment, setDownPayment] = useState(0);
    const [amountToBorrow, setAmountToBorrow] = useState(0);
    const [nhtMonthlyPayment, setNhtMonthlyPayment] = useState(0);
    const [bankLoanAmount, setBankLoanAmount] = useState(0);
    const [bankMonthlyPayment, setBankMonthlyPayment] = useState(0);
    const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);
    const [closingCosts, setClosingCosts] = useState(null);
    const [dsr, setDsr] = useState(0);

    // Calculate NHT effective rate with occupation discount
    useEffect(() => {
        const selectedIncomeBand = incomeBandsData.find(band => band.value === incomeBand);
        let baseRate = selectedIncomeBand ? selectedIncomeBand.nhtRate : 0;

        const occ = OCCUPATIONS.find(o => o.value === occupation);
        const yrs = parseInt(yearsOfService) || 0;

        if (occ && occ.reduction > 0) {
            if (yrs >= 5 && yrs < 10) baseRate -= 1.0;
            else if (yrs >= 10) baseRate -= 2.0;
        }

        setNhtEffectiveRate(Math.max(0, baseRate));
    }, [incomeBand, occupation, yearsOfService]);

    // Calculate max NHT loan
    useEffect(() => {
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
        if (maxLoan > 0 && currentNhtLoanNum > maxLoan) {
            setNhtLoanAmount(String(maxLoan));
        } else if (maxLoan === 0) {
            setNhtLoanAmount('0');
        }
    }, [applicantType, housingCategory, saleAmount]);

    // Main calculation
    const calculateMortgage = useCallback(() => {
        const parsedSaleAmount = parseCurrency(saleAmount);
        const calcDownPayment = parsedSaleAmount * 0.10;
        const calcAmountToBorrow = parsedSaleAmount * 0.90;

        setDownPayment(calcDownPayment);
        setAmountToBorrow(calcAmountToBorrow);
        setClosingCosts(calculateClosingCosts(saleAmount));

        let finalNhtMonthly = 0;
        let finalBankLoanAmount = calcAmountToBorrow;
        let actualNhtLoanTaken = 0;

        if (!isCashBuyer && includeNHT) {
            actualNhtLoanTaken = Math.min(parseCurrency(nhtLoanAmount), nhtMaxLoanPossible);
            if (parseCurrency(nhtLoanAmount) > nhtMaxLoanPossible) {
                setNhtLoanAmount(String(nhtMaxLoanPossible));
            }
            finalNhtMonthly = calculateMonthlyPayment(actualNhtLoanTaken, nhtEffectiveRate, parseInt(nhtYears, 10) || 0);
            finalBankLoanAmount = Math.max(0, calcAmountToBorrow - actualNhtLoanTaken);
        } else if (isCashBuyer) {
            finalBankLoanAmount = 0;
        }

        setNhtMonthlyPayment(finalNhtMonthly);
        setBankLoanAmount(finalBankLoanAmount);

        const finalBankMonthly = isCashBuyer
            ? 0
            : calculateMonthlyPayment(finalBankLoanAmount, parseFloat(bankInterestRate) || 0, parseInt(bankYears, 10) || 0);

        setBankMonthlyPayment(finalBankMonthly);
        setTotalMonthlyPayment(finalNhtMonthly + finalBankMonthly);

        // DSR
        const salary = parseCurrency(monthlySalary);
        const debts = parseCurrency(otherDebts);
        if (salary > 0) {
            setDsr(((finalNhtMonthly + finalBankMonthly + debts) / salary) * 100);
        } else {
            setDsr(0);
        }

    }, [saleAmount, isCashBuyer, includeNHT, nhtLoanAmount, nhtEffectiveRate, nhtYears, nhtMaxLoanPossible, bankInterestRate, bankYears, monthlySalary, otherDebts]);

    useEffect(() => {
        calculateMortgage();
    }, [calculateMortgage]);

    const reset = () => {
        setSaleAmount('');
        setNhtLoanAmount('');
        setIncludeNHT(true);
        setApplicantType(applicantTypes[0].value);
        setHousingCategory(housingCategories[1].value);
        setIncomeBand(incomeBandsData[0].value);
        setOccupation('none');
        setYearsOfService('');
        setSelectedBank('custom');
        setBankInterestRate('8.00');
        setMonthlySalary('');
        setOtherDebts('');
        setIsCashBuyer(false);
    };

    return {
        isCashBuyer, setIsCashBuyer,
        applicantType, setApplicantType, incomeBand, setIncomeBand, housingCategory, setHousingCategory, saleAmount, setSaleAmount,
        includeNHT, setIncludeNHT, occupation, setOccupation, yearsOfService, setYearsOfService,
        nhtLoanAmount, setNhtLoanAmount, nhtYears, setNhtYears,
        selectedBank, setSelectedBank, bankInterestRate, setBankInterestRate, bankYears, setBankYears,
        monthlySalary, setMonthlySalary, otherDebts, setOtherDebts,
        nhtMaxLoanPossible, nhtEffectiveRate, downPayment, amountToBorrow,
        nhtMonthlyPayment, bankLoanAmount, bankMonthlyPayment, totalMonthlyPayment,
        closingCosts, dsr,
        reset
    };
};

// --- Components ---

const InputField = ({ label, value, onChangeText, icon: Icon, placeholder, keyboardType = 'numeric', editable = true, info }) => (
    <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>{label}</Text>
            {info && <Text style={styles.inputInfo}>{info}</Text>}
        </View>
        <View style={[styles.inputWrapper, !editable && styles.disabledInput]}>
            {Icon && <Icon size={20} color="#64748B" style={styles.inputIcon} />}
            <TextInput
                style={styles.input}
                value={String(value)}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                keyboardType={keyboardType}
                editable={editable}
            />
        </View>
    </View>
);

const SelectField = ({ label, value, onValueChange, items, icon: Icon, info }) => (
    <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>{label}</Text>
            {info && <Text style={styles.inputInfo}>{info}</Text>}
        </View>
        <View style={styles.pickerWrapper}>
            {Icon && <Icon size={20} color="#64748B" style={styles.pickerIcon} />}
            <Picker
                selectedValue={value}
                onValueChange={onValueChange}
                style={styles.picker}
                dropdownIconColor="#64748B"
            >
                {items.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
            </Picker>
        </View>
    </View>
);

const SectionCard = ({ children, style }) => (
    <View style={[styles.card, style]}>
        {children}
    </View>
);

const InfoRow = ({ label, value, highlight = false }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={highlight ? styles.highlightValue : styles.infoValue}>{value}</Text>
    </View>
);

const MortgageCalculatorScreen = () => {
    const navigation = useNavigation();
    const {
        isCashBuyer, setIsCashBuyer,
        applicantType, setApplicantType, incomeBand, setIncomeBand, housingCategory, setHousingCategory, saleAmount, setSaleAmount,
        includeNHT, setIncludeNHT, occupation, setOccupation, yearsOfService, setYearsOfService,
        nhtLoanAmount, setNhtLoanAmount, nhtYears, setNhtYears,
        selectedBank, setSelectedBank, bankInterestRate, setBankInterestRate, bankYears, setBankYears,
        monthlySalary, setMonthlySalary, otherDebts, setOtherDebts,
        nhtMaxLoanPossible, nhtEffectiveRate, downPayment, amountToBorrow,
        nhtMonthlyPayment, bankLoanAmount, bankMonthlyPayment, totalMonthlyPayment,
        closingCosts, dsr,
        reset
    } = useMortgageCalculator();

    const [isAmortizationModalVisible, setAmortizationModalVisible] = useState(false);
    const [currentAmortizationDetails, setCurrentAmortizationDetails] = useState(null);
    const [showClosingBreakdown, setShowClosingBreakdown] = useState(false);

    const openAmortizationModal = (type) => {
        let details = null;
        if (type === 'NHT' && includeNHT && !isCashBuyer) {
            const principal = Math.min(parseCurrency(nhtLoanAmount), nhtMaxLoanPossible);
            if (principal > 0 && nhtMonthlyPayment > 0) {
                details = { loanName: 'NHT Loan', principal, annualRate: nhtEffectiveRate, years: parseInt(nhtYears), monthlyPayment: nhtMonthlyPayment };
            }
        } else if (type === 'Bank' && !isCashBuyer) {
            if (bankLoanAmount > 0 && bankMonthlyPayment > 0) {
                details = { loanName: 'Bank Loan', principal: bankLoanAmount, annualRate: parseFloat(bankInterestRate), years: parseInt(bankYears), monthlyPayment: bankMonthlyPayment };
            }
        }

        if (details) {
            setCurrentAmortizationDetails(details);
            setAmortizationModalVisible(true);
        } else {
            alert("Loan details are incomplete or invalid.");
        }
    };

    const isAffordable = dsr <= 50;
    const bankNote = BANK_OPTIONS.find(b => b.value === selectedBank)?.note;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={FS.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ChevronLeft color="#1E293B" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mortgage Calculator</Text>
                <TouchableOpacity onPress={reset} style={styles.iconButton}>
                    <RotateCcw color="#64748B" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Buyer Mode Toggle */}
                <View style={styles.modeToggleContainer}>
                    <TouchableOpacity
                        style={[styles.modeButton, !isCashBuyer && styles.modeButtonActive]}
                        onPress={() => setIsCashBuyer(false)}
                    >
                        <Text style={[styles.modeButtonText, !isCashBuyer && styles.modeButtonTextActive]}>Mortgage</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeButton, isCashBuyer && styles.modeButtonActive]}
                        onPress={() => setIsCashBuyer(true)}
                    >
                        <Text style={[styles.modeButtonText, isCashBuyer && styles.modeButtonTextActive]}>Cash Buyer</Text>
                    </TouchableOpacity>
                </View>

                {/* Results Card */}
                <LinearGradient
                    colors={[FS.primary, FS.primaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.resultCard}
                >
                    <Text style={styles.resultLabel}>
                        {isCashBuyer ? 'Total Cash Needed' : 'Estimated Monthly Payment'}
                    </Text>
                    <Text style={styles.resultValue}>
                        {isCashBuyer
                            ? formatCurrency(parseCurrency(saleAmount) * 0.10 + (closingCosts?.total || 0))
                            : formatCurrency(totalMonthlyPayment)
                        }
                    </Text>

                    {!isCashBuyer && (
                        <View style={styles.breakdownContainer}>
                            {includeNHT && (
                                <View style={styles.breakdownItem}>
                                    <Text style={styles.breakdownLabel}>NHT</Text>
                                    <Text style={styles.breakdownValue}>{formatCurrency(nhtMonthlyPayment)}</Text>
                                </View>
                            )}
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>Bank</Text>
                                <Text style={styles.breakdownValue}>{formatCurrency(bankMonthlyPayment)}</Text>
                            </View>
                        </View>
                    )}

                    {isCashBuyer && closingCosts && (
                        <View style={styles.breakdownContainer}>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>Down Payment (10%)</Text>
                                <Text style={styles.breakdownValue}>{formatCurrency(downPayment)}</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>Closing Costs</Text>
                                <Text style={styles.breakdownValue}>{formatCurrency(closingCosts.total)}</Text>
                            </View>
                        </View>
                    )}
                </LinearGradient>

                {/* DSR Card */}
                {parseCurrency(monthlySalary) > 0 && !isCashBuyer && (
                    <View style={[styles.dsrCard, isAffordable ? styles.dsrGood : styles.dsrBad]}>
                        <View style={styles.dsrHeader}>
                            {isAffordable
                                ? <CheckCircle2 size={20} color={FS.success} />
                                : <AlertTriangle size={20} color={FS.error} />
                            }
                            <Text style={[styles.dsrTitle, { color: isAffordable ? FS.success : FS.error }]}>
                                Debt-Service Ratio
                            </Text>
                        </View>
                        <Text style={styles.dsrValue}>{dsr.toFixed(1)}%</Text>
                        <Text style={styles.dsrLabel}>
                            {isAffordable
                                ? "✓ Under 50% — Likely affordable"
                                : "⚠ Over 50% — Consider a larger down payment or lower-priced home"}
                        </Text>
                        <View style={styles.dsrBarContainer}>
                            <View style={[styles.dsrBar, { width: `${Math.min(dsr, 100)}%`, backgroundColor: isAffordable ? FS.success : FS.error }]} />
                        </View>
                    </View>
                )}

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Details</Text>
                    <SectionCard>
                        <InputField
                            label="Sale Price"
                            value={saleAmount}
                            onChangeText={setSaleAmount}
                            icon={DollarSign}
                            placeholder="J$0.00"
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.infoLabel}>Down Payment (10%)</Text>
                                <Text style={styles.infoValue}>{formatCurrency(downPayment)}</Text>
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.infoLabel}>{isCashBuyer ? 'Cash Price' : 'Loan Amount'}</Text>
                                <Text style={styles.infoValue}>{isCashBuyer ? formatCurrency(parseCurrency(saleAmount)) : formatCurrency(amountToBorrow)}</Text>
                            </View>
                        </View>

                        <SelectField
                            label="Applicant Type"
                            value={applicantType}
                            onValueChange={setApplicantType}
                            items={applicantTypes}
                            icon={Briefcase}
                        />
                        <SelectField
                            label="Housing Category"
                            value={housingCategory}
                            onValueChange={setHousingCategory}
                            items={housingCategories}
                            icon={Home}
                        />
                    </SectionCard>
                </View>

                {/* Closing Costs */}
                {closingCosts && (
                    <View style={styles.section}>
                        <TouchableOpacity onPress={() => setShowClosingBreakdown(!showClosingBreakdown)} style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Closing Costs (~{closingCosts.asPercentOfPrice}%)</Text>
                            <Text style={styles.toggleText}>{showClosingBreakdown ? 'Hide' : 'Show'}</Text>
                        </TouchableOpacity>

                        <SectionCard>
                            <InfoRow label="Total Closing Costs" value={formatCurrency(closingCosts.total)} highlight />
                            {showClosingBreakdown && (
                                <>
                                    <View style={styles.divider} />
                                    <InfoRow label="Stamp Duty (50%)" value={formatCurrency(closingCosts.stampDuty)} />
                                    <InfoRow label="Agreement for Sale (50%)" value={formatCurrency(closingCosts.agreementForSale)} />
                                    <InfoRow label="GCT on Agreement (50%)" value={formatCurrency(closingCosts.gctOnAgreement)} />
                                    <InfoRow label="Registration Fee (50%)" value={formatCurrency(closingCosts.registrationFee)} />
                                    <InfoRow label="Surveyor's Fee" value={formatCurrency(closingCosts.surveyorFee)} />
                                    <InfoRow label="Attorney's Fee (~3%)" value={formatCurrency(closingCosts.attorneyFee)} />
                                    <InfoRow label="Letter of Possession (50%)" value={formatCurrency(closingCosts.letterOfPossession)} />
                                </>
                            )}
                        </SectionCard>
                    </View>
                )}

                {/* Affordability Check */}
                {!isCashBuyer && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Affordability Check</Text>
                        <SectionCard>
                            <InputField
                                label="Gross Monthly Salary"
                                value={monthlySalary}
                                onChangeText={setMonthlySalary}
                                icon={DollarSign}
                                placeholder="J$0.00"
                            />
                            <InputField
                                label="Other Monthly Debt Payments"
                                value={otherDebts}
                                onChangeText={setOtherDebts}
                                icon={DollarSign}
                                placeholder="J$0.00"
                                info="Car loans, credit cards, etc."
                            />
                        </SectionCard>
                    </View>
                )}

                {/* NHT Section */}
                {!isCashBuyer && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>NHT Loan</Text>
                            <TouchableOpacity
                                style={[styles.toggle, includeNHT && styles.toggleActive]}
                                onPress={() => setIncludeNHT(!includeNHT)}
                            >
                                <Text style={[styles.toggleText, includeNHT && styles.toggleTextActive]}>
                                    {includeNHT ? 'Enabled' : 'Disabled'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {includeNHT && (
                            <SectionCard>
                                <SelectField
                                    label="Weekly Income Band"
                                    value={incomeBand}
                                    onValueChange={setIncomeBand}
                                    items={incomeBandsData}
                                    icon={DollarSign}
                                />

                                <SelectField
                                    label="Occupation (for rate discount)"
                                    value={occupation}
                                    onValueChange={setOccupation}
                                    items={OCCUPATIONS}
                                    icon={Shield}
                                    info="Teachers, nurses, etc. get 1-2% off from July 2026"
                                />

                                {occupation !== 'none' && (
                                    <InputField
                                        label="Years of Service"
                                        value={yearsOfService}
                                        onChangeText={setYearsOfService}
                                        icon={Briefcase}
                                        placeholder="e.g. 8"
                                        info="5-9 yrs: -1% | 10+ yrs: -2%"
                                    />
                                )}

                                <View style={[styles.infoRow, { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 12 }]}>
                                    <Text style={styles.infoLabel}>NHT Interest Rate</Text>
                                    <Text style={styles.highlightValue}>{nhtEffectiveRate.toFixed(2)}%</Text>
                                </View>

                                <InfoRow label="Max Eligible Loan" value={formatCurrency(nhtMaxLoanPossible)} highlight />

                                <InputField
                                    label="NHT Loan Amount"
                                    value={nhtLoanAmount}
                                    onChangeText={setNhtLoanAmount}
                                    icon={DollarSign}
                                    placeholder="J$0.00"
                                />
                                <InputField
                                    label="Term (Years)"
                                    value={nhtYears}
                                    onChangeText={setNhtYears}
                                    icon={Calendar}
                                />

                                <TouchableOpacity style={styles.actionButton} onPress={() => openAmortizationModal('NHT')}>
                                    <Text style={styles.actionButtonText}>View Amortization Schedule</Text>
                                </TouchableOpacity>
                            </SectionCard>
                        )}
                    </View>
                )}

                {/* Bank Loan Section */}
                {!isCashBuyer && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bank Loan</Text>
                        <SectionCard>
                            <InfoRow label="Bank Loan Amount" value={formatCurrency(bankLoanAmount)} highlight />

                            <SelectField
                                label="Select Bank"
                                value={selectedBank}
                                onValueChange={(val) => {
                                    setSelectedBank(val);
                                    const bank = BANK_OPTIONS.find(b => b.value === val);
                                    if (bank && bank.rate !== null) {
                                        setBankInterestRate(String(bank.rate));
                                    }
                                }}
                                items={BANK_OPTIONS}
                                icon={Briefcase}
                            />

                            {bankNote && (
                                <View style={styles.bankNoteContainer}>
                                    <Info size={14} color={FS.warning} />
                                    <Text style={styles.bankNoteText}>{bankNote}</Text>
                                </View>
                            )}

                            <InputField
                                label="Interest Rate (%)"
                                value={bankInterestRate}
                                onChangeText={setBankInterestRate}
                                icon={Percent}
                                editable={selectedBank === 'custom'}
                            />
                            <InputField
                                label="Term (Years)"
                                value={bankYears}
                                onChangeText={setBankYears}
                                icon={Calendar}
                            />

                            <TouchableOpacity style={styles.actionButton} onPress={() => openAmortizationModal('Bank')}>
                                <Text style={styles.actionButtonText}>View Amortization Schedule</Text>
                            </TouchableOpacity>
                        </SectionCard>
                    </View>
                )}

                {/* Cash Buyer Info */}
                {isCashBuyer && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cash Buyer Summary</Text>
                        <SectionCard>
                            <InfoRow label="Property Price" value={formatCurrency(parseCurrency(saleAmount))} />
                            <InfoRow label="Estimated Closing Costs" value={formatCurrency(closingCosts?.total || 0)} highlight />
                            <InfoRow label="Total Cash Required" value={formatCurrency(parseCurrency(saleAmount) + (closingCosts?.total || 0))} highlight />

                            <View style={styles.cashTipBox}>
                                <Info size={16} color={FS.primary} />
                                <Text style={styles.cashTipText}>
                                    As a cash buyer, budget approximately 10% of the property value for closing costs (stamp duty, legal fees, registration, etc.) plus any repair costs.
                                </Text>
                            </View>
                        </SectionCard>
                    </View>
                )}

                {/* Disclaimer */}
                <View style={styles.disclaimerBox}>
                    <Info size={14} color="#94A3B8" />
                    <Text style={styles.disclaimerText}>
                        Rates and fees are estimates based on 2026 Jamaica market data. Contact your chosen bank or NHT for confirmed rates. NHT public service discounts effective July 1, 2026.
                    </Text>
                </View>

            </ScrollView>

            <AmortizationModal
                visible={isAmortizationModalVisible}
                onClose={() => setAmortizationModalVisible(false)}
                loanDetails={currentAmortizationDetails}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: FS.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: FS.surface,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    modeToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    modeButtonTextActive: {
        color: '#1E293B',
    },
    resultCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    resultLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    resultValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 20,
    },
    breakdownContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 4,
        width: '100%',
    },
    breakdownItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    breakdownLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginBottom: 4,
    },
    breakdownValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    dsrCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    dsrGood: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    dsrBad: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    dsrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    dsrTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    dsrValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    dsrLabel: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
    },
    dsrBarContainer: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    dsrBar: {
        height: '100%',
        borderRadius: 3,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputContainer: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    inputInfo: {
        fontSize: 11,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
    },
    disabledInput: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1E293B',
    },
    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingLeft: 12,
        overflow: 'hidden',
    },
    pickerIcon: {
        marginRight: 4,
    },
    picker: {
        flex: 1,
        height: 50,
        color: '#1E293B',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfWidth: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    infoLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    highlightValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2563EB',
    },
    toggle: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
    },
    toggleActive: {
        backgroundColor: '#2563EB',
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    toggleTextActive: {
        color: '#fff',
    },
    actionButton: {
        backgroundColor: '#EFF6FF',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    actionButtonText: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 8,
    },
    bankNoteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFBEB',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    bankNoteText: {
        flex: 1,
        fontSize: 12,
        color: '#92400E',
        lineHeight: 18,
    },
    cashTipBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        gap: 8,
    },
    cashTipText: {
        flex: 1,
        fontSize: 13,
        color: '#1E40AF',
        lineHeight: 18,
    },
    disclaimerBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 8,
        marginBottom: 24,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 11,
        color: '#94A3B8',
        lineHeight: 16,
    },
});

export default MortgageCalculatorScreen;
