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
  Flag, ArrowRight, Rocket, Settings, Volume2
} from 'lucide-react';

// ==========================================
// 型定義
// ==========================================
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

// OKR用の型定義
type OkrRecord = {
  key_result: string;
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
};

// ==========================================
// 定数・モックデータ定義
// ==========================================
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#82ca9d', '#ffc658', '#8884d8'];
const PIE_COLORS = { on: '#10b981', off: '#e2e8f0' };

// メイン売上データ
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

// OKR用初期データ
const INITIAL_OKR_DATA: OkrRecord[] = [
  { key_result: "635件", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "160件", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "6社/150%", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "30%削減", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "オンボーディング標準化", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "3KPI/10%改善", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "競合調査", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "勝率80%", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
  { key_result: "サイト改修/10件", jan: "", feb: "", mar: "", apr: "", may: "", jun: "" },
];

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

// --- Helper Components ---
const CircularRate = ({ label, value, color }: { label: string, value: number, color: string }) => {
  const data = [{ name: 'Val', value: value }, { name: 'Rest', value: 100 - (value > 100 ? 0 : value) }];
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={20} outerRadius={28} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              <Cell fill={color} /><Cell fill={PIE_COLORS.off} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{value.toFixed(1)}%</div>
      </div>
      <span className="text-[10px] font-bold text-slate-600 mt-1">{label}</span>
    </div>
  );
};

const SegmentCard = ({ title, data, colorClass, isAnnual = false }: any) => (
  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full bg-white">
    <div className={`${colorClass} text-white py-2 text-center font-bold text-sm uppercase`}>{title} {isAnnual ? '(FY25通年)' : ''}</div>
    <div className="p-4 flex flex-col items-center justify-between flex-1">
      <div className="text-center mb-4">
        <p className="text-[10px] text-slate-500 font-bold mb-1">売上金額(円)</p>
        <p className="text-xl font-extrabold text-slate-800">{Number(data.sales).toLocaleString()}</p>
      </div>
      <div className="flex justify-between w-full px-1">
        <CircularRate label="NRR" value={Number(data.nrr)} color="#10b981" />
        <CircularRate label="更新率" value={Number(data.renewal)} color="#3b82f6" />
        <CircularRate label="ID増減" value={Number(data.id_growth)} color="#f59e0b" />
      </div>
    </div>
  </div>
);

const GaugeChart = ({ title, budget, target, actual }: any) => {
  const budRate = budget ? Math.min((actual / budget) * 100, 100) : 0;
  const tarRate = target ? Math.min((actual / target) * 100, 100) : 0;
  return (
    <div className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-lg">
      <h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4>
      <div className="w-full space-y-2">
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5"><span>予算比</span><span>{budget ? Math.round((actual/budget)*100) : 0}%</span></div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${budRate}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5"><span>目標比</span><span>{target ? Math.round((actual/target)*100) : 0}%</span></div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${tarRate}%` }}></div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
         <span className="text-lg font-bold text-slate-800">{actual.toLocaleString()}</span>
         <span className="text-[10px] text-slate-400 ml-1">/ Target: {target.toLocaleString()}</span>
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
// メインコンポーネント (CBDashboard)
// ==========================================
export default function CBDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesData, setSalesData] = useState<SalesRecord[]>(INITIAL_SALES_DATA);
  const [newSalesData, setNewSalesData] = useState<NewSalesRecord[]>(MOCK_NEW_SALES_DATA);
  const [existingSalesData, setExistingSalesData] = useState<ExistingSalesRecord[]>(INITIAL_EXISTING_SALES);
  const [okrData, setOkrData] = useState<OkrRecord[]>(INITIAL_OKR_DATA);

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

      // OKRシートも含めて4つ取得
      const requests = ['Main', 'New', 'Existing', 'OKR'].map(sheetName => 
        fetch(`https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`)
          .then(res => res.text())
      );

      const results = await Promise.all(requests);

      const mainData = parseCSV(results[0]);
      if (mainData.length > 0) setSalesData(mainData);

      const newData = parseCSV(results[1]);
      if (newData.length > 0 && newData[0].segment) setNewSalesData(newData);

      const existData = parseCSV(results[2]);
      if (existData.length > 0) setExistingSalesData(existData);

      const okrDataParsed = parseCSV(results[3]);
      if (okrDataParsed.length > 0 && okrDataParsed[0].key_result) setOkrData(okrDataParsed);

      setSyncStatus('success');
      setFileName(`All Sheets Synced (incl. OKR)`);
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error: any) {
      setSyncStatus('error');
      setErrorMessage('シート読込失敗: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const prevMonthData = prevMonthName 
    ? (salesData.find(d => d.month === prevMonthName) || salesData[0])
    : salesData[0];

  const thisMonthData = thisMonthName
    ? (salesData.find(d => d.month === thisMonthName) || salesData[0])
    : salesData[0];

  if (!isClient) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={salesData} prevData={prevMonthData} thisData={thisMonthData} monthIndex={currentMonthIndex} />;
      case 'sales': return <SalesAnalysisTab newSalesData={newSalesData} existingSalesData={existingSalesData} />;
      case 'other': return <OtherSalesTab />;
      case 'marketing': return <MarketingAnalysisTab />;
      case 'negotiation': return <NegotiationAnalysisTab />;
      case 'pipeline': return <PipelineAnalysisTab />;
      case 'okr': return <OkrActionTab okrData={okrData} />;
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
          <p className="text-xs text-slate-400 mt-2">経営管理ダッシュボード v24.12.26</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem id="overview" label="サマリー / 予実" icon={<LayoutDashboard size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="sales" label="企業直販売上分" icon={<TrendingUp size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="other" label="その他売上" icon={<Layers size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="marketing" label="マーケ施策・分析" icon={<Activity size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="negotiation" label="商談・トライアル分析" icon={<Presentation size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="pipeline" label="パイプライン分析" icon={<Target size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="okr" label="OKR・今後のアクション" icon={<Flag size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
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
                <p>4つのシート(Main,New,Exist,OKR)を読込中</p>
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
              {activeTab === 'marketing' && 'マーケ施策・分析'}
              {activeTab === 'negotiation' && '商談・トライアル分析レポート'}
              {activeTab === 'pipeline' && 'パイプライン分析'}
              {activeTab === 'okr' && 'OKR・今後のアクション'}
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

// ==========================================
// 1. Overview Tab
// ==========================================
const OverviewTab = ({ data, prevData, thisData, monthIndex }: any) => {
  if (!prevData || !thisData || !data) return <div className="p-8 text-slate-500">Loading data...</div>;

  const n = (val: any) => Number(val) || 0;
  const prevSalesBudget = n(prevData.sales_budget);
  const prevSalesTarget = n(prevData.sales_target);
  const prevSalesActual = n(prevData.sales_actual) || n(prevData.sales_forecast); 
  const thisSalesBudget = n(thisData.sales_budget);
  const thisSalesTarget = n(thisData.sales_target);
  const thisSalesForecast = n(thisData.sales_forecast); 

  const safeSum = (arr: any[], key: string) => arr.reduce((acc, cur) => acc + (Number(cur[key]) || 0), 0);
  const quarterIdx = Math.floor(monthIndex / 3);
  const quarterStartIdx = quarterIdx * 3;
  const qBudget = safeSum(data.slice(quarterStartIdx, quarterStartIdx + 3), 'sales_budget');
  const qTarget = safeSum(data.slice(quarterStartIdx, quarterStartIdx + 3), 'sales_target');
  const qForecast = safeSum(data.slice(quarterStartIdx, quarterStartIdx + 3), 'sales_forecast');
  
  const hBudget = safeSum(data.slice(monthIndex < 6 ? 0 : 6, monthIndex < 6 ? 6 : 12), 'sales_budget');
  const hTarget = safeSum(data.slice(monthIndex < 6 ? 0 : 6, monthIndex < 6 ? 6 : 12), 'sales_target');
  const hForecast = safeSum(data.slice(monthIndex < 6 ? 0 : 6, monthIndex < 6 ? 6 : 12), 'sales_forecast');

  const yBudget = safeSum(data, 'sales_budget');
  const yTarget = safeSum(data, 'sales_target');
  const yForecast = safeSum(data, 'sales_forecast');

  const prevChartData = [
    { name: '売上', budget: prevSalesBudget, target: prevSalesTarget, actual: prevSalesActual },
    { name: 'コスト', budget: n(prevData.cost_budget), target: n(prevData.cost_target), actual: n(prevData.cost_actual) },
    { name: '貢献利益', budget: n(prevData.profit_budget), target: n(prevData.profit_target), actual: n(prevData.profit_actual) },
  ];

  const prevTableData = [
    { name: '売上', budget: prevSalesBudget, target: prevSalesTarget, result: prevSalesActual },
    { name: 'コスト', budget: n(prevData.cost_budget), target: n(prevData.cost_target), result: n(prevData.cost_actual) },
    { name: '貢献利益', budget: n(prevData.profit_budget), target: n(prevData.profit_target), result: n(prevData.profit_actual) },
  ];

  const thisTableData = [
    { name: '売上', budget: thisSalesBudget, target: thisSalesTarget, result: thisSalesForecast },
    { name: 'コスト', budget: n(thisData.cost_budget), target: n(thisData.cost_target), result: n(thisData.cost_forecast) },
    { name: '貢献利益', budget: n(thisData.profit_budget), target: n(thisData.profit_target), result: n(thisData.profit_forecast) },
  ];

  const AchievementBadge = ({ label, value }: { label: string, value: number }) => {
    const isTarget = label.includes('目標');
    const bgColor = isTarget ? (value >= 100 ? 'bg-amber-100' : 'bg-white') : (value >= 100 ? 'bg-emerald-100' : 'bg-rose-100');
    const textColor = isTarget ? (value >= 100 ? 'text-amber-700' : 'text-slate-500') : (value >= 100 ? 'text-emerald-700' : 'text-rose-700');
    const borderColor = isTarget ? (value >= 100 ? 'border-amber-200' : 'border-slate-200') : (value >= 100 ? 'border-emerald-200' : 'border-rose-200');
    return (<span className={`px-2 py-0.5 rounded-full font-bold border ${bgColor} ${textColor} ${borderColor} text-[10px]`}>{label} {formatPercent(value)}</span>);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            [前月実績]
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prevChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{fontSize: 14, fontWeight: 'bold', fill: '#334155'}} />
              <YAxis tickFormatter={(value) => `¥${(value/1000).toLocaleString()}k`} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="budget" name="予算" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="target" name="目標" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="actual" name="実績" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-indigo-500 pl-3">[前月サマリー詳細]</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left">項目</th>
                <th className="py-3 px-4">予算</th>
                <th className="py-3 px-4">目標</th>
                <th className="py-3 px-4 font-bold text-slate-700">実績</th>
                <th className="py-3 px-4 text-rose-600">対予算比</th>
                <th className="py-3 px-4 text-amber-600">対目標比</th>
              </tr>
            </thead>
            <tbody>
              {prevTableData.map(r=>(
                <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-left font-bold">{r.name}</td>
                  <td className="py-4 px-4">{r.budget.toLocaleString()}</td>
                  <td className="py-4 px-4">{r.target.toLocaleString()}</td>
                  <td className="py-4 px-4 font-bold text-lg">{r.result.toLocaleString()}</td>
                  <td className="py-4 px-4 font-bold text-rose-600">{formatPercent(r.budget ? r.result/r.budget*100 : 0)}</td>
                  <td className="py-4 px-4 font-bold text-amber-600">{formatPercent(r.target ? r.result/r.target*100 : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">[当月サマリー詳細]</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left">項目</th>
                <th className="py-3 px-4">予算</th>
                <th className="py-3 px-4">目標</th>
                <th className="py-3 px-4 font-bold text-slate-700">予測</th>
                <th className="py-3 px-4 text-rose-600">対予算比</th>
                <th className="py-3 px-4 text-amber-600">対目標比</th>
              </tr>
            </thead>
            <tbody>
              {thisTableData.map(r=>(
                <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-left font-bold">{r.name}</td>
                  <td className="py-4 px-4">{r.budget.toLocaleString()}</td>
                  <td className="py-4 px-4">{r.target.toLocaleString()}</td>
                  <td className="py-4 px-4 font-bold text-lg">{r.result.toLocaleString()}</td>
                  <td className="py-4 px-4 font-bold text-rose-600">{formatPercent(r.budget ? r.result/r.budget*100 : 0)}</td>
                  <td className="py-4 px-4 font-bold text-amber-600">{formatPercent(r.target ? r.result/r.target*100 : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="sales_actual" name="実績" fill="#6366f1" barSize={30} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="sales_forecast" name="予測" stroke="#94a3b8" strokeDasharray="5 5" dot={{r: 3}} strokeWidth={2} />
                <Line type="monotone" dataKey="sales_budget" name="予算" stroke="#fb7185" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                <Line type="monotone" dataKey="sales_target" name="目標" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-800 mb-1 font-bold">四半期 ({quarterIdx+1}Q) 予測合計</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-slate-800">{formatCurrency(qForecast)}</span>
              </div>
              <div className="flex gap-2">
                 <span className={`px-2 py-0.5 rounded-full font-bold border bg-white text-slate-500 border-slate-200 text-[10px]`}>予算比 {formatPercent(qBudget ? qForecast/qBudget*100 : 0)}</span>
                 <span className={`px-2 py-0.5 rounded-full font-bold border bg-amber-100 text-amber-700 border-amber-200 text-[10px]`}>目標比 {formatPercent(qTarget ? qForecast/qTarget*100 : 0)}</span>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-800 mb-1 font-bold">半期 ({monthIndex < 6 ? '上期' : '下期'}) 予測合計</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-slate-800">{formatCurrency(hForecast)}</span>
              </div>
              <div className="flex gap-2">
                 <span className={`px-2 py-0.5 rounded-full font-bold border bg-white text-slate-500 border-slate-200 text-[10px]`}>予算比 {formatPercent(hBudget ? hForecast/hBudget*100 : 0)}</span>
                 <span className={`px-2 py-0.5 rounded-full font-bold border bg-amber-100 text-amber-700 border-amber-200 text-[10px]`}>目標比 {formatPercent(hTarget ? hForecast/hTarget*100 : 0)}</span>
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-xs text-emerald-800 mb-1 font-bold">年間予測合計</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-slate-800">{formatCurrency(yForecast)}</span>
              </div>
              <div className="flex gap-2">
                 <span className={`px-2 py-0.5 rounded-full font-bold border bg-white text-slate-500 border-slate-200 text-[10px]`}>予算比 {formatPercent(yBudget ? yForecast/yBudget*100 : 0)}</span>
                 <span className={`px-2 py-0.5 rounded-full font-bold border bg-amber-100 text-amber-700 border-amber-200 text-[10px]`}>目標比 {formatPercent(yTarget ? yForecast/yTarget*100 : 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. Sales Analysis Tab
// ==========================================
const SalesAnalysisTab = ({ newSalesData, existingSalesData }: { newSalesData: NewSalesRecord[], existingSalesData: ExistingSalesRecord[] }) => {
  const [subTab, setSubTab] = useState<'new' | 'existing'>('new');
  
  const fy26Cumulative = [
    { segment: 'Enterprise', budget: 30000, actual: 32000, count: 25, win_rate: 34, lead_time: 110, unit_price: 850, id_price: 2000, duration: 12 },
    { segment: 'Mid', budget: 18000, actual: 17500, count: 60, win_rate: 42, lead_time: 55, unit_price: 290, id_price: 1500, duration: 12 },
    { segment: 'Small', budget: 9000, actual: 9500, count: 150, win_rate: 58, lead_time: 25, unit_price: 63, id_price: 1200, duration: 12 },
  ];
  
  const monthlyTrend = [
    { month: '4月', count: 10, amount: 4000 },
    { month: '5月', count: 12, amount: 4500 },
    { month: '6月', count: 15, amount: 5000 },
    { month: '7月', count: 14, amount: 4800 },
    { month: '8月', count: 18, amount: 5500 },
    { month: '9月', count: 20, amount: 6200 },
  ];

  const thisMonthDealList = [
    { date: '2025/01/10', client: 'Fの杜', segment: 'Enterprise', amount: 2200, id_count: 80, duration: '12ヶ月', owner: '佐藤' },
    { date: '2025/01/08', client: 'G建設', segment: 'Mid', amount: 550, id_count: 25, duration: '12ヶ月', owner: '田中' },
    { date: '2025/01/05', client: 'Hデザイン', segment: 'Small', amount: 80, id_count: 8, duration: '12ヶ月', owner: '鈴木' },
  ];

  const dealList = [
    { date: '2024/09/25', client: '株式会社A商事', segment: 'Enterprise', amount: 1500, id_count: 50, duration: '12ヶ月', owner: '佐藤' },
    { date: '2024/09/20', client: 'Bテック株式会社', segment: 'Mid', amount: 400, id_count: 20, duration: '12ヶ月', owner: '田中' },
  ];

  const fy25AnnualExisting = [
    { segment: 'Enterprise', sales: 145000000, nrr: 112.5, renewal: 95.0, id_growth: 108.0 },
    { segment: 'Mid', sales: 82000000, nrr: 101.2, renewal: 88.5, id_growth: 102.0 },
    { segment: 'Small', sales: 35000000, nrr: 92.0, renewal: 82.0, id_growth: 95.0 },
  ];

  const highValueProspects = [
    { client: '株式会社イノベーション', segment: 'Enterprise', id_count: 300, amount: 4500, start_date: '2023/04/01', monthly_lessons: 1200, median_lessons: 4, learners_1: 280, learners_10: 150, learners_20: 50 },
    { client: 'グローバル貿易', segment: 'Enterprise', id_count: 250, amount: 3800, start_date: '2023/05/01', monthly_lessons: 900, median_lessons: 3, learners_1: 200, learners_10: 100, learners_20: 30 },
    { client: 'テックフロンティア', segment: 'Mid', id_count: 200, amount: 3200, start_date: '2023/06/01', monthly_lessons: 850, median_lessons: 5, learners_1: 190, learners_10: 120, learners_20: 60 },
  ];

  const fluctuationList = [
    { client: 'Xホールディングス', segment: 'Enterprise', oldAmount: 2000, newAmount: 2500, id_count: 120, diff: '+25%', reason: '部署拡大' },
    { client: 'Yシステムズ', segment: 'Mid', oldAmount: 500, newAmount: 0, id_count: 0, diff: '-100%', reason: '解約 (予算縮小)' },
  ];

  const notRenewedList = [
    { client: 'Zマート', segment: 'Small', expiry: '2024/09/30', amount: 100, id_count: 5, owner: '鈴木', comment: '価格面で折り合わず' },
  ];

  const renewedList = [
    { client: 'アルファ工業', segment: 'Enterprise', amount: 1200, id_count: 60, term: '12ヶ月' },
    { client: 'ベータ銀行', segment: 'Enterprise', amount: 3000, id_count: 150, term: '12ヶ月' },
  ];

  const displayData = newSalesData.filter(d => ['Enterprise', 'Mid', 'Small'].includes(d.segment));

  const graphData = displayData.map(d => ({
    segment: d.segment,
    last_year: Number(d.last_year) || 0,
    budget: Number(d.budget) || 0,
    target: Number(d.target) || 0,
    actual: Number(d.actual) || 0,
  }));

  const entData = existingSalesData.find(d => d.segment === 'Enterprise') || { sales: 0, nrr: 0, renewal: 0, id_growth: 0 };
  const midData = existingSalesData.find(d => d.segment === 'Mid') || { sales: 0, nrr: 0, renewal: 0, id_growth: 0 };
  const smlData = existingSalesData.find(d => d.segment === 'Small') || { sales: 0, nrr: 0, renewal: 0, id_growth: 0 };
  
  const totalSales = existingSalesData.reduce((a, b) => a + Number(b.sales), 0);
  const totalData = { sales: totalSales, nrr: existingSalesData.reduce((a, b) => a + Number(b.nrr), 0)/3, renewal: existingSalesData.reduce((a, b) => a + Number(b.renewal), 0)/3, id_growth: existingSalesData.reduce((a, b) => a + Number(b.id_growth), 0)/3 };
  
  const totalAnnualData = { 
      sales: fy25AnnualExisting.reduce((a, b) => a + b.sales, 0), 
      nrr: fy25AnnualExisting.reduce((a, b) => a + b.nrr, 0)/3,
      renewal: fy25AnnualExisting.reduce((a, b) => a + b.renewal, 0)/3,
      id_growth: fy25AnnualExisting.reduce((a, b) => a + b.id_growth, 0)/3
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('new')}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
            subTab === 'new' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          新規売上 (New Sales)
        </button>
        <button
          onClick={() => setSubTab('existing')}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
            subTab === 'existing' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          既存売上 (Existing Sales)
        </button>
      </div>

      {subTab === 'new' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              前月セグメント別 予実
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={graphData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="segment" />
                  <YAxis tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip formatter={(value:any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="last_year" name="昨年実績" fill="#94a3b8" barSize={20} />
                  <Bar dataKey="budget" name="予算" fill="#fb7185" barSize={20} />
                  <Bar dataKey="target" name="目標" fill="#fbbf24" barSize={20} />
                  <Bar dataKey="actual" name="実績" fill="#6366f1" barSize={20} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building size={20} className="text-indigo-600" />
              前月セグメント別 詳細指標
            </h3>
            <table className="w-full text-right text-sm min-w-[800px]">
              <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                <tr>
                  <th className="p-3 text-left">セグメント</th>
                  <th className="p-3">金額 (Actual)</th>
                  <th className="p-3 border-l">件数</th>
                  <th className="p-3">受注率</th>
                  <th className="p-3">LT</th>
                  <th className="p-3">社単価</th>
                  <th className="p-3">ID単価</th>
                  <th className="p-3">期間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayData.map((row) => (
                  <tr key={row.segment} className="hover:bg-slate-50">
                    <td className="p-3 text-left font-bold">{row.segment}</td>
                    <td className="p-3 font-bold text-indigo-600">{Number(row.actual).toLocaleString()}</td>
                    <td className="p-3 border-l border-slate-200">{row.count}件</td>
                    <td className="p-3">{row.win_rate}%</td>
                    <td className="p-3">{row.lead_time}日</td>
                    <td className="p-3">{Number(row.unit_price).toLocaleString()}</td>
                    <td className="p-3">{Number(row.id_price).toLocaleString()}</td>
                    <td className="p-3">{row.duration}ヶ月</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                前月受注案件詳細 (全件)
              </h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left text-slate-600 sticky top-0">
                  <thead className="bg-slate-50 text-xs uppercase sticky top-0 z-10">
                    <tr>
                      <th className="p-3">受注日</th>
                      <th className="p-3">顧客名</th>
                      <th className="p-3">セグメント</th>
                      <th className="p-3 text-right">金額</th>
                      <th className="p-3 text-right">ID数</th>
                      <th className="p-3">受講期間</th>
                      <th className="p-3">担当</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dealList.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3">{d.date}</td>
                        <td className="p-3 font-bold text-slate-800">{d.client}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{d.segment}</span></td>
                        <td className="p-3 text-right font-medium">{d.amount.toLocaleString()}</td>
                        <td className="p-3 text-right">{d.id_count}</td>
                        <td className="p-3">{d.duration}</td>
                        <td className="p-3">{d.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info size={20} className="text-indigo-600" />
                新規売上コメント
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-96 overflow-y-auto text-sm text-slate-700 leading-relaxed">
                <p className="mb-2"><strong>Enterprise:</strong> 製造業向けのアプローチが奏功し、大型案件を2件獲得。リードタイムも短縮傾向。</p>
                <p className="mb-2"><strong>Mid:</strong> 競合との価格競争が激化しており、受注率が微減。差別化資料の再整備が必要。</p>
                <p><strong>Small:</strong> インバウンド流入が好調。Web完結型のプランへの誘導がスムーズに進んでいる。</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-600" />
              今月受注案件詳細 (全件)
            </h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase">
                  <tr><th className="p-3">受注日</th><th className="p-3">顧客名</th><th className="p-3">セグメント</th><th className="p-3 text-right">金額</th><th className="p-3 text-right">ID数</th><th className="p-3">受講期間</th><th className="p-3">担当</th></tr>
                </thead>
                <tbody>
                  {thisMonthDealList.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3">{d.date}</td><td className="p-3 font-bold text-slate-800">{d.client}</td><td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{d.segment}</span></td><td className="p-3 text-right font-medium">{d.amount.toLocaleString()}</td><td className="p-3 text-right">{d.id_count}</td><td className="p-3">{d.duration}</td><td className="p-3">{d.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-2">セグメント別 受注進捗 (件数・金額)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="space-y-2">
                    <GaugeChart title="Ent - 件数" budget={10} target={12} actual={5} />
                    <GaugeChart title="Ent - 金額" budget={5000} target={5500} actual={4200} />
                </div>
                <div className="space-y-2">
                    <GaugeChart title="Mid - 件数" budget={20} target={25} actual={12} />
                    <GaugeChart title="Mid - 金額" budget={3000} target={3300} actual={3500} />
                </div>
                <div className="space-y-2">
                    <GaugeChart title="Small - 件数" budget={50} target={60} actual={30} />
                    <GaugeChart title="Small - 金額" budget={1500} target={1800} actual={1800} />
                </div>
            </div>

            <h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-2">FY26累計 セグメント別詳細 (4月〜現在)</h4>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-right text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                    <tr><th className="p-3 text-left">セグメント</th><th className="p-3">予算</th><th className="p-3">実績</th><th className="p-3">達成率</th><th className="p-3 border-l">件数</th><th className="p-3">受注率</th><th className="p-3">LT</th><th className="p-3">平均社単価</th><th className="p-3">平均ID単価</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                    {fy26Cumulative.map((row) => (
                    <tr key={row.segment} className="hover:bg-slate-50">
                        <td className="p-3 text-left font-bold">{row.segment}</td>
                        <td className="p-3">{row.budget.toLocaleString()}</td>
                        <td className="p-3 font-bold text-indigo-600">{row.actual.toLocaleString()}</td>
                        <td className="p-3">{formatPercent((row.actual/row.budget)*100)}</td>
                        <td className="p-3 border-l">{row.count}件</td>
                        <td className="p-3">{row.win_rate}%</td>
                        <td className="p-3">{row.lead_time}日</td>
                        <td className="p-3">{row.unit_price.toLocaleString()}</td>
                        <td className="p-3">{row.id_price.toLocaleString()}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            <h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-2">受注件数と金額の月次推移</h4>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyTrend} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                        <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="amount" name="受注金額" fill="#6366f1" barSize={30} />
                        <Line yAxisId="right" type="monotone" dataKey="count" name="受注件数" stroke="#f59e0b" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info size={20} className="text-emerald-600" />
              更新・アップセルコメント
            </h3>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 h-24 overflow-y-auto text-sm text-emerald-900 leading-relaxed">
              <p className="mb-2"><strong>Enterprise:</strong> 大手X社の全社導入に伴い、NRRが大きく伸長。CSチームのオンボーディング支援が評価された。</p>
              <p><strong>General:</strong> 小規模契約の解約が数件発生したが、全体のID数は増加傾向を維持。価格改定の影響は軽微。</p>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <RefreshCw size={20} className="text-emerald-600" />
              セグメント別 既存売上・維持率分析
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SegmentCard title="Enterprise" data={entData} colorClass="bg-[#1e5fa0]" />
              <SegmentCard title="Mid" data={midData} colorClass="bg-[#3b82f6]" />
              <SegmentCard title="Small" data={smlData} colorClass="bg-[#f59e0b]" />
              <SegmentCard title="合計 / 平均" data={totalData} colorClass="bg-[#64748b]" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <XSquare size={20} className="text-slate-500" />
                未更新企業一覧
              </h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs">
                  <tr>
                    <th className="p-2">顧客名</th>
                    <th className="p-2">セグメント</th>
                    <th className="p-2">満了日</th>
                    <th className="p-2">金額</th>
                    <th className="p-2">ID数</th>
                    <th className="p-2">担当</th>
                    <th className="p-2">コメント</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notRenewedList.map((f, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{f.client}</td>
                      <td className="p-2"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{f.segment}</span></td>
                      <td className="p-2 text-rose-600">{f.expiry}</td>
                      <td className="p-2">{f.amount}</td>
                      <td className="p-2">{f.id_count}</td>
                      <td className="p-2">{f.owner}</td>
                      <td className="p-2 text-xs text-slate-500">{f.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-rose-500" />
                大幅変動企業リスト (±10%以上)
              </h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs">
                  <tr>
                    <th className="p-2">顧客名</th>
                    <th className="p-2">セグメント</th>
                    <th className="p-2">変更前</th>
                    <th className="p-2">変更後</th>
                    <th className="p-2">ID数</th>
                    <th className="p-2">変動</th>
                    <th className="p-2">理由</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fluctuationList.map((f, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{f.client}</td>
                      <td className="p-2"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{f.segment}</span></td>
                      <td className="p-2">{f.oldAmount}</td>
                      <td className="p-2">{f.newAmount}</td>
                      <td className="p-2">{f.id_count}</td>
                      <td className={`p-2 font-bold ${f.diff.includes('-') ? 'text-rose-600' : 'text-emerald-600'}`}>{f.diff}</td>
                      <td className="p-2 text-xs text-slate-500">{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckSquare size={20} className="text-emerald-600" />
              更新完了企業一覧 (全件)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {renewedList.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                  <div>
                    <span className="font-bold text-sm text-slate-700 block">{r.client}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] mt-1 inline-block">{r.segment}</span>
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    <div className="mb-1"><span className="font-bold">¥{r.amount.toLocaleString()}</span> / {r.id_count} IDs</div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{r.term}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ① FY25通年分析 */}
            <h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-emerald-500 pl-2">FY25通年 既存売上・維持率分析 (確定値)</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <SegmentCard title="Enterprise" data={fy25AnnualExisting[0]} colorClass="bg-[#1e5fa0]" isAnnual={true} />
              <SegmentCard title="Mid" data={fy25AnnualExisting[1]} colorClass="bg-[#3b82f6]" isAnnual={true} />
              <SegmentCard title="Small" data={fy25AnnualExisting[2]} colorClass="bg-[#f59e0b]" isAnnual={true} />
              <SegmentCard title="合計 / 平均" data={totalAnnualData} colorClass="bg-[#64748b]" isAnnual={true} />
            </div>

            {/* ② 売上300万円以上の更新見込み企業一覧 */}
            <h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-emerald-500 pl-2">更新見込 (売上300万円以上) 詳細リスト</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-emerald-50 text-emerald-900 font-bold">
                        <tr>
                            <th className="p-3">顧客名</th><th className="p-3">セグメント</th><th className="p-3 text-right">ID数</th><th className="p-3 text-right">金額</th><th className="p-3">開始日</th><th className="p-3 text-right">月次Lesson</th><th className="p-3 text-right">Lesson(中央値)</th><th className="p-3 text-right">1回以上</th><th className="p-3 text-right">10回以上</th><th className="p-3 text-right">20回以上</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {highValueProspects.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                                <td className="p-3 font-bold">{row.client}</td>
                                <td className="p-3">{row.segment}</td>
                                <td className="p-3 text-right">{row.id_count}</td>
                                <td className="p-3 text-right font-bold text-emerald-600">{row.amount.toLocaleString()}</td>
                                <td className="p-3">{row.start_date}</td>
                                <td className="p-3 text-right">{row.monthly_lessons}</td>
                                <td className="p-3 text-right">{row.median_lessons}</td>
                                <td className="p-3 text-right">{row.learners_1} ({Math.round(row.learners_1/row.id_count*100)}%)</td>
                                <td className="p-3 text-right">{row.learners_10}</td>
                                <td className="p-3 text-right">{row.learners_20}</td>
                            </tr>
                        ))}
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
// 3. Other Sales Tab
// ==========================================
const OtherSalesTab = () => {
    const segments = [
        { name: '企業代理店', budget: 1000, target: 1200, actual: 1100 },
        { name: '企業優待', budget: 500, target: 600, actual: 550 },
        { name: '学校・自治体', budget: 2000, target: 2000, actual: 1800 },
        { name: '留学エージェント', budget: 800, target: 1000, actual: 900 },
    ];

    const partners = [
        { name: 'Partner A', value: 1200 },
        { name: 'Partner B', value: 900 },
        { name: 'Partner C', value: 800 },
        { name: 'Partner D', value: 600 },
        { name: 'Partner E', value: 400 },
        { name: 'Partner F', value: 300 },
        { name: 'Partner G', value: 200 },
        { name: 'Partner H', value: 150 },
        { name: 'Partner I', value: 100 },
        { name: 'Partner J', value: 80 },
        { name: 'その他', value: 500 },
    ];
    const totalOtherSales = partners.reduce((a, b) => a + b.value, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Info size={20} className="text-indigo-600" />
                    その他売上コメント
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-24 overflow-y-auto text-sm text-slate-700 leading-relaxed">
                    <p><strong>学校・自治体:</strong> 今月は自治体案件の入札があり、来月以降の売上増が見込まれます。</p>
                    <p><strong>企業優待:</strong> 福利厚生サイト経由の流入が安定しています。</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-indigo-600" />
                        前月セグメント別 予実 (その他)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={segments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis />
                                <Tooltip formatter={(value:any) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="budget" name="予算" fill="#94a3b8" />
                                <Bar dataKey="target" name="目標" fill="#fbbf24" />
                                <Bar dataKey="actual" name="実績" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-indigo-600" />
                        取引先別 売上構成比 (上位10社 + その他)
                    </h3>
                    <div className="h-80 w-full flex">
                        <ResponsiveContainer width="60%" height="100%">
                            <PieChart>
                                <Pie data={partners} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                                    {partners.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value:any) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-[40%] flex flex-col justify-center space-y-2 overflow-y-auto max-h-80 text-xs">
                            {partners.map((p, i) => (
                                <div key={i} className="flex justify-between items-center pr-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span>{p.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold">{p.value.toLocaleString()}</span>
                                        <span className="text-slate-400 ml-1">({((p.value/totalOtherSales)*100).toFixed(1)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 4. Marketing Analysis Tab (Renamed from Process)
// ==========================================
const MarketingAnalysisTab = () => {
  const segmentFunnelData = [
    { stage: 'リード獲得', Ent: 200, Mid: 400, Small: 600 },
    { stage: '商談化', Ent: 80, Mid: 150, Small: 220 },
    { stage: '提案', Ent: 40, Mid: 70, Small: 90 },
    { stage: '受注', Ent: 15, Mid: 25, Small: 45 },
  ];

  // FY26 Cumulative Funnel Data (Enterprise)
  const fy26EntFunnelData = [
    { value: 2500, name: 'リード獲得', fill: '#4f46e5' },
    { value: 500, name: '商談化', fill: '#6366f1' },
    { value: 250, name: '提案', fill: '#818cf8' },
    { value: 50, name: '受注', fill: '#a5b4fc' },
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

  const sourceData = [
    { source: 'Web (Inbound)', leads: 2500, opps: 400, orders: 80, cost: 5000000, revenue: 12000000 },
    { source: 'Event / Seminar', leads: 1200, opps: 150, orders: 30, cost: 8000000, revenue: 6000000 },
    { source: 'Outbound (SDR)', leads: 800, opps: 120, orders: 20, cost: 4000000, revenue: 5000000 },
    { source: 'Referral / Partner', leads: 300, opps: 80, orders: 40, cost: 500000, revenue: 8000000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* 1. Comment Section */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Info size={20} className="text-indigo-600" />
             リード・マーケ施策コメント
          </h3>
          <div className="bg-slate-50 p-4 rounded-lg h-24 overflow-y-auto text-sm text-slate-700 leading-relaxed">
             コメントをここに入力...
          </div>
       </div>

       {/* 2. Funnel Analysis */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Filter size={20} className="text-indigo-600" />
               FY26累計ファネル (Enterprise)
             </h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <FunnelChart>
                      <Tooltip />
                      <Funnel
                        dataKey="value"
                        data={fy26EntFunnelData}
                        isAnimationActive
                      >
                        <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                      </Funnel>
                   </FunnelChart>
                </ResponsiveContainer>
                {/* 補足データ（件数・転換率） */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded">
                        <div className="font-bold text-slate-700">リード</div>
                        <div>2,500件</div>
                        <div className="text-indigo-600 font-bold">-</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                        <div className="font-bold text-slate-700">商談化</div>
                        <div>500件</div>
                        <div className="text-indigo-600 font-bold">20.0%</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                        <div className="font-bold text-slate-700">提案</div>
                        <div>250件</div>
                        <div className="text-indigo-600 font-bold">50.0%</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                        <div className="font-bold text-slate-700">受注</div>
                        <div>50件</div>
                        <div className="text-indigo-600 font-bold">20.0%</div>
                    </div>
                </div>
             </div>
          </div>
       </div>

       {/* 3. Current Stock KPI */}
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

       {/* 4. Source Analysis (Modified with Unit Price) */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <DollarSign size={20} className="text-amber-500" />
             ソース別 獲得分析 & CPA
          </h3>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-right whitespace-nowrap">
                <thead className="bg-amber-50 text-amber-900 border-b-2 border-amber-200">
                   <tr>
                      <th className="p-3 text-left">ソース</th><th className="p-3">獲得リード数</th><th className="p-3">商談化数</th><th className="p-3">商談化率</th><th className="p-3">総コスト (概算)</th><th className="p-3">CPL (リード単価)</th><th className="p-3">CPO (商談単価)</th><th className="p-3 border-l-2 border-amber-200">受注単価 (平均)</th>
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
                         <td className="p-3 border-l border-slate-100 font-bold text-slate-700">¥{Math.round(s.revenue/s.orders).toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* 5. Campaign Analysis (Leads Only) */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Megaphone size={20} className="text-rose-500" />
             キャンペーン別 獲得リード数
          </h3>
          <div className="overflow-x-auto">
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
       </div>

    </div>
  );
};

// ==========================================
// 5. Negotiation & Trial Analysis Tab (Renamed)
// ==========================================
const NegotiationAnalysisTab = () => {
  const [url, setUrl] = useState('1UijNvely71JDu73oBoBpho9P84fT-yPmNH2QVVstwO4');

  useEffect(() => {
     const savedUrl = localStorage.getItem('negotiation_report_url');
     if (savedUrl) setUrl(savedUrl);
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = e.target.value;
     setUrl(val);
     localStorage.setItem('negotiation_report_url', val);
  };

  const advisorData = [{ source: 'Advisor A', cost: 500000, referrals: 10, lost: 4, ongoing: 4, won: 2, revenue: 3000000 }, { source: 'Advisor B', cost: 300000, referrals: 5, lost: 2, ongoing: 2, won: 1, revenue: 1500000 }];
  const advisorDealList = [{ company: '株式会社アルファ', segment: 'Enterprise', person: '山田 本部長', status: '提案中', memo: '予算感は合意' }, { company: 'ベータ物流', segment: 'Mid', person: '佐藤 部長', status: '商談化', memo: '競合比較中' }];
  const trialData = [
      { client: '有限会社新浦安ホテルマネージメント', segment: 'Mid', amount: 500000, start: '2025/12/22', end: '-', memo: '' },
      { client: 'エーオンジャパン株式会社 (Speakに競合負け)', segment: 'Small', amount: 400000, start: '2025/12/09', end: '2025/12/23', memo: '音声認識精度が高く、発音の確認ができるが、スピーキング力向上には直結しにくいのではないか。繰り返し学習を促す仕組みがある点がよい。1回10〜15分と短く、手軽にできる。ページ構成がわかりづらく、レッスンの進め方も分かりづらかった。順番通りに進めないと先に進めない点が不便。毎日フリートークではなく、シナリオがある点は良い。ゲーム感覚で進められるため、モチベーション維持に役立つ。実践的なアウトプット練習が加われば、さらに価値が高まると感じた' },
      { client: '独立行政法人国民生活センター', segment: 'Small', amount: 400000, start: '2025/12/25', end: '2026/01/18', memo: '' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Presentation size={20} className="text-indigo-600" />
             月次商談・トライアル分析レポート (PDF埋め込み)
          </h3>
          <div className="mb-4">
             <input 
               type="text" 
               placeholder="Google Drive共有URLまたはIDを入力" 
               className="w-full p-2 border border-slate-300 rounded text-sm"
               value={url}
               onChange={handleUrlChange}
             />
             <p className="text-xs text-slate-400 mt-1">※Googleドライブの共有設定を「リンクを知っている全員」にしてください。</p>
          </div>
          <div className="w-full h-[600px] bg-slate-50 border border-slate-200 rounded flex items-center justify-center">
             {url ? (
                <iframe 
                  src={url.includes('drive.google.com') ? url.replace('/view', '/preview') : `https://drive.google.com/file/d/${url}/preview`}
                  width="100%" 
                  height="100%" 
                  className="rounded"
                ></iframe>
             ) : (
                <p className="text-slate-400">PDFレポートを表示するにはURLを入力してください</p>
             )}
          </div>
       </div>

       {/* Advisor Data Table */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Users size={20} className="text-emerald-600" />
             顧問経由商談 CPA
          </h3>
          <div className="overflow-x-auto mb-8">
             <table className="w-full text-sm text-right whitespace-nowrap">
                <thead className="bg-emerald-50 text-emerald-900 border-b-2 border-emerald-200">
                   <tr>
                      <th className="p-3 text-left">ソース (顧問名)</th>
                      <th className="p-3">総コスト</th>
                      <th className="p-3">紹介数</th>
                      <th className="p-3">失注数</th>
                      <th className="p-3">継続商談数</th>
                      <th className="p-3">受注数</th>
                      <th className="p-3">受注金額</th>
                      <th className="p-3">受注単価</th>
                      <th className="p-3">受注率</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {advisorData.map((d, i) => {
                      const unitPrice = d.won > 0 ? Math.round(d.revenue / d.won) : 0;
                      const winRate = d.referrals > 0 ? ((d.won / d.referrals) * 100).toFixed(1) : 0;
                      return (
                         <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 text-left font-bold">{d.source}</td>
                            <td className="p-3">¥{d.cost.toLocaleString()}</td>
                            <td className="p-3">{d.referrals}</td>
                            <td className="p-3 text-rose-500">{d.lost}</td>
                            <td className="p-3 text-amber-500">{d.ongoing}</td>
                            <td className="p-3 font-bold text-emerald-600">{d.won}</td>
                            <td className="p-3 font-bold">¥{d.revenue.toLocaleString()}</td>
                            <td className="p-3">¥{unitPrice.toLocaleString()}</td>
                            <td className="p-3 font-bold">{winRate}%</td>
                         </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <List size={20} className="text-indigo-600" />
             顧問経由商談一覧
          </h3>
          <div className="overflow-x-auto mb-8">
             <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 border-b-2 border-slate-200">
                   <tr>
                      <th className="p-3">企業名</th>
                      <th className="p-3">セグメント</th>
                      <th className="p-3">面談相手</th>
                      <th className="p-3">ステータス</th>
                      <th className="p-3">商談メモ</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {advisorDealList.map((deal, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                         <td className="p-3 font-bold">{deal.company}</td>
                         <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{deal.segment}</span></td>
                         <td className="p-3">{deal.person}</td>
                         <td className="p-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-bold">{deal.status}</span></td>
                         <td className="p-3 text-xs text-slate-500">{deal.memo}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <ClipboardList size={20} className="text-amber-600" />
             トライアル案件一覧
          </h3>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-amber-50 text-amber-900 border-b-2 border-amber-200">
                   <tr>
                      <th className="p-3">取引先</th>
                      <th className="p-3">セグメント</th>
                      <th className="p-3">金額</th>
                      <th className="p-3">トライアル開始日</th>
                      <th className="p-3">トライアル終了日</th>
                      <th className="p-3">トライアル評価メモ</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {trialData.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                         <td className="p-3 font-bold">{t.client}</td>
                         <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{t.segment}</span></td>
                         <td className="p-3">¥{t.amount.toLocaleString()}</td>
                         <td className="p-3">{t.start}</td>
                         <td className="p-3">{t.end}</td>
                         <td className="p-3 text-xs text-slate-500 max-w-xs whitespace-normal">{t.memo}</td>
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
// 6. Pipeline Analysis Tab (New & Renamed)
// ==========================================
const PipelineAnalysisTab = () => {
    // Pipeline Gauge Component
    const PipelineGauge = ({ title, target, forecast }: { title: string, target: number, forecast: number }) => {
        const percentage = target > 0 ? (forecast / target) * 100 : 0;
        const cappedPercentage = Math.min(percentage, 100);
        
        // Gauge Data
        const data = [
          { name: 'Achieved', value: cappedPercentage },
          { name: 'Remaining', value: 100 - cappedPercentage },
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

    // Table Data
    const pipelineCounts = [
        { type: 'Enterprise', commit: {1:1,2:0,3:0,4:0,5:0,6:0}, chalP: {1:4,2:13,3:8,4:24,5:8,6:20}, chalM: {1:0,2:2,3:1,4:10,5:2,6:5}, total: {1:5,2:15,3:9,4:34,5:10,6:25} },
        { type: 'Mid', commit: {1:0,2:1,3:0,4:0,5:0,6:1}, chalP: {1:4,2:4,3:3,4:15,5:4,6:4}, chalM: {1:0,2:3,3:3,4:2,5:1,6:2}, total: {1:4,2:8,3:6,4:17,5:5,6:7} },
        { type: 'Small', commit: {1:0,2:0,3:0,4:0,5:0,6:0}, chalP: {1:1,2:3,3:1,4:3,5:2,6:3}, chalM: {1:1,2:2,3:1,4:2,5:0,6:1}, total: {1:2,2:5,3:2,4:5,5:2,6:4} },
    ];
    const pipelineAmounts = [
        { segment: 'Enterprise', m1: 16289417, m2: 11874840, m3: 11849760, m4: 50826379, m5: 10098414, m6: 18688880 },
        { segment: 'Mid', m1: 15735600, m2: 8430892, m3: 3949990, m4: 16900000, m5: 1621000, m6: 1924000 },
        { segment: 'Small', m1: 2948800, m2: 1493000, m3: 902700, m4: 1229569, m5: 970200, m6: 803000 },
        { segment: 'その他', m1: 0, m2: 1570800, m3: 0, m4: 1232000, m5: 0, m6: 0 },
    ];
    const totalAmounts = { m1: 34973817, m2: 23369532, m3: 16702450, m4: 70187948, m5: 12689614, m6: 21415880 };

    const newPipelineDetails = [
        { month: '2026-2月', segment: 'Mid', prob: 'Challenge- (確度50%以下リスク有)', name: 'マニー株式会社', amount: 4950000 },
        { month: '', segment: 'Mid', prob: 'Challenge+ (確度50%以上リスク有)', name: 'NIPPON EXPRESSホールディングス株式会社', amount: 7084000 },
        { month: '2026-3月', segment: 'Enterprise', prob: 'Challenge+ (確度50%以上リスク有)', name: '株式会社電通コーポレートワン', amount: 6468000 },
        { month: '2026-4月', segment: 'Enterprise', prob: 'Challenge- (確度50%以下リスク有)', name: 'NECネッツエスアイ株式会社', amount: 3300000 },
        { month: '', segment: 'Enterprise', prob: 'Challenge- (確度50%以下リスク有)', name: 'PayPayカード株式会社', amount: 10180000 },
    ];
    const existingPipelineDetails = [
        { month: '2026-1月', segment: 'Enterprise', prob: 'Challenge+ (確度50%以上リスク有)', name: '東急リゾーツ＆ステイ株式会社', amount: 3510000 },
        { month: '', segment: 'Small', prob: 'Challenge+ (確度50%以上リスク有)', name: 'クレコンリサーチ&コンサルティング株式会社', amount: 3124000 },
        { month: '2026-2月', segment: 'Enterprise', prob: 'Challenge+ (確度50%以上リスク有)', name: 'GEヘルスケア・ジャパン株式会社', amount: 5600000 },
        { month: '2026-3月', segment: 'Enterprise', prob: 'Challenge+ (確度50%以上リスク有)', name: '株式会社ブリヂストン', amount: 4100000 },
        { month: '', segment: 'Mid', prob: 'Challenge+ (確度50%以上リスク有)', name: 'みずほリース株式会社', amount: 4906130 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={20} className="text-indigo-600" />
                パイプライン達成見込み
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <PipelineGauge title="Enterprise" target={100000000} forecast={120000000} />
                <PipelineGauge title="Mid" target={50000000} forecast={48000000} />
                <PipelineGauge title="Small" target={20000000} forecast={8000000} />
                <PipelineGauge title="全体" target={170000000} forecast={176000000} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">セグメント別・確度別 パイプライン数 (2026年1月-6月)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right border-collapse">
                        <thead className="bg-slate-500 text-white">
                            <tr><th className="p-2 text-left">セグメント</th><th className="p-2 text-left">Mgr確度</th><th>2026-1月</th><th>2026-2月</th><th>2026-3月</th><th>2026-4月</th><th>2026-5月</th><th>2026-6月</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pipelineCounts.map((s, i) => (
                                <React.Fragment key={i}>
                                    <tr className="bg-white"><td className="p-2 text-left font-bold" rowSpan={3}>{s.type}</td><td className="p-2 text-left">Commit</td><td>{s.commit[1]}</td><td>{s.commit[2]}</td><td>{s.commit[3]}</td><td>{s.commit[4]}</td><td>{s.commit[5]}</td><td>{s.commit[6]}</td></tr>
                                    <tr className="bg-white"><td className="p-2 text-left">Challenge+</td><td>{s.chalP[1]}</td><td>{s.chalP[2]}</td><td>{s.chalP[3]}</td><td>{s.chalP[4]}</td><td>{s.chalP[5]}</td><td>{s.chalP[6]}</td></tr>
                                    <tr className="bg-white"><td className="p-2 text-left">Challenge-</td><td>{s.chalM[1]}</td><td>{s.chalM[2]}</td><td>{s.chalM[3]}</td><td>{s.chalM[4]}</td><td>{s.chalM[5]}</td><td>{s.chalM[6]}</td></tr>
                                    <tr className="bg-slate-100 font-bold"><td colSpan={2} className="p-2 text-left">{s.type} の合計</td><td>{s.total[1]}</td><td>{s.total[2]}</td><td>{s.total[3]}</td><td>{s.total[4]}</td><td>{s.total[5]}</td><td>{s.total[6]}</td></tr>
                                </React.Fragment>
                            ))}
                             <tr className="bg-slate-200 font-bold border-t-2 border-slate-300"><td colSpan={2} className="p-2 text-left">総計</td><td>11</td><td>29</td><td>18</td><td>57</td><td>17</td><td>36</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">セグメント別 ヨミ金額推移</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right border-collapse">
                        <thead className="bg-white border-b-2 border-black font-bold">
                            <tr><th className="p-2 text-left">ヨミ金額</th><th>1月</th><th>2月</th><th>3月</th><th>4月</th><th>5月</th><th>6月</th></tr>
                        </thead>
                        <tbody>
                            {pipelineAmounts.map((r, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                    <td className="p-2 text-left">{r.segment}</td><td>{r.m1.toLocaleString()}</td><td>{r.m2.toLocaleString()}</td><td>{r.m3.toLocaleString()}</td><td>{r.m4.toLocaleString()}</td><td>{r.m5.toLocaleString()}</td><td>{r.m6.toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr className="font-bold bg-white border-t-2 border-black"><td className="p-2 text-left">総計</td><td>{totalAmounts.m1.toLocaleString()}</td><td>{totalAmounts.m2.toLocaleString()}</td><td>{totalAmounts.m3.toLocaleString()}</td><td>{totalAmounts.m4.toLocaleString()}</td><td>{totalAmounts.m5.toLocaleString()}</td><td>{totalAmounts.m6.toLocaleString()}</td></tr>
                            <tr className="font-bold bg-white"><td className="p-2 text-left">GAP</td><td>{totalAmounts.m1.toLocaleString()}</td><td>{totalAmounts.m2.toLocaleString()}</td><td>{totalAmounts.m3.toLocaleString()}</td><td>{totalAmounts.m4.toLocaleString()}</td><td>{totalAmounts.m5.toLocaleString()}</td><td>{totalAmounts.m6.toLocaleString()}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-blue-500 pb-2 text-blue-600">パイプライン詳細(新規300万円以上)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-slate-300">
                                <tr><th className="p-2">年月</th><th>セグメント</th><th>Mgr確度</th><th>商談名</th><th className="text-right">金額</th></tr>
                            </thead>
                            <tbody>
                                {newPipelineDetails.map((d, i) => (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-2">{d.month}</td><td>{d.segment}</td><td>{d.prob}</td><td>{d.name}</td><td className="text-right">{d.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-blue-500 pb-2 text-blue-600">パイプライン詳細(既存300万円以上)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-slate-300">
                                <tr><th className="p-2">年月</th><th>セグメント</th><th>Mgr確度</th><th>商談名</th><th className="text-right">金額</th></tr>
                            </thead>
                            <tbody>
                                {existingPipelineDetails.map((d, i) => (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-2">{d.month}</td><td>{d.segment}</td><td>{d.prob}</td><td>{d.name}</td><td className="text-right">{d.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 7. OKR & Future Action Tab (New)
// ==========================================
const OkrActionTab = ({ okrData }: { okrData: OkrRecord[] }) => {
    const okrs = [
        {
            title: "Objective 1",
            desc: "受注拡大の加速装置を構築し、FY26上期2.9億円受注を実現可能な状態をつくる",
            icon: <Rocket size={24} className="text-blue-500" />,
            color: "border-blue-500",
            krs: [
                { label: "635件", text: "リード獲得数（マーケ&営業企画経由525件、セールス経由110件）を達成し、FY26上期目標達成に必要な商談数を創出する" },
                { label: "160件", text: "8-12月に160件(マーケ&営業企画経由60件、セールス経由100件)の新規商談機会を創出する" },
                { label: "6社/150%", text: "深耕攻略ターゲット先6社全てにおいてアカウントプランニングを策定し、月次進捗ミーティングを毎月実施することで、次年度初回更新時の受注金額見込み150%を創出する" }
            ]
        },
        {
            title: "Objective 2",
            desc: "成長を支えるCS基盤を構築し、顧客の継続率上昇におけるKSFを見つける",
            icon: <Settings size={24} className="text-teal-500" />,
            color: "border-teal-500",
            krs: [
                { label: "30%削減", text: "サポート業務 1社あたり対応工数を30%以上削減し、サクセス担当としてアプローチできる顧客数を現行比3倍（目標10社/人）に引き上げる体制を構築する" },
                { label: "オンボーディング標準化", text: "オンボーディングプロセスにおけるサービス/サポートの品質基準を策定し、導入顧客の目標設定および初期支援テンプレートを確立するとともに、管理画面開発に着手する" },
                { label: "3KPI/10%改善", text: "顧客単位の利用データ可視化基盤を構築した上で、継続率向上にインパクトがある上位3つのKPIを特定し、それらのKPIを10%改善する" }
            ]
        },
        {
            title: "Objective 3",
            desc: "AI英会話研修のスタンダードとしてのポジションの確立に向けて、認知度の基盤をつくる",
            icon: <Volume2 size={24} className="text-green-600" />,
            color: "border-green-600",
            krs: [
                { label: "競合調査", text: "競合となる、レアジョブ・スタサプTOEIC・AI英会話2社(Speak・Elsa)について、法人向け[価格体系、プロダクト機能、管理サポート体制、顧客事例数]の調査を完了し、詳細レポートを作成する" },
                { label: "勝率80%", text: "競合分析レポートを提案資料にFY25下期中に反映し、Speak/Elsaとのコンペ勝率80%を達成する" },
                { label: "サイト改修/10件", text: "人的リソースに依存しないスケーラビリティの基盤として法人サイト改修を行うとともに、新規顧客による利用事例10社を法人向けサイトに掲載する" }
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* OKR Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {okrs.map((okr, idx) => (
                    <div key={idx} className={`bg-white rounded-xl shadow-md border-t-4 ${okr.color} p-6 flex flex-col h-full`}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-2 p-3 bg-slate-50 rounded-full">{okr.icon}</div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2">{okr.title}</h3>
                            <p className="text-sm font-bold text-blue-600 leading-snug">{okr.desc}</p>
                        </div>
                        <div className="space-y-6 flex-1">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">Key Results</h4>
                            {okr.krs.map((kr, kIdx) => (
                                <div key={kIdx} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare size={16} className="text-green-500" />
                                        <span className="font-bold text-lg text-slate-700">{kr.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed pl-6">{kr.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Progress Table (Dynamic from CSV) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" />
                    月次OKR進捗トラッキング
                </h3>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
                        <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border-b border-slate-200 min-w-[200px] sticky left-0 bg-slate-50">Key Result</th>
                                <th className="p-3 border-b border-slate-200 min-w-[180px]">1月</th>
                                <th className="p-3 border-b border-slate-200 min-w-[180px]">2月</th>
                                <th className="p-3 border-b border-slate-200 min-w-[180px]">3月</th>
                                <th className="p-3 border-b border-slate-200 min-w-[180px]">4月</th>
                                <th className="p-3 border-b border-slate-200 min-w-[180px]">5月</th>
                                <th className="p-3 border-b border-slate-200 min-w-[180px]">6月</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {okrData.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-700 font-bold sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{row.key_result}</td>
                                    <td className="p-2"><textarea className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-400 resize-none" defaultValue={row.jan} placeholder="-" /></td>
                                    <td className="p-2"><textarea className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-400 resize-none" defaultValue={row.feb} placeholder="-" /></td>
                                    <td className="p-2"><textarea className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-400 resize-none" defaultValue={row.mar} placeholder="-" /></td>
                                    <td className="p-2"><textarea className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-400 resize-none" defaultValue={row.apr} placeholder="-" /></td>
                                    <td className="p-2"><textarea className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-400 resize-none" defaultValue={row.may} placeholder="-" /></td>
                                    <td className="p-2"><textarea className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-400 resize-none" defaultValue={row.jun} placeholder="-" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* General Comment Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Info size={20} className="text-indigo-600" />
                    総括・コメント
                </h3>
                <textarea 
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 resize-none"
                    placeholder="ここに全体の振り返りや特記事項を入力してください..."
                ></textarea>
            </div>
        </div>
    );
};