
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseAuth";

export async function testFirebaseSignIn(
  email: string,
  password: string
) {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user.uid;
}
