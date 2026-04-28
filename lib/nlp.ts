// Simple NLP command parser for AetherBuilt OS

export type CommandIntent =
  | 'list_machines'
  | 'list_orders'
  | 'list_delayed'
  | 'list_vendors'
  | 'help'
  | 'unknown';

export interface CommandResult {
  success: boolean;
  intent: CommandIntent;
  message: string;
  data?: any;
}

const keywords: { patterns: RegExp[]; intent: CommandIntent; message: string }[] = [
  {
    patterns: [/machine/i, /equipment/i],
    intent: 'list_machines',
    message: 'Here are all machines in your factory. Tap any card to see full details.',
  },
  {
    patterns: [/order/i, /delivery/i, /client/i],
    intent: 'list_orders',
    message: 'Fetched active orders. Tap any order to update progress.',
  },
  {
    patterns: [/delay/i, /late/i, /overdue/i, /behind/i],
    intent: 'list_delayed',
    message: 'Showing all delayed orders. Consider reassigning machine time.',
  },
  {
    patterns: [/vendor/i, /supplier/i, /material/i],
    intent: 'list_vendors',
    message: 'Vendor list loaded. Reliability scores are updated weekly.',
  },
  {
    patterns: [/help/i, /what can/i, /command/i],
    intent: 'help',
    message:
      'Available commands: "show machines", "list orders", "delayed orders", "list vendors". You can also use natural language!',
  },
];

export function parseCommand(input: string): CommandResult {
  const trimmed = input.trim().toLowerCase();

  for (const { patterns, intent, message } of keywords) {
    if (patterns.some(p => p.test(trimmed))) {
      return { success: true, intent, message };
    }
  }

  return {
    success: false,
    intent: 'unknown',
    message: `I didn't understand "${input}". Try: "show machines", "list orders", or type "help".`,
  };
}
