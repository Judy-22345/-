import React, { useRef } from 'react'

export default function FileUpload({ category, files = [], onFilesChange }) {
  const fileInputRef = useRef(null)

  const categoryLabels = {
    party: '我方文件',
    court: '法院文件',
    opponent: '对方文件'
  }

  const categoryIcons = {
    party: '📄',
    court: '⚖️',
    opponent: '📋'
  }

  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    // 将文件转换为 base64 并保存
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
      onFilesChange(category, [...files, ...newFiles])
    })

    // 重置 input 以便可以重复上传相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleDelete(fileId) {
    const remainingFiles = files.filter(f => f.id !== fileId)
    onFilesChange(category, remainingFiles)
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
    // 对于图片类型直接在当前窗口打开预览
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
      // 其他类型直接下载
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

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>{categoryIcons[category]}</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {categoryLabels[category]}
          </span>
          {files.length > 0 && (
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              background: 'var(--accent-color)',
              color: '#fff',
              borderRadius: '10px'
            }}>
              {files.length}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => fileInputRef.current?.click()}
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          📎 上传文件
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {files.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '10px',
          background: 'var(--bg-secondary)',
          borderRadius: '6px'
        }}>
          {files.map(file => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                background: 'var(--bg-primary)',
                borderRadius: '4px'
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {file.type.startsWith('image/') ? '🖼️' :
                 file.type.includes('pdf') ? '📕' :
                 file.type.includes('word') || file.type.includes('document') ? '📘' :
                 file.type.includes('sheet') || file.type.includes('excel') ? '📗' : '📄'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginTop: '2px'
                }}>
                  {formatFileSize(file.size)} · {formatDate(file.uploadDate)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => handlePreview(file)}
                  style={{
                    padding: '3px 8px',
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
                  type="button"
                  onClick={() => handleDownload(file)}
                  style={{
                    padding: '3px 8px',
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
                  type="button"
                  onClick={() => handleDelete(file.id)}
                  style={{
                    padding: '3px 8px',
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
  )
}
