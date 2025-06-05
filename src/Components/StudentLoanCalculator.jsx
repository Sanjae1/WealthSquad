import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Card, HelperText, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider'; // Import Slider

const CALCULATION_MODES = {
  CALC_PAYMENT: 'calcPayment',
  CALC_TERM: 'calcTerm'
};

// Helper function to remove non-numeric characters except decimal for parsing
const cleanNumberString = (numStr) => numStr.replace(/[^0-9.]/g, '');

// Helper function to format number with commas for display
const formatNumberWithCommas = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  // Handle very small numbers that toLocaleString might format in scientific notation
  if (Math.abs(value) < 0.000001 && value !== 0) {
    return value.toFixed(2); // Or however many decimals you need
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Custom debounce hook
const useDebounce = (callback, delay) => {
  const timeoutRef = React.useRef(null);

  return useCallback((value) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(value);
    }, delay);
  }, [callback, delay]);
};

const StudentLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(''); // This will store the raw input
  const [displayLoanAmount, setDisplayLoanAmount] = useState(''); // This will store the formatted string for display

  const [interestRate, setInterestRate] = useState('5');
  const [loanTerm, setLoanTerm] = useState('10'); // In years
  const [extraPayment, setExtraPayment] = useState('');
  const [calculationMode, setCalculationMode] = useState(CALCULATION_MODES.CALC_PAYMENT);
  const [desiredMonthlyPayment, setDesiredMonthlyPayment] = useState('');

  const handleReset = () => {
    setLoanAmount('');
    setDisplayLoanAmount('');
    setInterestRate('5');
    setLoanTerm('10');
    setExtraPayment('');
    setCalculationMode(CALCULATION_MODES.CALC_PAYMENT);
    setDesiredMonthlyPayment('');
  };

  // --- Input Handlers with Masking ---
  const handleLoanAmountChange = (text) => {
    const numericValue = cleanNumberString(text);
    setLoanAmount(numericValue); // Store the raw numeric string for calculations

    if (numericValue === '' || numericValue === '.') {
      setDisplayLoanAmount(numericValue); // Allow typing a decimal point or clearing
    } else {
      const num = parseFloat(numericValue);
      if (!isNaN(num)) {
        // Format with commas for display, but without the $ sign for the input field itself
        setDisplayLoanAmount(num.toLocaleString('en-US', {maximumFractionDigits: 2, useGrouping: true}).replace(/\$/g, ''));
      } else {
        setDisplayLoanAmount(numericValue); // Show what was typed if it's not a valid start of a number
      }
    }
  };

  const results = useMemo(() => {
    // Use the raw 'loanAmount' for parsing, not 'displayLoanAmount'
    const principal = parseFloat(cleanNumberString(loanAmount)); // Clean before parsing
    const annualInterestRate = parseFloat(interestRate);
    const termInYearsInput = parseInt(loanTerm, 10);
    const additionalMonthlyPaymentInput = parseFloat(cleanNumberString(extraPayment)) || 0; // Clean before parsing
    const desiredPaymentInput = parseFloat(cleanNumberString(desiredMonthlyPayment)); // Clean before parsing


    let warningMessage = null;

    if (isNaN(principal) || principal <= 0) {
      warningMessage = "Loan amount must be a positive number.";
    } else if (isNaN(annualInterestRate) || annualInterestRate < 0) {
      warningMessage = "Interest rate cannot be negative.";
    }

    // ... (rest of your useMemo calculation logic remains the same)
    // Ensure all parseFloat calls within useMemo also use cleanNumberString if those inputs could have formatting
    // For example, if extraPayment or desiredMonthlyPayment could have commas from future masking:
    // const additionalMonthlyPaymentInput = parseFloat(cleanNumberString(extraPayment)) || 0;
    // const desiredPaymentInput = parseFloat(cleanNumberString(desiredMonthlyPayment));

    // The existing return structure for warnings is fine
    if (warningMessage) {
      return { /* ... existing warning return ... */
        minimumMonthlyPayment: '0.00', yourMonthlyPayment: '0.00', totalInterest: '0.00',
        totalPaid: '0.00', amortization: [], payoffTimeYears: 0, payoffTimeMonthsRem: 0,
        interestSaved: '0.00', timeSavedYears: 0, timeSavedMonthsRem: 0,
        actualNumberOfPayments: 0, warningMessage,
      };
    }

    const monthlyInterestRate = annualInterestRate / 100 / 12;
    let N_calculated;
    let M_actual;

    if (calculationMode === CALCULATION_MODES.CALC_TERM) {
      if (isNaN(desiredPaymentInput) || desiredPaymentInput <= 0) {
        warningMessage = "Desired monthly payment must be a positive number.";
      } else if (monthlyInterestRate > 0 && desiredPaymentInput <= principal * monthlyInterestRate + 0.001) {
        warningMessage = "Desired payment is too low to cover interest. Loan balance will not decrease.";
      }

      if (warningMessage) {
        return { /* ... existing warning return ... */
          minimumMonthlyPayment: '0.00', yourMonthlyPayment: desiredPaymentInput > 0 ? formatNumberWithCommas(desiredPaymentInput) : '0.00', totalInterest: 'N/A',
          totalPaid: 'N/A', amortization: [{month: 1, balance: principal}], payoffTimeYears: 0, payoffTimeMonthsRem: 0,
          interestSaved: '0.00', timeSavedYears: 0, timeSavedMonthsRem: 0,
          actualNumberOfPayments: 0, warningMessage,
        };
      }

      M_actual = desiredPaymentInput;
      if (monthlyInterestRate === 0) {
        N_calculated = principal / M_actual;
      } else {
        const termCalcNumerator = Math.log(1 - (principal * monthlyInterestRate) / M_actual);
        const termCalcDenominator = Math.log(1 + monthlyInterestRate);
        if (isNaN(termCalcNumerator) || isNaN(termCalcDenominator) || termCalcDenominator === 0) {
            warningMessage = "Cannot calculate a valid loan term. Payment might be too low or inputs invalid.";
             N_calculated = Infinity; // Or some other indicator of failure
        } else {
            N_calculated = -termCalcNumerator / termCalcDenominator;
        }
      }

      if (!isFinite(N_calculated) || N_calculated <= 0) {
        warningMessage = warningMessage || "Cannot calculate a valid loan term with the provided payment. Payment might be too low."; // Preserve earlier warning
        return { /* ... existing warning return ... */
          minimumMonthlyPayment: '0.00', yourMonthlyPayment: desiredPaymentInput > 0 ? formatNumberWithCommas(desiredPaymentInput) : '0.00', totalInterest: 'N/A',
          totalPaid: 'N/A', amortization: [{month: 1, balance: principal}], payoffTimeYears: 0, payoffTimeMonthsRem: 0,
          interestSaved: '0.00', timeSavedYears: 0, timeSavedMonthsRem: 0,
          actualNumberOfPayments: 0, warningMessage,
        };
      }
      N_calculated = Math.ceil(N_calculated);
    } else { // CALC_PAYMENT mode
      if (isNaN(termInYearsInput) || termInYearsInput <= 0) {
        warningMessage = "Loan term must be a positive number of years.";
      } else if (additionalMonthlyPaymentInput < 0) {
        warningMessage = "Extra payment cannot be negative.";
      }

      if (warningMessage) {
        return { /* ... existing warning return ... */
            minimumMonthlyPayment: '0.00', yourMonthlyPayment: '0.00', totalInterest: '0.00',
            totalPaid: '0.00', amortization: [], payoffTimeYears: 0, payoffTimeMonthsRem: 0,
            interestSaved: '0.00', timeSavedYears: 0, timeSavedMonthsRem: 0,
            actualNumberOfPayments: 0, warningMessage,
        };
      }

      const originalNumberOfPayments = termInYearsInput * 12;
      let minimumMonthlyPayment;
      if (monthlyInterestRate === 0) {
        minimumMonthlyPayment = principal / originalNumberOfPayments;
      } else {
        minimumMonthlyPayment =
          (principal * monthlyInterestRate) /
          (1 - Math.pow(1 + monthlyInterestRate, -originalNumberOfPayments));
      }

      if (!isFinite(minimumMonthlyPayment) || isNaN(minimumMonthlyPayment)) {
        warningMessage = "Calculation error for minimum payment.";
        return { /* ... existing warning return ... */
            minimumMonthlyPayment: '0.00', yourMonthlyPayment: '0.00', totalInterest: '0.00',
            totalPaid: '0.00', amortization: [], payoffTimeYears: 0, payoffTimeMonthsRem: 0,
            interestSaved: '0.00', timeSavedYears: 0, timeSavedMonthsRem: 0,
            actualNumberOfPayments: 0, warningMessage,
        };
      }

      M_actual = minimumMonthlyPayment + additionalMonthlyPaymentInput;
      N_calculated = originalNumberOfPayments;

      if (principal > 0 && monthlyInterestRate > 0 && M_actual <= principal * monthlyInterestRate + 0.001) {
        warningMessage = "Payment is too low to cover interest. Loan balance will not decrease.";
        return { /* ... existing warning return ... */
          minimumMonthlyPayment: formatNumberWithCommas(minimumMonthlyPayment),
          yourMonthlyPayment: formatNumberWithCommas(M_actual),
          totalInterest: 'N/A', totalPaid: 'N/A', amortization: [{ month: 1, balance: principal }],
          payoffTimeYears: 0, payoffTimeMonthsRem: 0, interestSaved: '0.00',
          timeSavedYears: 0, timeSavedMonthsRem: 0, actualNumberOfPayments: 0, warningMessage
        };
      }
    }

    const amortizationData = [];
    let remainingBalance = principal;
    let totalInterestPaid = 0;
    let actualPaymentCount = 0;
    // Ensure N_calculated is a valid number before using it in maxIterations
    const validNForIteration = (isFinite(N_calculated) && N_calculated > 0) ? N_calculated : (30 * 12); // Default to 30 years if N is bad
    const maxIterations = (calculationMode === CALCULATION_MODES.CALC_TERM ? validNForIteration : Math.max(validNForIteration, 30 * 12)) * 1.1;


    while (remainingBalance > 0.005 && actualPaymentCount < maxIterations && M_actual > 0) { // Added M_actual > 0 check
      actualPaymentCount++;
      const interestForMonth = remainingBalance * monthlyInterestRate;
      let paymentThisMonth = M_actual;
      let principalPaidForMonth;

      if (remainingBalance + interestForMonth <= M_actual) {
        paymentThisMonth = remainingBalance + interestForMonth;
        principalPaidForMonth = remainingBalance;
        remainingBalance = 0;
      } else {
        principalPaidForMonth = paymentThisMonth - interestForMonth;
        remainingBalance -= principalPaidForMonth;
      }
      totalInterestPaid += interestForMonth;
      amortizationData.push({ month: actualPaymentCount, balance: Math.max(0, remainingBalance) }); // Ensure balance doesn't go negative

      if (calculationMode === CALCULATION_MODES.CALC_PAYMENT && additionalMonthlyPaymentInput > 0 && remainingBalance <= 0.005) {
        break;
      }
    }

    if (remainingBalance > 0.005 && actualPaymentCount >= maxIterations && !warningMessage) {
      warningMessage = "Could not calculate full payoff (max iterations). Check inputs.";
    }
     if (M_actual <= 0 && principal > 0 && !warningMessage) {
      warningMessage = "Monthly payment must be greater than zero.";
    }


    const totalPaid = principal + totalInterestPaid;
    const payoffTimeYears = Math.floor(actualPaymentCount / 12);
    const payoffTimeMonthsRem = actualPaymentCount % 12;

    let interestSaved = 0;
    let timeSavedYears = 0;
    let timeSavedMonthsRem = 0;
    let displayMinimumMonthlyPayment = M_actual > 0 ? M_actual : 0; // Ensure it's not NaN for toFixed

    if (calculationMode === CALCULATION_MODES.CALC_PAYMENT) {
      const originalNumberOfPayments = termInYearsInput * 12;
      // Ensure M_actual and additionalMonthlyPaymentInput are numbers before subtraction
      const basePayment = (typeof M_actual === 'number' ? M_actual : 0) - (typeof additionalMonthlyPaymentInput === 'number' ? additionalMonthlyPaymentInput : 0);
      displayMinimumMonthlyPayment = basePayment > 0 ? basePayment : 0;


      if (additionalMonthlyPaymentInput > 0) {
        let originalTotalInterest = 0;
        if (displayMinimumMonthlyPayment > 0 && principal > 0 && originalNumberOfPayments > 0) {
          const originalTotalPaid = displayMinimumMonthlyPayment * originalNumberOfPayments;
          originalTotalInterest = Math.max(0, originalTotalPaid - principal);
        }
        interestSaved = Math.max(0, originalTotalInterest - totalInterestPaid);
        const timeSavedInMonths = Math.max(0, originalNumberOfPayments - actualPaymentCount);
        timeSavedYears = Math.floor(timeSavedInMonths / 12);
        timeSavedMonthsRem = timeSavedInMonths % 12;
      }
    }
    
    // Ensure M_actual is a number before calling toFixed
    const finalYourMonthlyPayment = typeof M_actual === 'number' && isFinite(M_actual) ? M_actual : 0;
    const finalDisplayMinimumMonthlyPayment = typeof displayMinimumMonthlyPayment === 'number' && isFinite(displayMinimumMonthlyPayment) ? displayMinimumMonthlyPayment : 0;
    const finalTotalInterestPaid = typeof totalInterestPaid === 'number' && isFinite(totalInterestPaid) ? totalInterestPaid : 0;
    const finalTotalPaid = typeof totalPaid === 'number' && isFinite(totalPaid) ? totalPaid : 0;
    const finalInterestSaved = typeof interestSaved === 'number' && isFinite(interestSaved) ? interestSaved : 0;


    return {
      minimumMonthlyPayment: formatNumberWithCommas(finalDisplayMinimumMonthlyPayment),
      yourMonthlyPayment: formatNumberWithCommas(finalYourMonthlyPayment),
      totalInterest: formatNumberWithCommas(finalTotalInterestPaid),
      totalPaid: formatNumberWithCommas(finalTotalPaid),
      amortization: amortizationData,
      payoffTimeYears,
      payoffTimeMonthsRem,
      actualNumberOfPayments: actualPaymentCount,
      interestSaved: formatNumberWithCommas(finalInterestSaved),
      timeSavedYears,
      timeSavedMonthsRem,
      warningMessage,
    };

  }, [loanAmount, interestRate, loanTerm, extraPayment, calculationMode, desiredMonthlyPayment]);

  const displayPrincipalRaw = parseFloat(cleanNumberString(loanAmount));
  const validPrincipal = !isNaN(displayPrincipalRaw) && displayPrincipalRaw > 0 ? displayPrincipalRaw : 0;
  const hasExtraPayment = calculationMode === CALCULATION_MODES.CALC_PAYMENT && (parseFloat(cleanNumberString(extraPayment)) || 0) > 0;


  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Card.Title title="Student Loan Calculator" titleStyle={styles.cardTitle} />
        <Card.Content>
          <Button 
            mode="outlined" 
            onPress={handleReset}
            style={styles.resetButton}
            labelStyle={styles.resetButtonLabel}
          >
            Reset Calculator
          </Button>

          <Text style={styles.label}>Calculation Mode</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={calculationMode}
              onValueChange={(itemValue) => setCalculationMode(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Calculate Payment (given Term)" value={CALCULATION_MODES.CALC_PAYMENT} />
              <Picker.Item label="Calculate Term (given Payment)" value={CALCULATION_MODES.CALC_TERM} />
            </Picker>
          </View>

          <Text style={styles.label}>Loan Amount ($)</Text>
          <View>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30,000"
              keyboardType="numeric"
              value={displayLoanAmount} // Show formatted value
              onChangeText={handleLoanAmountChange} // Use custom handler
            />
             <HelperText type="info" visible={!!loanAmount && parseFloat(cleanNumberString(loanAmount)) > 0}>
              {`Entered: $${formatNumberWithCommas(parseFloat(cleanNumberString(loanAmount)))}`}
            </HelperText>
          </View>
          
          <Text style={styles.label}>Annual Interest Rate ({interestRate}%)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 5"
            keyboardType="numeric"
            value={interestRate}
            onChangeText={setInterestRate}
          />
          {calculationMode === CALCULATION_MODES.CALC_PAYMENT && (
            <Slider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={25}
              step={0.1}
              value={parseFloat(interestRate) || 0}
              onSlidingComplete={(value) => setInterestRate(value.toFixed(1))}
              minimumTrackTintColor="#007bff"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#007bff"
            />
          )}

          {calculationMode === CALCULATION_MODES.CALC_PAYMENT && (
            <>
              <Text style={styles.label}>Loan Term ({loanTerm} Years)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={loanTerm}
                  onValueChange={(itemValue) => setLoanTerm(itemValue)}
                  style={styles.picker}
                >
                  {[1,2,3,4,5, 7, 10, 12, 15, 20, 25, 30].sort((a,b) => a-b).map(term => (
                    <Picker.Item key={term} label={`${term} Years`} value={String(term)} />
                  ))}
                </Picker>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={30}
                step={1}
                value={parseInt(loanTerm, 10) || 1}
                onSlidingComplete={(value) => setLoanTerm(String(Math.round(value)))}
                minimumTrackTintColor="#007bff"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#007bff"
              />

              <Text style={styles.label}>Extra Monthly Payment ($) (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100"
                keyboardType="numeric"
                value={extraPayment}
                onChangeText={setExtraPayment} // Can add masking here
              />
            </>
          )}

          {calculationMode === CALCULATION_MODES.CALC_TERM && (
            <>
              <Text style={styles.label}>Desired Monthly Payment ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 500"
                keyboardType="numeric"
                value={desiredMonthlyPayment}
                onChangeText={setDesiredMonthlyPayment} // Can add masking here
              />
            </>
          )}

          {/* --- Results Display --- */}
          {results.warningMessage && (
            <HelperText type="error" visible={!!results.warningMessage} style={styles.warningText}>
              {results.warningMessage}
            </HelperText>
          )}

          {/* Conditional rendering of results */}
          {validPrincipal > 0 && !results.warningMessage && results.yourMonthlyPayment !== 'NaN.undefined' && parseFloat(cleanNumberString(results.yourMonthlyPayment)) > 0  && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultHeader}>Loan Summary</Text>
              <Text style={styles.resultText}>
                {calculationMode === CALCULATION_MODES.CALC_PAYMENT && hasExtraPayment ? "Minimum Payment:" : "Monthly Payment:"}
                <Text style={styles.resultValue}> ${calculationMode === CALCULATION_MODES.CALC_TERM ? results.yourMonthlyPayment : results.minimumMonthlyPayment}</Text>
              </Text>
              {calculationMode === CALCULATION_MODES.CALC_PAYMENT && hasExtraPayment && (
                <Text style={styles.resultTextHighlight}>
                  Your Actual Payment: 
                  <Text style={styles.resultValue}> ${results.yourMonthlyPayment}</Text>
                </Text>
              )}

              <Text style={styles.resultText}>
                Payoff Time: 
                <Text style={styles.resultValue}>
                  {results.payoffTimeYears > 0 ? ` ${results.payoffTimeYears} Year${results.payoffTimeYears > 1 ? 's' : ''}` : ''}
                  {results.payoffTimeYears > 0 && results.payoffTimeMonthsRem > 0 ? ', ' : ''}
                  {results.payoffTimeMonthsRem > 0 || (results.payoffTimeYears === 0 && results.actualNumberOfPayments > 0) ? `${results.payoffTimeMonthsRem} Month${results.payoffTimeMonthsRem !== 1 ? 's' : ''}` : ''}
                  {(results.actualNumberOfPayments === 0 && (results.payoffTimeYears !== 0 || results.payoffTimeMonthsRem !== 0)) && 'N/A'}
                </Text>
              </Text>

              <Text style={styles.resultText}>
                Total Principal: 
                <Text style={styles.resultValue}> ${formatNumberWithCommas(validPrincipal)}</Text>
              </Text>
              <Text style={styles.resultText}>
                Total Interest: 
                <Text style={styles.resultValue}> ${results.totalInterest}</Text>
              </Text>
              <Text style={styles.resultText}>
                Total Paid: 
                <Text style={styles.resultValue}> ${results.totalPaid}</Text>
              </Text>

              {calculationMode === CALCULATION_MODES.CALC_PAYMENT && hasExtraPayment && parseFloat(cleanNumberString(results.interestSaved)) > 0 && (
                <View style={styles.savingsSection}>
                  <Text style={styles.savingsHeader}>With Extra Payments:</Text>
                  <Text style={styles.savingsText}>
                    Interest Saved: 
                    <Text style={styles.resultValue}> ${results.interestSaved}</Text>
                  </Text>
                  <Text style={styles.savingsText}>
                    Time Saved: 
                    <Text style={styles.resultValue}>
                    {results.timeSavedYears > 0 ? ` ${results.timeSavedYears} Year${results.timeSavedYears > 1 ? 's' : ''}` : ''}
                    {results.timeSavedYears > 0 && results.timeSavedMonthsRem > 0 ? ', ' : ''}
                    {results.timeSavedMonthsRem > 0 || (results.timeSavedYears === 0 && (parseFloat(cleanNumberString(extraPayment)) || 0) > 0 && (parseFloat(cleanNumberString(results.interestSaved)) > 0 || (results.timeSavedYears > 0 || results.timeSavedMonthsRem > 0))) ? `${results.timeSavedMonthsRem} Month${results.timeSavedMonthsRem !== 1 ? 's' : ''}` : ''}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}
           {/* Info text if loan amount is entered but still results in zero/invalid calculation (e.g. only loan amount is filled) */}
          {loanAmount !== '' && parseFloat(cleanNumberString(loanAmount)) > 0 && (parseFloat(cleanNumberString(results.yourMonthlyPayment)) === 0 || results.yourMonthlyPayment === 'NaN.undefined') && !results.warningMessage && (
             <HelperText type="info" visible={true} style={styles.infoText}>
                 Enter all required fields (Interest Rate, Term/Desired Payment) to calculate.
             </HelperText>
           )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7', // Slightly different background
  },
  card: {
    margin: 15,
    borderRadius: 10, // More rounded
    elevation: 4, // Slightly more elevation
    shadowOffset: { width: 0, height: 2 },
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 24, // Larger title
    fontWeight: '700', // Bolder
    color: '#2c3e50', // Darker blue-grey
    textAlign: 'center',
    paddingTop: 10, // Add some padding
  },
  label: {
    fontSize: 16, // Slightly larger label
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#34495e', // Another shade of blue-grey
  },
  input: {
    height: 50, // Taller input
    borderColor: '#bdc3c7', // Softer grey border
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#ecf0f1', // Light grey background for input
    fontSize: 16,
    color: '#2c3e50',
    // marginBottom is removed here, spacing handled by HelperText or next element's marginTop
  },
  pickerContainer: {
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10, // Spacing after picker
    backgroundColor: '#ecf0f1',
    height: Platform.OS === 'ios' ? undefined : 52,
    justifyContent: Platform.OS === 'ios' ? undefined : 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50, // Adjusted iOS picker height
    width: '100%',
    color: '#2c3e50',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 15, // Space after slider
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007bff',
    textAlign: 'center',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 26, // Increased line height
    marginBottom: 6,
    color: '#495057', // Dark grey for text
  },
  resultValue: { // Style for the actual numbers in results
    fontWeight: 'bold',
    color: '#28a745', // Green for positive values
  },
  resultTextHighlight: {
    fontSize: 17, // Slightly larger for emphasis
    lineHeight: 28,
    marginTop: 6,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#17a2b8', // Info blue
    backgroundColor: '#e7f5ff', // Very light blue background
    padding: 8,
    borderRadius: 5,
  },
  savingsSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#dee2e6',
  },
  savingsHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 6,
    color: '#5cb85c', // Lighter green
  },
  warningText: { // For HelperText type="error"
    // fontSize: 14, // Handled by HelperText default
    // color: '#dc3545', // Handled by HelperText default
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  infoText: { // For HelperText type="info"
    textAlign: 'center',
    marginBottom: 10,
    // color: '#17a2b8', // Handled by HelperText default
  },
  resetButton: {
    alignSelf: 'center', // Center the button
    marginBottom: 25,
    marginTop: 5,
    borderColor: '#6c757d', // Grey border
    paddingHorizontal: 10,
  },
  resetButtonLabel: {
    color: '#6c757d', // Grey text
    fontSize: 15,
  },
});

export default StudentLoanCalculator;