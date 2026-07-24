import { apiRequest } from "./base";

export interface Address {
  id: string;
  label: string;
  street: string;
  houseNumber: string;
  box: string | null;
  postalCode: string;
  city: string;
  country: string;
  deliveryNote: string | null;
  isDefault: boolean;
}

export interface AddressInput {
  label: string;
  street: string;
  houseNumber: string;
  box?: string;
  postalCode: string;
  city: string;
  deliveryNote?: string;
  isDefault?: boolean;
}

export function listAddresses(accessToken: string): Promise<Address[]> {
  return apiRequest<Address[]>("/addresses", { accessToken });
}

export function createAddress(input: AddressInput, accessToken: string): Promise<Address> {
  return apiRequest<Address>("/addresses", { method: "POST", body: JSON.stringify(input), accessToken });
}

export function updateAddress(id: string, input: Partial<AddressInput>, accessToken: string): Promise<Address> {
  return apiRequest<Address>(`/addresses/${id}`, { method: "PATCH", body: JSON.stringify(input), accessToken });
}

export function deleteAddress(id: string, accessToken: string): Promise<void> {
  return apiRequest<void>(`/addresses/${id}`, { method: "DELETE", accessToken });
}
