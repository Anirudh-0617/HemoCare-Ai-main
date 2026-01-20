import { supabase } from './supabase';

// Constants
const DAILY_LIMIT = 15;
const MONTHLY_LIMIT = 200;
const COOLDOWN_SECONDS = 5;

// Emergency keywords that bypass limits
const EMERGENCY_KEYWORDS = [
    'head injury', 'head hit', 'bleeding heavily', 'emergency', '911', '102',
    'unconscious', 'can\'t breathe', 'cannot breathe', 'choking', 'severe pain',
    'intracranial', 'internal bleeding', 'life threatening', 'dying'
];

export interface ChatUsage {
    dailyMessages: number;
    monthlyMessages: number;
    dailyLimit: number;
    monthlyLimit: number;
    canSend: boolean;
    isLowCredits: boolean;
}

// Check if message contains emergency keywords (bypasses limits)
export const isEmergencyMessage = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword => lowerContent.includes(keyword));
};

// Get current usage stats from Supabase
export const getChatUsage = async (): Promise<ChatUsage> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Not logged in - use localStorage fallback
            return getLocalUsage();
        }

        const { data, error } = await supabase.rpc('get_chat_usage');

        if (error) {
            console.error('Error fetching chat usage:', error);
            return getLocalUsage();
        }

        const usage = data?.[0] || { daily_messages: 0, monthly_messages: 0, daily_limit: DAILY_LIMIT, monthly_limit: MONTHLY_LIMIT };

        const dailyRemaining = usage.daily_limit - usage.daily_messages;
        const monthlyRemaining = usage.monthly_limit - usage.monthly_messages;

        return {
            dailyMessages: usage.daily_messages,
            monthlyMessages: usage.monthly_messages,
            dailyLimit: usage.daily_limit,
            monthlyLimit: usage.monthly_limit,
            canSend: dailyRemaining > 0 && monthlyRemaining > 0,
            isLowCredits: dailyRemaining <= 5 && dailyRemaining > 0
        };
    } catch (e) {
        console.error('Chat usage fetch error:', e);
        return getLocalUsage();
    }
};

// Record a message and decrement credits
export const recordChatMessage = async (): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Not logged in - use localStorage
            return recordLocalMessage();
        }

        const { error } = await supabase.rpc('record_chat_message');

        if (error) {
            console.error('Error recording chat message:', error);
            return recordLocalMessage();
        }

        return true;
    } catch (e) {
        console.error('Record message error:', e);
        return recordLocalMessage();
    }
};

// ---- LocalStorage Fallback for Non-Authenticated Users ----

const STORAGE_KEY = 'hemocare_chat_usage';

interface LocalUsageData {
    daily: number;
    monthly: number;
    lastDailyReset: string;
    lastMonthlyReset: string;
}

const getLocalUsage = (): ChatUsage => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date().toISOString().slice(0, 7) + '-01';

        if (!stored) {
            return {
                dailyMessages: 0,
                monthlyMessages: 0,
                dailyLimit: DAILY_LIMIT,
                monthlyLimit: MONTHLY_LIMIT,
                canSend: true,
                isLowCredits: false
            };
        }

        const data: LocalUsageData = JSON.parse(stored);

        // Reset if new day
        if (data.lastDailyReset !== today) {
            data.daily = 0;
            data.lastDailyReset = today;
        }

        // Reset if new month
        if (data.lastMonthlyReset !== monthStart) {
            data.monthly = 0;
            data.lastMonthlyReset = monthStart;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        const dailyRemaining = DAILY_LIMIT - data.daily;
        const monthlyRemaining = MONTHLY_LIMIT - data.monthly;

        return {
            dailyMessages: data.daily,
            monthlyMessages: data.monthly,
            dailyLimit: DAILY_LIMIT,
            monthlyLimit: MONTHLY_LIMIT,
            canSend: dailyRemaining > 0 && monthlyRemaining > 0,
            isLowCredits: dailyRemaining <= 5 && dailyRemaining > 0
        };
    } catch (e) {
        return {
            dailyMessages: 0,
            monthlyMessages: 0,
            dailyLimit: DAILY_LIMIT,
            monthlyLimit: MONTHLY_LIMIT,
            canSend: true,
            isLowCredits: false
        };
    }
};

const recordLocalMessage = (): boolean => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date().toISOString().slice(0, 7) + '-01';

        const stored = localStorage.getItem(STORAGE_KEY);
        const data: LocalUsageData = stored ? JSON.parse(stored) : {
            daily: 0,
            monthly: 0,
            lastDailyReset: today,
            lastMonthlyReset: monthStart
        };

        // Reset if needed
        if (data.lastDailyReset !== today) {
            data.daily = 0;
            data.lastDailyReset = today;
        }
        if (data.lastMonthlyReset !== monthStart) {
            data.monthly = 0;
            data.lastMonthlyReset = monthStart;
        }

        data.daily += 1;
        data.monthly += 1;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        return false;
    }
};

// ---- Cooldown Timer Utilities ----

let lastMessageTime = 0;

export const getCooldownRemaining = (): number => {
    const elapsed = (Date.now() - lastMessageTime) / 1000;
    const remaining = COOLDOWN_SECONDS - elapsed;
    return remaining > 0 ? Math.ceil(remaining) : 0;
};

export const isOnCooldown = (): boolean => {
    return getCooldownRemaining() > 0;
};

export const markMessageSent = (): void => {
    lastMessageTime = Date.now();
};

export const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;
