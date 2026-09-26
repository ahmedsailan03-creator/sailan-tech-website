import type { Client } from "@libsql/client";
import type { PrivateProduct } from "./types";
import { ApiError } from "./security";

async function mutateInventory(
  client: Client,
  id: string,
  product?: PrivateProduct,
) {
  const tx = await client.transaction("write");
  try {
    const pending = await tx.execute({
      sql: "SELECT o.id FROM order_items i JOIN orders o ON o.id=i.order_id WHERE i.product_id=? AND o.status='Pending payment'",
      args: [id],
    });
    if (pending.rows.length)
      throw new ApiError(
        "This device has a pending checkout. Reconcile it before changing inventory.",
        409,
      );
    if (product) {
      for (const image of product.images.filter((s) =>
        s.startsWith("/api/images/"),
      )) {
        if (
          !(
            await tx.execute({
              sql: "SELECT id FROM uploads WHERE id=? AND kind='image'",
              args: [image.split("/").pop()!],
            })
          ).rows.length
        )
          throw new ApiError(
            "A selected product image is missing. Upload it again.",
          );
      }
      const current = (
        await tx.execute({
          sql: "SELECT body,revision FROM products WHERE id=?",
          args: [id],
        })
      ).rows[0];
      if (current && Number(current.revision) !== product.revision)
        throw new ApiError(
          "This product changed while you were editing it. Close the editor and refresh before saving.",
          409,
        );
      const stored = {
        ...product,
        soldCount: current
          ? JSON.parse(String(current.body)).soldCount || 0
          : 0,
      };
      await tx.execute({
        sql: "INSERT INTO products(id,slug,body,price,quantity,status,sample) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,body=excluded.body,price=excluded.price,quantity=excluded.quantity,status=excluded.status,sample=excluded.sample,deleted=0,revision=products.revision+1",
        args: [
          id,
          product.slug,
          JSON.stringify(stored),
          product.price,
          product.quantity,
          product.status,
          product.sample ? 1 : 0,
        ],
      });
    } else
      await tx.execute({
        sql: "UPDATE products SET deleted=1 WHERE id=?",
        args: [id],
      });
    await tx.commit();
  } catch (e) {
    if (!tx.closed) await tx.rollback();
    throw e;
  } finally {
    tx.close();
  }
}
export const saveProduct = (client: Client, product: PrivateProduct) =>
  mutateInventory(client, product.id, product);
export const archiveProduct = (client: Client, id: string) =>
  mutateInventory(client, id);
