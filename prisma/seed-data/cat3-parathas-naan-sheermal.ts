import type { CategorySeed } from "./types";

const PARATHAS = ["paratha-plain", "paratha-aloo", "paratha-chicken", "paratha-cheese-chicken", "paratha-vegetable"];
const FILLED_PARATHAS = ["paratha-aloo", "paratha-chicken", "paratha-cheese-chicken", "paratha-vegetable"];

export const data: CategorySeed = {
  key: "parathas-naan-sheermal",
  title: "Parathas, Naan & Sheermal",
  products: [
    { slug: "naan", name: "Naan" },
    { slug: "roghni-naan", name: "Roghni Naan" },
    { slug: "sheermal", name: "Sheermal" },
    { slug: "paratha-plain", name: "Paratha Plain" },
    { slug: "paratha-aloo", name: "Paratha Aloo" },
    { slug: "paratha-chicken", name: "Paratha Chicken" },
    { slug: "paratha-cheese-chicken", name: "Paratha Cheese Chicken" },
    { slug: "paratha-vegetable", name: "Paratha Vegetable" },
  ],
  sections: [
    {
      letter: "A",
      name: "Surface / Crust Appearance",
      attributes: [
        { slug: "surface-color-darkness", name: "Surface Color / Darkness", low: "Too Light / Pale / Slightly Light", mid: "Target (Golden Brown)", high: "Slightly Dark / Very Dark / Burnt" },
        { slug: "color-uniformity", name: "Color Uniformity", low: "Highly Uneven (Light) / Slightly Uneven", mid: "Uniform", high: "Slightly Uneven (Dark) / Highly Uneven (Dark)" },
        { slug: "surface-layering-flakiness", name: "Surface Layering / Flakiness", low: "No Layers Visible / Slight Layering", mid: "Target (Distinct Layers)", high: "Slightly Over-Layered / Excessively Flaky", only: PARATHAS },
        { slug: "surface-blistering", name: "Surface Blistering", low: "Many Large Blisters / Few Large Blisters", mid: "No Blisters", high: "Few Small Blisters / Many Small Blisters" },
        { slug: "oiliness-ghee-sheen", name: "Oiliness / Ghee Sheen", low: "No Sheen / Dry / Low Sheen", mid: "Target Sheen", high: "Slightly Greasy / Excessively Greasy", only: [...PARATHAS, "sheermal"] },
        { slug: "shape-uniformity", name: "Shape Uniformity", low: "Very Irregular / Slightly Irregular", mid: "Target (Round / Oval)", high: "Slightly Distorted / Highly Distorted" },
        { slug: "thickness-consistency", name: "Thickness Consistency", low: "Too Thin / Translucent / Slightly Thin", mid: "Target Thickness", high: "Slightly Thick / Too Thick / Doughy" },
        { slug: "topping-garnish", name: "Topping / Garnish", low: "No Topping Visible / Sparse Topping", mid: "Uniform Topping", high: "Slightly Clumped / Heavily Clumped / Excess", only: ["roghni-naan", "sheermal"] },
      ],
    },
    {
      letter: "B",
      name: "Internal Structure / Crumb",
      attributes: [
        { slug: "internal-color", name: "Internal Color", low: "Too Pale / White / Slightly Pale", mid: "Target (Creamy White)", high: "Slightly Yellow / Too Dark / Yellow" },
        { slug: "cell-layer-structure", name: "Cell / Layer Structure", low: "Very Dense / Compact / Slightly Dense", mid: "Target (Even Layers)", high: "Slightly Open / Very Open / Hollow" },
        { slug: "dough-layering", name: "Dough Layering", low: "No Layering / Slight Layering", mid: "Target (Distinct Layers)", high: "Slightly Uneven / Uneven / Torn Layers", only: PARATHAS },
        { slug: "filling-distribution", name: "Filling Distribution", low: "Filling Absent / Missed / Slightly Uneven", mid: "Uniform Distribution", high: "Slightly Concentrated / Heavily One-Sided", only: FILLED_PARATHAS },
        { slug: "moisture-appearance", name: "Moisture Appearance", low: "Very Dry / Crumbly / Slightly Dry", mid: "Target (Moist Look)", high: "Slightly Moist / Wet / Gummy Appearance" },
      ],
    },
    {
      letter: "C",
      name: "Aroma",
      attributes: [
        { slug: "baked-roasted-aroma", name: "Baked / Roasted Aroma", low: "Underbaked Aroma / Slightly Underbaked", mid: "Fresh Baked (Ideal)", high: "Toasted Aroma / Burnt Aroma" },
        { slug: "ghee-oily-aroma", name: "Ghee / Oily Aroma", low: "No Ghee Aroma / Low Ghee Aroma", mid: "Target (Mild Ghee)", high: "Strong Ghee Aroma / Rancid / Oxidized" },
        { slug: "dough-grainy-aroma", name: "Dough / Grainy Aroma", low: "No Dough Aroma / Low Dough Aroma", mid: "Target", high: "Strong Grainy Aroma / Raw Flour Aroma" },
        { slug: "fermented-yeast-aroma", name: "Fermented / Yeast Aroma", low: "No Yeasty Aroma / Low Yeasty Aroma", mid: "Target", high: "Strong Yeasty Aroma / Pungent Yeasty Aroma", only: ["naan", "roghni-naan"] },
        { slug: "filling-aroma", name: "Filling Aroma", low: "No Filling Aroma / Weak Filling Aroma", mid: "Target (Pleasant)", high: "Strong Filling Aroma / Off / Pungent Aroma", only: FILLED_PARATHAS },
        { slug: "sweet-milky-aroma", name: "Sweet / Milky Aroma", low: "No Sweet Aroma / Low Sweet Aroma", mid: "Target", high: "Strong Sweet Aroma / Artificial / Sickly Sweet", only: ["sheermal", "roghni-naan"] },
        { slug: "saffron-floral-aroma", name: "Saffron / Floral Aroma", low: "No Saffron Aroma / Weak Saffron Aroma", mid: "Target", high: "Strong Saffron Aroma / Artificial / Overpowering", only: ["sheermal", "roghni-naan"] },
      ],
    },
    {
      letter: "D",
      name: "Texture / Mouthfeel",
      attributes: [
        { slug: "softness-initial-bite", name: "Softness (Initial Bite)", low: "Very Hard / Tough / Slightly Hard", mid: "Target (Soft & Pliable)", high: "Slightly Soft / Mushy / Collapses" },
        { slug: "flakiness-layered-texture", name: "Flakiness / Layered Texture", low: "No Flakiness / Slight Flakiness", mid: "Target (Crisp Layers)", high: "Slightly Over-Flaky / Crumbles Excessively", only: PARATHAS },
        { slug: "chewiness", name: "Chewiness", low: "Very Tough / Rubbery / Slightly Chewy", mid: "Target", high: "Slightly Easy / Falls Apart / No Chew" },
        { slug: "moistness", name: "Moistness", low: "Very Dry / Slightly Dry", mid: "Target (Moist)", high: "Moist / Wet / Greasy" },
        { slug: "oiliness-ghee-coating", name: "Oiliness / Ghee Coating", low: "No Fat Coating / Slight Fat Coating", mid: "Target", high: "Strong Fat Coating / Excessively Greasy" },
        { slug: "stickiness", name: "Stickiness", low: "No Stickiness / Slightly Sticky", mid: "Target", high: "Sticky / Highly Sticky / Gummy" },
        { slug: "filling-texture", name: "Filling Texture", low: "Dry / Crumbly Filling / Slightly Dry", mid: "Target (Moist, Cohesive)", high: "Slightly Wet / Watery / Soggy Filling", only: FILLED_PARATHAS },
        { slug: "effort-to-swallow", name: "Effort to Swallow", low: "Very Easy (Too Soft) / Easy", mid: "Target", high: "Slightly Difficult / Very Difficult" },
      ],
    },
    {
      letter: "E",
      name: "Taste",
      attributes: [
        { slug: "saltiness", name: "Saltiness", low: "No Salt Taste / Low Salt", mid: "Target Salt Level", high: "Slightly High Salt / Too Salty" },
        { slug: "sweetness", name: "Sweetness", low: "No Sweetness / Low Sweetness", mid: "Target Sweetness", high: "Slightly Sweet / Overly Sweet", only: ["sheermal", "roghni-naan"] },
        { slug: "baked-roasted-flavor", name: "Baked / Roasted Flavor", low: "No Baked Flavor / Slight Baked Flavor", mid: "Fresh Baked (Ideal)", high: "Strong Toasted Flavor / Burnt / Bitter Flavor" },
        { slug: "ghee-fat-taste", name: "Ghee / Fat Taste", low: "No Fat Taste / Slight Fat Taste", mid: "Clean Fat Taste", high: "Strong Fat Taste / Rancid / Oxidized" },
        { slug: "dough-wheat-flavor", name: "Dough / Wheat Flavor", low: "No Grain Taste / Slight Grain Taste", mid: "Fresh Wheat Taste", high: "Strong Grain Taste / Raw Floury Taste" },
        { slug: "fermented-yeast-taste", name: "Fermented / Yeast Taste", low: "No Yeasty Taste / Low Yeasty Taste", mid: "Target", high: "Strong Yeasty Taste / Sour / Over-Fermented", only: ["naan", "roghni-naan"] },
        { slug: "filling-taste", name: "Filling Taste", low: "No Filling Flavor / Weak Filling Flavor", mid: "Target (Well-Seasoned)", high: "Strong Filling Flavor / Overpowering / Off", only: FILLED_PARATHAS },
        { slug: "milky-sweet-base-taste", name: "Milky / Sweet Base Taste", low: "No Milky Taste / Low Milky Taste", mid: "Target", high: "Strong Milky Taste / Artificial / Cloying", only: ["sheermal", "roghni-naan"] },
        { slug: "saffron-floral-taste", name: "Saffron / Floral Taste", low: "No Saffron Taste / Weak Saffron Taste", mid: "Target", high: "Strong Saffron Taste / Artificial / Bitter", only: ["sheermal", "roghni-naan"] },
      ],
    },
    {
      letter: "F",
      name: "Aftertaste",
      attributes: [
        { slug: "astringency", name: "Astringency", low: "Strong Puckering / Slight Puckering", mid: "Neutral", high: "Slight Mouth Coating / Strong Mouth Coating" },
        { slug: "sweet-salt-balance", name: "Sweet–Salt Balance", low: "Very Sweet Aftertaste / Slightly Sweet", mid: "Balanced", high: "Slightly Salty / Strong Salty Aftertaste" },
        { slug: "residue", name: "Residue", low: "Heavy Residue / Noticeable Residue", mid: "Clean", high: "Slightly Stripping / Highly Stripping (Dry)" },
        { slug: "oily-ghee-aftertaste", name: "Oily / Ghee Aftertaste", low: "No Oily Aftertaste / Slight Oily Coating", mid: "Target (Mild)", high: "Strong Oily Coating / Rancid Lingering" },
        { slug: "filling-aftertaste", name: "Filling Aftertaste", low: "No Filling Aftertaste / Faint Aftertaste", mid: "Pleasant Lingering", high: "Strong Aftertaste / Off / Pungent", only: FILLED_PARATHAS },
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
