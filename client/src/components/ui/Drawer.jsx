import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Drawer({ open, onClose, title, children, width = 'max-w-xl' }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 h-full w-full z-50 bg-navy-900 border-l border-slate-700/50 shadow-2xl overflow-y-auto',
              'light:bg-white light:border-slate-200',
              width
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-navy-900/95 backdrop-blur light:bg-white/95 light:border-slate-200">
              <h2 className="text-lg font-semibold text-slate-100 light:text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
