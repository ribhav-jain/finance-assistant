export enum Category {
  Food = "Food",
  Rent = "Rent",
  Travel = "Travel",
  Shopping = "Shopping",
  Subscriptions = "Subscriptions",
  Utilities = "Utilities",
  Salary = "Salary",
  Investments = "Investments",
  Health = "Health",
  Entertainment = "Entertainment",
  Other = "Other",
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
  type: "income" | "expense";
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface Insight {
  title: string;
  description: string;
  type: "alert" | "success" | "info";
}

export interface UserProfile {
  name: string;
  email: string;
  memberSince: string;
  currency: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "alert" | "success";
  read: boolean;
  time: string;
}

export enum View {
  Dashboard = "Dashboard",
  Transactions = "Transactions",
  SmartBudget = "SmartBudget",
  SavingGoals = "SavingGoals",
  AIInsights = "AIInsights",
  AskAI = "AskAI",
  Profile = "Profile",
}
