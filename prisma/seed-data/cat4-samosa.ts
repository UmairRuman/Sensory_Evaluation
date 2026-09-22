import type { CategorySeed } from "./types";

export const data: CategorySeed = {
  key: "samosa",
  title: "Samosa",
  products: [
    { slug: "aloo-samosa", name: "Aloo Samosa" },
    { slug: "chicken-samosa", name: "Chicken Samosa" },
  ],
  sections: [
    {
      letter: "A",
      name: "Shell / Crust Appearance",
      attributes: [
        { slug: "shell-color", name: "Shell Color", low: "Too Pale / Unfried / Slightly Pale", mid: "Target (Golden Brown)", high: "Slightly Dark / Very Dark / Burnt" },
        { slug: "color-uniformity", name: "Color Uniformity", low: "Highly Uneven (Pale) / Slightly Uneven", mid: "Uniform", high: "Slightly Uneven (Dark) / Highly Uneven (Burnt)" },
        { slug: "surface-texture-blistering", name: "Surface Texture / Blistering", low: "Very Smooth / No Bubbles / Slight Blistering", mid: "Target (Light Blisters)", high: "Heavy Blistering / Rough / Cracked Shell" },
        { slug: "shell-integrity", name: "Shell Integrity", low: "Burst Open / Torn / Slightly Open at Seam", mid: "Intact & Sealed", high: "Slightly Over-Sealed / Very Thick Sealed Edge" },
        { slug: "shape-uniformity", name: "Shape Uniformity", low: "Very Irregular / Slightly Irregular", mid: "Target (Triangle / Cone)", high: "Slightly Distorted / Highly Distorted" },
        { slug: "oiliness-external", name: "Oiliness (External)", low: "No Oiliness (Dry) / Slight Oiliness", mid: "Target (Light Sheen)", high: "Oily / Excessively Oily / Greasy" },
        { slug: "size-consistency", name: "Size Consistency", low: "Much Smaller / Slightly Small", mid: "Target Size", high: "Slightly Large / Much Larger" },
      ],
    },
    {
      letter: "B",
      name: "Shell / Pastry Texture",
      attributes: [
        { slug: "crispness", name: "Crispness", low: "Not Crisp / Soggy / Slightly Soft", mid: "Target (Crisp)", high: "Very Crisp / Excessively Hard / Brittle" },
        { slug: "shell-thickness", name: "Shell Thickness", low: "Too Thin / Fragile / Slightly Thin", mid: "Target Thickness", high: "Slightly Thick / Too Thick / Doughy" },
        { slug: "flakiness", name: "Flakiness", low: "No Flakiness / Slight Flakiness", mid: "Target (Distinct Layers)", high: "Slightly Over-Flaky / Crumbles Excessively" },
        { slug: "bite-through-effort", name: "Bite-Through Effort", low: "Very Hard / Tough / Slightly Hard", mid: "Target (Clean Break)", high: "Slightly Easy / Falls Apart on Bite" },
        { slug: "oil-absorption", name: "Oil Absorption", low: "Very Dry / No Oil / Low Oil Absorption", mid: "Target", high: "High Oil Absorption / Excessively Greasy / Soggy" },
      ],
    },
    {
      letter: "C",
      name: "Filling Appearance",
      attributes: [
        { slug: "filling-quantity", name: "Filling Quantity", low: "No Filling / Empty / Very Little Filling", mid: "Target (Well-Filled)", high: "Overfilled (Bursting) / Excessively Overfilled" },
        { slug: "filling-distribution", name: "Filling Distribution", low: "All Filling One Side / Slightly Uneven", mid: "Uniform Distribution", high: "Slightly Concentrated / Heavily Concentrated" },
        { slug: "filling-color", name: "Filling Color", low: "Pale / Undercooked / Slightly Pale", mid: "Target Color", high: "Slightly Dark / Very Dark / Overcooked" },
        { slug: "moisture-filling", name: "Moisture (Filling)", low: "Very Dry / Crumbly / Slightly Dry", mid: "Target (Moist Filling)", high: "Slightly Wet / Watery / Soggy Filling" },
      ],
    },
    {
      letter: "D",
      name: "Aroma",
      attributes: [
        { slug: "fried-baked-aroma", name: "Fried / Baked Aroma", low: "Very Weak / None / Slight Fried Aroma", mid: "Target (Fresh Fried)", high: "Strong Fried Aroma / Burnt / Acrid Aroma" },
        { slug: "oily-fat-aroma", name: "Oily / Fat Aroma", low: "No Oily Aroma / Slight Oily Aroma", mid: "Target", high: "Strong Oily Aroma / Rancid / Oxidized" },
        { slug: "spice-aroma", name: "Spice Aroma", low: "No Spice Aroma / Weak Spice Aroma", mid: "Target (Pleasant)", high: "Strong Spice Aroma / Overpowering / Pungent" },
        { slug: "filling-aroma", name: "Filling Aroma", low: "No Filling Aroma / Weak Filling Aroma", mid: "Target", high: "Strong Filling Aroma / Off / Sour Aroma" },
        { slug: "herbal-coriander-aroma", name: "Herbal / Coriander Aroma", low: "None / Faint", mid: "Target", high: "Strong / Overpowering" },
      ],
    },
    {
      letter: "E",
      name: "Mouthfeel / Texture",
      attributes: [
        { slug: "shell-crunch-initial-bite", name: "Shell Crunch (Initial Bite)", low: "No Crunch / Soggy / Low Crunch", mid: "Target (Clear Crunch)", high: "Very Crunchy / Excessively Hard" },
        { slug: "shell-chewiness", name: "Shell Chewiness", low: "Too Tough / Leathery / Slightly Chewy", mid: "Target", high: "Slightly Easy / Falls Apart" },
        { slug: "filling-moistness", name: "Filling Moistness", low: "Very Dry Filling / Slightly Dry", mid: "Target (Moist)", high: "Slightly Wet / Watery / Wet" },
        { slug: "filling-softness", name: "Filling Softness", low: "Very Hard / Chunky / Slightly Hard", mid: "Target (Soft & Cohesive)", high: "Slightly Mushy / Mushy / Paste-Like" },
        { slug: "oiliness-mouthfeel", name: "Oiliness (Mouthfeel)", low: "No Fat Coating / Slight Coating", mid: "Target", high: "Heavy Coating / Excessively Greasy" },
        { slug: "spice-heat-burn", name: "Spice Heat / Burn", low: "No Heat / Faint Heat", mid: "Target (Mild Spice)", high: "Moderate Heat / Intense Heat / Burning" },
      ],
    },
    {
      letter: "F",
      name: "Taste",
      attributes: [
        { slug: "saltiness", name: "Saltiness", low: "No Salt / Low Salt", mid: "Target Salt Level", high: "Slightly Salty / Too Salty" },
        { slug: "spiciness", name: "Spiciness", low: "No Spice / Low Spice", mid: "Target Spice Level", high: "Slightly High / Very High / Burning" },
        { slug: "savory-umami", name: "Savory / Umami", low: "No Savory Taste / Low Savory", mid: "Target", high: "Strong Savory / Overpowering" },
        { slug: "filling-taste", name: "Filling Taste", low: "No Filling Flavor / Weak Filling Flavor", mid: "Target (Well-Seasoned)", high: "Strong Filling Flavor / Off / Sour Taste" },
        { slug: "fat-oily-taste", name: "Fat / Oily Taste", low: "No Fat Taste / Slight Fat Taste", mid: "Clean Fat Taste", high: "Strong Fat Taste / Rancid / Oxidized" },
        { slug: "herbal-coriander-taste", name: "Herbal / Coriander Taste", low: "None / Faint", mid: "Target", high: "Strong / Overpowering" },
        { slug: "chicken-taste", name: "Chicken Taste", low: "No Chicken Flavor / Weak Chicken Flavor", mid: "Target (Clear Chicken)", high: "Strong Chicken Flavor / Artificial / Off", only: ["chicken-samosa"] },
      ],
    },
    {
      letter: "G",
      name: "Aftertaste",
      attributes: [
        { slug: "spice-lingering", name: "Spice Lingering", low: "None / Faint", mid: "Pleasant Lingering", high: "Strong Lingering / Burning / Painful" },
        { slug: "oily-aftertaste", name: "Oily Aftertaste", low: "None / Slight", mid: "Clean (Target)", high: "Strong Oily Coating / Rancid / Unpleasant" },
        { slug: "residue", name: "Residue", low: "Heavy Residue / Noticeable Residue", mid: "Clean", high: "Slightly Stripping / Highly Stripping" },
      ],
    },
    {
      letter: "H",
      name: "Overall Hedonic",
      attributes: [
        { slug: "overall-liking", name: "Overall Liking", kind: "OVERALL_HEDONIC", low: "Unacceptable / Just OK", mid: "Target (Ideal)", high: "Just OK / Unacceptable" },
      ],
    },
  ],
};
