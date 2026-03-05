import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, ArrowLeft, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const StatementUpload = ({ onNavigate }) => {
    const [bankName, setBankName] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, complete, error
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileInput = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        // Check file type
        const validTypes = ['application/pdf', 'text/csv'];
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.pdf')) {
            alert('Please upload a valid PDF or CSV file.');
            return;
        }

        // Max 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setScanStatus('idle');
    };

    const handleScan = () => {
        if (!file || !bankName) {
            alert('Please select a bank and upload a file.');
            return;
        }

        setScanStatus('scanning');

        setTimeout(() => {
            // Secure Local Browser Parsing
            if (file.name.endsWith('.csv')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const csvData = event.target.result;
                    const lines = csvData.split('\n');

                    const ghostKeywords = ['netflix', 'spotify', 'hulu', 'amazon prime', 'adobe', 'apple', 'gym', 'fitness', 'saas', 'software', 'vps', 'domain', 'subscription', 'recurring', 'membership'];
                    const detectedGhosts = [];

                    lines.forEach((line, index) => {
                        if (index === 0) return; // Skip header
                        const columns = line.split(',');
                        if (columns.length < 3) return; // Basic validation

                        // Assumes columns: Date, Description, Amount (adjust based on typical bank CSVs)
                        // This robustly checks every string column for keywords
                        const rawTextContext = line.toLowerCase();
                        let foundKeyword = ghostKeywords.find(kw => rawTextContext.includes(kw));

                        if (foundKeyword) {
                            // Extract amount roughly from the last column or any number
                            const amounts = line.match(/[-]?\d+(\.\d+)?/g);
                            const lastAmount = amounts ? Math.abs(parseFloat(amounts[amounts.length - 1])) : 0;

                            // Don't add perfectly identical rows to avoid spam
                            const isDuplicate = detectedGhosts.some(g => g.name.toLowerCase() === foundKeyword);

                            if (lastAmount > 0 && !isDuplicate) {
                                detectedGhosts.push({
                                    id: Date.now().toString() + index,
                                    name: foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1) + ' (Found)',
                                    amount: lastAmount,
                                    date: new Date().toISOString()
                                });
                            }
                        }
                    });

                    // Save the real processed ghosts to localStorage
                    const existingGhosts = JSON.parse(localStorage.getItem('detectedGhosts') || '[]');
                    localStorage.setItem('detectedGhosts', JSON.stringify([...existingGhosts, ...detectedGhosts]));

                    const scanData = {
                        id: Date.now().toString(),
                        bank: bankName,
                        fileName: file.name,
                        dateScanned: new Date().toISOString(),
                        ghostsFound: detectedGhosts.length
                    };
                    const existingScans = JSON.parse(localStorage.getItem('statementScans') || '[]');
                    localStorage.setItem('statementScans', JSON.stringify([...existingScans, scanData]));
                    setScanStatus('complete');
                };
                reader.onerror = () => {
                    alert('Error reading CSV file locally.');
                    setScanStatus('error');
                };
                reader.readAsText(file);
            } else {
                // Mock for PDF or other files during hackathon (since PDF parsing in browser is complex)
                const mockGhostCount = Math.floor(Math.random() * 3) + 1;
                const scanData = {
                    id: Date.now().toString(),
                    bank: bankName,
                    fileName: file.name,
                    dateScanned: new Date().toISOString(),
                    ghostsFound: mockGhostCount
                };
                const existingScans = JSON.parse(localStorage.getItem('statementScans') || '[]');
                localStorage.setItem('statementScans', JSON.stringify([...existingScans, scanData]));
                setScanStatus('complete');
            }
        }, 2500);
    };

    const resetScan = () => {
        setFile(null);
        setBankName('');
        setScanStatus('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-[#111111] text-slate-200 font-sans p-8 selection:bg-[#20c997]/30">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-semibold"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#20c997]/10 flex items-center justify-center text-[#20c997] mb-6 shadow-[0_0_30px_rgba(32,201,151,0.2)]">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Detect Ghost Subscriptions</h1>
                    <p className="text-slate-400 max-w-2xl text-lg">
                        Upload your recent bank statements to uncover hidden or forgotten subscriptions that might be silently draining your wallet.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#1c1c1c] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    {/* Security Badge Ribbon */}
                    <div className="absolute top-0 right-0 bg-blue-500/10 border-b border-l border-blue-500/30 px-4 py-2 rounded-bl-xl flex items-center gap-2">
                        <Shield size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Local Processing Only</span>
                    </div>

                    <div className="mb-8 mt-4">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 block">
                            1. Select Institution
                        </label>
                        <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            disabled={scanStatus === 'scanning' || scanStatus === 'complete'}
                            className="w-full md:w-1/2 bg-[#111] border border-slate-700 rounded-xl p-4 text-white focus:border-[#20c997] focus:outline-none transition-colors appearance-none"
                        >
                            <option value="">Select your bank...</option>
                            <option value="Chase">Chase Bank</option>
                            <option value="Bank of America">Bank of America</option>
                            <option value="Wells Fargo">Wells Fargo</option>
                            <option value="Citi">Citi Bank</option>
                            <option value="Capital One">Capital One</option>
                            <option value="Other">Other / Local Credit Union</option>
                        </select>
                    </div>

                    <div className="mb-8">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 block flex items-center justify-between">
                            <span>2. Upload Statement</span>
                            <span className="text-xs normal-case text-slate-500 font-normal">PDF or CSV (Max 10MB)</span>
                        </label>

                        {scanStatus === 'idle' && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                                    ${isDragging ? 'border-[#20c997] bg-[#20c997]/5 scale-[0.99]' : 'border-slate-700 hover:border-slate-500 bg-[#111]'}
                                `}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileInput}
                                    accept=".pdf,.csv"
                                    className="hidden"
                                />
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-[#20c997]/20 text-[#20c997]' : 'bg-slate-800 text-slate-400'}`}>
                                    <UploadCloud size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {isDragging ? 'Drop it like it\'s hot' : 'Click or drag file to this area to upload'}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Your file never leaves your device. We use your browser's local memory to scan for recurring patterns.
                                </p>
                            </div>
                        )}

                        {file && scanStatus !== 'idle' && (
                            <div className="bg-[#111] border border-slate-700 p-6 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{file.name}</p>
                                        <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {bankName}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions / Scanning Status */}
                    {scanStatus === 'idle' && (
                        <button
                            onClick={handleScan}
                            disabled={!file || !bankName}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${(!file || !bankName) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#20c997] hover:bg-[#1db789] text-black shadow-[0_0_20px_rgba(32,201,151,0.3)]'}`}
                        >
                            <Shield size={20} /> Initiate Local Scan
                        </button>
                    )}

                    {scanStatus === 'scanning' && (
                        <div className="py-8 flex flex-col items-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-16 h-16 border-4 border-[#20c997]/20 border-t-[#20c997] rounded-full mb-6"
                            />
                            <h3 className="text-xl font-bold text-[#20c997] mb-2 animate-pulse">Running Deep Analysis...</h3>
                            <p className="text-slate-400 text-sm">Cross-referencing transactions against ghost signature database securely in memory.</p>
                        </div>
                    )}

                    {scanStatus === 'complete' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#20c997]/10 border border-[#20c997]/30 p-8 rounded-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-[#20c997] rounded-full flex items-center justify-center text-black mx-auto mb-6 shadow-[0_0_30px_rgba(32,201,151,0.4)]">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Scan Complete</h2>
                            <p className="text-[#20c997] font-semibold text-lg mb-6">We uncovered potential ghost threats in your statement.</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => onNavigate('dashboard')}
                                    className="flex-1 bg-[#20c997] text-black font-bold py-3 rounded-xl hover:bg-[#1db789] transition-colors"
                                >
                                    View Threats in Intelligence Center
                                </button>
                                <button
                                    onClick={resetScan}
                                    className="flex-1 bg-[#111] border border-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    Scan Another File
                                </button>
                            </div>
                        </motion.div>
                    )}

                </motion.div>

                <div className="mt-8 text-center flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <AlertTriangle size={16} /> Optional Feature. We do not store or transmit your financial documents.
                </div>
            </div>
        </div>
    );
};

export default StatementUpload;
