import React from "react";

const CompletionBox = React.memo(function CompletionBox({ completion }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="font-medium">!Complete {completion}%</div>
        <div className="text-slate-500">
          Suggestion(s): Add Store Logo, Add Store Banner, Add Store Phone, Add Store Description
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded">
        <div className="h-2 rounded bg-teal-600" style={{ width: `${completion}%` }} />
      </div>
    </div>
  );
});

export default CompletionBox;
