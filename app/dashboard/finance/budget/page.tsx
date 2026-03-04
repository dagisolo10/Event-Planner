import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown, IconWallet, IconAlertTriangle } from "@tabler/icons-react";
import { formatUSD } from "@/helper/helper-functions";

export default function BudgetPage() {
    const budgetData = [
        { category: "Venue & Rentals", planned: 5000, actual: 4800, color: "[&>div]:bg-blue-500" },
        { category: "Catering", planned: 3500, actual: 4200, color: "[&>div]:bg-amber-500" },
        { category: "Entertainment", planned: 2000, actual: 1500, color: "[&>div]:bg-emerald-500" },
        { category: "Marketing", planned: 1200, actual: 400, color: "[&>div]:bg-purple-500" },
    ];

    const totalPlanned = budgetData.reduce((acc, curr) => acc + curr.planned, 0);
    const totalActual = budgetData.reduce((acc, curr) => acc + curr.actual, 0);
    const percentage = (totalActual / totalPlanned) * 100;

    return (
        <main className="space-y-8 p-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900">Budget Planning</h1>
                <p className="text-zinc-500">Compare your projected costs against actual vendor payments.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Total Planned</CardTitle>
                        <IconWallet className="size-5 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{formatUSD(totalPlanned)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Actual Spent</CardTitle>
                        <div className={totalActual > totalPlanned ? "text-emerald-600" : "text-rose-600"}>{totalActual > totalPlanned ? <IconTrendingUp /> : <IconTrendingDown />}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-2xl font-black">{formatUSD(totalActual)}</div>
                        <Progress className={totalActual > totalPlanned ? "[&>div]:bg-emerald-600" : "[&>div]:bg-rose-600"} value={percentage} />
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 text-zinc-400">
                        <CardTitle className="text-sm font-bold uppercase">Remaining Balance</CardTitle>
                        <IconTrendingDown className="size-5" />
                    </CardHeader>
                    <CardContent>
                        <div className="mb-2 text-2xl font-black text-white">{formatUSD(totalPlanned - totalActual)}</div>
                        <p className="text-sm text-zinc-400">Available to allocate</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Category Breakdown</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {budgetData.map((item) => {
                            const isOver = item.actual > item.planned;
                            const itemPercent = Math.min((item.actual / item.planned) * 100, 100);

                            return (
                                <div key={item.category} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900">{item.category}</span>
                                            {isOver && (
                                                <Badge variant="outline" className="text-ss flex gap-1 border-red-300 bg-red-100 text-red-500">
                                                    <IconAlertTriangle className="size-3" /> Over Budget
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium">
                                            <span className="font-bold text-zinc-900">{formatUSD(item.actual)}</span>
                                            <span className="text-zinc-500"> / {formatUSD(item.planned)}</span>
                                        </div>
                                    </div>
                                    <Progress value={itemPercent} className={`${isOver ? "[&>div]:bg-rose-500" : item.color} h-2`} />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
