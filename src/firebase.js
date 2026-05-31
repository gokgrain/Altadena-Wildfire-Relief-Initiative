import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            'AIzaSyBOD61L827zD7uwgUnYbMCEImNCTEs1m_o',
  authDomain:        'time-box-54cbe.firebaseapp.com',
  projectId:         'time-box-54cbe',
  storageBucket:     'time-box-54cbe.firebasestorage.app',
  messagingSenderId: '677424492765',
  appId:             '1:677424492765:web:d459f1619b4487afa26b34',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
