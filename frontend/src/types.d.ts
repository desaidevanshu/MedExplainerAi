declare module 'firebase/app' {
  const app: any
  export default app
  export const initializeApp: any
}

declare module 'firebase/auth' {
  export const auth: any
  export const getAuth: any
  export const createUserWithEmailAndPassword: any
  export const signInWithEmailAndPassword: any
  export const signOut: any
  export const onAuthStateChanged: any
  export const GoogleAuthProvider: any
  export const signInWithPopup: any
}
