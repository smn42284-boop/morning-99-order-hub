
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { database } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";

export const Route = createFileRoute("/firebase-text")({
  component: FirebaseTest,
});

function FirebaseTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignIn() {
    setMessage("Signing in...");

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setMessage(`Signed in successfully! User ID: ${result.user.uid}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sign-in failed."
      );
    }
  }
  async function handleDatabaseTest() {
  setMessage("Testing database...");

  try {
    const testRef = ref(database, "connectionTest");

    await set(testRef, {
      message: "Firebase connection works",
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await get(testRef);

    if (snapshot.exists()) {
      setMessage(`Database works! ${snapshot.val().message}`);
    } else {
      setMessage("Write completed, but no data was found.");
    }
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Database test failed."
    );
  }
}

  return (
    <div style={{ padding: 24 }}>
      <h1>Firebase Sign-in Test</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSignIn}>Sign in</button>
<br /><br />
<button onClick={handleDatabaseTest}>
  Test Database
</button>
      <p>{message}</p>
    </div>
  );
}
