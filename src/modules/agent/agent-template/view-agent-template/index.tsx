import { useState, useRef, useEffect, useCallback, DragEvent, MouseEvent } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type LLMProvider = "openai" | "anthropic" | "azure" | "gemini";

const llmModels: Record<LLMProvider, string[]> = {
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-5"],
    anthropic: ["claude-sonnet-4-20250514", "claude-sonnet-4-5-20250929", "claude-3-7-sonnet-20250219"],
    azure: ["gpt-4o-docsnap", "gpt-4o-mini-docsnap"],
    gemini: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-pro-preview", "gemini-3-flash-preview"],
};

type GroupType = "basic" | "table";

interface Field {
    key: string;
    label: string;
    instruction: string;
    excludeExtraction: boolean;
    hidden: boolean;
    isTextarea: boolean;
    required: boolean;
    regularExpression: string;
}

interface Group {
    id: string;
    name: string;
    type: GroupType;
    instruction: string;
    fields: Field[];
}

interface Settings {
    llmProvider: LLMProvider;
    llmModel: string;
    extractionLimit: number;
    disableBoundingBox: boolean;
    alignmentCorrection: boolean;
    includeOcrTextForExtraction: boolean;
}

interface SelectedField {
    groupId: string;
    fieldKey: string;
}

interface DragState {
    sourceGroupId: string;
    sourceIndex: number;
    fieldKey: string;
}

interface DropTarget {
    groupId: string;
    index: number;
}

interface Toast {
    msg: string;
    icon: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const initialGroups: Group[] = [
    {
        id: "basic_details", name: "Basic Details", type: "basic",
        instruction: "Extract PO Number and PO Date",
        fields: [
            { key: "po_number", label: "PO Number", instruction: "Extract PO Number", excludeExtraction: false, hidden: false, isTextarea: false, required: true, regularExpression: "" },
            { key: "po_date", label: "PO Date", instruction: "Extract PO Date", excludeExtraction: false, hidden: false, isTextarea: false, required: true, regularExpression: "" },
        ],
    },
    {
        id: "line_items", name: "Line Items", type: "table",
        instruction: "Extract Line Items",
        fields: [
            { key: "item_name", label: "Sl No", instruction: "", excludeExtraction: false, hidden: false, isTextarea: false, required: true, regularExpression: "" },
            { key: "description", label: "Description", instruction: "Extract Description", excludeExtraction: false, hidden: false, isTextarea: true, required: true, regularExpression: "" },
            { key: "quantity", label: "Quantity", instruction: "Extract Quantity", excludeExtraction: false, hidden: false, isTextarea: false, required: true, regularExpression: "" },
            { key: "unit_price", label: "Unit Price", instruction: "Extract Unit Price", excludeExtraction: false, hidden: false, isTextarea: false, required: true, regularExpression: "" },
        ],
    },
];

// ── Icons ──────────────────────────────────────────────────────────────────────

type IconPath = string | string[];

const Icon = ({
    d,
    size = 14,
    fill = "none",
    stroke = "currentColor",
    strokeWidth = 2,
}: {
    d: IconPath;
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24"
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round"
    >
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);

const GripIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
);

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            style={{
                width: 34, height: 18, borderRadius: 9, border: "none",
                cursor: "pointer", position: "relative",
                background: checked ? "#4F46E5" : "#D1D5DB",
                transition: "background .2s",
                flexShrink: 0,
            }}
        >
            <span style={{
                position: "absolute", width: 14, height: 14,
                background: "white", borderRadius: "50%",
                top: 2, left: checked ? 18 : 2,
                transition: "left .2s",
                boxShadow: "0 1px 2px rgba(0,0,0,.15)",
            }} />
        </button>
    );
}

// ── useToast ───────────────────────────────────────────────────────────────────

function useToast() {
    const [toast, setToast] = useState<Toast | null>(null);
    // @ts-ignore
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const show = (msg: string, icon = "✓") => {
        setToast({ msg, icon });
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setToast(null), 2400);
    };
    return { toast, show };
}

// ── useResize ──────────────────────────────────────────────────────────────────

function useResize(initialWidth: number, min: number, max: number, side: "left" | "right" = "right") {
    const [width, setWidth] = useState(initialWidth);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startW = useRef(0);

    const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        dragging.current = true;
        startX.current = e.clientX;
        startW.current = width;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }, [width]);

    useEffect(() => {
        const onMove = (e: globalThis.MouseEvent) => {
            if (!dragging.current) return;
            const delta = side === "right" ? e.clientX - startX.current : startX.current - e.clientX;
            setWidth(Math.max(min, Math.min(max, startW.current + delta)));
        };
        const onUp = () => {
            if (!dragging.current) return;
            dragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [min, max, side]);

    return { width, onMouseDown };
}

// ── ResizeHandle ───────────────────────────────────────────────────────────────

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: MouseEvent<HTMLDivElement>) => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseDown={onMouseDown}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 4, flexShrink: 0, cursor: "col-resize",
                position: "relative", zIndex: 10,
                background: hovered ? "#818CF8" : "#E5E7EB",
                transition: "background .15s",
            }}
        />
    );
}

// ── Settings Dialog ────────────────────────────────────────────────────────────

function SettingsDialog({
    settings,
    onUpdate,
    onClose,
}: {
    settings: Settings;
    onUpdate: (c: Partial<Settings>) => void;
    onClose: () => void;
}) {
    const models = llmModels[settings.llmProvider] ?? [];
    const flags: Array<[keyof Settings, string]> = [
        ["disableBoundingBox", "Disable bounding box"],
        ["alignmentCorrection", "Alignment correction"],
        ["includeOcrTextForExtraction", "Include OCR text for extraction"],
    ];

    const selectStyle: React.CSSProperties = {
        width: "100%", padding: "6px 8px",
        border: "0.5px solid #D1D5DB", borderRadius: 6,
        background: "#F9FAFB", color: "#111827",
        fontSize: 13, fontFamily: "inherit", outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        paddingRight: 28,
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: 20,
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: "white", borderRadius: 12,
                width: "100%", maxWidth: 400, overflow: "hidden",
                border: "0.5px solid #E5E7EB",
                boxShadow: "0 20px 40px rgba(0,0,0,.12)",
            }}>
                {/* Header */}
                <div style={{
                    padding: "12px 14px", borderBottom: "0.5px solid #F3F4F6",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: "#EEF2FF", color: "#4338CA",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" size={12} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>LLM settings</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 24, height: 24, border: "none", background: "transparent",
                            borderRadius: 4, cursor: "pointer", display: "flex",
                            alignItems: "center", justifyContent: "center", color: "#9CA3AF",
                        }}
                    >
                        <Icon d="M18 6L6 18M6 6l12 12" size={13} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                            {
                                label: "Provider",
                                control: (
                                    <select
                                        value={settings.llmProvider}
                                        style={selectStyle}
                                        onChange={(e) => {
                                            const p = e.target.value as LLMProvider;
                                            onUpdate({ llmProvider: p, llmModel: llmModels[p]?.[0] ?? "" });
                                        }}
                                    >
                                        {(Object.keys(llmModels) as LLMProvider[]).map((p) => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>
                                ),
                            },
                            {
                                label: "Model",
                                control: (
                                    <select
                                        value={settings.llmModel}
                                        style={selectStyle}
                                        onChange={(e) => onUpdate({ llmModel: e.target.value })}
                                    >
                                        {models.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                ),
                            },
                        ].map(({ label, control }) => (
                            <div key={label}>
                                <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9CA3AF", marginBottom: 4 }}>{label}</div>
                                {control}
                            </div>
                        ))}
                    </div>

                    <div>
                        <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9CA3AF", marginBottom: 4 }}>Extraction limit</div>
                        <input
                            type="number" min={1} max={100}
                            value={settings.extractionLimit}
                            onChange={(e) => onUpdate({ extractionLimit: parseInt(e.target.value) || 1 })}
                            style={{
                                width: 90, padding: "6px 8px",
                                border: "0.5px solid #D1D5DB", borderRadius: 6,
                                fontFamily: "monospace", fontSize: 13,
                                background: "#F9FAFB", color: "#111827", outline: "none",
                            }}
                        />
                    </div>

                    <div style={{ borderTop: "0.5px solid #F3F4F6", paddingTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".07em", color: "#9CA3AF", marginBottom: 8 }}>Feature flags</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {flags.map(([key, label]) => (
                                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
                                    <Toggle checked={settings[key] as boolean} onChange={(v) => onUpdate({ [key]: v })} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: "10px 14px", borderTop: "0.5px solid #F3F4F6",
                    background: "#F9FAFB", display: "flex", justifyContent: "flex-end",
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "6px 16px", borderRadius: 6, border: "none",
                            background: "#4F46E5", color: "white", fontSize: 13,
                            fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Field Row ──────────────────────────────────────────────────────────────────

function FieldRow({
    field, groupId, index, isSelected, isDragging,
    showIndicatorAbove, showIndicatorBelow,
    onSelect, onDelete, onDuplicate, onDragStart, onDragOver, onDragEnd,
}: {
    field: Field;
    groupId: string;
    index: number;
    isSelected: boolean;
    isDragging: boolean;
    showIndicatorAbove: boolean;
    showIndicatorBelow: boolean;
    onSelect: (groupId: string, fieldKey: string) => void;
    onDelete: (groupId: string, fieldKey: string) => void;
    onDuplicate: (groupId: string, fieldKey: string) => void;
    onDragStart: (e: DragEvent<HTMLDivElement>, groupId: string, index: number, fieldKey: string) => void;
    onDragOver: (e: DragEvent<HTMLDivElement>, groupId: string, index: number) => void;
    onDragEnd: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    const dotColor = field.isTextarea ? "#7C3AED" : field.required ? "#059669" : "#4F46E5";

    return (
        <div style={{ position: "relative", paddingTop: showIndicatorAbove ? 3 : 0, paddingBottom: showIndicatorBelow ? 3 : 0 }}>
            {showIndicatorAbove && (
                <div style={{ position: "absolute", top: 0, left: 4, right: 4, height: 2, background: "#4F46E5", borderRadius: 1, zIndex: 5 }} />
            )}
            <div
                draggable
                onDragStart={(e) => onDragStart(e, groupId, index, field.key)}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(e, groupId, index); }}
                onDragEnd={onDragEnd}
                onClick={() => onSelect(groupId, field.key)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    display: "flex", alignItems: "center",
                    background: "white",
                    border: `0.5px solid ${isSelected ? "#4F46E5" : hovered ? "#9CA3AF" : "#E5E7EB"}`,
                    borderRadius: 6, minHeight: 36,
                    cursor: "grab", userSelect: "none",
                    opacity: isDragging ? 0.25 : 1,
                    boxShadow: isSelected ? "0 0 0 2px rgba(79,70,229,.12)" : "none",
                    transition: "border-color .12s, box-shadow .12s, opacity .12s",
                    overflow: "hidden",
                }}
            >
                {/* Grip */}
                <div style={{ width: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#D1D5DB", flexShrink: 0 }}>
                    <GripIcon />
                </div>

                {/* Dot */}
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0, marginRight: 8 }} />

                {/* Label */}
                <div style={{ flex: 1, fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#111827" }}>
                    {field.label}
                </div>

                {/* Key */}
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#9CA3AF", padding: "0 8px", flexShrink: 0 }}>
                    {field.key}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: 3, paddingRight: 4, flexShrink: 0 }}>
                    {field.required && <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 5px", borderRadius: 3, background: "#D1FAE5", color: "#065F46" }}>Req</span>}
                    {field.hidden && <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 5px", borderRadius: 3, background: "#FEF3C7", color: "#92400E" }}>Hidden</span>}
                    {field.isTextarea && <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 5px", borderRadius: 3, background: "#EDE9FE", color: "#4C1D95" }}>Txt</span>}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 2, padding: "0 4px", flexShrink: 0, opacity: hovered || isSelected ? 1 : 0, transition: "opacity .12s" }}>
                    {[
                        {
                            icon: <Icon d={["M9 9h13v13H9z", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"]} size={11} />,
                            onClick: (e: React.MouseEvent) => { e.stopPropagation(); onDuplicate(groupId, field.key); },
                            danger: false,
                        },
                        {
                            icon: <Icon d={["M3 6h18", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"]} size={11} />,
                            onClick: (e: React.MouseEvent) => { e.stopPropagation(); onDelete(groupId, field.key); },
                            danger: true,
                        },
                    ].map(({ icon, onClick, danger }, i) => (
                        <ActionButton key={i} onClick={onClick} danger={danger}>{icon}</ActionButton>
                    ))}
                </div>
            </div>
            {showIndicatorBelow && (
                <div style={{ position: "absolute", bottom: 0, left: 4, right: 4, height: 2, background: "#4F46E5", borderRadius: 1, zIndex: 5 }} />
            )}
        </div>
    );
}

// ── ActionButton ───────────────────────────────────────────────────────────────

function ActionButton({ children, onClick, danger = false }: {
    children: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    danger?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 24, height: 24, border: "none", borderRadius: 4,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: hovered ? (danger ? "#FEE2E2" : "#F3F4F6") : "transparent",
                color: hovered ? (danger ? "#DC2626" : "#374151") : "#9CA3AF",
                transition: "background .1s, color .1s",
            }}
        >
            {children}
        </button>
    );
}

// ── Group Card ─────────────────────────────────────────────────────────────────

function GroupCard({
    group, selectedField, dropTarget, dragState,
    onSelectField, onDeleteGroup, onUpdateGroup, onAddField,
    onDeleteField, onDuplicateField, onDragStart, onDragOver, onDragEnd, onDropIntoGroup,
}: {
    group: Group;
    selectedField: SelectedField | null;
    dropTarget: DropTarget | null;
    dragState: DragState | null;
    onSelectField: (groupId: string, fieldKey: string) => void;
    onDeleteGroup: (id: string) => void;
    onUpdateGroup: (id: string, changes: Partial<Group>) => void;
    onAddField: (groupId: string) => void;
    onDeleteField: (groupId: string, fieldKey: string) => void;
    onDuplicateField: (groupId: string, fieldKey: string) => void;
    onDragStart: (e: DragEvent<HTMLDivElement>, groupId: string, index: number, fieldKey: string) => void;
    onDragOver: (e: DragEvent<HTMLDivElement>, groupId: string, index: number) => void;
    onDragEnd: () => void;
    onDropIntoGroup: (e: DragEvent<HTMLDivElement>, groupId: string) => void;
}) {
    const isTable = group.type === "table";
    const isActiveTarget = dropTarget?.groupId === group.id;
    const [delHovered, setDelHovered] = useState(false);
    const [addHovered, setAddHovered] = useState(false);

    return (
        <div style={{
            background: "white",
            border: `0.5px solid ${isActiveTarget ? "#818CF8" : "#E5E7EB"}`,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: isActiveTarget ? "0 0 0 3px rgba(99,102,241,.1)" : "0 1px 2px rgba(0,0,0,.03)",
            transition: "border-color .15s, box-shadow .15s",
        }}>
            {/* Header */}
            <div style={{
                padding: "10px 12px", background: "#F9FAFB",
                borderBottom: "0.5px solid #F3F4F6",
                display: "flex", alignItems: "center", gap: 8,
            }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: isTable ? "#F5F3FF" : "#EEF2FF",
                    color: isTable ? "#6D28D9" : "#4338CA",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    {isTable
                        ? <Icon d={["M3 3h18v18H3z", "M3 9h18", "M3 15h18", "M9 3v18"]} size={13} />
                        : <Icon d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"]} size={13} />
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                        value={group.name}
                        onChange={(e) => onUpdateGroup(group.id, { name: e.target.value })}
                        style={{
                            fontSize: 13, fontWeight: 500, border: "none", background: "transparent",
                            fontFamily: "inherit", outline: "none", width: "100%", color: "#111827",
                        }}
                    />
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{group.id}</div>
                </div>
                <span style={{
                    fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
                    background: isTable ? "#F5F3FF" : "#EEF2FF",
                    color: isTable ? "#6D28D9" : "#4338CA",
                }}>
                    {group.type}
                </span>
                <button
                    onMouseEnter={() => setDelHovered(true)}
                    onMouseLeave={() => setDelHovered(false)}
                    onClick={() => onDeleteGroup(group.id)}
                    style={{
                        width: 24, height: 24, border: "none", borderRadius: 4,
                        background: delHovered ? "#FEE2E2" : "transparent",
                        color: delHovered ? "#DC2626" : "#9CA3AF",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background .1s, color .1s",
                    }}
                >
                    <Icon d={["M3 6h18", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"]} size={12} />
                </button>
            </div>

            {/* Instruction */}
            <div style={{
                padding: "7px 12px", borderBottom: "0.5px solid #F3F4F6",
                display: "flex", alignItems: "center", gap: 7,
            }}>
                <span style={{ color: "#9CA3AF", flexShrink: 0 }}>
                    <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01" size={11} />
                </span>
                <input
                    value={group.instruction}
                    onChange={(e) => onUpdateGroup(group.id, { instruction: e.target.value })}
                    placeholder={`${isTable ? "Table" : "Group"} instruction for AI extraction...`}
                    style={{
                        flex: 1, border: "none", background: "transparent",
                        fontFamily: "inherit", fontSize: 12, color: "#6B7280",
                        outline: "none", fontStyle: "italic",
                    }}
                />
            </div>

            {/* Fields */}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropIntoGroup(e, group.id)}
                style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4, minHeight: 48 }}
            >
                {group.fields.length === 0 ? (
                    <div style={{
                        border: `0.5px dashed ${isActiveTarget ? "#818CF8" : "#D1D5DB"}`,
                        borderRadius: 6, padding: "10px 12px",
                        textAlign: "center", fontSize: 11,
                        color: isActiveTarget ? "#6D28D9" : "#9CA3AF",
                        background: isActiveTarget ? "#F5F3FF" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all .15s",
                    }}>
                        <Icon d="M12 5v14M5 12h14" size={11} />
                        Drop fields here or add below
                    </div>
                ) : (
                    group.fields.map((field, i) => {
                        const isBeingDragged = dragState?.fieldKey === field.key && dragState?.sourceGroupId === group.id;
                        return (
                            <FieldRow
                                key={field.key}
                                field={field}
                                groupId={group.id}
                                index={i}
                                isSelected={selectedField?.groupId === group.id && selectedField?.fieldKey === field.key}
                                isDragging={isBeingDragged}
                                showIndicatorAbove={isActiveTarget && dropTarget?.index === i}
                                showIndicatorBelow={isActiveTarget && dropTarget?.index === group.fields.length && i === group.fields.length - 1}
                                onSelect={onSelectField}
                                onDelete={onDeleteField}
                                onDuplicate={onDuplicateField}
                                onDragStart={onDragStart}
                                onDragOver={onDragOver}
                                onDragEnd={onDragEnd}
                            />
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div style={{ padding: "7px 10px", borderTop: "0.5px solid #F3F4F6", background: "#F9FAFB" }}>
                <button
                    onMouseEnter={() => setAddHovered(true)}
                    onMouseLeave={() => setAddHovered(false)}
                    onClick={() => onAddField(group.id)}
                    style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "4px 8px", border: "none",
                        background: addHovered ? "#EEF2FF" : "transparent",
                        color: "#4F46E5", fontSize: 12, fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit", borderRadius: 4,
                        transition: "background .12s",
                    }}
                >
                    <Icon d="M12 5v14M5 12h14" size={11} /> Add field
                </button>
            </div>
        </div>
    );
}

// ── Field Editor ───────────────────────────────────────────────────────────────

function FieldEditor({
    field, groupId, onClose, onUpdate, onDelete,
}: {
    field: Field | null | undefined;
    groupId: string | undefined;
    onClose: () => void;
    onUpdate: (key: keyof Field, value: Field[keyof Field]) => void;
    onDelete: (groupId: string, fieldKey: string) => void;
}) {
    if (!field || !groupId) {
        return (
            <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                color: "#9CA3AF", textAlign: "center", padding: 24, gap: 10,
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .3 }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <p style={{ fontSize: 12 }}>Select a field to edit its properties</p>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "6px 8px",
        border: "0.5px solid #E5E7EB", borderRadius: 6,
        background: "#F9FAFB", color: "#111827",
        fontSize: 13, fontFamily: "inherit", outline: "none",
        boxSizing: "border-box",
    };

    const monoInputStyle: React.CSSProperties = {
        ...inputStyle, fontFamily: "monospace", fontSize: 11,
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 10, fontWeight: 500, textTransform: "uppercase",
        letterSpacing: ".07em", color: "#9CA3AF", marginBottom: 4, display: "block",
    };

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
                { label: "Label", key: "label" as keyof Field, mono: false },
                { label: "Field key", key: "key" as keyof Field, mono: true },
            ].map(({ label, key, mono }) => (
                <div key={String(key)}>
                    <label style={labelStyle}>{label}</label>
                    <input
                        type="text"
                        value={field[key] as string}
                        onChange={(e) => onUpdate(key, e.target.value)}
                        style={mono ? monoInputStyle : inputStyle}
                    />
                </div>
            ))}

            <div>
                <label style={labelStyle}>AI instruction</label>
                <textarea
                    value={field.instruction}
                    onChange={(e) => onUpdate("instruction", e.target.value)}
                    placeholder="Instructions for AI extraction..."
                    style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
                />
            </div>

            <div>
                <label style={labelStyle}>Regex pattern</label>
                <input
                    type="text"
                    value={field.regularExpression}
                    onChange={(e) => onUpdate("regularExpression", e.target.value)}
                    placeholder="e.g. ^PO-\d+"
                    style={monoInputStyle}
                />
            </div>

            <div style={{ height: "0.5px", background: "#F3F4F6" }} />

            <div>
                <div style={{ ...labelStyle, display: "block" }}>Options</div>
                {[
                    { label: "Required field", key: "required" as keyof Field },
                    { label: "Multiline (textarea)", key: "isTextarea" as keyof Field },
                    { label: "Hidden from output", key: "hidden" as keyof Field },
                    { label: "Exclude from extraction", key: "excludeExtraction" as keyof Field },
                ].map(({ label, key }) => (
                    <label key={String(key)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "5px 0" }}>
                        <input
                            type="checkbox"
                            checked={field[key] as boolean}
                            onChange={(e) => onUpdate(key, e.target.checked)}
                            style={{ width: 13, height: 13, accentColor: "#4F46E5", cursor: "pointer", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
                    </label>
                ))}
            </div>

            <div style={{ height: "0.5px", background: "#F3F4F6" }} />

            <DeleteButton onClick={() => { onDelete(groupId, field.key); onClose(); }}>
                <Icon d={["M3 6h18", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"]} size={12} />
                Remove field
            </DeleteButton>
        </div>
    );
}

function DeleteButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "7px 12px", width: "100%",
                border: "none", borderRadius: 6,
                background: hovered ? "#FEE2E2" : "#FEF2F2",
                color: "#DC2626", fontSize: 12, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "background .12s",
            }}
        >
            {children}
        </button>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function TemplateBuilder({ isCreate }: { isCreate?: boolean }) {
    const [groups, setGroups] = useState<Group[]>(initialGroups);
    const [templateName, setTemplateName] = useState("Purchase Order Extraction");
    const [settings, setSettings] = useState<Settings>({
        llmProvider: "gemini", llmModel: "gemini-2.5-flash",
        extractionLimit: 10, disableBoundingBox: false,
        alignmentCorrection: false, includeOcrTextForExtraction: false,
    });
    const [selectedField, setSelectedField] = useState<SelectedField | null>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const { toast, show: showToast } = useToast();

    const rightPanel = useResize(260, 190, 520, "left");

    // ── Helpers ──────────────────────────────────────────────────────────────────

    const updateGroups = (fn: (gs: Group[]) => Group[]) =>
        setGroups((prev) => fn(prev.map((g) => ({ ...g, fields: [...g.fields] }))));

    const addGroup = (type: GroupType) => {
        const id = `group_${Date.now()}`;
        updateGroups((gs) => [...gs, {
            id, name: type === "table" ? "New Table" : "New Group",
            type, instruction: "", fields: [],
        }]);
        showToast(`${type === "table" ? "Table" : "Basic"} group added`, "✅");
    };

    const deleteGroup = (id: string) => {
        if (!confirm("Delete this group and all its fields?")) return;
        updateGroups((gs) => gs.filter((g) => g.id !== id));
        if (selectedField?.groupId === id) setSelectedField(null);
        showToast("Group deleted", "🗑️");
    };

    const updateGroup = (id: string, changes: Partial<Group>) =>
        updateGroups((gs) => gs.map((g) => g.id === id ? { ...g, ...changes } : g));

    const addField = (groupId: string) => {
        const key = `field_${Date.now()}`;
        updateGroups((gs) => gs.map((g) =>
            g.id === groupId
                ? { ...g, fields: [...g.fields, { key, label: "New Field", instruction: "", excludeExtraction: false, hidden: false, isTextarea: false, required: false, regularExpression: "" }] }
                : g
        ));
        setSelectedField({ groupId, fieldKey: key });
        showToast("Field added", "✅");
    };

    const deleteField = (groupId: string, fieldKey: string) => {
        updateGroups((gs) => gs.map((g) =>
            g.id === groupId ? { ...g, fields: g.fields.filter((f) => f.key !== fieldKey) } : g
        ));
        if (selectedField?.groupId === groupId && selectedField?.fieldKey === fieldKey) setSelectedField(null);
    };

    const duplicateField = (groupId: string, fieldKey: string) => {
        updateGroups((gs) => gs.map((g) => {
            if (g.id !== groupId) return g;
            const fi = g.fields.findIndex((f) => f.key === fieldKey);
            if (fi === -1) return g;
            const copy = { ...g.fields[fi], key: `${fieldKey}_copy_${Date.now()}`, label: `${g.fields[fi].label} (Copy)` };
            const fields = [...g.fields];
            fields.splice(fi + 1, 0, copy);
            return { ...g, fields };
        }));
        showToast("Field duplicated", "✅");
    };

    const updateFieldProp = (key: keyof Field, value: Field[keyof Field]) => {
        if (!selectedField) return;
        updateGroups((gs) => gs.map((g) => {
            if (g.id !== selectedField.groupId) return g;
            return {
                ...g,
                fields: g.fields.map((f) => {
                    if (f.key !== selectedField.fieldKey) return f;
                    if (key === "key") setSelectedField((s) => s ? { ...s, fieldKey: value as string } : s);
                    return { ...f, [key]: value };
                }),
            };
        }));
    };

    // ── Drag & Drop ──────────────────────────────────────────────────────────────

    const onDragStart = useCallback((e: DragEvent<HTMLDivElement>, sourceGroupId: string, sourceIndex: number, fieldKey: string) => {
        setDragState({ sourceGroupId, sourceIndex, fieldKey });
        e.dataTransfer.effectAllowed = "move";
        const ghost = document.createElement("div");
        ghost.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        requestAnimationFrame(() => document.body.removeChild(ghost));
    }, []);

    const onDragOver = useCallback((e: DragEvent<HTMLDivElement>, groupId: string, index: number) => {
        e.preventDefault();
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const insertIndex = e.clientY < rect.top + rect.height / 2 ? index : index + 1;
        setDropTarget((prev) =>
            prev?.groupId === groupId && prev?.index === insertIndex ? prev : { groupId, index: insertIndex }
        );
    }, []);

    const onDragEnd = useCallback(() => {
        setDragState(null);
        setDropTarget(null);
    }, []);

    const commitDrop = useCallback((targetGroupId: string, insertAt: number) => {
        if (!dragState) return;
        const { sourceGroupId, sourceIndex } = dragState;
        setGroups((prev) => {
            const gs = prev.map((g) => ({ ...g, fields: [...g.fields] }));
            const src = gs.find((g) => g.id === sourceGroupId);
            const tgt = gs.find((g) => g.id === targetGroupId);
            if (!src || !tgt) return prev;
            const [field] = src.fields.splice(sourceIndex, 1);
            let idx = insertAt;
            if (sourceGroupId === targetGroupId && insertAt > sourceIndex) idx -= 1;
            idx = Math.max(0, Math.min(idx, tgt.fields.length));
            tgt.fields.splice(idx, 0, field);
            return gs;
        });
        if (selectedField?.fieldKey === dragState.fieldKey) {
            setSelectedField((s) => s ? { ...s, groupId: targetGroupId } : s);
        }
        setDragState(null);
        setDropTarget(null);
        showToast("Field moved", "↕️");
    }, [dragState, selectedField]);

    const onDropIntoGroup = useCallback((e: DragEvent<HTMLDivElement>, targetGroupId: string) => {
        e.preventDefault();
        if (!dragState) return;
        const idx = dropTarget?.groupId === targetGroupId ? dropTarget.index : Infinity;
        const tgtGroup = groups.find((g) => g.id === targetGroupId);
        commitDrop(targetGroupId, tgtGroup ? Math.min(idx, tgtGroup.fields.length) : 0);
    }, [dragState, dropTarget, groups, commitDrop]);

    // ── Export ───────────────────────────────────────────────────────────────────

    const exportJSON = () => {
        const fields: Record<string, Record<string, unknown>> = {};
        groups.forEach((g) => {
            const instrKey = g.type === "table" ? "table_instruction" : "group_instruction";
            fields[g.id] = { [instrKey]: g.instruction };
            g.fields.forEach(({ key, ...rest }) => { fields[g.id][key] = rest; });
        });
        const blob = new Blob([JSON.stringify({ name: templateName, settings, fields }, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "template.json"; a.click();
        URL.revokeObjectURL(url);
        showToast("JSON exported!", "📦");
    };

    const activeField = selectedField
        ? groups.find((g) => g.id === selectedField.groupId)?.fields.find((f) => f.key === selectedField.fieldKey)
        : null;

    const topBarButtons = [
        {
            label: "Settings",
            icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
            onClick: () => setShowSettings(true),
            primary: false,
        },
        {
            label: "Save",
            icon: ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z", "M17 21v-8H7v8", "M7 3v5h8"] as IconPath,
            onClick: () => showToast("Draft saved", "💾"),
            primary: false,
        },
        {
            label: "Export",
            icon: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"] as IconPath,
            onClick: exportJSON,
            primary: false,
        },
        {
            label: "Publish",
            icon: "M20 6L9 17l-4-4",
            onClick: () => showToast("Template published!", "🚀"),
            primary: true,
        },
    ];

    return (
        <div style={{
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            background: "#F5F6F8", color: "#111827",
            display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontSize: 13,
        }}>
            {/* Topbar */}
            <div style={{
                background: "white", borderBottom: "0.5px solid #E5E7EB",
                padding: "0 16px", height: 52,
                display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
            }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    <Icon d={["M3 3h18v18H3z", "M9 9h6", "M9 12h6", "M9 15h4"]} size={13} fill="none" stroke="white" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>Template Builder</span>
                <span style={{
                    background: "#EEF2FF", color: "#4338CA", fontSize: 10, fontWeight: 500,
                    padding: "2px 7px", borderRadius: 20, border: "0.5px solid #C7D2FE",
                }}>
                    beta
                </span>

                <input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Template name..."
                    style={{
                        flex: 1, maxWidth: 280, margin: "0 auto",
                        textAlign: "center", border: "0.5px solid transparent",
                        background: "transparent", color: "#111827",
                        padding: "5px 10px", borderRadius: 6, fontFamily: "inherit",
                        fontWeight: 500, fontSize: 13, outline: "none",
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#4F46E5";
                        e.currentTarget.style.background = "white";
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.background = "transparent";
                    }}
                />

                <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                    {topBarButtons.map(({ label, icon, onClick, primary }) => (
                        <TopBarButton key={label} icon={icon} onClick={onClick} primary={primary}>{label}</TopBarButton>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Canvas */}
                <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, marginBottom: 2 }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>Template fields</div>
                            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Drag fields to reorder or move between groups</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            {[
                                {
                                    type: "basic" as GroupType, label: "Basic group",
                                    style: { background: "#EEF2FF", color: "#4338CA", borderColor: "#C7D2FE" },
                                    icon: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"] as IconPath,
                                },
                                {
                                    type: "table" as GroupType, label: "Table group",
                                    style: { background: "#F5F3FF", color: "#6D28D9", borderColor: "#DDD6FE" },
                                    icon: ["M3 3h18v18H3z", "M3 9h18", "M3 15h18", "M9 3v18"] as IconPath,
                                },
                            ].map(({ type, label, style, icon }) => (
                                <button
                                    key={type}
                                    onClick={() => addGroup(type)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "4px 10px",
                                        border: `0.5px solid ${style.borderColor}`,
                                        background: style.background, color: style.color,
                                        borderRadius: 6, fontSize: 11, fontWeight: 500,
                                        cursor: "pointer", fontFamily: "inherit",
                                    }}
                                >
                                    <Icon d={icon} size={11} /> {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {groups.map((g) => (
                        <GroupCard
                            key={g.id}
                            group={g}
                            selectedField={selectedField}
                            dropTarget={dropTarget}
                            dragState={dragState}
                            onSelectField={(gId, fKey) => setSelectedField({ groupId: gId, fieldKey: fKey })}
                            onDeleteGroup={deleteGroup}
                            onUpdateGroup={updateGroup}
                            onAddField={addField}
                            onDeleteField={deleteField}
                            onDuplicateField={duplicateField}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDragEnd={onDragEnd}
                            onDropIntoGroup={onDropIntoGroup}
                        />
                    ))}

                    {groups.length === 0 && (
                        <div style={{
                            flex: 1, display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            padding: 48, color: "#9CA3AF", gap: 10, textAlign: "center",
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .3 }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M12 11v6M9 14h6" />
                            </svg>
                            <p style={{ fontSize: 12 }}>No groups yet — add a Basic or Table group above.</p>
                        </div>
                    )}
                </div>

                {/* Resize handle */}
                <ResizeHandle onMouseDown={rightPanel.onMouseDown} />

                {/* Right Panel */}
                <div style={{
                    flexShrink: 0, background: "white",
                    display: "flex", flexDirection: "column",
                    borderLeft: "0.5px solid #E5E7EB", overflow: "hidden",
                    width: rightPanel.width,
                }}>
                    <div style={{
                        padding: "10px 12px", borderBottom: "0.5px solid #F3F4F6",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexShrink: 0, background: "#F9FAFB",
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
                            <Icon d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} size={12} stroke="#6B7280" />
                            Field editor
                        </div>
                        {selectedField && (
                            <button
                                onClick={() => setSelectedField(null)}
                                style={{
                                    width: 22, height: 22, border: "none", background: "transparent",
                                    borderRadius: 4, cursor: "pointer", display: "flex",
                                    alignItems: "center", justifyContent: "center", color: "#9CA3AF",
                                }}
                            >
                                <Icon d="M18 6L6 18M6 6l12 12" size={11} />
                            </button>
                        )}
                    </div>
                    <FieldEditor
                        field={activeField}
                        groupId={selectedField?.groupId}
                        onClose={() => setSelectedField(null)}
                        onUpdate={updateFieldProp}
                        onDelete={deleteField}
                    />
                </div>
            </div>

            {showSettings && (
                <SettingsDialog
                    settings={settings}
                    onUpdate={(c) => setSettings((s) => ({ ...s, ...c }))}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {toast && (
                <div style={{
                    position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
                    background: "#1E1B4B", color: "#C7D2FE",
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 7,
                    zIndex: 9999, whiteSpace: "nowrap",
                    animation: "fadeInToast .18s ease",
                }}>
                    <span style={{ fontSize: 13 }}>{toast.icon}</span> {toast.msg}
                </div>
            )}

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
        @keyframes fadeInToast {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
        </div>
    );
}

// ── TopBarButton ───────────────────────────────────────────────────────────────

function TopBarButton({
    children, icon, onClick, primary,
}: {
    children: React.ReactNode;
    icon: IconPath;
    onClick: () => void;
    primary?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 6,
                border: primary ? "none" : "0.5px solid #E5E7EB",
                background: primary
                    ? (hovered ? "#4338CA" : "#4F46E5")
                    : (hovered ? "#F9FAFB" : "transparent"),
                color: primary ? "white" : "#374151",
                fontSize: 12, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "background .12s, border-color .12s",
                whiteSpace: "nowrap",
            }}
        >
            <Icon d={icon} size={12} stroke={primary ? "white" : "currentColor"} />
            {children}
        </button>
    );
}