export function removePurchased(
  cart: { id: string; quantity: number }[],
  items: { id: string; quantity: number }[],
) {
  const purchased = new Map(items.map((i) => [i.id, i.quantity]));
  return cart
    .map((line) => ({
      ...line,
      quantity: Math.max(0, line.quantity - (purchased.get(line.id) || 0)),
    }))
    .filter((line) => line.quantity > 0);
}
