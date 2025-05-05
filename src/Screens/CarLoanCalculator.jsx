import React, { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { LineChart } from "react-native-chart-kit" 

const CarLoanCalculator = () => {
  const [saleAmount, setSaleAmount] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [amountToBorrow, setAmountToBorrow] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [years, setYears] = useState("")
  const [monthlyPayment, setMonthlyPayment] = useState("")
  const [vehicleType, setVehicleType] = useState("new")

  useEffect(() => {
    if (saleAmount) {
      const downPaymentAmount = Number.parseFloat(saleAmount) * 0.05
      setDownPayment(downPaymentAmount.toFixed(2))
      setAmountToBorrow((Number.parseFloat(saleAmount) - downPaymentAmount).toFixed(2))
    }
  }, [saleAmount])

  useEffect(() => {
    if (vehicleType === "new") {
      setInterestRate("7.50")
    } else {
      setInterestRate("8.50")
    }
  }, [vehicleType])

  const calculateMonthlyPayment = () => {
    const principal = Number.parseFloat(amountToBorrow)
    const rate = Number.parseFloat(interestRate) / 100 / 12
    const numberOfPayments = Number.parseFloat(years) * 12

    if (principal && rate && numberOfPayments) {
      const payment =
        (principal * rate * Math.pow(1 + rate, numberOfPayments)) / (Math.pow(1 + rate, numberOfPayments) - 1)
      setMonthlyPayment(payment.toFixed(2))
    }
  }

  const generateChartData = () => {
    const principal = Number.parseFloat(amountToBorrow)
    const rate = Number.parseFloat(interestRate) / 100 / 12
    const numberOfPayments = Number.parseFloat(years) * 12
    const payment = Number.parseFloat(monthlyPayment)

    let balance = principal
    const data = []

    for (let i = 0; i <= numberOfPayments; i += 12) {
      data.push(balance)
      for (let j = 0; j < 12 && i + j < numberOfPayments; j++) {
        const interest = balance * rate
        const principalPaid = payment - interest
        balance -= principalPaid
      }
    }

    return data
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Car Loan Calculator</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Sale Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={saleAmount}
          onChangeText={setSaleAmount}
          placeholder="Enter sale amount"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>95% Financing - Amount to Pay Down (5%)</Text>
        <Text style={styles.result}>${downPayment}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount to Borrow</Text>
        <Text style={styles.result}>${amountToBorrow}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={[styles.radioButton, vehicleType === "new" && styles.radioButtonSelected]}
            onPress={() => setVehicleType("new")}
          >
            <Text style={styles.radioButtonText}>New (7.50%)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, vehicleType === "used" && styles.radioButtonSelected]}
            onPress={() => setVehicleType("used")}
          >
            <Text style={styles.radioButtonText}>Used (8.50%)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Interest Rate</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={interestRate}
          onChangeText={setInterestRate}
          placeholder="Enter interest rate"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Years</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={years}
          onChangeText={setYears}
          placeholder="Enter loan term in years"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={calculateMonthlyPayment}>
        <Text style={styles.calculateButtonText}>Calculate</Text>
      </TouchableOpacity>

      {monthlyPayment !== "" && (
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Monthly Payment</Text>
          <Text style={styles.result}>${monthlyPayment}</Text>

          <Text style={styles.chartTitle}>Loan Balance Over Time</Text>
          <LineChart
            data={{
              labels: Array.from({ length: Number.parseInt(years) + 1 }, (_, i) => i.toString()),
              datasets: [{ data: generateChartData() }],
            }}
            width={300}
            height={200}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  radioButtonText: {
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
  },
  result: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
})

export default CarLoanCalculator

