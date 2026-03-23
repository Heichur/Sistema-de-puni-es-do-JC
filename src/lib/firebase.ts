import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const configDB1 = {
  apiKey: "AIzaSyCAE3yU7h6L6h3ladtJOHMYZ8-ZCtl6Ac8",
  authDomain: "punicoesdb1.firebaseapp.com",
  projectId: "punicoesdb1",
  storageBucket: "punicoesdb1.firebasestorage.app",
  messagingSenderId: "875448950893",
  appId: "1:875448950893:web:a57955d699fb1575f41f64",
};

const configDB2 = {
  apiKey: "AIzaSyDYXGZSPjUEqf2HMoNONpLtq1DmXXiOCSg",
  authDomain: "punicoesimgdb2.firebaseapp.com",
  projectId: "punicoesimgdb2",
  storageBucket: "punicoesimgdb2.firebasestorage.app",
  messagingSenderId: "447904697446",
  appId: "1:447904697446:web:cabc995faa1f4db48af1a7",
};

let _appDB1: FirebaseApp | null = null;
let _appDB2: FirebaseApp | null = null;
let _db1: Firestore | null = null;
let _db2: Firestore | null = null;
let _storage2: FirebaseStorage | null = null;

export function getDB1(): Firestore {
  if (!_db1) {
    _appDB1 = getApps().find(a => a.name === 'db1') ?? initializeApp(configDB1, 'db1');
    _db1 = getFirestore(_appDB1);
  }
  return _db1;
}

export function getDB2(): Firestore {
  if (!_db2) {
    _appDB2 = getApps().find(a => a.name === 'db2') ?? initializeApp(configDB2, 'db2');
    _db2 = getFirestore(_appDB2);
  }
  return _db2;
}

// Storage do DB2 — Imagens
export function getStorage2(): FirebaseStorage {
  if (!_storage2) {
    _appDB2 = getApps().find(a => a.name === 'db2') ?? initializeApp(configDB2, 'db2');
    _storage2 = getStorage(_appDB2);
  }
  return _storage2;
}