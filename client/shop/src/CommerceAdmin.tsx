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
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  if (dashboard.error)
    return (
      <main className="min-h-screen bg-stone-50 p-6 text-slate-900">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Store
        </button>
        <section className="mx-auto mt-12 max-w-xl rounded-2xl border bg-white p-8">
          <ShieldCheck className="h-8 w-8 text-[#2e6da4]" />
          <h1 className="mt-4 font-serif text-3xl">
            Commerce administration is restricted
          </h1>
          <p className="mt-3 text-slate-600">{dashboard.error.message}</p>
        </section>
      </main>
    );
  const metric = dashboard.data as any;
  return (
    <main className="min-h-screen bg-stone-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Store
        </button>
        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#2e6da4]">
          Governed operations
        </p>
        <h1 className="mt-2 font-serif text-4xl">Commerce Admin</h1>
        {dashboard.isLoading ? (
          <p className="mt-8">Loading real Commerce records…</p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                <p className="text-sm text-slate-500">Paid revenue</p>
                <p className="mt-2 text-2xl font-semibold">
                  £
                  {(Number(metric?.realisedRevenuePence ?? 0) / 100).toFixed(2)}
                </p>
              </article>
              <article className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                <p className="text-sm text-slate-500">Orders</p>
                <p className="mt-2 text-2xl font-semibold">
                  {metric?.orderCount ?? 0}
                </p>
              </article>
              <article className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                <p className="text-sm text-slate-500">Pending orders</p>
                <p className="mt-2 text-2xl font-semibold">
                  {metric?.pendingOrderCount ?? 0}
                </p>
              </article>
            </div>
            <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
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
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2e6da4] px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
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
                  className="ml-3 mt-5 rounded-lg border border-[#2e6da4] px-4 py-2 text-sm font-semibold text-[#2e6da4] disabled:opacity-50"
                >
                  {proposal.isPending
                    ? "Preparing proposal…"
                    : "Generate governed proposal"}
                </button>
              )}
              {notice && (
                <p className="mt-3 text-sm text-emerald-700">{notice}</p>
              )}
              {proposal.data && (
                <div className="mt-4 rounded-lg bg-stone-50 p-4 text-sm">
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
