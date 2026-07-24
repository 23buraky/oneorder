import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import type { Employee, User } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { BCRYPT_SALT_ROUNDS } from "../auth/constants/auth.constants";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import type { EmployeeView } from "./types/employee-view.type";

type EmployeeWithUser = Employee & { user: User };

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<EmployeeView[]> {
    const employees = await this.prisma.client.employee.findMany({
      include: { user: true },
      orderBy: { hiredAt: "desc" },
    });
    return employees.map((employee) => this.toView(employee));
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeView> {
    const existing = await this.prisma.client.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`A user with email "${dto.email}" already exists`);
    }

    const pinCodeHash = await bcrypt.hash(dto.pin, BCRYPT_SALT_ROUNDS);

    const employee = await this.prisma.client.employee.create({
      data: {
        role: dto.role,
        pinCodeHash,
        user: {
          create: {
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: "EMPLOYEE",
            authProvider: "LOCAL",
            isEmailVerified: true, // created directly by an admin, not via self-signup
          },
        },
      },
      include: { user: true },
    });

    return this.toView(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeView> {
    await this.getOrThrow(id);

    const pinCodeHash = dto.pin ? await bcrypt.hash(dto.pin, BCRYPT_SALT_ROUNDS) : undefined;

    const employee = await this.prisma.client.employee.update({
      where: { id },
      data: { role: dto.role, isActive: dto.isActive, pinCodeHash },
      include: { user: true },
    });

    return this.toView(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.getOrThrow(id);

    // Keep the underlying user account, just revoke their staff access.
    await this.prisma.client.$transaction([
      this.prisma.client.employee.delete({ where: { id } }),
      this.prisma.client.user.update({ where: { id: employee.userId }, data: { role: "CUSTOMER" } }),
    ]);
  }

  private async getOrThrow(id: string): Promise<Employee> {
    const employee = await this.prisma.client.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee with id "${id}" not found`);
    }
    return employee;
  }

  private toView(employee: EmployeeWithUser): EmployeeView {
    return {
      id: employee.id,
      userId: employee.userId,
      firstName: employee.user.firstName,
      lastName: employee.user.lastName,
      email: employee.user.email,
      role: employee.role,
      isActive: employee.isActive,
      hiredAt: employee.hiredAt,
    };
  }
}
