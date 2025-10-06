import React, { useMemo, useState } from "react";

// --- Sample inventory (replace with your real data or connect to a backend) ---
const INVENTORY = [
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
    images: [
      // Stainless/industrial-looking images to avoid random landscape photos
      "https://images.unsplash.com/photo-1586201375761-83865001e31b?q=80&w=1200&auto=format&fit=crop"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1590540179852-211a6a4c5c88?q=80&w=1200&auto=format&fit=crop"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1568454537842-d933259bb258?q=80&w=1200&auto=format&fit=crop"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1200&auto=format&fit=crop"
    ],
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
    images: [
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop"
    ],
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
  { key: "height_asc", label: "Height: Low to High" },
  { key: "height_desc", label: "Height: High to Low" },
] as const;

type Condition = typeof CONDITIONS[number];

type Filters = {
  query: string;
  brands: string[];
  conditions: Condition[];
  types: string[];
  heightMin?: number;
  heightMax?: number;
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

function classNames(...xs: (string|false|undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function Badge({children}:{children: React.ReactNode}){
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shadow-sm bg-white/70 backdrop-blur">
    {children}
  </span>;
}

function Card({children}:{children: React.ReactNode}){
  return <div className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur">
    {children}
  </div>;
}

function CardMedia({src, alt}:{src:string; alt:string}){
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function CardContent({children}:{children: React.ReactNode}){
  return <div className="p-4">{children}</div>;
}

function ToggleChip({label, checked, onChange}:{label:string; checked:boolean; onChange:(v:boolean)=>void}){
  return (
    <button
      onClick={() => onChange(!checked)}
      className={classNames(
        "px-3 py-1.5 rounded-full border text-sm transition-colors",
        checked ? "bg-black text-white border-black" : "bg-white/80 hover:bg-white"
      )}
    >{label}</button>
  );
}

function Range({label, min, max, valueMin, valueMax, onChange}:{
  label: string;
  min: number;
  max: number;
  valueMin?: number;
  valueMax?: number;
  onChange: (v:{min?:number; max?:number})=>void;
}){
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={`${min}`}
          className="w-24 rounded-lg border px-3 py-2 text-sm bg-white/80"
          value={valueMin ?? ""}
          min={min}
          max={max}
          onChange={(e)=>onChange({min: e.target.value === "" ? undefined : Number(e.target.value)})}
        />
        <span className="text-gray-500">to</span>
        <input
          type="number"
          placeholder={`${max}`}
          className="w-24 rounded-lg border px-3 py-2 text-sm bg-white/80"
          value={valueMax ?? ""}
          min={min}
          max={max}
          onChange={(e)=>onChange({max: e.target.value === "" ? undefined : Number(e.target.value)})}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">Min / Max</div>
    </div>
  );
}

function Hero(){
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-white/60 p-8 shadow-sm">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_20%_20%,rgba(16,185,129,0.08),transparent),radial-gradient(50%_50%_at_80%_0%,rgba(59,130,246,0.08),transparent)]"/>
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs font-medium text-gray-600">New stock weekly • Warranty options</div>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">Refurbished Commercial Chillers & Freezers</h1>
          <p className="mt-2 text-gray-600">Save 30–60% vs retail. QC-tested units with delivery, disposal & trade-in available.</p>
          <div className="mt-4 flex gap-2">
            <a href="#catalog" className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Browse Catalog</a>
            <a href="https://wa.me/6580000000" className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-white">WhatsApp Us</a>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white">
            <img alt="Refurbished chiller" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1568454537842-d933259bb258?q=80&w=1200&auto=format&fit=crop"/>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App(){
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [enquiry, setEnquiry] = useState<string[]>([]);
  const [openCart, setOpenCart] = useState(false);

  const filtered = useMemo(()=>{
    let items = [...INVENTORY];

    if(filters.query.trim()){
      const q = filters.query.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        String(i.capacity_l).includes(q)
      );
    }

    if(filters.brands.length){ items = items.filter(i => filters.brands.includes(i.brand)); }
    if(filters.conditions.length){ items = items.filter(i => filters.conditions.includes(i.condition as Condition)); }
    if(filters.types.length){ items = items.filter(i => filters.types.includes(i.type)); }

    if(filters.heightMin !== undefined){ items = items.filter(i => i.height_cm >= (filters.heightMin as number)); }
    if(filters.heightMax !== undefined){ items = items.filter(i => i.height_cm <= (filters.heightMax as number)); }
    if(filters.priceMin !== undefined){ items = items.filter(i => i.price >= (filters.priceMin as number)); }
    if(filters.priceMax !== undefined){ items = items.filter(i => i.price <= (filters.priceMax as number)); }

    switch(filters.sort){
      case "newest": items.sort((a,b)=> new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()); break;
      case "price_asc": items.sort((a,b)=> a.price - b.price); break;
      case "price_desc": items.sort((a,b)=> b.price - a.price); break;
      case "height_asc": items.sort((a,b)=> a.height_cm - b.height_cm); break;
      case "height_desc": items.sort((a,b)=> b.height_cm - a.height_cm); break;
    }
    return items;
  }, [filters]);

  const selectedItems = INVENTORY.filter(i => enquiry.includes(i.id));

  function toggleBrand(brand:string){
    setFilters(f => ({...f, brands: f.brands.includes(brand) ? f.brands.filter(b=>b!==brand) : [...f.brands, brand]}));
  }
  function toggleCondition(cond:Condition){
    setFilters(f => ({...f, conditions: f.conditions.includes(cond) ? f.conditions.filter(c=>c!==cond) : [...f.conditions, cond]}));
  }
  function toggleType(t:string){
    setFilters(f => ({...f, types: f.types.includes(t) ? f.types.filter(x=>x!==t) : [...f.types, t]}));
  }

  function resetFilters(){ setFilters(initialFilters); }
  function addToEnquiry(id:string){ setEnquiry(prev => prev.includes(id) ? prev : [...prev, id]); setOpenCart(true); }
  function removeFromEnquiry(id:string){ setEnquiry(prev => prev.filter(x=>x!==id)); }

  function buildMailto(){
    const subject = encodeURIComponent("F&B Fridge Enquiry");
    const lines = selectedItems.map(i => `• ${i.id} — ${i.name} (${i.brand}) S$${i.price}`);
    const body = encodeURIComponent(`Hello,

I'm interested in the following items:
${lines.join("
")}

Company/Restaurant: 
Contact: 
Preferred delivery date: 
Location: 

Thanks!`);
   return `mailto:sales@yourdomain.sg?subject=${subject}&body=${body}`;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_60%_at_10%_0%,#f0f7ff,transparent),radial-gradient(40%_40%_at_90%_20%,#f4fff5,transparent)]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center text-sm font-bold">KB</div>
            <div>
              <div className="text-lg font-bold leading-tight">KitchenBazaar</div>
              <div className="text-xs text-gray-500 -mt-0.5">Refurbished Chillers • Freezers • Undercounters</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <input
              placeholder="Search brand, model, capacity, location…"
              className="w-[420px] rounded-xl border bg-white/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={filters.query}
              onChange={(e)=>setFilters(f=>({...f, query: e.target.value}))}
            />
            <button onClick={()=>setOpenCart(!openCart)} className="rounded-xl border bg-white/80 px-4 py-2.5 text-sm hover:bg-white">Enquiry ({enquiry.length})</button>
          </div>
          <div className="md:hidden">
            <button onClick={()=>setOpenCart(!openCart)} className="rounded-xl border bg-white/80 px-3 py-2 text-sm">Enquiry ({enquiry.length})</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <Hero />

        {/* Quick category chips */}
        <div className="flex flex-wrap items-center gap-2">
          {TYPES.map(t => (
            <ToggleChip key={t} label={t} checked={filters.types.includes(t)} onChange={()=>toggleType(t)} />
          ))}
          <div className="ml-auto hidden md:block">
            <select
              className="rounded-lg border bg-white/80 px-3 py-2 text-sm"
              value={filters.sort}
              onChange={(e)=>setFilters(f=>({...f, sort: e.target.value as Filters["sort"]}))}
            >
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div id="catalog" className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
          {/* Sidebar Filters */}
          <aside className="md:sticky md:top-[84px] md:h-[calc(100vh-100px)] md:overflow-y-auto">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Filters</h2>
                  <button onClick={resetFilters} className="text-sm underline underline-offset-4">Reset</button>
                </div>

                <div className="mt-5 space-y-6">
                  <div>
                    <div className="mb-2 text-sm font-medium">Brand</div>
                    <div className="flex flex-wrap gap-2">
                      {BRANDS.map(b => (
                        <ToggleChip key={b} label={b} checked={filters.brands.includes(b)} onChange={()=>toggleBrand(b)} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-medium">Condition</div>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.map(c => (
                        <ToggleChip key={c} label={c} checked={filters.conditions.includes(c)} onChange={()=>toggleCondition(c)} />
                      ))}
                    </div>
                  </div>

                  <Range
                    label="Height (cm)"
                    min={70}
                    max={220}
                    valueMin={filters.heightMin}
                    valueMax={filters.heightMax}
                    onChange={(v)=>setFilters(f=>({...f, heightMin: v.min ?? f.heightMin, heightMax: v.max ?? f.heightMax}))}
                  />

                  <Range
                    label="Price (S$)"
                    min={200}
                    max={5000}
                    valueMin={filters.priceMin}
                    valueMax={filters.priceMax}
                    onChange={(v)=>setFilters(f=>({...f, priceMin: v.min ?? f.priceMin, priceMax: v.max ?? f.priceMax}))}
                  />

                  <div className="md:hidden">
                    <div className="mb-2 text-sm font-medium">Sort</div>
                    <select
                      className="w-full rounded-lg border bg-white/80 px-3 py-2 text-sm"
                      value={filters.sort}
                      onChange={(e)=>setFilters(f=>({...f, sort: e.target.value as Filters["sort"]}))}
                    >
                      {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-base font-semibold">Why Buy Refurbished?</h3>
                <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Save 30–60% vs new retail pricing.</li>
                  <li>Environmental benefits with extended product life.</li>
                  <li>Each unit QC-tested; warranty options available.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>

          {/* Products */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Showing <strong>{filtered.length}</strong> of {INVENTORY.length} items</div>
              <div className="hidden md:flex items-center gap-2 text-sm">
                {filters.types.map(t => <Badge key={t}>{t}</Badge>)}
                {filters.brands.map(b => <Badge key={b}>{b}</Badge>)}
                {filters.conditions.map(c => <Badge key={c}>{c}</Badge>)}
                {(filters.heightMin !== undefined || filters.heightMax !== undefined) && (
                  <Badge>H: {filters.heightMin ?? "~"}–{filters.heightMax ?? "~"} cm</Badge>
                )}
                {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
                  <Badge>S${filters.priceMin ?? "~"}–{filters.priceMax ?? "~"}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(item => (
                <Card key={item.id}>
                  <CardMedia src={item.images[0]} alt={item.name} />
                  <CardContent>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-500">{item.brand}</div>
                        <h3 className="text-base font-semibold leading-snug">{item.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <Badge>{item.type}</Badge>
                          <Badge>{item.condition}</Badge>
                          <Badge>{item.capacity_l}L</Badge>
                          <Badge>{item.height_cm}cm</Badge>
                          <Badge>{item.location}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">S${item.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">ID: {item.id}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                        onClick={()=>addToEnquiry(item.id)}
                      >Add to Enquiry</button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-600">
                No items match your filters. Try widening your range or clearing filters.
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Enquiry Drawer */}
      <div className={classNames(
        "fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l bg-white shadow-xl transition-transform",
        openCart ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">Your Enquiry ({enquiry.length})</h3>
          <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100" onClick={()=>setOpenCart(false)}>Close</button>
        </div>
        <div className="h-[calc(100vh-56px-88px)] overflow-y-auto p-4 space-y-3">
          {selectedItems.length === 0 && (
            <div className="text-sm text-gray-600">No items yet. Add products from the list.</div>
          )}
          {selectedItems.map(i => (
            <div key={i.id} className="flex gap-3 rounded-xl border p-3">
              <img src={i.images[0]} alt={i.name} className="h-16 w-20 rounded object-cover"/>
              <div className="flex-1">
                <div className="text-sm font-medium leading-tight">{i.name}</div>
                <div className="text-xs text-gray-500">{i.brand} • {i.capacity_l}L • {i.height_cm}cm</div>
                <div className="text-sm font-semibold mt-0.5">S${i.price.toLocaleString()}</div>
              </div>
              <button onClick={()=>removeFromEnquiry(i.id)} className="h-8 shrink-0 rounded-lg border px-2 text-xs hover:bg-gray-100">Remove</button>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <a href={buildMailto()} className={classNames(
            "block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold",
            selectedItems.length ? "bg-black text-white" : "bg-gray-200 text-gray-600 pointer-events-none"
          )}>
            Send Enquiry Email
          </a>
          <div className="mt-2 text-xs text-gray-500">
            Tip: Replace <span className="font-mono">sales@yourdomain.sg</span> in the code with your actual email.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-6 md:grid-cols-3">
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
            <ul className="mt-1 text-sm text-gray-600 space-y-1">
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
git add .
git commit -m "Fix: unterminated string in App.tsx"
git push


