import type { CategorySeed } from "./types";

// Char Spots / Char Aroma / Char Flavor / Char Aftertaste footnotes describe a different
// TARGET interpretation per product (characteristic for Shawarma, should be minimal for
// Tortilla) rather than the attribute being absent for either product — both products are
// scored on all attributes in this category, so no applicability overrides are needed.
export const data: CategorySeed = {
  key: "shawarma-tortilla",
  title: "Shawarma & Tortilla",
  products: [
    { slug: "shawarma", name: "Shawarma" },
    { slug: "tortilla", name: "Tortilla" },
  ],
  sections: [
    {
      letter: "A",
      name: "Surface Appearance",
      attributes: [
        { slug: "surface-color", name: "Surface Color", low: "Too Pale / White / Slightly Pale", mid: "Target (Light Golden)", high: "Slightly Dark / Very Dark / Burnt Spots" },
        { slug: "color-uniformity", name: "Color Uniformity", low: "Highly Uneven (Light) / Slightly Uneven", mid: "Uniform", high: "Slightly Uneven (Dark) / Highly Uneven (Dark)" },
        { slug: "surface-blistering", name: "Surface Blistering", low: "Many Large Blisters / Few Large Blisters", mid: "No / Few Tiny Blisters", high: "Few Small Blisters / Many Small Blisters" },
        { slug: "char-spots", name: "Char Spots", low: "No Char / 1–2 Tiny Spots", mid: "Target (Few Char Spots)", high: "Several Char Spots / Heavily Charred" },
        { slug: "shape-uniformity", name: "Shape Uniformity", low: "Very Irregular / Torn / Slightly Irregular", mid: "Target (Round / Oval)", high: "Slightly Distorted / Highly Distorted" },
        { slug: "thickness-consistency", name: "Thickness Consistency", low: "Too Thin / Transparent / Slightly Thin", mid: "Target Thickness", high: "Slightly Thick / Too Thick / Doughy" },
        { slug: "surface-texture", name: "Surface Texture", low: "Very Rough / Cracked / Slightly Rough", mid: "Smooth", high: "Slightly Papery / Very Papery / Brittle" },
      ],
    },
    {
      letter: "B",
      name: "Internal Structure",
      attributes: [
        { slug: "internal-color", name: "Internal Color", low: "Too Dark / Grey / Slightly Dark", mid: "Target (Cream / Off-White)", high: "Slightly Yellow / Too Yellow" },
        { slug: "layering", name: "Layering", low: "No Layers (Dense) / Slight Layering", mid: "Target (Distinct Layers)", high: "Slightly Open / Very Open / Air Pockets" },
        { slug: "moisture-appearance", name: "Moisture Appearance", low: "Very Dry / Cracked / Slightly Dry", mid: "Target (Flexible Look)", high: "Slightly Moist / Wet / Clammy" },
      ],
    },
    {
      letter: "C",
      name: "Aroma",
      attributes: [
        { slug: "baked-roasted-aroma", name: "Baked / Roasted Aroma", low: "Very Underbaked / Slightly Underbaked", mid: "Fresh Baked (Ideal)", high: "Toasted Aroma / Burnt Aroma" },
        { slug: "wheat-dough-aroma", name: "Wheat / Dough Aroma", low: "No Wheat Aroma / Low Wheat Aroma", mid: "Target", high: "Strong Wheat Aroma / Raw Flour Aroma" },
        { slug: "char-smoky-aroma", name: "Char / Smoky Aroma", low: "No Smoky Aroma / Slight Smoky Aroma", mid: "Target (Mild Char)", high: "Strong Smoky Aroma / Acrid / Overpowering" },
        { slug: "oily-aroma", name: "Oily Aroma", low: "No Oily Aroma / Low Oily Aroma", mid: "Target", high: "Slightly Strong / Rancid Aroma" },
        { slug: "fermented-aroma", name: "Fermented Aroma", low: "No Fermented Aroma / Low Fermented Aroma", mid: "Target", high: "Slightly Strong / Sour / Pungent Aroma" },
      ],
    },
    {
      letter: "D",
      name: "Mouthfeel / Texture",
      attributes: [
        { slug: "flexibility-pliability", name: "Flexibility / Pliability", low: "Very Stiff / Cracks / Slightly Stiff", mid: "Target (Flexible)", high: "Slightly Limp / Very Limp / Tears Easily" },
        { slug: "softness-initial-bite", name: "Softness (Initial Bite)", low: "Very Hard / Tough / Slightly Hard", mid: "Target (Soft & Chewy)", high: "Slightly Soft / Mushy / Falls Apart" },
        { slug: "chewiness", name: "Chewiness", low: "Very Tough / Rubbery / Slightly Chewy", mid: "Target", high: "Slightly Easy / Falls Apart / No Chew" },
        { slug: "moistness", name: "Moistness", low: "Very Dry / Slightly Dry", mid: "Target", high: "Slightly Moist / Wet / Clammy" },
        { slug: "oiliness-fat-coating", name: "Oiliness / Fat Coating", low: "No Fat Coating / Slight Coating", mid: "Target", high: "Strong Coating / Excessively Greasy" },
        { slug: "effort-to-swallow", name: "Effort to Swallow", low: "Very Difficult / Slightly Difficult", mid: "Target", high: "Slightly Easy / Very Easy (Too Soft)" },
      ],
    },
    {
      letter: "E",
      name: "Taste",
      attributes: [
        { slug: "saltiness", name: "Saltiness", low: "No Salt / Low Salt", mid: "Target Salt Level", high: "Slightly Salty / Too Salty" },
        { slug: "sweetness", name: "Sweetness", low: "No Sweetness / Low Sweetness", mid: "Target", high: "Slightly Sweet / Overly Sweet" },
        { slug: "baked-wheat-flavor", name: "Baked / Wheat Flavor", low: "No Baked Flavor / Slight Baked Flavor", mid: "Fresh Baked (Ideal)", high: "Strong Toasted / Burnt / Bitter" },
        { slug: "char-smoky-flavor", name: "Char / Smoky Flavor", low: "No Char Flavor / Faint Char Flavor", mid: "Target (Mild Char)", high: "Strong Char Flavor / Acrid / Bitter" },
        { slug: "oily-fat-taste", name: "Oily / Fat Taste", low: "No Fat Taste / Slight Fat Taste", mid: "Clean Fat Taste", high: "Strong Fat Taste / Rancid / Oxidized" },
        { slug: "fermented-taste", name: "Fermented Taste", low: "No Fermented Taste / Low Fermented Taste", mid: "Target", high: "Slightly Strong Yeast / Sour / Off Taste" },
      ],
    },
    {
      letter: "F",
      name: "Aftertaste",
      attributes: [
        { slug: "astringency", name: "Astringency", low: "Strong Puckering / Slight Puckering", mid: "Neutral", high: "Slight Mouth Coating / Strong Mouth Coating" },
        { slug: "residue", name: "Residue", low: "Heavy Residue / Noticeable Residue", mid: "Clean", high: "Slightly Stripping (Dry) / Highly Stripping (Dry)" },
        { slug: "oily-aftertaste", name: "Oily Aftertaste", low: "No Oily Aftertaste / Faint Oily Coating", mid: "Mild (Target)", high: "Strong Oily Coating / Rancid Lingering" },
        { slug: "char-aftertaste", name: "Char Aftertaste", low: "None / Faint", mid: "Mild (Target — Shawarma)", high: "Strong / Acrid / Unpleasant" },
      ],
    },
    {
      letter: "G",
      name: "Overall Hedonic",
      attributes: [
        { slug: "overall-liking", name: "Overall Liking", kind: "OVERALL_HEDONIC", low: "Unacceptable / Just OK", mid: "Target (Ideal)", high: "Just OK / Unacceptable" },
      ],
    },
  ],
};
