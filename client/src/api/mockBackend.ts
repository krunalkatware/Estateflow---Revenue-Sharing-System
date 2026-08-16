import { apiClient } from './axios';

// --- MOCK DATABASE AND LOCALSTORAGE SETUP ---
const DEMO_MODE_KEY = 'estateflow_demo_mode';
const DB_KEY = 'estateflow_mock_db';

// Enable Demo Mode by default for presentation if not explicitly set
if (localStorage.getItem(DEMO_MODE_KEY) === null) {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
}

export const isDemoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';

interface MockDB {
  users: any[];
  properties: any[];
  leads: any[];
  bookings: any[];
  payments: any[];
  wallets: any[];
  commissions: any[];
  revenueRules: any[];
  siteVisits: any[];
  notifications: any[];
}

const defaultMockDB: MockDB = {
  users: [
    { id: 'u1', email: 'admin@estateflow.com', role: 'admin', name: 'Super Admin' },
    { id: 'u2', email: 'broker@estateflow.com', role: 'broker', name: 'John Broker' },
    { id: 'u3', email: 'manager@estateflow.com', role: 'manager', name: 'Sarah Manager' },
  ],
  properties: [
    { id: 1, name: 'Skyline Residency 3BHK', price: 15000000, bhk: 3, location: 'Mumbai', status: 'Available', builderId: 1, assignedBrokerId: 'u2' },
    { id: 2, name: 'Ocean View Villa', price: 35000000, bhk: 4, location: 'Goa', status: 'Available', builderId: 2, assignedBrokerId: 'u2' },
  ],
  leads: [
    { id: 1, customerName: 'Alice Smith', email: 'alice@example.com', phone: '9876543210', status: 'New Lead', budget: 15000000, assignedBrokerId: 'u2', interestedPropertyId: 1, createdAt: new Date().toISOString() },
  ],
  bookings: [],
  payments: [],
  wallets: [
    { id: 1, user_id: 'u2', balance: 0, total_earned: 0, currency: 'INR', is_active: true }
  ],
  commissions: [],
  revenueRules: [
    { id: 1, name: 'Standard Broker Commission', role: 'broker', commission_type: 'percentage', value: 2, priority: 1, is_active: true }
  ],
  siteVisits: [],
  notifications: []
};

let memoryDB: MockDB = { ...defaultMockDB };

function loadDB() {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      memoryDB = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse mock DB');
    }
  } else {
    saveDB();
  }
}

function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(memoryDB));
}

export function resetDemoDB() {
  memoryDB = { ...defaultMockDB };
  saveDB();
  window.location.reload();
}

export function initMockBackend() {
  if (!isDemoMode) return;
  
  loadDB();
  console.log('🏗️ Demo Mode Active: Mock Backend Loaded. All requests intercepted.');

  const originalGet = apiClient.get;
  const originalPost = apiClient.post;
  const originalPut = apiClient.put;
  const originalDelete = apiClient.delete;

  const mockResponse = (data: any, status = 200): Promise<any> => Promise.resolve({ data, status });

  (apiClient as any).get = async (url: string, config?: any): Promise<any> => {
    // ---- Global Search ----
    if (url.includes('/search')) {
       return mockResponse({ properties: memoryDB.properties, leads: memoryDB.leads });
    }
    // ---- Properties ----
    if (url.includes('/properties')) {
      return mockResponse(memoryDB.properties);
    }
    // ---- Leads ----
    if (url.includes('/leads')) {
      return mockResponse(memoryDB.leads);
    }
    // ---- Dashboards ----
    if (url.includes('/admin/dashboard/summary')) {
      return mockResponse({
        total_properties: memoryDB.properties.length,
        active_leads: memoryDB.leads.length,
        total_revenue: memoryDB.bookings.reduce((sum, b) => sum + b.bookingAmount, 0),
        total_bookings: memoryDB.bookings.length
      });
    }
    if (url.includes('/admin/revenue/dashboard')) {
      return mockResponse({
        total_revenue_inr: memoryDB.bookings.reduce((sum, b) => sum + b.bookingAmount, 0),
        total_commissions_paid: memoryDB.commissions.reduce((sum, c) => sum + c.commission_amount, 0),
        pending_withdrawals_amount: 0, pending_withdrawals_count: 0,
        active_wallets: memoryDB.wallets.length,
        total_commission_records: memoryDB.commissions.length,
        pending_commissions: 0,
        monthly_trend: [], commission_by_role: []
      });
    }
    // ---- Revenue & Settings ----
    if (url.includes('/admin/revenue/rules')) return mockResponse(memoryDB.revenueRules);
    if (url.includes('/admin/revenue/wallets')) return mockResponse(memoryDB.wallets);
    if (url.includes('/admin/revenue/commissions')) return mockResponse(memoryDB.commissions);
    if (url.includes('/bookings')) return mockResponse(memoryDB.bookings); // covers both admin and user
    if (url.includes('/site-visits')) return mockResponse(memoryDB.siteVisits); // covers both admin and user
    if (url.includes('/wishlist')) return mockResponse([]); 
    if (url.includes('/notifications')) return mockResponse(memoryDB.notifications);

    // ---- CRM & Admin ----
    if (url.includes('/admin/customers')) return mockResponse([]);
    if (url.includes('/admin/builders')) return mockResponse([]);
    if (url.includes('/admin/leads')) return mockResponse(memoryDB.leads);
    if (url.includes('/admin/projects')) return mockResponse([]);
    if (url.includes('/admin/reviews')) return mockResponse([]);
    
    // ---- Dashboard Widgets ----
    if (url.includes('/admin/dashboard/charts')) return mockResponse({ revenue: [], leads: [] });
    if (url.includes('/admin/dashboard/recent-bookings')) return mockResponse(memoryDB.bookings);
    if (url.includes('/admin/dashboard/recent-customers')) return mockResponse([]);
    if (url.includes('/admin/dashboard/recent-reviews')) return mockResponse([]);
    if (url.includes('/admin/dashboard/recent-site-visits')) return mockResponse(memoryDB.siteVisits);

    // ---- Auth ----
    if (url.includes('/auth/me') || url.includes('/admin/auth/me')) {
      return mockResponse(memoryDB.users[0]);
    }

    // Fallback
    try {
        const res = await originalGet.call(apiClient, url, config);
        return res;
    } catch (e) {
        console.warn('MockBackend caught unhandled GET:', url);
        return mockResponse([]); // Default to empty array to prevent .map crashes
    }
  };

  (apiClient as any).post = async (url: string, data?: any, config?: any): Promise<any> => {
    // ---- Auth Login ----
    if (url.includes('/auth/login') || url.includes('/admin/auth/login')) {
      const user = memoryDB.users.find(u => u.email === data?.email) || memoryDB.users[1]; // fallback to broker
      return mockResponse({
          access_token: 'demo-token-' + user.id,
          user: { id: user.id, email: user.email, role: user.role }
      });
    }

    // ---- Leads ----
    if (url.includes('/leads')) {
        const newLead = { id: Date.now(), ...data, status: 'New Lead', createdAt: new Date().toISOString() };
        memoryDB.leads.push(newLead);
        saveDB();
        return mockResponse(newLead);
    }
    
    // ---- Site Visits ----
    if (url.includes('/site-visits') || url.includes('/site-visit')) {
        const newVisit = { id: Date.now(), ...data, status: 'Scheduled', createdAt: new Date().toISOString() };
        memoryDB.siteVisits.push(newVisit);
        
        const notif = { id: Date.now(), title: 'Site Visit Scheduled', message: 'New visit scheduled', type: 'info', read: false };
        memoryDB.notifications.push(notif);
        saveDB();
        return mockResponse(newVisit);
    }

    // ---- Bookings & Revenue Trigger ----
    if (url.includes('/bookings') || url.includes('/booking')) {
        const newBooking = { id: Date.now(), ...data, status: 'Confirmed', createdAt: new Date().toISOString() };
        memoryDB.bookings.push(newBooking);
        
        // Find property
        const prop = memoryDB.properties.find(p => p.id === data.propertyId);
        if (prop) {
            prop.status = 'Booked';
        }
        
        // Auto-calculate Revenue
        const value = data.bookingAmount || (prop ? prop.price : 0);
        const rule = memoryDB.revenueRules.find(r => r.role === 'broker');
        if (rule) {
            const commAmount = rule.commission_type === 'percentage' ? value * (rule.value / 100) : rule.value;
            const comm = {
                id: Date.now(), booking_id: newBooking.id, role: 'broker', 
                commission_amount: commAmount, status: 'confirmed',
                created_at: new Date().toISOString()
            };
            memoryDB.commissions.push(comm);
            
            const wallet = memoryDB.wallets.find(w => w.user_id === 'u2');
            if (wallet) {
                wallet.balance += commAmount;
                wallet.total_earned += commAmount;
            }
        }
        
        const notif = { id: Date.now(), title: 'Booking Confirmed', message: 'Booking confirmed and revenue calculated.', type: 'success', read: false };
        memoryDB.notifications.push(notif);
        
        saveDB();
        return mockResponse(newBooking);
    }

    // Fallback
    try {
        return originalPost.call(apiClient, url, data, config);
    } catch(e) {
        return mockResponse({});
    }
  };

  (apiClient as any).put = async (url: string, data?: any, config?: any): Promise<any> => {
      // ---- Leads update (Kanban) ----
      if (url.includes('/leads/')) {
          const parts = url.split('/');
          const id = parseInt(parts[parts.length - 1] || parts[parts.length - 2]); // handle trailing slash
          const idx = memoryDB.leads.findIndex(l => l.id === id);
          if (idx >= 0) {
              memoryDB.leads[idx] = { ...memoryDB.leads[idx], ...data };
              saveDB();
              return mockResponse(memoryDB.leads[idx]);
          }
      }
      try {
          return originalPut.call(apiClient, url, data, config);
      } catch(e) {
          return mockResponse({});
      }
  };

  (apiClient as any).delete = async (url: string, config?: any): Promise<any> => {
      try {
          return originalDelete.call(apiClient, url, config);
      } catch(e) {
          return mockResponse({});
      }
  };
}
