#!/usr/bin/env ts-node
/**
 * Component Generator for Turnify B2B Return Portal
 *
 * Generates React components following project patterns
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComponentOptions {
  name: string;
  type: 'page' | 'modal' | 'widget' | 'form';
  withTests: boolean;
  functional: boolean;
}

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

/**
 * Print header
 */
function printHeader() {
  console.log('='.repeat(70));
  console.log('⚛️  React Component Generator - Turnify B2B Portal');
  console.log('='.repeat(70));
  console.log('');
}

/**
 * Generate page component template
 */
function generatePageComponent(name: string): string {
  return `'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { apiService } from '@/services/api';

interface ${name}Props {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  navigate?: (view: string) => void;
}

export const ${name}: React.FC<${name}Props> = ({ user, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Verify authentication
        const { valid } = await apiService.verifyToken();
        if (!valid) {
          window.location.href = '/login';
          return;
        }

        // Load component data here
        // const data = await apiService.getData();

        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {navigate && (
        <button
          onClick={() => navigate('landing')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">${name}</h1>
        <p className="text-gray-600 mt-2">Component description</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-blue-600 mr-3" />
          <p className="text-gray-700">Component content goes here</p>
        </div>
      </div>
    </div>
  );
};
`;
}

/**
 * Generate modal component template
 */
function generateModalComponent(name: string): string {
  return `'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ${name}Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export const ${name}: React.FC<${name}Props> = ({
  isOpen,
  onClose,
  title = 'Modal Title',
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children || (
            <p className="text-gray-600">Modal content goes here</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Handle confirm action
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
`;
}

/**
 * Generate widget component template
 */
function generateWidgetComponent(name: string): string {
  return `'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ${name}Props {
  title?: string;
  value?: string | number;
  change?: number;
  loading?: boolean;
}

export const ${name}: React.FC<${name}Props> = ({
  title = 'Widget Title',
  value = '0',
  change,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {change !== undefined && (
          <span className={\`text-xs font-medium \${change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
            <TrendingUp className={\`inline h-3 w-3 \${change < 0 ? 'rotate-180' : ''}\`} />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
};
`;
}

/**
 * Generate form component template
 */
function generateFormComponent(name: string): string {
  return `'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ${name}Props {
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export const ${name}: React.FC<${name}Props> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({ field1: '', field2: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <label htmlFor="field1" className="block text-sm font-medium text-gray-700 mb-2">
          Field 1
        </label>
        <input
          id="field1"
          type="text"
          value={formData.field1}
          onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="field2" className="block text-sm font-medium text-gray-700 mb-2">
          Field 2
        </label>
        <input
          id="field2"
          type="text"
          value={formData.field2}
          onChange={(e) => setFormData({ ...formData, field2: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};
`;
}

/**
 * Create component file
 */
function createComponent(options: ComponentOptions): void {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const componentPath = path.join(componentsDir, `${options.name}.tsx`);

  // Check if file already exists
  if (fs.existsSync(componentPath)) {
    console.log(`${COLORS.red}❌ Error: Component ${options.name} already exists${COLORS.reset}`);
    process.exit(1);
  }

  // Generate component code based on type
  let componentCode: string;
  switch (options.type) {
    case 'modal':
      componentCode = generateModalComponent(options.name);
      break;
    case 'widget':
      componentCode = generateWidgetComponent(options.name);
      break;
    case 'form':
      componentCode = generateFormComponent(options.name);
      break;
    case 'page':
    default:
      componentCode = generatePageComponent(options.name);
      break;
  }

  // Write component file
  fs.writeFileSync(componentPath, componentCode);

  console.log(`${COLORS.green}✅ Created: ${componentPath}${COLORS.reset}`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printHeader();
    console.log('Usage: ts-node create_component.ts --name <ComponentName> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --name <name>     Component name (required, PascalCase)');
    console.log('  --type <type>     Component type: page|modal|widget|form (default: page)');
    console.log('  --with-tests      Generate test file');
    console.log('');
    console.log('Examples:');
    console.log('  ts-node create_component.ts --name ReturnHistory');
    console.log('  ts-node create_component.ts --name ApprovalModal --type modal');
    console.log('');
    process.exit(0);
  }

  // Parse arguments
  const nameIndex = args.indexOf('--name');
  const typeIndex = args.indexOf('--type');

  if (nameIndex === -1) {
    console.log(`${COLORS.red}❌ Error: --name is required${COLORS.reset}`);
    process.exit(1);
  }

  const options: ComponentOptions = {
    name: args[nameIndex + 1],
    type: typeIndex !== -1 ? args[typeIndex + 1] as any : 'page',
    withTests: args.includes('--with-tests'),
    functional: !args.includes('--class'),
  };

  printHeader();
  console.log(`${COLORS.blue}Creating ${options.type} component: ${options.name}${COLORS.reset}`);
  console.log('');

  createComponent(options);

  console.log('');
  console.log(`${COLORS.green}✅ Component created successfully!${COLORS.reset}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Import in your code: import { ${options.name} } from '@/components/${options.name}';`);
  console.log(`  2. Use the component: <${options.name} />`);
  console.log('  3. Customize the component to your needs');
  console.log('');
}

main();
