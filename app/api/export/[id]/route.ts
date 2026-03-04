import ExcelJS from "exceljs";
import getTasks from "@/server/tasks/get-tasks";
import { NextRequest, NextResponse } from "next/server";
import generateTaskSheet from "@/helper/generate-tasks";
import generateVendorSheet from "@/helper/generate-vendors";
import generatePaymentSheet from "@/helper/generate-payments";
import getPopulatedEvent from "@/server/events/get-populated-events";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const workbook = new ExcelJS.Workbook();

    const eventRes = await getPopulatedEvent(id);
    if ("error" in eventRes || !eventRes.event) return new NextResponse("Event not found", { status: 404 });

    const tasksRes = await getTasks(id);

    await generateTaskSheet(workbook, "error" in tasksRes ? [] : tasksRes.tasks);
    await generatePaymentSheet(workbook, eventRes.event);
    await generateVendorSheet(workbook, eventRes.event);

    const buffer = await workbook.xlsx.writeBuffer();
    const time = new Date().getTime().toString().slice(-5);

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            "Content-Disposition": `attachment; filename="EventReport_${time}.xlsx"`,
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
        },
    });
}
