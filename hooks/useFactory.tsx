import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialMachines, initialOrders, initialVendors, initialShipments, initialPOs, initialRFQs, Machine, Order, Vendor, Shipment, PurchaseOrder, RFQ, CommandHistoryItem } from '../lib/db';

interface FactoryContextType {
  orders: Order[];
  machines: Machine[];
  vendors: Vendor[];
  shipments: Shipment[];
  pos: PurchaseOrder[];
  rfqs: RFQ[];
  commandHistory: CommandHistoryItem[];
  demoMode: boolean;
  setOrders: (orders: Order[]) => void;
  setMachines: (machines: Machine[]) => void;
  setVendors: (vendors: Vendor[]) => void;
  setShipments: (shipments: Shipment[]) => void;
  setPOs: (pos: PurchaseOrder[]) => void;
  setRFQs: (rfqs: RFQ[]) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  updateShipment: (id: number, updates: Partial<Shipment>) => void;
  updatePO: (id: string, updates: Partial<PurchaseOrder>) => void;
  addCommandHistory: (item: Omit<CommandHistoryItem, 'id'>) => void;
  setDemoMode: (val: boolean) => void;
  loadData: () => Promise<void>;
  resetData: () => Promise<void>;
}

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [machines, setMachinesState] = useState<Machine[]>([]);
  const [vendors, setVendorsState] = useState<Vendor[]>([]);
  const [shipments, setShipmentsState] = useState<Shipment[]>([]);
  const [pos, setPOsState] = useState<PurchaseOrder[]>([]);
  const [rfqs, setRFQsState] = useState<RFQ[]>([]);
  const [commandHistory, setCommandHistoryState] = useState<CommandHistoryItem[]>([]);
  const [demoMode, setDemoModeState] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('factoryos_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.demoMode) {
          setDemoModeState(true);
        }
        setOrdersState(data.orders || initialOrders);
        setMachinesState(data.machines || initialMachines);
        setVendorsState(data.vendors || initialVendors);
        setShipmentsState(data.shipments || initialShipments);
        setPOsState(data.pos || initialPOs);
        setRFQsState(data.rfqs || initialRFQs);
        setCommandHistoryState(data.commandHistory || []);
      } else {
        await resetData(true);
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const saveData = async (data: any) => {
    if (demoMode) return; // Don't write to disk if in demo mode
    try {
      await AsyncStorage.setItem('factoryos_data', JSON.stringify({
        orders: data.orders || orders,
        machines: data.machines || machines,
        vendors: data.vendors || vendors,
        shipments: data.shipments || shipments,
        pos: data.pos || pos,
        rfqs: data.rfqs || rfqs,
        commandHistory: data.commandHistory || commandHistory,
        demoMode: data.demoMode !== undefined ? data.demoMode : demoMode
      }));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const setOrders = (o: Order[]) => { setOrdersState(o); saveData({ orders: o }); };
  const setMachines = (m: Machine[]) => { setMachinesState(m); saveData({ machines: m }); };
  const setVendors = (v: Vendor[]) => { setVendorsState(v); saveData({ vendors: v }); };
  const setShipments = (s: Shipment[]) => { setShipmentsState(s); saveData({ shipments: s }); };
  const setPOs = (p: PurchaseOrder[]) => { setPOsState(p); saveData({ pos: p }); };
  const setRFQs = (r: RFQ[]) => { setRFQsState(r); saveData({ rfqs: r }); };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => (o.id === id ? { ...o, ...updates } : o)));
  };

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    setMachines(machines.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const updateShipment = (id: number, updates: Partial<Shipment>) => {
    setShipments(shipments.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updatePO = (id: string, updates: Partial<PurchaseOrder>) => {
    setPOs(pos.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addCommandHistory = (item: Omit<CommandHistoryItem, 'id'>) => {
    const newItem: CommandHistoryItem = { ...item, id: Math.random().toString() };
    const newHistory = [newItem, ...commandHistory].slice(0, 50); // Keep last 50
    setCommandHistoryState(newHistory);
    saveData({ commandHistory: newHistory });
  };

  const setDemoMode = async (val: boolean) => {
    setDemoModeState(val);
    if (val) {
      // Revert to initial states
      setOrdersState(initialOrders);
      setMachinesState(initialMachines);
      setVendorsState(initialVendors);
      setShipmentsState(initialShipments);
      setPOsState(initialPOs);
      setRFQsState(initialRFQs);
    } else {
      // Might want to save right away so we remember we left demo mode
      await AsyncStorage.setItem('factoryos_data', JSON.stringify({
        orders, machines, vendors, shipments, pos, rfqs, commandHistory, demoMode: false
      }));
    }
  };

  const resetData = async (skipSave = false) => {
    setOrdersState(initialOrders);
    setMachinesState(initialMachines);
    setVendorsState(initialVendors);
    setShipmentsState(initialShipments);
    setPOsState(initialPOs);
    setRFQsState(initialRFQs);
    setCommandHistoryState([]);
    if (!skipSave) {
      await AsyncStorage.setItem('factoryos_data', JSON.stringify({
        orders: initialOrders, machines: initialMachines, vendors: initialVendors,
        shipments: initialShipments, pos: initialPOs, rfqs: initialRFQs,
        commandHistory: [], demoMode
      }));
    }
  };

  return (
    <FactoryContext.Provider value={{ 
      orders, machines, vendors, shipments, pos, rfqs, commandHistory, demoMode, 
      setOrders, setMachines, setVendors, setShipments, setPOs, setRFQs, 
      updateOrder, updateMachine, updateShipment, updatePO, addCommandHistory, 
      setDemoMode, loadData, resetData 
    }}>
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  const context = useContext(FactoryContext);
  if (!context) throw new Error('useFactory must be used within a FactoryProvider');
  return context;
}
