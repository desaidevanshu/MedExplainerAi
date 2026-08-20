import { auth, googleProvider } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth'

export const registerWithEmail = async (name: string, email: string, password: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  return cred
}

export const loginWithEmail = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred
}

export const signInWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider)
  return cred
}

export const logout = async () => {
  await signOut(auth)
}
