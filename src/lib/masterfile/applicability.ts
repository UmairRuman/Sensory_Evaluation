// Pure function, safe to import from both server and client code (no Prisma/db dependency).
// Applicability is resolved from an explicit override table rather than runtime string matching:
// an override always wins, otherwise the attribute's own default applies.
export function attributeAppliesToProduct(
  attribute: { defaultApplicable: boolean; overrides: { productId: string; applies: boolean }[] },
  productId: string
): boolean {
  const override = attribute.overrides.find((o) => o.productId === productId);
  return override ? override.applies : attribute.defaultApplicable;
}
