import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { MyColours } from '../Utils/MyColours';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authentication } from '../../Firebaseconfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';

const Signup = () => {
  const [isVisible, setisVisisble] = useState(true)
  const [userCredentials, setuserCredentials] = useState({
    name:'',
    email:"",
    password:"",
  });

  const{email,password, name} = userCredentials
console.log(name)
const uid=uuid.v4()
  const userAccount = () =>{
  createUserWithEmailAndPassword(authentication,email, password)
  .then(() => {
    Alert.alert ('User account created & signed in!');
    setDoc(doc(database,'users',uid ),{
      username:name,
      email,email,
      uid:authentication.currentUser.uid
    } )
  })
  .catch(error => {
    if (error.code === 'auth/email-already-in-use') {
      Alert.alert ('That email address is already in use!');
    }

    if (error.code === 'auth/invalid-email') {
      console.log('That email address is invalid!');
    }

    console.error(error);
  });
  }


  const nav= useNavigation()


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MyColours.secondary }}>
      <StatusBar />
      <ScrollView style={{ flex: 1, paddingTop: 30 }}>

        <Image style={{ backgroundColor: "red", alignSelf: "center" }} source={require("../assets/Freshlogo.png")}
        />

        <View style={{ paddingHorizontal: 20, marginTop: 1 }}>
          <Text style={{ color: MyColours.third, fontSize: 24, fontWeight: "500" }}> Sign Up </Text>
          <Text style={{ fontSize: 16, fontWeight: "400", color: 'grey', marginTop: 20 }}>Enter your information to continue </Text>


          <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 40 }}> Username</Text>

          <TextInput 
          maxLength={20}
          value={name}
          onChangeText={(val) =>{
            setuserCredentials({...userCredentials,name:val})
          }}
          keyboardType= "name-phone-pad"
          style={{borderColor:'#E3E3E3',borderBottomWidth:2, fontSize:16, marginTop:10}}/>
          <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 40 }}> Email</Text>

          <TextInput 
          value={email}
          onChangeText={(val) =>{
            setuserCredentials ({...userCredentials,email:val})
          }}
          keyboardType= "email-address"
          style={{borderColor:'#E3E3E3',borderBottomWidth:2, fontSize:16, marginTop:10}}/>
          <Text style={{ fontSize: 16, fontWeight: "500", color: "grey", marginTop: 20 }}> Password</Text>


          <View style={{borderColor:'#E3E3E3',borderBottomWidth:2, flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}>
            <TextInput
              value={password}
              onChangeText={(val) =>{
                setuserCredentials ({...userCredentials,password:val})
              }}
              secureTextEntry={isVisible}
              maxLength={13}
              keyboardType="ascii-capable"
              style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, fontSize: 17, marginTop: 15, flex:0.5, }} />
             <Ionicons onPress={() =>{
            setisVisisble(!isVisible)
             }} name={isVisible==true?"eye-off-outline":'eye-outline' }size={24} color="black" />

          </View>

          <Text numberOfLines={2} style={{fontSize:14, fontWeight:'400', color:'black',marginTop:15, letterSpacing:0.7,lineHeight:25,width:"95%",opacity:0.7}}>
            By continuing you agree to our Terms of Service and Privcy Policy
          </Text>

          <TouchableOpacity onPress={ userAccount }
          
          style={{backgroundColor:MyColours.primary, marginTop:30,height:70,borderRadius:60, justifyContent:'center',alignItems:'center'}}>
          <Text style={{fontSize:20,color:MyColours.secondary}}> Sign Up </Text> 
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 16 }}> Already have an account? </Text>

            <TouchableOpacity onPress={() => {
              nav.navigate('Login')
            }}>
              <Text style={{ fontSize: 16, color: MyColours.primary, fontWeight: 600 }}> Login Now </Text>
            </TouchableOpacity>

          </View>
        </View>

        

      </ScrollView>
    </SafeAreaView>
  ) 
}

export default Signup