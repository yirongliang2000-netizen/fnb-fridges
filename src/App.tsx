import React, { useMemo, useState } from "react";

// ---------- Simple, clean, TypeScript‑friendly catalog ----------
// Uses neutral SVG placeholders (no random photos)
// Paste this entire file into src/App.tsx

// SVG placeholder image (keeps layout tidy without external photos)
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#f3f4f6'/>
        <stop offset='100%' stop-color='#e5e7eb'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='28' fill='#6b7280'>Product Photo</text>
  </svg>`);

// Inventory
export type Item = {
  id: string;
  name: string;
  brand: string;
  type: "Chiller" | "Freezer" | "Undercounter";
  condition: "Like New" | "Refurbished" | "Used";
  height_cm: number;
  width_cm: number;
  capacity_l: number;
  price: number;
  location: string;
  image?: string;
  addedAt: string; // ISO date
};

const INVENTORY: Item[] = [
  {
    id: "HOS-A23",
    name: "Hoshizaki Upright Freezer A23",
    brand: "Hoshizaki",
    type: "Freezer",
    condition: "Refurbished",
    height_cm: 210,
    width_cm: 70,
    capacity_l: 800,
    price: 1880,
    location: "Punggol",
    image: PLACEHOLDER,
    addedAt: "2025-09-20",
  },
  {
    id: "LASS-2D",
    name: "Lassele 2-Door Chiller",
    brand: "Lassele",
    type: "Chiller",
    condition: "Like New",
    height_cm: 200,
    width_cm: 120,
    capacity_l: 1100,
    price: 2250,
    location: "Jurong West",
    image: PLACEHOLDER,
    addedAt: "2025-09-28",
  },
  {
    id: "EURO-CH-600",
    name: "Euro Chill 600L Undercounter",
    brand: "Euro Chill",
    type: "Undercounter",
    condition: "Used",
    height_cm: 85,
    width_cm: 150,
    capacity_l: 600,
    price: 790,
    location: "Tampines",
    image: PLACEHOLDER,
    addedAt: "2025-10-01",
  },
  {
    id: "BERJ-1D",
    name: "BERJAYA Single Door Chiller",
    brand: "BERJAYA",
    type: "Chiller",
    condition: "Refurbished",
    height_cm: 205,
    width_cm: 68,
    capacity_l: 500,
    price: 1290,
    location: "Woodlands",
    image: PLACEHOLDER,
    addedAt: "2025-09-10",
  },
  {
    id: "PAN-SS-2D",
    name: "Panasonic Stainless 2D Chiller",
    brand: "Panasonic",
    type: "Chiller",
    condition: "Used",
    height_cm: 198,
    width_cm: 110,
    capacity_l: 900,
    price: 1550,
    location: "Ang Mo Kio",
    image: PLACEHOLDER,
    addedAt: "2025-08-15",
  },
  {
    id: "QSON-UC-300",
    name: "Qson 300L Undercounter",
    brand: "Qson",
    type: "Undercounter",
    condition: "Like New",
    height_cm: 86,
    width_cm: 90,
    capacity_l: 300,
    price: 620,
    location: "Bukit Batok",
    image: PLACEHOLDER,
    addedAt: "2025-09-30",
  },
];

const BRANDS = Array.from(new Set(INVENTORY.map(i => i.brand))).sort();
const CONDITIONS = ["Like New", "Refurbished", "Used"] as const;
const TYPES = ["Chiller", "Freezer", "Undercounter"] as const;

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
] as const;

// Filters
type Filters = {
  query: string;
  brands: string[];
  conditions: typeof CONDITIONS[number][];
  types: typeof TYPES[number][];
  priceMin?: number;
  priceMax?: number;
  sort: typeof SORTS[number]["key"];
};

const initialFilters: Filters = {
  query: "",
  brands: [],
  conditions: [],
  types: [],
  sort: "newest",
};

// UI helpers
function classNames(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={classNames(
      "rounded-full border px-3 py-1.5 text-sm transition",
      active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
    )}>{label}</button>
  );
}

function FieldNumber({ value, placeholder, onChange }: { value?: number; placeholder: string; onChange: (v?: number) => void }) {
  return (
    <input
      type="number"
      className="w-28 rounded-lg border bg-white px-3 py-2 text-sm"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
    />
  );
}

// ---------- App ----------
export default function App() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [enquiry, setEnquiry] = useState<string[]>([]);
  const [openCart, setOpenCart] = useState(false);

  const filtered = useMemo(() => {
    let items = [...INVENTORY];

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        String(i.capacity_l).includes(q)
      );
    }
    if (filters.brands.length) items = items.filter(i => filters.brands.includes(i.brand));
    if (filters.conditions.length) items = items.filter(i => filters.conditions.includes(i.condition));
    if (filters.types.length) items = items.filter(i => filters.types.includes(i.type));

    if (filters.priceMin !== undefined) items = items.filter(i => i.price >= (filters.priceMin as number));
    if (filters.priceMax !== undefined) items = items.filter(i => i.price <= (filters.priceMax as number));

    switch (filters.sort) {
      case "price_asc": items.sort((a, b) => a.price - b.price); break;
      case "price_desc": items.sort((a, b) => b.price - a.price); break;
      default: items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }

    return items;
  }, [filters]);

  const selectedItems = INVENTORY.filter(i => enquiry.includes(i.id));

  function resetFilters() { setFilters(initialFilters); }

  function buildMailto() {
    const subject = encodeURIComponent("F&B Fridge Enquiry");
    const lines = selectedItems.map(i => `• ${i.id} — ${i.name} (${i.brand}) S$${i.price}`);
    const body = encodeURIComponent(
      `Hello,

I'm interested in the following items:
${lines.join("
")}

Company/Restaurant: 
Contact: 
Preferred delivery date: 
Location: 

Thanks!`
    );
    return `mailto:sales@yourdomain.sg?subject=${subject}&body=${body}`;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_60%_at_10%_0%,#f8fafc,transparent),radial-gradient(50%_50%_at_90%_10%,#f0fdf4,transparent)] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-sm font-bold text-white">KB</div>
            <div>
              <div className="text-lg font-bold leading-tight">KitchenBazaar</div>
              <div className="-mt-0.5 text-xs text-gray-500">Refurbished Chillers • Freezers • Undercounters</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <input
              placeholder="Search brand, model, capacity, location…"
              className="w-[420px] rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={filters.query}
              onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
            />
            <button onClick={() => setOpenCart(!openCart)} className="rounded-xl border px-4 py-2.5 text-sm hover:bg-gray-50">Enquiry ({enquiry.length})</button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setOpenCart(!openCart)} className="rounded-xl border px-3 py-2 text-sm">Enquiry ({enquiry.length})</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto my-6 max-w-6xl rounded-3xl border bg-white/80 p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-600">New stock weekly • Warranty available</div>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">Refurbished Commercial Refrigeration</h1>
            <p className="mt-2 text-gray-600">Save 30–60% vs retail. QC‑tested units with delivery, disposal & trade‑in.</p>
            <div className="mt-4 flex justify-center gap-2 md:justify-start">
              <a href="#catalog" className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Browse Catalog</a>
              <a href="https://wa.me/6580000000" className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-white">WhatsApp Us</a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white">
              <img alt="Product preview" className="h-full w-full object-cover" src={PLACEHOLDER} />
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <main id="catalog" className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-10 md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="md:sticky md:top-[84px] md:h-[calc(100vh-100px)] md:overflow-y-auto">
          <section className="rounded-2xl border bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Filters</h2>
              <button onClick={resetFilters} className="text-sm underline underline-offset-4">Reset</button>
            </div>

            <div className="mt-4 space-y-6">
              <div>
                <div className="mb-2 text-sm font-medium">Type</div>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <Chip key={t} label={t} active={filters.types.includes(t)} onClick={() => setFilters(f => ({ ...f, types: f.types.includes(t) ? f.types.filter(x => x !== t) : [...f.types, t] }))} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Brand</div>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map(b => (
                    <Chip key={b} label={b} active={filters.brands.includes(b)} onClick={() => setFilters(f => ({ ...f, brands: f.brands.includes(b) ? f.brands.filter(x => x !== b) : [...f.brands, b] }))} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Condition</div>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(c => (
                    <Chip key={c} label={c} active={filters.conditions.includes(c)} onClick={() => setFilters(f => ({ ...f, conditions: f.conditions.includes(c) ? f.conditions.filter(x => x !== c) : [...f.conditions, c] }))} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Price (S$)</div>
                <div className="flex items-center gap-2">
                  <FieldNumber value={filters.priceMin} placeholder="Min" onChange={(v) => setFilters(f => ({ ...f, priceMin: v }))} />
                  <span className="text-gray-500">to</span>
                  <FieldNumber value={filters.priceMax} placeholder="Max" onChange={(v) => setFilters(f => ({ ...f, priceMax: v }))} />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Sort</div>
                <select
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  value={filters.sort}
                  onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value as Filters["sort"] }))}
                >
                  {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border bg-white/80 p-4 text-sm text-gray-700 shadow-sm">
            <h3 className="text-base font-semibold">Why Buy Refurbished?</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Save 30–60% vs retail pricing.</li>
              <li>Lower environmental footprint by extending product life.</li>
              <li>QC‑tested units with warranty options available.</li>
            </ul>
          </section>
        </aside>

        {/* Products */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing <strong>{filtered.length}</strong> of {INVENTORY.length} items</div>
            <div className="hidden items-center gap-2 text-sm md:flex">
              {filters.types.map(t => <span key={t} className="rounded-full border bg-white px-2 py-0.5">{t}</span>)}
              {filters.brands.map(b => <span key={b} className="rounded-full border bg-white px-2 py-0.5">{b}</span>)}
              {filters.conditions.map(c => <span key={c} className="rounded-full border bg-white px-2 py-0.5">{c}</span>)}
              {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
                <span className="rounded-full border bg-white px-2 py-0.5">S${filters.priceMin ?? "~"}–{filters.priceMax ?? "~"}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => (
              <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
                <div className="relative aspect-[4/3] w-full">
                  <img src={item.image || PLACEHOLDER} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">{item.brand}</div>
                      <h3 className="text-base font-semibold leading-snug">{item.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="rounded-full border bg-white px-2 py-0.5">{item.type}</span>
                        <span className="rounded-full border bg-white px-2 py-0.5">{item.condition}</span>
                        <span className="rounded-full border bg-white px-2 py-0.5">{item.capacity_l}L</span>
                        <span className="rounded-full border bg-white px-2 py-0.5">{item.height_cm}cm</span>
                        <span className="rounded-full border bg-white px-2 py-0.5">{item.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">S${item.price.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">ID: {item.id}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEnquiry(prev => prev.includes(item.id) ? prev : [...prev, item.id]); setOpenCart(true); }}
                    className="mt-4 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                  >Add to Enquiry</button>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-600">No items match your filters. Try clearing them.</div>
          )}
        </section>
      </main>

      {/* Enquiry Drawer */}
      <div className={classNames(
        "fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l bg-white shadow-xl transition-transform",
        openCart ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">Your Enquiry ({enquiry.length})</h3>
          <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100" onClick={() => setOpenCart(false)}>Close</button>
        </div>
        <div className="h-[calc(100vh-56px-88px)] overflow-y-auto p-4 space-y-3">
          {selectedItems.length === 0 && (
            <div className="text-sm text-gray-600">No items yet. Add products from the list.</div>
          )}
          {selectedItems.map(i => (
            <div key={i.id} className="flex gap-3 rounded-xl border p-3">
              <img src={i.image || PLACEHOLDER} alt={i.name} className="h-16 w-20 rounded object-cover" />
              <div className="flex-1">
                <div className="text-sm font-medium leading-tight">{i.name}</div>
                <div className="text-xs text-gray-500">{i.brand} • {i.capacity_l}L • {i.height_cm}cm</div>
                <div className="mt-0.5 text-sm font-semibold">S${i.price.toLocaleString()}</div>
              </div>
              <button onClick={() => setEnquiry(prev => prev.filter(x => x !== i.id))} className="h-8 shrink-0 rounded-lg border px-2 text-xs hover:bg-gray-100">Remove</button>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <a href={buildMailto()} className={classNames(
            "block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold",
            selectedItems.length ? "bg-black text-white" : "pointer-events-none bg-gray-200 text-gray-600"
          )}>Send Enquiry Email</a>
          <div className="mt-2 text-xs text-gray-500">Tip: replace <span className="font-mono">sales@yourdomain.sg</span> with your real email.</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/70 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <div className="text-lg font-bold">KitchenBazaar</div>
            <div className="mt-1 text-sm text-gray-600">Buy & sell refurbished commercial refrigeration in Singapore.</div>
          </div>
          <div>
            <div className="text-sm font-semibold">Contact</div>
            <div className="mt-1 text-sm text-gray-600">WhatsApp: +65 8XXX XXXX</div>
            <div className="text-sm text-gray-600">Email: sales@yourdomain.sg</div>
            <div className="text-sm text-gray-600">Warehouse: 316D Punggol Way, #17‑681, 824316</div>
          </div>
          <div>
            <div className="text-sm font-semibold">Logistics</div>
            <ul className="mt-1 space-y-1 text-sm text-gray-600">
              <li>Islandwide delivery available</li>
              <li>Trade‑in & disposal on request</li>
              <li>3–6 months limited warranty options</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
