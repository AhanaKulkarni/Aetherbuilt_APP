export type OrderStatus = 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED';
export type MachineStatus = 'Running' | 'Down' | 'Maintenance';

export interface Order {
  id: string;
  client: string;
  product: string;
  quantity: number;
  progress: number;
  status: OrderStatus;
  deadline: string;
  expectedDays: number;
  delayed: boolean;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: MachineStatus;
  lastService: string;
  nextService: string;
  downtimeHours: number;
}

export interface Vendor {
  id: string;
  name: string;
  reliability: number;
  material: string;
  city: string;
  avgDeliveryDays: number;
  priceTrend: 'stable' | 'rising';
}

export interface Shipment {
  id: number;
  orderId: number;
  client: string;
  product: string;
  qty: number;
  dispatchDate: string;
  expectedDelivery: string;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Delayed';
  carrier: string;
  trackingNote: string;
  delayReason?: string;
}

export interface PurchaseOrder {
  id: string;
  vendorName: string;
  material: string;
  qty: number;
  unitPrice: number;
  status: 'Pending' | 'Delivered';
  orderDate: string;
}

export interface RFQ {
  id: string;
  material: string;
  quantity: number;
  status: 'Open' | 'Closed';
  dueDate: string;
}

export interface CommandHistoryItem {
  id: string;
  timestamp: string;
  rawInput: string;
  success: boolean;
  message: string;
}

export const initialOrders: Order[] = [
  { id: '1', client: 'Tata Motors', product: 'Gear Shaft', quantity: 500, progress: 65, status: 'IN PROGRESS', deadline: '2026-05-01', expectedDays: 20, delayed: false },
  { id: '2', client: 'Bajaj Auto', product: 'Frame Bracket', quantity: 200, progress: 0, status: 'NOT STARTED', deadline: '2026-05-15', expectedDays: 14, delayed: false },
  { id: '3', client: 'Hero MotoCorp', product: 'Engine Mount', quantity: 350, progress: 100, status: 'COMPLETED', deadline: '2026-04-10', expectedDays: 10, delayed: false },
  { id: '4', client: 'Mahindra', product: 'Suspension Rod', quantity: 150, progress: 30, status: 'IN PROGRESS', deadline: '2026-04-20', expectedDays: 25, delayed: true },
];

export const initialMachines: Machine[] = [
  { id: '1', name: 'CNC Machine 1', type: 'Cutting', status: 'Running', lastService: '2026-01-10', nextService: '2026-07-10', downtimeHours: 12 },
  { id: '2', name: 'Lathe Machine 2', type: 'Shaping', status: 'Down', lastService: '2025-11-20', nextService: '2026-05-20', downtimeHours: 45 },
  { id: '3', name: 'Press Machine 3', type: 'Forming', status: 'Running', lastService: '2026-02-15', nextService: '2026-08-15', downtimeHours: 5 },
  { id: '4', name: 'Welding Unit 4', type: 'Assembly', status: 'Maintenance', lastService: '2025-12-05', nextService: '2026-04-15', downtimeHours: 20 },
];

export const initialVendors: Vendor[] = [
  { id: '1', name: 'Sharma Steel Works', material: 'Steel Sheets', city: 'Pune', reliability: 92, avgDeliveryDays: 4, priceTrend: 'stable' },
  { id: '2', name: 'Gupta Polymers', material: 'Plastic Pellets', city: 'Mumbai', reliability: 78, avgDeliveryDays: 7, priceTrend: 'rising' },
  { id: '3', name: 'Patel Fasteners', material: 'Nuts & Bolts', city: 'Ahmedabad', reliability: 96, avgDeliveryDays: 3, priceTrend: 'stable' },
];

export const initialShipments: Shipment[] = [
  { id: 1, orderId: 1, client: 'Tata Motors', product: 'Gear Shaft', qty: 500, dispatchDate: '2026-01-20', expectedDelivery: '2026-01-22', status: 'Dispatched', carrier: 'Delhivery', trackingNote: 'In transit' },
  { id: 2, orderId: 2, client: 'Bajaj Auto', product: 'Frame Bracket', qty: 200, dispatchDate: '-', expectedDelivery: '2026-02-05', status: 'Pending', carrier: 'Bluedart', trackingNote: 'Awaiting dispatch' },
  { id: 3, orderId: 3, client: 'Hero MotoCorp', product: 'Engine Mount', qty: 350, dispatchDate: '2026-01-14', expectedDelivery: '2026-01-16', status: 'Delivered', carrier: 'Gati', trackingNote: 'Delivered successfully' },
  { id: 4, orderId: 4, client: 'Mahindra', product: 'Suspension Rod', qty: 150, dispatchDate: '2026-01-10', expectedDelivery: '2026-01-15', status: 'Delayed', carrier: 'FedEx', trackingNote: 'Stuck at toll', delayReason: 'Carrier issue' },
];

export const initialPOs: PurchaseOrder[] = [
  { id: 'PO-1001', vendorName: 'Sharma Steel Works', material: 'Steel Sheets', qty: 1000, unitPrice: 250, status: 'Delivered', orderDate: '2026-01-05' },
  { id: 'PO-1002', vendorName: 'Gupta Polymers', material: 'Plastic Pellets', qty: 500, unitPrice: 120, status: 'Pending', orderDate: '2026-01-18' },
  { id: 'PO-1003', vendorName: 'Patel Fasteners', material: 'Nuts & Bolts', qty: 10000, unitPrice: 5, status: 'Pending', orderDate: '2026-01-19' },
];

export const initialRFQs: RFQ[] = [
  { id: 'RFQ-001', material: 'Aluminum Ingots', quantity: 2000, status: 'Open', dueDate: '2026-02-01' },
];
