import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminDashboardService } from "./admin-dashboard.service";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [OrdersModule],
  controllers: [AdminController],
  providers: [AdminDashboardService],
})
export class AdminModule {}
