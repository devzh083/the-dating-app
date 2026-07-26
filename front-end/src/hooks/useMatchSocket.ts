import { useEffect } from "react";
import { WS_ORIGIN } from "@/lib/config";

export function useMatchSocket(onEvent: (data: any) => void) {
  useEffect(() => {
    const ws = new WebSocket(`${WS_ORIGIN}/ws/notifications/`);

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    return () => ws.close();
  }, []);
}
