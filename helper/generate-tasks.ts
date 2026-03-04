import getARGB from "./argb-generator";

import { Workbook } from "exceljs";
import { PopulatedTask } from "@/types/task";

export default async function generateTaskSheet(workbook: Workbook, tasks: PopulatedTask[]) {
    if (tasks.length === 0) return;

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Done").length;
    const percentage = total ? completed / total : 0;

    const sheet = workbook.addWorksheet("Task Report");

    sheet.columns = [
        { header: "Title", key: "title" },
        { header: "Description", key: "description" },
        { header: "Assigned To", key: "assignedTo" },
        { header: "Status", key: "status" },
        { header: "Due Date", key: "dueDate" },
        { header: "Priority", key: "priority" },
    ];

    sheet.mergeCells("A1:F1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Task List for ${tasks[0].event.title}`;
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } };

    const headerRow = sheet.getRow(2);
    headerRow.values = ["Title", "Description", "Assigned To", "Status", "Due Date", "Priority"];
    headerRow.font = { bold: true, size: 12 };
    headerRow.alignment = { horizontal: "center" };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F4F5" } };

    const statusStyles = { Done: { text: "#059669", bg: "#D1FAE5" }, Pending: { text: "#D97706", bg: "#FEF3C7" }, InProgress: { text: "#0284C7", bg: "#E0F2FE" }, Overdue: { text: "#E11D48", bg: "#FFE4E6" } };
    const priorityStyles = { Urgent: { bg: "#FFE4E6", text: "#E11D48" }, High: { bg: "#FFEDD5", text: "#EA580C" }, Medium: { bg: "#FEF9C3", text: "#CA8A04" }, Low: { bg: "#DBEAFE", text: "#2563EB" } };

    tasks.forEach((task) => {
        const row = sheet.addRow({
            title: task.title,
            description: task.description || "-",
            assignedTo: task.assignedTo || "-",
            status: task.status,
            dueDate: new Date(task.dueDate).toLocaleDateString(),
            priority: task.priority,
        });

        const statusEntry = statusStyles[task.status as keyof typeof statusStyles];
        row.getCell("status").fill = { type: "pattern", pattern: "solid", fgColor: { argb: getARGB(statusEntry.bg, 0.6) } };
        row.getCell("status").font = { color: { argb: getARGB(statusEntry.text, 1) } };
        row.getCell("status").alignment = { horizontal: "center" };

        const priorityEntry = priorityStyles[task.priority as keyof typeof priorityStyles];
        row.getCell("priority").fill = { type: "pattern", pattern: "solid", fgColor: { argb: getARGB(priorityEntry.bg, 0.6) } };
        row.getCell("priority").font = { color: { argb: getARGB(priorityEntry.text, 1) } };
        row.getCell("priority").alignment = { horizontal: "center" };

        row.getCell("dueDate").alignment = { horizontal: "center" };
    });

    sheet.addRow({});
    const stats = [
        { label: "Total Task Count", value: total, format: "0" },
        { label: "Completed Tasks Count", value: completed, format: "0" },
        { label: "Completion Percentage", value: percentage, format: "0.0%" },
    ];

    stats.forEach((stat) => {
        const row = sheet.addRow([stat.label, stat.value]);
        row.getCell(1).font = { bold: true };
        row.getCell(2).numFmt = stat.format;
        row.getCell(2).alignment = { horizontal: "left" };
    });

    sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];

    sheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell!({ includeEmpty: true }, (cell) => {
            if (Number(cell.row) === 1) return;

            const cellValue = cell.value ? cell.value.toString() : "";
            const colLength = cellValue.length;

            if (colLength > maxLength) maxLength = colLength;
        });

        col.width = maxLength < 12 ? 12 : maxLength + 2;
    });

    sheet.autoFilter = "A1:F1";
}
