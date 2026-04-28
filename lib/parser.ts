import { Machine, Order, PurchaseOrder, Shipment, Vendor, RFQ } from './db';

export interface CommandResult {
  action: 'UPDATE_MACHINE' | 'UPDATE_ORDER' | 'UPDATE_SHIPMENT' | 'UPDATE_PO' | 'NAVIGATE' | 'TOAST' | 'RICH_DISPLAY' | 'ERROR';
  payload?: any;
  message: string;
}

interface ParserContext {
  orders: Order[];
  machines: Machine[];
  shipments: Shipment[];
  pos: PurchaseOrder[];
  vendors: Vendor[];
  rfqs: RFQ[];
}

const INTENTS = {
  NAVIGATE_ORDERS: ['order', 'orders', 'sale', 'sales', 'pipeline', 'production'],
  NAVIGATE_MACHINES: ['machine', 'machines', 'equipment', 'tool', 'cnc', 'lathe', 'milling'],
  NAVIGATE_SHIPMENTS: ['shipment', 'shipments', 'dispatch', 'outgoing', 'delivery', 'deliveries'],
  NAVIGATE_VENDORS: ['vendor', 'vendors', 'supplier', 'suppliers', 'seller'],
  NAVIGATE_PROCUREMENT: ['procure', 'procurement', 'purchase', 'po', 'buying', 'materials', 'rfq'],
  NAVIGATE_DASHBOARD: ['dash', 'dashboard', 'control', 'home', 'back'],
  QUERY_COUNT: ['how many', 'count', 'total', 'kitne', 'number of'],
  STATUS_UPDATE: ['mark', 'set', 'update', 'status', 'change', 'kharab', 'down', 'running', 'fixed', 'broken', 'done', 'started', 'completed'],
};

export function parseCommand(input: string, context: ParserContext): CommandResult {
  const text = input.toLowerCase().trim();

  // 1. Entity Extraction
  const orderIdMatch = text.match(/ord-\d+/);
  const machineIdMatch = text.match(/m-\d+/);
  const numericMatch = text.match(/\d+/);

  // 2. Resolve Intent
  let bestIntent = 'UNKNOWN';
  let maxScore = 0;

  for (const [intent, keywords] of Object.entries(INTENTS)) {
    let score = 0;
    keywords.forEach(kw => {
      if (text.includes(kw)) score++;
    });
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  // FORCE RICH DISPLAY FOR ALL INQUIRIES
  if (bestIntent !== 'UNKNOWN' && !text.includes('mark') && !text.includes('set') && !text.includes('running') && !text.includes('down') && !text.includes('dispatched') && !text.includes('completed')) {
    if (bestIntent === 'NAVIGATE_ORDERS') {
      return { 
        action: 'RICH_DISPLAY', 
        payload: { type: 'ORDERS_DASHBOARD', data: context.orders }, 
        message: `Fetched ${context.orders.length} active orders.` 
      };
    }
    if (bestIntent === 'NAVIGATE_MACHINES') {
      return { 
        action: 'RICH_DISPLAY', 
        payload: { type: 'MACHINES_DASHBOARD', data: context.machines }, 
        message: `Current machine status across the factory floor.` 
      };
    }
    if (bestIntent === 'NAVIGATE_VENDORS') {
      return { 
        action: 'RICH_DISPLAY', 
        payload: { type: 'VENDORS_DASHBOARD', data: context.vendors }, 
        message: "Vendor reliability and performance report." 
      };
    }
    if (bestIntent === 'NAVIGATE_PROCUREMENT') {
      return { 
        action: 'RICH_DISPLAY', 
        payload: { type: 'PROCUREMENT_DASHBOARD', data: { pos: context.pos, rfqs: context.rfqs } }, 
        message: "Procurement and sourcing overview." 
      };
    }
    if (bestIntent === 'NAVIGATE_SHIPMENTS') {
      return { 
        action: 'RICH_DISPLAY', 
        payload: { type: 'SHIPMENTS_DASHBOARD', data: context.shipments }, 
        message: "Active shipment tracking info." 
      };
    }
  }

  // Global Summary
  if (text === 'dashboard' || text === 'overview' || text === 'summary' || text === 'hi' || text === 'hello') {
    return { 
      action: 'RICH_DISPLAY', 
      payload: { type: 'GLOBAL_DASHBOARD', data: { orders: context.orders, machines: context.machines, shipments: context.shipments } }, 
      message: "AetherBuilt OS System Overview" 
    };
  }

  // Action Logic
  if (text.includes('down') || text.includes('kharab') || text.includes('broken')) {
    const num = numericMatch ? numericMatch[0] : null;
    const targetId = machineIdMatch ? machineIdMatch[0].toUpperCase() : num ? `M-${num.padStart(2, '0')}` : null;
    if (targetId) {
       return { action: 'UPDATE_MACHINE', payload: { id: targetId, updates: { status: 'Down' } }, message: `Machine ${targetId} marked as DOWN 🚨` };
    }
  }

  if (text.includes('running') || text.includes('fixed') || text.includes('up')) {
    const num = numericMatch ? numericMatch[0] : null;
    const targetId = machineIdMatch ? machineIdMatch[0].toUpperCase() : num ? `M-${num.padStart(2, '0')}` : null;
    if (targetId) {
       return { action: 'UPDATE_MACHINE', payload: { id: targetId, updates: { status: 'Running' } }, message: `Machine ${targetId} back online ✅` };
    }
  }

  if (text.includes('done') || text.includes('completed')) {
    const targetId = orderIdMatch ? orderIdMatch[0].toUpperCase() : numericMatch ? `ORD-${numericMatch[0]}` : null;
    if (targetId) {
      return { action: 'UPDATE_ORDER', payload: { id: targetId, updates: { status: 'COMPLETED', progress: 100 } }, message: `Order ${targetId} completed.` };
    }
  }

  // Help
  if (text.includes('help')) {
    return { action: 'TOAST', message: "Try: 'show orders', 'list machines', 'machine 2 is down', 'show procurement', or simply 'summary'." };
  }

  return { action: 'ERROR', message: "I'm not sure how to handle that. Try asking for 'help'." };
}
