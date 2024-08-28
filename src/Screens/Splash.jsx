import { View, Text, Image } from 'react-native'
import React, {useEffect} from 'react'
import {MyColours} from '../Utils/MyColours'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'


const Splash = () => {

const nav=useNavigation()

  useEffect(()=>{
    setTimeout(() => {
  nav.replace("Signup")
    },2000);
  }, []);



  return (
    <View style={{backgroundColor:MyColours.primary,flex:1, justifyContent:'center'}}>
      <StatusBar style='light' />
    <View style={{
flexDirection: "row",
alignItems:"center",
justifyContent:"center",
gap:15

    }}>
  <Image 
  style={{height:75, width: 65}}
  source={require('../assets/Splashicon.png')} />

<View>
  <Text style= {{fontSize:75,color:MyColours.secondary}}>FreshStart</Text>
  <Text  style={{color:MyColours.secondary,fontSize:17,alignItems:"center",letterSpacing:5, top:-5}}> App</Text>
</View>


    </View>
    </View>
  )
}

export default Splash