import type { CategorySeed } from "./types";

// Footnotes here (Char/Grill Marks, Shape Retention, Cohesiveness) describe a different
// TARGET interpretation per product, not attribute absence — both products are scored on
// every attribute in this category, so no applicability overrides are needed.
export const data: CategorySeed = {
  key: "kebabs",
  title: "Kebabs",
  products: [
    { slug: "seekh-kebab", name: "Seekh Kebab" },
    { slug: "gola-kebab", name: "Gola Kebab" },
  ],
  sections: [
    {
      letter: "A",
      name: "External Appearance",
      attributes: [
        { slug: "surface-color", name: "Surface Color", low: "Very Pale / Uncooked / Slightly Pale", mid: "Target (Brown / Charred)", high: "Slightly Dark / Very Dark / Burnt" },
        { slug: "color-uniformity", name: "Color Uniformity", low: "Highly Uneven (Pale) / Slightly Uneven", mid: "Uniform", high: "Slightly Uneven (Dark) / Highly Uneven (Burnt)" },
        { slug: "char-grill-marks", name: "Char / Grill Marks", low: "No Char Marks / Faint Marks", mid: "Target (Even Char Marks)", high: "Heavy Char Marks / Excessively Burnt" },
        { slug: "surface-texture", name: "Surface Texture", low: "Very Smooth (Underdone) / Slightly Smooth", mid: "Target (Light Crust)", high: "Slightly Rough / Very Rough / Cracked" },
        { slug: "shape-uniformity", name: "Shape Uniformity", low: "Very Irregular / Broken / Slightly Irregular", mid: "Target (Uniform Shape)", high: "Slightly Distorted / Highly Distorted" },
        { slug: "size-consistency", name: "Size Consistency", low: "Much Smaller / Slightly Small", mid: "Target Size", high: "Slightly Large / Much Larger" },
        { slug: "surface-oiliness", name: "Surface Oiliness", low: "No Oiliness / Very Dry / Slight Sheen", mid: "Target (Light Sheen)", high: "Oily / Excessively Oily / Wet" },
      ],
    },
    {
      letter: "B",
      name: "Internal Appearance / Structure",
      attributes: [
        { slug: "internal-color", name: "Internal Color", low: "Very Pink / Raw Look / Slightly Pink", mid: "Target (Evenly Cooked)", high: "Slightly Grey / Overcooked / Very Grey" },
        { slug: "moisture-internal", name: "Moisture (Internal)", low: "Very Dry / Crumbly / Slightly Dry", mid: "Target (Moist Look)", high: "Slightly Wet / Very Wet / Leaking Fat" },
        { slug: "minced-texture", name: "Minced Texture", low: "Very Coarse / Chunky / Slightly Coarse", mid: "Target (Fine & Even)", high: "Slightly Fine / Too Fine / Paste-Like" },
        { slug: "fat-pockets", name: "Fat Pockets", low: "Excessive Fat Pockets / Several Fat Pockets", mid: "Target (Minimal Fat)", high: "Few Fat Pockets / No Fat (Very Lean / Dry)" },
        { slug: "structural-integrity", name: "Structural Integrity", low: "Fell Apart / Broken / Slightly Loose", mid: "Target (Cohesive)", high: "Slightly Firm / Very Firm / Dense" },
        { slug: "shape-retention", name: "Shape Retention", low: "No Shape (Collapsed) / Poor Shape Retention", mid: "Target", high: "Good Shape / Overly Rigid / Hard" },
      ],
    },
    {
      letter: "C",
      name: "Aroma",
      attributes: [
        { slug: "grilled-char-aroma", name: "Grilled / Char Aroma", low: "No Grilled Aroma / Slight Grilled Aroma", mid: "Target (Pleasant Char)", high: "Strong Grilled Aroma / Burnt / Acrid Aroma" },
        { slug: "meat-chicken-aroma", name: "Meat / Chicken Aroma", low: "No Meat Aroma / Weak Meat Aroma", mid: "Target (Clear Meat)", high: "Strong Meat Aroma / Off / Sour Meat" },
        { slug: "spice-aroma", name: "Spice Aroma", low: "No Spice Aroma / Weak Spice Aroma", mid: "Target (Balanced)", high: "Strong Spice Aroma / Overpowering / Pungent" },
        { slug: "fat-oily-aroma", name: "Fat / Oily Aroma", low: "No Fat Aroma / Slight Fat Aroma", mid: "Target", high: "Strong Fat Aroma / Rancid / Oxidized" },
        { slug: "herbal-aroma", name: "Herbal Aroma", low: "None / Faint", mid: "Target (Coriander / Herb)", high: "Strong / Overpowering" },
        { slug: "onion-garlic-aroma", name: "Onion / Garlic Aroma", low: "None / Faint", mid: "Target", high: "Strong / Overpowering / Pungent" },
        { slug: "smoky-aroma", name: "Smoky Aroma", low: "No Smoky Aroma / Faint Smoky Aroma", mid: "Target (Mild Smoky)", high: "Strong Smoky Aroma / Acrid / Overpowering" },
      ],
    },
    {
      letter: "D",
      name: "Mouthfeel / Texture",
      attributes: [
        { slug: "softness-tenderness", name: "Softness / Tenderness", low: "Very Tough / Rubbery / Slightly Tough", mid: "Target (Tender)", high: "Slightly Soft / Very Soft / Mushy" },
        { slug: "juiciness", name: "Juiciness", low: "Very Dry / Slightly Dry", mid: "Target (Juicy)", high: "Slightly Wet / Very Wet / Falling Apart" },
        { slug: "chewiness", name: "Chewiness", low: "Too Tough (Rubbery) / Slightly Chewy", mid: "Target", high: "Slightly Easy / Falls Apart / Crumbles" },
        { slug: "cohesiveness", name: "Cohesiveness", low: "Crumbles Completely / Slightly Falls Apart", mid: "Target (Holds Shape)", high: "Slightly Too Firm / Very Firm / Dense" },
        { slug: "fat-mouthfeel", name: "Fat Mouthfeel", low: "No Fat (Very Lean / Dry) / Slight Fat Coating", mid: "Target (Mild Fat)", high: "Heavy Fat Coating / Excessively Greasy" },
        { slug: "spice-heat-burn", name: "Spice Heat / Burn", low: "No Heat / Faint Heat", mid: "Target (Mild Spice)", high: "Moderate Heat / Intense Heat / Burning" },
        { slug: "grain-minced-texture", name: "Grain / Minced Texture", low: "Too Coarse / Gritty / Slightly Coarse", mid: "Target (Fine & Smooth)", high: "Slightly Pasty / Very Pasty" },
      ],
    },
    {
      letter: "E",
      name: "Taste",
      attributes: [
        { slug: "saltiness", name: "Saltiness", low: "No Salt / Low Salt", mid: "Target Salt Level", high: "Slightly Salty / Too Salty" },
        { slug: "spiciness", name: "Spiciness", low: "No Spice / Low Spice", mid: "Target Spice Level", high: "Slightly High / Very High / Burning" },
        { slug: "meat-chicken-flavor", name: "Meat / Chicken Flavor", low: "No Meat Flavor / Weak Meat Flavor", mid: "Target (Clear Meat)", high: "Strong Meat Flavor / Artificial / Off" },
        { slug: "savory-umami", name: "Savory / Umami", low: "No Savory / Low Savory", mid: "Target", high: "Strong Savory / Overpowering" },
        { slug: "fat-oily-taste", name: "Fat / Oily Taste", low: "No Fat Taste / Slight Fat Taste", mid: "Clean Fat Taste", high: "Strong Fat Taste / Rancid / Oxidized" },
        { slug: "herbal-coriander-taste", name: "Herbal / Coriander Taste", low: "None / Faint", mid: "Target", high: "Strong / Overpowering" },
        { slug: "onion-garlic-taste", name: "Onion / Garlic Taste", low: "None / Faint", mid: "Target", high: "Strong / Overpowering / Pungent" },
        { slug: "smoky-char-taste", name: "Smoky / Char Taste", low: "None / Faint", mid: "Target (Mild Smoky)", high: "Strong / Acrid / Bitter" },
        { slug: "sweetness", name: "Sweetness", low: "None / Faint (Target)", mid: "Slight", high: "Noticeable / Overly Sweet" },
      ],
    },
    {
      letter: "F",
      name: "Aftertaste",
      attributes: [
        { slug: "spice-lingering", name: "Spice Lingering", low: "None / Faint", mid: "Pleasant Lingering", high: "Strong Lingering / Burning / Painful" },
        { slug: "smoky-char-aftertaste", name: "Smoky / Char Aftertaste", low: "None / Faint", mid: "Mild (Target)", high: "Strong / Acrid / Unpleasant" },
        { slug: "meat-aftertaste", name: "Meat Aftertaste", low: "None / Faint", mid: "Pleasant Lingering", high: "Strong / Off / Sour" },
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
