import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const EncryptionModal = ({ 
  isOpen, 
  onClose, 
  onEncrypt, 
  onDecrypt, 
  note, 
  mode = 'encrypt' // 'encrypt' or 'decrypt'
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (mode === 'encrypt') {
        // Validation for encryption
        if (!password.trim()) {
          setError('Password is required');
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const success = await onEncrypt(note.id, password);
        if (success) {
          onClose();
          setPassword('');
          setConfirmPassword('');
        } else {
          setError('Failed to encrypt note. Please try again.');
        }
      } else {
        // Decryption
        if (!password.trim()) {
          setError('Password is required');
          return;
        }

        const success = await onDecrypt(note.id, password);
        if (success) {
          onClose();
          setPassword('');
        } else {
          setError('Incorrect password. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-700 rounded-xl">
              {mode === 'encrypt' ? (
                <Lock className="text-white" size={20} />
              ) : (
                <Unlock className="text-white" size={20} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'encrypt' ? 'Encrypt Note' : 'Decrypt Note'}
              </h2>
              <p className="font-medium text-gray-400 mt-1">
                {mode === 'encrypt' 
                  ? 'Protect your note with a password'
                  : 'Enter password to view this note'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Note Info */}
          <div className="mb-6 p-4 bg-gray-700 rounded-xl border border-gray-600">
            <p className="font-bold text-white text-sm">Note:</p>
            <p className="font-medium text-gray-300 truncate">{note?.title || 'Untitled Note'}</p>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block font-bold text-white mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 pr-12 font-medium text-white placeholder:text-gray-400"
                placeholder={mode === 'encrypt' ? 'Create a strong password' : 'Enter password'}
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for encryption) */}
          {mode === 'encrypt' && (
            <div className="mb-6">
              <label className="block font-bold text-white mb-3">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 font-medium text-white placeholder:text-gray-400"
                placeholder="Confirm your password"
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
              <p className="font-medium text-red-400">{error}</p>
            </div>
          )}

          {/* Security Notice */}
          {mode === 'encrypt' && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-yellow-100">
                  <p className="font-bold mb-2">Important:</p>
                  <ul className="space-y-1 font-medium text-sm">
                    <li>• Make sure to remember your password</li>
                    <li>• Passwords cannot be recovered if forgotten</li>
                    <li>• Use a strong, unique password</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors font-bold rounded-xl border border-gray-600"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-6 py-3 text-gray-900 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {mode === 'encrypt' ? (
                    <>
                      <Lock size={16} />
                      Encrypt Note
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      Decrypt & View
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EncryptionModal;
