"use client";

import { useState, useMemo, useCallback, memo, ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

// ─── Types ───────────────────────────────────────────────────────────

interface ToplistItem {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  bonus: string | null;
  affiliateUrl: string | null;
  reviewUrl: string | null;
  rating: number | null;
  cta: string | null;
  logoOverride: string | null;
  termsOverride: string | null;
  licenseOverride: string | null;
  prosOverride: string[] | null;
  consOverride: string[] | null;
}

interface Brand {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  defaultBonus: string | null;
  defaultRating: number | null;
  terms: string | null;
  license: string | null;
  pros: string[] | null;
  cons: string[] | null;
  features: string[] | null;
  badgeText: string | null;
  badgeColor: string | null;
  gameProviders: string[] | null;
  gameTypes: string[] | null;
}

interface ToplistTableBuilderProps {
  items: ToplistItem[];
  brands: Brand[];
  columns: string[];
  onColumnsChange: (cols: string[]) => void;
  onAddBrand: (brandId: string) => void;
  onRemoveBrand: (itemId: string) => void;
  onReorderItems: (items: ToplistItem[]) => void;
}

// ─── Column Registry ─────────────────────────────────────────────────

interface ColumnDef {
  label: string;
  render: (item: ToplistItem, brand: Brand | undefined) => ReactNode;
}

const COLUMN_REGISTRY: Record<string, ColumnDef> = {
  name: {
    label: "Name",
    render: (item) => (
      <span className="font-medium">{item.brandName}</span>
    ),
  },
  logo: {
    label: "Logo",
    render: (item) =>
      item.logoOverride || item.brandLogo ? (
        <img
          src={item.logoOverride || item.brandLogo || ""}
          alt={item.brandName}
          className="h-8 w-16 object-contain"
        />
      ) : (
        <div className="h-8 w-16 rounded bg-zinc-100" />
      ),
  },
  bonus: {
    label: "Bonus",
    render: (item, brand) => (
      <span>{item.bonus || brand?.defaultBonus || "—"}</span>
    ),
  },
  rating: {
    label: "Rating",
    render: (item, brand) => {
      const r = item.rating ?? brand?.defaultRating ?? null;
      return <span>{r != null ? r.toFixed(1) : "—"}</span>;
    },
  },
  cta: {
    label: "CTA",
    render: (item) => <span>{item.cta || "—"}</span>,
  },
  affiliateUrl: {
    label: "Affiliate URL",
    render: (item) => (
      <span className="max-w-[200px] truncate block text-xs">
        {item.affiliateUrl || "—"}
      </span>
    ),
  },
  reviewUrl: {
    label: "Review URL",
    render: (item) => (
      <span className="max-w-[200px] truncate block text-xs">
        {item.reviewUrl || "—"}
      </span>
    ),
  },
  terms: {
    label: "Terms",
    render: (item, brand) => (
      <span className="max-w-[200px] truncate block text-xs">
        {item.termsOverride || brand?.terms || "—"}
      </span>
    ),
  },
  license: {
    label: "License",
    render: (item, brand) => (
      <span>{item.licenseOverride || brand?.license || "—"}</span>
    ),
  },
  pros: {
    label: "Pros",
    render: (item, brand) => {
      const pros = item.prosOverride || brand?.pros;
      return pros && pros.length > 0 ? (
        <ul className="text-xs space-y-0.5">
          {pros.slice(0, 3).map((p, i) => (
            <li key={i} className="text-green-700">+ {p}</li>
          ))}
        </ul>
      ) : (
        <span>—</span>
      );
    },
  },
  cons: {
    label: "Cons",
    render: (item, brand) => {
      const cons = item.consOverride || brand?.cons;
      return cons && cons.length > 0 ? (
        <ul className="text-xs space-y-0.5">
          {cons.slice(0, 3).map((c, i) => (
            <li key={i} className="text-red-600">- {c}</li>
          ))}
        </ul>
      ) : (
        <span>—</span>
      );
    },
  },
  features: {
    label: "Features",
    render: (_item, brand) => {
      const f = brand?.features;
      return f && f.length > 0 ? (
        <span className="text-xs">{f.join(", ")}</span>
      ) : (
        <span>—</span>
      );
    },
  },
  badgeText: {
    label: "Badge",
    render: (_item, brand) => (
      <span>{brand?.badgeText || "—"}</span>
    ),
  },
  gameProviders: {
    label: "Game Providers",
    render: (_item, brand) => {
      const gp = brand?.gameProviders;
      return gp && gp.length > 0 ? (
        <span className="text-xs max-w-[200px] truncate block">
          {gp.join(", ")}
        </span>
      ) : (
        <span>—</span>
      );
    },
  },
  gameTypes: {
    label: "Game Types",
    render: (_item, brand) => {
      const gt = brand?.gameTypes;
      return gt && gt.length > 0 ? (
        <span className="text-xs max-w-[200px] truncate block">
          {gt.join(", ")}
        </span>
      ) : (
        <span>—</span>
      );
    },
  },
};

const ALL_COLUMN_KEYS = Object.keys(COLUMN_REGISTRY);

// ─── DnD Sub-Components ──────────────────────────────────────────────

const DraggablePaletteItem = memo(function DraggablePaletteItem({
  id,
  type,
  children,
}: {
  id: string;
  type: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type },
  });

  const bgColor = type === "brand" ? "bg-blue-50 hover:bg-blue-100 border-blue-200" : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200";
  const textColor = type === "brand" ? "text-blue-900" : "text-emerald-900";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`px-3 py-2 rounded-lg border-2 text-xs font-medium cursor-grab select-none transition-all ${bgColor} ${textColor} ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      {children}
    </div>
  );
});

const SortableColumnHeader = memo(function SortableColumnHeader({
  colKey,
  label,
  onRemove,
}: {
  colKey: string;
  label: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `col-${colKey}`,
    data: { type: "column-header" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableHead ref={setNodeRef} style={style} className="relative group bg-gradient-to-b from-zinc-50 to-zinc-100">
      <div className="flex items-center gap-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </span>
        <span className="text-xs font-bold text-zinc-700 uppercase tracking-wide">{label}</span>
        <button
          onClick={onRemove}
          className="ml-auto text-zinc-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TableHead>
  );
});

const SortableRow = memo(function SortableRow({
  item,
  brand,
  columns,
  position,
  onRemove,
}: {
  item: ToplistItem;
  brand: Brand | undefined;
  columns: string[];
  position: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `row-${item.id}`,
    data: { type: "row" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="group hover:bg-blue-50/50 transition-colors">
      {/* Drag handle + position */}
      <TableCell className="w-16 border-r border-zinc-100">
        <div className="flex items-center gap-2">
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab text-zinc-300 hover:text-zinc-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </span>
          <span className="min-w-[1.5rem] h-6 flex items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold shadow-sm">
            {position}
          </span>
        </div>
      </TableCell>

      {/* Dynamic columns */}
      {columns.map((colKey) => {
        const colDef = COLUMN_REGISTRY[colKey];
        if (!colDef) return <TableCell key={colKey}>—</TableCell>;
        return (
          <TableCell key={colKey} className="border-r border-zinc-100/50">{colDef.render(item, brand)}</TableCell>
        );
      })}

      {/* Remove button */}
      <TableCell className="w-12">
        <button
          onClick={onRemove}
          className="text-zinc-300 hover:text-red-600 opacity-50 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </TableCell>
    </TableRow>
  );
});

const DroppableTableBody = memo(function DroppableTableBody({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "table-body-drop",
    data: { accepts: "brand" },
  });

  return (
    <TableBody
      ref={setNodeRef}
      className={isOver ? "bg-blue-100/30 transition-colors" : "transition-colors"}
    >
      {children}
    </TableBody>
  );
});

const DroppableTableHeader = memo(function DroppableTableHeader({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "table-header-drop",
    data: { accepts: "column" },
  });

  return (
    <TableHeader
      ref={setNodeRef}
      className={isOver ? "bg-emerald-100/40 transition-colors border-b-2 border-emerald-300" : "transition-colors border-b-2 border-zinc-200"}
    >
      {children}
    </TableHeader>
  );
});

// ─── Main Component ──────────────────────────────────────────────────

export function ToplistTableBuilder({
  items,
  brands,
  columns,
  onColumnsChange,
  onAddBrand,
  onRemoveBrand,
  onReorderItems,
}: ToplistTableBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize expensive computations
  const brandsInList = useMemo(
    () => new Set(items.map((i) => i.brandId)),
    [items]
  );

  const availableBrands = useMemo(
    () => brands.filter((b) => !brandsInList.has(b.brandId)),
    [brands, brandsInList]
  );

  const unusedColumns = useMemo(
    () => ALL_COLUMN_KEYS.filter((k) => !columns.includes(k)),
    [columns]
  );

  const brandMap = useMemo(
    () => new Map(brands.map((b) => [b.brandId, b])),
    [brands]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type as string;

    // Brand from palette dropped onto table body
    if (activeType === "brand" && (over.id === "table-body-drop" || String(over.id).startsWith("row-"))) {
      const brandId = (active.id as string).replace("palette-brand-", "");
      onAddBrand(brandId);
      return;
    }

    // Column from palette dropped onto table header
    if (activeType === "column" && (over.id === "table-header-drop" || String(over.id).startsWith("col-"))) {
      const colKey = (active.id as string).replace("palette-col-", "");
      if (!columns.includes(colKey)) {
        onColumnsChange([...columns, colKey]);
      }
      return;
    }

    // Reorder rows
    if (activeType === "row" && active.id !== over.id && String(over.id).startsWith("row-")) {
      const oldIndex = items.findIndex((i) => `row-${i.id}` === active.id);
      const newIndex = items.findIndex((i) => `row-${i.id}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderItems(arrayMove(items, oldIndex, newIndex));
      }
      return;
    }

    // Reorder columns
    if (activeType === "column-header" && active.id !== over.id && String(over.id).startsWith("col-")) {
      const oldKey = (active.id as string).replace("col-", "");
      const newKey = (over.id as string).replace("col-", "");
      const oldIndex = columns.indexOf(oldKey);
      const newIndex = columns.indexOf(newKey);
      if (oldIndex !== -1 && newIndex !== -1) {
        onColumnsChange(arrayMove(columns, oldIndex, newIndex));
      }
      return;
    }
  }, [items, columns, onAddBrand, onColumnsChange, onReorderItems]);

  const handleRemoveColumn = useCallback((colKey: string) => {
    onColumnsChange(columns.filter((c) => c !== colKey));
  }, [columns, onColumnsChange]);

  const getActiveLabel = useCallback((id: string): string => {
    if (id.startsWith("palette-brand-")) {
      const brandId = id.replace("palette-brand-", "");
      return brandMap.get(brandId)?.name || brandId;
    }
    if (id.startsWith("palette-col-")) {
      const key = id.replace("palette-col-", "");
      return COLUMN_REGISTRY[key]?.label || key;
    }
    if (id.startsWith("row-")) {
      const itemId = id.replace("row-", "");
      const item = items.find((i) => i.id === itemId);
      return item?.brandName || itemId;
    }
    if (id.startsWith("col-")) {
      const key = id.replace("col-", "");
      return COLUMN_REGISTRY[key]?.label || key;
    }
    return id;
  }, [brandMap, items]);

  const activeData = useMemo(
    () => (activeId ? getActiveLabel(activeId) : null),
    [activeId, getActiveLabel]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6">
        {/* ─── Sidebar Palettes ─── */}
        <div className="w-56 shrink-0 space-y-6">
          {/* Brand palette */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Brands
              </h3>
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
              {availableBrands.length === 0 ? (
                <p className="text-xs text-blue-600/60 italic py-2">All brands added</p>
              ) : (
                availableBrands.map((brand) => (
                  <DraggablePaletteItem
                    key={brand.brandId}
                    id={`palette-brand-${brand.brandId}`}
                    type="brand"
                  >
                    {brand.name}
                  </DraggablePaletteItem>
                ))
              )}
            </div>
          </div>

          {/* Column palette */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Columns
              </h3>
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-100">
              {unusedColumns.length === 0 ? (
                <p className="text-xs text-emerald-600/60 italic py-2">All columns added</p>
              ) : (
                unusedColumns.map((key) => (
                  <DraggablePaletteItem
                    key={key}
                    id={`palette-col-${key}`}
                    type="column"
                  >
                    {COLUMN_REGISTRY[key]?.label || key}
                  </DraggablePaletteItem>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── Table ─── */}
        <div className="flex-1 min-w-0 rounded-xl border-2 border-zinc-200 bg-white overflow-hidden shadow-lg">
          <Table>
            <DroppableTableHeader>
              <SortableContext
                items={columns.map((c) => `col-${c}`)}
                strategy={horizontalListSortingStrategy}
              >
                <TableRow>
                  <TableHead className="w-16 text-xs bg-gradient-to-b from-zinc-50 to-zinc-100 border-r border-zinc-200">
                    <span className="text-xs font-bold text-zinc-600 uppercase">#</span>
                  </TableHead>
                  {columns.map((colKey) => (
                    <SortableColumnHeader
                      key={colKey}
                      colKey={colKey}
                      label={COLUMN_REGISTRY[colKey]?.label || colKey}
                      onRemove={() => handleRemoveColumn(colKey)}
                    />
                  ))}
                  <TableHead className="w-12 bg-gradient-to-b from-zinc-50 to-zinc-100" />
                </TableRow>
              </SortableContext>
            </DroppableTableHeader>

            <DroppableTableBody>
              <SortableContext
                items={items.map((i) => `row-${i.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 2}
                      className="text-center py-16"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-700">No brands yet</p>
                          <p className="text-xs text-zinc-500 mt-1">Drag brands from the left sidebar to get started</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      brand={brandMap.get(item.brandId)}
                      columns={columns}
                      position={index + 1}
                      onRemove={() => onRemoveBrand(item.id)}
                    />
                  ))
                )}
              </SortableContext>
            </DroppableTableBody>
          </Table>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeData ? (
          <div className="px-3 py-1.5 rounded border bg-white shadow-lg text-xs font-medium">
            {activeData}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
