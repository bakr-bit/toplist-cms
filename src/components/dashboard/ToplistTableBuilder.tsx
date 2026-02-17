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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPaymentMethodIcon, getPaymentMethodName } from "@/lib/payment-methods";

// ─── Types ───────────────────────────────────────────────────────────

export interface ToplistItem {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  cta: string | null;
  reviewUrl: string | null;
  // SiteBrand data (read-only display)
  bonus: string | null;
  affiliateUrl: string | null;
  rating: number | null;
  terms: string | null;
  description: string | null;
  pros: string[] | null;
  cons: string[] | null;
  features: string[] | null;
  badgeText: string | null;
  badgeColor: string | null;
  freeSpinsOffer: string | null;
  wageringRequirement: string | null;
  welcomePackage: string | null;
  loyaltyProgram: string | null;
  promotions: string | null;
}

interface Brand {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  license: string | null;
  gameProviders: string[] | null;
  gameTypes: string[] | null;
  paymentMethods: string[] | null;
  totalGames: number | null;
}

interface ToplistTableBuilderProps {
  siteKey: string;
  items: ToplistItem[];
  brands: Brand[];
  columns: string[];
  columnLabels?: Record<string, string>;
  onColumnsChange: (cols: string[]) => void;
  onColumnLabelChange?: (colKey: string, label: string) => void;
  onAddBrand: (brandId: string) => void;
  onRemoveBrand: (itemId: string) => void;
  onReorderItems: (items: ToplistItem[]) => void;
  onUpdateItem: (id: string, field: string, value: string | null) => void;
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
      item.brandLogo ? (
        <img
          src={item.brandLogo}
          alt={item.brandName}
          className="h-8 w-16 object-contain"
        />
      ) : (
        <div className="h-8 w-16 rounded bg-zinc-100" />
      ),
  },
  bonus: {
    label: "Bonus",
    render: (item) => (
      <span>{item.bonus || "—"}</span>
    ),
  },
  rating: {
    label: "Rating",
    render: (item) => {
      const r = item.rating;
      return <span>{r != null ? r.toFixed(1) : "—"}</span>;
    },
  },
  cta: {
    label: "CTA",
    render: (item) => {
      const url = item.affiliateUrl;
      const text = item.cta || "Play Now";

      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {text}
        </a>
      ) : (
        <span className="text-xs text-zinc-400 italic">{text}</span>
      );
    },
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
    render: (item) => (
      <span className="max-w-[200px] truncate block text-xs">
        {item.terms || "—"}
      </span>
    ),
  },
  license: {
    label: "License",
    render: (_item, brand) => (
      <span>{brand?.license || "—"}</span>
    ),
  },
  freeSpins: {
    label: "Free Spins",
    render: (item) => (
      <span>{item.freeSpinsOffer || "—"}</span>
    ),
  },
  wagering: {
    label: "Wagering",
    render: (item) => (
      <span>{item.wageringRequirement || "—"}</span>
    ),
  },
  totalGames: {
    label: "Total Games",
    render: (_item, brand) => (
      <span>{brand?.totalGames != null ? brand.totalGames.toLocaleString() : "—"}</span>
    ),
  },
  pros: {
    label: "Pros",
    render: (item) => {
      const pros = item.pros as string[] | null;
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
    render: (item) => {
      const cons = item.cons as string[] | null;
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
    render: (item) => {
      const f = item.features as string[] | null;
      return f && f.length > 0 ? (
        <span className="text-xs">{f.join(", ")}</span>
      ) : (
        <span>—</span>
      );
    },
  },
  badgeText: {
    label: "Badge",
    render: (item) => (
      <span>{item.badgeText || "—"}</span>
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
  paymentMethods: {
    label: "Payment Methods",
    render: (_item, brand) => {
      const methods = brand?.paymentMethods;
      return methods && methods.length > 0 ? (
        <div className="flex items-center gap-1 flex-wrap">
          {methods.slice(0, 5).map((methodId) => (
            <div key={methodId} className="text-zinc-600" title={getPaymentMethodName(methodId)}>
              {getPaymentMethodIcon(methodId)}
            </div>
          ))}
          {methods.length > 5 && (
            <span className="text-xs text-zinc-400">+{methods.length - 5}</span>
          )}
        </div>
      ) : (
        <span>—</span>
      );
    },
  },
};

const ALL_COLUMN_KEYS = Object.keys(COLUMN_REGISTRY);

// ─── Column Icons ────────────────────────────────────────────────────

function getColumnIcon(colKey: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    name: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    logo: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    bonus: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    rating: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    cta: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>,
    affiliateUrl: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    reviewUrl: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
    terms: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    license: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    pros: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    cons: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    features: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    badgeText: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    gameProviders: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    gameTypes: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    paymentMethods: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    freeSpins: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    wagering: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    totalGames: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
  };
  return icons[colKey] || <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
}

// ─── DnD Sub-Components ──────────────────────────────────────────────

const DraggablePaletteItem = memo(function DraggablePaletteItem({
  id,
  type,
  icon,
  children,
}: {
  id: string;
  type: string;
  icon?: ReactNode;
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
      className={`px-3 py-2 rounded-lg border-2 text-xs font-medium cursor-grab select-none transition-all flex items-center gap-2 ${bgColor} ${textColor} ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </div>
  );
});

const SortableColumnHeader = memo(function SortableColumnHeader({
  colKey,
  label,
  onRemove,
  onRename,
}: {
  colKey: string;
  label: string;
  onRemove: () => void;
  onRename: (newLabel: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);

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

  const handleSaveRename = () => {
    const newLabel = editValue.trim();
    if (newLabel !== label) {
      onRename(newLabel);
    }
    setIsEditing(false);
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
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename();
              if (e.key === "Escape") {
                setEditValue(label);
                setIsEditing(false);
              }
            }}
            className="text-xs font-bold text-zinc-700 uppercase tracking-wide bg-white border border-zinc-300 rounded px-1 py-0.5 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span
            className="text-xs font-bold text-zinc-700 uppercase tracking-wide cursor-pointer hover:text-blue-600"
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to rename"
          >
            {label || "\u00A0"}
          </span>
        )}
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
  onEdit,
}: {
  item: ToplistItem;
  brand: Brand | undefined;
  columns: string[];
  position: number;
  onRemove: () => void;
  onEdit: () => void;
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
          <TableCell
            key={colKey}
            className="border-r border-zinc-100/50 cursor-pointer"
            onClick={onEdit}
          >
            {colDef.render(item, brand)}
          </TableCell>
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

// ─── Edit Modal Component ────────────────────────────────────────────

function ItemEditModal({
  item,
  siteKey,
  open,
  onOpenChange,
  onUpdate,
}: {
  item: ToplistItem | null;
  siteKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (field: string, value: string | null) => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {item.brandName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label className="text-xs">CTA Text</Label>
            <Input
              value={item.cta || ""}
              onChange={(e) => onUpdate("cta", e.target.value || null)}
              placeholder="e.g. Play Now"
            />
          </div>
          <div>
            <Label className="text-xs">Review URL</Label>
            <Input
              value={item.reviewUrl || ""}
              onChange={(e) => onUpdate("reviewUrl", e.target.value || null)}
              placeholder="/reviews/..."
            />
          </div>

          {/* Read-only SiteBrand info */}
          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-zinc-500 mb-3">
              Deal data is managed per-site.{" "}
              <a
                href={`/dashboard/sites/${siteKey}/brands/${item.brandId}`}
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Edit deal for this site
              </a>
            </p>
            {item.bonus && (
              <p className="text-xs text-zinc-600"><strong>Bonus:</strong> {item.bonus}</p>
            )}
            {item.rating != null && (
              <p className="text-xs text-zinc-600"><strong>Rating:</strong> {item.rating.toFixed(1)}</p>
            )}
            {item.affiliateUrl && (
              <p className="text-xs text-zinc-600 truncate"><strong>Affiliate:</strong> {item.affiliateUrl}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function ToplistTableBuilder({
  siteKey,
  items,
  brands,
  columns,
  columnLabels = {},
  onColumnsChange,
  onColumnLabelChange,
  onAddBrand,
  onRemoveBrand,
  onReorderItems,
  onUpdateItem,
}: ToplistTableBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) ?? null : null;

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
                    icon={
                      brand.defaultLogo ? (
                        <img
                          src={brand.defaultLogo}
                          alt={brand.name}
                          className="h-5 w-5 object-contain rounded"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded bg-blue-200 flex items-center justify-center">
                          <svg className="h-3 w-3 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      )
                    }
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
                    icon={getColumnIcon(key)}
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
                      label={colKey in columnLabels ? columnLabels[colKey] : (COLUMN_REGISTRY[colKey]?.label || colKey)}
                      onRemove={() => handleRemoveColumn(colKey)}
                      onRename={(newLabel) => onColumnLabelChange?.(colKey, newLabel)}
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
                      onEdit={() => setEditingItemId(item.id)}
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

      {/* Edit modal */}
      <ItemEditModal
        item={editingItem}
        siteKey={siteKey}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItemId(null)}
        onUpdate={(field, value) => {
          if (editingItem) {
            onUpdateItem(editingItem.id, field, value);
          }
        }}
      />
    </DndContext>
  );
}
