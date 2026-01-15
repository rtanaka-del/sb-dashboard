"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, PieChart, Pie, Cell, ReferenceLine, Label, LabelList,
  Funnel, FunnelChart, LabelList as FunnelLabelList
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, Activity, Target,
  Link as LinkIcon, RefreshCw, CheckCircle, Info,
  Building, FileText, CheckSquare, XSquare, AlertCircle, Layers, Globe, GraduationCap, Users,
  PieChart as PieChartIcon, Briefcase, Filter, Megaphone, DollarSign, Presentation, List, ClipboardList,
  Flag, ArrowRight, Rocket, Settings, Volume2, Save, Database, ExternalLink
} from 'lucide-react';

// ==========================================
// 1. 型定義 (Type Definitions)
// ==========================================

// 売上予実 (Mainシート相当)
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

// 新規KPI (Newシート相当)
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

// 既存KPI (Existingシート相当)
type ExistingSalesRecord = {
  segment: string;
  sales: number;
  nrr: number;
  renewal: number;
  id_growth: number;
};

// OKR進捗 (OKRシート相当)
type OkrRecord = {
  key_result: string;
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
};

// 汎用リスト (Listsシート相当)
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
  extra1: string;
};

// マーケティングデータ (Marketingシート相当)
type MarketingRecord = {
  type: string;
  label: string;
  val1: number;
  val2: number;
  val3: number;
  val4: number;
  val5: number;
};

// パイプライン集計データ (Pipeline_Aggシート相当)
type PipelineRecord = {
  type: string;
  segment: string;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
};

// その他売上データ (Otherシート相当)
type OtherRecord = {
  type: string;
  name: string;
  val1: number;
  val2: number;
  val3: number;
};

// 顧問CPAデータ (Advisor_CPAシート相当)
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
  tabs: string[]; // 必要なタブ名
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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#82ca9d', '#ffc658', '#8884d8'];
const PIE_COLORS = { on: '#10b981', off: '#e2e8f0' };

// 設定の初期値 (各ページで必要なシートを定義)
const INITIAL_SETTINGS: AppSettings = {
  overview: { 
    id: '', name: 'サマリー / 予実', 
    description: '月次予実データを管理するシート', 
    tabs: ['Main'], 
    status: 'idle' 
  },
  sales: { 
    id: '', name: '企業直販売上分', 
    description: '新規・既存KPIおよび案件リスト', 
    tabs: ['New', 'Existing', 'Lists'], 
    status: 'idle' 
  },
  other: { 
    id: '', name: 'その他売上', 
    description: '代理店・パートナー等の売上', 
    tabs: ['Other'], 
    status: 'idle' 
  },
  marketing: { 
    id: '', name: 'マーケ施策・分析', 
    description: 'リードソース、キャンペーン、ファネル', 
    tabs: ['Marketing'], 
    status: 'idle' 
  },
  negotiation: { 
    id: '', name: '商談・トライアル分析', 
    description: '顧問CPA、商談・トライアル一覧', 
    tabs: ['Advisor_CPA', 'Lists'], 
    status: 'idle' 
  },
  pipeline: { 
    id: '', name: 'パイプライン分析', 
    description: '将来のヨミ金額集計と詳細', 
    tabs: ['Pipeline_Agg', 'Lists'], 
    status: 'idle' 
  },
  okr: { 
    id: '', name: 'OKR・今後のアクション', 
    description: '月次OKR進捗トラッキング', 
    tabs: ['OKR'], 
    status: 'idle' 
  },
};

// [Mock] Main Data (Updated based on Report_All.csv values)
const MOCK_SALES_DATA: SalesRecord[] = [
  { month: '4月', sales_budget: 89261863, sales_target: 96551594, sales_actual: 89000000, sales_forecast: 89000000, cost_budget: 33544980, cost_target: 33544980, cost_actual: 33500000, cost_forecast: 33500000, profit_budget: 55716883, profit_target: 63006613, profit_actual: 55500000, profit_forecast: 55500000 },
  { month: '5月', sales_budget: 22617708, sales_target: 24904957, sales_actual: 22000000, sales_forecast: 22000000, cost_budget: 24888852, cost_target: 24888852, cost_actual: 24500000, cost_forecast: 24500000, profit_budget: -2271144, profit_target: 16105, profit_actual: -2500000, profit_forecast: -2500000 },
  { month: '6月', sales_budget: 26745824, sales_target: 29806963, sales_actual: 26000000, sales_forecast: 26000000, cost_budget: 32296330, cost_target: 32296330, cost_actual: 32000000, cost_forecast: 32000000, profit_budget: -5550506, profit_target: -2489367, profit_actual: -6000000, profit_forecast: -6000000 },
  { month: '7月', sales_budget: 65455767, sales_target: 69897485, sales_actual: 65000000, sales_forecast: 65000000, cost_budget: 25385703, cost_target: 25385703, cost_actual: 25000000, cost_forecast: 25000000, profit_budget: 40070063, profit_target: 44511781, profit_actual: 40000000, profit_forecast: 40000000 },
  { month: '8月', sales_budget: 17905839, sales_target: 21647739, sales_actual: 18000000, sales_forecast: 18000000, cost_budget: 21541703, cost_target: 21541703, cost_actual: 21000000, cost_forecast: 21000000, profit_budget: -3635864, profit_target: 106036, profit_actual: -3000000, profit_forecast: -3000000 },
  { month: '9月', sales_budget: 30309704, sales_target: 34421792, sales_actual: 30000000, sales_forecast: 30000000, cost_budget: 23654643, cost_target: 23654643, cost_actual: 23000000, cost_forecast: 23000000, profit_budget: 6655060, profit_target: 10767148, profit_actual: 7000000, profit_forecast: 7000000 },
  { month: '10月', sales_budget: 59191700, sales_target: 64386538, sales_actual: null, sales_forecast: 60000000, cost_budget: 25718523, cost_target: 25718523, cost_actual: null, cost_forecast: 25000000, profit_budget: 33473176, profit_target: 38668015, profit_actual: null, profit_forecast: 35000000 },
  { month: '11月', sales_budget: 15532862, sales_target: 16832862, sales_actual: null, sales_forecast: 16000000, cost_budget: 22537703, cost_target: 22537703, cost_actual: null, cost_forecast: 22000000, profit_budget: -7004841, profit_target: -5704841, profit_actual: null, profit_forecast: -6000000 },
  { month: '12月', sales_budget: 38001448, sales_target: 42281010, sales_actual: 30451557, sales_forecast: 30451557, cost_budget: 19686643, cost_target: 19686643, cost_actual: 19000000, cost_forecast: 19000000, profit_budget: 18314804, profit_target: 22594367, profit_actual: 11451557, profit_forecast: 11451557 },
  { month: '1月', sales_budget: 22968501, sales_target: 24589893, sales_actual: 26953539, sales_forecast: 26953539, cost_budget: 17533412, cost_target: 17533412, cost_actual: 17000000, cost_forecast: 17000000, profit_budget: 5435089, profit_target: 7056481, profit_actual: 9953539, profit_forecast: 9953539 },
  { month: '2月', sales_budget: 15599332, sales_target: 17265154, sales_actual: null, sales_forecast: 16000000, cost_budget: 20818875, cost_target: 20818875, cost_actual: null, cost_forecast: 20000000, profit_budget: -5219543, profit_target: -3553721, profit_actual: null, profit_forecast: -4000000 },
  { month: '3月', sales_budget: 17366039, sales_target: 18874662, sales_actual: null, sales_forecast: 18000000, cost_budget: 20634055, cost_target: 20634055, cost_actual: null, cost_forecast: 20000000, profit_budget: -3268017, profit_target: -1759394, profit_actual: null, profit_forecast: -2000000 },
];

const MOCK_NEW_DATA: NewSalesRecord[] = [
  { segment: 'Enterprise', budget: 5000, target: 5500, actual: 4800, last_year: 4000, count: 5, win_rate: 35, lead_time: 120, unit_price: 840, id_price: 2000, duration: 12 },
  { segment: 'Mid', budget: 3000, target: 3300, actual: 3200, last_year: 2800, count: 12, win_rate: 45, lead_time: 60, unit_price: 291, id_price: 1500, duration: 12 },
  { segment: 'Small', budget: 1500, target: 1800, actual: 1600, last_year: 1200, count: 30, win_rate: 60, lead_time: 30, unit_price: 60, id_price: 1200, duration: 12 },
];

const MOCK_EXISTING_DATA: ExistingSalesRecord[] = [
  { segment: 'Enterprise', sales: 12134547, nrr: 60.1, renewal: 92.3, id_growth: 63.9 },
  { segment: 'Mid', sales: 6942000, nrr: 61.3, renewal: 60.0, id_growth: 68.2 },
  { segment: 'Small', sales: 690000, nrr: 83.6, renewal: 100.0, id_growth: 92.0 },
];

const MOCK_LIST_DATA: ListRecord[] = [
  { category: 'NewDeal', date: '2025/01/10', name: 'Fの杜', segment: 'Enterprise', amount: 2200, count: 80, owner: '佐藤', status: '受注', memo: 'Web完結プラン', extra1: '' },
  { category: 'AdvisorDeal', date: '2025/12/29', name: '株式会社乃村工藝社', segment: 'Mid', amount: 716000, count: 2, owner: 'Mukai', status: '初回商談', memo: '3月の新体制発足後に再度ご連絡。コーチバディの芽がある。', extra1: 'エスプール' },
  { category: 'AdvisorDeal', date: '2025/12/24', name: '株式会社PILLAR', segment: 'Enterprise', amount: 990000, count: 30, owner: 'Mukai', status: 'ヨミ', memo: '予算はあるが、研修を必須にするか希望者にするかで揺れている。', extra1: 'DYM' },
  { category: 'Trial', date: '2025/12/22', name: '有限会社新浦安ホテルマネージメント', segment: 'Mid', amount: 500000, count: 0, owner: '', status: '', memo: '', extra1: '' },
  { category: 'Trial', date: '2025/12/09', name: 'エーオンジャパン株式会社', segment: 'Small', amount: 400000, count: 0, owner: '', status: '', memo: 'Speakに競合負け。音声認識精度は高評価だが、スピーキング向上に直結しにくいとの声。', extra1: '2025/12/23' },
  { category: 'Trial', date: '2025/12/25', name: '独立行政法人国民生活センター', segment: 'Small', amount: 400000, count: 0, owner: '', status: '', memo: '', extra1: '2026/01/18' },
  { category: 'PipelineNew', date: '2026-2月', name: 'マニー株式会社', segment: 'Mid', amount: 4950000, count: 0, owner: '', status: '', memo: '', extra1: 'Challenge- (確度50%以下リスク有)' },
  { category: 'PipelineNew', date: '', name: 'NIPPON EXPRESSホールディングス株式会社', segment: 'Mid', amount: 7084000, count: 0, owner: '', status: '', memo: '', extra1: 'Challenge+ (確度50%以上リスク有)' },
  { category: 'PipelineNew', date: '2026-3月', name: '株式会社電通コーポレートワン', segment: 'Enterprise', amount: 6468000, count: 0, owner: '', status: '', memo: '', extra1: 'Challenge+ (確度50%以上リスク有)' },
  { category: 'PipelineExist', date: '2026-1月', name: '東急リゾーツ＆ステイ株式会社', segment: 'Enterprise', amount: 3510000, count: 0, owner: '', status: '', memo: '', extra1: 'Challenge+ (確度50%以上リスク有)' },
];

const MOCK_OKR_DATA: OkrRecord[] = [
  { key_result: "635件", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "160件", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "6社/150%", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
];

const MOCK_MARKETING_DATA: MarketingRecord[] = [
  { type: 'Source', label: 'Web (Inbound)', val1: 2500, val2: 400, val3: 80, val4: 5000000, val5: 0 },
  { type: 'Source', label: 'Event', val1: 1200, val2: 150, val3: 30, val4: 8000000, val5: 0 },
  { type: 'Campaign', label: '[EV] HR Momentum', val1: 99, val2: 46, val3: 72, val4: 0, val5: 0 },
  { type: 'Funnel_Month', label: 'リード獲得', val1: 200, val2: 400, val3: 600, val4: 0, val5: 0 },
  { type: 'Funnel_Month', label: '商談化', val1: 80, val2: 150, val3: 220, val4: 0, val5: 0 },
];

const MOCK_PIPELINE_AGG: PipelineRecord[] = [
  { type: 'Amount', segment: 'Enterprise', m1: 16289417, m2: 11874840, m3: 11849760, m4: 50826379, m5: 10098414, m6: 18688880 },
  { type: 'Amount', segment: 'Mid', m1: 15735600, m2: 8430892, m3: 3949990, m4: 16900000, m5: 1621000, m6: 1924000 },
];

const MOCK_OTHER_DATA: OtherRecord[] = [
  { type: 'Segment', name: '企業代理店', val1: 1000, val2: 0, val3: 1100 },
  { type: 'Partner', name: 'Partner A', val1: 1200, val2: 0, val3: 0 },
];

const MOCK_ADVISOR_DATA: AdvisorRecord[] = [
  { source: 'エスプール', cost: 500000, referrals: 10, lost: 4, ongoing: 4, won: 2, revenue: 3000000 },
  { source: 'DYM', cost: 300000, referrals: 5, lost: 2, ongoing: 2, won: 1, revenue: 1500000 },
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
  return (
    <span className={`px-2 py-0.5 rounded-full font-bold border ${bgColor} ${textColor} ${borderColor} text-[10px]`}>
      {label} {formatPercent(value)}
    </span>
  );
};


// ==========================================
// 5. メインコンポーネント (CBDashboard)
// ==========================================

export default function CBDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  // Data States
  const [salesData, setSalesData] = useState<SalesRecord[]>(MOCK_SALES_DATA);
  const [newSalesData, setNewSalesData] = useState<NewSalesRecord[]>(MOCK_NEW_DATA);
  const [existingSalesData, setExistingSalesData] = useState<ExistingSalesRecord[]>(MOCK_EXISTING_DATA);
  const [okrData, setOkrData] = useState<OkrRecord[]>(MOCK_OKR_DATA);
  const [marketingData, setMarketingData] = useState<MarketingRecord[]>(MOCK_MARKETING_DATA);
  const [pipelineData, setPipelineData] = useState<PipelineRecord[]>(MOCK_PIPELINE_AGG);
  const [otherData, setOtherData] = useState<OtherRecord[]>(MOCK_OTHER_DATA);
  const [advisorData, setAdvisorData] = useState<AdvisorRecord[]>(MOCK_ADVISOR_DATA);
  const [listData, setListData] = useState<ListRecord[]>(MOCK_LIST_DATA);

  // Input States
  const [sheetInput, setSheetInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  // Effects
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

  // Handlers
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
        setListData(prev => [...prev.filter(d => !['NewDeal','Renewed','NotRenewed','Fluctuation','HighValue'].includes(d.category)), ...parseCSV(r3)]);
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
        setListData(prev => [...prev.filter(d => !['AdvisorDeal','Trial'].includes(d.category)), ...parseCSV(r2)]);
      } else if (key === 'pipeline') {
        const [r1, r2] = await Promise.all([
          fetch(baseUrl + 'Pipeline_Agg').then(r => r.text()),
          fetch(baseUrl + 'Lists').then(r => r.text())
        ]);
        setPipelineData(parseCSV(r1));
        setListData(prev => [...prev.filter(d => !['PipelineNew','PipelineExist'].includes(d.category)), ...parseCSV(r2)]);
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
        return <OverviewTab 
          data={salesData} 
        />;
      case 'sales': 
        return <SalesAnalysisTab 
          newData={newSalesData} 
          existData={existingSalesData} 
          listData={listData} 
        />;
      case 'other': 
        return <OtherSalesTab 
          otherData={otherData} 
        />;
      case 'marketing': 
        return <MarketingAnalysisTab 
          mktData={marketingData} 
        />;
      case 'negotiation': 
        return <NegotiationAnalysisTab 
          advisorData={advisorData} 
          listData={listData} 
        />;
      case 'pipeline': 
        return <PipelineAnalysisTab 
          pipeData={pipelineData} 
          listData={listData} 
        />;
      case 'okr': 
        return <OkrActionTab 
          okrData={okrData} 
        />;
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
                   <p className="text-xs text-indigo-400 mt-1">必要タブ: {config.tabs.join(', ')}</p>
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
  // データチェック (If empty, fallback to mock is handled in parent state initialization)
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
                           label={({name, percent}: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
   const safeAdvisorData = Array.isArray(advisorData) ? advisorData : [];
   
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