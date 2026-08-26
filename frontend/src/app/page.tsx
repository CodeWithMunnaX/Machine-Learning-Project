"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  BrainCircuit,
  Workflow,
  Sparkles,
  TrendingUp,
  Award,
  RefreshCw,
  Building2,
  GraduationCap,
  Briefcase,
  DollarSign,
  Globe2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Gauge,
  Sun,
  Moon,
  Zap,
  Sliders,
  FileSpreadsheet,
  Download,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const API_BASE = "http://localhost:8080";

type ThemeMode = "neon" | "light" | "knight";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"predict" | "batch" | "analytics" | "models" | "pipeline">("predict");
  const [theme, setTheme] = useState<ThemeMode>("neon");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [trainingStatus, setTrainingStatus] = useState<string>("");

  // Single Applicant Form State
  const [formData, setFormData] = useState({
    continent: "Asia",
    education_of_employee: "Master's",
    has_job_experience: "Y",
    requires_job_training: "N",
    no_of_employees: 5000,
    yr_of_estab: 2005,
    region_of_employment: "West",
    prevailing_wage: 120000,
    unit_of_wage: "Year",
    full_time_position: "Y"
  });

  // What-If Simulator State
  const [simulatorWage, setSimulatorWage] = useState<number>(120000);
  const [simulatorEdu, setSimulatorEdu] = useState<string>("Master's");
  const [simulatorExp, setSimulatorExp] = useState<string>("Y");
  const [simulatorProbability, setSimulatorProbability] = useState<number | null>(null);

  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [batchFilter, setBatchFilter] = useState<string>("all");

  useEffect(() => {
    fetchHealth();
    fetchAnalytics();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setApiOnline(data.status === "healthy");
    } catch {
      setApiOnline(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (e) {
      console.log("Analytics API fetch fallback", e);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setPredictionResult(data.data);
        setSimulatorWage(formData.prevailing_wage);
        setSimulatorEdu(formData.education_of_employee);
        setSimulatorExp(formData.has_job_experience);
        setSimulatorProbability(data.data.approval_probability);
      } else {
        alert("Prediction failed: " + data.detail);
      }
    } catch (err: any) {
      alert("Failed to connect to ML Backend API on http://localhost:8080.");
    } finally {
      setLoading(false);
    }
  };

  // Run What-If Simulation
  const runSimulator = async (newWage: number, newEdu: string, newExp: string) => {
    setSimulatorWage(newWage);
    setSimulatorEdu(newEdu);
    setSimulatorExp(newExp);
    try {
      const simPayload = {
        ...formData,
        prevailing_wage: newWage,
        education_of_employee: newEdu,
        has_job_experience: newExp
      };
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simPayload)
      });
      const data = await res.json();
      if (data.success) {
        setSimulatorProbability(data.data.approval_probability);
      }
    } catch (err) {
      console.log("Simulator error", err);
    }
  };

  const loadPreset = (presetType: "elite" | "standard" | "highrisk") => {
    if (presetType === "elite") {
      setFormData({
        continent: "Europe",
        education_of_employee: "Doctorate",
        has_job_experience: "Y",
        requires_job_training: "N",
        no_of_employees: 25000,
        yr_of_estab: 1995,
        region_of_employment: "Northeast",
        prevailing_wage: 210000,
        unit_of_wage: "Year",
        full_time_position: "Y"
      });
    } else if (presetType === "standard") {
      setFormData({
        continent: "Asia",
        education_of_employee: "Master's",
        has_job_experience: "Y",
        requires_job_training: "N",
        no_of_employees: 4500,
        yr_of_estab: 2008,
        region_of_employment: "West",
        prevailing_wage: 98000,
        unit_of_wage: "Year",
        full_time_position: "Y"
      });
    } else {
      setFormData({
        continent: "Africa",
        education_of_employee: "High School",
        has_job_experience: "N",
        requires_job_training: "Y",
        no_of_employees: 20,
        yr_of_estab: 2022,
        region_of_employment: "Island",
        prevailing_wage: 28000,
        unit_of_wage: "Year",
        full_time_position: "N"
      });
    }
  };

  // Load Sample Batch CSV Dataset
  const handleLoadSampleBatch = async () => {
    setBatchLoading(true);
    const sampleRecords = [
      { continent: "Asia", education_of_employee: "Doctorate", has_job_experience: "Y", requires_job_training: "N", no_of_employees: 12000, yr_of_estab: 1998, region_of_employment: "West", prevailing_wage: 185000, unit_of_wage: "Year", full_time_position: "Y" },
      { continent: "Europe", education_of_employee: "Master's", has_job_experience: "Y", requires_job_training: "N", no_of_employees: 4500, yr_of_estab: 2005, region_of_employment: "Northeast", prevailing_wage: 110000, unit_of_wage: "Year", full_time_position: "Y" },
      { continent: "North America", education_of_employee: "Bachelor's", has_job_experience: "Y", requires_job_training: "N", no_of_employees: 800, yr_of_estab: 2012, region_of_employment: "South", prevailing_wage: 75000, unit_of_wage: "Year", full_time_position: "Y" },
      { continent: "Africa", education_of_employee: "High School", has_job_experience: "N", requires_job_training: "Y", no_of_employees: 30, yr_of_estab: 2021, region_of_employment: "Island", prevailing_wage: 32000, unit_of_wage: "Year", full_time_position: "N" },
      { continent: "South America", education_of_employee: "Master's", has_job_experience: "N", requires_job_training: "N", no_of_employees: 2200, yr_of_estab: 2010, region_of_employment: "Midwest", prevailing_wage: 92000, unit_of_wage: "Year", full_time_position: "Y" },
      { continent: "Asia", education_of_employee: "Bachelor's", has_job_experience: "N", requires_job_training: "Y", no_of_employees: 150, yr_of_estab: 2019, region_of_employment: "West", prevailing_wage: 54000, unit_of_wage: "Year", full_time_position: "Y" }
    ];

    try {
      const res = await fetch(`${API_BASE}/predict-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: sampleRecords })
      });
      const data = await res.json();
      if (data.success) {
        setBatchResults(data.results);
      }
    } catch (e) {
      alert("Batch evaluation failed: Ensure backend is running.");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!batchResults.length) return;
    const headers = Object.keys(batchResults[0]).join(",");
    const rows = batchResults.map((r) => Object.values(r).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "us_visa_adjudication_predictions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerTraining = async () => {
    setTrainingStatus("Training pipeline started in background...");
    try {
      const res = await fetch(`${API_BASE}/train`);
      const data = await res.json();
      setTrainingStatus(data.message || "Training pipeline executing...");
    } catch {
      setTrainingStatus("Error initiating training pipeline.");
    }
  };

  const filteredBatch = batchResults.filter((item) => {
    if (batchFilter === "Certified") return item.Predicted_Status === "Certified";
    if (batchFilter === "Denied") return item.Predicted_Status === "Denied";
    return true;
  });

  const eduChartData = analyticsData
    ? Object.entries(analyticsData.approval_by_education).map(([name, rate]) => ({ name, rate }))
    : [
        { name: "Doctorate", rate: 89.2 },
        { name: "Master's", rate: 78.4 },
        { name: "Bachelor's", rate: 62.1 },
        { name: "High School", rate: 34.5 }
      ];

  const continentChartData = analyticsData
    ? Object.entries(analyticsData.approval_by_continent).map(([name, rate]) => ({ name, rate }))
    : [
        { name: "Europe", rate: 79.5 },
        { name: "Asia", rate: 71.2 },
        { name: "North America", rate: 68.3 },
        { name: "Africa", rate: 61.4 },
        { name: "South America", rate: 58.6 },
        { name: "Oceania", rate: 54.2 }
      ];

  return (
    <div className={`min-h-screen theme-${theme}`}>
      {/* Top Navigation Bar */}
      <header className="border-b sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight">US VISA AI</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Enterprise Suite v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Adjudication Prediction, Explainability (XAI) & Batch Ops</p>
            </div>
          </div>

          {/* Controls: Theme Switcher & Status */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Pill */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <button
                onClick={() => setTheme("neon")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  theme === "neon"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Cyber Neon Theme"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span className="hidden sm:inline">Neon</span>
              </button>

              <button
                onClick={() => setTheme("light")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  theme === "light"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Clean Light Theme"
              >
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Light</span>
              </button>

              <button
                onClick={() => setTheme("knight")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  theme === "knight"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Midnight Knight Theme"
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Knight</span>
              </button>
            </div>

            {/* Precision Badge */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">High-Confidence Tier:</span>
              <span className="font-bold text-amber-400">97.42% Precision</span>
            </div>

            {/* API Health Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${apiOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
              <span className="text-slate-300 font-medium">API: {apiOnline ? "Live (8080)" : "Offline"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-8 max-w-3xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("predict")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "predict"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Predictor & XAI</span>
          </button>

          <button
            onClick={() => setActiveTab("batch")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "batch"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Batch CSV Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dataset Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("models")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "models"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Model Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "pipeline"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Pipeline Ops</span>
          </button>
        </div>

        {/* TAB 1: VISA PREDICTOR & EXPLAINABLE AI (XAI) */}
        {activeTab === "predict" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>Applicant Petition Profile</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Parameters for real-time inference & feature attribution</p>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        onClick={() => loadPreset("elite")}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                      >
                        ⭐ Elite
                      </button>
                      <button
                        type="button"
                        onClick={() => loadPreset("standard")}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20"
                      >
                        💼 Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => loadPreset("highrisk")}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                      >
                        ⚠️ Risk
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handlePredict} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Continent */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Continent</span>
                        </label>
                        <select
                          value={formData.continent}
                          onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Asia">Asia</option>
                          <option value="Europe">Europe</option>
                          <option value="North America">North America</option>
                          <option value="South America">South America</option>
                          <option value="Africa">Africa</option>
                          <option value="Oceania">Oceania</option>
                        </select>
                      </div>

                      {/* Education Level */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Education Level</span>
                        </label>
                        <select
                          value={formData.education_of_employee}
                          onChange={(e) => setFormData({ ...formData, education_of_employee: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Doctorate">Doctorate</option>
                          <option value="Master's">Master&apos;s</option>
                          <option value="Bachelor's">Bachelor&apos;s</option>
                          <option value="High School">High School</option>
                        </select>
                      </div>

                      {/* Job Experience */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Prior Job Experience</span>
                        </label>
                        <select
                          value={formData.has_job_experience}
                          onChange={(e) => setFormData({ ...formData, has_job_experience: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Y">Yes (Experienced)</option>
                          <option value="N">No (Entry Level)</option>
                        </select>
                      </div>

                      {/* Job Training Required */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Requires Job Training</span>
                        </label>
                        <select
                          value={formData.requires_job_training}
                          onChange={(e) => setFormData({ ...formData, requires_job_training: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="N">No Training Required</option>
                          <option value="Y">Requires Mandatory Training</option>
                        </select>
                      </div>

                      {/* Prevailing Wage */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Prevailing Wage</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.prevailing_wage}
                          onChange={(e) => setFormData({ ...formData, prevailing_wage: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Unit of Wage */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Unit of Wage</span>
                        </label>
                        <select
                          value={formData.unit_of_wage}
                          onChange={(e) => setFormData({ ...formData, unit_of_wage: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Year">Per Year (Annual)</option>
                          <option value="Month">Per Month</option>
                          <option value="Week">Per Week</option>
                          <option value="Hour">Per Hour</option>
                        </select>
                      </div>

                      {/* Number of Employees */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Employer Headcount</span>
                        </label>
                        <input
                          type="number"
                          value={formData.no_of_employees}
                          onChange={(e) => setFormData({ ...formData, no_of_employees: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Year of Establishment */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Company Founded Year</span>
                        </label>
                        <input
                          type="number"
                          value={formData.yr_of_estab}
                          onChange={(e) => setFormData({ ...formData, yr_of_estab: parseInt(e.target.value) || 1990 })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Evaluating Petition via ML Model...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Evaluate Visa Petition Instantly</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Results & XAI Column */}
              <div className="lg:col-span-6 space-y-6">
                {predictionResult ? (
                  <div className="glass-panel p-6 sm:p-8 rounded-2xl border-indigo-500/30">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Adjudication Verdict</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold">
                        Calibrated Threshold: {predictionResult.optimal_threshold}
                      </span>
                    </div>

                    {/* Verdict Banner */}
                    <div className="my-6 text-center">
                      {predictionResult.status === "Certified" ? (
                        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                          </div>
                          <h3 className="text-2xl font-black text-emerald-400">CERTIFIED (APPROVED)</h3>
                          <p className="text-xs text-emerald-400 mt-1">High probability of labor certification clearance</p>
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                          <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-400 mx-auto flex items-center justify-center mb-3">
                            <XCircle className="w-8 h-8 text-rose-400" />
                          </div>
                          <h3 className="text-2xl font-black text-rose-400">DENIED (HIGH RISK)</h3>
                          <p className="text-xs text-rose-400 mt-1">Audit or rejection risk identified</p>
                        </div>
                      )}
                    </div>

                    {/* Probability Metrics */}
                    <div className="grid grid-cols-2 gap-4 my-6">
                      <div className="glass-card p-4 rounded-xl text-center">
                        <span className="text-xs text-slate-400 block mb-1">Approval Probability</span>
                        <span className="text-3xl font-black text-indigo-400">
                          {predictionResult.approval_probability}%
                        </span>
                      </div>

                      <div className="glass-card p-4 rounded-xl text-center">
                        <span className="text-xs text-slate-400 block mb-1">Confidence Tier</span>
                        <span className="text-lg font-bold text-amber-400 flex items-center justify-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{predictionResult.confidence_tier} ({predictionResult.tier_accuracy})</span>
                        </span>
                      </div>
                    </div>

                    {/* Explainable AI (XAI) Waterfall Feature Attribution */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                        <Info className="w-4 h-4 text-indigo-400" />
                        <span>Explainable AI (XAI) Feature Attribution</span>
                      </h4>

                      <div className="space-y-2.5">
                        {predictionResult.feature_impacts?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                            <div className="flex items-center space-x-2">
                              {item.direction === "positive" ? (
                                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                              <span>{item.feature}</span>
                            </div>
                            <span className={`font-bold ${item.direction === "positive" ? "text-emerald-400" : "text-rose-400"}`}>
                              {item.impact}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Counterfactual Actionable Recommendations */}
                    {predictionResult.recommendations?.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-800 mt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Actionable Strategic Recommendations</span>
                        </h4>
                        <div className="space-y-2">
                          {predictionResult.recommendations.map((rec: string, i: number) => (
                            <div key={i} className="text-xs p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-300">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[460px]">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                      <Gauge className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold">No Evaluation Active</h3>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm">
                      Fill out the applicant petition details on the left and click &quot;Evaluate Visa Petition&quot; to see real-time AI adjudication and feature attributions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* WHAT-IF SENSITIVITY SIMULATOR */}
            {predictionResult && (
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-indigo-500/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold flex items-center space-x-2">
                      <Sliders className="w-5 h-5 text-indigo-400" />
                      <span>Interactive &quot;What-If&quot; Sensitivity Simulator</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Drag sliders or modify candidate attributes to see instantaneous real-time probability recalculation
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Simulated Approval Chance</span>
                    <span className={`text-2xl font-black ${simulatorProbability && simulatorProbability >= 52 ? "text-emerald-400" : "text-rose-400"}`}>
                      {simulatorProbability}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Slider: Salary */}
                  <div className="glass-card p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Prevailing Wage Offer</span>
                      <span className="text-indigo-400 font-bold">${simulatorWage.toLocaleString()}/yr</span>
                    </div>
                    <input
                      type="range"
                      min="25000"
                      max="250000"
                      step="5000"
                      value={simulatorWage}
                      onChange={(e) => runSimulator(parseFloat(e.target.value), simulatorEdu, simulatorExp)}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>$25k (Min)</span>
                      <span>$135k (Mid)</span>
                      <span>$250k (High)</span>
                    </div>
                  </div>

                  {/* Toggle: Education Level */}
                  <div className="glass-card p-4 rounded-xl space-y-2">
                    <span className="text-xs font-semibold block">Education Credential</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["Doctorate", "Master's", "Bachelor's", "High School"].map((ed) => (
                        <button
                          key={ed}
                          type="button"
                          onClick={() => runSimulator(simulatorWage, ed, simulatorExp)}
                          className={`px-2 py-1.5 text-xs rounded font-medium transition-all ${
                            simulatorEdu === ed
                              ? "bg-indigo-600 text-white font-bold"
                              : "bg-slate-900 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {ed}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle: Job Experience */}
                  <div className="glass-card p-4 rounded-xl space-y-2">
                    <span className="text-xs font-semibold block">Prior Experience Status</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => runSimulator(simulatorWage, simulatorEdu, "Y")}
                        className={`py-2 text-xs rounded font-medium transition-all ${
                          simulatorExp === "Y"
                            ? "bg-emerald-600 text-white font-bold"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        ✓ Experienced (Y)
                      </button>
                      <button
                        type="button"
                        onClick={() => runSimulator(simulatorWage, simulatorEdu, "N")}
                        className={`py-2 text-xs rounded font-medium transition-all ${
                          simulatorExp === "N"
                            ? "bg-rose-600 text-white font-bold"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        ✗ Entry Level (N)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BATCH CSV ENGINE */}
        {activeTab === "batch" && (
          <div className="space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                    <span>Enterprise Batch Applicant Evaluation Engine</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Process bulk visa petitions simultaneously and export stamped adjudication records
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleLoadSampleBatch}
                    disabled={batchLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {batchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Load & Evaluate Batch</span>
                  </button>

                  {batchResults.length > 0 && (
                    <button
                      onClick={handleDownloadCSV}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV Results</span>
                    </button>
                  )}
                </div>
              </div>

              {batchResults.length > 0 ? (
                <div>
                  {/* Filter Badges */}
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setBatchFilter("all")}
                      className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                        batchFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      All Cases ({batchResults.length})
                    </button>
                    <button
                      onClick={() => setBatchFilter("Certified")}
                      className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                        batchFilter === "Certified" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Approved ({batchResults.filter((b) => b.Predicted_Status === "Certified").length})
                    </button>
                    <button
                      onClick={() => setBatchFilter("Denied")}
                      className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                        batchFilter === "Denied" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Denied ({batchResults.filter((b) => b.Predicted_Status === "Denied").length})
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="uppercase border-b bg-slate-900/80">
                        <tr>
                          <th className="py-3 px-3">Continent</th>
                          <th className="py-3 px-3">Education</th>
                          <th className="py-3 px-3">Experience</th>
                          <th className="py-3 px-3">Wage ($/yr)</th>
                          <th className="py-3 px-3">Region</th>
                          <th className="py-3 px-3">Predicted Status</th>
                          <th className="py-3 px-3">Probability</th>
                          <th className="py-3 px-3">Confidence Tier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredBatch.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-3 px-3 font-medium">{item.continent}</td>
                            <td className="py-3 px-3">{item.education_of_employee}</td>
                            <td className="py-3 px-3">{item.has_job_experience === "Y" ? "Yes" : "No"}</td>
                            <td className="py-3 px-3 font-semibold">${Number(item.prevailing_wage).toLocaleString()}</td>
                            <td className="py-3 px-3">{item.region_of_employment}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                  item.Predicted_Status === "Certified"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {item.Predicted_Status}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold">{item["Approval_Probability_%"]}%</td>
                            <td className="py-3 px-3 font-medium text-amber-400">{item.Confidence_Tier} ({item.Tier_Accuracy})</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-bold">No Batch Data Evaluated</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Click &quot;Load &amp; Evaluate Batch&quot; above to simulate an enterprise immigration workload of applicant records with instant classification.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DATASET ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Top KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Historical Petitions</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black mt-2">25,480</div>
                <span className="text-xs text-emerald-400 mt-1 block">100% Data Integrity</span>
              </div>

              <div className="glass-panel p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Overall Certified Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-2">66.79%</div>
                <span className="text-xs text-slate-400 mt-1 block">17,019 Approved Cases</span>
              </div>

              <div className="glass-panel p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Overall Denial Rate</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400 mt-2">33.21%</div>
                <span className="text-xs text-slate-400 mt-1 block">8,461 Denied Cases</span>
              </div>

              <div className="glass-panel p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Median Certified Wage</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 mt-2">$70,308</div>
                <span className="text-xs text-slate-400 mt-1 block">Annual Equivalent Baseline</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Education vs Approval */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-base font-bold mb-4 flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>Approval Rate by Education Level (%)</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eduChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#f8fafc" }}
                        formatter={(val: any) => [`${val}%`, "Approval Rate"]}
                      />
                      <Bar dataKey="rate" fill="#6366f1" radius={[6, 6, 0, 0]}>
                        {eduChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : index === 1 ? "#6366f1" : index === 2 ? "#8b5cf6" : "#f43f5e"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Doctorate and Master&apos;s degree holders show an overwhelming approval advantage (&gt;78%).
                </p>
              </div>

              {/* Continent vs Approval */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-base font-bold mb-4 flex items-center space-x-2">
                  <Globe2 className="w-5 h-5 text-indigo-400" />
                  <span>Approval Rate by Continent of Origin (%)</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={continentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#f8fafc" }}
                        formatter={(val: any) => [`${val}%`, "Approval Rate"]}
                      />
                      <Bar dataKey="rate" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Europe and Asia represent the largest applicant cohorts with steady high approval trends.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MODEL BENCHMARKS */}
        {activeTab === "models" && (
          <div className="space-y-8">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <span>Machine Learning Model Leaderboard</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Multi-model benchmark evaluated on stratified holdout test split</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Champion: Stacking Meta-Ensemble
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase border-b">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Architecture</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Precision</th>
                      <th className="py-3 px-4">Recall</th>
                      <th className="py-3 px-4">F1-Score</th>
                      <th className="py-3 px-4">High-Confidence Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="bg-indigo-950/20 font-semibold border-l-4 border-l-indigo-500">
                      <td className="py-3.5 px-4 text-amber-400 font-bold">🏆 1</td>
                      <td className="py-3.5 px-4 font-bold">Stacking Meta-Ensemble (CatBoost + XGBoost + RF + Meta-LR)</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">74.14%</td>
                      <td className="py-3.5 px-4">77.09%</td>
                      <td className="py-3.5 px-4 text-indigo-400">87.19%</td>
                      <td className="py-3.5 px-4 text-emerald-400">81.83%</td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">97.42% (Tier 1)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">2</td>
                      <td className="py-3 px-4">CatBoost Classifier (Gradient Boosted Decision Trees)</td>
                      <td className="py-3 px-4">74.08%</td>
                      <td className="py-3 px-4">77.04%</td>
                      <td className="py-3 px-4">87.16%</td>
                      <td className="py-3 px-4">81.79%</td>
                      <td className="py-3 px-4 text-slate-400">96.80%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">3</td>
                      <td className="py-3 px-4">Soft Voting Ensemble (Weighted Probability Averaging)</td>
                      <td className="py-3 px-4">74.04%</td>
                      <td className="py-3 px-4">77.10%</td>
                      <td className="py-3 px-4">86.96%</td>
                      <td className="py-3 px-4">81.73%</td>
                      <td className="py-3 px-4 text-slate-400">96.50%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">4</td>
                      <td className="py-3 px-4">XGBoost Classifier (Extreme Gradient Boosting)</td>
                      <td className="py-3 px-4">73.84%</td>
                      <td className="py-3 px-4">76.97%</td>
                      <td className="py-3 px-4">86.81%</td>
                      <td className="py-3 px-4">81.60%</td>
                      <td className="py-3 px-4 text-slate-400">95.90%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">5</td>
                      <td className="py-3 px-4">Gradient Boosting Classifier</td>
                      <td className="py-3 px-4">73.59%</td>
                      <td className="py-3 px-4">76.70%</td>
                      <td className="py-3 px-4">86.84%</td>
                      <td className="py-3 px-4">81.45%</td>
                      <td className="py-3 px-4 text-slate-400">95.20%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">6</td>
                      <td className="py-3 px-4">Random Forest Classifier (Bagging Ensemble)</td>
                      <td className="py-3 px-4">73.23%</td>
                      <td className="py-3 px-4">76.47%</td>
                      <td className="py-3 px-4">86.57%</td>
                      <td className="py-3 px-4">81.21%</td>
                      <td className="py-3 px-4 text-slate-400">94.80%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PIPELINE OPERATIONS */}
        {activeTab === "pipeline" && (
          <div className="space-y-8">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center space-x-2">
                    <Workflow className="w-5 h-5 text-indigo-400" />
                    <span>Modular Training Pipeline Orchestration</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">End-to-end automated machine learning pipeline architecture</p>
                </div>

                <button
                  onClick={handleTriggerTraining}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retrain Model Pipeline</span>
                </button>
              </div>

              {trainingStatus && (
                <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-400">
                  {trainingStatus}
                </div>
              )}

              {/* Pipeline Flow Steps */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-6">
                <div className="glass-card p-4 rounded-xl border-l-4 border-l-indigo-500">
                  <span className="text-[10px] font-bold uppercase text-indigo-400">Step 1</span>
                  <h4 className="text-sm font-bold mt-1">Data Ingestion</h4>
                  <p className="text-[11px] text-slate-400 mt-1">MongoDB / CSV to feature store & 80/20 train-test split</p>
                </div>

                <div className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
                  <span className="text-[10px] font-bold uppercase text-blue-400">Step 2</span>
                  <h4 className="text-sm font-bold mt-1">Data Validation</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Schema check & Kolmogorov-Smirnov drift test</p>
                </div>

                <div className="glass-card p-4 rounded-xl border-l-4 border-l-purple-500">
                  <span className="text-[10px] font-bold uppercase text-purple-400">Step 3</span>
                  <h4 className="text-sm font-bold mt-1">Transformation</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Feature crossings, ColumnTransformer, KMeans</p>
                </div>

                <div className="glass-card p-4 rounded-xl border-l-4 border-l-pink-500">
                  <span className="text-[10px] font-bold uppercase text-pink-400">Step 4</span>
                  <h4 className="text-sm font-bold mt-1">Model Trainer</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Stacking Meta-Ensemble & threshold optimization</p>
                </div>

                <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
                  <span className="text-[10px] font-bold uppercase text-amber-400">Step 5</span>
                  <h4 className="text-sm font-bold mt-1">Model Evaluation</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Benchmarking against production accuracy</p>
                </div>

                <div className="glass-card p-4 rounded-xl border-l-4 border-l-emerald-500">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Step 6</span>
                  <h4 className="text-sm font-bold mt-1">Model Pusher</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Exports champion model & preprocessor to models/</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
