import getARGB from "./argb-generator";

import { Workbook } from "exceljs";
import { PopulatedEvent } from "@/types/event";

export default async function generatePaymentSheet(workbook: Workbook, event: PopulatedEvent) {
    if (!event) return;

    const totalInbound = event.payments.filter((p) => p.type === "Client").reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutbound = event.payments.filter((p) => p.type === "Vendor").reduce((sum, p) => sum + (p.amount || 0), 0);

    const sheet = workbook.addWorksheet("Financial Report");

    sheet.columns = [
        { header: "Date", key: "date", width: 24 },
        { header: "Type", key: "type", width: 16 },
        { header: "Entity", key: "entity" },
        { header: "Description", key: "desc" },
        { header: "Amount", key: "amount", style: { numFmt: '"$"#,##0.00' } },
    ];

    sheet.mergeCells("A1:E1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Payment List for ${event.title}`;
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } };

    const headerRow = sheet.getRow(2);
    headerRow.values = ["Date", "Type", "Entity", "Description", "Amount"];
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F4F5" } };
    headerRow.alignment = { horizontal: "center" };

    event.payments.forEach((p) => {
        let entityName = "Client";
        if (p.type === "Vendor") entityName = p.vendor?.globalVendor?.name || "Unknown Vendor";
        else entityName = event.clientName;

        const row = sheet.addRow({
            date: p.dueDate ? new Date(p.dueDate).toDateString() : "-",
            type: p.type === "Client" ? "Income" : "Expense",
            entity: entityName,
            desc: p.description || "-",
            amount: p.amount || 0,
        });

        const typeCell = row.getCell("type");
        if (p.type === "Client") {
            typeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: getARGB("#D1FAE5", 0.6) } };
            typeCell.font = { color: { argb: getARGB("#059669", 1) } };
        } else {
            typeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: getARGB("#FFE4E6", 0.6) } };
            typeCell.font = { color: { argb: getARGB("#E11D48", 1) } };
        }
        typeCell.alignment = { horizontal: "center" };
    });

    sheet.addRow({});

    const totalRow = sheet.addRow({ date: "Total Collected (Client)", amount: totalInbound });
    totalRow.font = { bold: true, color: { argb: "FF059669" } };

    const payoutRow = sheet.addRow({ date: "Total Paid Out (Vendors)", amount: totalOutbound });
    payoutRow.font = { bold: true, color: { argb: "FFE11D48" } };

    const netMargin = totalInbound - totalOutbound;
    const marginColor = netMargin >= 0 ? "FFECFDF5" : "FFFEF2F2";
    const marginRow = sheet.addRow({ date: "Net Cash Position", amount: netMargin });
    for (let i = 1; i <= 5; i++) {
        const cell = marginRow.getCell(i);
        cell.font = { bold: true, size: 12 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: marginColor } };
        cell.border = { top: { style: "thin" }, bottom: { style: "double" } };
    }

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

    sheet.autoFilter = "A1:E1";
}
