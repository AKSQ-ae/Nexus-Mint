import { MousePointer2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCursor } from '@/contexts/CursorContext';

export function CursorToggle() {
  const { isEnabled, toggleCursor } = useCursor();

  return (
    <div className="flex items-center space-x-2">
      <MousePointer2 className="h-4 w-4" />
      <Label htmlFor="cursor-toggle" className="text-sm">
        Nexus Cursor
      </Label>
      <Switch
        id="cursor-toggle"
        checked={isEnabled}
        onCheckedChange={toggleCursor}
      />
    </div>
  );
}