import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/realtime";

interface AdminOrderEvent {
  orderNumber: string;
  status: string;
  type: string;
  total: number;
}

interface OrderStatusEvent {
  orderNumber: string;
  status: string;
}

// Keeps the admin dashboard/orders list live: the server auto-joins
// authenticated ADMIN/EMPLOYEE sockets to its admin room (see
// RealtimeGateway.handleConnection), so just listening here is enough —
// no explicit subscribe call needed.
export function useRealtimeAdmin() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [lastEvent, setLastEvent] = useState<AdminOrderEvent | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    const socket = getSocket(session.accessToken);

    const handleNewOrder = (event: AdminOrderEvent) => {
      setLastEvent(event);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    };

    const handleStatusChange = (_event: OrderStatusEvent) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:status", handleStatusChange);
    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:status", handleStatusChange);
    };
  }, [session?.accessToken, queryClient]);

  return { lastNewOrder: lastEvent, clearLastNewOrder: () => setLastEvent(null) };
}
