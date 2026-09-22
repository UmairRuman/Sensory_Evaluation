import type { CategorySeed } from "./types";

// Unlike the other 8 categories, this sheet's "Raw / Uncooked Aroma*" attribute carries an
// asterisk with no corresponding footnote line in the source — treated as applying to all
// products (no override) since no restriction was specified. This sheet also omits the
// explicit "Overall Hedonic Score" section the other 8 categories have, even though its
// Summary & Ranking block still references an "Overall Liking Score" metric — we add the
// same Overall Liking attribute here for consistency with the scoring engine.
export const data: CategorySeed = {
  key: "pizza-toppings",
  title: "Pizza Toppings",
  products: [
    { slug: "chicken-tikka-topping", name: "Chicken Tikka Topping" },
    { slug: "beef-topping", name: "Beef Topping" },
    { slug: "vegetable-mix-topping", name: "Vegetable Mix Topping" },
    { slug: "cheese-blend-topping", name: "Cheese Blend Topping" },
  ],
  sections: [
    {
      letter: "A",
      name: "Topping Appearance",
      attributes: [
        { slug: "color", name: "Color", low: "Too Pale / Faded / Discolored", mid: "Target (Bright, Natural / Characteristic Color)", high: "Slightly Dark / Very Dark / Off-Color" },
        { slug: "color-uniformity", name: "Color Uniformity", low: "Highly Uneven (Pale/Patchy) / Slightly Uneven", mid: "Uniform Across Pieces", high: "Slightly Uneven (Dark) / Highly Uneven (Dark)" },
        { slug: "surface-moisture-oiliness", name: "Surface Moisture / Oiliness", low: "Dry / Dull / Slight Sheen", mid: "Target (Light, Natural Sheen)", high: "Wet / Oily / Excessively Greasy / Weeping" },
        { slug: "visual-freshness", name: "Visual Freshness", low: "Freezer Burn / Discoloration / Slightly Dry Edges", mid: "Target (Fresh, No Defects)", high: "Excess Surface Moisture / Slimy / Deteriorated" },
      ],
    },
    {
      letter: "B",
      name: "Topping Size & Cut",
      attributes: [
        { slug: "piece-size", name: "Piece Size", low: "Crushed / Finely Crushed / Slightly Small", mid: "Target Size", high: "Slightly Large / Too Large / Oversized" },
        { slug: "size-uniformity", name: "Size Uniformity", low: "Highly Uneven (Fine) / Slightly Uneven", mid: "Uniform", high: "Slightly Uneven (Coarse) / Highly Uneven (Coarse)" },
      ],
    },
    {
      letter: "C",
      name: "Aroma",
      attributes: [
        { slug: "characteristic-umami-aroma", name: "Characteristic Umami Aroma", low: "Very Weak / None / Faint", mid: "Target (Clear, Characteristic)", high: "Strong / Overpowering / Off-Character" },
        { slug: "spice-seasoning-aroma", name: "Spice / Seasoning Aroma", low: "No Spice Aroma / Weak Spice Aroma", mid: "Target (Pleasant)", high: "Strong Spice Aroma / Overpowering / Pungent" },
        { slug: "raw-uncooked-aroma", name: "Raw / Uncooked Aroma", low: "Strong Raw / Metallic Aroma / Slightly Raw", mid: "Target (Clean, Appropriate to Product State)", high: "Slightly Strong Cooked / Overcooked / Burnt Aroma" },
      ],
    },
    {
      letter: "D",
      name: "Mouthfeel / Texture",
      attributes: [
        { slug: "firmness-bite", name: "Firmness / Bite", low: "Very Soft / Mushy / Slightly Soft", mid: "Target (Firm, Characteristic Bite)", high: "Slightly Tough / Very Tough / Rubbery" },
        { slug: "juiciness-moistness", name: "Juiciness / Moistness", low: "Very Dry / Slightly Dry", mid: "Target (Moist)", high: "Slightly Wet / Watery / Soggy" },
        { slug: "chewiness", name: "Chewiness", low: "No Chew / Falls Apart / Slightly Easy", mid: "Target", high: "Slightly Chewy / Very Tough / Rubbery" },
        { slug: "oiliness-mouthfeel", name: "Oiliness (Mouthfeel)", low: "No Fat Coating / Slight Coating", mid: "Target", high: "Heavy Coating / Excessively Greasy" },
      ],
    },
    {
      letter: "E",
      name: "Taste",
      attributes: [
        { slug: "saltiness", name: "Saltiness", low: "No Salt / Low Salt", mid: "Target Salt Level", high: "Slightly Salty / Too Salty" },
        { slug: "spiciness", name: "Spiciness", low: "No Spice / Low Spice", mid: "Target Spice Level", high: "Slightly High / Very High / Burning" },
        { slug: "savory-umami", name: "Savory / Umami", low: "No Savory Taste / Low Savory", mid: "Target", high: "Strong Savory / Overpowering" },
        { slug: "off-taste", name: "Off Taste", low: "None / Faint", mid: "Clean (Target)", high: "Noticeable Rancid / Sour / Off Taste" },
      ],
    },
    {
      letter: "F",
      name: "Aftertaste",
      attributes: [
        { slug: "flavor-lingering", name: "Flavor Lingering", low: "None / Faint", mid: "Pleasant Lingering", high: "Strong Lingering / Overpowering / Unpleasant" },
        { slug: "oily-aftertaste", name: "Oily Aftertaste", low: "None / Slight", mid: "Clean (Target)", high: "Strong Oily Coating / Rancid / Unpleasant" },
        { slug: "residue", name: "Residue", low: "Heavy Residue / Noticeable Residue", mid: "Clean", high: "Slightly Stripping / Highly Stripping" },
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
