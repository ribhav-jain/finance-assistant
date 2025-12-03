import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category, Insight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- FALLBACK LOGIC (Run locally if AI fails) ---

const fallbackCategorize = (description: string): Category => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('salary') || lowerDesc.includes('deposit') || lowerDesc.includes('income')) return Category.Salary;
  if (lowerDesc.includes('uber') || lowerDesc.includes('lyft') || lowerDesc.includes('gas') || lowerDesc.includes('shell') || lowerDesc.includes('fuel')) return Category.Travel;
  if (lowerDesc.includes('food') || lowerDesc.includes('restaurant') || lowerDesc.includes('coffee') || lowerDesc.includes('starbucks') || lowerDesc.includes('market') || lowerDesc.includes('grocery') || lowerDesc.includes('whole foods')) return Category.Food;
  if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('hulu') || lowerDesc.includes('subscription') || lowerDesc.includes('prime')) return Category.Subscriptions;
  if (lowerDesc.includes('rent') || lowerDesc.includes('apartment') || lowerDesc.includes('mortgage')) return Category.Rent;
  if (lowerDesc.includes('electric') || lowerDesc.includes('water') || lowerDesc.includes('utility') || lowerDesc.includes('internet') || lowerDesc.includes('wifi')) return Category.Utilities;
  if (lowerDesc.includes('invest') || lowerDesc.includes('vanguard') || lowerDesc.includes('stock') || lowerDesc.includes('crypto')) return Category.Investments;
  if (lowerDesc.includes('doctor') || lowerDesc.includes('pharmacy') || lowerDesc.includes('health') || lowerDesc.includes('gym') || lowerDesc.includes('fitness')) return Category.Health;
  if (lowerDesc.includes('cinema') || lowerDesc.includes('movie') || lowerDesc.includes('game') || lowerDesc.includes('concert')) return Category.Entertainment;
  if (lowerDesc.includes('store') || lowerDesc.includes('amazon') || lowerDesc.includes('target') || lowerDesc.includes('walmart')) return Category.Shopping;
  return Category.Other;
};

const generateFallbackInsights = (transactions: Transaction[]): Insight[] => {
    const insights: Insight[] = [];
    
    // 1. Total Spend check
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
    });
    const totalSpend = thisMonthTx.reduce((sum, t) => sum + t.amount, 0);
    
    insights.push({
        title: "Monthly Spending Overview",
        description: `You have spent $${totalSpend.toLocaleString()} so far this month based on your tracked transactions.`,
        type: "info"
    });

    // 2. Top Category
    const catMap: Record<string, number> = {};
    thisMonthTx.forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    
    if (sortedCats.length > 0) {
        const topCat = sortedCats[0];
        insights.push({
            title: `Highest Spending: ${topCat[0]}`,
            description: `Your highest spending category this month is ${topCat[0]} with a total of $${topCat[1].toLocaleString()}.`,
            type: "alert"
        });
    }

    // 3. Savings/Income Health
    const thisMonthIncome = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'income';
    }).reduce((sum, t) => sum + t.amount, 0);

    if (thisMonthIncome > 0 && totalSpend < thisMonthIncome) {
        const savings = thisMonthIncome - totalSpend;
        insights.push({
            title: "Positive Cash Flow",
            description: `Great job! You've saved $${savings.toLocaleString()} this month so far.`,
            type: "success"
        });
    }

    return insights;
};

// --- AI SERVICES ---

// Helper to categorize a single transaction description
export const categorizeTransactionAI = async (description: string, amount: number): Promise<Category> => {
  try {
    const prompt = `Categorize the transaction "${description}" with amount ${amount} into exactly one of these categories: ${Object.values(Category).join(', ')}. Return only the category name.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text?.trim();
    if (text && Object.values(Category).includes(text as Category)) {
      return text as Category;
    }
    return fallbackCategorize(description);
  } catch (error) {
    console.warn("AI Categorization failed, using fallback.", error);
    return fallbackCategorize(description);
  }
};

// Analyze transactions and provide insights
export const generateFinanceInsights = async (transactions: Transaction[]): Promise<Insight[]> => {
  try {
    // Summarize data to save tokens
    const recent = transactions.slice(0, 50);
    const prompt = `Analyze these recent financial transactions and provide 3 key insights, patterns, or savings recommendations. 
    Transactions: ${JSON.stringify(recent.map(t => ({ d: t.date, desc: t.description, amt: t.amount, cat: t.category })))}
    
    Return a JSON array of objects with 'title', 'description', and 'type' (enum: 'alert', 'success', 'info').`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['alert', 'success', 'info'] }
            }
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const result = JSON.parse(jsonText);
    
    // If AI returns empty array or invalid JSON, fall back
    if (!Array.isArray(result) || result.length === 0) {
        return generateFallbackInsights(transactions);
    }
    return result;
  } catch (error) {
    console.error("Insights generation failed, using fallback.", error);
    return generateFallbackInsights(transactions);
  }
};

// Chat with financial context
export const chatWithFinancialData = async (query: string, transactions: Transaction[]) => {
  try {
    // Create a lightweight summary context
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const byCategory: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      }
    });

    const context = `
      User Financial Context:
      Total Income: ${totalIncome}
      Total Expense: ${totalExpense}
      Net: ${totalIncome - totalExpense}
      Expense Breakdown: ${JSON.stringify(byCategory)}
      Recent Transactions (Last 10): ${JSON.stringify(transactions.slice(0, 10).map(t => `${t.date}: ${t.description} (${t.amount})`))}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `System: You are a helpful financial assistant. Use the provided context to answer the user's question accurately.
      ${context}
      
      User Question: ${query}`,
    });

    return response.text || "I couldn't process that request.";
  } catch (error) {
    console.error("Chat failed", error);
    return "I'm currently unable to connect to the AI service. However, you can view your spending summaries in the Dashboard or check AI Insights for auto-generated tips!";
  }
};