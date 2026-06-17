// ============================================================================
// FALLBACK SAMPLE DATA — in-memory members so every screen renders in dev
// before the Supabase `customer` table is seeded. Realistic gym-churn feature
// values mapped to the Vitaliza case. NOT real data; clearly a dev fallback.
//
// TODO: once Supabase `customer` rows exist, the API clients read those first
// and this file is only used as a graceful fallback.
// ============================================================================

import type { Customer } from "./types";

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "VZ-1042",
    external_ref: "VZ-1042",
    features: {
      gender: 1, Near_Location: 1, Partner: 0, Promo_friends: 0, Phone: 1,
      Contract_period: 1, Group_visits: 0, Age: 24,
      Avg_additional_charges_total: 48, Month_to_end_contract: 1,
      Lifetime: 1, Avg_class_frequency_total: 1.1,
      Avg_class_frequency_current_month: 0.3,
    },
    true_churn: 1,
  },
  {
    id: "VZ-2098",
    external_ref: "VZ-2098",
    features: {
      gender: 0, Near_Location: 1, Partner: 1, Promo_friends: 1, Phone: 1,
      Contract_period: 12, Group_visits: 1, Age: 33,
      Avg_additional_charges_total: 320, Month_to_end_contract: 9,
      Lifetime: 14, Avg_class_frequency_total: 2.6,
      Avg_class_frequency_current_month: 2.4,
    },
    true_churn: 0,
  },
  {
    id: "VZ-3071",
    external_ref: "VZ-3071",
    features: {
      gender: 1, Near_Location: 0, Partner: 0, Promo_friends: 0, Phone: 1,
      Contract_period: 6, Group_visits: 0, Age: 41,
      Avg_additional_charges_total: 95, Month_to_end_contract: 2,
      Lifetime: 4, Avg_class_frequency_total: 2.2,
      Avg_class_frequency_current_month: 0.9,
    },
    true_churn: 1,
  },
  {
    id: "VZ-4115",
    external_ref: "VZ-4115",
    // Classic sleeping dog: long tenure, near-zero current usage.
    features: {
      gender: 0, Near_Location: 1, Partner: 1, Promo_friends: 0, Phone: 1,
      Contract_period: 12, Group_visits: 0, Age: 52,
      Avg_additional_charges_total: 210, Month_to_end_contract: 7,
      Lifetime: 11, Avg_class_frequency_total: 1.4,
      Avg_class_frequency_current_month: 0.2,
    },
    true_churn: 0,
  },
  {
    id: "VZ-5230",
    external_ref: "VZ-5230",
    features: {
      gender: 1, Near_Location: 1, Partner: 0, Promo_friends: 1, Phone: 1,
      Contract_period: 6, Group_visits: 1, Age: 28,
      Avg_additional_charges_total: 175, Month_to_end_contract: 4,
      Lifetime: 7, Avg_class_frequency_total: 2.9,
      Avg_class_frequency_current_month: 1.6,
    },
    true_churn: 0,
  },
  {
    id: "VZ-6087",
    external_ref: "VZ-6087",
    features: {
      gender: 0, Near_Location: 0, Partner: 0, Promo_friends: 0, Phone: 1,
      Contract_period: 1, Group_visits: 0, Age: 36,
      Avg_additional_charges_total: 60, Month_to_end_contract: 1,
      Lifetime: 2, Avg_class_frequency_total: 1.8,
      Avg_class_frequency_current_month: 1.0,
    },
    true_churn: 1,
  },
  {
    id: "VZ-7194",
    external_ref: "VZ-7194",
    features: {
      gender: 1, Near_Location: 1, Partner: 1, Promo_friends: 1, Phone: 1,
      Contract_period: 12, Group_visits: 1, Age: 45,
      Avg_additional_charges_total: 410, Month_to_end_contract: 11,
      Lifetime: 22, Avg_class_frequency_total: 3.1,
      Avg_class_frequency_current_month: 3.0,
    },
    true_churn: 0,
  },
  {
    id: "VZ-8256",
    external_ref: "VZ-8256",
    features: {
      gender: 0, Near_Location: 1, Partner: 0, Promo_friends: 0, Phone: 1,
      Contract_period: 6, Group_visits: 0, Age: 31,
      Avg_additional_charges_total: 130, Month_to_end_contract: 3,
      Lifetime: 5, Avg_class_frequency_total: 2.4,
      Avg_class_frequency_current_month: 1.2,
    },
    true_churn: 1,
  },
];

export function findSample(id: string): Customer | undefined {
  return SAMPLE_CUSTOMERS.find((c) => String(c.id) === id || c.external_ref === id);
}
