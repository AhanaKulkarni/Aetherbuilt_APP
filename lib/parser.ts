import { Machine, Order, PurchaseOrder, Shipment } from './db';

export interface CommandResult {
  action: 'UPDATE_MACHINE' | 'UPDATE_ORDER' | 'UPDATE_SHIPMENT' | 'UPDATE_PO' | 'NAVIGATE' | 'TOAST' | 'ERROR';
  payload?: any;
  message: string;
}

interface ParserContext {
  orders: Order[];
  machines: Machine[];
  shipments: Shipment[];
  pos: PurchaseOrder[];
}

export function parseCommand(input: string, context: ParserContext): CommandResult {
  const text = input.toLowerCase().trim();

  // 1. shipment for [client] dispatched
  let match = text.match(/shipment for (.+) dispatched/);
  if (match) {
    const clientName = match[1].trim();
    const hit = context.shipments.find(s => s.client.toLowerCase() === clientName);
    if (hit) {
      return { action: 'UPDATE_SHIPMENT', payload: { id: hit.id, updates: { status: 'Dispatched' } }, message: `Shipment for ${hit.client} marked DISPATCHED.` };
    }
    return { action: 'ERROR', message: `No pending shipment found for client: ${clientName}` };
  }

  // 2. delivery from [vendor] received
  match = text.match(/delivery from (.+) received/);
  if (match) {
    const vendorName = match[1].trim();
    const hit = context.pos.find(p => p.vendorName.toLowerCase().includes(vendorName) && p.status === 'Pending');
    if (hit) {
      return { action: 'UPDATE_PO', payload: { id: hit.id, updates: { status: 'Delivered' } }, message: `Delivery from ${hit.vendorName} received (PO ${hit.id}).` };
    }
    return { action: 'ERROR', message: `No pending PO found for vendor: ${vendorName}` };
  }

  // 3. order [N] started
  match = text.match(/order (\d+) started/);
  if (match) {
    return { action: 'UPDATE_ORDER', payload: { id: match[1], updates: { status: 'IN PROGRESS', progress: 5 } }, message: `Order ${match[1]} STARTED.` };
  }

  // 4. machine [N] service done
  match = text.match(/machine (\d+) service done/);
  if (match) {
    const target = context.machines.find(m => m.id === match![1]);
    if (target) {
      const msDay = 1000 * 3600 * 24;
      const t = new Date();
      const last = t.toISOString().split('T')[0];
      const next = new Date(t.getTime() + 90 * msDay).toISOString().split('T')[0];
      return { action: 'UPDATE_MACHINE', payload: { id: match[1], updates: { lastService: last, nextService: next } }, message: `Machine ${match[1]} service logged. Next: ${next}.` };
    }
    return { action: 'ERROR', message: `Machine ${match[1]} not found.` };
  }

  // 5. add delay to order [N]
  match = text.match(/add delay to order (\d+)/);
  if (match) {
    return { action: 'UPDATE_ORDER', payload: { id: match[1], updates: { delayed: true } }, message: `Delay logged for Order ${match[1]}.` };
  }

  // 6. how many orders active
  if (text.includes('how many orders active') || text.includes('active orders count')) {
    const active = context.orders.filter(o => o.status !== 'COMPLETED').length;
    return { action: 'TOAST', message: `There are ${active} active orders currently.` };
  }

  // 7. show delayed orders
  if (text.includes('show delayed orders') || text.includes('delayed orders')) {
    return { action: 'NAVIGATE', payload: { route: '/orders', query: 'DELAYED' }, message: `Navigating to delayed orders...` };
  }

  // 8. rfq for [material]
  match = text.match(/rfq for (.+)/);
  if (match) {
    return { action: 'NAVIGATE', payload: { route: '/procurement', query: match[1] }, message: `Opening new RFQ for ${match[1]}...` };
  }

  // Legacy commands
  match = text.match(/machine (\d+) (stopped|down|broke)/);
  if (match) return { action: 'UPDATE_MACHINE', payload: { id: match[1], updates: { status: 'Down' } }, message: `Machine ${match[1]} marked as DOWN.` };

  match = text.match(/machine (\d+) (running|fixed)/);
  if (match) return { action: 'UPDATE_MACHINE', payload: { id: match[1], updates: { status: 'Running' } }, message: `Machine ${match[1]} marked as RUNNING.` };

  match = text.match(/order (\d+) (completed|done|finished)/);
  if (match) return { action: 'UPDATE_ORDER', payload: { id: match[1], updates: { status: 'COMPLETED', progress: 100 } }, message: `Order ${match[1]} marked as COMPLETED.` };

  match = text.match(/order (\d+) (\d{1,3})%/);
  if (match) return { action: 'UPDATE_ORDER', payload: { id: match[1], updates: { progress: parseInt(match[2], 10), status: parseInt(match[2], 10) === 100 ? 'COMPLETED' : 'IN PROGRESS' } }, message: `Order ${match[1]} progress set to ${match[2]}%.` };

  // Legacy navigations
  if (text.includes('active orders')) return { action: 'NAVIGATE', payload: { route: '/orders' }, message: `Navigating to Orders...` };
  if (text.includes('machines down')) return { action: 'NAVIGATE', payload: { route: '/machines' }, message: `Navigating to Machines...` };
  if (text.includes('show vendors') || text.includes('all vendors')) return { action: 'NAVIGATE', payload: { route: '/vendors' }, message: `Navigating to Vendors...` };
  if (text.includes('pending deliveries')) return { action: 'NAVIGATE', payload: { route: '/procurement' }, message: `Navigating to Procurement...` };
  if (text.includes('dashboard')) return { action: 'NAVIGATE', payload: { route: '/dashboard' }, message: `Navigating to Dashboard...` };

  return { action: 'ERROR', message: "Command not understood — try rephrasing." };
}
