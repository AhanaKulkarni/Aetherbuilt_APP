import { useFactory } from './useFactory';
import { parseCommand } from '../lib/parser';
import { useRouter } from 'expo-router';
import { useToast } from './useToast';
import * as Haptics from 'expo-haptics';

export function useCommand() {
  const { 
    orders, machines, shipments, pos, vendors, rfqs,
    updateOrder, updateMachine, updateShipment, updatePO, 
    addCommandHistory, commandHistory 
  } = useFactory();
  
  const router = useRouter();
  const { showToast } = useToast();

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    const context = { orders, machines, shipments, pos, vendors, rfqs };
    const result = parseCommand(cmd, context);

    // Prepare Result Data for Widget
    let widgetData = null;
    if (result.action === 'RICH_DISPLAY') {
      widgetData = result.payload;
    }

    // Log history (this adds a new record to useFactory's state)
    addCommandHistory({
      timestamp: new Date().toISOString(),
      rawInput: cmd,
      success: result.action !== 'ERROR',
      message: result.message,
      // We don't have 'role' in CommandHistoryItem yet, but we'll adapt useFactory's history state
    });

    if (result.action === 'ERROR') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(result.message, 'error');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Execute Actions
    switch (result.action) {
      case 'UPDATE_MACHINE':
        updateMachine(result.payload.id, result.payload.updates);
        break;
      case 'UPDATE_ORDER':
        updateOrder(result.payload.id, result.payload.updates);
        break;
      case 'NAVIGATE':
        router.push(result.payload.route as any);
        break;
    }

    // We return the processed result so the UI can use it immediately if needed
    return result;
  };

  return { executeCommand, history: commandHistory };
}
