import { Workbook } from "exceljs";
import { PopulatedEvent } from "@/types/event";

export default async function generateVendorSheet(workbook: Workbook, event: PopulatedEvent) {
    const sheet = workbook.addWorksheet("Vendor List");

    sheet.columns = [
        { header: "Vendor Name", key: "name" },
        { header: "Category", key: "category" },
        { header: "Contact", key: "contact" },
        { header: "Total Cost", key: "cost", style: { numFmt: '"$"#,##0.00' } },
        { header: "Paid", key: "paid", style: { numFmt: '"$"#,##0.00' } },
        { header: "Balance", key: "balance", style: { numFmt: '"$"#,##0.00' } },
    ];

    sheet.mergeCells("A1:F1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Vendors List for ${event.title}`;
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } };

    const headerRow = sheet.getRow(2);
    headerRow.values = ["Vendor Name", "Category", "Contact", "Total Cost", "Paid", "Balance"];
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F4F5" } };
    headerRow.alignment = { horizontal: "center" };

    const vendorsMap = new Map();

    event.payments.forEach((p) => {
        if (p.type === "Vendor" && p.vendor) {
            const vendor = p.vendor;
            const vendorId = vendor.id;

            if (!vendorsMap.has(vendorId)) {
                vendorsMap.set(vendorId, {
                    name: vendor.globalVendor?.name || "Unknown",
                    category: vendor.globalVendor?.category || "-",
                    contact: vendor.globalVendor?.contact || "-",
                    totalCost: vendor.cost || 0,
                    totalPaid: 0,
                });
            }

            vendorsMap.get(vendorId).totalPaid += p.amount || 0;
        }
    });

    // Add rows to the sheet
    vendorsMap.forEach((v) => {
        const balance = v.totalCost - v.totalPaid;
        const row = sheet.addRow({
            name: v.name,
            category: v.category,
            contact: v.contact,
            cost: v.totalCost,
            paid: v.totalPaid,
            balance: balance,
        });

        if (balance > 0) row.getCell("balance").font = { color: { argb: "FFFF0000" } };
    });

    sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];

    sheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell!({ includeEmpty: true }, (cell) => {
            if (Number(cell.row) === 1) return;
            const columnLength = cell.value ? cell.value.toString().length : 12;
            if (columnLength > maxLength) maxLength = columnLength;
        });

        col.width = maxLength < 14 ? 14 : maxLength + 3;
    });

    // Auto-filter for easy sorting
    sheet.autoFilter = "A1:F1";
}
