import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function FarmerActivity({ farmer }) {
  const activity = farmer.activity ?? [];
  return (
    <Card className="border-slate-200/80 shadow-xs">

      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent>

        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          <div className="space-y-5">

            {activity.map((activity, index) => (
              <div
                key={index}
                className="flex gap-3"
              >

                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400" />

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    {activity.title}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {activity.description}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {activity.time}
                  </p>

                </div>

              </div>
            ))}

          </div>
        )}

      </CardContent>
    </Card>
  );
}

export default FarmerActivity;