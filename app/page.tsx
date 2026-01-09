"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Label,
  LabelList,
  Funnel,
  FunnelChart,
  LabelList as FunnelLabelList
} from 'recharts';
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  Target,
  Link as LinkIcon,
  RefreshCw,
  CheckCircle,
  Info,
  Building,
  FileText,
  CheckSquare,
  XSquare,
  AlertCircle,
  Layers,
  Globe,
  GraduationCap,
  Users,
  PieChart as PieChartIcon,
  Briefcase,
  Filter,
  Megaphone,
  DollarSign,
  Presentation,
  List,
  ClipboardList,
  Flag,
  ArrowRight,
  Rocket,
  Settings,
  Volume2,
  Save,
  Database
} from 'lucide-react';

// ==========================================
// 1. 型定義 (Type Definitions)
// ==========================================

// 売上予実 (Mainシート用)
type SalesRecord = {
  month: string;
  sales_budget: number;
  sales_target: number;
  sales_actual: number | null;
  sales_forecast: number;
  cost_budget: number;
  cost_target: number;
  cost_actual: number | null;
  cost_forecast: number;
  profit_budget: number;
  profit_target: number;
  profit_actual: number | null;
  profit_forecast: number;
};

// 新規KPI (Newシート用)
type NewSalesRecord = {
  segment: string;
  budget: number;
  target: number;
  actual: number;
  last_year: number;
  count: number;
  win_rate: number;
  lead_time: number;
  unit_price: number;
  id_price: number;
  duration: number;
};

// 既存KPI (Existingシート用)
type ExistingSalesRecord = {
  segment: string;
  sales: number;
  nrr: number;
  renewal: number;
  id_growth: number;
};

// OKR進捗 (OKRシート用)
type OkrRecord = {
  key_result: string;
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
};

// 汎用リスト (Listsシート用)
// category列で「新規案件」「既存更新」「パイプライン」「顧問案件」などを識別します
type ListRecord = {
  category: string;
  date: string;
  name: string;
  segment: string;
  amount: number;
  count: number;
  owner: string;
  status: string;
  memo: string;
  extra1: string; // 予備カラム（確度や変動理由など）
};

// マーケティングデータ (Marketingシート用)
type MarketingRecord = {
  type: string; // Source, Campaign, Funnel など
  label: string;
  val1: number;
  val2: number;
  val3: number;
  val4: number;
  val5: number;
};

// パイプライン集計データ (Pipeline_Aggシート用)
type PipelineRecord = {
  type: string; // Count_Commit, Amount など
  segment: string;
  m1: number; // 1月
  m2: number; // 2月
  m3: number; // 3月
  m4: number; // 4月
  m5: number; // 5月
  m6: number; // 6月
};

// その他売上データ (Otherシート用)
type OtherRecord = {
  type: string; // Segment, Partner
  name: string;
  val1: number; // 予算など
  val2: number; // 目標など
  val3: number; // 実績など
};

// 顧問CPAデータ (Advisor_CPAシート用)
type AdvisorRecord = {
  source: string;
  cost: number;
  referrals: number;
  lost: number;
  ongoing: number;
  won: number;
  revenue: number;
};

// アプリケーション設定 (シート連携管理用)
type SheetConfig = {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  lastUpdated?: string;
};

type AppSettings = {
  overview: SheetConfig;
  sales: SheetConfig;
  other: SheetConfig;
  marketing: SheetConfig;
  negotiation: SheetConfig;
  pipeline: SheetConfig;
  okr: SheetConfig;
};

// ==========================================
// 2. 定数・初期データ (Constants & Mock Data)
// ==========================================

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#82ca9d', // Green (Recharts default)
  '#ffc658', // Yellow (Recharts default)
  '#8884d8'  // Purple (Recharts default)
];

const PIE_COLORS = { 
  on: '#10b981', 
  off: '#e2e8f0' 
};

// 設定の初期値
const INITIAL_SETTINGS: AppSettings = {
  overview: { 
    id: '', 
    name: 'サマリー / 予実', 
    description: '必要なシート: Main (月次予実データ)', 
    status: 'idle' 
  },
  sales: { 
    id: '', 
    name: '企業直販売上分', 
    description: '必要なシート: New (新規KPI), Existing (既存KPI), Lists (案件リスト)', 
    status: 'idle' 
  },
  other: { 
    id: '', 
    name: 'その他売上', 
    description: '必要なシート: Other (セグメント予実・パートナー構成比)', 
    status: 'idle' 
  },
  marketing: { 
    id: '', 
    name: 'マーケ施策・分析', 
    description: '必要なシート: Marketing (ソース別・キャンペーン別・ファネル)', 
    status: 'idle' 
  },
  negotiation: { 
    id: '', 
    name: '商談・トライアル分析', 
    description: '必要なシート: Advisor_CPA (顧問データ), Lists (商談・トライアルリスト)', 
    status: 'idle' 
  },
  pipeline: { 
    id: '', 
    name: 'パイプライン分析', 
    description: '必要なシート: Pipeline_Agg (集計データ), Lists (詳細リスト)', 
    status: 'idle' 
  },
  okr: { 
    id: '', 
    name: 'OKR・今後のアクション', 
    description: '必要なシート: OKR (進捗トラッキング)', 
    status: 'idle' 
  },
};

// モックデータ: 売上 (データ未連携時のプレースホルダー)
const INITIAL_SALES_DATA: SalesRecord[] = [
  { 
    month: '4月', 
    sales_budget: 12000, 
    sales_target: 13000, 
    sales_actual: 12500, 
    sales_forecast: 12500, 
    cost_budget: 4800, 
    cost_target: 5200, 
    cost_actual: 5000, 
    cost_forecast: 5000, 
    profit_budget: 7200, 
    profit_target: 7800, 
    profit_actual: 7500, 
    profit_forecast: 7500 
  },
  { 
    month: '5月', 
    sales_budget: 13000, 
    sales_target: 14000, 
    sales_actual: 12800, 
    sales_forecast: 12800, 
    cost_budget: 5200, 
    cost_target: 5600, 
    cost_actual: 5120, 
    cost_forecast: 5120, 
    profit_budget: 7800, 
    profit_target: 8400, 
    profit_actual: 7680, 
    profit_forecast: 7680 
  },
  { 
    month: '6月', 
    sales_budget: 14000, 
    sales_target: 15000, 
    sales_actual: 14500, 
    sales_forecast: 14500, 
    cost_budget: 5600, 
    cost_target: 6000, 
    cost_actual: 5800, 
    cost_forecast: 5800, 
    profit_budget: 8400, 
    profit_target: 9000, 
    profit_actual: 8700, 
    profit_forecast: 8700 
  },
  { 
    month: '7月', 
    sales_budget: 15000, 
    sales_target: 16000, 
    sales_actual: 16000, 
    sales_forecast: 16000, 
    cost_budget: 6000, 
    cost_target: 6400, 
    cost_actual: 6400, 
    cost_forecast: 6400, 
    profit_budget: 9000, 
    profit_target: 9600, 
    profit_actual: 9600, 
    profit_forecast: 9600 
  },
  { 
    month: '8月', 
    sales_budget: 16000, 
    sales_target: 17000, 
    sales_actual: 15800, 
    sales_forecast: 15800, 
    cost_budget: 6400, 
    cost_target: 6800, 
    cost_actual: 6320, 
    cost_forecast: 6320, 
    profit_budget: 9600, 
    profit_target: 10200, 
    profit_actual: 9480, 
    profit_forecast: 9480 
  },
  { 
    month: '9月', 
    sales_budget: 17000, 
    sales_target: 18000, 
    sales_actual: 18200, 
    sales_forecast: 18200, 
    cost_budget: 6800, 
    cost_target: 7200, 
    cost_actual: 6916, 
    cost_forecast: 6916, 
    profit_budget: 10200, 
    profit_target: 10800, 
    profit_actual: 11284, 
    profit_forecast: 11284 
  },
  { 
    month: '10月', 
    sales_budget: 18000, 
    sales_target: 19500, 
    sales_actual: null, 
    sales_forecast: 19000, 
    cost_budget: 7200, 
    cost_target: 7800, 
    cost_actual: null, 
    cost_forecast: 7600, 
    profit_budget: 10800, 
    profit_target: 11700, 
    profit_actual: null, 
    profit_forecast: 11400 
  },
  { 
    month: '11月', 
    sales_budget: 19000, 
    sales_target: 20500, 
    sales_actual: null, 
    sales_forecast: 19500, 
    cost_budget: 7600, 
    cost_target: 8200, 
    cost_actual: null, 
    cost_forecast: 7800, 
    profit_budget: 11400, 
    profit_target: 12300, 
    profit_actual: null, 
    profit_forecast: 11700 
  },
  { 
    month: '12月', 
    sales_budget: 20000, 
    sales_target: 21500, 
    sales_actual: null, 
    sales_forecast: 21000, 
    cost_budget: 8000, 
    cost_target: 8600, 
    cost_actual: null, 
    cost_forecast: 8400, 
    profit_budget: 12000, 
    profit_target: 12900, 
    profit_actual: null, 
    profit_forecast: 12600 
  },
  { 
    month: '1月', 
    sales_budget: 21000, 
    sales_target: 22500, 
    sales_actual: null, 
    sales_forecast: 22000, 
    cost_budget: 8400, 
    cost_target: 9000, 
    cost_actual: null, 
    cost_forecast: 8800, 
    profit_budget: 12600, 
    profit_target: 13500, 
    profit_actual: null, 
    profit_forecast: 13200 
  },
  { 
    month: '2月', 
    sales_budget: 22000, 
    sales_target: 23500, 
    sales_actual: null, 
    sales_forecast: 22500, 
    cost_budget: 8800, 
    cost_target: 9400, 
    cost_actual: null, 
    cost_forecast: 9000, 
    profit_budget: 13200, 
    profit_target: 14100, 
    profit_actual: null, 
    profit_forecast: 13500 
  },
  { 
    month: '3月', 
    sales_budget: 23000, 
    sales_target: 25000, 
    sales_actual: null, 
    sales_forecast: 24000, 
    cost_budget: 9200, 
    cost_target: 10000, 
    cost_actual: null, 
    cost_forecast: 9600, 
    profit_budget: 13800, 
    profit_target: 15000, 
    profit_actual: null, 
    profit_forecast: 14400 
  },
];

const MOCK_NEW_SALES_DATA: NewSalesRecord[] = [
  { 
    segment: 'Enterprise', 
    budget: 5000, 
    target: 5500, 
    actual: 4800, 
    last_year: 4000, 
    count: 5, 
    win_rate: 35, 
    lead_time: 120, 
    unit_price: 840, 
    id_price: 2000, 
    duration: 12 
  },
  { 
    segment: 'Mid', 
    budget: 3000, 
    target: 3300, 
    actual: 3200, 
    last_year: 2800, 
    count: 12, 
    win_rate: 45, 
    lead_time: 60, 
    unit_price: 291, 
    id_price: 1500, 
    duration: 12 
  },
  { 
    segment: 'Small', 
    budget: 1500, 
    target: 1800, 
    actual: 1600, 
    last_year: 1200, 
    count: 30, 
    win_rate: 60, 
    lead_time: 30, 
    unit_price: 60, 
    id_price: 1200, 
    duration: 12 
  },
];

const INITIAL_EXISTING_SALES: ExistingSalesRecord[] = [
  { 
    segment: 'Enterprise', 
    sales: 12134547, 
    nrr: 60.1, 
    renewal: 92.3, 
    id_growth: 63.9 
  },
  { 
    segment: 'Mid', 
    sales: 6942000, 
    nrr: 61.3, 
    renewal: 60.0, 
    id_growth: 68.2 
  },
  { 
    segment: 'Small', 
    sales: 690000, 
    nrr: 83.6, 
    renewal: 100.0, 
    id_growth: 92.0 
  },
];

const INITIAL_OKR_DATA: OkrRecord[] = [
  { 
    key_result: "635件", 
    jan: "", feb: "", mar: "", apr: "", may: "", jun: "" 
  },
  { 
    key_result: "160件", 
    jan: "", feb: "", mar: "", apr: "", may: "", jun: "" 
  },
  { 
    key_result: "6社/150%", 
    jan: "", feb: "", mar: "", apr: "", may: "", jun: "" 
  },
];

// ==========================================
// 3. ヘルパー関数 (Helper Functions)
// ==========================================

const parseCSV = (csvText: string): any[] => {
  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const lines = cleanText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null;
    const values = line.split(',');
    const record: any = {};
    headers.forEach((header, index) => {
      let val = values[index]?.trim().replace(/"/g, '');
      if (val) val = val.replace(/,/g, '');
      
      if (val === '' || val === undefined || val === '-') {
        record[header] = null;
      } else if (
        !isNaN(Number(val)) && 
        !['date', 'month', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'segment', 'name', 'source', 'key_result', 'category', 'owner', 'status', 'memo', 'extra1', 'type', 'label'].includes(header)
      ) {
        record[header] = Number(val);
      } else {
        record[header] = val;
      }
    });
    return record;
  }).filter(r => r !== null);
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return `¥${value.toLocaleString()}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)}%`;
};

// ==========================================
// 4. 共通UIコンポーネント (UI Components)
// ==========================================

const CircularRate = ({ 
  label, 
  value, 
  color 
}: { 
  label: string, 
  value: number, 
  color: string 
}) => {
  const safeValue = value || 0;
  const data = [
    { name: 'Val', value: safeValue },
    { name: 'Rest', value: 100 - (safeValue > 100 ? 0 : safeValue) }
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={20}
              outerRadius={28}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill={PIE_COLORS.off} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
          {safeValue.toFixed(1)}%
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-600 mt-1">{label}</span>
    </div>
  );
};

const SegmentCard = ({ 
  title, 
  data, 
  colorClass, 
  isAnnual = false 
}: any) => (
  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full bg-white">
    <div className={`${colorClass} text-white py-2 text-center font-bold text-sm uppercase`}>
      {title} {isAnnual ? '(FY25通年)' : ''}
    </div>
    <div className="p-4 flex flex-col items-center justify-between flex-1">
      <div className="text-center mb-4">
        <p className="text-[10px] text-slate-500 font-bold mb-1">売上金額(円)</p>
        <p className="text-xl font-extrabold text-slate-800">
          {Number(data?.sales || 0).toLocaleString()}
        </p>
      </div>
      <div className="flex justify-between w-full px-1">
        <CircularRate label="NRR" value={Number(data?.nrr || 0)} color="#10b981" />
        <CircularRate label="更新率" value={Number(data?.renewal || 0)} color="#3b82f6" />
        <CircularRate label="ID増減" value={Number(data?.id_growth || 0)} color="#f59e0b" />
      </div>
    </div>
  </div>
);

const GaugeChart = ({ 
  title, 
  budget, 
  target, 
  actual 
}: any) => {
  const budRate = budget ? Math.min((actual / budget) * 100, 100) : 0;
  const tarRate = target ? Math.min((actual / target) * 100, 100) : 0;
  
  return (
    <div className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-lg">
      <h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4>
      <div className="w-full space-y-2">
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
            <span>予算比</span>
            <span>{budget ? Math.round((actual / budget) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${budRate}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
            <span>目標比</span>
            <span>{target ? Math.round((actual / target) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-2 rounded-full" 
              style={{ width: `${tarRate}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
         <span className="text-lg font-bold text-slate-800">{actual?.toLocaleString()}</span>
         <span className="text-[10px] text-slate-400 ml-1">/ Target: {target?.toLocaleString()}</span>
      </div>
    </div>
  );
};

const PipelineGauge = ({ 
  title, 
  target, 
  forecast 
}: { 
  title: string, 
  target: number, 
  forecast: number 
}) => {
    const percentage = target > 0 ? (forecast / target) * 100 : 0;
    const cappedPercentage = Math.min(percentage, 100);
    const data = [
      { name: 'Achieved', value: cappedPercentage },
      { name: 'Remaining', value: 100 - cappedPercentage }
    ];
  
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4>
        <div className="relative w-40 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={percentage >= 100 ? '#10b981' : '#6366f1'} />
                <Cell fill="#e2e8f0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-0 right-0 text-center mb-1">
             <span className="text-xl font-bold text-slate-800">{percentage.toFixed(0)}%</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">
            <div>ヨミ: {formatCurrency(forecast)}</div>
            <div>目標: {formatCurrency(target)}</div>
        </div>
      </div>
    );
};

const AchievementBadge = ({ label, value }: { label: string, value: number }) => {
  const isTarget = label.includes('目標');
  const bgColor = isTarget ? (value >= 100 ? 'bg-amber-100' : 'bg-white') : (value >= 100 ? 'bg-emerald-100' : 'bg-rose-100');
  const textColor = isTarget ? (value >= 100 ? 'text-amber-700' : 'text-slate-500') : (value >= 100 ? 'text-emerald-700' : 'text-rose-700');
  const borderColor = isTarget ? (value >= 100 ? 'border-amber-200' : 'border-slate-200') : (value >= 100 ? 'border-emerald-200' : 'border-rose-200');
  return (<span className={`px-2 py-0.5 rounded-full font-bold border ${bgColor} ${textColor} ${borderColor} text-[10px]`}>{label} {formatPercent(value)}</span>);
};


// ==========================================
// 5. メインコンポーネント (CBDashboard)
// ==========================================

export default function CBDashboard() {
  // --- States ---
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  // Data States
  const [salesData, setSalesData] = useState<SalesRecord[]>(INITIAL_SALES_DATA);
  const [newSalesData, setNewSalesData] = useState<NewSalesRecord[]>([]);
  const [existingSalesData, setExistingSalesData] = useState<ExistingSalesRecord[]>([]);
  const [okrData, setOkrData] = useState<OkrRecord[]>(INITIAL_OKR_DATA);
  const [marketingData, setMarketingData] = useState<MarketingRecord[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineRecord[]>([]);
  const [otherData, setOtherData] = useState<OtherRecord[]>([]);
  const [advisorData, setAdvisorData] = useState<AdvisorRecord[]>([]);
  
  // List Data States
  const [salesListData, setSalesListData] = useState<ListRecord[]>([]);
  const [negListData, setNegListData] = useState<ListRecord[]>([]);
  const [pipeListData, setPipeListData] = useState<ListRecord[]>([]);

  // Input States
  const [sheetInput, setSheetInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  // --- Effects ---
  useEffect(() => {
    const savedSettings = localStorage.getItem('cb_dashboard_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // --- Handlers ---
  const saveSettings = () => {
    localStorage.setItem('cb_dashboard_settings', JSON.stringify(settings));
    alert('設定を保存しました。');
  };

  const updateSetting = (key: keyof AppSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], id: value }
    }));
  };

  const handleSheetSync = async () => {
    if (!sheetInput) return;
    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage('');
    
    try {
      const idMatch = sheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const cleanId = idMatch ? idMatch[1] : sheetInput;
      const baseUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=`;

      const sheets = [
        'Main', 'New', 'Existing', 'OKR', 'Lists', 
        'Marketing', 'Pipeline_Agg', 'Other', 'Advisor_CPA'
      ];
      
      const requests = sheets.map(sheet => 
        fetch(`${baseUrl}${sheet}`).then(res => res.text())
      );
      
      const results = await Promise.all(requests);

      // Parse and Set Data
      const parsedMain = parseCSV(results[0]); if(parsedMain.length) setSalesData(parsedMain);
      const parsedNew = parseCSV(results[1]); if(parsedNew.length) setNewSalesData(parsedNew);
      const parsedExt = parseCSV(results[2]); if(parsedExt.length) setExistingSalesData(parsedExt);
      const parsedOkr = parseCSV(results[3]); if(parsedOkr.length) setOkrData(parsedOkr);
      const parsedLists = parseCSV(results[4]); if(parsedLists.length) setSalesListData(parsedLists); // Init logic for lists
      const parsedMkt = parseCSV(results[5]); if(parsedMkt.length) setMarketingData(parsedMkt);
      const parsedPipe = parseCSV(results[6]); if(parsedPipe.length) setPipelineData(parsedPipe);
      const parsedOther = parseCSV(results[7]); if(parsedOther.length) setOtherData(parsedOther);
      const parsedAdv = parseCSV(results[8]); if(parsedAdv.length) setAdvisorData(parsedAdv);

      // Distribute lists
      if (parsedLists.length) {
          setSalesListData(parsedLists);
          setNegListData(parsedLists);
          setPipeListData(parsedLists);
      }

      setSyncStatus('success');
      setFileName(`All Sheets Synced`);
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error: any) {
      setSyncStatus('error');
      setErrorMessage(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchSheetData = async (key: keyof AppSettings) => {
    const config = settings[key];
    if (!config.id) {
      alert('シートIDを入力してください');
      return;
    }

    setSettings(prev => ({ ...prev, [key]: { ...prev[key], status: 'loading' } }));

    try {
      const idMatch = config.id.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const cleanId = idMatch ? idMatch[1] : config.id;
      const baseUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=`;

      if (key === 'overview') {
        const res = await fetch(baseUrl + 'Main').then(r => r.text());
        setSalesData(parseCSV(res));
      } else if (key === 'sales') {
        const [r1, r2, r3] = await Promise.all([
          fetch(baseUrl + 'New').then(r => r.text()),
          fetch(baseUrl + 'Existing').then(r => r.text()),
          fetch(baseUrl + 'Lists').then(r => r.text())
        ]);
        setNewSalesData(parseCSV(r1));
        setExistingSalesData(parseCSV(r2));
        setSalesListData(parseCSV(r3));
      } else if (key === 'other') {
        const res = await fetch(baseUrl + 'Other').then(r => r.text());
        setOtherData(parseCSV(res));
      } else if (key === 'marketing') {
        const res = await fetch(baseUrl + 'Marketing').then(r => r.text());
        setMarketingData(parseCSV(res));
      } else if (key === 'negotiation') {
        const [r1, r2] = await Promise.all([
          fetch(baseUrl + 'Advisor_CPA').then(r => r.text()),
          fetch(baseUrl + 'Lists').then(r => r.text())
        ]);
        setAdvisorData(parseCSV(r1));
        setNegListData(parseCSV(r2));
      } else if (key === 'pipeline') {
        const [r1, r2] = await Promise.all([
          fetch(baseUrl + 'Pipeline_Agg').then(r => r.text()),
          fetch(baseUrl + 'Lists').then(r => r.text())
        ]);
        setPipelineData(parseCSV(r1));
        setPipeListData(parseCSV(r2));
      } else if (key === 'okr') {
        const res = await fetch(baseUrl + 'OKR').then(r => r.text());
        setOkrData(parseCSV(res));
      }

      setSettings(prev => ({ 
        ...prev, 
        [key]: { ...prev[key], status: 'success', lastUpdated: new Date().toLocaleTimeString() } 
      }));
    } catch (e) {
      console.error(e);
      setSettings(prev => ({ ...prev, [key]: { ...prev[key], status: 'error' } }));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'settings': 
        return <SettingsTab 
          settings={settings} 
          updateSetting={updateSetting} 
          saveSettings={saveSettings} 
          fetchSheetData={fetchSheetData} 
        />;
      case 'overview': 
        return <OverviewTab data={salesData} />;
      case 'sales': 
        return <SalesAnalysisTab 
          newData={newSalesData} 
          existData={existingSalesData} 
          listData={salesListData} 
        />;
      case 'other': 
        return <OtherSalesTab otherData={otherData} />;
      case 'marketing': 
        return <MarketingAnalysisTab mktData={marketingData} />;
      case 'negotiation': 
        return <NegotiationAnalysisTab 
          advisorData={advisorData} 
          listData={negListData} 
        />;
      case 'pipeline': 
        return <PipelineAnalysisTab 
          pipeData={pipelineData} 
          listData={pipeListData} 
        />;
      case 'okr': 
        return <OkrActionTab okrData={okrData} />;
      default: 
        return <OverviewTab data={salesData} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
           <div className="flex items-center gap-2 font-bold text-xl">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">SB</div>
             <span>CB Div.</span>
           </div>
           <p className="text-xs text-slate-400 mt-2">経営管理ダッシュボード</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavItem 
            id="overview" 
            label="サマリー / 予実" 
            icon={<LayoutDashboard size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <NavItem 
            id="sales" 
            label="企業直販売上分" 
            icon={<TrendingUp size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <NavItem 
            id="other" 
            label="その他売上" 
            icon={<Layers size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <NavItem 
            id="marketing" 
            label="マーケ施策・分析" 
            icon={<Activity size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <NavItem 
            id="negotiation" 
            label="商談・トライアル分析" 
            icon={<Presentation size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <NavItem 
            id="pipeline" 
            label="パイプライン分析" 
            icon={<Target size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <NavItem 
            id="okr" 
            label="OKR・今後のアクション" 
            icon={<Flag size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          
          <div className="my-4 border-t border-slate-700"></div>
          
          <NavItem 
            id="settings" 
            label="設定（データ連携）" 
            icon={<Settings size={20} />} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        </nav>

        {/* Global Sync Button Area */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="bg-slate-800 rounded-lg p-4 shadow-inner border border-slate-700 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-indigo-300 font-bold flex items-center gap-1">
                  <LinkIcon size={12} /> Google Sheets 連携
                </p>
                {syncStatus === 'success' && <CheckCircle size={14} className="text-emerald-400" />}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="標準ID (一括同期用)"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSheetSync}
                  disabled={isSyncing || !sheetInput}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded transition-all ${
                    isSyncing 
                      ? 'bg-slate-700 text-slate-400 cursor-wait' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
                  }`}
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'データ同期' : 'データ同期'}
                </button>
              </div>
            </div>
            {fileName && syncStatus === 'success' && (
               <div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-800/50 rounded text-[10px] text-emerald-300 truncate">
                 {fileName}
               </div>
            )}
            {syncStatus === 'error' && (
              <div className="mt-2 p-2 bg-rose-900/30 border border-rose-800/50 rounded text-[10px] text-rose-300 leading-tight">
                 ⚠ {errorMessage}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'overview' && '月次売上および今後の売上予測'}
            {activeTab === 'sales' && '企業直販売上分 (新規/既存)'}
            {activeTab === 'other' && 'その他売上分析 (代理店・優待・学校)'}
            {activeTab === 'marketing' && 'マーケ施策・分析'}
            {activeTab === 'negotiation' && '商談・トライアル分析レポート'}
            {activeTab === 'pipeline' && 'パイプライン分析'}
            {activeTab === 'okr' && 'OKR・今後のアクション'}
            {activeTab === 'settings' && 'データ連携設定'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium">山田 太郎</p>
                <p className="text-xs text-slate-500">法人事業部長</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
               YT
             </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

// Sidebar Item Component
const NavItem = ({ id, label, icon, activeTab, setActiveTab }: any) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
      activeTab === id
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);


// ==========================================
// 6. Settings Tab Component
// ==========================================
const SettingsTab = ({ settings, updateSetting, saveSettings, fetchSheetData }: any) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <Database size={28} className="text-indigo-600"/> データ連携設定
           </h2>
           <p className="text-sm text-slate-500 mt-1">
             各ダッシュボード画面に対応するGoogleスプレッドシートのIDを登録してください。
           </p>
        </div>
        <button 
           onClick={saveSettings} 
           className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 flex items-center gap-2 font-bold transition-all"
        >
           <Save size={18}/> 設定を保存
        </button>
      </div>

      <div className="grid gap-6">
        {Object.entries(settings).map(([key, config]: [string, any]) => (
          <div key={key} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      {config.name}
                      {config.status === 'success' && <CheckCircle size={16} className="text-emerald-500"/>}
                   </h3>
                   <p className="text-xs text-slate-500 mt-1">{config.description}</p>
                </div>
                <div className="flex items-center gap-3">
                   {config.status === 'success' && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                         最終同期: {config.lastUpdated}
                      </span>
                   )}
                   {config.status === 'error' && (
                      <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 flex items-center gap-1">
                         <AlertCircle size={12}/> エラー
                      </span>
                   )}
                   <button 
                      onClick={() => fetchSheetData(key)} 
                      disabled={!config.id || config.status === 'loading'} 
                      className={`text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                          !config.id 
                            ? 'bg-slate-100 text-slate-400' 
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                   >
                      <RefreshCw size={14} className={config.status === 'loading' ? 'animate-spin' : ''}/> 
                      {config.status === 'loading' ? '同期中...' : '同期'}
                   </button>
                </div>
             </div>
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="Google Spreadsheet ID (例: 1UijNvely71JDu73...)" 
                 value={config.id} 
                 onChange={(e) => updateSetting(key, e.target.value)}
                 className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
               />
               <div className="absolute right-3 top-2.5 text-slate-400">
                  <LinkIcon size={16} />
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ==========================================
// 7. Overview Tab Component
// ==========================================
const OverviewTab = ({ data }: { data: SalesRecord[] }) => {
  // データチェック
  if (!data || data.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 animate-in fade-in">
              <Info size={48} className="mb-4 text-slate-300"/>
              <p className="text-lg font-bold">データが連携されていません</p>
              <p className="text-sm">設定タブから「サマリー予実」用のシートIDを登録・同期してください。</p>
          </div>
      );
  }

  const currentMonthIdx = 5; 
  const currentData = data[currentMonthIdx] || data[0];
  const n = (v: any) => Number(v) || 0;

  const tableData = [
    { name: '売上', budget: n(currentData.sales_budget), target: n(currentData.sales_target), result: n(currentData.sales_forecast) },
    { name: 'コスト', budget: n(currentData.cost_budget), target: n(currentData.cost_target), result: n(currentData.cost_forecast) },
    { name: '利益', budget: n(currentData.profit_budget), target: n(currentData.profit_target), result: n(currentData.profit_forecast) },
  ];

  return (
     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Table Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
              <Activity size={20} className="text-indigo-600"/> 当月予実サマリー
           </h3>
           <table className="w-full text-right text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3 text-left">項目</th>
                    <th className="p-3">予算</th>
                    <th className="p-3">目標</th>
                    <th className="p-3">見込 (Forecast)</th>
                    <th className="p-3 text-indigo-600">対予算比</th>
                  </tr>
              </thead>
              <tbody>
                 {tableData.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                       <td className="p-3 text-left font-bold text-slate-700">{r.name}</td>
                       <td className="p-3">{r.budget.toLocaleString()}</td>
                       <td className="p-3">{r.target.toLocaleString()}</td>
                       <td className="p-3 font-bold text-lg text-slate-800">{r.result.toLocaleString()}</td>
                       <td className="p-3 font-bold text-indigo-600">
                         {formatPercent(r.result / (r.budget || 1) * 100)}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
           <h3 className="font-bold text-lg mb-4 text-slate-800">年間予実推移</h3>
           <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(v:any) => formatCurrency(v)} 
                 />
                 <Legend iconType="circle" />
                 <Bar dataKey="sales_actual" name="実績" fill="#6366f1" barSize={30} radius={[4, 4, 0, 0]} />
                 <Line type="monotone" dataKey="sales_budget" name="予算" stroke="#fbbf24" strokeWidth={3} dot={{r:4}} />
                 <Line type="monotone" dataKey="sales_forecast" name="見込" stroke="#10b981" strokeWidth={3} dot={{r:4}} strokeDasharray="5 5" />
              </ComposedChart>
           </ResponsiveContainer>
        </div>
     </div>
  );
};

// ==========================================
// 8. Sales Analysis Tab Component
// ==========================================
const SalesAnalysisTab = ({ newData, existData, listData }: { newData: NewSalesRecord[], existData: ExistingSalesRecord[], listData: ListRecord[] }) => {
  const [subTab, setSubTab] = useState<'new'|'existing'>('new');
  
  // 安全にフィルタリング
  const safeListData = Array.isArray(listData) ? listData : [];
  const newDeals = safeListData.filter(d => d.category === 'NewDeal');
  const existDeals = safeListData.filter(d => ['Renewed', 'NotRenewed', 'Fluctuation', 'HighValue'].includes(d.category));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Sub Tabs */}
       <div className="flex gap-4 border-b border-slate-200 pb-1">
          <button 
              onClick={()=>setSubTab('new')} 
              className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                  subTab==='new' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
          >
              新規売上
          </button>
          <button 
              onClick={()=>setSubTab('existing')} 
              className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                  subTab==='existing' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
          >
              既存売上
          </button>
       </div>

       {subTab === 'new' ? (
          <div className="space-y-6">
             {/* Chart */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                <h3 className="font-bold mb-4 text-slate-700">セグメント別 予算 vs 実績</h3>
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={newData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip formatter={(v:any) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="actual" name="実績" fill="#6366f1" barSize={40} />
                      <Bar dataKey="budget" name="予算" fill="#fbbf24" barSize={40} />
                   </ComposedChart>
                </ResponsiveContainer>
             </div>

             {/* Table */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-4 text-slate-700">直近受注案件リスト</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="p-3">日付</th>
                            <th>顧客名</th>
                            <th>セグメント</th>
                            <th>金額</th>
                            <th>担当</th>
                            <th>メモ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newDeals.length > 0 ? newDeals.map((d,i)=>(
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3">{d.date}</td>
                                <td className="font-bold">{d.name}</td>
                                <td><span className="bg-slate-100 px-2 py-1 rounded text-xs">{d.segment}</span></td>
                                <td className="font-bold text-indigo-600">{d.amount?.toLocaleString()}</td>
                                <td>{d.owner}</td>
                                <td className="text-xs text-slate-500">{d.memo}</td>
                            </tr>
                        )) : <tr><td colSpan={6} className="p-4 text-center text-slate-400">データがありません</td></tr>}
                    </tbody>
                    </table>
                </div>
             </div>
          </div>
       ) : (
          <div className="space-y-6">
             {/* Cards Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {existData && existData.map((d,i)=>(
                   <SegmentCard key={i} title={d.segment} data={d} colorClass="bg-slate-700" />
                ))}
             </div>

             {/* Table */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-4 text-slate-700">更新・解約・変動リスト</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="p-3">種別</th>
                            <th>顧客名</th>
                            <th>金額</th>
                            <th>メモ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {existDeals.length > 0 ? existDeals.map((d,i)=>(
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        d.category==='Renewed' ? 'bg-emerald-100 text-emerald-700' : 
                                        d.category==='NotRenewed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {d.category}
                                    </span>
                                </td>
                                <td className="font-bold">{d.name}</td>
                                <td>{d.amount?.toLocaleString()}</td>
                                <td className="text-xs text-slate-500">{d.memo}</td>
                            </tr>
                        )) : <tr><td colSpan={4} className="p-4 text-center text-slate-400">データがありません</td></tr>}
                    </tbody>
                    </table>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

// ==========================================
// 9. Other Sales Tab Component
// ==========================================
const OtherSalesTab = ({ otherData }: { otherData: OtherRecord[] }) => {
   const safeData = Array.isArray(otherData) ? otherData : [];
   const segments = safeData.filter(d => d.type === 'Segment');
   const partners = safeData.filter(d => d.type === 'Partner');

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Info size={20} className="text-indigo-600" /> その他売上コメント
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                <p><strong>学校・自治体:</strong> 今月は自治体案件の入札があり、来月以降の売上増が見込まれます。</p>
                <p><strong>企業優待:</strong> 福利厚生サイト経由の流入が安定しています。</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-80 border border-slate-100">
               <h3 className="font-bold mb-4 text-slate-700">セグメント別予実</h3>
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={segments} layout="vertical" margin={{left: 20}}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                       <XAxis type="number" />
                       <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                       <Tooltip formatter={(v:any)=>formatCurrency(v)} />
                       <Legend />
                       <Bar dataKey="val1" name="予算" fill="#94a3b8" barSize={20} />
                       <Bar dataKey="val3" name="実績" fill="#6366f1" barSize={20} />
                   </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-80 border border-slate-100">
               <h3 className="font-bold mb-4 text-slate-700">パートナー別構成比</h3>
               <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                       <Pie 
                           data={partners} 
                           dataKey="val1" 
                           nameKey="name" 
                           cx="50%" 
                           cy="50%" 
                           outerRadius={80}
                           label={({name, percent}: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                           {partners.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                       </Pie>
                       <Tooltip formatter={(v:any)=>formatCurrency(v)} />
                   </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
   );
};

// ==========================================
// 10. Marketing Analysis Tab Component
// ==========================================
const MarketingAnalysisTab = ({ mktData }: { mktData: MarketingRecord[] }) => {
   const safeData = Array.isArray(mktData) ? mktData : [];
   const sourceData = safeData.filter(d => d.type === 'Source');
   const campaignData = safeData.filter(d => d.type === 'Campaign');
   const funnelData = safeData.filter(d => d.type === 'Funnel_Month');

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 text-slate-700">ソース別獲得分析</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="p-3 text-left">ソース</th>
                            <th>リード</th>
                            <th>商談</th>
                            <th>受注</th>
                            <th>コスト</th>
                            <th>CPA (Cost/Lead)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sourceData.map((d,i)=>(
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3 text-left font-bold">{d.label}</td>
                                <td>{d.val1}</td>
                                <td>{d.val2}</td>
                                <td>{d.val3}</td>
                                <td>{d.val4?.toLocaleString()}</td>
                                <td className="font-bold text-indigo-600">
                                    ¥{(d.val4/d.val1).toFixed(0).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-80 border border-slate-100">
               <h3 className="font-bold mb-4 text-slate-700">ファネル分析</h3>
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={funnelData} layout="vertical" margin={{left: 20}}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                       <XAxis type="number" />
                       <YAxis dataKey="label" type="category" width={80} />
                       <Tooltip />
                       <Legend />
                       <Bar dataKey="val1" stackId="a" name="1月" fill="#6366f1" />
                       <Bar dataKey="val2" stackId="a" name="2月" fill="#10b981" />
                       <Bar dataKey="val3" stackId="a" name="3月" fill="#f59e0b" />
                   </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold mb-4 text-slate-700">キャンペーン別リード獲得</h3>
               <table className="w-full text-sm border-collapse">
                   <thead className="bg-slate-50 text-slate-600">
                       <tr><th className="p-2 text-left">CP名</th><th>Ent</th><th>Mid</th><th>Sml</th></tr>
                   </thead>
                   <tbody>
                       {campaignData.map((d,i)=>(
                           <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                               <td className="p-2 text-left">{d.label}</td>
                               <td className="text-center">{d.val1}</td>
                               <td className="text-center">{d.val2}</td>
                               <td className="text-center">{d.val3}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

// ==========================================
// 11. Negotiation & Trial Analysis Tab
// ==========================================
const NegotiationAnalysisTab = ({ advisorData, listData }: { advisorData: AdvisorRecord[], listData: ListRecord[] }) => {
   const safeListData = Array.isArray(listData) ? listData : [];
   const advisorDeals = safeListData.filter(d => d.category === 'AdvisorDeal');
   const trialDeals = safeListData.filter(d => d.category === 'Trial');
   
   const [url, setUrl] = useState('');
   
   // URLローカル保存の読み込み
   useEffect(() => { 
       const s = localStorage.getItem('neg_url'); 
       if(s) setUrl(s); 
   }, []);
   
   const handleUrl = (v: string) => { 
       setUrl(v); 
       localStorage.setItem('neg_url', v); 
   };

   // 安全なデータ参照
   const safeAdvisorData = Array.isArray(advisorData) ? advisorData : [];

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* PDF Report Section */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 flex gap-2 text-slate-800">
                <Presentation size={20} className="text-indigo-600"/> 月次レポート (PDF埋め込み)
            </h3>
            <input 
                type="text" 
                value={url} 
                onChange={e=>handleUrl(e.target.value)} 
                className="w-full border p-2 rounded mb-4 text-sm bg-slate-50 focus:outline-none focus:border-indigo-500" 
                placeholder="Google Drive IDを入力 (例: 1UijNv...)"
            />
            <div className="h-[500px] bg-slate-100 flex justify-center items-center rounded border border-slate-200 overflow-hidden">
               {url ? (
                   <iframe 
                       src={`https://drive.google.com/file/d/${url}/preview`} 
                       width="100%" 
                       height="100%" 
                       className="rounded" 
                       title="PDF Report"
                   />
               ) : (
                   <div className="text-center text-slate-400">
                      <FileText size={48} className="mx-auto mb-2 opacity-50"/>
                      <p>PDFレポートを表示するにはIDを入力してください</p>
                   </div>
               )}
            </div>
         </div>

         {/* Advisor CPA Table */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 flex gap-2 text-slate-800">
                <Users size={20} className="text-emerald-600"/> 顧問経由商談 CPA
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right border-collapse">
                    <thead className="bg-emerald-50 text-emerald-900">
                        <tr>
                            <th className="p-3 text-left">ソース</th>
                            <th>コスト</th>
                            <th>紹介</th>
                            <th>受注</th>
                            <th>売上</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeAdvisorData.map((d,i)=>(
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3 text-left font-bold">{d.source}</td>
                                <td>{d.cost.toLocaleString()}</td>
                                <td>{d.referrals}</td>
                                <td>{d.won}</td>
                                <td>{d.revenue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>

         {/* Advisor Deals List */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold mb-4 flex gap-2 text-slate-800">
                 <List size={20} className="text-indigo-600"/> 顧問経由商談一覧
             </h3>
             <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-slate-50 text-slate-700">
                     <tr><th className="p-3">企業名</th><th>フェーズ</th><th>メモ</th></tr>
                 </thead>
                 <tbody>
                     {advisorDeals.map((d,i)=>(
                         <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                             <td className="p-3 font-bold">{d.name}</td>
                             <td><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">{d.status}</span></td>
                             <td className="text-xs text-slate-500">{d.memo}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>

         {/* Trial List */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold mb-4 flex gap-2 text-slate-800">
                 <ClipboardList size={20} className="text-amber-600"/> トライアル案件一覧
             </h3>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left border-collapse">
                     <thead className="bg-amber-50 text-amber-900">
                         <tr>
                             <th className="p-3">取引先</th>
                             <th>セグメント</th>
                             <th>金額</th>
                             <th>開始日</th>
                             <th>メモ</th>
                         </tr>
                     </thead>
                     <tbody>
                         {trialDeals.map((d,i)=>(
                             <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                 <td className="p-3 font-bold">{d.name}</td>
                                 <td>{d.segment}</td>
                                 <td>{d.amount?.toLocaleString()}</td>
                                 <td>{d.date}</td>
                                 <td className="text-xs text-slate-500 max-w-md p-3">{d.extra1 || d.memo}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         </div>
      </div>
   );
};

// ==========================================
// 12. Pipeline Analysis Tab Component
// ==========================================
const PipelineAnalysisTab = ({ pipeData, listData }: { pipeData: PipelineRecord[], listData: ListRecord[] }) => {
   const safePipeData = Array.isArray(pipeData) ? pipeData : [];
   const safeListData = Array.isArray(listData) ? listData : [];

   const amounts = safePipeData.filter(d => d.type === 'Amount');
   const newPipe = safeListData.filter(d => d.category === 'PipelineNew');
   const existPipe = safeListData.filter(d => d.category === 'PipelineExist');

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <h3 className="font-bold mb-4 flex gap-2 text-slate-800">
             <Target size={20} className="text-indigo-600"/> パイプライン達成見込み
         </h3>
         
         {/* Gauges */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {['Enterprise','Mid','Small','Total'].map((t,i)=>(
                 <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                     <h4 className="font-bold text-slate-600 mb-2">{t}</h4>
                     <div className="relative w-full h-24">
                         <ResponsiveContainer>
                             <PieChart>
                                 <Pie 
                                     data={[{value:85},{value:15}]} 
                                     innerRadius={25} 
                                     outerRadius={40} 
                                     startAngle={180} 
                                     endAngle={0} 
                                     dataKey="value"
                                 >
                                     <Cell fill="#10b981"/><Cell fill="#e2e8f0"/>
                                 </Pie>
                             </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute bottom-2 inset-x-0 font-bold text-xl text-slate-800">85%</div>
                     </div>
                     <p className="text-xs text-slate-400">達成見込 (Demo)</p>
                 </div>
             ))}
         </div>

         {/* Amount Table */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 text-slate-700">セグメント別 ヨミ金額推移</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="p-3 text-left">セグメント</th>
                            <th>1月</th>
                            <th>2月</th>
                            <th>3月</th>
                            <th>4月</th>
                            <th>5月</th>
                            <th>6月</th>
                        </tr>
                    </thead>
                    <tbody>
                        {amounts.map((d,i)=>(
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3 text-left font-bold">{d.segment}</td>
                                <td>{d.m1?.toLocaleString()}</td>
                                <td>{d.m2?.toLocaleString()}</td>
                                <td>{d.m3?.toLocaleString()}</td>
                                <td>{d.m4?.toLocaleString()}</td>
                                <td>{d.m5?.toLocaleString()}</td>
                                <td>{d.m6?.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>

         {/* Detail Lists */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold mb-4 text-blue-600 border-b pb-2">パイプライン詳細(新規)</h3>
               <table className="w-full text-xs text-left">
                   <thead className="text-slate-500">
                       <tr><th className="p-2">時期</th><th>顧客名</th><th className="text-right">金額</th><th>確度</th></tr>
                   </thead>
                   <tbody>
                       {newPipe.map((d,i)=>(
                           <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                               <td className="p-2">{d.date}</td>
                               <td className="font-bold">{d.name}</td>
                               <td className="text-right">{d.amount?.toLocaleString()}</td>
                               <td><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{d.extra1}</span></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold mb-4 text-blue-600 border-b pb-2">パイプライン詳細(既存)</h3>
               <table className="w-full text-xs text-left">
                   <thead className="text-slate-500">
                       <tr><th className="p-2">時期</th><th>顧客名</th><th className="text-right">金額</th><th>確度</th></tr>
                   </thead>
                   <tbody>
                       {existPipe.map((d,i)=>(
                           <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                               <td className="p-2">{d.date}</td>
                               <td className="font-bold">{d.name}</td>
                               <td className="text-right">{d.amount?.toLocaleString()}</td>
                               <td><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{d.extra1}</span></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

// ==========================================
// 13. OKR Tab Component
// ==========================================
const OkrActionTab = ({ okrData }: { okrData: OkrRecord[] }) => {
   const safeOkrData = Array.isArray(okrData) ? okrData : [];

   const objectives = [
       {
           id: 1,
           title: "Objective 1",
           desc: "受注拡大の加速装置を構築し、FY26上期2.9億円受注を実現可能な状態をつくる",
           color: "border-blue-500",
           icon: <Rocket className="text-blue-500" size={32} />
       },
       {
           id: 2,
           title: "Objective 2",
           desc: "成長を支えるCS基盤を構築し、顧客の継続率上昇におけるKSFを見つける",
           color: "border-teal-500",
           icon: <Settings className="text-teal-500" size={32} />
       },
       {
           id: 3,
           title: "Objective 3",
           desc: "AI英会話研修のスタンダードとしてのポジションの確立に向けて、認知度の基盤をつくる",
           color: "border-green-600",
           icon: <Volume2 className="text-green-600" size={32} />
       }
   ];

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Top Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {objectives.map((obj) => (
                <div key={obj.id} className={`bg-white p-6 rounded-xl border-t-4 ${obj.color} shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="text-center mb-4">
                        <div className="mx-auto mb-2 flex justify-center">{obj.icon}</div>
                        <h3 className="font-bold text-lg text-slate-800">{obj.title}</h3>
                        <p className="text-xs text-slate-500 mt-2 font-bold leading-relaxed">{obj.desc}</p>
                    </div>
                </div>
            ))}
         </div>

         {/* Tracking Table */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 flex gap-2 text-slate-800">
                <Activity size={20} className="text-indigo-600"/> 月次OKR進捗トラッキング
            </h3>
            <div className="w-full overflow-x-auto">
               <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600">
                      <tr>
                          <th className="p-3 border-b border-slate-200 sticky left-0 bg-slate-50 z-20 min-w-[200px] shadow-sm">Key Result</th>
                          <th className="p-3 border-b border-slate-200 min-w-[160px]">1月</th>
                          <th className="p-3 border-b border-slate-200 min-w-[160px]">2月</th>
                          <th className="p-3 border-b border-slate-200 min-w-[160px]">3月</th>
                          <th className="p-3 border-b border-slate-200 min-w-[160px]">4月</th>
                          <th className="p-3 border-b border-slate-200 min-w-[160px]">5月</th>
                          <th className="p-3 border-b border-slate-200 min-w-[160px]">6月</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {safeOkrData.map((r,i)=>(
                        <tr key={i} className="hover:bg-slate-50 group">
                           <td className="p-3 border-r border-slate-100 font-bold sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 z-10">
                               {r.key_result}
                           </td>
                           {['jan','feb','mar','apr','may','jun'].map((m) => (
                               <td key={m} className="p-2 border-r border-slate-100 align-top">
                                   <textarea 
                                       className="w-full h-16 bg-transparent border border-slate-200 rounded p-2 text-xs resize-none focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors" 
                                       defaultValue={(r as any)[m]} 
                                       placeholder="-"
                                   />
                               </td>
                           ))}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* General Comment */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold mb-4 flex gap-2 text-slate-800">
                 <Info size={20} className="text-indigo-600"/> 総括・コメント
             </h3>
             <textarea 
                 className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 resize-none placeholder-slate-400 transition-colors" 
                 placeholder="ここに全体の振り返りやアクションプランを入力してください..."
             ></textarea>
         </div>
      </div>
   );
};