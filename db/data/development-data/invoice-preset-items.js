module.exports = [
  // MOT Test
  { preset_ref: 'MOT Test', type: 'labour', description: 'MOT Test', quantity_default: 1,   price: 54.85, vat_applies: false },

  // Full Service
  { preset_ref: 'Full Service', type: 'labour', description: 'Labour (Full Service)', quantity_default: 2.5, price: 60.00, vat_applies: true },
  { preset_ref: 'Full Service', type: 'part',   description: 'Oil Filter',            quantity_default: 1,   price: 8.50,  vat_applies: true },
  { preset_ref: 'Full Service', type: 'part',   description: 'Engine Oil (5W-30)',    quantity_default: 5,   price: 6.00,  vat_applies: true },
  { preset_ref: 'Full Service', type: 'part',   description: 'Pollen/Cabin Filter',   quantity_default: 1,   price: 12.00, vat_applies: true },

  // Interim Service
  { preset_ref: 'Interim Service', type: 'labour', description: 'Labour (Interim Service)', quantity_default: 1.5, price: 60.00, vat_applies: true },
  { preset_ref: 'Interim Service', type: 'part',   description: 'Oil Filter',               quantity_default: 1,   price: 8.50,  vat_applies: true },
  { preset_ref: 'Interim Service', type: 'part',   description: 'Engine Oil (5W-30)',       quantity_default: 4,   price: 6.00,  vat_applies: true },

  // Cambelt Change
  { preset_ref: 'Cambelt Change', type: 'labour', description: 'Cambelt Labour', quantity_default: 4, price: 60.00, vat_applies: true },
  { preset_ref: 'Cambelt Change', type: 'part',   description: 'Cambelt Kit',    quantity_default: 1, price: 120.00, vat_applies: true },
  { preset_ref: 'Cambelt Change', type: 'part',   description: 'Coolant Top-up', quantity_default: 1, price: 8.00,   vat_applies: true },

  // Brake Pads & Discs (Front)
  { preset_ref: 'Brake Pads & Discs (Front)', type: 'labour', description: 'Brake Labour (Front)', quantity_default: 1.5, price: 60.00, vat_applies: true },
  { preset_ref: 'Brake Pads & Discs (Front)', type: 'part',   description: 'Front Brake Pads',     quantity_default: 1,   price: 30.00, vat_applies: true },
  { preset_ref: 'Brake Pads & Discs (Front)', type: 'part',   description: 'Front Brake Discs',    quantity_default: 2,   price: 40.00, vat_applies: true },

  // Air-Con Re-Gas (R134a)
  { preset_ref: 'Air-Con Re-Gas (R134a)', type: 'labour', description: 'AC Re-Gas Labour', quantity_default: 0.75, price: 60.00, vat_applies: true },
  { preset_ref: 'Air-Con Re-Gas (R134a)', type: 'part',   description: 'Refrigerant R134a (grams)', quantity_default: 450, price: 0.05, vat_applies: true }
];