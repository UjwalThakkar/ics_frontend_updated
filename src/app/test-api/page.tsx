'use client'

import { useState } from 'react'
import { phpAPI } from '@/lib/php-api-client'

export default function TestAPI() {
  const [result, setResult] = useState<string>('')

  const testConnection = async () => {
    setResult('Testing...')
    try {
      const response = await phpAPI.getServices()
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      <button 
        onClick={testConnection}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test PHP API Connection
      </button>
      <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
        {result || 'Click button to test'}
      </pre>
    </div>
  )
}