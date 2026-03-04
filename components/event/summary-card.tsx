import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface CardProp {
    overdueVendors: number;
    pendingTasks: number;
}

export default function SummaryCard({ overdueVendors, pendingTasks }: CardProp) {
    return (
        <Card className="gap-2">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Ops Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm font-bold text-zinc-500">
                <div className="flex justify-between border-b border-zinc-200/50 pb-2">
                    <span className="font-medium">Overdue Payments</span>
                    <span className="text-red-500">{overdueVendors} Payments</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Pending Tasks</span>
                    <span>{pendingTasks} Remaining</span>
                </div>
            </CardContent>
        </Card>
    );
}
