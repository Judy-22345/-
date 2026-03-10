import React from 'react'

export default function QuickFileModal({ caseData, onClose, onUpdateFiles }) {
  const [activeTab, setActiveTab] = React.useState('party')

  const tabs = [
    { id: 'party', label: '我方文件', icon: '📄', color: '#2f80ed' },
    { id: 'court', label: '法院文件', icon: '⚖️', color: '#e67e22' },
    { id: 'opponent', label: '对方文件', icon: '📋', color: '#27ae60' }
  ]

  function handleFileSelect(e, category) {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    const currentFiles = caseData.files?.[category] || []

    const promises = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          resolve({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result,
            uploadDate: new Date().toISOString()
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then(newFiles => {
      const allFiles = [...currentFiles, ...newFiles]
      const updatedFiles = { ...caseData.files, [category]: allFiles }
      onUpdateFiles(updatedFiles)
    })

    e.target.value = ''
  }

  function handleDelete(category, fileId) {
    const remainingFiles = (caseData.files?.[category] || []).filter(f => f.id !== fileId)
    const updatedFiles = { ...caseData.files, [category]: remainingFiles }
    onUpdateFiles(updatedFiles)
  }

  function handleDownload(file) {
    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handlePreview(file) {
    if (file.type.startsWith('image/')) {
      const previewWindow = window.open('', '_blank')
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${file.name}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
            <img src="${file.data}" alt="${file.name}" style="max-width:100%;max-height:100vh;" />
          </body>
        </html>
      `)
      previewWindow.document.close()
    } else {
      handleDownload(file)
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }

  const currentFiles = caseData.files?.[activeTab] || []
  const activeTabConfig = tabs.find(t => t.id === activeTab)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '16px' }}>📎 文件管理</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {caseData.caseNumber}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body" style={{ padding: '0' }}>
          {/* 标签页 */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)'
          }}>
            {tabs.map(tab => {
              const count = (caseData.files?.[tab.id] || []).length
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: activeTab === tab.id ? '#fff' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                    color: activeTab === tab.id ? tab.color : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      background: tab.color,
                      color: '#fff',
                      borderRadius: '10px'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 文件列表 */}
          <div style={{ padding: '16px', minHeight: '200px', maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: activeTabConfig?.color || '#2f80ed',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease'
                }}
              >
                <span>📎 上传文件</span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e, activeTab)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {currentFiles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                <div style={{ fontSize: '13px' }}>暂无文件</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>点击"上传文件"添加</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentFiles.map(file => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {file.type.startsWith('image/') ? '🖼️' :
                       file.type.includes('pdf') ? '📕' :
                       file.type.includes('word') || file.type.includes('document') ? '📘' :
                       file.type.includes('sheet') || file.type.includes('excel') ? '📗' : '📄'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {file.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '2px'
                      }}>
                        {formatFileSize(file.size)} · {formatDate(file.uploadDate)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handlePreview(file)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: 'var(--accent-color)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        预览
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: '#6c757d',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        下载
                      </button>
                      <button
                        onClick={() => handleDelete(activeTab, file.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
