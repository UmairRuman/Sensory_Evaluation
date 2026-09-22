import type { CategorySeed } from "./types";

const BAQARKHANI = ["baqarkhani-plain", "baqarkhani-sugar-coated"];

export const data: CategorySeed = {
  key: "rusks",
  title: "Rusks",
  products: [
    { slug: "round-rusk", name: "Round Rusk" },
    { slug: "crispy-rusk", name: "Crispy Rusk" },
    { slug: "baqarkhani-plain", name: "BaqarKhani Plain" },
    { slug: "baqarkhani-sugar-coated", name: "BaqarKhani Sugar Coated" },
    { slug: "cake-rusk-plain", name: "Cake Rusk Plain" },
    { slug: "bran-cake-rusk", name: "Bran Cake Rusk" },
  ],
  sections: [
    {
      letter: "A",
      name: "Surface Appearance",
      attributes: [
        { slug: "surface-color", name: "Surface Color", low: "Very Pale / Untoasted / Slightly Pale", mid: "Target (Golden Brown)", high: "Slightly Dark / Burnt" },
        { slug: "toast-uniformity", name: "Toast Uniformity", low: "Highly Uneven (Pale) / Slightly Uneven", mid: "Uniform", high: "Slightly Over-Toasted / Highly Uneven / Burnt" },
        { slug: "sugar-coating", name: "Sugar Coating", low: "No Sugar Coating / Sparse / Thin", mid: "Uniform Even Coating", high: "Slightly Thick / Clumped / Heavy / Crystallized", only: ["baqarkhani-sugar-coated"] },
        { slug: "shape-uniformity", name: "Shape Uniformity", low: "Highly Irregular / Slightly Irregular", mid: "Target", high: "Slightly Distorted / Highly Distorted" },
        { slug: "surface-smoothness", name: "Surface Smoothness", low: "Very Rough / Slightly Rough", mid: "Target (Smooth)", high: "Slightly Smooth / Very Smooth / Glazed" },
        { slug: "edge-condition", name: "Edge Condition", low: "Broken / Chipped / Slightly Chipped", mid: "Intact", high: "Slightly Sharp / Excessively Sharp" },
        { slug: "surface-integrity", name: "Surface Integrity", low: "Cracked / Split / Slightly Cracked", mid: "Target (Intact)", high: "Firm / Excessively Hard" },
      ],
    },
    {
      letter: "B",
      name: "Internal Structure",
      attributes: [
        { slug: "cell-structure", name: "Cell Structure", low: "Very Dense / Compact / Slightly Dense", mid: "Target (Even Cells)", high: "Slightly Open / Very Open / Hollow" },
        { slug: "cell-uniformity", name: "Cell Uniformity", low: "Highly Uneven / Slightly Uneven", mid: "Uniform", high: "Slightly Open Pockets / Large Voids" },
        { slug: "internal-color", name: "Internal Color", low: "Very Pale / Slightly Pale", mid: "Target", high: "Slightly Dark / Excessively Dark" },
        { slug: "toast-penetration", name: "Toast Penetration", low: "Under-Toasted Core / Slightly Under-Toasted", mid: "Target (Even Toast)", high: "Slightly Over-Toasted / Burnt Core" },
        { slug: "layering-baqarkhani", name: "Layering (BaqarKhani)", low: "No Layering / Slight Layering", mid: "Target (Distinct Layers)", high: "Slightly Uneven / Very Uneven Layers", only: BAQARKHANI },
      ],
    },
    {
      letter: "C",
      name: "Aroma",
      attributes: [
        { slug: "baked-toasted-aroma", name: "Baked / Toasted Aroma", low: "No / Weak Aroma / Slightly Weak", mid: "Target (Pleasant Toast)", high: "Strong / Burnt" },
        { slug: "sweet-aroma", name: "Sweet Aroma", low: "None / Low", mid: "Target", high: "Strong / Artificial / Sickly" },
        { slug: "milky-aroma", name: "Milky Aroma", low: "None / Low", mid: "Target", high: "Strong / Artificial" },
        { slug: "grainy-bran-aroma", name: "Grainy / Bran Aroma", low: "None / Low", mid: "Target", high: "Strong / Raw Bran / Harsh", only: ["bran-cake-rusk"] },
        { slug: "butter-fat-aroma", name: "Butter / Fat Aroma", low: "None / Low", mid: "Target (Mild Butter)", high: "Strong / Rancid Fat Aroma", only: BAQARKHANI },
        { slug: "sugar-caramel-aroma", name: "Sugar / Caramel Aroma", low: "None / Faint", mid: "Target", high: "Strong / Artificial / Burnt Sugar", only: ["baqarkhani-sugar-coated"] },
      ],
    },
    {
      letter: "D",
      name: "Texture / Mouthfeel",
      attributes: [
        { slug: "crunchiness", name: "Crunchiness", low: "No Crunch / Soft / Low Crunch", mid: "Target (Clean Crunch)", high: "Strong Crunch / Excessively Hard" },
        { slug: "bite-hardness", name: "Bite Hardness", low: "Very Soft / Crumbles / Soft", mid: "Target", high: "Hard / Extremely Hard" },
        { slug: "fracturability", name: "Fracturability", low: "Difficult to Break / Slightly Difficult", mid: "Target (Clean Break)", high: "Easy Break / Crumbles Excessively" },
        { slug: "crispness", name: "Crispness", low: "Not Crisp / Slightly Crisp", mid: "Target", high: "Very Crisp / Harsh / Cuts Mouth" },
        { slug: "dryness", name: "Dryness", low: "Very Moist / Soft / Slightly Moist", mid: "Target", high: "Slightly Dry / Extremely Dry" },
        { slug: "mouth-breakdown", name: "Mouth Breakdown", low: "Very Slow / Slow", mid: "Target (Moderate)", high: "Quick / Instant Crumbling" },
        { slug: "particle-size-chewing", name: "Particle Size (Chewing)", low: "Very Large Pieces / Large Pieces", mid: "Target (Fine & Even)", high: "Fine Particles / Powdery" },
        { slug: "mouth-coating", name: "Mouth Coating", low: "No Coating / Slight Coating", mid: "Target", high: "High Coating / Excessively Oily" },
        { slug: "sugar-coating-feel", name: "Sugar Coating Feel", low: "No Sweetness on Touch / Slight Sweetness", mid: "Target (Even Sweet Crunch)", high: "Heavy Crystals / Sticky / Dissolves Poorly", only: ["baqarkhani-sugar-coated"] },
      ],
    },
    {
      letter: "E",
      name: "Taste",
      attributes: [
        { slug: "sweetness", name: "Sweetness", low: "Very Low / None / Low", mid: "Target", high: "High / Excessively Sweet" },
        { slug: "salt-balance", name: "Salt Balance", low: "No Salt / Low Salt", mid: "Target", high: "Slightly Salty / Very Salty" },
        { slug: "toasted-baked-flavor", name: "Toasted / Baked Flavor", low: "None / Low", mid: "Target", high: "Strong / Burnt" },
        { slug: "milky-flavor", name: "Milky Flavor", low: "None / Low", mid: "Target", high: "Strong / Artificial" },
        { slug: "grain-bran-flavor", name: "Grain / Bran Flavor", low: "None / Low", mid: "Target", high: "Strong / Raw Grain / Harsh", only: ["bran-cake-rusk"] },
        { slug: "butter-flavor", name: "Butter Flavor", low: "None / Low", mid: "Target", high: "Strong / Rancid / Off", only: BAQARKHANI },
        { slug: "sugar-caramel-flavor", name: "Sugar / Caramel Flavor", low: "None / Faint", mid: "Target", high: "Strong / Artificial / Burnt Sugar", only: ["baqarkhani-sugar-coated"] },
      ],
    },
    {
      letter: "F",
      name: "Aftertaste",
      attributes: [
        { slug: "drying-intensity", name: "Drying Intensity", low: "Not Drying / Slightly Drying", mid: "Target", high: "Drying / Extremely Drying" },
        { slug: "residue", name: "Residue", low: "Heavy Residue / Noticeable Residue", mid: "Clean", high: "Slightly Stripping / Highly Stripping" },
        { slug: "toasted-aftertaste", name: "Toasted Aftertaste", low: "None / Low", mid: "Target", high: "Strong / Burnt" },
        { slug: "sweet-aftertaste", name: "Sweet Aftertaste", low: "None / Low", mid: "Target", high: "Strong / Overly Lingering" },
        { slug: "bitter-aftertaste", name: "Bitter Aftertaste", low: "None / Slight", mid: "Target (None)", high: "Noticeable / Strong Bitter" },
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
