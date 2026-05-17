import { useState, useEffect, useRef, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

async function migrateKeyFromLocalStorage(uid, key, defaultValue) {
  const docRef = doc(db, 'users', uid, 'data', key)
  const snap = await getDoc(docRef)
  if (snap.exists()) return // Firestore already has data, skip
  const stored = localStorage.getItem(key)
  if (!stored) return // nothing in localStorage either
  try {
    const value = JSON.parse(stored)
    await setDoc(docRef, { value })
  } catch { /* ignore */ }
}

export function useFirestoreData(key, defaultValue) {
  const user = useAuth()
  const uid = user?.uid ?? null

  const [data, setDataState] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const writeTimer = useRef(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    // auth still initializing
    if (user === undefined) return

    // not logged in
    if (!uid) {
      loadedRef.current = false
      setDataState(defaultValue)
      setLoading(false)
      return
    }

    setLoading(true)
    loadedRef.current = false

    const run = async () => {
      try {
        // Attempt one-time migration from localStorage
        await migrateKeyFromLocalStorage(uid, key, defaultValue)
        // Load from Firestore
        const snap = await getDoc(doc(db, 'users', uid, 'data', key))
        if (snap.exists()) {
          const val = snap.data().value
          if (val !== undefined) setDataState(val)
        }
      } catch (e) {
        console.error(`[Firestore] load ${key}:`, e)
      } finally {
        loadedRef.current = true
        setLoading(false)
      }
    }

    run()

    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current)
      loadedRef.current = false
    }
  }, [uid])  // intentionally omit key/defaultValue (they don't change)

  const setValue = useCallback((updater) => {
    setDataState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (uid && loadedRef.current) {
        if (writeTimer.current) clearTimeout(writeTimer.current)
        writeTimer.current = setTimeout(() => {
          setDoc(doc(db, 'users', uid, 'data', key), { value: next })
            .catch(e => console.error(`[Firestore] write ${key}:`, e))
        }, 600)
      }
      return next
    })
  }, [uid, key])

  return [data, setValue, loading]
}
