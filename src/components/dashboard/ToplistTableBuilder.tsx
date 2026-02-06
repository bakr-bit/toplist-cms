"use client";

import { useState, ReactNode } from "react";
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

function DraggablePaletteItem({
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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`px-2 py-1.5 rounded border text-xs cursor-grab bg-white hover:bg-zinc-50 select-none ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {children}
    </div>
  );
}

function SortableColumnHeader({
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
    <TableHead ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-center gap-1">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-zinc-400 hover:text-zinc-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </span>
        <span className="text-xs font-medium">{label}</span>
        <button
          onClick={onRemove}
          className="ml-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TableHead>
  );
}

function SortableRow({
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
    <TableRow ref={setNodeRef} style={style}>
      {/* Drag handle + position */}
      <TableCell className="w-16">
        <div className="flex items-center gap-1.5">
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab text-zinc-400 hover:text-zinc-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-zinc-500">{position}</span>
        </div>
      </TableCell>

      {/* Dynamic columns */}
      {columns.map((colKey) => {
        const colDef = COLUMN_REGISTRY[colKey];
        if (!colDef) return <TableCell key={colKey}>—</TableCell>;
        return (
          <TableCell key={colKey}>{colDef.render(item, brand)}</TableCell>
        );
      })}

      {/* Remove button */}
      <TableCell className="w-10">
        <button
          onClick={onRemove}
          className="text-zinc-300 hover:text-red-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </TableCell>
    </TableRow>
  );
}

function DroppableTableBody({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "table-body-drop",
    data: { accepts: "brand" },
  });

  return (
    <TableBody
      ref={setNodeRef}
      className={isOver ? "bg-blue-50/50" : ""}
    >
      {children}
    </TableBody>
  );
}

function DroppableTableHeader({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "table-header-drop",
    data: { accepts: "column" },
  });

  return (
    <TableHeader
      ref={setNodeRef}
      className={isOver ? "bg-blue-50/50" : ""}
    >
      {children}
    </TableHeader>
  );
}

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

  const brandsInList = new Set(items.map((i) => i.brandId));
  const availableBrands = brands.filter((b) => !brandsInList.has(b.brandId));
  const unusedColumns = ALL_COLUMN_KEYS.filter((k) => !columns.includes(k));

  const brandMap = new Map(brands.map((b) => [b.brandId, b]));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
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
  }

  function handleRemoveColumn(colKey: string) {
    onColumnsChange(columns.filter((c) => c !== colKey));
  }

  // Overlay content for drag feedback
  const activeData = activeId ? getActiveLabel(activeId) : null;

  function getActiveLabel(id: string): string {
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
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {/* ─── Sidebar Palettes ─── */}
        <div className="w-48 shrink-0 space-y-4">
          {/* Brand palette */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
              Brands
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {availableBrands.length === 0 ? (
                <p className="text-xs text-zinc-400">All brands added</p>
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
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
              Columns
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {unusedColumns.length === 0 ? (
                <p className="text-xs text-zinc-400">All columns added</p>
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
        <div className="flex-1 min-w-0 rounded-lg border bg-white overflow-x-auto">
          <Table>
            <DroppableTableHeader>
              <SortableContext
                items={columns.map((c) => `col-${c}`)}
                strategy={horizontalListSortingStrategy}
              >
                <TableRow>
                  <TableHead className="w-16 text-xs">#</TableHead>
                  {columns.map((colKey) => (
                    <SortableColumnHeader
                      key={colKey}
                      colKey={colKey}
                      label={COLUMN_REGISTRY[colKey]?.label || colKey}
                      onRemove={() => handleRemoveColumn(colKey)}
                    />
                  ))}
                  <TableHead className="w-10" />
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
                      className="text-center text-zinc-400 py-8"
                    >
                      Drag brands from the palette to add rows
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
