
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from './firebaseConfig';

const app = initializeApp(firebaseConfig);

export default function App() {
    const [status, setStatus] = useState('Connecting to Firebase...');
    const [user, setUser] = useState(null);
    const [firestoreResult, setFirestoreResult] = useState('');
    const [storageResult, setStorageResult] = useState('');

    useEffect(() => {
        setStatus('Initializing Firebase...');
        const auth = getAuth(app);
        signInAnonymously(auth)
            .then(() => setStatus('Signed in anonymously!'))
            .catch((e) => setStatus('Auth error: ' + e.message));
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                // Firestore test: write and read a test doc
                const db = getFirestore(app);
                const testRef = doc(db, 'testCollection', 'testDoc');
                setDoc(testRef, { testField: 'Hello Firestore!' })
                    .then(() => getDoc(testRef))
                    .then((docSnap) => {
                        if (docSnap.exists()) {
                            setFirestoreResult(docSnap.data().testField);
                        } else {
                            setFirestoreResult('No doc found');
                        }
                    })
                    .catch((e) => setFirestoreResult('Firestore error: ' + e.message));

                // Storage test: upload and get download URL for a text file
                const storage = getStorage(app);
                const storageRef = ref(storage, 'testFolder/testFile.txt');
                const testContent = new Uint8Array(Buffer.from('Hello Firebase Storage!'));
                uploadBytes(storageRef, testContent)
                    .then(() => getDownloadURL(storageRef))
                    .then((url) => setStorageResult('File uploaded! URL: ' + url))
                    .catch((e) => setStorageResult('Storage error: ' + e.message));
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Welcome to NavaApp!</Text>
            <Text style={styles.status}>{status}</Text>
            {user && <Text>User ID: {user.uid}</Text>}
            {firestoreResult ? <Text>Firestore: {firestoreResult}</Text> : null}
            {storageResult ? <Text numberOfLines={1} ellipsizeMode="middle">Storage: {storageResult}</Text> : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        color: '#3B82F6',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    status: {
        fontSize: 16,
        marginBottom: 10,
    },
});
