import type { CategorySeed } from "./types";

// The client's xlsx lists "Muffins (Vanilla, Pineapple, Chocolate, Strawberry)" and "Cupcakes
// (...)" as two grouped product rows, but footnotes reference specific flavor variants
// (e.g. "Chocolate Muffin / Cupcake", "flavoured Muffins & Cupcakes"). We expand these into
// one product per flavor so applicability can be modeled exactly instead of approximated.
const FLAVOURED_MUFFIN_CUPCAKE = ["muffin-pineapple", "muffin-chocolate", "muffin-strawberry", "cupcake-pineapple", "cupcake-chocolate", "cupcake-strawberry"];
const FRUITY_MUFFIN_CUPCAKE = ["muffin-pineapple", "muffin-strawberry", "cupcake-pineapple", "cupcake-strawberry"];
const CHOCOLATE_MUFFIN_CUPCAKE = ["muffin-chocolate", "cupcake-chocolate"];

export const data: CategorySeed = {
  key: "cakes-muffins-cupcakes",
  title: "Cakes, Muffins & Cupcakes",
  products: [
    { slug: "lemon-cake", name: "Lemon Cake" },
    { slug: "fruit-cake", name: "Fruit Cake" },
    { slug: "plain-cake", name: "Plain Cake" },
    { slug: "marble-cake", name: "Marble Cake" },
    { slug: "pound-cake", name: "Pound Cake" },
    { slug: "boat-cake-plain", name: "Boat Cake Plain" },
    { slug: "mango-boat-cake", name: "Mango Boat Cake" },
    { slug: "chocolate-bar-cake", name: "Chocolate Bar Cake" },
    { slug: "plain-bar-cake", name: "Plain Bar Cake" },
    { slug: "fruit-bun", name: "Fruit Bun" },
    { slug: "muffin-vanilla", name: "Muffin — Vanilla" },
    { slug: "muffin-pineapple", name: "Muffin — Pineapple" },
    { slug: "muffin-chocolate", name: "Muffin — Chocolate" },
    { slug: "muffin-strawberry", name: "Muffin — Strawberry" },
    { slug: "cupcake-vanilla", name: "Cupcake — Vanilla" },
    { slug: "cupcake-pineapple", name: "Cupcake — Pineapple" },
    { slug: "cupcake-chocolate", name: "Cupcake — Chocolate" },
    { slug: "cupcake-strawberry", name: "Cupcake — Strawberry" },
  ],
  sections: [
    {
      letter: "A",
      name: "Surface / External Appearance",
      attributes: [
        { slug: "crust-top-color", name: "Crust / Top Color", low: "Too Light / Pale / Slightly Light", mid: "Target (Golden / Brown)", high: "Slightly Dark / Very Dark / Burnt" },
        { slug: "surface-smoothness", name: "Surface Smoothness", low: "Highly Cracked / Split / Slightly Cracked", mid: "Smooth", high: "Slightly Domed / Highly Domed / Peaked" },
        { slug: "top-shape-rise", name: "Top Shape / Rise", low: "Very Flat / Slightly Flat", mid: "Target", high: "Slightly Raised / Highly Raised / Peaked" },
        { slug: "fruit-visibility", name: "Fruit Visibility", low: "No Fruit Visible / Sparse Fruit", mid: "Uniform Distribution", high: "Slightly Concentrated / Heavily Clumped", only: ["fruit-cake", "fruit-bun"] },
        { slug: "marble-pattern", name: "Marble Pattern", low: "No Marble / Solid / Faint Marble", mid: "Target (Clear Marble)", high: "Heavy / Blotchy Marble / Marbling Absent", only: ["marble-cake", "chocolate-bar-cake"] },
        { slug: "color-uniformity", name: "Color Uniformity", low: "Highly Uneven (Light) / Slightly Uneven", mid: "Uniform", high: "Slightly Uneven (Dark) / Highly Uneven (Dark)" },
        { slug: "shape-uniformity", name: "Shape Uniformity", low: "Very Irregular / Slightly Irregular", mid: "Target", high: "Slightly Distorted / Highly Distorted" },
      ],
    },
    {
      letter: "B",
      name: "Crumb / Internal Structure",
      attributes: [
        { slug: "crumb-color", name: "Crumb Color", low: "Too Pale / White / Slightly Pale", mid: "Target", high: "Slightly Dark / Too Dark" },
        { slug: "cell-structure", name: "Cell Structure", low: "Very Open / Tunneling / Slightly Open", mid: "Target (Fine Even Cells)", high: "Slightly Dense / Very Dense / Compact" },
        { slug: "cell-uniformity", name: "Cell Uniformity", low: "Highly Uneven / Slightly Uneven", mid: "Uniform", high: "Slightly Dense Patches / Highly Dense Patches" },
        { slug: "moist-appearance", name: "Moist Appearance", low: "Very Dry / Crumbly / Slightly Dry", mid: "Target (Moist Look)", high: "Slightly Moist / Wet / Gummy" },
        { slug: "chocolate-swirl", name: "Chocolate Swirl", low: "No Swirl / Faint Swirl", mid: "Target (Clear Swirl)", high: "Heavy Swirl / Swirl Absent", only: ["marble-cake", "chocolate-bar-cake"] },
        { slug: "fruit-distribution", name: "Fruit Distribution", low: "Fruit Settled at Bottom / Slightly Uneven", mid: "Uniform", high: "Slightly Concentrated / Heavily Concentrated", only: ["fruit-cake", "fruit-bun"] },
      ],
    },
    {
      letter: "C",
      name: "Aroma",
      attributes: [
        { slug: "milky-dairy-aroma", name: "Milky / Dairy Aroma", low: "No Dairy Aroma / Low Dairy Aroma", mid: "Target", high: "Slightly Strong / Very Strong" },
        { slug: "vanilla-aroma", name: "Vanilla Aroma", low: "No Vanilla Aroma / Low Vanilla Aroma", mid: "Target", high: "Strong Vanilla Aroma / Artificial / Overpowering" },
        { slug: "baked-aroma", name: "Baked Aroma", low: "Underbaked Aroma / Slightly Underbaked", mid: "Fresh Baked (Ideal)", high: "Toasted Aroma / Burnt Aroma" },
        { slug: "buttery-aroma", name: "Buttery Aroma", low: "No Buttery Aroma / Low Buttery Aroma", mid: "Target", high: "Strong Buttery Aroma / Rancid Fat Aroma" },
        { slug: "fruity-aroma", name: "Fruity Aroma", low: "No Fruity Aroma / Weak Fruity Aroma", mid: "Target", high: "Strong Fruity Aroma / Artificial Fruity Aroma", only: ["fruit-cake", "fruit-bun"] },
        { slug: "lemon-citrus-aroma", name: "Lemon / Citrus Aroma", low: "None / Faint", mid: "Target (Fresh Citrus)", high: "Strong / Artificial / Chemical", only: ["lemon-cake"] },
        { slug: "chocolate-aroma", name: "Chocolate Aroma", low: "None / Faint", mid: "Target (Rich Cocoa)", high: "Strong / Artificial / Bitter", only: ["chocolate-bar-cake", "marble-cake", ...CHOCOLATE_MUFFIN_CUPCAKE] },
        { slug: "mango-aroma", name: "Mango Aroma", low: "None / Faint", mid: "Target (Fresh Mango)", high: "Strong / Artificial / Over-Ripe", only: ["mango-boat-cake"] },
        { slug: "strawberry-pineapple-aroma", name: "Strawberry / Pineapple Aroma", low: "None / Faint", mid: "Target", high: "Strong / Artificial / Overpowering", only: FRUITY_MUFFIN_CUPCAKE },
      ],
    },
    {
      letter: "D",
      name: "Mouthfeel / Texture",
      attributes: [
        { slug: "moistness", name: "Moistness", low: "Very Dry / Dry", mid: "Target (Moist)", high: "Moist / Very Moist / Gummy" },
        { slug: "crumbliness", name: "Crumbliness", low: "Highly Crumbly / Slightly Crumbly", mid: "Target (Slightly Tender)", high: "Slightly Cohesive / Very Cohesive / Gummy" },
        { slug: "softness-initial-bite", name: "Softness (Initial Bite)", low: "Very Hard / Dense / Slightly Hard", mid: "Target (Soft)", high: "Slightly Soft / Mushy" },
        { slug: "mouth-coating", name: "Mouth Coating", low: "No Coating / Slight Coating", mid: "Target", high: "High Coating / Excessively Greasy" },
        { slug: "effort-to-swallow", name: "Effort to Swallow", low: "Very Easy (Too Soft) / Easy", mid: "Target", high: "Slightly Difficult / Very Difficult" },
      ],
    },
    {
      letter: "E",
      name: "Taste",
      attributes: [
        { slug: "sweetness", name: "Sweetness", low: "Very Low / Low", mid: "Target", high: "Slightly High / Overly Sweet" },
        { slug: "milky-taste", name: "Milky Taste", low: "No Milk Taste / Low Milk Taste", mid: "Target", high: "Strong Milk Taste / Artificial Milk Taste" },
        { slug: "vanilla-taste", name: "Vanilla Taste", low: "No Vanilla Taste / Low Vanilla Taste", mid: "Target", high: "Strong Vanilla Taste / Artificial Vanilla Taste" },
        { slug: "baked-buttery-taste", name: "Baked / Buttery Taste", low: "No Buttery Flavor / Slight Buttery Flavor", mid: "Target", high: "Strong Buttery Flavor / Rancid Fat Taste" },
        { slug: "fruity-taste", name: "Fruity Taste", low: "No Fruit Taste / Low Fruit Taste", mid: "Target", high: "Strong Fruit Taste / Artificial Fruit Taste", only: ["fruit-cake", "fruit-bun"] },
        { slug: "lemon-citrus-taste", name: "Lemon / Citrus Taste", low: "None / Faint", mid: "Target (Bright & Tangy)", high: "Strong / Sour / Artificial / Bitter", only: ["lemon-cake"] },
        { slug: "chocolate-taste", name: "Chocolate Taste", low: "None / Low", mid: "Target (Rich Cocoa)", high: "Strong / Artificial / Very Bitter", only: ["chocolate-bar-cake", "marble-cake", ...CHOCOLATE_MUFFIN_CUPCAKE] },
        { slug: "mango-taste", name: "Mango Taste", low: "None / Faint", mid: "Target (Fresh Mango)", high: "Strong / Artificial / Over-Ripe", only: ["mango-boat-cake"] },
        { slug: "strawberry-pineapple-taste", name: "Strawberry / Pineapple Taste", low: "None / Faint", mid: "Target", high: "Strong / Artificial / Cloying", only: FRUITY_MUFFIN_CUPCAKE },
      ],
    },
    {
      letter: "F",
      name: "Aftertaste",
      attributes: [
        { slug: "drying-intensity", name: "Drying Intensity", low: "Very Drying / Slightly Drying", mid: "Neutral", high: "Slight Moist Coating / Heavy Coating" },
        { slug: "sweet-bitter-balance", name: "Sweet–Bitter Balance", low: "Very Sweet / Slightly Sweet", mid: "Balanced", high: "Slightly Bitter / Strong Bitter" },
        { slug: "residue", name: "Residue", low: "Heavy Residue / Noticeable Residue", mid: "Clean", high: "Slightly Stripping / Highly Stripping" },
        { slug: "fruit-flavour-aftertaste", name: "Fruit / Flavour Aftertaste", low: "None / Faint", mid: "Pleasant Lingering", high: "Strong / Artificial / Bitter", only: ["lemon-cake", "fruit-cake", "mango-boat-cake", "fruit-bun", ...FLAVOURED_MUFFIN_CUPCAKE] },
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
