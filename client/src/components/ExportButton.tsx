import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  exportHorsesToCSV,
  exportHealthRecordsToCSV,
  exportTrainingSessionsToCSV,
} from "../lib/utils/csv";

interface ExportButtonProps {
  type: 'horses' | 'health' | 'training' | 'all';
  data: any[];
  label?: string;
}

export function ExportButton({ type, data, label = "Export" }: ExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    switch (type) {
      case 'horses':
        exportHorsesToCSV(data);
        break;
      case 'health':
        exportHealthRecordsToCSV(data);
        break;
      case 'training':
        exportTrainingSessionsToCSV(data);
        break;
      case 'all':
        // Export all data types if available
        if (confirm('Export all data? This will create multiple CSV files.')) {
          exportHorsesToCSV(data);
        }
        break;
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

export function ExportMenu({ onExport }: { onExport: (type: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport('horses')}>
          Export Horses
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('health')}>
          Export Health Records
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('training')}>
          Export Training Sessions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('feeding')}>
          Export Feeding Plans
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('all')}>
          Export All Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
