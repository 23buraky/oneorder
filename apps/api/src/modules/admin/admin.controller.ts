import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminOrderQueryDto } from "./dto/admin-order-query.dto";
import { DashboardStatsQueryDto } from "./dto/dashboard-stats-query.dto";
import { OrdersService } from "../orders/orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "EMPLOYEE")
@ApiBearerAuth()
@Controller({ path: "admin", version: "1" })
export class AdminController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get key dashboard stats for a period (admin/employee only)" })
  getDashboard(@Query() query: DashboardStatsQueryDto) {
    return this.adminDashboardService.getStats(query);
  }

  @Get("orders")
  @ApiOperation({ summary: "List all orders with optional filters (admin/employee only)" })
  listOrders(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.listAllForAdmin(query);
  }
}
