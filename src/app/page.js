"use client"
import React, { useEffect } from 'react';
import Image from 'next/image'
import styles from './page.module.css'
import ResponsiveAppBar from './AppBar/page'
import Introduction from './Introduction/page'
import Portfolio from './Portfolio/page'
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGESENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#202129',  // Change this to the grey color you want
    },
  },
});

export default function Home() {
  
  let app;
  let analytics;

  if (typeof window !== 'undefined') {
    // Initialize Firebase Analytics
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
  }

  useEffect(() => {
    logEvent(analytics, 'app_first_load');
  }, [analytics]);

  return (
    <ThemeProvider theme={theme}>
    <main className={styles.main}>
      <ResponsiveAppBar/>
      <div className={styles.content}>
        <Introduction/>
        <Portfolio/>
      </div>
    </main>
    </ThemeProvider>
  )
}
