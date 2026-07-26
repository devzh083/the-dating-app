import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export function useIncomingLikes(userEmail: string) {
  const [incomingLikes, setIncomingLikes] = useState<any[]>([]);

  useEffect(() => {
    if (!userEmail) return;

    const q = query(
      collection(db, "incoming_likes"),
      where("to_email", "==", userEmail)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const likes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncomingLikes(likes);
    });

    return () => unsub();
  }, [userEmail]);

  return incomingLikes;
}
