import type { CategorySeed } from "./types";

export const data: CategorySeed = {
  key: "chicken-products",
  title: "Chicken Products",
  products: [
    { slug: "chicken-shots", name: "Chicken Shots" },
    { slug: "hotshots", name: "Hotshots" },
    { slug: "nuggets", name: "Nuggets" },
  ],
  sections: [
    {
      letter: "A",
      name: "External Appearance / Coating",
      attributes: [
        { slug: "coating-color", name: "Coating Color", low: "Very Pale / Unfried / Slightly Pale", mid: "Target (Golden Brown)", high: "Slightly Dark / Very Dark / Burnt" },
        { slug: "color-uniformity", name: "Color Uniformity", low: "Highly Uneven (Pale) / Slightly Uneven", mid: "Uniform", high: "Slightly Uneven (Dark) / Highly Uneven (Burnt)" },
        { slug: "coating-texture", name: "Coating Texture", low: "Very Smooth / No Crumb / Slightly Smooth", mid: "Target (Light Crumb)", high: "Heavy Crumb / Rough / Excessively Rough / Clumped" },
        { slug: "oiliness-external", name: "Oiliness (External)", low: "Very Dry / No Sheen / Slight Sheen", mid: "Target (Light Sheen)", high: "Oily / Wet Look / Excessively Oily" },
        { slug: "shape-uniformity", name: "Shape Uniformity", low: "Very Irregular / Slightly Irregular", mid: "Target (Uniform Shape)", high: "Slightly Distorted / Highly Distorted" },
        { slug: "size-consistency", name: "Size Consistency", low: "Much Smaller / Slightly Small", mid: "Target Size", high: "Slightly Large / Much Larger" },
        { slug: "coating-adhesion", name: "Coating Adhesion", low: "Coating Falling Off / Slightly Loose", mid: "Target (Well Adhered)", high: "Slightly Thick Coating / Very Thick / Doughy" },
      ],
    },
    {
      letter: "B",
      name: "Internal / Filling Appearance",
      attributes: [
        { slug: "chicken-color-internal", name: "Chicken Color (Internal)", low: "Grey / Undercooked / Slightly Pale", mid: "Target (Cooked White)", high: "Slightly Dark / Very Dark / Overcooked" },
        { slug: "filling-distribution", name: "Filling Distribution", low: "No Chicken / Empty / Sparse Chicken", mid: "Target (Well-Filled)", high: "Slightly Over-Filled / Excessively Over-Filled" },
        { slug: "filling-moisture", name: "Filling Moisture", low: "Very Dry / Stringy / Slightly Dry", mid: "Target (Moist & Tender)", high: "Slightly Wet / Very Wet / Watery" },
        { slug: "cheese-pull-melt", name: "Cheese Pull / Melt", low: "No Cheese Visible / Sparse Cheese", mid: "Target (Good Melt & Pull)", high: "Excess Cheese / Very Excess / Oily Cheese", only: ["hotshots"] },
      ],
    },
    {
      letter: "C",
      name: "Aroma",
      attributes: [
        { slug: "fried-aroma", name: "Fried Aroma", low: "Very Weak / None / Slight Fried Aroma", mid: "Target (Fresh Fried)", high: "Strong Fried Aroma / Burnt / Acrid Aroma" },
        { slug: "chicken-aroma", name: "Chicken Aroma", low: "No Chicken Aroma / Weak Chicken Aroma", mid: "Target (Clear Chicken)", high: "Strong Chicken Aroma / Off / Sour Chicken" },
        { slug: "spice-seasoning-aroma", name: "Spice / Seasoning Aroma", low: "No Spice Aroma / Weak Spice Aroma", mid: "Target (Balanced)", high: "Strong Spice Aroma / Overpowering / Pungent" },
        { slug: "oily-fat-aroma", name: "Oily / Fat Aroma", low: "No Oily Aroma / Slight Oily Aroma", mid: "Target", high: "Strong Oily Aroma / Rancid / Oxidized" },
        { slug: "cheese-aroma", name: "Cheese Aroma", low: "None / Faint", mid: "Target (Mild Cheese)", high: "Strong Cheese Aroma / Sharp / Off Cheese", only: ["hotshots"] },
      ],
    },
    {
      letter: "D",
      name: "Mouthfeel / Texture",
      attributes: [
        { slug: "coating-crunch", name: "Coating Crunch", low: "No Crunch / Soggy / Low Crunch", mid: "Target (Clear Crunch)", high: "Very Crunchy / Excessively Hard" },
        { slug: "coating-chewiness", name: "Coating Chewiness", low: "Too Tough / Rubbery / Slightly Chewy", mid: "Target", high: "Slightly Easy / Falls Apart" },
        { slug: "chicken-tenderness", name: "Chicken Tenderness", low: "Very Tough / Stringy / Slightly Tough", mid: "Target (Tender & Juicy)", high: "Slightly Mushy / Very Mushy / Paste" },
        { slug: "chicken-juiciness", name: "Chicken Juiciness", low: "Very Dry / Slightly Dry", mid: "Target (Juicy)", high: "Slightly Wet / Very Wet / Watery" },
        { slug: "oiliness-mouthfeel", name: "Oiliness (Mouthfeel)", low: "No Fat Coating / Slight Coating", mid: "Target", high: "Heavy Coating / Excessively Greasy" },
        { slug: "spice-heat-burn", name: "Spice Heat / Burn", low: "No Heat / Faint Heat", mid: "Target (Mild Spice)", high: "Moderate Heat / Intense Heat / Burning" },
        { slug: "cheese-melt-feel", name: "Cheese Melt (Feel)", low: "No Cheese Feel / Faint Cheese", mid: "Target (Creamy Melt)", high: "Heavy Cheese / Excessively Oily Cheese", only: ["hotshots"] },
      ],
    },
    {
      letter: "E",
      name: "Taste",
      attributes: [
        { slug: "saltiness", name: "Saltiness", low: "No Salt / Low Salt", mid: "Target Salt Level", high: "Slightly Salty / Too Salty" },
        { slug: "spiciness", name: "Spiciness", low: "No Spice / Low Spice", mid: "Target Spice Level", high: "Slightly High / Very High / Burning" },
        { slug: "chicken-flavor", name: "Chicken Flavor", low: "No Chicken Taste / Weak Chicken Taste", mid: "Target (Clear Chicken)", high: "Strong Chicken Taste / Artificial / Off" },
        { slug: "savory-umami", name: "Savory / Umami", low: "No Savory Taste / Low Savory", mid: "Target", high: "Strong Savory / Overpowering" },
        { slug: "oily-fat-taste", name: "Oily / Fat Taste", low: "No Fat Taste / Slight Fat Taste", mid: "Clean Fat Taste", high: "Strong Fat Taste / Rancid / Oxidized" },
        { slug: "cheese-taste", name: "Cheese Taste", low: "None / Faint", mid: "Target (Mild Creamy)", high: "Strong Cheese / Sharp / Off Cheese", only: ["hotshots"] },
        { slug: "sweetness", name: "Sweetness", low: "None / Faint", mid: "Target (Balanced)", high: "Slightly Sweet / Overly Sweet" },
      ],
    },
    {
      letter: "F",
      name: "Aftertaste",
      attributes: [
        { slug: "spice-lingering", name: "Spice Lingering", low: "None / Faint", mid: "Pleasant Lingering", high: "Strong Lingering / Burning / Painful" },
        { slug: "oily-aftertaste", name: "Oily Aftertaste", low: "None / Slight", mid: "Clean (Target)", high: "Strong Oily Coating / Rancid / Unpleasant" },
        { slug: "residue", name: "Residue", low: "Heavy Residue / Noticeable Residue", mid: "Clean", high: "Slightly Stripping / Highly Stripping" },
        { slug: "chicken-aftertaste", name: "Chicken Aftertaste", low: "None / Faint", mid: "Pleasant Lingering", high: "Strong / Off / Sour" },
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
