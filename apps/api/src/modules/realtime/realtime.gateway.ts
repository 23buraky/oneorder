import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../../database/prisma.service";

const ADMIN_ROOM = "admin-room";

interface SocketAuthPayload {
  sub: string;
  role: string;
}

interface OrderSubscribePayload {
  orderNumber: string;
  guestEmail?: string;
}

export interface AdminOrderEvent {
  orderNumber: string;
  status: string;
  type: string;
  total: number;
}

export interface OrderStatusEvent {
  orderNumber: string;
  status: string;
}

// `cors: { origin: true }` (rather than reading CORS_ORIGIN like the REST API
// does in main.ts) because this decorator evaluates at module-load time,
// before @nestjs/config has loaded the .env file. Authorization for anything
// sensitive still happens per-message below (JWT role check, order ownership
// check) — CORS here only gates the transport handshake.
@WebSocketGateway({ cors: { origin: true, credentials: true }, path: "/socket.io" })
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) return;

    try {
      const payload = this.jwtService.verify<SocketAuthPayload>(token, {
        secret: this.config.get<string>("jwt.accessSecret"),
      });
      if (payload.role === "ADMIN" || payload.role === "EMPLOYEE") {
        client.data.userId = payload.sub;
        client.join(ADMIN_ROOM);
      }
    } catch {
      // Invalid/expired token — client just stays unauthenticated for the
      // admin room; per-order subscriptions are checked independently below.
    }
  }

  @SubscribeMessage("order:subscribe")
  async handleOrderSubscribe(
    @MessageBody() payload: OrderSubscribePayload,
    @ConnectedSocket() client: Socket,
  ): Promise<{ ok: boolean }> {
    const order = await this.prisma.client.order.findUnique({
      where: { orderNumber: payload.orderNumber },
      select: { userId: true, guestEmail: true },
    });
    if (!order) return { ok: false };

    const userId = client.data.userId as string | undefined;
    const isOwner = order.userId
      ? order.userId === userId
      : Boolean(payload.guestEmail) && payload.guestEmail?.toLowerCase() === order.guestEmail?.toLowerCase();

    if (!isOwner) return { ok: false };

    await client.join(`order:${payload.orderNumber}`);
    return { ok: true };
  }

  emitOrderCreated(event: AdminOrderEvent): void {
    this.server.to(ADMIN_ROOM).emit("order:new", event);
  }

  emitOrderStatusChanged(event: OrderStatusEvent): void {
    this.server.to(ADMIN_ROOM).emit("order:status", event);
    this.server.to(`order:${event.orderNumber}`).emit("order:status", event);
  }
}
