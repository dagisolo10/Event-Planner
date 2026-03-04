import { Progress } from "../ui/progress";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { badgeColor, progressBarColor } from "@/mocks/status-colors";

interface BudgetTrackerProps {
    utilizationPercentage: number;
    remainingBudget: number;
    isOverBudget: boolean;
}

const formatUSD = (val: number) => val.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function BudgetTracker({ utilizationPercentage, remainingBudget, isOverBudget }: BudgetTrackerProps) {
    const badge = isOverBudget ? "Over Budget" : utilizationPercentage <= 70 ? "Safe" : utilizationPercentage <= 90 ? "At Risk" : "Critical";

    return (
        <Card>
            <CardContent>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="mb-1 leading-none font-medium">Budget Utilization</p>
                        <p className="text-sm text-zinc-500">{isOverBudget ? `You are ${formatUSD(Math.abs(remainingBudget))} over budget` : `${formatUSD(remainingBudget)} available remaining`}</p>
                    </div>
                    <span className={`text-sm font-bold ${isOverBudget ? "text-destructive" : ""}`}>{utilizationPercentage.toFixed(1)}%</span>
                </div>

                <Progress value={utilizationPercentage} className={progressBarColor(isOverBudget, utilizationPercentage)} />

                <Badge className={`mt-2 ${badgeColor(isOverBudget, utilizationPercentage)}`}>{badge}</Badge>
            </CardContent>
        </Card>
    );
}
