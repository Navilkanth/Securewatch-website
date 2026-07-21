import { useCallback, useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, FileJson, FileSpreadsheet, CheckCircle, XCircle, Download, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { logsApi } from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^,]+)/g)?.map((v) => v.trim().replace(/^"|"$/g, '')) || [];
    const record = {};
    headers.forEach((h, idx) => {
      const key = h.charAt(0).toLowerCase() + h.slice(1).replace(/([A-Z])/g, (m) => m.toLowerCase());
      record[key === 'ipaddress' ? 'ipAddress' : key === 'resourcetype' ? 'resourceType' : key] = values[idx];
    });
    records.push(record);
  }
  return records;
}

export default function UploadLogs() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [failedRecords, setFailedRecords] = useState([]);

  const { data: uploadHistory } = useQuery({
    queryKey: ['uploadHistory'],
    queryFn: logsApi.getUploadHistory,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ records, filename, fileType }) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90));
      }, 200);
      try {
        const res = await logsApi.upload(records, filename, fileType);
        clearInterval(interval);
        setProgress(100);
        return res;
      } catch (err) {
        clearInterval(interval);
        throw err;
      }
    },
    onSuccess: (data) => {
      setResult(data);
      setFailedRecords(data.failedRecords || []);
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['uploadHistory'] });
      toast.success(`Uploaded ${data.successCount} records successfully`);
    },
    onError: (err) => {
      setProgress(0);
      toast.error(err.response?.data?.error || 'Upload failed');
    },
  });

  const processFile = useCallback((file) => {
    setResult(null);
    setProgress(0);
    setFailedRecords([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let records;
        let fileType;
        if (file.name.endsWith('.json')) {
          records = JSON.parse(e.target.result);
          if (!Array.isArray(records)) records = [records];
          fileType = 'JSON';
        } else if (file.name.endsWith('.csv')) {
          records = parseCSV(e.target.result);
          fileType = 'CSV';
        } else {
          toast.error('Unsupported file type. Use JSON or CSV.');
          return;
        }
        uploadMutation.mutate({ records, filename: file.name, fileType });
      } catch (err) {
        toast.error(`Parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }, [uploadMutation]);

  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const downloadFailed = () => {
    const blob = new Blob([JSON.stringify(failedRecords, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed-records.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 light:text-slate-900">Upload Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Bulk upload up to 10,000+ log records via JSON or CSV</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            className={`glass rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-slate-600 hover:border-primary-500/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
            />
            <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              {isDragActive ? 'Drop file here' : 'Drag & Drop your log file'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">Supports JSON and CSV formats</p>
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1 text-xs text-slate-400"><FileJson className="w-4 h-4" /> JSON</span>
              <span className="flex items-center gap-1 text-xs text-slate-400"><FileSpreadsheet className="w-4 h-4" /> CSV</span>
            </div>
          </motion.div>

          {/* Progress */}
          <AnimatePresence>
            {uploadMutation.isPending && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Uploading...</span>
                  <span className="text-primary-400 font-mono">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Upload Result</h3>
              <div className="grid grid-cols-3 gap-4">
                <ResultStat icon={Upload} label="Total Records" value={result.totalRecords} color="text-primary-400" />
                <ResultStat icon={CheckCircle} label="Success" value={result.successCount} color="text-green-400" />
                <ResultStat icon={XCircle} label="Failed" value={result.failureCount} color="text-red-400" />
              </div>
              {result.errors?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Validation Errors</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-xs text-red-400 font-mono">{err.message}</p>
                    ))}
                  </div>
                </div>
              )}
              {failedRecords.length > 0 && (
                <Button variant="outline" size="sm" className="mt-4" onClick={downloadFailed}>
                  <Download className="w-4 h-4" /> Download Failed Records
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Upload History */}
        <Card>
          <CardHeader title="Upload History" subtitle="Recent uploads" />
          <div className="space-y-3">
            {uploadHistory?.length ? uploadHistory.map((h) => (
              <div key={h._id} className="p-3 rounded-lg bg-slate-800/30 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <History className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300 truncate">{h.filename}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{format(new Date(h.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  <span className="text-green-400">{h.successCount} ok</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">No upload history</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResultStat({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center p-3 rounded-lg bg-slate-800/30">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <p className="text-2xl font-bold text-slate-100">{value?.toLocaleString()}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
