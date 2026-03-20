export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  plan: ServicePlan;
  avatar: string;
}

export interface ServicePlan {
  name: string;
  type: 'prepaid' | 'postpaid' | 'fiber' | 'business' | 'family';
  price: string;
  data: string;
  validity: string;
  features: string[];
}

export interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
  customerRating?: 'up' | 'down' | null;
  session_id?: string;
  query?: string;
}

export interface TicketResponse {
  id: string;
  from: 'merchant' | 'customer' | 'system';
  message: string;
  timestamp: string;
}

export interface Query {
  id: string;
  customerId: string;
  question: string;
  answer: string;
  timestamp: string;
  source: 'search' | 'chatbot';
}

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'published';
}

export const customers: Customer[] = [
  {
    id: 'CUST001',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    password: 'priya123',
    avatar: '👩‍💻',
    plan: {
      name: 'Unlimited ₹599',
      type: 'prepaid',
      price: '₹599/month',
      data: '2GB/day',
      validity: '28 days',
      features: ['Unlimited Calls', '100 SMS/day', 'Free OTT: Cinema + Hotstar'],
    },
  },
  {
    id: 'CUST002',
    name: 'Rahul Verma',
    email: 'rahul.verma@email.com',
    phone: '+91 87654 32109',
    password: 'rahul123',
    avatar: '👨‍💼',
    plan: {
      name: 'Postpaid Premium ₹999',
      type: 'postpaid',
      price: '₹999/month',
      data: 'Unlimited',
      validity: 'Monthly billing',
      features: ['Unlimited Data', 'International Roaming', 'Priority Support', 'Amazon Prime'],
    },
  },
  {
    id: 'CUST003',
    name: 'Ananya Patel',
    email: 'ananya.patel@email.com',
    phone: '+91 76543 21098',
    password: 'ananya123',
    avatar: '👩‍🎨',
    plan: {
      name: 'Fiber 100Mbps',
      type: 'fiber',
      price: '₹799/month',
      data: 'Unlimited',
      validity: 'Monthly',
      features: ['100 Mbps Speed', 'Free Router', 'Landline with Unlimited Calls', 'Netflix Basic'],
    },
  },
  {
    id: 'CUST004',
    name: 'Vikram Singh',
    email: 'vikram.singh@corp.com',
    phone: '+91 65432 10987',
    password: 'vikram123',
    avatar: '👨‍🔧',
    plan: {
      name: 'Business Pro ₹1999',
      type: 'business',
      price: '₹1999/month',
      data: 'Unlimited + 5 SIMs',
      validity: 'Annual',
      features: ['5 Employee SIMs', 'Cloud Storage 100GB', 'Dedicated Account Manager', 'SLA 99.9%'],
    },
  },
  {
    id: 'CUST005',
    name: 'Meera Iyer',
    email: 'meera.iyer@email.com',
    phone: '+91 54321 09876',
    password: 'meera123',
    avatar: '👩‍🏫',
    plan: {
      name: 'Family Pack ₹1499',
      type: 'family',
      price: '₹1499/month',
      data: '3GB/day per member',
      validity: '28 days',
      features: ['4 SIM Connections', 'Shared Data Pool', 'Family Caller Tune', 'Disney+ Hotstar'],
    },
  },
];

export const merchantCredentials = {
  email: 'admin@signalwave.in',
  password: 'merchant123',
  name: 'Arjun Kapoor',
  role: 'Senior Support Lead',
};

export const tickets: Ticket[] = [
  {
    id: 'TKT-2024-001',
    customerId: 'CUST001',
    subject: 'Unable to activate international roaming',
    description: 'I tried to activate international roaming through the app but getting error code IR-403. Traveling to Dubai next week.',
    status: 'open',
    category: 'Roaming',
    createdAt: '2024-03-10T10:30:00',
    updatedAt: '2024-03-10T10:30:00',
    responses: [],
    customerRating: null,
  },
  {
    id: 'TKT-2024-002',
    customerId: 'CUST002',
    subject: 'Excess billing on postpaid plan',
    description: 'My March bill shows ₹2,450 instead of ₹999. I see charges for data usage but my plan is unlimited.',
    status: 'pending',
    category: 'Billing',
    createdAt: '2024-03-08T14:15:00',
    updatedAt: '2024-03-09T09:00:00',
    responses: [
      {
        id: 'R001',
        from: 'merchant',
        message: 'Hi Rahul, we are reviewing your billing statement. The excess charges appear to be from international data usage while roaming. Could you confirm if you traveled abroad recently?',
        timestamp: '2024-03-09T09:00:00',
      },
    ],
    customerRating: null,
  },
  {
    id: 'TKT-2024-003',
    customerId: 'CUST003',
    subject: 'Fiber connection speed drops at night',
    description: 'My 100Mbps connection drops to 15-20Mbps every night between 8PM-11PM. Speed tests attached.',
    status: 'resolved',
    category: 'Network',
    createdAt: '2024-03-05T19:45:00',
    updatedAt: '2024-03-07T16:30:00',
    responses: [
      {
        id: 'R002',
        from: 'merchant',
        message: 'Hi Ananya, we identified a congestion issue at your local exchange. Our engineering team has upgraded the node capacity.',
        timestamp: '2024-03-06T11:00:00',
      },
      {
        id: 'R003',
        from: 'customer',
        message: 'Speed seems better now, getting 85-90Mbps consistently. Thank you!',
        timestamp: '2024-03-07T16:30:00',
      },
    ],
    customerRating: 'up',
  },
  {
    id: 'TKT-2024-004',
    customerId: 'CUST004',
    subject: 'Need additional SIMs for new employees',
    description: 'We have 3 new hires joining next week. Need to add 3 more SIMs to our Business Pro plan.',
    status: 'open',
    category: 'Account',
    createdAt: '2024-03-10T08:00:00',
    updatedAt: '2024-03-10T08:00:00',
    responses: [],
    customerRating: null,
  },
  {
    id: 'TKT-2024-005',
    customerId: 'CUST005',
    subject: 'Family member unable to use shared data',
    description: 'My daughter\'s SIM (ending 4532) cannot access mobile data since yesterday. Other family members are fine.',
    status: 'pending',
    category: 'Data Services',
    createdAt: '2024-03-09T20:10:00',
    updatedAt: '2024-03-10T07:45:00',
    responses: [
      {
        id: 'R004',
        from: 'system',
        message: 'Automated check: SIM ending 4532 shows active status. APN settings may need reconfiguration.',
        timestamp: '2024-03-09T20:15:00',
      },
    ],
    customerRating: null,
  },
  {
    id: 'TKT-2024-006',
    customerId: 'CUST001',
    subject: 'OTT subscription not working',
    description: 'My plan includes free OTT subscription but it says "subscription expired" when I try to login.',
    status: 'closed',
    category: 'Value Added Services',
    createdAt: '2024-03-01T12:00:00',
    updatedAt: '2024-03-02T15:00:00',
    responses: [
      {
        id: 'R005',
        from: 'merchant',
        message: 'Hi Priya, your OTT subscription has been re-linked to your account. Please logout and login again on the OTT app.',
        timestamp: '2024-03-02T10:00:00',
      },
      {
        id: 'R006',
        from: 'customer',
        message: 'Working now! Thanks for the quick fix.',
        timestamp: '2024-03-02T15:00:00',
      },
    ],
    customerRating: 'up',
  },
];

export const queries: Query[] = [
  {
    id: 'Q001',
    customerId: 'CUST001',
    question: 'How to check my remaining data balance?',
    answer: 'You can check your data balance by dialing *121# or through the SignalWave app under "My Usage" section.',
    timestamp: '2024-03-10T09:00:00',
    source: 'chatbot',
  },
  {
    id: 'Q002',
    customerId: 'CUST002',
    question: 'What are the international roaming charges for USA?',
    answer: 'For USA roaming on Postpaid Premium: Incoming calls ₹30/min, Outgoing ₹50/min, Data ₹15/MB. We recommend the ₹499 International Pack for 1GB data + 100 mins calling.',
    timestamp: '2024-03-09T11:30:00',
    source: 'search',
  },
  {
    id: 'Q003',
    customerId: 'CUST003',
    question: 'Can I upgrade my fiber speed to 200Mbps?',
    answer: 'Yes! You can upgrade to 200Mbps for ₹1,099/month. The upgrade includes free installation and a dual-band Wi-Fi 6 router. Visit the nearest SignalWave store or upgrade through the app.',
    timestamp: '2024-03-08T16:00:00',
    source: 'search',
  },
  {
    id: 'Q004',
    customerId: 'CUST005',
    question: 'How to add a new member to family pack?',
    answer: 'To add a new member: Go to SignalWave app → Family Pack → Add Member → Enter their number. Max 6 members allowed. Each additional member after 4 costs ₹199/month.',
    timestamp: '2024-03-07T14:20:00',
    source: 'chatbot',
  },
];

export const kbArticles: KBArticle[] = [
  {
    id: 'KB001',
    title: 'How to Troubleshoot Slow Internet Speed',
    category: 'Network',
    content: '## Steps to Fix Slow Speed\n\n1. **Restart your router** - Unplug for 30 seconds\n2. **Check connected devices** - Too many devices can slow down\n3. **Run a speed test** - Use speedtest.net\n4. **Check for outages** - Visit status.signalwave.in\n5. **Contact support** if issue persists',
    createdAt: '2024-02-15',
    createdBy: 'Arjun Kapoor',
    status: 'published',
  },
  {
    id: 'KB002',
    title: 'International Roaming Activation Guide',
    category: 'Roaming',
    content: '## Activate International Roaming\n\n1. Dial *123*1# or use the app\n2. Select your destination country\n3. Choose a roaming pack\n4. Confirm via OTP\n\n**Note:** Postpaid users get auto-activation. Prepaid users need min ₹500 balance.',
    createdAt: '2024-02-20',
    createdBy: 'Arjun Kapoor',
    status: 'published',
  },
  {
    id: 'KB003',
    title: 'Understanding Your Postpaid Bill',
    category: 'Billing',
    content: '## Bill Components\n\n- **Plan charges**: Your monthly plan cost\n- **Usage charges**: Calls/data beyond plan limits\n- **Taxes**: GST @ 18%\n- **Add-ons**: Any additional packs purchased\n\nDownload detailed bill from app → Bills → Download PDF',
    createdAt: '2024-03-01',
    createdBy: 'Arjun Kapoor',
    status: 'published',
  },
];

export const ticketCategories = [
  'Billing',
  'Network',
  'Roaming',
  'Data Services',
  'Account',
  'Value Added Services',
  'SIM & Activation',
  'Device Support',
  'Complaints',
  'Other',
];
