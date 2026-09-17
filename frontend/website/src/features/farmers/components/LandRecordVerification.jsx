import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileSearch,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function MatchRow({ id, label, submitted, record, isChecked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`grid grid-cols-1 gap-2 border-b py-3.5 px-3 last:border-0 sm:grid-cols-4 sm:items-center cursor-pointer transition-colors rounded-md ${isChecked ? "bg-emerald-50/70 border-emerald-100" : "hover:bg-muted/40"
        }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`check-${id}`}
          checked={isChecked}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
        />
        <label
          htmlFor={`check-${id}`}
          className="text-sm font-medium cursor-pointer text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </label>
      </div>

      <div className="text-sm text-slate-700">
        <span className="text-xs text-muted-foreground block sm:hidden font-normal">
          Submitted:
        </span>
        <span className="font-semibold">{submitted}</span>
      </div>

      <div className="text-sm text-slate-600">
        <span className="text-xs text-muted-foreground block sm:hidden font-normal">
          Land Record:
        </span>
        {record || "Not available"}
      </div>

      <div className="sm:text-right">
        {isChecked ? (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Verified Match
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-500 border-slate-300 font-normal">
            Pending Check
          </Badge>
        )}
      </div>
    </div>
  );
}

function LandRecordVerification({ farm, onVerify, onReject }) {
  const landRecord = {
    surveyNumber: farm.surveyNumber,
    ownerName: farm.farmerName,
    village: farm.village,
    area: `${farm.area} acres`,
  };

  const [checkedFields, setCheckedFields] = useState({
    surveyNumber: false,
    ownerName: false,
    village: false,
    area: false,
  });

  const toggleField = (field) => {
    setCheckedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const checkedCount = Object.values(checkedFields).filter(Boolean).length;
  const allChecked = checkedCount === 4;

  const handleToggleAll = () => {
    const nextState = !allChecked;
    setCheckedFields({
      surveyNumber: nextState,
      ownerName: nextState,
      village: nextState,
      area: nextState,
    });
  };

  return (
    <Card className="shadow-xs border-slate-200">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">
              Land Record Verification
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Cross-check the submitted farm details with the official land record using the manual checkboxes.
            </p>
          </div>

          <Badge variant="outline" className="self-start sm:self-auto border-amber-300 bg-amber-50 text-amber-800">
            <FileSearch className="mr-1 h-3.5 w-3.5 text-amber-600" />
            Manual Verification
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Survey number header */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Survey Number Submitted by Farmer
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {farm.surveyNumber}
          </p>
        </div>

        {/* External record table */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900">
                Land Record Verification Checklist
              </h3>
              <p className="text-xs text-muted-foreground">
                Tick each checkbox as you verify each field against the official record.
              </p>
            </div>

            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
              <a
                href="https://anyror.gujarat.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Open Land Record
              </a>
            </Button>
          </div>

          <div className="rounded-lg border border-slate-200 px-3 py-2 bg-white">
            <div className="hidden border-b pb-2 pt-1 text-xs font-semibold text-slate-500 sm:grid sm:grid-cols-4 px-3">
              <span>Field Name</span>
              <span>Submitted Value</span>
              <span>Official Land Record</span>
              <span className="text-right">Verification Status</span>
            </div>

            <MatchRow
              id="surveyNumber"
              label="Survey Number"
              submitted={farm.surveyNumber}
              record={landRecord.surveyNumber}
              isChecked={checkedFields.surveyNumber}
              onToggle={() => toggleField("surveyNumber")}
            />

            <MatchRow
              id="ownerName"
              label="Owner Name"
              submitted={farm.farmerName}
              record={landRecord.ownerName}
              isChecked={checkedFields.ownerName}
              onToggle={() => toggleField("ownerName")}
            />

            <MatchRow
              id="village"
              label="Village"
              submitted={farm.village}
              record={landRecord.village}
              isChecked={checkedFields.village}
              onToggle={() => toggleField("village")}
            />

            <MatchRow
              id="area"
              label="Area"
              submitted={`${farm.area} acres`}
              record={landRecord.area}
              isChecked={checkedFields.area}
              onToggle={() => toggleField("area")}
            />
          </div>
        </div>

        {/* Verification note & progress */}
        <div className="mt-6 rounded-lg border border-slate-200 p-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Verification Checklist ({checkedCount}/4 Checked)
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
              onClick={handleToggleAll}
            >
              {allChecked ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <ul className="mt-3 space-y-1.5 text-xs">
            <li className={`flex items-center gap-2 ${checkedFields.surveyNumber ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              <span>{checkedFields.surveyNumber ? "✓" : "○"}</span> Survey number verified
            </li>
            <li className={`flex items-center gap-2 ${checkedFields.ownerName ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              <span>{checkedFields.ownerName ? "✓" : "○"}</span> Owner name verified
            </li>
            <li className={`flex items-center gap-2 ${checkedFields.village ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              <span>{checkedFields.village ? "✓" : "○"}</span> Village verified
            </li>
            <li className={`flex items-center gap-2 ${checkedFields.area ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              <span>{checkedFields.area ? "✓" : "○"}</span> Recorded area verified
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onReject}
            className="text-sm text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
          >
            Reject this farm instead
          </button>

          <Button
            onClick={onVerify}
            className={allChecked
              ? "bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              : "px-8"}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verify Farm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LandRecordVerification;