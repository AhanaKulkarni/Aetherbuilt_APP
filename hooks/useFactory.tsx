import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialMachines, initialOrders, initialVendors, initialShipments, initialPOs, initialRFQs, initialQuotations, initialEmployees, Machine, Order, Vendor, Shipment, PurchaseOrder, RFQ, Quotation, CommandHistoryItem, Employee } from '../lib/db';
import { generateInsights, Insight } from '../lib/InsightEngine';
import { FactoryContextType } from './types';

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [machines, setMachinesState] = useState<Machine[]>([]);
  const [vendors, setVendorsState] = useState<Vendor[]>([]);
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [shipments, setShipmentsState] = useState<Shipment[]>([]);
  const [pos, setPOsState] = useState<PurchaseOrder[]>([]);
  const [rfqs, setRFQsState] = useState<RFQ[]>([]);
  const [quotations, setQuotationsState] = useState<Quotation[]>([]);
  const [commandHistory, setCommandHistoryState] = useState<CommandHistoryItem[]>([]);
  const [demoMode, setDemoModeState] = useState<boolean>(false);
  const [bypassAuth, setBypassAuth] = useState<boolean>(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    setInsights(generateInsights(orders, machines, shipments));
  }, [orders, machines, shipments]);

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
        setEmployeesState(data.employees || initialEmployees);
        setShipmentsState(data.shipments || initialShipments);
        setPOsState(data.pos || initialPOs);
        setRFQsState(data.rfqs || initialRFQs);
        setQuotationsState(data.quotations || initialQuotations);
        setCommandHistoryState(data.commandHistory || []);
        if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
      } else {
        await resetData(true);
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const saveData = async (data: any) => {
    try {
      const currentOrders = data.orders || orders;
      const currentMachines = data.machines || machines;
      const currentVendors = data.vendors || vendors;
      const currentEmployees = data.employees || employees;
      const currentShipments = data.shipments || shipments;
      const currentPOs = data.pos || pos;
      const currentRFQs = data.rfqs || rfqs;
      const currentQuotations = data.quotations || quotations;
      const currentHistory = data.commandHistory || commandHistory;
      
      await AsyncStorage.setItem('factoryos_data', JSON.stringify({
        orders: currentOrders,
        machines: currentMachines,
        vendors: currentVendors,
        employees: currentEmployees,
        shipments: currentShipments,
        pos: currentPOs,
        rfqs: currentRFQs,
        quotations: currentQuotations,
        commandHistory: currentHistory,
        demoMode: data.demoMode !== undefined ? data.demoMode : demoMode,
        isDarkMode: data.isDarkMode !== undefined ? data.isDarkMode : isDarkMode
      }));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const setOrders = (o: Order[]) => { setOrdersState(o); saveData({ orders: o }); };
  const setMachines = (m: Machine[]) => { setMachinesState(m); saveData({ machines: m }); };
  const setVendors = (v: Vendor[]) => { setVendorsState(v); saveData({ vendors: v }); };
  const setEmployees = (e: Employee[]) => { setEmployeesState(e); saveData({ employees: e }); };
  const setShipments = (s: Shipment[]) => { setShipmentsState(s); saveData({ shipments: s }); };
  const setPOs = (p: PurchaseOrder[]) => { setPOsState(p); saveData({ pos: p }); };
  const setRFQs = (r: RFQ[]) => { setRFQsState(r); saveData({ rfqs: r }); };
  const setQuotations = (q: Quotation[]) => { setQuotationsState(q); saveData({ quotations: q }); };

  const addOrder = (o: Omit<Order, 'id'>) => {
    const newOrder: Order = { ...o, id: 'ORD-' + Math.floor(Math.random() * 900 + 100) };
    setOrders([...orders, newOrder]);
  };

  const addMachine = (m: Omit<Machine, 'id'>) => {
    const newMachine: Machine = { ...m, id: 'M-' + Math.floor(Math.random() * 90 + 10).toString().padStart(2, '0') };
    setMachines([...machines, newMachine]);
  };

  const addVendor = (v: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = { ...v, id: 'V-' + Math.floor(Math.random() * 900 + 100).toString().padStart(3, '0') };
    setVendors([...vendors, newVendor]);
  };

  const addEmployee = (e: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { ...e, id: 'EMP-' + Math.random().toString(36).substring(2, 8).toUpperCase() };
    setEmployees([...employees, newEmployee]);
  };

  const addShipment = (s: Omit<Shipment, 'id'>) => {
    const newShipment: Shipment = { ...s, id: Math.floor(Math.random() * 9000 + 1000) };
    setShipments([...shipments, newShipment]);
  };

  const addPO = (p: Omit<PurchaseOrder, 'id'>) => {
    const newPO: PurchaseOrder = { ...p, id: 'PO-' + Math.floor(Math.random() * 900 + 100) };
    setPOs([...pos, newPO]);
  };

  const addRFQ = (r: Omit<RFQ, 'id'>) => {
    const rfqId = 'RFQ-' + Math.floor(Math.random() * 900 + 100).toString().padStart(3, '0');
    const newRFQ: RFQ = { ...r, id: rfqId };
    setRFQs([...rfqs, newRFQ]);
    
    // Auto-generate Draft Quotation
    const newQuotation: Quotation = {
      id: 'QTN-' + Math.floor(Math.random() * 900 + 100),
      rfqId: rfqId,
      vendorName: 'Awaiting Vendor',
      price: 0,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: 'Standard Terms',
      status: 'Draft'
    };
    setQuotations([...quotations, newQuotation]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const newOrders = orders.map(o => (o.id === id ? { ...o, ...updates } : o));
    setOrders(newOrders);
  };

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    const newMachines = machines.map(m => (m.id === id ? { ...m, ...updates } : m));
    setMachines(newMachines);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    const newEmployees = employees.map(e => (e.id === id ? { ...e, ...updates } : e));
    setEmployees(newEmployees);
  };

  const updateShipment = (id: number, updates: Partial<Shipment>) => {
    const newShipments = shipments.map(s => (s.id === id ? { ...s, ...updates } : s));
    setShipments(newShipments);
  };

  const updatePO = (id: string, updates: Partial<PurchaseOrder>) => {
    const newPOs = pos.map(p => (p.id === id ? { ...p, ...updates } : p));
    setPOs(newPOs);
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    const newQuotations = quotations.map(q => (q.id === id ? { ...q, ...updates } : q));
    setQuotations(newQuotations);
  };

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    saveData({ isDarkMode: newVal });
  };

  const addCommandHistory = (item: Omit<CommandHistoryItem, 'id'>) => {
    const newItem: CommandHistoryItem = { ...item, id: Math.random().toString() };
    const newHistory = [newItem, ...commandHistory].slice(0, 50); 
    setCommandHistoryState(newHistory);
    saveData({ commandHistory: newHistory });
  };

  const setDemoMode = async (val: boolean) => {
    setDemoModeState(val);
    if (val) {
      setOrdersState(initialOrders);
      setMachinesState(initialMachines);
      setVendorsState(initialVendors);
      setEmployeesState(initialEmployees);
      setShipmentsState(initialShipments);
      setPOsState(initialPOs);
      setRFQsState(initialRFQs);
      setQuotationsState(initialQuotations);
    } else {
      await AsyncStorage.setItem('factoryos_data', JSON.stringify({
        orders, machines, vendors, employees, shipments, pos, rfqs, quotations, commandHistory, demoMode: false
      }));
    }
  };

  const resetData = async (skipSave = false) => {
    setOrdersState(initialOrders);
    setMachinesState(initialMachines);
    setVendorsState(initialVendors);
    setEmployeesState(initialEmployees);
    setShipmentsState(initialShipments);
    setPOsState(initialPOs);
    setRFQsState(initialRFQs);
    setQuotationsState(initialQuotations);
    setCommandHistoryState([]);
    if (!skipSave) {
      await AsyncStorage.setItem('factoryos_data', JSON.stringify({
        orders: initialOrders, machines: initialMachines, vendors: initialVendors, employees: initialEmployees,
        shipments: initialShipments, pos: initialPOs, rfqs: initialRFQs, quotations: initialQuotations,
        commandHistory: [], demoMode, isDarkMode: false
      }));
    }
  };

  return (
    <FactoryContext.Provider value={{ 
      orders, machines, vendors, employees, shipments, pos, rfqs, quotations, commandHistory, demoMode, bypassAuth, isDarkMode,
      setOrders, setMachines, setVendors, setEmployees, setShipments, setPOs, setRFQs, setQuotations,
      addOrder, addMachine, addVendor, addEmployee, addShipment, addRFQ, addPO,
      updateOrder, updateMachine, updateEmployee, updateShipment, updatePO, updateQuotation, addCommandHistory, 
      setDemoMode, loadData, resetData, setBypassAuth, insights, toggleDarkMode
    }}>
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory(): FactoryContextType {
  const context = useContext(FactoryContext);
  if (!context) throw new Error('useFactory must be used within a FactoryProvider');
  return context;
}
