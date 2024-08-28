
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore} from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEE6g3RbThdtAHVcwwyynZUlul7C-B6PM",
  authDomain: "dollarwise-e7b13.firebaseapp.com",
  projectId: "dollarwise-e7b13",
  storageBucket: "dollarwise-e7b13.appspot.com",
  messagingSenderId: "820084513580",
  appId: "1:820084513580:web:81dd4ed88c23b8c7056a89"
};


const app = initializeApp(firebaseConfig);
 const authentication=getAuth(app, AsyncStorage )
 const database = getFirestore();

 export {authentication,database};