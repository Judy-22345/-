import React from 'react'

export default function TimelineForm({ onSave, onCancel }) {
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    endTime: '',
    event: '',
    note: '',
    isAllDay: false
  })

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.event.trim()) return

    // 如果是全天事件，只保存日期
    const dateValue = formData.isAllDay
      ? formData.date.split('T')[0]
      : formData.date

    onSave({
      date: dateValue,
      event: formData.event,
      note: formData.note,
      endTime: formData.isAllDay ? null : formData.endTime,
      isAllDay: formData.isAllDay
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.isAllDay}
              onChange={(e) => handleChange('isAllDay', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            全天事件
          </label>
        </div>

        {!formData.isAllDay && (
          <>
            <div className="form-group">
              <label className="form-label form-label-required">开始时间</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">结束时间</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
              />
            </div>
          </>
        )}

        {formData.isAllDay && (
          <div className="form-group">
            <label className="form-label form-label-required">日期</label>
            <input
              type="date"
              className="input"
              value={formData.date.split('T')[0]}
              onChange={(e) => handleChange('date', `${e.target.value}T00:00`)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label form-label-required">事件</label>
          <input
            className="input"
            value={formData.event}
            onChange={(e) => handleChange('event', e.target.value)}
            placeholder="例：开庭审理"
            required
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">说明</label>
          <textarea
            className="input form-textarea"
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="事件详细说明..."
            rows={3}
          />
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button type="button" className="btn" onClick={onCancel}>取消</button>
        <button type="submit" className="btn btn-primary">添加事件</button>
      </div>
    </form>
  )
}
