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
  PieChart as PieChartIcon, Briefcase, Filter, Megaphone, DollarSign, Presentation, List
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

// --- 定数定義 ---
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#82ca9d', '#ffc658', '#8884d8'];
const PIE_COLORS = { on: '#10b981', off: '#e2e8f0' };

// --- 初期モックデータ ---
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
  return (<span className={`px-2 py-0.5 rounded-full font-bold border ${bgColor} ${textColor} ${borderColor} text-[10px]`}>{label} {formatPercent(value)}</span>);
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
    const mIndex = 5; 
    const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
    setThisMonthName(months[mIndex]);
    setPrevMonthName(months[mIndex - 1] || months[11]);
    setCurrentMonthIndex(mIndex);
    if (sheetInput) { handleSheetSync(); }
  }, []);

  const handleSheetSync = async () => {
    if (!sheetInput) return;
    setIsSyncing(true); setSyncStatus('idle'); setErrorMessage('');
    try {
      const idMatch = sheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const cleanId = idMatch ? idMatch[1] : sheetInput;
      const requests = ['Main', 'New', 'Existing'].map(sheetName => 
        fetch(`https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`).then(res => res.text())
      );
      const results = await Promise.all(requests);
      const mainData = parseCSV(results[0]); if (mainData.length > 0) setSalesData(mainData);
      const newData = parseCSV(results[1]); if (newData.length > 0 && newData[0].segment) setNewSalesData(newData);
      const existData = parseCSV(results[2]); if (existData.length > 0) setExistingSalesData(existData);
      setSyncStatus('success'); setFileName(`All Sheets Synced`); setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error: any) {
      setSyncStatus('error'); setErrorMessage('シート読込失敗: ' + error.message);
    } finally { setIsSyncing(false); }
  };

  const prevMonthData = prevMonthName ? (salesData.find(d => d.month === prevMonthName) || salesData[0]) : salesData[0];
  const thisMonthData = thisMonthName ? (salesData.find(d => d.month === thisMonthName) || salesData[0]) : salesData[0];

  if (!isClient) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={salesData} prevData={prevMonthData} thisData={thisMonthData} monthIndex={currentMonthIndex} />;
      case 'sales': return <SalesAnalysisTab newSalesData={newSalesData} existingSalesData={existingSalesData} />;
      case 'other': return <OtherSalesTab />;
      case 'process': return <ProcessAnalysisTab />;
      case 'negotiation': return <NegotiationAnalysisTab />;
      case 'future': return <FutureActionTab data={salesData} />;
      default: return <OverviewTab data={salesData} prevData={prevMonthData} thisData={thisMonthData} monthIndex={currentMonthIndex} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-20 overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight"><div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">SB</div><span>Corporate Div.</span></div>
          <p className="text-xs text-slate-400 mt-2">経営管理ダッシュボード v24.12.13</p>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem id="overview" label="サマリー / 予実" icon={<LayoutDashboard size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="sales" label="企業直販売上分" icon={<TrendingUp size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="other" label="その他売上" icon={<Layers size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="process" label="要因・プロセス" icon={<Activity size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="negotiation" label="商談分析" icon={<Presentation size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="future" label="未来・アクション" icon={<Target size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="bg-slate-800 rounded-lg p-4 shadow-inner border border-slate-700 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-indigo-300 font-bold flex items-center gap-1"><LinkIcon size={12} /> Google Sheets 連携</p>{syncStatus === 'success' && <CheckCircle size={14} className="text-emerald-400" />}</div>
              <div className="space-y-2">
                <input type="text" placeholder="標準ID" value={sheetInput} onChange={(e) => setSheetInput(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                <button onClick={handleSheetSync} disabled={isSyncing || !sheetInput} className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded transition-all ${isSyncing ? 'bg-slate-700 text-slate-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'}`}><RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />{isSyncing ? 'データ同期' : 'データ同期'}</button>
              </div>
            </div>
            {fileName && syncStatus === 'success' && (<div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-800/50 rounded text-[10px] text-emerald-300 truncate">{fileName}</div>)}
            {syncStatus === 'error' && (<div className="mt-2 p-2 bg-rose-900/30 border border-rose-800/50 rounded text-[10px] text-rose-300 leading-tight">⚠ {errorMessage}</div>)}
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200">
          <div><h1 className="text-2xl font-bold text-slate-800">{activeTab === 'overview' ? '月次売上および今後の売上予測' : activeTab === 'sales' ? '企業直販売上分 (新規/既存)' : activeTab === 'other' ? 'その他売上分析 (代理店・優待・学校)' : activeTab === 'process' ? 'プロセス・要因分析' : activeTab === 'negotiation' ? '商談分析レポート' : '未来予測とアクションプラン'}</h1></div>
          <div className="flex items-center gap-4"><div className="text-right hidden md:block"><p className="text-sm font-medium">山田 太郎</p><p className="text-xs text-slate-500">法人事業部長</p></div><div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">YT</div></div>
        </header>
        <div className="p-8 pb-20">{renderContent()}</div>
      </main>
    </div>
  );
}

const NavItem = ({ id, label, icon, activeTab, setActiveTab }: any) => (
  <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{icon}{label}</button>
);

// --- OverviewTab ---
const OverviewTab = ({ data, prevData, thisData, monthIndex }: any) => {
  if (!prevData || !thisData || !data) return <div className="p-8 text-slate-500">Loading data...</div>;
  const n = (val: any) => Number(val) || 0;
  const prevTableData = [{ name: '売上', budget: n(prevData.sales_budget), target: n(prevData.sales_target), result: n(prevData.sales_actual) || n(prevData.sales_forecast) }, { name: 'コスト', budget: n(prevData.cost_budget), target: n(prevData.cost_target), result: n(prevData.cost_actual) || n(prevData.cost_forecast) }, { name: '貢献利益', budget: n(prevData.profit_budget), target: n(prevData.profit_target), result: n(prevData.profit_actual) || n(prevData.profit_forecast) }];
  const prevChartData = [{ name: '売上', budget: n(prevData.sales_budget), target: n(prevData.sales_target), actual: n(prevData.sales_actual) || n(prevData.sales_forecast) }, { name: 'コスト', budget: n(prevData.cost_budget), target: n(prevData.cost_target), actual: n(prevData.cost_actual) || n(prevData.cost_forecast) }, { name: '貢献利益', budget: n(prevData.profit_budget), target: n(prevData.profit_target), actual: n(prevData.profit_actual) || n(prevData.profit_forecast) }];
  const thisTableData = [{ name: '売上', budget: n(thisData.sales_budget), target: n(thisData.sales_target), result: n(thisData.sales_forecast) }, { name: 'コスト', budget: n(thisData.cost_budget), target: n(thisData.cost_target), result: n(thisData.cost_forecast) }, { name: '貢献利益', budget: n(thisData.profit_budget), target: n(thisData.profit_target), result: n(thisData.profit_forecast) }];
  const safeSum = (arr: any[], key: string) => arr.reduce((acc, cur) => acc + (Number(cur[key]) || 0), 0);
  const quarterIdx = Math.floor(monthIndex / 3);
  const quarterStartIdx = quarterIdx * 3;
  const qBudget = safeSum(data.slice(quarterStartIdx, quarterStartIdx + 3), 'sales_budget'); const qTarget = safeSum(data.slice(quarterStartIdx, quarterStartIdx + 3), 'sales_target'); const qForecast = safeSum(data.slice(quarterStartIdx, quarterStartIdx + 3), 'sales_forecast');
  const hBudget = safeSum(data.slice(monthIndex < 6 ? 0 : 6, monthIndex < 6 ? 6 : 12), 'sales_budget'); const hTarget = safeSum(data.slice(monthIndex < 6 ? 0 : 6, monthIndex < 6 ? 6 : 12), 'sales_target'); const hForecast = safeSum(data.slice(monthIndex < 6 ? 0 : 6, monthIndex < 6 ? 6 : 12), 'sales_forecast');
  const yBudget = safeSum(data, 'sales_budget'); const yTarget = safeSum(data, 'sales_target'); const yForecast = safeSum(data, 'sales_forecast');
  const AchievementBadge = ({ label, value }: { label: string, value: number }) => {
    const isTarget = label.includes('目標');
    const bgColor = isTarget ? (value >= 100 ? 'bg-amber-100' : 'bg-white') : (value >= 100 ? 'bg-emerald-100' : 'bg-rose-100');
    const textColor = isTarget ? (value >= 100 ? 'text-amber-700' : 'text-slate-500') : (value >= 100 ? 'text-emerald-700' : 'text-rose-700');
    const borderColor = isTarget ? (value >= 100 ? 'border-amber-200' : 'border-slate-200') : (value >= 100 ? 'border-emerald-200' : 'border-rose-200');
    return (<span className={`px-2 py-0.5 rounded-full font-bold border ${bgColor} ${textColor} ${borderColor} text-[10px]`}>{label} {formatPercent(value)}</span>);
  };
  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity size={20} className="text-indigo-600" />[前月実績]</h3><div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={prevChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis tickFormatter={(v)=>formatCurrency(v)} /><Tooltip formatter={(v:any)=>formatCurrency(v)} /><Bar dataKey="budget" name="予算" fill="#fb7185" /><Bar dataKey="target" name="目標" fill="#fbbf24" /><Bar dataKey="actual" name="実績" fill="#6366f1" /></BarChart></ResponsiveContainer></div></div>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100"><h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-indigo-500 pl-3">[前月サマリー詳細]</h2><div className="overflow-x-auto"><table className="w-full text-right min-w-[600px]"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-left">項目</th><th>予算</th><th>目標</th><th>実績</th><th>対予算</th><th>対目標</th></tr></thead><tbody>{prevTableData.map(r=>(<tr key={r.name} className="border-b"><td className="p-3 text-left font-bold">{r.name}</td><td>{r.budget.toLocaleString()}</td><td>{r.target.toLocaleString()}</td><td className="font-bold">{r.result.toLocaleString()}</td><td>{formatPercent(r.budget ? r.result/r.budget*100 : 0)}</td><td>{formatPercent(r.target ? r.result/r.target*100 : 0)}</td></tr>))}</tbody></table></div></div>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100"><h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">[当月サマリー詳細]</h2><div className="overflow-x-auto"><table className="w-full text-right min-w-[600px]"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-left">項目</th><th>予算</th><th>目標</th><th>予測</th><th>対予算</th><th>対目標</th></tr></thead><tbody>{thisTableData.map(r=>(<tr key={r.name} className="border-b"><td className="p-3 text-left font-bold">{r.name}</td><td>{r.budget.toLocaleString()}</td><td>{r.target.toLocaleString()}</td><td className="font-bold">{r.result.toLocaleString()}</td><td>{formatPercent(r.budget ? r.result/r.budget*100 : 0)}</td><td>{formatPercent(r.target ? r.result/r.target*100 : 0)}</td></tr>))}</tbody></table></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100"><div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v:any)=>formatCurrency(v)} /><Bar dataKey="sales_actual" fill="#6366f1" /><Line type="monotone" dataKey="sales_forecast" stroke="#94a3b8" /><Line type="monotone" dataKey="sales_budget" stroke="#fb7185" /><Line type="monotone" dataKey="sales_target" stroke="#f59e0b" /></ComposedChart></ResponsiveContainer></div></div><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between"><div className="space-y-4"><div className="p-4 bg-indigo-50 rounded-lg"><p className="text-xs font-bold text-indigo-800">四半期予測</p><div className="text-2xl font-bold">{formatCurrency(qForecast)}</div><div className="flex gap-2"><AchievementBadge label="予算" value={qBudget?qForecast/qBudget*100:0} /><AchievementBadge label="目標" value={qTarget?qForecast/qTarget*100:0} /></div></div><div className="p-4 bg-amber-50 rounded-lg"><p className="text-xs font-bold text-amber-800">半期予測</p><div className="text-2xl font-bold">{formatCurrency(hForecast)}</div><div className="flex gap-2"><AchievementBadge label="予算" value={hBudget?hForecast/hBudget*100:0} /><AchievementBadge label="目標" value={hTarget?hForecast/hTarget*100:0} /></div></div><div className="p-4 bg-emerald-50 rounded-lg"><p className="text-xs font-bold text-emerald-800">年間予測</p><div className="text-2xl font-bold">{formatCurrency(yForecast)}</div><div className="flex gap-2"><AchievementBadge label="予算" value={yBudget?yForecast/yBudget*100:0} /><AchievementBadge label="目標" value={yTarget?yForecast/yTarget*100:0} /></div></div></div></div></div>
    </div>
  );
};

// --- Sales Analysis Tab ---
const SalesAnalysisTab = ({ newSalesData, existingSalesData }: { newSalesData: NewSalesRecord[], existingSalesData: ExistingSalesRecord[] }) => {
  const [subTab, setSubTab] = useState<'new' | 'existing'>('new');
  const fy26Cumulative = [ { segment: 'Enterprise', budget: 30000, actual: 32000, count: 25, win_rate: 34, lead_time: 110, unit_price: 850, id_price: 2000, duration: 12 }, { segment: 'Mid', budget: 18000, actual: 17500, count: 60, win_rate: 42, lead_time: 55, unit_price: 290, id_price: 1500, duration: 12 }, { segment: 'Small', budget: 9000, actual: 9500, count: 150, win_rate: 58, lead_time: 25, unit_price: 63, id_price: 1200, duration: 12 } ];
  const monthlyTrend = [{ month: '4月', count: 10, amount: 4000 }, { month: '5月', count: 12, amount: 4500 }, { month: '6月', count: 15, amount: 5000 }, { month: '7月', count: 14, amount: 4800 }, { month: '8月', count: 18, amount: 5500 }, { month: '9月', count: 20, amount: 6200 }];
  const thisMonthDealList = [{ date: '2025/01/10', client: 'Fの杜', segment: 'Enterprise', amount: 2200, id_count: 80, duration: '12ヶ月', owner: '佐藤' }, { date: '2025/01/08', client: 'G建設', segment: 'Mid', amount: 550, id_count: 25, duration: '12ヶ月', owner: '田中' }, { date: '2025/01/05', client: 'Hデザイン', segment: 'Small', amount: 80, id_count: 8, duration: '12ヶ月', owner: '鈴木' }];
  const dealList = [{ date: '2024/09/25', client: 'A商事', segment: 'Enterprise', amount: 1500, id_count: 50, duration: '12ヶ月', owner: '佐藤' }, { date: '2024/09/20', client: 'Bテック', segment: 'Mid', amount: 400, id_count: 20, duration: '12ヶ月', owner: '田中' }];
  const fy25AnnualExisting = [{ segment: 'Enterprise', sales: 145000000, nrr: 112.5, renewal: 95.0, id_growth: 108.0 }, { segment: 'Mid', sales: 82000000, nrr: 101.2, renewal: 88.5, id_growth: 102.0 }, { segment: 'Small', sales: 35000000, nrr: 92.0, renewal: 82.0, id_growth: 95.0 }];
  const highValueProspects = [{ client: '株式会社イノベーション', segment: 'Enterprise', id_count: 300, amount: 4500, start_date: '2023/04/01', monthly_lessons: 1200, median_lessons: 4, learners_1: 280, learners_10: 150, learners_20: 50 }, { client: 'グローバル貿易', segment: 'Enterprise', id_count: 250, amount: 3800, start_date: '2023/05/01', monthly_lessons: 900, median_lessons: 3, learners_1: 200, learners_10: 100, learners_20: 30 }, { client: 'テックフロンティア', segment: 'Mid', id_count: 200, amount: 3200, start_date: '2023/06/01', monthly_lessons: 850, median_lessons: 5, learners_1: 190, learners_10: 120, learners_20: 60 }];
  const renewedList = [{ client: 'アルファ工業', segment: 'Enterprise', amount: 1200, id_count: 60, term: '12ヶ月' }, { client: 'ベータ銀行', segment: 'Enterprise', amount: 3000, id_count: 150, term: '12ヶ月' }];
  const notRenewedList = [{ client: 'Zマート', segment: 'Small', expiry: '2024/09/30', amount: 100, id_count: 5, owner: '鈴木', comment: '価格面で折り合わず' }];
  const fluctuationList = [{ client: 'Xホールディングス', segment: 'Enterprise', oldAmount: 2000, newAmount: 2500, id_count: 120, diff: '+25%', reason: '部署拡大' }, { client: 'Yシステムズ', segment: 'Mid', oldAmount: 500, newAmount: 0, id_count: 0, diff: '-100%', reason: '解約 (予算縮小)' }];
  
  const displayData = newSalesData.filter(d => ['Enterprise', 'Mid', 'Small'].includes(d.segment));
  const graphData = displayData.map(d => ({ segment: d.segment, last_year: Number(d.last_year) || 0, budget: Number(d.budget) || 0, target: Number(d.target) || 0, actual: Number(d.actual) || 0 }));
  const entData = existingSalesData.find(d => d.segment === 'Enterprise') || { sales: 0, nrr: 0, renewal: 0, id_growth: 0 };
  const midData = existingSalesData.find(d => d.segment === 'Mid') || { sales: 0, nrr: 0, renewal: 0, id_growth: 0 };
  const smlData = existingSalesData.find(d => d.segment === 'Small') || { sales: 0, nrr: 0, renewal: 0, id_growth: 0 };
  const totalSales = existingSalesData.reduce((a, b) => a + Number(b.sales), 0);
  const totalData = { sales: totalSales, nrr: existingSalesData.reduce((a, b) => a + Number(b.nrr), 0)/3, renewal: existingSalesData.reduce((a, b) => a + Number(b.renewal), 0)/3, id_growth: existingSalesData.reduce((a, b) => a + Number(b.id_growth), 0)/3 };
  const totalAnnualData = { sales: fy25AnnualExisting.reduce((a, b) => a + b.sales, 0), nrr: fy25AnnualExisting.reduce((a, b) => a + b.nrr, 0)/3, renewal: fy25AnnualExisting.reduce((a, b) => a + b.renewal, 0)/3, id_growth: fy25AnnualExisting.reduce((a, b) => a + b.id_growth, 0)/3 };

  const CircularRate = ({ label, value, color }: { label: string, value: number, color: string }) => {
    const data = [{ name: 'Val', value: value }, { name: 'Rest', value: 100 - (value > 100 ? 0 : value) }];
    return (<div className="flex flex-col items-center"><div className="w-16 h-16 relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} innerRadius={20} outerRadius={28} startAngle={90} endAngle={-270} dataKey="value" stroke="none"><Cell fill={color} /><Cell fill={PIE_COLORS.off} /></Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{value.toFixed(1)}%</div></div><span className="text-[10px] font-bold text-slate-600 mt-1">{label}</span></div>);
  };
  const SegmentCard = ({ title, data, colorClass, isAnnual = false }: any) => (<div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full bg-white"><div className={`${colorClass} text-white py-2 text-center font-bold text-sm uppercase`}>{title} {isAnnual ? '(FY25通年)' : ''}</div><div className="p-4 flex flex-col items-center justify-between flex-1"><div className="text-center mb-4"><p className="text-[10px] text-slate-500 font-bold mb-1">売上金額(円)</p><p className="text-xl font-extrabold text-slate-800">{Number(data.sales).toLocaleString()}</p></div><div className="flex justify-between w-full px-1"><CircularRate label="NRR" value={Number(data.nrr)} color="#10b981" /><CircularRate label="更新率" value={Number(data.renewal)} color="#3b82f6" /><CircularRate label="ID増減" value={Number(data.id_growth)} color="#f59e0b" /></div></div></div>);
  const GaugeChart = ({ title, budget, target, actual }: any) => { const budRate = budget ? Math.min((actual / budget) * 100, 100) : 0; const tarRate = target ? Math.min((actual / target) * 100, 100) : 0; return (<div className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-lg"><h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4><div className="w-full space-y-2"><div><div className="flex justify-between text-[10px] text-slate-500 mb-0.5"><span>予算比</span><span>{budget ? Math.round((actual/budget)*100) : 0}%</span></div><div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${budRate}%` }}></div></div></div><div><div className="flex justify-between text-[10px] text-slate-500 mb-0.5"><span>目標比</span><span>{target ? Math.round((actual/target)*100) : 0}%</span></div><div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${tarRate}%` }}></div></div></div></div><div className="mt-2 text-center"><span className="text-lg font-bold text-slate-800">{actual.toLocaleString()}</span><span className="text-[10px] text-slate-400 ml-1">/ Target: {target.toLocaleString()}</span></div></div>); };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-slate-200 pb-2">
        <button onClick={() => setSubTab('new')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${subTab === 'new' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>新規売上 (New Sales)</button>
        <button onClick={() => setSubTab('existing')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${subTab === 'existing' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>既存売上 (Existing Sales)</button>
      </div>
      {subTab === 'new' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-indigo-600" />前月セグメント別 予実</h3><div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={graphData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="segment" /><YAxis tickFormatter={(val) => `${val/1000}k`} /><Tooltip formatter={(v:any)=>formatCurrency(v)} /><Legend /><Bar dataKey="last_year" name="昨年実績" fill="#94a3b8" /><Bar dataKey="budget" name="予算" fill="#fb7185" /><Bar dataKey="target" name="目標" fill="#fbbf24" /><Bar dataKey="actual" name="実績" fill="#6366f1" /></ComposedChart></ResponsiveContainer></div></div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-x-auto"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Building size={20} className="text-indigo-600" />前月セグメント別 詳細指標</h3><table className="w-full text-right text-sm min-w-[800px]"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-left">セグメント</th><th>金額</th><th>件数</th><th>受注率</th><th>LT</th><th>社単価</th><th>ID単価</th><th>期間</th></tr></thead><tbody>{displayData.map(r=>(<tr key={r.segment} className="border-b"><td className="p-3 text-left font-bold">{r.segment}</td><td className="font-bold text-indigo-600">{Number(r.actual).toLocaleString()}</td><td>{r.count}</td><td>{r.win_rate}%</td><td>{r.lead_time}</td><td>{Number(r.unit_price).toLocaleString()}</td><td>{Number(r.id_price).toLocaleString()}</td><td>{r.duration}</td></tr>))}</tbody></table></div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-indigo-600" />前月受注案件詳細</h3><div className="overflow-x-auto max-h-96"><table className="w-full text-sm text-left text-slate-600"><thead className="bg-slate-50"><tr><th className="p-3">顧客名</th><th>金額</th><th>ID数</th><th>期間</th></tr></thead><tbody>{dealList.map((d,i)=>(<tr key={i}><td className="p-3 font-bold">{d.client}</td><td>{d.amount.toLocaleString()}</td><td>{d.id_count}</td><td>{d.duration}</td></tr>))}</tbody></table></div></div><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={20} className="text-indigo-600" />新規売上コメント</h3><div className="bg-slate-50 p-4 h-96 overflow-y-auto text-sm">コメント...</div></div></div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-emerald-600" />今月受注案件詳細</h3><div className="overflow-x-auto mb-8"><table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr><th className="p-3">顧客名</th><th>金額</th><th>ID数</th></tr></thead><tbody>{thisMonthDealList.map((d,i)=>(<tr key={i}><td className="p-3 font-bold">{d.client}</td><td>{d.amount.toLocaleString()}</td><td>{d.id_count}</td></tr>))}</tbody></table></div><h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-2">セグメント別 受注進捗</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"><div><GaugeChart title="Ent - 件数" budget={10} target={12} actual={5} /></div><div><GaugeChart title="Mid - 件数" budget={20} target={25} actual={12} /></div><div><GaugeChart title="Small - 件数" budget={50} target={60} actual={30} /></div></div><h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-2">FY26累計詳細</h4><div className="overflow-x-auto mb-8"><table className="w-full text-right text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">セグメント</th><th>予算</th><th>実績</th></tr></thead><tbody>{fy26Cumulative.map(r=>(<tr key={r.segment}><td className="p-3 text-left font-bold">{r.segment}</td><td>{r.budget.toLocaleString()}</td><td>{r.actual.toLocaleString()}</td></tr>))}</tbody></table></div><h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-2">月次推移</h4><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={monthlyTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis yAxisId="L" /><YAxis yAxisId="R" orientation="right" /><Tooltip /><Bar yAxisId="L" dataKey="amount" fill="#6366f1" /><Line yAxisId="R" type="monotone" dataKey="count" stroke="#f59e0b" /></ComposedChart></ResponsiveContainer></div></div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={20} className="text-emerald-600" />更新・アップセルコメント</h3><div className="bg-emerald-50 p-4 rounded-lg h-24 overflow-y-auto text-sm">コメント...</div></div>
           <div><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><RefreshCw size={20} className="text-emerald-600" />セグメント別 既存売上・維持率分析</h3><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><SegmentCard title="Enterprise" data={entData} colorClass="bg-[#1e5fa0]" /><SegmentCard title="Mid" data={midData} colorClass="bg-[#3b82f6]" /><SegmentCard title="Small" data={smlData} colorClass="bg-[#f59e0b]" /><SegmentCard title="合計 / 平均" data={totalData} colorClass="bg-[#64748b]" /></div></div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><XSquare size={20} className="text-slate-500" />未更新企業一覧</h3><table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr><th className="p-2">顧客名</th><th>理由</th></tr></thead><tbody>{notRenewedList.map((f,i)=>(<tr key={i}><td className="p-2 font-bold">{f.client}</td><td>{f.comment}</td></tr>))}</tbody></table></div><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-rose-500" />大幅変動企業リスト</h3><table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr><th className="p-2">顧客名</th><th>変動</th></tr></thead><tbody>{fluctuationList.map((f,i)=>(<tr key={i}><td className="p-2 font-bold">{f.client}</td><td>{f.diff}</td></tr>))}</tbody></table></div></div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckSquare size={20} className="text-emerald-600" />更新完了企業一覧 (全件)</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">{renewedList.map((r,i)=>(<div key={i} className="flex justify-between p-3 bg-slate-50 border rounded"><span className="font-bold">{r.client}</span><span>{r.amount.toLocaleString()}</span></div>))}</div><h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-emerald-500 pl-2">FY25通年 (確定値)</h4><div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"><SegmentCard title="Enterprise" data={fy25AnnualExisting[0]} colorClass="bg-[#1e5fa0]" isAnnual={true} /><SegmentCard title="Mid" data={fy25AnnualExisting[1]} colorClass="bg-[#3b82f6]" isAnnual={true} /><SegmentCard title="Small" data={fy25AnnualExisting[2]} colorClass="bg-[#f59e0b]" isAnnual={true} /><SegmentCard title="合計 / 平均" data={totalAnnualData} colorClass="bg-[#64748b]" isAnnual={true} /></div><h4 className="text-md font-bold text-slate-700 mb-4 border-l-4 border-emerald-500 pl-2">更新見込 (300万円以上)</h4><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-emerald-50 text-emerald-900"><tr><th className="p-3">顧客名</th><th>金額</th><th>ID数</th></tr></thead><tbody>{highValueProspects.map((r,i)=>(<tr key={i}><td className="p-3 font-bold">{r.client}</td><td>{r.amount.toLocaleString()}</td><td>{r.id_count}</td></tr>))}</tbody></table></div></div>
        </div>
      )}
    </div>
  );
};

// --- Other Sales Tab ---
const OtherSalesTab = () => {
    const segments = [{ name: '企業代理店', budget: 1000, target: 1200, actual: 1100 }, { name: '企業優待', budget: 500, target: 600, actual: 550 }, { name: '学校・自治体', budget: 2000, target: 2000, actual: 1800 }, { name: '留学エージェント', budget: 800, target: 1000, actual: 900 }];
    const partners = [{ name: 'Partner A', value: 1200 }, { name: 'Partner B', value: 900 }, { name: 'Partner C', value: 800 }, { name: 'Partner D', value: 600 }, { name: 'その他', value: 500 }];
    const totalOtherSales = partners.reduce((a, b) => a + b.value, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={20} className="text-indigo-600" />その他売上コメント</h3><div className="bg-slate-50 p-4 rounded-lg h-24 overflow-y-auto text-sm">コメント...</div></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-indigo-600" />前月セグメント別 予実 (その他)</h3><div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={segments}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v:any)=>formatCurrency(v)} /><Legend /><Bar dataKey="budget" name="予算" fill="#94a3b8" /><Bar dataKey="target" name="目標" fill="#fbbf24" /><Bar dataKey="actual" name="実績" fill="#6366f1" /></BarChart></ResponsiveContainer></div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChartIcon size={20} className="text-indigo-600" />取引先別 売上構成比</h3><div className="h-80 w-full flex"><ResponsiveContainer width="60%" height="100%"><PieChart><Pie data={partners} cx="50%" cy="50%" outerRadius={80} dataKey="value"><Cell fill={COLORS[0]} /><Cell fill={COLORS[1]} /><Cell fill={COLORS[2]} /><Cell fill={COLORS[3]} /><Cell fill={COLORS[4]} /></Pie><Tooltip /></PieChart></ResponsiveContainer><div className="w-[40%] flex flex-col justify-center space-y-2 overflow-y-auto max-h-80 text-xs">{partners.map((p, i) => (<div key={i} className="flex justify-between items-center pr-4"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div><span>{p.name}</span></div><div className="text-right"><span className="font-bold">{p.value.toLocaleString()}</span><span className="text-slate-400 ml-1">({((p.value/totalOtherSales)*100).toFixed(1)}%)</span></div></div>))}</div></div></div>
            </div>
        </div>
    );
};

// --- Negotiation Analysis Tab ---
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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Presentation size={20} className="text-indigo-600" />月次商談分析レポート</h3><input type="text" className="w-full p-2 border mb-4 rounded text-sm" value={url} onChange={handleUrlChange} /><div className="w-full h-[600px] bg-slate-50 border rounded flex items-center justify-center">{url ? (<iframe src={url.includes('drive.google.com') ? url.replace('/view', '/preview') : `https://drive.google.com/file/d/${url}/preview`} width="100%" height="100%" className="rounded"></iframe>) : <p>URLを入力してください</p>}</div></div>
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Users size={20} className="text-emerald-600" />顧問経由商談 CPA</h3><div className="overflow-x-auto mb-8"><table className="w-full text-sm text-right"><thead className="bg-emerald-50 text-emerald-900"><tr><th className="p-3 text-left">ソース</th><th>総コスト</th><th>紹介数</th><th>失注</th><th>継続</th><th>受注</th><th>受注金額</th><th>単価</th><th>受注率</th></tr></thead><tbody>{advisorData.map((d,i)=>(<tr key={i}><td className="p-3 text-left font-bold">{d.source}</td><td>¥{d.cost.toLocaleString()}</td><td>{d.referrals}</td><td>{d.lost}</td><td>{d.ongoing}</td><td className="font-bold text-emerald-600">{d.won}</td><td>¥{d.revenue.toLocaleString()}</td><td>¥{(d.won?Math.round(d.revenue/d.won):0).toLocaleString()}</td><td>{(d.referrals?d.won/d.referrals*100:0).toFixed(1)}%</td></tr>))}</tbody></table></div><h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><List size={20} className="text-indigo-600" />顧問経由商談一覧</h3><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr><th className="p-3">企業名</th><th>セグメント</th><th>面談相手</th><th>ステータス</th><th>メモ</th></tr></thead><tbody>{advisorDealList.map((d,i)=>(<tr key={i}><td className="p-3 font-bold">{d.company}</td><td>{d.segment}</td><td>{d.person}</td><td>{d.status}</td><td className="text-xs text-slate-500">{d.memo}</td></tr>))}</tbody></table></div></div>
    </div>
  );
};

// --- Process Analysis Tab ---
const ProcessAnalysisTab = () => {
  const fy26EntFunnelData = [{ value: 2500, name: 'リード獲得', fill: '#4f46e5' }, { value: 500, name: '商談化', fill: '#6366f1' }, { value: 250, name: '提案', fill: '#818cf8' }, { value: 50, name: '受注', fill: '#a5b4fc' }];
  const campaignLeadData = [{ name: '[EV] HR Momentum', ent: 99, mid: 46, sml: 72, unk: 22 }, { name: '未入力', ent: 84, mid: 34, sml: 37, unk: 24 }];
  const sourceData = [{ source: 'Web (Inbound)', leads: 2500, opps: 400, orders: 80, cost: 5000000, revenue: 12000000 }, { source: 'Event', leads: 1200, opps: 150, orders: 30, cost: 8000000, revenue: 6000000 }];
  const currentStockData = { leads: 3450, activeOpps: 420, activeTrials: 115 };
  const segmentFunnelData = [{ stage: 'リード獲得', Ent: 200, Mid: 400, Small: 600 }, { stage: '商談化', Ent: 80, Mid: 150, Small: 220 }];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={20} className="text-indigo-600" />プロセス分析コメント</h3><div className="bg-slate-50 p-4 h-24 overflow-y-auto text-sm">コメント...</div></div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Filter size={20} className="text-indigo-600" />当月セグメント別 ファネル</h3><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{stage:'リード',Ent:200,Mid:400,Small:600}]} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="stage" type="category" /><Tooltip /><Legend /><Bar dataKey="Ent" stackId="a" fill="#1e5fa0" /><Bar dataKey="Mid" stackId="a" fill="#3b82f6" /><Bar dataKey="Small" stackId="a" fill="#f59e0b" /></BarChart></ResponsiveContainer></div></div><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Filter size={20} className="text-indigo-600" />FY26累計ファネル</h3><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><FunnelChart><Tooltip /><Funnel dataKey="value" data={fy26EntFunnelData} isAnimationActive><LabelList position="center" fill="#fff" stroke="none" dataKey="value" /></Funnel></FunnelChart></ResponsiveContainer><div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">{fy26EntFunnelData.map((d,i)=>(<div key={i} className="p-2 bg-slate-50 rounded"><div className="font-bold">{d.name}</div><div>{d.value}件</div></div>))}</div></div></div>
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><DollarSign size={20} className="text-amber-500" />ソース別 獲得分析 & CPA</h3><div className="overflow-x-auto"><table className="w-full text-sm text-right"><thead className="bg-amber-50"><tr><th className="p-3 text-left">ソース</th><th>リード</th><th>商談</th><th>CPL</th><th>CPO</th><th>受注単価</th></tr></thead><tbody>{sourceData.map((s,i)=>(<tr key={i}><td className="p-3 text-left font-bold">{s.source}</td><td>{s.leads}</td><td>{s.opps}</td><td>¥{Math.round(s.cost/s.leads).toLocaleString()}</td><td>¥{Math.round(s.cost/s.opps).toLocaleString()}</td><td>¥{Math.round(s.revenue/s.orders).toLocaleString()}</td></tr>))}</tbody></table></div></div>
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Megaphone size={20} className="text-rose-500" />キャンペーン別 獲得分析</h3><div className="overflow-x-auto"><table className="w-full text-sm text-right"><thead className="bg-slate-50"><tr><th className="p-2 text-left">CP名</th><th>Ent</th><th>Mid</th><th>Sml</th><th>計</th></tr></thead><tbody>{campaignLeadData.map((c,i)=>(<tr key={i}><td className="p-2 text-left">{c.name}</td><td>{c.ent}</td><td>{c.mid}</td><td>{c.sml}</td><td>{c.ent+c.mid+c.sml+c.unk}</td></tr>))}</tbody></table></div></div>
    </div>
  );
};

const FutureActionTab = ({ data }: any) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex items-center justify-center text-slate-400">
            <div className="text-center">
                <Target size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Future Action Analysis & Simulation</p>
                <p className="text-sm mt-2">Coming soon...</p>
            </div>
        </div>
    );
};