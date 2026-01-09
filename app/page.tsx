"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, PieChart, Pie, Cell, ReferenceLine, Label, LabelList, RadialBarChart, RadialBar,
  Funnel, FunnelChart, LabelList as FunnelLabelList
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, Activity, Target,
  Link as LinkIcon, RefreshCw, CheckCircle, Info,
  Building, FileText, CheckSquare, XSquare, AlertCircle, Layers, Globe, GraduationCap, Users,
  PieChart as PieChartIcon, Filter, Megaphone, DollarSign
} from 'lucide-react';

// --- 型定義 ---
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

type ExistingSalesRecord = {
  segment: string;
  sales: number;
  nrr: number;
  renewal: number;
  id_growth: number;
};

// --- 初期モックデータ (Main) ---
const INITIAL_SALES_DATA: SalesRecord[] = [
  { month: '4月', sales_budget: 12000, sales_target: 13000, sales_actual: 12500, sales_forecast: 12500, cost_budget: 4800, cost_target: 5200, cost_actual: 5000, cost_forecast: 5000, profit_budget: 7200, profit_target: 7800, profit_actual: 7500, profit_forecast: 7500 },
  { month: '5月', sales_budget: 13000, sales_target: 14000, sales_actual: 12800, sales_forecast: 12800, cost_budget: 5200, cost_target: 5600, cost_actual: 5120, cost_forecast: 5120, profit_budget: 7800, profit_target: 8400, profit_actual: 7680, profit_forecast: 7680 },
  { month: '6月', sales_budget: 14000, sales_target: 15000, sales_actual: 14500, sales_forecast: 14500, cost_budget: 5600, cost_target: 6000, cost_actual: 5800, cost_forecast: 5800, profit_budget: 8400, profit_target: 9000, profit_actual: 8700, profit_forecast: 8700 },
  { month: '7月', sales_budget: 15000, sales_target: 16000, sales_actual: 16000, sales_forecast: 16000, cost_budget: 6000, cost_target: 6400, cost_actual: 6400, cost_forecast: 6400, profit_budget: 9000, profit_target: 9600, profit_actual: 9600, profit_forecast: 9600 },
  { month: '8月', sales_budget: 16000, sales_target: 17000, sales_actual: 15800, sales_forecast: 15800, cost_budget: 6400, cost_target: 6800, cost_actual: 6320, cost_forecast: 6320, profit_budget: 9600, profit_target: 10200, profit_actual: 9480, profit_forecast: 9480 },
  { month: '9月', sales_budget: 17000, sales_target: 18000, sales_actual: 18200, sales_forecast: 18200, cost_budget: 6800, cost_target: 7200, cost_actual: 6916, cost_forecast: 6916, profit_budget: 10200, profit_target: 10800, profit_actual: 11284, profit_forecast: 11284 },
  { month: '10月', sales_budget: 18000, sales_target: 19500, sales_actual: null, sales_forecast: 19000, cost_budget: 7200, cost_target: 7800, cost_actual: null, cost_forecast: 7600, profit_budget: 10800, profit_target: 11700, profit_actual: null, profit_forecast: 11400 },
  { month: '11月', sales_budget: 19000, sales_target: 20500, sales_actual: null, sales_forecast: 19500, cost_budget: 7600, cost_target: 8200, cost_actual: null, cost_forecast: 7800, profit_budget: 11400, profit_target: 12300, profit_actual: null, profit_forecast: 11700 },
  { month: '12月', sales_budget: 20000, sales_target: 21500, sales_actual: null, sales_forecast: 21000, cost_budget: 8000, cost_target: 8600, cost_actual: null, cost_forecast: 8400, profit_budget: 12000, profit_target: 12900, profit_actual: null, profit_forecast: 12600 },
  { month: '1月', sales_budget: 21000, sales_target: 22500, sales_actual: null, sales_forecast: 22000, cost_budget: 8400, cost_target: 9000, cost_actual: null, cost_forecast: 8800, profit_budget: 12600, profit_target: 13500, profit_actual: null, profit_forecast: 13200 },
  { month: '2月', sales_budget: 22000, sales_target: 23500, sales_actual: null, sales_forecast: 22500, cost_budget: 8800, cost_target: 9400, cost_actual: null, cost_forecast: 9000, profit_budget: 13200, profit_target: 14100, profit_actual: null, profit_forecast: 13500 },
  { month: '3月', sales_budget: 23000, sales_target: 25000, sales_actual: null, sales_forecast: 24000, cost_budget: 9200, cost_target: 10000, cost_actual: null, cost_forecast: 9600, profit_budget: 13800, profit_target: 15000, profit_actual: null, profit_forecast: 14400 },
];

const MOCK_NEW_SALES_DATA: NewSalesRecord[] = [
  { segment: 'Enterprise', budget: 5000, target: 5500, actual: 4800, last_year: 4000, count: 5, win_rate: 35, lead_time: 120, unit_price: 840, id_price: 2000, duration: 12 },
  { segment: 'Mid', budget: 3000, target: 3300, actual: 3200, last_year: 2800, count: 12, win_rate: 45, lead_time: 60, unit_price: 291, id_price: 1500, duration: 12 },
  { segment: 'Small', budget: 1500, target: 1800, actual: 1600, last_year: 1200, count: 30, win_rate: 60, lead_time: 30, unit_price: 60, id_price: 1200, duration: 12 },
];

const INITIAL_EXISTING_SALES: ExistingSalesRecord[] = [
  { segment: 'Enterprise', sales: 12134547, nrr: 60.1, renewal: 92.3, id_growth: 63.9 },
  { segment: 'Mid', sales: 6942000, nrr: 61.3, renewal: 60.0, id_growth: 68.2 },
  { segment: 'Small', sales: 690000, nrr: 83.6, renewal: 100.0, id_growth: 92.0 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#82ca9d', '#ffc658', '#8884d8'];
const PIE_COLORS = { on: '#10b981', off: '#e2e8f0' };

// --- ヘルパー関数 ---
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
      } else if (!isNaN(Number(val))) {
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

// --- メインコンポーネント ---
export default function CBDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesData, setSalesData] = useState<SalesRecord[]>(INITIAL_SALES_DATA);
  const [newSalesData, setNewSalesData] = useState<NewSalesRecord[]>(MOCK_NEW_SALES_DATA);
  const [existingSalesData, setExistingSalesData] = useState<ExistingSalesRecord[]>(INITIAL_EXISTING_SALES);

  const [sheetInput, setSheetInput] = useState('1UijNvely71JDu73oBoBpho9P84fT-yPmNH2QVVstwO4'); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');
  
  const [prevMonthName, setPrevMonthName] = useState<string>('');
  const [thisMonthName, setThisMonthName] = useState<string>('');
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // デモ用: 9月基準 (インデックス5 = 9月)
    const mIndex = 5; 
    const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
    
    setThisMonthName(months[mIndex]);
    setPrevMonthName(months[mIndex - 1] || months[11]);
    setCurrentMonthIndex(mIndex);
    
    if (sheetInput) {
       handleSheetSync();
    }
  }, []);

  const handleSheetSync = async () => {
    if (!sheetInput) return;
    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage('');
    
    try {
      const idMatch = sheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const cleanId = idMatch ? idMatch[1] : sheetInput;

      const sheets = ['Main', 'New', 'Existing'];
      const requests = sheets.map(sheetName => 
        fetch(`https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`)
          .then(res => {
            if (!res.ok) throw new Error(`${sheetName} tab fetch failed`);
            return res.text();
          })
      );

      const results = await Promise.all(requests);

      const mainData = parseCSV(results[0]);
      if (mainData.length > 0) setSalesData(mainData);

      const newData = parseCSV(results[1]);
      if (newData.length > 0 && newData[0].segment) {
          setNewSalesData(newData);
      }

      const existData = parseCSV(results[2]);
      if (existData.length > 0) setExistingSalesData(existData);

      setSyncStatus('success');
      setFileName(`All Sheets Synced`);
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error: any) {
      console.error(error);
      setSyncStatus('error');
      setErrorMessage('シート読込失敗: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const prevMonthData = prevMonthName 
    ? (salesData.find(d => d.month === prevMonthName) || salesData[salesData.length - 2] || salesData[0])
    : salesData[0];

  const thisMonthData = thisMonthName
    ? (salesData.find(d => d.month === thisMonthName) || salesData[salesData.length - 1] || salesData[0])
    : salesData[0];

  if (!isClient) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={salesData} prevData={prevMonthData} thisData={thisMonthData} monthIndex={currentMonthIndex} />;
      case 'sales': return <SalesAnalysisTab newSalesData={newSalesData} existingSalesData={existingSalesData} />;
      case 'other': return <OtherSalesTab />;
      case 'process': return <ProcessAnalysisTab />;
      case 'future': return <FutureActionTab data={salesData} />;
      default: return <OverviewTab data={salesData} prevData={prevMonthData} thisData={thisMonthData} monthIndex={currentMonthIndex} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-20 overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">SB</div>
            <span>Corporate Div.</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">経営管理ダッシュボード v24.12.01</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem id="overview" label="サマリー / 予実" icon={<LayoutDashboard size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="sales" label="企業直販売上分" icon={<TrendingUp size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="other" label="その他売上" icon={<Layers size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="process" label="要因・プロセス" icon={<Activity size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="future" label="未来・アクション" icon={<Target size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

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
                  placeholder="標準ID"
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
              <div className="mt-2 flex items-start gap-1 text-[10px] text-slate-400">
                <Info size={12} className="mt-0.5 shrink-0" />
                <p>3つのシート(Main, New, Existing)を読込中</p>
              </div>
            </div>
            {fileName && syncStatus === 'success' && (
               <div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-800/50 rounded text-[10px] text-emerald-300 truncate">{fileName}</div>
            )}
            {syncStatus === 'error' && (
              <div className="mt-2 p-2 bg-rose-900/30 border border-rose-800/50 rounded text-[10px] text-rose-300 leading-tight">⚠ {errorMessage}</div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'overview' && '月次売上および今後の売上予測'}
              {activeTab === 'sales' && '企業直販売上分 (新規/既存)'}
              {activeTab === 'other' && 'その他売上分析 (代理店・優待・学校)'}
              {activeTab === 'process' && 'プロセス・要因分析'}
              {activeTab === 'future' && '未来予測とアクションプラン'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium">山田 太郎</p>
                <p className="text-xs text-slate-500">法人事業部長</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">YT</div>
          </div>
        </header>

        <div className="p-8 pb-20">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

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

// --- OverviewTab (省略: 既存コード利用) ---
const OverviewTab = ({ data, prevData, thisData, monthIndex }: any) => {
  if (!prevData || !thisData || !data) return <div className="p-8 text-slate-500">Loading data...</div>;
  // (省略) 前回のコードと同じ内容
  return <div className="text-center p-10 text-slate-500">Overview Content (Use previous code)</div>;
};

// --- Sales Analysis Tab (省略: 既存コード利用) ---
const SalesAnalysisTab = ({ newSalesData, existingSalesData }: any) => {
  // (省略) 前回のコードと同じ内容
  return <div className="text-center p-10 text-slate-500">Sales Analysis Content (Use previous code)</div>;
};

// --- Other Sales Tab (省略: 既存コード利用) ---
const OtherSalesTab = () => {
  // (省略) 前回のコードと同じ内容
  return <div className="text-center p-10 text-slate-500">Other Sales Content (Use previous code)</div>;
};

// --- Process Analysis Tab (New Updates) ---
const ProcessAnalysisTab = () => {
  // Mock Data for Process Analysis
  const segmentFunnelData = [
    { stage: 'リード獲得', Ent: 200, Mid: 400, Small: 600 },
    { stage: '商談化', Ent: 80, Mid: 150, Small: 220 },
    { stage: '提案', Ent: 40, Mid: 70, Small: 90 },
    { stage: '受注', Ent: 15, Mid: 25, Small: 45 },
  ];

  const totalFunnelData = [
    { value: 1200, name: 'リード獲得', fill: '#6366f1' },
    { value: 450, name: '商談化', fill: '#10b981' },
    { value: 200, name: '提案', fill: '#f59e0b' },
    { value: 85, name: '受注', fill: '#ef4444' },
  ];

  const currentStockData = {
    leads: 3450,
    activeOpps: 420,
    activeTrials: 115
  };

  const campaignLeadData = [
    { name: '[EV] HR Momentum_20251204', ent: 99, mid: 46, sml: 72, unk: 22 },
    { name: '[EV] 251203_ SBI Innovation Conference', ent: 0, mid: 0, sml: 0, unk: 8 },
    { name: '[OG] Website Tracking (sbbiz.jp)', ent: 2, mid: 2, sml: 1, unk: 0 },
    { name: '[OG] 法人向け | お問い合わせ (Web経由)', ent: 0, mid: 0, sml: 3, unk: 0 },
    { name: '[OG] 法人向け | サービス紹介資料DL (Web経由)', ent: 0, mid: 0, sml: 6, unk: 0 },
    { name: '未入力', ent: 84, mid: 34, sml: 37, unk: 24 },
  ];

  const campaignOppData = [
    { name: '[EV] HR Momentum_20251204', ent: 15, mid: 8, sml: 12, unk: 0 },
    { name: '[EV] 251203_ SBI Innovation Conference', ent: 0, mid: 0, sml: 0, unk: 1 },
    { name: '[OG] Website Tracking (sbbiz.jp)', ent: 1, mid: 0, sml: 0, unk: 0 },
    { name: '[OG] 法人向け | お問い合わせ (Web経由)', ent: 0, mid: 0, sml: 1, unk: 0 },
    { name: '未入力', ent: 5, mid: 2, sml: 3, unk: 0 },
  ];

  const sourceData = [
    { source: 'Web (Inbound)', leads: 2500, opps: 400, cost: 5000000 },
    { source: 'Event / Seminar', leads: 1200, opps: 150, cost: 8000000 },
    { source: 'Outbound (SDR)', leads: 800, opps: 120, cost: 4000000 },
    { source: 'Referral / Partner', leads: 300, opps: 80, cost: 500000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* 1. Funnel Analysis (Side by Side) */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Segment Stacked Bar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Filter size={20} className="text-indigo-600" />
               当月セグメント別 ファネル (積上)
             </h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={segmentFunnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" width={80} tick={{fontSize: 12}} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Ent" stackId="a" fill="#1e5fa0" />
                      <Bar dataKey="Mid" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="Small" stackId="a" fill="#f59e0b" />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Total Funnel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Filter size={20} className="text-indigo-600" />
               当月合計 ファネル
             </h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <FunnelChart>
                      <Tooltip />
                      <Funnel
                        dataKey="value"
                        data={totalFunnelData}
                        isAnimationActive
                      >
                        <FunnelLabelList position="right" fill="#000" stroke="none" dataKey="name" />
                      </Funnel>
                   </FunnelChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>

       {/* 2. Current Stock KPI */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
             <div>
                <p className="text-sm text-slate-500 font-bold mb-1">現在の合計リード数 (Stock)</p>
                <p className="text-3xl font-extrabold text-indigo-600">{currentStockData.leads.toLocaleString()}</p>
             </div>
             <div className="p-3 bg-indigo-50 rounded-full text-indigo-600"><Users size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
             <div>
                <p className="text-sm text-slate-500 font-bold mb-1">現在稼働している商談数</p>
                <p className="text-3xl font-extrabold text-emerald-600">{currentStockData.activeOpps.toLocaleString()}</p>
             </div>
             <div className="p-3 bg-emerald-50 rounded-full text-emerald-600"><Briefcase size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
             <div>
                <p className="text-sm text-slate-500 font-bold mb-1">現在稼働しているトライアル数</p>
                <p className="text-3xl font-extrabold text-amber-500">{currentStockData.activeTrials.toLocaleString()}</p>
             </div>
             <div className="p-3 bg-amber-50 rounded-full text-amber-500"><CheckCircle size={24} /></div>
          </div>
       </div>

       {/* 3. Campaign Tables */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Megaphone size={20} className="text-rose-500" />
             キャンペーン別 獲得分析 (当月)
          </h3>
          
          {/* Leads Table */}
          <h4 className="text-sm font-bold text-slate-600 mb-2 border-l-4 border-slate-400 pl-2">キャンペーン別 獲得リード数</h4>
          <div className="overflow-x-auto mb-8">
             <table className="w-full text-sm text-right whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 border-b-2 border-slate-400">
                   <tr>
                      <th className="p-2 text-left">キャンペーン名</th><th className="p-2">Enterprise</th><th className="p-2">Mid</th><th className="p-2">Small</th><th className="p-2">未入力</th><th className="p-2">総計</th>
                   </tr>
                </thead>
                <tbody>
                   {campaignLeadData.map((c, i) => {
                      const total = c.ent + c.mid + c.sml + c.unk;
                      return (
                         <tr key={i} className="hover:bg-slate-50 border-b border-slate-100">
                            <td className="p-2 text-left">{c.name}</td><td>{c.ent}</td><td>{c.mid}</td><td>{c.sml}</td><td>{c.unk}</td><td className="font-bold">{total}</td>
                         </tr>
                      );
                   })}
                   <tr className="bg-slate-50 font-bold">
                      <td className="p-2 text-left">総計</td>
                      <td>{campaignLeadData.reduce((a,b)=>a+b.ent,0)}</td>
                      <td>{campaignLeadData.reduce((a,b)=>a+b.mid,0)}</td>
                      <td>{campaignLeadData.reduce((a,b)=>a+b.sml,0)}</td>
                      <td>{campaignLeadData.reduce((a,b)=>a+b.unk,0)}</td>
                      <td>{campaignLeadData.reduce((a,b)=>a+(b.ent+b.mid+b.sml+b.unk),0)}</td>
                   </tr>
                </tbody>
             </table>
          </div>

          {/* Opps Table */}
          <h4 className="text-sm font-bold text-slate-600 mb-2 border-l-4 border-slate-400 pl-2">キャンペーン別 商談化数</h4>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-right whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 border-b-2 border-slate-400">
                   <tr>
                      <th className="p-2 text-left">キャンペーン名</th><th className="p-2">Enterprise</th><th className="p-2">Mid</th><th className="p-2">Small</th><th className="p-2">未入力</th><th className="p-2">総計</th>
                   </tr>
                </thead>
                <tbody>
                   {campaignOppData.map((c, i) => {
                      const total = c.ent + c.mid + c.sml + c.unk;
                      return (
                         <tr key={i} className="hover:bg-slate-50 border-b border-slate-100">
                            <td className="p-2 text-left">{c.name}</td><td>{c.ent}</td><td>{c.mid}</td><td>{c.sml}</td><td>{c.unk}</td><td className="font-bold">{total}</td>
                         </tr>
                      );
                   })}
                   <tr className="bg-slate-50 font-bold">
                      <td className="p-2 text-left">総計</td>
                      <td>{campaignOppData.reduce((a,b)=>a+b.ent,0)}</td>
                      <td>{campaignOppData.reduce((a,b)=>a+b.mid,0)}</td>
                      <td>{campaignOppData.reduce((a,b)=>a+b.sml,0)}</td>
                      <td>{campaignOppData.reduce((a,b)=>a+b.unk,0)}</td>
                      <td>{campaignOppData.reduce((a,b)=>a+(b.ent+b.mid+b.sml+b.unk),0)}</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       {/* 4. Source Analysis */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <DollarSign size={20} className="text-amber-500" />
             ソース別 費用対効果分析 (累積)
          </h3>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-right whitespace-nowrap">
                <thead className="bg-amber-50 text-amber-900 border-b-2 border-amber-200">
                   <tr>
                      <th className="p-3 text-left">ソース</th><th className="p-3">獲得リード数</th><th className="p-3">商談化数</th><th className="p-3">商談化率</th><th className="p-3">総コスト (概算)</th><th className="p-3">CPL (リード単価)</th><th className="p-3">CPO (商談単価)</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {sourceData.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                         <td className="p-3 text-left font-bold">{s.source}</td>
                         <td className="p-3">{s.leads.toLocaleString()}</td>
                         <td className="p-3">{s.opps.toLocaleString()}</td>
                         <td className="p-3 font-bold text-indigo-600">{((s.opps/s.leads)*100).toFixed(1)}%</td>
                         <td className="p-3">¥{s.cost.toLocaleString()}</td>
                         <td className="p-3">¥{Math.round(s.cost/s.leads).toLocaleString()}</td>
                         <td className="p-3">¥{Math.round(s.cost/s.opps).toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

    </div>
  );
};

const FutureActionTab = ({ data }: any) => {
    // (省略) 前回のコードと同じ内容
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex items-center justify-center text-slate-400">
            Future Action Content (Use previous code)
        </div>
    );
};