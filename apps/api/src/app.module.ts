import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import configuration from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./database/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { DeliveryZonesModule } from "./modules/delivery-zones/delivery-zones.module";
import { OpeningHoursModule } from "./modules/opening-hours/opening-hours.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { UsersModule } from "./modules/users/users.module";
import { AddressesModule } from "./modules/addresses/addresses.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { LoyaltyModule } from "./modules/loyalty/loyalty.module";
import { AdminModule } from "./modules/admin/admin.module";
import { EmployeesModule } from "./modules/employees/employees.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      envFilePath: [".env"],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>("rateLimit.ttl") ?? 60) * 1000,
            limit: config.get<number>("rateLimit.max") ?? 100,
          },
        ],
      }),
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    DeliveryZonesModule,
    OpeningHoursModule,
    CouponsModule,
    OrdersModule,
    UsersModule,
    AddressesModule,
    FavoritesModule,
    LoyaltyModule,
    AdminModule,
    EmployeesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
