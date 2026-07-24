import { apiRequest } from "./base";

export interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  hiredAt: string;
}

export interface CreateEmployeeInput {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  pin: string;
}

export interface UpdateEmployeeInput {
  role?: string;
  isActive?: boolean;
  pin?: string;
}

export function listEmployees(accessToken: string): Promise<Employee[]> {
  return apiRequest<Employee[]>("/employees", { accessToken });
}

export function createEmployee(input: CreateEmployeeInput, accessToken: string): Promise<Employee> {
  return apiRequest<Employee>("/employees", { method: "POST", body: JSON.stringify(input), accessToken });
}

export function updateEmployee(id: string, input: UpdateEmployeeInput, accessToken: string): Promise<Employee> {
  return apiRequest<Employee>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(input), accessToken });
}

export function deleteEmployee(id: string, accessToken: string): Promise<void> {
  return apiRequest<void>(`/employees/${id}`, { method: "DELETE", accessToken });
}
