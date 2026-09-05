const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  pm2List: () => ipcRenderer.invoke('pm2-list'),
  pm2Action: (action, processName) => ipcRenderer.invoke('pm2-action', { action, processName }),
  pm2Logs: (arg, lines = 80) => ipcRenderer.invoke('pm2-logs', typeof arg === 'string' ? { processName: arg, lines } : arg),
  projectsGet: () => ipcRenderer.invoke('projects-get'),
  projectsSave: (projects) => ipcRenderer.invoke('projects-save', projects),
  pm2StartProject: (project) => ipcRenderer.invoke('pm2-start-project', project),
  pm2BatchStart: (projects, concurrency = 2) => ipcRenderer.invoke('pm2-batch-start', { projects, concurrency }),
  ideOpenProject: (targetPath) => ipcRenderer.invoke('ide-open-project', targetPath),
  ideConversationLogs: (projectName) => ipcRenderer.invoke('ide-conversation-logs', projectName),
  exportSkillsAndAgentsToIde: (data) => ipcRenderer.invoke('export-skills-agents-to-ide', data),
  scanAllProjects: () => ipcRenderer.invoke('projects-scan-all'),
  syncWithIde: () => ipcRenderer.invoke('projects-sync-ide'),
  systemDoctor: () => ipcRenderer.invoke('system-doctor'),
  systemHeal: () => ipcRenderer.invoke('system-heal'),
  knowledgeGetFiles: () => ipcRenderer.invoke('knowledge-get-files'),
  knowledgeReadFile: (filePath) => ipcRenderer.invoke('knowledge-read-file', filePath),
  knowledgeOpenFile: (filePath) => ipcRenderer.invoke('knowledge-open-file', filePath),
  knowledgeOpenIma: () => ipcRenderer.invoke('knowledge-open-ima'),
  knowledgeCreateNote: (data) => ipcRenderer.invoke('knowledge-create-note', data),
  knowledgeImaGetItems: () => ipcRenderer.invoke('knowledge-ima-get-items'),
  knowledgeImaImportNote: (data) => ipcRenderer.invoke('knowledge-ima-import-note', data),
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-refresh-projects', () => callback('refresh'));
    ipcRenderer.on('menu-scan-projects', () => callback('scan'));
    ipcRenderer.on('menu-sync-ide', () => callback('sync'));
    ipcRenderer.on('menu-run-doctor', () => callback('doctor'));
    ipcRenderer.on('menu-run-heal', () => callback('heal'));
  }
});
