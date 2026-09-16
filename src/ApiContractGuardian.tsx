import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Copy,
  FileCheck,
  Layers,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Wand2,
} from 'lucide-react'
import {
  api,
  userFacingError,
  type ApiContract,
  type ContractField,
  type ContractFieldType,
  type ContractValidationResult,
  type Monitor,
} from './api'
import './ApiContractGuardian.css'

interface ApiContractGuardianProps {
  monitor: Monitor
  onContractUpdated?: () => void
}

const FIELD_TYPES: ContractFieldType[] = ['string', 'number', 'boolean', 'object', 'array', 'null', 'any']

export function ApiContractGuardian({ monitor, onContractUpdated }: ApiContractGuardianProps) {
  const [contract, setContract] = useState<ApiContract | null>(null)
  const [validation, setValidation] = useState<ContractValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [inferring, setInferring] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'fields' | 'breaking' | 'schema'>('fields')

  // New field state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPath, setNewPath] = useState('')
  const [newType, setNewType] = useState<ContractFieldType>('string')
  const [newRequired, setNewRequired] = useState(true)
  const [newNullable, setNewNullable] = useState(false)
  const [newDescription, setNewDescription] = useState('')

  // Load contract
  const loadContract = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<ApiContract>(`/monitors/${monitor.id}/contract`)
      setContract(data)
      // Auto run validation on load if enabled
      if (data.contract_fields.length > 0) {
        void runValidation()
      }
    } catch (err) {
      setError(userFacingError(err, 'Failed to fetch API contract schema.'))
    } finally {
      setLoading(false)
    }
  }

  // Run validation
  const runValidation = async () => {
    setValidating(true)
    try {
      const res = await api<ContractValidationResult>(`/monitors/${monitor.id}/contract/validate`, {
        method: 'POST',
      })
      setValidation(res)
    } catch (err) {
      console.error('Validation check error:', err)
    } finally {
      setValidating(false)
    }
  }

  // Infer contract from latest payload
  const handleInferContract = async () => {
    setInferring(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await api<{ contract: ApiContract; inferred_field_count: number }>(
        `/monitors/${monitor.id}/contract/infer`,
        { method: 'POST' }
      )
      setContract(res.contract)
      setSuccessMsg(`Auto-inferred ${res.inferred_field_count} contract schema fields from live response!`)
      void runValidation()
      onContractUpdated?.()
    } catch (err) {
      setError(userFacingError(err, 'Could not infer schema from response.'))
    } finally {
      setInferring(false)
    }
  }

  // Save contract changes
  const saveContract = async (updated: ApiContract) => {
    setSaving(true)
    setError(null)
    try {
      const res = await api<ApiContract>(`/monitors/${monitor.id}/contract`, {
        method: 'PATCH',
        body: JSON.stringify(updated),
      })
      setContract(res)
      setSuccessMsg('Contract schema saved successfully.')
      void runValidation()
      onContractUpdated?.()
    } catch (err) {
      setError(userFacingError(err, 'Failed to update contract.'))
    } finally {
      setSaving(false)
    }
  }

  const toggleContractEnabled = () => {
    if (!contract) return
    const updated = { ...contract, enabled: !contract.enabled }
    setContract(updated)
    void saveContract(updated)
  }

  const toggleStrictMode = () => {
    if (!contract) return
    const updated = { ...contract, strict_mode: !contract.strict_mode }
    setContract(updated)
    void saveContract(updated)
  }

  const handleUpdateField = (index: number, fieldUpdates: Partial<ContractField>) => {
    if (!contract) return
    const newFields = [...contract.contract_fields]
    newFields[index] = { ...newFields[index], ...fieldUpdates }
    const updated = { ...contract, contract_fields: newFields }
    setContract(updated)
    void saveContract(updated)
  }

  const handleDeleteField = (index: number) => {
    if (!contract) return
    const newFields = contract.contract_fields.filter((_, i) => i !== index)
    const updated = { ...contract, contract_fields: newFields }
    setContract(updated)
    void saveContract(updated)
  }

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !newPath.trim()) return
    const field: ContractField = {
      path: newPath.trim(),
      expected_type: newType,
      required: newRequired,
      nullable: newNullable,
      description: newDescription.trim() || undefined,
    }
    const updated = {
      ...contract,
      contract_fields: [...contract.contract_fields, field],
    }
    setContract(updated)
    void saveContract(updated)
    setNewPath('')
    setNewDescription('')
    setShowAddModal(false)
  }

  useEffect(() => {
    void loadContract()
  }, [monitor.id])

  if (loading && !contract) {
    return (
      <div className="contract-loading">
        <RefreshCw size={24} className="spin" />
        <p>Loading API contract guardian...</p>
      </div>
    )
  }

  const complianceRate = validation ? validation.compliance_rate : 100
  const driftScore = validation ? validation.drift_score : 0
  const breakingChangesCount = validation ? validation.breaking_changes.length : 0

  return (
    <div className="contract-guardian-container">
      {/* Top Controller Bar */}
      <div className="contract-header-banner">
        <div className="contract-title-area">
          <div className={`contract-icon-box ${contract?.enabled ? 'active' : ''}`}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="contract-title-row">
              <h3>API Contract & Schema Drift Guardian</h3>
              <span className={`contract-status-pill ${contract?.enabled ? 'enabled' : 'disabled'}`}>
                {contract?.enabled ? 'Guardian Active' : 'Guardian Paused'}
              </span>
              {contract?.strict_mode && (
                <span className="contract-strict-pill">Strict Mode</span>
              )}
            </div>
            <p>Monitors payload contracts, catches field dropouts, and prevents silent API breaking changes.</p>
          </div>
        </div>

        <div className="contract-actions-row">
          <button
            type="button"
            className="secondary-btn"
            onClick={handleInferContract}
            disabled={inferring}
            title="Auto-detect fields and types from recent 200 OK responses"
          >
            <Wand2 size={14} className={inferring ? 'spin' : ''} />
            {inferring ? 'Inferring Schema...' : '1-Click Infer Schema'}
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={runValidation}
            disabled={validating}
          >
            <RefreshCw size={14} className={validating ? 'spin' : ''} />
            {validating ? 'Auditing Drift...' : 'Validate Live Payload'}
          </button>
        </div>
      </div>

      {error && (
        <div className="contract-error-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="contract-success-alert">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)}>Dismiss</button>
        </div>
      )}

      {/* Metrics & Health Gauges */}
      <div className="contract-metrics-row">
        <div className="contract-metric-tile">
          <span className="tile-label">Contract Compliance</span>
          <div className="tile-gauge">
            <strong className={`tile-val ${complianceRate >= 95 ? 'text-success' : complianceRate >= 80 ? 'text-warn' : 'text-danger'}`}>
              {complianceRate}%
            </strong>
            <div className="gauge-bar">
              <div
                className={`gauge-fill ${complianceRate >= 95 ? 'success' : complianceRate >= 80 ? 'warn' : 'danger'}`}
                style={{ width: `${complianceRate}%` }}
              />
            </div>
          </div>
          <span className="tile-sub">
            {validation?.matched_fields ?? contract?.contract_fields.length} / {contract?.contract_fields.length || 0} fields verified
          </span>
        </div>

        <div className="contract-metric-tile">
          <span className="tile-label">Schema Drift Score</span>
          <strong className={`tile-val ${driftScore === 0 ? 'text-success' : driftScore < 40 ? 'text-warn' : 'text-danger'}`}>
            {driftScore}% {driftScore === 0 ? '· No Drift' : '· Drift Detected'}
          </strong>
          <span className="tile-sub">Lower is better (0% is ideal baseline)</span>
        </div>

        <div className="contract-metric-tile">
          <span className="tile-label">Breaking Changes</span>
          <strong className={`tile-val ${breakingChangesCount === 0 ? 'text-success' : 'text-danger'}`}>
            {breakingChangesCount} Issue{breakingChangesCount === 1 ? '' : 's'}
          </strong>
          <span className="tile-sub">
            {breakingChangesCount === 0 ? 'Zero breaking mutations detected' : 'Requires engineering remediation'}
          </span>
        </div>

        <div className="contract-metric-tile controls-tile">
          <span className="tile-label">Guardian Rules</span>
          <div className="guardian-toggles">
            <label className="toggle-label" onClick={toggleContractEnabled}>
              {contract?.enabled ? <ToggleRight size={22} className="toggle-on" /> : <ToggleLeft size={22} className="toggle-off" />}
              <span>Enforce Guardian</span>
            </label>
            <label className="toggle-label" onClick={toggleStrictMode}>
              {contract?.strict_mode ? <ToggleRight size={22} className="toggle-on" /> : <ToggleLeft size={22} className="toggle-off" />}
              <span>Strict Mode (Disallow Extra Keys)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Breaking Changes Alert Banner if any */}
      {validation && validation.breaking_changes.length > 0 && (
        <div className="contract-drift-banner">
          <div className="drift-banner-header">
            <ShieldAlert size={20} className="drift-alert-icon" />
            <div>
              <h4>Critical Schema Drift Detected</h4>
              <p>The response payload from <code>{monitor.url}</code> deviates from your defined contract.</p>
            </div>
          </div>
          <div className="drift-issues-list">
            {validation.breaking_changes.map((change, idx) => (
              <div key={idx} className={`drift-issue-item ${change.severity}`}>
                <span className={`issue-tag ${change.severity}`}>{change.issue.toUpperCase()}</span>
                <code className="issue-path">{change.path}</code>
                <span className="issue-msg">{change.message}</span>
                {change.sample_received && (
                  <span className="issue-sample">Received: <code>{change.sample_received}</code></span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additions banner if any in strict mode */}
      {validation && validation.additions.length > 0 && (
        <div className="contract-additions-banner">
          <div className="additions-header">
            <Layers size={18} />
            <span>{validation.additions.length} New Undeclared Field(s) Detected in Payload</span>
          </div>
          <div className="additions-pills">
            {validation.additions.map((add, idx) => (
              <span key={idx} className="addition-pill">
                <code>{add.path}</code> ({add.actual_type})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="contract-tabs-nav">
        <div className="nav-buttons">
          <button
            type="button"
            className={viewMode === 'fields' ? 'active' : ''}
            onClick={() => setViewMode('fields')}
          >
            <FileCheck size={14} /> Contract Fields ({contract?.contract_fields.length || 0})
          </button>
          <button
            type="button"
            className={viewMode === 'breaking' ? 'active' : ''}
            onClick={() => setViewMode('breaking')}
          >
            <AlertTriangle size={14} /> Breaking Changes ({breakingChangesCount})
          </button>
          <button
            type="button"
            className={viewMode === 'schema' ? 'active' : ''}
            onClick={() => setViewMode('schema')}
          >
            <Code2 size={14} /> JSON Schema Export
          </button>
        </div>

        <button
          type="button"
          className="secondary-btn add-prop-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={14} /> Add Contract Property
        </button>
      </div>

      {/* TAB 1: CONTRACT FIELDS TABLE */}
      {viewMode === 'fields' && (
        <div className="contract-fields-card">
          {(!contract?.contract_fields || contract.contract_fields.length === 0) ? (
            <div className="contract-empty-state">
              <Shield size={36} />
              <h4>No Contract Fields Configured Yet</h4>
              <p>You can click "1-Click Infer Schema" to automatically generate a contract from this monitor's responses, or manually add properties.</p>
              <div className="empty-actions">
                <button type="button" className="primary-btn" onClick={handleInferContract} disabled={inferring}>
                  <Wand2 size={14} /> 1-Click Infer from Response
                </button>
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(true)}>
                  <Plus size={14} /> Manually Define Field
                </button>
              </div>
            </div>
          ) : (
            <table className="contract-table">
              <thead>
                <tr>
                  <th>Property Path</th>
                  <th>Expected Type</th>
                  <th>Required</th>
                  <th>Nullable</th>
                  <th>Sample Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contract.contract_fields.map((field, index) => (
                  <tr key={index}>
                    <td>
                      <code className="prop-path">{field.path}</code>
                      {field.description && <small className="prop-desc">{field.description}</small>}
                    </td>
                    <td>
                      <select
                        className="prop-type-select"
                        value={field.expected_type}
                        onChange={(e) => handleUpdateField(index, { expected_type: e.target.value as ContractFieldType })}
                      >
                        {FIELD_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={field.nullable}
                        onChange={(e) => handleUpdateField(index, { nullable: e.target.checked })}
                      />
                    </td>
                    <td>
                      <code className="prop-sample">{field.sample_value || '—'}</code>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="delete-field-btn"
                        onClick={() => handleDeleteField(index)}
                        title="Remove field from contract"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: BREAKING CHANGES */}
      {viewMode === 'breaking' && (
        <div className="contract-breaking-view">
          {breakingChangesCount === 0 ? (
            <div className="contract-empty-state">
              <CheckCircle2 size={36} className="text-success" />
              <h4>Zero Breaking Contract Changes</h4>
              <p>All expected schema properties and types are compliant with the live payload from <code>{monitor.url}</code>.</p>
            </div>
          ) : (
            <div className="breaking-cards-list">
              {validation?.breaking_changes.map((item, idx) => (
                <div key={idx} className="breaking-card">
                  <div className="breaking-card-header">
                    <span className={`issue-tag ${item.severity}`}>{item.issue}</span>
                    <code className="breaking-path">{item.path}</code>
                  </div>
                  <p className="breaking-detail">{item.message}</p>
                  <div className="breaking-diff-box">
                    <div>
                      <small>Expected in Contract</small>
                      <span className="diff-expected">{item.expected_type}</span>
                    </div>
                    <ArrowRight size={16} />
                    <div>
                      <small>Actual in Live Response</small>
                      <span className="diff-actual">{item.actual_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: JSON SCHEMA EXPORT */}
      {viewMode === 'schema' && (
        <div className="contract-schema-view">
          <div className="schema-view-header">
            <div>
              <h4>Standard JSON Schema Definition</h4>
              <p>Compatible with OpenAPI 3.1, JSON Schema Draft 2020-12, and CI/CD pipelines.</p>
            </div>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                const schemaObj = {
                  $schema: "http://json-schema.org/draft-07/schema#",
                  title: `${monitor.name} Contract`,
                  type: "object",
                  properties: contract?.contract_fields.reduce((acc, f) => {
                    acc[f.path] = {
                      type: f.expected_type === 'any' ? undefined : f.expected_type,
                      description: f.description
                    }
                    return acc
                  }, {} as Record<string, unknown>),
                  required: contract?.contract_fields.filter(f => f.required).map(f => f.path)
                }
                navigator.clipboard.writeText(JSON.stringify(schemaObj, null, 2))
                setSuccessMsg("Copied JSON Schema to clipboard!")
              }}
            >
              <Copy size={13} /> Copy JSON Schema
            </button>
          </div>
          <pre className="schema-json-code">
            {JSON.stringify({
              $schema: "http://json-schema.org/draft-07/schema#",
              title: `${monitor.name} Contract`,
              type: "object",
              properties: contract?.contract_fields.reduce((acc, f) => {
                acc[f.path] = {
                  type: f.expected_type,
                  description: f.description,
                  nullable: f.nullable
                }
                return acc
              }, {} as Record<string, unknown>),
              required: contract?.contract_fields.filter(f => f.required).map(f => f.path)
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* MODAL: ADD CONTRACT PROPERTY */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Contract Schema Property</h3>
              <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddField} className="modal-form">
              <div className="form-group">
                <label>Property Path</label>
                <input
                  type="text"
                  placeholder="e.g. data.user.id or items[].name"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  required
                />
                <small>Use dot notation for nested objects or <code>[]</code> for array elements.</small>
              </div>

              <div className="form-group">
                <label>Expected Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ContractFieldType)}
                >
                  {FIELD_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newRequired}
                    onChange={(e) => setNewRequired(e.target.checked)}
                  />
                  <span>Mandatory (Required in every payload)</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newNullable}
                    onChange={(e) => setNewNullable(e.target.checked)}
                  />
                  <span>Allow Null Values</span>
                </label>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Unique identifier for account"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Add to Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
