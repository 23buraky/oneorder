import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { CartModule } from "../cart/cart.module";
import { PricingModule } from "../pricing/pricing.module";
import { DeliveryZonesModule } from "../delivery-zones/delivery-zones.module";
import { OpeningHoursModule } from "../opening-hours/opening-hours.module";
import { CouponsModule } from "../coupons/coupons.module";
import { LoyaltyModule } from "../loyalty/loyalty.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [
    CartModule,
    PricingModule,
    DeliveryZonesModule,
    OpeningHoursModule,
    CouponsModule,
    LoyaltyModule,
    NotificationsModule,
    RealtimeModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
