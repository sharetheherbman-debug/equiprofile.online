import { useState } from "react";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CommerceAdmin({ onBack }: { onBack: () => void }) {
  const dashboard = trpc.commerce.admin.dashboard.useQuery(undefined, {
    retry: false,
  });
  const synthetic = trpc.commerce.admin.createSyntheticCandidate.useMutation({
    onSuccess: () => dashboard.refetch(),
  });
  const proposal = trpc.commerce.admin.proposeProduct.useMutation();
  const products = trpc.commerce.admin.products.useQuery(undefined, {
    retry: false,
  });
  const suppliers = trpc.commerce.admin.suppliers.useQuery(undefined, {
    retry: false,
  });
  const orders = trpc.commerce.admin.orders.useQuery(undefined, {
    retry: false,
  });
  const returns = trpc.commerce.admin.returns.useQuery(undefined, {
    retry: false,
  });
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  if (dashboard.error)
    return (
      <main className="min-h-screen bg-[#f7f5f0] p-6 text-[#0f1d2e]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Store
        </button>
        <section className="mx-auto mt-12 max-w-xl rounded-2xl border bg-white p-8">
          <ShieldCheck className="h-8 w-8 text-[#c5a55a]" />
          <h1 className="mt-4 font-serif text-3xl">
            Commerce administration is restricted
          </h1>
          <p className="mt-3 text-slate-600">{dashboard.error.message}</p>
        </section>
      </main>
    );
  const metric = dashboard.data as any;
  return (
    <main className="min-h-screen bg-[#f7f5f0] p-6 text-[#0f1d2e]">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Store
        </button>
        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#c5a55a]">
          Governed operations
        </p>
        <h1 className="mt-2 font-serif text-4xl">Commerce Admin</h1>
        {dashboard.isLoading ? (
          <p className="mt-8">Loading real Commerce records…</p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8d08a]/35">
                <p className="text-sm text-slate-500">Paid revenue</p>
                <p className="mt-2 text-2xl font-semibold">
                  £
                  {(Number(metric?.realisedRevenuePence ?? 0) / 100).toFixed(2)}
                </p>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8d08a]/35">
                <p className="text-sm text-slate-500">Orders</p>
                <p className="mt-2 text-2xl font-semibold">
                  {metric?.orderCount ?? 0}
                </p>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8d08a]/35">
                <p className="text-sm text-slate-500">Pending orders</p>
                <p className="mt-2 text-2xl font-semibold">
                  {metric?.pendingOrderCount ?? 0}
                </p>
              </article>
            </div>
            <section className="mt-8 grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8d08a]/35">
                <h2 className="font-serif text-xl">Products and approvals</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Public visibility still requires a recorded approval and
                  rights review.
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {(products.data ?? []).slice(0, 6).map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 border-b border-[#e8d08a]/20 pb-2"
                    >
                      <span className="min-w-0 truncate font-medium">
                        {product.title}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {product.status} ·{" "}
                        {product.approvalStatus ?? "no approval"}
                      </span>
                    </div>
                  ))}
                  {!products.isLoading &&
                    (products.data ?? []).length === 0 && (
                      <p className="text-slate-500">
                        No persisted Commerce products.
                      </p>
                    )}
                </div>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8d08a]/35">
                <h2 className="font-serif text-xl">Supplier readiness</h2>
                <p className="mt-1 text-xs text-slate-500">
                  No supplier becomes sellable from this screen.
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {(suppliers.data ?? []).slice(0, 6).map((supplier: any) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between gap-3 border-b border-[#e8d08a]/20 pb-2"
                    >
                      <span className="min-w-0 truncate font-medium">
                        {supplier.name}
                      </span>
                      <span className="shrink-0 text-right text-xs text-slate-500">
                        <span className="block">
                          {supplier.status} · rights{" "}
                          {supplier.imageRightsStatus}
                        </span>
                        <span className="block">
                          onboarding{" "}
                          {supplier.onboardingStatus ?? "not_started"}
                        </span>
                      </span>
                    </div>
                  ))}
                  {!suppliers.isLoading &&
                    (suppliers.data ?? []).length === 0 && (
                      <p className="text-slate-500">No configured suppliers.</p>
                    )}
                </div>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8d08a]/35">
                <h2 className="font-serif text-xl">Orders</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {(orders.data ?? []).slice(0, 6).map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 border-b border-[#e8d08a]/20 pb-2"
                    >
                      <span className="font-medium">{order.orderNumber}</span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {order.status} · {order.storePaymentStatus}
                      </span>
                    </div>
                  ))}
                  {!orders.isLoading && (orders.data ?? []).length === 0 && (
                    <p className="text-slate-500">No Store orders.</p>
                  )}
                </div>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8d08a]/35">
                <h2 className="font-serif text-xl">Returns</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {(returns.data ?? []).slice(0, 6).map((request: any) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between gap-3 border-b border-[#e8d08a]/20 pb-2"
                    >
                      <span className="font-medium">{request.orderNumber}</span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {request.status}
                      </span>
                    </div>
                  ))}
                  {!returns.isLoading && (returns.data ?? []).length === 0 && (
                    <p className="text-slate-500">No return requests.</p>
                  )}
                </div>
              </article>
            </section>
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#e8d08a]/35">
              <h2 className="font-serif text-2xl">AI Product Manager queue</h2>
              <p className="mt-2 text-sm text-slate-600">
                Supplier state:{" "}
                <strong>{metric?.supplierMode ?? "NOT CONFIGURED"}</strong>.
                Candidates remain non-public until a human approval and verified
                supplier configuration exist.
              </p>
              <button
                disabled={synthetic.isPending}
                onClick={() =>
                  synthetic.mutate(undefined, {
                    onSuccess: (result) => {
                      setCandidateId(result.productId);
                      setNotice(
                        `Created development candidate #${result.productId}; it is excluded from the public catalogue.`,
                      );
                    },
                  })
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#c5a55a] px-4 py-2 text-sm font-semibold text-[#0f1d2e] shadow-lg shadow-[#c5a55a]/25 disabled:bg-slate-300"
              >
                <Database className="h-4 w-4" />{" "}
                {synthetic.isPending
                  ? "Creating…"
                  : "Create synthetic development candidate"}
              </button>
              {candidateId && (
                <button
                  disabled={proposal.isPending}
                  onClick={() => proposal.mutate({ productId: candidateId })}
                  className="ml-3 mt-5 rounded-lg border border-[#c5a55a] px-4 py-2 text-sm font-semibold text-[#c5a55a] disabled:opacity-50"
                >
                  {proposal.isPending
                    ? "Preparing proposal…"
                    : "Generate governed proposal"}
                </button>
              )}
              {notice && (
                <p className="mt-3 text-sm text-[#8a6a25]">{notice}</p>
              )}
              {proposal.data && (
                <div className="mt-4 rounded-lg bg-[#f7f5f0] p-4 text-sm">
                  <p>
                    <strong>Score:</strong> {proposal.data.score.total}/100
                  </p>
                  <p>
                    <strong>Duplicate risk:</strong>{" "}
                    {proposal.data.duplicate
                      ? "review required"
                      : "none detected"}
                  </p>
                  <p>
                    <strong>Human approval:</strong> required before publication
                  </p>
                  <p>
                    <strong>AI enrichment:</strong>{" "}
                    {proposal.data.enrichment.status}
                  </p>
                </div>
              )}
              {proposal.error && (
                <p className="mt-3 text-sm text-rose-700">
                  {proposal.error.message}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
