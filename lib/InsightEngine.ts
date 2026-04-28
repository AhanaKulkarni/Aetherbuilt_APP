import { Machine, Order, Shipment } from './db';

export interface Insight {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'INFO';
  title: string;
  description: string;
  actionLabel?: string;
  actionCommand?: string;
}

export function generateInsights(orders: Order[], machines: Machine[], shipments: Shipment[]): Insight[] {
  const insights: Insight[] = [];

  // 1. Capacity Warning
  const machinesDown = machines.filter(m => m.status === 'Down');
  if (machinesDown.length > 0) {
    const downCount = machinesDown.length;
    const totalCount = machines.length;
    const pct = Math.round((downCount / totalCount) * 100);
    
    if (pct >= 25) {
      insights.push({
        id: 'cap_alert',
        type: 'CRITICAL',
        title: 'Critical Capacity Risk',
        description: `${downCount} machines are currently down (${pct}% of fleet). Production throughput will drop by approx ${pct}%.`,
        actionLabel: 'VIEW MACHINES',
        actionCommand: 'show machines'
      });
    }
  }

  // 2. Delivery Risks
  const today = new Date();
  const riskyOrders = orders.filter(o => {
    if (o.status === 'COMPLETED') return false;
    const deadline = new Date(o.deadline);
    const diffDays = (deadline.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diffDays < 3 && o.progress < 80;
  });

  if (riskyOrders.length > 0) {
    insights.push({
      id: 'delivery_risk',
      type: 'WARNING',
      title: 'Delivery At Risk',
      description: `${riskyOrders.length} orders are due within 72 hours with incomplete progress.`,
      actionLabel: 'PRIORITIZE',
      actionCommand: 'show delayed orders'
    });
  }

  // 3. Procurement Opportunity
  const pendingShipments = shipments.filter(s => s.status === 'Delayed');
  if (pendingShipments.length > 0) {
    insights.push({
      id: 'logistics_bottleneck',
      type: 'INFO',
      title: 'Logistics Bottleneck',
      description: `Carrier delays detected for ${pendingShipments.length} shipments. Consider switching to alternate carriers.`,
      actionLabel: 'CHECK SHIPMENTS',
      actionCommand: 'show shipments'
    });
  }

  return insights;
}
