import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import CommerceAdmin from "./CommerceAdmin";

const money = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    pence / 100,
  );

export default function ShopApp() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(
    () => window.location.hash === "#admin",
  );
  const catalogue = trpc.commerce.catalogue.useQuery({
    query: submittedQuery,
    category,
  });
  const categories = trpc.commerce.categories.useQuery();
  const detail = trpc.commerce.product.useQuery(
    { slug: selectedSlug! },
    { enabled: !!selectedSlug },
  );
  const cart = trpc.commerce.cart.get.useQuery(undefined, { retry: false });
  const add = trpc.commerce.cart.add.useMutation({
    onSuccess: () => cart.refetch(),
  });
  const setQuantity = trpc.commerce.cart.setQuantity.useMutation({
    onSuccess: () => cart.refetch(),
  });
  const checkout = trpc.commerce.checkout.useMutation({
    onSuccess: (result) =>
      setCheckoutNotice(
        `Order ${result.orderNumber ?? result.order?.orderNumber} is prepared. Payment remains NOT CONFIGURED; no charge was made.`,
      ),
  });
  const cartItems = cart.data ?? [];
  const cartCount = useMemo(
    () => cartItems.reduce((total, item: any) => total + item.quantity, 0),
    [cartItems],
  );
  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total: number, item: any) =>
          total + item.quantity * Number(item.unitPricePence ?? 0),
        0,
      ),
    [cartItems],
  );
  if (isAdmin)
    return (
      <CommerceAdmin
        onBack={() => {
          window.location.hash = "";
          setIsAdmin(false);
        }}
      />
    );

  if (selectedSlug && detail.data) {
    const product = detail.data as any;
    const chosen =
      product.variants.find(
        (variant: any) => variant.id === selectedVariantId,
      ) ?? product.variants[0];
    return (
      <main className="min-h-screen bg-stone-50 text-slate-900">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <button
              onClick={() => {
                setSelectedSlug(null);
                setSelectedVariantId(null);
              }}
              className="inline-flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back to catalogue
            </button>
            <a href="#cart" className="text-sm font-medium">
              <ShoppingBag className="mr-1 inline h-4 w-4" /> Cart ({cartCount})
            </a>
          </div>
        </header>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-2">
          <div className="flex min-h-80 items-center justify-center rounded-2xl bg-stone-200 text-center text-sm text-stone-500">
            {product.images?.[0] ? (
              <img
                src={product.images[0].storageUrl}
                alt={product.images[0].altText}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              "No licensed product image is available"
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2e6da4]">
              {product.brand ?? "Equestrian essential"}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold">
              {product.title}
            </h1>
            <p className="mt-5 whitespace-pre-line text-slate-600">
              {product.description}
            </p>
            <dl className="mt-6 grid gap-2 text-sm">
              {(product.attributes ?? []).map((attribute: any) => (
                <div key={attribute.attributeName} className="flex gap-3">
                  <dt className="font-medium">{attribute.attributeName}</dt>
                  <dd className="text-slate-600">{attribute.attributeValue}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <p className="text-sm font-medium">Choose a variant</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-lg border px-3 py-2 text-sm ${chosen?.id === variant.id ? "border-[#2e6da4] bg-blue-50" : "border-stone-200 bg-white"}`}
                  >
                    {variant.title} · {variant.sku}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold">
                  {money(
                    chosen?.salePricePence ??
                      chosen?.retailPricePence ??
                      product.salePricePence ??
                      product.retailPricePence,
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  Availability is revalidated by the server when added to cart.
                </p>
              </div>
              <button
                disabled={!chosen || add.isPending}
                onClick={() =>
                  chosen && add.mutate({ variantId: chosen.id, quantity: 1 })
                }
                className="rounded-lg bg-[#2e6da4] px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300"
              >
                {add.isPending ? "Adding…" : "Add to cart"}
              </button>
            </div>
            {add.error && (
              <p className="mt-3 text-sm text-rose-700">{add.error.message}</p>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
          <a href="/" className="font-serif text-xl font-semibold">
            EquiProfile <span className="text-[#2e6da4]">Equestrian Store</span>
          </a>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                window.location.hash = "admin";
                setIsAdmin(true);
              }}
              className="text-xs text-slate-500"
            >
              Admin
            </button>
            <a
              href="#cart"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingBag className="h-4 w-4" /> Cart ({cartCount})
            </a>
          </div>
        </div>
      </header>
      <section className="border-b border-stone-200 bg-[#0f2e40] text-white">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Equestrian essentials, responsibly introduced
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold md:text-6xl">
            A governed Store, built for clear provenance and honest
            availability.
          </h1>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedQuery(query);
            }}
            className="mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white p-1"
          >
            <input
              aria-label="Search catalogue"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products or brands"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-slate-900 outline-none"
            />
            <button className="rounded-lg bg-[#2e6da4] px-5 text-sm font-semibold">
              <Search className="inline h-4 w-4" /> Search
            </button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={`rounded-full px-4 py-2 text-sm ${!category ? "bg-[#2e6da4] text-white" : "border bg-white"}`}
          >
            All products
          </button>
          {(categories.data ?? []).map((item: any) => (
            <button
              key={item.slug}
              onClick={() => setCategory(item.slug)}
              className={`rounded-full px-4 py-2 text-sm ${category === item.slug ? "bg-[#2e6da4] text-white" : "border bg-white"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="mt-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2e6da4]">
              Catalogue
            </p>
            <h2 className="mt-2 font-serif text-3xl">Available products</h2>
          </div>
          <p className="text-sm text-slate-500">
            Prices and stock are verified server-side.
          </p>
        </div>
        {catalogue.isLoading ? (
          <p className="py-16">Loading catalogue…</p>
        ) : catalogue.data?.length ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.data.map((product: any) => (
              <article
                key={product.id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex h-36 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-500">
                  Licensed imagery only
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#2e6da4]">
                  {product.brand ?? "Equestrian essential"}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{product.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {product.description}
                </p>
                <div className="mt-4 flex justify-between">
                  <span className="font-semibold">
                    {money(product.salePricePence ?? product.retailPricePence)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {product.availabilityStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSlug(product.slug)}
                  className="mt-5 w-full rounded-lg border border-[#2e6da4] px-4 py-2 text-sm font-medium text-[#2e6da4]"
                >
                  View product
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed bg-white p-10 text-center">
            <h3 className="font-serif text-2xl">
              No customer products are published yet.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
              Development and unapproved supplier records are deliberately
              excluded. Products appear after source facts, stock freshness,
              image rights and human approval are verified.
            </p>
          </div>
        )}
        <section
          id="cart"
          className="mt-14 rounded-2xl bg-white p-6 ring-1 ring-stone-200"
        >
          <h2 className="font-serif text-2xl">Your cart</h2>
          {cartItems.length ? (
            <div className="mt-4 space-y-3">
              {cartItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{item.productTitle}</p>
                    <p className="text-xs text-slate-500">
                      {item.variantTitle} · {item.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setQuantity.mutate({
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                      className="rounded border p-1"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      className="rounded border p-1"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className="ml-3 font-medium">
                      {money(item.unitPricePence * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span>Subtotal</span>
                <span className="font-semibold">{money(cartSubtotal)}</span>
              </div>
              <p className="text-xs text-slate-500">
                VAT, shipping and the final total are revalidated at checkout.
                No supplier delivery promise is shown until a configured profile
                exists.
              </p>
              <button
                disabled={checkout.isPending}
                onClick={() =>
                  checkout.mutate({ idempotencyKey: crypto.randomUUID() })
                }
                className="mt-3 rounded-lg bg-[#2e6da4] px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
              >
                {checkout.isPending ? "Preparing…" : "Prepare checkout"}
              </button>
              {checkoutNotice && (
                <p className="mt-3 text-sm text-amber-700">{checkoutNotice}</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Your cart is empty. Cart persistence is available for
              authenticated customers.
            </p>
          )}
        </section>
      </section>
      <footer className="mt-14 bg-[#0f2e40] text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3">
          <p className="flex gap-3 text-sm">
            <ShieldCheck className="h-5 w-5 shrink-0 text-sky-200" />
            No browser-supplied prices, payments, or stock decisions.
          </p>
          <p className="flex gap-3 text-sm">
            <Truck className="h-5 w-5 shrink-0 text-sky-200" />
            No delivery promises until a supplier confirms fulfilment data.
          </p>
          <p className="flex gap-3 text-sm">
            <Heart className="h-5 w-5 shrink-0 text-sky-200" />
            Academy education and commercial recommendations remain separate.
          </p>
        </div>
      </footer>
    </main>
  );
}
