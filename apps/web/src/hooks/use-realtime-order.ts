import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/realtime";

interface OrderStatusEvent {
  orderNumber: string;
  status: string;
}

// Keeps the order-confirmation/tracking page in sync with kitchen/staff
// status updates without polling — invalidates the order query so React
// Query refetches the latest status the moment it changes server-side.
export function useRealtimeOrder(orderNumber: string | undefined, guestEmail: string | undefined) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderNumber) return;

    const socket = getSocket(session?.accessToken);
    socket.emit("order:subscribe", { orderNumber, guestEmail });

    const handleStatus = (event: OrderStatusEvent) => {
      if (event.orderNumber !== orderNumber) return;
      queryClient.invalidateQueries({ queryKey: ["orders", orderNumber] });
    };

    socket.on("order:status", handleStatus);
    return () => {
      socket.off("order:status", handleStatus);
    };
  }, [orderNumber, guestEmail, session?.accessToken, queryClient]);
}
