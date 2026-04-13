import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'hi' | 'mr';

const translations = {
  en: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    shipments: 'Shipments',
    machines: 'Machines',
    vendors: 'Vendors',
    procurement: 'Procurement',
    command: 'Quick Command',
    controlRoom: 'Control Room',
    systemLive: 'SYSTEM LIVE',
    architect: 'ARCHITECT',
    exportLogs: 'Export Logs',
    systemRefresh: 'System Refresh',
    activeOrders: 'ACTIVE ORDERS',
    inProduction: 'In production right now',
    completedToday: 'COMPLETED TODAY',
    readyForDispatch: 'Ready for dispatch',
    delayedShipments: 'DELAYED SHIPMENTS',
    needsImmediateAction: 'Needs immediate action',
    machineAlerts: 'MACHINE ALERTS',
    serviceDue: 'Service or warranty due',
    activeDowntime: 'ACTIVE DOWNTIME',
    machinesDown: 'Machines currently down',
    openRfqs: 'OPEN RFQS',
    awaitingQuotes: 'Awaiting vendor quotes',
    pendingDeliveries: 'PENDING DELIVERIES',
    materialInTransit: 'Material in transit',
    topVendors: 'Top Vendors',
    recentOrders: 'Recent Orders',
    noVendorData: 'No vendor data yet',
    demoMode: 'Demo Mode',
    systemOnline: 'System Online',
    language: 'Language',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    orders: 'ऑर्डर',
    shipments: 'शिपमेंट',
    machines: 'मशीनें',
    vendors: 'विक्रेता',
    procurement: 'खरीद',
    command: 'क्विक कमांड',
    controlRoom: 'कंट्रोल रूम',
    systemLive: 'सिस्टम चालू है',
    architect: 'आर्किटेक्ट',
    exportLogs: 'लॉग निर्यात करें',
    systemRefresh: 'सिस्टम रिफ्रेश',
    activeOrders: 'सक्रिय ऑर्डर',
    inProduction: 'अभी उत्पादन में है',
    completedToday: 'आज पूर्ण हुए',
    readyForDispatch: 'प्रेषण के लिए तैयार',
    delayedShipments: 'विलंबित शिपमेंट',
    needsImmediateAction: 'तत्काल कार्रवाई की आवश्यकता है',
    machineAlerts: 'मशीन अलर्ट',
    serviceDue: 'सेवा या वारंटी देय',
    activeDowntime: 'सक्रिय डाउनटाइम',
    machinesDown: 'मशीनें वर्तमान में डाउन हैं',
    openRfqs: 'खुले RFQ',
    awaitingQuotes: 'विक्रेता उद्धरण की प्रतीक्षा है',
    pendingDeliveries: 'लंबित डिलीवरी',
    materialInTransit: 'सामग्री रास्ते में है',
    topVendors: 'शीर्ष विक्रेता',
    recentOrders: 'हाल के ऑर्डर',
    noVendorData: 'अभी तक कोई विक्रेता डेटा नहीं',
    demoMode: 'डेमो मोड',
    systemOnline: 'सिस्टम ऑनलाइन',
    language: 'भाषा',
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    orders: 'ऑर्डर्स',
    shipments: 'शिपमेंट्स',
    machines: 'मशिन्स',
    vendors: 'विक्रेते',
    procurement: 'खरेदी',
    command: 'क्विक कमांड',
    controlRoom: 'कंट्रोल रूम',
    systemLive: 'सिस्टम चालू आहे',
    architect: 'आर्किटेक्ट',
    exportLogs: 'लॉग एक्स्पोर्ट करा',
    systemRefresh: 'सिस्टम रिफ्रेश',
    activeOrders: 'सक्रिय ऑर्डर्स',
    inProduction: 'सध्या उत्पादनात आहे',
    completedToday: 'आज पूर्ण झाले',
    readyForDispatch: 'पाठवण्यासाठी तयार',
    delayedShipments: 'विलंबित शिपमेंट्स',
    needsImmediateAction: 'तातडीच्या कारवाईची आवश्यकता आहे',
    machineAlerts: 'मशीन अलर्ट्स',
    serviceDue: 'सर्व्हिस किंवा वॉरंटी बाकी',
    activeDowntime: 'सक्रिय डाउनटाइम',
    machinesDown: 'मशिन्स सध्या बंद आहेत',
    openRfqs: 'खुले RFQ',
    awaitingQuotes: 'विक्रेता कोटेशनची प्रतीक्षा आहे',
    pendingDeliveries: 'प्रलंबित डिलिव्हरी',
    materialInTransit: 'माल वाटेत आहे',
    topVendors: 'प्रसिद्ध विक्रेते',
    recentOrders: 'अलीकडील ऑर्डर्स',
    noVendorData: 'अद्याप विक्रेता डेटा नाही',
    demoMode: 'डेमो मोड',
    systemOnline: 'सिस्टम ऑनलाइन',
    language: 'भाषा',
  }
};

type I18nContextType = {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
};

const I18nContext = createContext<I18nContextType>({} as I18nContextType);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Language>('en');

  // We could load the saved lang from AsyncStorage but for simplicity we keep it standard state
  const setLocale = (lang: Language) => {
    setLocaleState(lang);
    AsyncStorage.setItem('os_language', lang).catch(console.error);
  };

  React.useEffect(() => {
    AsyncStorage.getItem('os_language').then((saved) => {
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        setLocaleState(saved as Language);
      }
    });
  }, []);

  const t = (key: keyof typeof translations.en) => {
    return translations[locale]?.[key] || translations['en'][key] || key;
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
