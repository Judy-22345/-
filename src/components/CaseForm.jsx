import React from 'react'
import { caseStatuses, caseTypes, courtLevels, preservationTypes, fulfillmentStatuses } from '../data/constants'
import FileUpload from './FileUpload'

export default function CaseForm({ caseData, onSave, onCancel }) {
  const [formData, setFormData] = React.useState(caseData || {
    caseNumber: '',
    caseCause: '',
    court: '',
    caseType: 'civil',
    status: 'pending',
    filingDate: '',
    acceptanceDate: '',
    trialDate: '',
    plaintiff: '',
    defendant: '',
    agent: '',
    disputeAmount: '',
    supportedAmount: '',
    progress: '',
    judgmentResult: '',
    fulfillmentStatus: 'not_due',
    fulfillmentNote: '',
    judgeName: '',
    judgePhone: '',
    preservationType: 'none',
    preservationNote: '',
    costAmount: '',
    costNote: '',
    remarks: '',
    timeline: [],
    files: {
      party: [],
      court: [],
      opponent: []
    }
  })

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleFilesChange(category, files) {
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [category]: files
      }
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...formData,
      id: caseData?.id || Date.now().toString(),
      disputeAmount: parseFloat(formData.disputeAmount) || 0,
      supportedAmount: parseFloat(formData.supportedAmount) || 0,
      costAmount: parseFloat(formData.costAmount) || 0,
      createdAt: caseData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: formData.files
    })
  }

  const inputClass = "input"

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label form-label-required">案号</label>
          <input
            className={inputClass}
            value={formData.caseNumber}
            onChange={(e) => handleChange('caseNumber', e.target.value)}
            placeholder="例：(2024) 京 01 民初 12345 号"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">案由</label>
          <input
            className={inputClass}
            value={formData.caseCause}
            onChange={(e) => handleChange('caseCause', e.target.value)}
            placeholder="例：买卖合同纠纷"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">案件类型</label>
          <select
            className={inputClass}
            value={formData.caseType}
            onChange={(e) => handleChange('caseType', e.target.value)}
          >
            {caseTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">案件状态</label>
          <select
            className={inputClass}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {caseStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">管辖法院/仲裁机构</label>
          <input
            className={inputClass}
            value={formData.court}
            onChange={(e) => handleChange('court', e.target.value)}
            placeholder="例：北京市朝阳区人民法院"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">原告/申请人</label>
          <input
            className={inputClass}
            value={formData.plaintiff}
            onChange={(e) => handleChange('plaintiff', e.target.value)}
            placeholder=""
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">被告/被申请人</label>
          <input
            className={inputClass}
            value={formData.defendant}
            onChange={(e) => handleChange('defendant', e.target.value)}
            placeholder=""
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">代理人</label>
          <input
            className={inputClass}
            value={formData.agent}
            onChange={(e) => handleChange('agent', e.target.value)}
            placeholder="例：张三律师"
          />
        </div>

        <div className="form-group">
          <label className="form-label">法官/仲裁员姓名</label>
          <input
            className={inputClass}
            value={formData.judgeName}
            onChange={(e) => handleChange('judgeName', e.target.value)}
            placeholder=""
          />
        </div>

        <div className="form-group">
          <label className="form-label">法官/仲裁员联系方式</label>
          <input
            className={inputClass}
            value={formData.judgePhone}
            onChange={(e) => handleChange('judgePhone', e.target.value)}
            placeholder=""
          />
        </div>

        <div className="form-group">
          <label className="form-label">收案/立案日期</label>
          <input
            type="date"
            className={inputClass}
            value={formData.acceptanceDate}
            onChange={(e) => handleChange('acceptanceDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">开庭时间</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={formData.trialDate}
            onChange={(e) => handleChange('trialDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">涉诉金额（元）</label>
          <input
            type="number"
            className={inputClass}
            value={formData.disputeAmount}
            onChange={(e) => handleChange('disputeAmount', e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">裁决支持金额（元）</label>
          <input
            type="number"
            className={inputClass}
            value={formData.supportedAmount}
            onChange={(e) => handleChange('supportedAmount', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">保全类型</label>
          <select
            className={inputClass}
            value={formData.preservationType}
            onChange={(e) => handleChange('preservationType', e.target.value)}
          >
            {preservationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">履行状态</label>
          <select
            className={inputClass}
            value={formData.fulfillmentStatus}
            onChange={(e) => handleChange('fulfillmentStatus', e.target.value)}
          >
            {fulfillmentStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label className="form-label">诉讼/仲裁进展</label>
          <textarea
            className={`${inputClass} form-textarea`}
            value={formData.progress}
            onChange={(e) => handleChange('progress', e.target.value)}
            placeholder="描述案件当前的进展情况..."
            rows={3}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">裁决结果（含支持金额，元）</label>
          <textarea
            className={`${inputClass} form-textarea`}
            value={formData.judgmentResult}
            onChange={(e) => handleChange('judgmentResult', e.target.value)}
            placeholder="判决/调解/裁决的具体内容..."
            rows={3}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">保全情况</label>
          <textarea
            className={`${inputClass} form-textarea`}
            value={formData.preservationNote}
            onChange={(e) => handleChange('preservationNote', e.target.value)}
            placeholder="财产保全、证据保全等具体情况..."
            rows={2}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">履行情况说明</label>
          <textarea
            className={`${inputClass} form-textarea`}
            value={formData.fulfillmentNote}
            onChange={(e) => handleChange('fulfillmentNote', e.target.value)}
            placeholder="判决/调解内容的履行情况..."
            rows={2}
          />
        </div>

        <div className="form-group">
          <label className="form-label">成本费用（元）</label>
          <input
            type="number"
            className={inputClass}
            value={formData.costAmount}
            onChange={(e) => handleChange('costAmount', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">成本费用说明</label>
          <input
            className={inputClass}
            value={formData.costNote}
            onChange={(e) => handleChange('costNote', e.target.value)}
            placeholder="案件受理费、保全费、律师费等..."
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">备注</label>
          <textarea
            className={`${inputClass} form-textarea`}
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            placeholder="其他需要说明的事项..."
            rows={2}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">📎 附件文件</label>
          <div style={{ marginTop: '8px' }}>
            <FileUpload
              category="party"
              files={formData.files?.party || []}
              onFilesChange={handleFilesChange}
            />
            <FileUpload
              category="court"
              files={formData.files?.court || []}
              onFilesChange={handleFilesChange}
            />
            <FileUpload
              category="opponent"
              files={formData.files?.opponent || []}
              onFilesChange={handleFilesChange}
            />
          </div>
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button type="button" className="btn" onClick={onCancel}>取消</button>
        <button type="submit" className="btn btn-primary">保存案件</button>
      </div>
    </form>
  )
}
