import type { DeviceModel, Estimate, PricingPolicy, QuoteInput } from "./types";
import {
  accessoryOptions,
  computerCats,
  consoleCats,
  mobileCats,
} from "./device";
export function calculateQuote(
  input: QuoteInput,
  model: DeviceModel | undefined,
  policy: PricingPolicy,
): Estimate {
  const out: Estimate = {
    eligibility: "eligible",
    base: model?.base ?? 0,
    configuration: 0,
    condition: 0,
    accessories: 0,
    cap: 0,
    total: 0,
    breakdown: [],
    sample: !policy.approved,
  };
  const review = (reason: string) => ({
    ...out,
    eligibility: "review" as const,
    reason,
  });
  if (
    !model?.enabled ||
    model.category !== input.category ||
    model.brand !== input.brand ||
    model.id !== input.modelId
  )
    return review(
      "This model needs a personal review. Request an offer from our team.",
    );
  const c = input.condition;
  if (c.activation === "No")
    return {
      ...out,
      eligibility: "declined",
      reason:
        "We cannot accept activation-locked devices. Remove the owner account and device lock before requesting an offer.",
    };
  if (c.activation !== "Yes")
    return review(
      "Confirm that all owner accounts and activation locks can be removed.",
    );
  if (c.liquid !== "No")
    return review(
      "Possible liquid damage needs an inspection before we can estimate a value.",
    );
  if (!model.storage.includes(input.specs.storage))
    return review("This storage configuration needs a personal review.");
  for (const [key, values] of Object.entries({
    power: ["Yes", "No"],
    screen: [
      "No",
      "Small crack",
      "Major crack",
      "Screen does not work",
      "Not applicable",
    ],
    touch: ["Yes", "No", "Not applicable"],
    biometrics: ["Yes", "No", "Not applicable"],
    cosmetics: ["None", "Light", "Moderate", "Heavy"],
    back: ["Yes", "No", "Not applicable"],
    battery: ["90–100%", "80–89%", "Below 80%", "Unknown", "Not applicable"],
    carrier: ["Unlocked", "Locked", "Not sure", "Not applicable"],
  })) {
    if (!values.includes(c[key]))
      return review("Please complete the device condition questions.");
  }
  if (c.carrier === "Not sure")
    return review("Please confirm the carrier lock before accepting an offer.");
  const computer = computerCats.includes(input.category);
  const noScreen =
    consoleCats.includes(input.category) ||
    ["Desktop", "Gaming PC"].includes(input.category);
  if (!noScreen && c.screen === "Not applicable")
    return review("Please describe the screen condition.");
  if (
    mobileCats.includes(input.category) &&
    (c.touch === "Not applicable" ||
      c.battery === "Not applicable" ||
      c.carrier === "Not applicable")
  )
    return review("Please complete the mobile device condition questions.");
  if (!computer && ["ram", "cpu", "gpu"].some((k) => Boolean(input.specs[k])))
    return review("These components do not apply to this device.");
  if (
    input.accessories.some((a) => !accessoryOptions(input.category).includes(a))
  )
    return review("These accessories need a personal review.");
  if (
    computer &&
    (["ram", "cpu", "gpu"] as const).some(
      (k) => !model.configurations?.[k]?.includes(input.specs[k]),
    )
  )
    return review("This computer configuration needs a personal review.");
  for (const key of (computer
    ? ["storage", "ram", "cpu", "gpu"]
    : ["storage"]) as ("storage" | "ram" | "cpu" | "gpu")[]) {
    const v = input.specs[key];
    if (v && Object.keys(policy[key]).length) {
      if (!(v in policy[key]))
        return review(
          `This ${key.toUpperCase()} configuration needs a personal review.`,
        );
      out.configuration += policy[key][v];
    }
  }
  const adjusted = out.base + out.configuration;
  if (c.power === "No") {
    out.condition = Math.round(adjusted * policy.partsMultiplier) - adjusted;
    out.breakdown.push({
      label: "Does not power on · parts valuation",
      amount: out.condition,
    });
  } else {
    out.condition =
      Math.round(adjusted * (policy.multipliers[c.cosmetics] ?? 0)) - adjusted;
    if (out.condition)
      out.breakdown.push({
        label: `${c.cosmetics} wear`,
        amount: out.condition,
      });
    const deduct = (key: string, label: string) => {
      const n = policy.deductions[key] ?? 0;
      out.condition -= n;
      if (n) out.breakdown.push({ label, amount: -n });
    };
    if (!["No", "Not applicable"].includes(c.screen))
      deduct(c.screen, "Screen repair");
    if (c.touch === "No") deduct("touch", "Touch repair");
    if (c.biometrics === "No") deduct("biometrics", "Biometric repair");
    if (c.back === "Yes") deduct("back", "Back glass repair");
    if (c.battery === "Below 80%") deduct("battery", "Battery replacement");
    if (c.carrier === "Locked") deduct("carrier", "Carrier lock adjustment");
    out.accessories = [...new Set(input.accessories)].reduce(
      (sum, x) => sum + (policy.accessories[x] ?? 0),
      0,
    );
  }
  const beforeCap = Math.max(0, adjusted + out.condition + out.accessories);
  const resaleCap = model.expectedResale
    ? Math.max(
        0,
        Math.floor(model.expectedResale * (1 - policy.feesPercent / 100)) -
          policy.shipping -
          policy.minMargin,
      )
    : policy.maxOffer;
  out.total = Math.max(0, Math.min(beforeCap, policy.maxOffer, resaleCap));
  out.cap = out.total - beforeCap;
  return out;
}
