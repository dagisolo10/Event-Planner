"use client";
import { Globe, Mail, MoreHorizontal, Search, ExternalLink, MailPlus } from "lucide-react";
import { useState, useMemo, Dispatch, SetStateAction, Fragment } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { UpdateGlobalVendor } from "./global-vendor-update";
import LinkGlobalVendorToEvent from "./global-vendor-to-event-link";
import PaginatedTable from "../common/paginated-table";
import { Label } from "../ui/label";
import EmptyState from "../common/empty-state";
import { Event, GlobalVendor } from "@prisma/client";
import { PopulatedEventVendor } from "@/types/vendor";
import UniversalDeleteDialog from "../common/universal-alert-dialog";
import TableWrapper from "../others/table-border-wrapper";

type VendorSortKey = "Name Ascending" | "Name Descending" | "Category" | "Recently Added";

interface GlobalVendorProp {
    events: Event[];
    globalVendors: GlobalVendor[];
    eventVendors: PopulatedEventVendor[];
}

export default function GlobalVendorsTable({ globalVendors, events, eventVendors }: GlobalVendorProp) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<VendorSortKey>("Name Ascending");

    const [editingVendor, setEditingVendor] = useState<GlobalVendor | null>(null);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [vendorToAddToEvent, setVendorToAddToEvent] = useState<GlobalVendor | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredVendors = globalVendors.filter((v) => v.name.toLowerCase().includes(query.toLowerCase()) || v.category.toLowerCase().includes(query.toLowerCase()) || (v.contact && v.contact.toLowerCase().includes(query.toLowerCase())));

    const displayVendors = useMemo(() => {
        return [...filteredVendors].sort((a, b) => {
            switch (sortBy) {
                case "Name Ascending":
                    return a.name.localeCompare(b.name);
                case "Name Descending":
                    return b.name.localeCompare(a.name);
                case "Category":
                    return a.category.localeCompare(b.category);
                case "Recently Added":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });
    }, [filteredVendors, sortBy]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedVendors(filteredVendors.map((v) => v.id));
        else setSelectedVendors([]);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.currentTarget.value);
        setCurrentPage(1);
    };

    const handleSortChange = (val: VendorSortKey) => {
        setSortBy(val);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setQuery("");
        setSortBy("Name Ascending");
    };

    const perPage = 5;
    const startIndex = (currentPage - 1) * perPage;
    const totalPages = Math.ceil(displayVendors.length / perPage);
    const paginatedVendors = displayVendors.slice(startIndex, startIndex + perPage);

    const sortOptions = [
        {
            group: "Name",
            items: [
                { method: "Name Ascending", label: "Name: A to Z" },
                { method: "Name Descending", label: "Name: Z to A" },
            ],
        },
        {
            group: "Bottom",
            items: [
                { method: "Category", label: "Category" },
                { method: "Recently Added", label: "Recently Added" },
            ],
        },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="group relative max-w-sm flex-1">
                        <Label htmlFor="query">
                            <Search className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 transition-colors" />
                        </Label>
                        <Input value={query} onChange={handleQueryChange} id="query" placeholder="Search vendors, categories, or contacts..." className="border-input/80 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-full pr-4 pl-11" />
                    </div>

                    {selectedVendors.length > 0 && (
                        <Badge variant="ghost" className="h-11">
                            {selectedVendors.length} Selected
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {query && (
                        <Button variant="secondary" size="lg" onClick={clearFilters} className="text-muted-foreground hover:text-destructive rounded-full tracking-wide">
                            Reset
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="lg" className="border-muted-foreground/20 bg-background/50 hover:bg-accent/5 hover:text-primary rounded-full px-5 tracking-tight transition-all">
                                <span className="text-muted-foreground font-medium">Sort By:</span>
                                {sortBy}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56">
                            {sortOptions.map((item, index) => (
                                <Fragment key={item.group}>
                                    {item.items.map((subItem) => (
                                        <DropdownMenuItem onClick={() => handleSortChange(subItem.method as VendorSortKey)} className="flex items-center justify-between" key={subItem.method}>
                                            {subItem.label}
                                            {sortBy === subItem.method && <div className="bg-primary size-2 rounded-full" />}
                                        </DropdownMenuItem>
                                    ))}
                                    {index < sortOptions.length - 1 && <DropdownMenuSeparator />}
                                </Fragment>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <TableWrapper>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="font-bold hover:bg-transparent">
                            <TableHead className="w-12 text-center">
                                <Checkbox checked={selectedVendors.length === displayVendors.length && displayVendors.length > 0} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                            </TableHead>
                            <TableHead>Vendor Information</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Identity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {globalVendors.length === 0 ? (
                            <EmptyState type="globalVendor" colSpan={5} />
                        ) : displayVendors.length === 0 ? (
                            <EmptyState type="globalVendor" colSpan={6} isSearching onClearFilters={clearFilters} />
                        ) : (
                            paginatedVendors.map((vendor) => (
                                <TableRow
                                    onDoubleClick={() => setSelectedVendors((prev) => (prev.includes(vendor.id) ? prev.filter((id) => id !== vendor.id) : [...prev, vendor.id]))}
                                    key={vendor.id}
                                    className={`font-medium ${selectedVendors.includes(vendor.id) ? "bg-accent dark:bg-accent/50" : ""}`}
                                >
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={selectedVendors.includes(vendor.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedVendors((prev) => (checked ? [...prev, vendor.id] : prev.filter((id) => id !== vendor.id)));
                                            }}
                                            className="border-zinc-400 transition-transform active:scale-90 dark:border-zinc-600"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{vendor.name}</span>
                                            <span className="text-xs text-zinc-500">{vendor.email || "No email available"}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge className="text-primary bg-primary/20 dark:border-primary dark:bg-transparent">{vendor.category}</Badge>
                                    </TableCell>

                                    <TableCell>{vendor.contact || <span className="text-muted-foreground">Not Provided</span>}</TableCell>

                                    <TableCell className="pr-6 text-right">
                                        <ActionDropdown setOpen={setOpen} globalVendor={vendor} setVendorToAddToEvent={setVendorToAddToEvent} setEditingVendor={setEditingVendor} selectedVendors={selectedVendors} setSelectedVendors={setSelectedVendors} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="border-t">
                        <PaginatedTable currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
                    </div>
                )}
            </TableWrapper>

            {editingVendor && <UpdateGlobalVendor globalVendor={editingVendor} open={!!editingVendor} setOpen={(open) => !open && setEditingVendor(null)} />}
            {open && <LinkGlobalVendorToEvent events={events} eventVendors={eventVendors} globalVendor={vendorToAddToEvent} open={open} setOpen={setOpen} />}
        </div>
    );
}

interface DropdownProp {
    globalVendor: GlobalVendor;
    setVendorToAddToEvent: Dispatch<SetStateAction<GlobalVendor | null>>;
    selectedVendors: string[];
    setOpen: (val: boolean) => void;
    setEditingVendor: Dispatch<SetStateAction<GlobalVendor | null>>;
    setSelectedVendors: Dispatch<SetStateAction<string[]>>;
}

function ActionDropdown({ setOpen, globalVendor, setVendorToAddToEvent, setEditingVendor, selectedVendors, setSelectedVendors }: DropdownProp) {
    const isSelected = selectedVendors.includes(globalVendor.id);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setSelectedVendors((prev) => (isSelected ? prev.filter((id) => id !== globalVendor.id) : [...prev, globalVendor.id]))}>{isSelected ? "Deselect Vendor" : "Select for Export"}</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => {
                        setOpen(true);
                        setVendorToAddToEvent(globalVendor);
                    }}
                >
                    <MailPlus className="size-4" /> Assign to Event
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setEditingVendor(globalVendor)}>Edit Vendor Details</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild disabled={!globalVendor.email}>
                    {globalVendor.email ? (
                        <Link target="_blank" href={`mailto:${globalVendor.email}`} className="flex items-center gap-2">
                            <Mail className="size-4" /> Email Vendor
                        </Link>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Mail className="size-4" /> No Email Found
                        </span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem asChild disabled={!globalVendor.website}>
                    {globalVendor.website ? (
                        <Link target="_blank" href={globalVendor.website.startsWith("http") ? globalVendor.website : `https://${globalVendor.website}`} className="flex items-center gap-2">
                            <Globe className="size-4" /> Visit Website <ExternalLink className="size-3" />
                        </Link>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Globe className="size-4" /> No Website
                        </span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                {selectedVendors.length > 0 && <UniversalDeleteDialog type="bulk-vendor-unlink" id={selectedVendors} name={selectedVendors.length.toString()} onComplete={() => setSelectedVendors([])} />}
                <UniversalDeleteDialog type="global-vendor" id={globalVendor.id} name={globalVendor.name} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
