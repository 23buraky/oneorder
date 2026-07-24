import { PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./create-product.dto";

// Note: PATCH only updates scalar fields, translations, and images.
// Variant groups / extra groups / ingredients / allergens / availability are
// managed as part of product creation (or, later, dedicated sub-resource
// endpoints) — replacing a whole nested tree via PATCH is intentionally out
// of scope here to avoid ambiguous "merge vs replace" semantics.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
