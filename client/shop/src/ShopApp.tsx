import { useMemo, useState } from "react";
import { Search, ShoppingBag, ShieldCheck, Truck, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";

const money = (pence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);

export default function ShopApp() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const catalogue = trpc.commerce.catalogue.useQuery({ query: submittedQuery, category });
  const categories = trpc.commerce.categories.useQuery();
  const cart = trpc.commerce.cart.get.useQuery(undefined, { retry: false });
  const add = trpc.commerce.cart.add.useMutation({ onSuccess: () => cart.refetch() });
  const cartCount = useMemo(() => (cart.data ?? []).reduce((total, item: any) => total + item.quantity, 0), [cart.data]);

  return <main className="min-h-screen bg-stone-50 text-slate-900">
    <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
        <a href="/" className="font-serif text-xl font-semibold tracking-tight">EquiProfile <span className="text-[#2e6da4]">Equestrian Store</span></a>
        <a href="#cart" className="flex items-center gap-2 text-sm font-medium" aria-label="View cart"><ShoppingBag className="h-4 w-4" /> Cart ({cartCount})</a>
      </div>
    </header>
    <section className="border-b border-stone-200 bg-[#0f2e40] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Equestrian essentials, responsibly introduced</p>
        <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight md:text-6xl">A trusted Store foundation, built for clear provenance and honest availability.</h1>
        <p className="mt-5 max-w-2xl text-slate-200">Products appear only after supplier, product data, image rights, stock freshness and human approval requirements have been satisfied.</p>
        <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query); }} className="mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white p-1 shadow-lg">
          <label className="sr-only" htmlFor="catalogue-search">Search the Store catalogue</label>
          <input id="catalogue-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and categories" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-slate-900 outline-none" />
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#2e6da4] px-5 py-3 text-sm font-semibold hover:bg-[#245a8a]"><Search className="h-4 w-4" /> Search</button>
        </form>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap gap-2" aria-label="Store categories">
        <button onClick={() => setCategory(undefined)} className={`rounded-full px-4 py-2 text-sm ${!category ? "bg-[#2e6da4] text-white" : "bg-white border border-stone-200"}`}>All products</button>
        {(categories.data ?? []).map((item: any) => <button key={item.slug} onClick={() => setCategory(item.slug)} className={`rounded-full px-4 py-2 text-sm ${category === item.slug ? "bg-[#2e6da4] text-white" : "bg-white border border-stone-200"}`}>{item.name}</button>)}
      </div>
      <div className="mt-10 flex items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#2e6da4]">Catalogue</p><h2 className="mt-2 font-serif text-3xl">Available products</h2></div><p className="text-sm text-slate-500">Prices, availability and VAT are validated server-side.</p></div>
      {catalogue.isLoading ? <p className="py-16 text-slate-500">Loading catalogue…</p> : catalogue.data?.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {catalogue.data.map((product: any) => <article key={product.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex h-40 items-center justify-center rounded-xl bg-stone-100 text-sm text-stone-500">Approved imagery will appear when licensed</div><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#2e6da4]">{product.brand ?? "Equestrian essential"}</p><h3 className="mt-1 text-lg font-semibold">{product.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p><div className="mt-5 flex items-center justify-between"><span className="font-semibold">{money(product.salePricePence ?? product.retailPricePence)}</span><span className="text-xs text-slate-500">{product.availabilityStatus.replace(/_/g, " ")}</span></div><button disabled className="mt-5 w-full rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-400" title="Select an approved product variant before adding to cart">Variant selection required</button></article>)}
      </div> : <div className="mt-7 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center"><h3 className="font-serif text-2xl">No customer products are published yet.</h3><p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">The Store is intentionally not showing development or unapproved supplier products. Catalogue publication will follow signed supplier agreements, verified source facts and image rights.</p></div>}
      <section id="cart" className="mt-14 rounded-2xl bg-white p-6 ring-1 ring-stone-200"><h2 className="font-serif text-2xl">Your cart</h2>{cart.data?.length ? <p className="mt-3 text-sm text-slate-600">{cartCount} saved item{cartCount === 1 ? "" : "s"}. Checkout remains unavailable until a verified Store payment configuration is enabled.</p> : <p className="mt-3 text-sm text-slate-600">Your cart is empty. Cart persistence is available for authenticated customers.</p>}<button disabled className="mt-5 rounded-lg bg-slate-200 px-4 py-2 text-sm text-slate-500">Checkout unavailable — payment activation required</button></section>
    </section>
    <footer className="mt-14 bg-[#0f2e40] text-slate-200"><div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3"><p className="flex gap-3 text-sm"><ShieldCheck className="h-5 w-5 shrink-0 text-sky-200" />No browser-supplied prices, payments, or stock decisions.</p><p className="flex gap-3 text-sm"><Truck className="h-5 w-5 shrink-0 text-sky-200" />No delivery promises until a supplier confirms fulfilment data.</p><p className="flex gap-3 text-sm"><Heart className="h-5 w-5 shrink-0 text-sky-200" />Academy education and commercial recommendations remain separate.</p></div></footer>
  </main>;
}
