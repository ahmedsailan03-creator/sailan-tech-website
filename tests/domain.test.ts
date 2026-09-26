import test from "node:test";
import assert from "node:assert/strict";
import { calculateQuote } from "../lib/quote";
import type { DeviceModel, PricingPolicy, QuoteInput } from "../lib/types";
const model: DeviceModel = {
  id: "iphone-15-pro-max",
  category: "iPhone",
  brand: "Apple",
  name: "iPhone 15 Pro Max",
  base: 52000,
  enabled: true,
  storage: ["256GB", "512GB"],
};
const policy: PricingPolicy = {
  multipliers: { None: 1, Light: 0.9, Moderate: 0.75, Heavy: 0.6 },
  deductions: {
    "Small crack": 7000,
    "Major crack": 12000,
    "Screen does not work": 15000,
    touch: 4000,
    biometrics: 6000,
    back: 4500,
    battery: 3500,
    carrier: 4000,
  },
  accessories: { "Original box": 500, "Charging cable": 500 },
  storage: { "256GB": 0, "512GB": 4000 },
  ram: {},
  cpu: {},
  gpu: {},
  partsMultiplier: 0.2,
  maxOffer: 200000,
  minMargin: 5000,
  feesPercent: 12,
  shipping: 1500,
  approved: true,
};
const input: QuoteInput = {
  category: "iPhone",
  brand: "Apple",
  modelId: model.id,
  specs: { storage: "256GB" },
  condition: {
    power: "Yes",
    screen: "No",
    touch: "Yes",
    biometrics: "Yes",
    cosmetics: "None",
    back: "No",
    liquid: "No",
    carrier: "Unlocked",
    activation: "Yes",
    battery: "90–100%",
  },
  accessories: [],
};
test("excellent device receives the configured base, not a client-provided price", () =>
  assert.equal(calculateQuote(input, model, policy).total, 52000));
test("activation locked device cannot receive an acceptable offer", () =>
  assert.equal(
    calculateQuote(
      { ...input, condition: { ...input.condition, activation: "No" } },
      model,
      policy,
    ).eligibility,
    "declined",
  ));
test("uncertain activation lock and liquid damage require manual review", () => {
  assert.equal(
    calculateQuote(
      { ...input, condition: { ...input.condition, activation: "Not sure" } },
      model,
      policy,
    ).eligibility,
    "review",
  );
  assert.equal(
    calculateQuote(
      { ...input, condition: { ...input.condition, liquid: "Yes" } },
      model,
      policy,
    ).eligibility,
    "review",
  );
});
test("mismatched category or brand is not priced", () =>
  assert.equal(
    calculateQuote({ ...input, category: "Xbox" }, model, policy).eligibility,
    "review",
  ));
test("configured condition and repair deductions change the estimate", () =>
  assert.equal(
    calculateQuote(
      {
        ...input,
        condition: {
          ...input.condition,
          cosmetics: "Light",
          screen: "Major crack",
          battery: "Below 80%",
        },
      },
      model,
      policy,
    ).total,
    31300,
  ));
test("no power uses parts pricing and cannot be increased by accessories", () =>
  assert.equal(
    calculateQuote(
      {
        ...input,
        condition: { ...input.condition, power: "No" },
        accessories: ["Original box"],
      },
      model,
      policy,
    ).total,
    10400,
  ));
test("configuration and distinct accessories are valued once", () =>
  assert.equal(
    calculateQuote(
      {
        ...input,
        specs: { storage: "512GB" },
        accessories: ["Original box", "Original box", "Charging cable"],
      },
      model,
      policy,
    ).total,
    57000,
  ));
test("unknown configurations require review", () =>
  assert.equal(
    calculateQuote({ ...input, specs: { storage: "9TB" } }, model, policy)
      .eligibility,
    "review",
  ));
test("deductions never produce a negative payout", () =>
  assert.equal(
    calculateQuote(
      { ...input, condition: { ...input.condition, screen: "Major crack" } },
      { ...model, base: 5000 },
      policy,
    ).total,
    0,
  ));
test("maximum offer honors resale fees shipping and minimum margin", () =>
  assert.equal(
    calculateQuote(input, { ...model, expectedResale: 60000 }, policy).total,
    46300,
  ));
test("phone quotes cannot claim computer components or unrelated accessories", () => {
  assert.equal(
    calculateQuote(
      { ...input, specs: { ...input.specs, gpu: "NVIDIA RTX 4070" } },
      model,
      { ...policy, gpu: { "NVIDIA RTX 4070": 18000 } },
    ).eligibility,
    "review",
  );
  assert.equal(
    calculateQuote({ ...input, accessories: ["Controller"] }, model, {
      ...policy,
      accessories: { Controller: 1500 },
    }).eligibility,
    "review",
  );
});
test("applicable condition checks cannot be skipped with arbitrary values", () => {
  for (const [key, value] of [
    ["screen", "Not applicable"],
    ["activation", "Anything"],
    ["touch", "Not applicable"],
  ])
    assert.equal(
      calculateQuote(
        { ...input, condition: { ...input.condition, [key]: value } },
        model,
        policy,
      ).eligibility,
      "review",
    );
});
test("computer specifications must be approved for the specific model", () => {
  const computer = {
    ...model,
    category: "MacBook",
    configurations: {
      cpu: ["Apple silicon"],
      ram: ["16GB"],
      gpu: ["Integrated"],
    },
  };
  const detail = {
    ...input,
    category: "MacBook",
    specs: {
      storage: "256GB",
      cpu: "Apple silicon",
      ram: "16GB",
      gpu: "NVIDIA RTX 4070",
    },
    condition: {
      ...input.condition,
      back: "Not applicable",
      carrier: "Not applicable",
    },
  };
  assert.equal(
    calculateQuote(detail, computer, {
      ...policy,
      cpu: { "Apple silicon": 0 },
      ram: { "16GB": 2000 },
      gpu: { "NVIDIA RTX 4070": 18000, Integrated: 0 },
    }).eligibility,
    "review",
  );
});
