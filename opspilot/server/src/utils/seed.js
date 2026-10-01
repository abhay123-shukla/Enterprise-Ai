import { User } from '../models/User.js';
import { KnowledgeArticle } from '../models/KnowledgeArticle.js';
import { Request } from '../models/Request.js';
import { Comment } from '../models/Comment.js';
import { hashPassword } from './jwt.js';

export const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('🌱 Database already populated. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding initial Enterprise data for OpsPilot...');

    const defaultPassword = await hashPassword('password123');

    // 1. Create Default Users (Employee, Agent, Admin)
    const employee = await User.create({
      name: 'Alex Morgan',
      email: 'employee@opspilot.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Marketing'
    });

    const agent = await User.create({
      name: 'Marcus Reed',
      email: 'agent@opspilot.com',
      password: defaultPassword,
      role: 'agent',
      department: 'IT'
    });

    const admin = await User.create({
      name: 'Sarah Chen',
      email: 'admin@opspilot.com',
      password: defaultPassword,
      role: 'admin',
      department: 'Operations'
    });

    const financeAgent = await User.create({
      name: 'David Kim',
      email: 'david.finance@opspilot.com',
      password: defaultPassword,
      role: 'agent',
      department: 'Finance'
    });

    // 2. Create Knowledge Base Articles
    const articlesData = [
      {
        title: 'VPN Setup & Troubleshooting Guide',
        department: 'IT',
        category: 'VPN',
        tags: ['vpn', 'cisco', 'globalprotect', 'remote', 'network'],
        content: `1. Ensure you have installed GlobalProtect v6.1 or Cisco AnyConnect from the Enterprise Software Center.
2. Server Portal Address: vpn.enterprise.corp
3. When prompted, enter your Okta SSO email and complete the 2FA push notification.
4. Troubleshooting: If connection times out with Error 504, verify your home router DNS or flush DNS cache: ipconfig /flushdns.
5. If still blocked, check if your device certificate is expired under Enterprise Keychain.`,
        createdBy: agent._id || agent.id
      },
      {
        title: 'Password Reset & Account Lockout Resolution',
        department: 'IT',
        category: 'Access & Auth',
        tags: ['password', 'sso', 'okta', 'lockout', '2fa'],
        content: `1. Visit the self-service identity portal: https://identity.enterprise.corp/reset
2. Enter your work email address and solve the security challenge.
3. Choose recovery via registered mobile SMS or authenticator app.
4. Set a new password with at least 14 characters including uppercase, lowercase, numbers, and symbols.
5. Passwords cannot match your previous 5 passwords and expire every 90 days.`,
        createdBy: agent._id || agent.id
      },
      {
        title: 'Annual & Sick Leave Policy (PTO Guidelines)',
        department: 'HR',
        category: 'Leave & Time Off',
        tags: ['leave', 'pto', 'vacation', 'sick', 'holidays', 'policy'],
        content: `1. Full-time employees accrue 20 days of Paid Time Off (PTO) annually, accrued at 1.67 days per month.
2. Unused PTO rollover is capped at 5 days into the following calendar year.
3. For leaves exceeding 3 consecutive business days, manager pre-approval in Workday is required at least 2 weeks in advance.
4. Sick leave: Employees receive 10 days of paid sick leave annually. Medical certificates are required for absences longer than 3 consecutive days.`,
        createdBy: admin._id || admin.id
      },
      {
        title: 'Expense Reimbursement & Travel Policy',
        department: 'Finance',
        category: 'Expense Reimbursement',
        tags: ['expenses', 'reimbursement', 'travel', 'receipts', 'per diem'],
        content: `1. All business expenses must be submitted via Concur within 30 days of the transaction date.
2. Itemized receipts are mandatory for all individual transactions exceeding $25.
3. Daily meal allowance (per diem) while traveling is capped at $75/day ($100/day in Tier-1 cities).
4. Approved expense reports are processed on the bi-weekly corporate payroll cycle.`,
        createdBy: financeAgent._id || financeAgent.id
      },
      {
        title: 'New Laptop Request & Hardware Refresh Workflow',
        department: 'IT',
        category: 'Hardware',
        tags: ['laptop', 'macbook', 'thinkpad', 'hardware', 'refresh'],
        content: `1. Hardware standard refreshes occur every 36 months for engineering and operations personnel.
2. Standard configurations: MacBook Pro 14" M3 Pro 32GB RAM or Lenovo ThinkPad X1 Carbon 32GB RAM.
3. To request replacement for damaged hardware, submit a ticket with serial number and asset tag photo.
4. Loaner laptops can be checked out for up to 14 days at the 4th Floor IT Helpdesk.`,
        createdBy: agent._id || agent.id
      }
    ];

    for (const art of articlesData) {
      await KnowledgeArticle.create(art);
    }

    // 3. Create Sample Initial Requests
    const now = Date.now();
    const req1 = await Request.create({
      title: "Laptop VPN is not connecting and I need access before today's meeting",
      description: "My laptop VPN is not connecting and I need access before today's meeting. Error says Connection timed out after 30 seconds.",
      department: 'IT',
      category: 'VPN',
      priority: 'High',
      status: 'open',
      requester: employee._id || employee.id,
      assignedTo: agent._id || agent.id,
      sentiment: 'Frustrated',
      suggestedAnswer: 'Based on enterprise knowledge article "VPN Setup & Troubleshooting Guide": Check portal address vpn.enterprise.corp and run ipconfig /flushdns.',
      aiTriage: {
        department: 'IT',
        category: 'VPN',
        priority: 'High',
        sentiment: 'Frustrated',
        confidence: 0.96,
        reasoning: 'Detected network connectivity & VPN client references with tight time constraint.'
      },
      slaDeadline: new Date(now + 6 * 60 * 60 * 1000)
    });

    const req2 = await Request.create({
      title: 'Question regarding PTO rollover for Q4',
      description: 'Hi HR team, I have 8 days of accrued PTO remaining. How many days can I carry over into next year?',
      department: 'HR',
      category: 'Leave & Time Off',
      priority: 'Low',
      status: 'resolved',
      requester: employee._id || employee.id,
      assignedTo: admin._id || admin.id,
      sentiment: 'Neutral',
      suggestedAnswer: 'Full-time employees can roll over a maximum of 5 unused PTO days into the following calendar year.',
      aiTriage: {
        department: 'HR',
        category: 'Leave & Time Off',
        priority: 'Low',
        sentiment: 'Neutral',
        confidence: 0.94,
        reasoning: 'Inquiry on standard vacation carryover policy.'
      },
      slaDeadline: new Date(now + 40 * 60 * 60 * 1000),
      resolvedAt: new Date(now - 2 * 60 * 60 * 1000),
      isDeflected: true
    });

    const req3 = await Request.create({
      title: 'Client dinner receipt reimbursement pending manager signoff',
      description: 'Submitted Concur report #EXP-9921 for $142 client dinner on Friday. Need approval so it gets included in this month payroll.',
      department: 'Finance',
      category: 'Expense Reimbursement',
      priority: 'Medium',
      status: 'pending',
      requester: employee._id || employee.id,
      assignedTo: financeAgent._id || financeAgent.id,
      sentiment: 'Neutral',
      suggestedAnswer: 'Approved expense reports are reimbursed on the bi-weekly corporate payroll cycle.',
      aiTriage: {
        department: 'Finance',
        category: 'Expense Reimbursement',
        priority: 'Medium',
        sentiment: 'Neutral',
        confidence: 0.91,
        reasoning: 'Expense claim status query.'
      },
      slaDeadline: new Date(now + 18 * 60 * 60 * 1000)
    });

    // 4. Create Sample Comments for req1
    await Comment.create({
      request: req1._id || req1.id,
      author: employee._id || employee.id,
      content: 'I tried disconnecting and reconnecting 3 times, still showing error 504.'
    });

    await Comment.create({
      request: req1._id || req1.id,
      author: agent._id || agent.id,
      content: 'Hi Alex, I have reset your authentication token on our RADIUS server. Please try reconnecting now.'
    });

    console.log('✅ Seed completed! Demo accounts:');
    console.log('   👤 Employee: employee@opspilot.com | password123');
    console.log('   🛠️  Agent:    agent@opspilot.com    | password123');
    console.log('   👑 Admin:    admin@opspilot.com    | password123');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};
