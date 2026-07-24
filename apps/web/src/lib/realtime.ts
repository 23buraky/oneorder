import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

// A single shared socket for the whole app — components register/unregister
// event listeners on it rather than each opening their own connection.
export function getSocket(accessToken?: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io",
      autoConnect: false,
      auth: accessToken ? { token: accessToken } : {},
    });
  }

  socket.auth = accessToken ? { token: accessToken } : {};
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}
