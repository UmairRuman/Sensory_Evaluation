export interface AttributeSeed {
  slug: string;
  name: string;
  /** Defaults to "STANDARD"; set "OVERALL_HEDONIC" for the single Overall Liking attribute. */
  kind?: "STANDARD" | "OVERALL_HEDONIC";
  low: string;
  mid: string;
  high: string;
  /**
   * Applicability, hand-resolved once from the client's xlsx footnotes at seed-authoring time
   * (not a runtime fuzzy matcher). Provide exactly one of `only` / `skip`, or neither for an
   * attribute that applies to every product in the category.
   */
  only?: string[]; // product slugs this attribute applies to exclusively
  skip?: string[]; // product slugs this attribute does NOT apply to
}

export interface SectionSeed {
  letter: string;
  name: string;
  attributes: AttributeSeed[];
}

export interface ProductSeed {
  slug: string;
  name: string;
}

export interface CategorySeed {
  key: string;
  title: string;
  products: ProductSeed[];
  sections: SectionSeed[];
}
