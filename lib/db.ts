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

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
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

export interface Quotation {
  id: string;
  rfqId: string;
  vendorName: string;
  price: number;
  validUntil: string;
  terms: string;
  status: 'Draft' | 'Sent' | 'Accepted';
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
  { id: 'ORD-772', client: 'Tata Motors', product: 'Gearbox Housing', quantity: 500, progress: 65, status: 'IN PROGRESS', deadline: '2026-05-10', expectedDays: 14, delayed: false },
  { id: 'ORD-801', client: 'Reliance Ind', product: 'Polymer Valves', quantity: 1200, progress: 10, status: 'IN PROGRESS', deadline: '2026-05-01', expectedDays: 20, delayed: true },
  { id: 'ORD-905', client: 'Mahindra Tech', product: 'Axle Brackets', quantity: 250, progress: 0, status: 'NOT STARTED', deadline: '2026-05-15', expectedDays: 8, delayed: false },
];

export const initialMachines: Machine[] = [
  { id: 'M-01', name: 'CNC-X1', type: 'Milling', status: 'Running', lastService: '2026-03-01', nextService: '2026-06-01', downtimeHours: 12 },
  { id: 'M-02', name: 'CNC-X2', type: 'Milling', status: 'Down', lastService: '2026-02-15', nextService: '2026-05-15', downtimeHours: 48 },
  { id: 'M-03', name: 'L-SERIES', type: 'Lathe', status: 'Running', lastService: '2026-04-10', nextService: '2026-07-10', downtimeHours: 4 },
  { id: 'M-04', name: 'P-PRESS', type: 'Plasma', status: 'Maintenance', lastService: '2026-04-20', nextService: '2026-05-20', downtimeHours: 24 },
];

export const initialVendors: Vendor[] = [
  { id: 'V-001', name: 'Sharma Hardware', reliability: 94, material: 'Steel Rods', city: 'Pune', avgDeliveryDays: 3, priceTrend: 'stable' },
  { id: 'V-002', name: 'Gupta Alloys', reliability: 82, material: 'Aluminum Ingots', city: 'Bhopal', avgDeliveryDays: 7, priceTrend: 'rising' },
];

export const initialEmployees: Employee[] = [
  { id: 'EMP-X9K2M', name: 'Rahul Sharma', email: 'rahul.s@aetherbuilt.com', password: 'password123' },
];

export const initialShipments: Shipment[] = [
  { id: 1021, orderId: 772, client: 'Tata Motors', product: 'Gearbox Housing', qty: 200, dispatchDate: '2026-04-25', expectedDelivery: '2026-04-28', status: 'Dispatched', carrier: 'BlueDart', trackingNote: 'In Transit - Mumbai Hub' },
  { id: 1022, orderId: 801, client: 'Reliance Ind', product: 'Polymer Valves', qty: 600, dispatchDate: '2026-04-29', expectedDelivery: '2026-05-02', status: 'Pending', carrier: 'Delhivery', trackingNote: 'Awaiting Pickup' },
];

export const initialPOs: PurchaseOrder[] = [
  { id: 'PO-991', vendorName: 'Sharma Hardware', material: 'Steel Rods', qty: 1000, unitPrice: 450, status: 'Pending', orderDate: '2026-04-20' },
];

export const initialRFQs: RFQ[] = [
  { id: 'RFQ-001', material: 'Copper Wire', quantity: 500, status: 'Open', dueDate: '2026-05-05' },
];

export const initialQuotations: Quotation[] = [
  { id: 'QTN-101', rfqId: 'RFQ-001', vendorName: 'Ayush Metals', price: 150000, validUntil: '2026-05-15', terms: 'Payment on delivery', status: 'Draft' },
];
