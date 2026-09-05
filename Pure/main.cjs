const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, spawn, execFile } = require('child_process');

// ================= 全局智能双轨错误日志与诊断系统 =================
// 1. 程序所在目录直观日志（方便用户双击查看，无需翻找深层隐藏目录）
const APP_EXE_DIR = app.isPackaged ? path.dirname(process.execPath) : path.join(__dirname);
const LOCAL_ERROR_LOG = path.join(APP_EXE_DIR, 'error.log');
const LOCAL_RUN_LOG = path.join(APP_EXE_DIR, 'app.log');

// 2. 系统漫游目录备份日志（确保全系统生命周期永久可追溯）
const ROAMING_LOG_DIR = path.join(os.homedir(), 'AppData', 'Roaming', 'Antigravity-PM');
const ROAMING_ERROR_LOG = path.join(ROAMING_LOG_DIR, 'error.log');
const ROAMING_RUN_LOG = path.join(ROAMING_LOG_DIR, 'app.log');

function writeLogFile(filePath, text) {
  try {
    const pdir = path.dirname(filePath);
    if (!fs.existsSync(pdir)) fs.mkdirSync(pdir, { recursive: true });
    fs.appendFileSync(filePath, text, 'utf-8');
  } catch(e) {}
}

function debugLog(msg) {
  const line = `[${new Date().toLocaleString('zh-CN', { hour12: false })}] ${msg}\n`;
  writeLogFile(LOCAL_RUN_LOG, line);
  writeLogFile(ROAMING_RUN_LOG, line);
}

function logError(title, errorOrReason, suggestions = []) {
  const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
  const stack = errorOrReason ? (errorOrReason.stack || errorOrReason.message || String(errorOrReason)) : '未知异常详情';
  const reasonText = errorOrReason && errorOrReason.message ? errorOrReason.message : String(errorOrReason);
  
  let suggestionBlock = '';
  if (suggestions && suggestions.length > 0) {
    suggestionBlock = '\n【排错专家建议】:\n' + suggestions.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n');
  }

  const logEntry = `
================================================================================
【发生时间】: ${timestamp}
【错误类型】: ${title}
【异常原因】: ${reasonText}
${suggestionBlock}
【技术堆栈详情】:
${stack}
================================================================================\n`;

  console.error(logEntry);
  writeLogFile(LOCAL_ERROR_LOG, logEntry);
  writeLogFile(ROAMING_ERROR_LOG, logEntry);
  debugLog(`[ERROR] ${title} - ${reasonText}`);
}

debugLog('=== Antigravity-PM main.cjs loaded === argv: ' + JSON.stringify(process.argv));

process.on('uncaughtException', (err) => {
  logError('主进程未捕获异常 (Uncaught Exception)', err, [
    '通常由底层库路径冲突或运行环境缺失引起；',
    '请检查本地 Node.js / PM2 或 Python 依赖环境是否健全。'
  ]);
});

process.on('unhandledRejection', (reason) => {
  logError('主进程异步未处理拒绝 (Unhandled Rejection)', reason, [
    '异步网络或文件 IO 操作超时未捕获；',
    '请检查对应的项目目录权限与网络防火墙状态。'
  ]);
});

let pm2 = null;
try {
  pm2 = require('pm2');
  debugLog('pm2 loaded successfully');
} catch (e) {
  debugLog('Warning: pm2 require failed: ' + e.message);
}

let ideSync = null;
try {
  ideSync = require('./ideSync.cjs');
  debugLog('ideSync loaded successfully');
} catch (e) {
  debugLog('Warning: ideSync require failed: ' + e.message);
}

// 1. 全局关键路径置顶声明（避免任何闭包在 TDZ 暂存死区内访问引发 ReferenceError）
app.setName('Antigravity-PM');
const USER_DATA_DIR = path.join(app.getPath('appData'), 'Antigravity-PM');
app.setPath('userData', USER_DATA_DIR);
if (!fs.existsSync(USER_DATA_DIR)) {
  try { fs.mkdirSync(USER_DATA_DIR, { recursive: true }); } catch (e) {}
}

const PROJECTS_PATH = path.join(USER_DATA_DIR, 'projects.json');
const DEFAULT_PROJECTS_PATH = path.join(__dirname, 'projects.json');
const ANTIGRAVITY_IDE_EXE = 'D:\\ARUANJIAN\\Antigravity IDE\\Antigravity IDE.exe';

// 2. 禁用 GPU 硬件加速，杜绝 Windows 驱动显卡冲突造成的 -1073741819 闪退
debugLog('Configuring app flags...');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow = null;

// 3. 智能单例锁：若二开时旧进程无窗口，自动重新创建窗口，永不卡死
debugLog('Requesting single instance lock...');
const gotTheLock = app.requestSingleInstanceLock();
debugLog('Got lock: ' + gotTheLock);
if (!gotTheLock) {
  const errMsg = '检测到已有另一个 Antigravity-PM 实例正在后台运行，或上次关闭未完全释放互斥锁。';
  logError('启动受阻 / 单实例互斥锁冲突 (Lock Contention)', errMsg, [
    '请打开 Windows 任务管理器，结束名为 Antigravity-PM.exe 的旧进程后重试；',
    '或在软件目录下双击「一键清理残留并启动.bat」；',
    '已为您自动将诊断信息记录至当前目录下的 error.log 中。'
  ]);

  try {
    const { dialog } = require('electron');
    const choice = dialog.showMessageBoxSync({
      type: 'warning',
      title: 'Antigravity-PM 启动拦截提示',
      message: '程序已在后台运行中，或上次关闭时有残留进程占用互斥锁。',
      detail: '已为您将详细排错诊断记录写入当前目录下的 error.log。\n\n【一秒解决办法】：\n1. 请检查任务栏或系统托盘是否已有窗口；\n2. 打开任务管理器结束旧的 Antigravity-PM.exe 进程后重新打开；\n3. 或直接双击程序同级目录下的「一键清理残留并启动.bat」。',
      buttons: ['打开错误日志查看', '退出程序'],
      defaultId: 0
    });
    if (choice === 0) {
      shell.openPath(fs.existsSync(LOCAL_ERROR_LOG) ? LOCAL_ERROR_LOG : ROAMING_ERROR_LOG);
    }
  } catch (e) {}

  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  } else {
    createWindow();
  }
});

// 唤醒并打开 Antigravity IDE (带 3.5s 防抖，避免批量启动时导致 IDE 窗口震颤)
let lastIdeOpenTime = 0;
let lastIdeOpenPath = '';
function openInAntigravityIde(targetPath) {
  const now = Date.now();
  if (targetPath === lastIdeOpenPath && now - lastIdeOpenTime < 3500) {
    return { success: true, message: 'IDE 已在运行中，跳过重复激活' };
  }
  lastIdeOpenTime = now;
  lastIdeOpenPath = targetPath;
  try {
    if (fs.existsSync(ANTIGRAVITY_IDE_EXE)) {
      const args = targetPath ? [targetPath] : [];
      spawn(ANTIGRAVITY_IDE_EXE, args, { detached: true, stdio: 'ignore' }).unref();
      return { success: true, message: `已在 Antigravity IDE 中打开: ${targetPath || '默认工作区'}` };
    } else {
      if (targetPath && fs.existsSync(targetPath)) {
        shell.openPath(targetPath);
        return { success: true, message: `已打开项目目录: ${targetPath}` };
      }
      return { success: false, message: '未找到 Antigravity IDE 路径' };
    }
  } catch (err) {
    return { success: false, message: `打开 IDE 失败: ${err.message}` };
  }
}

// 统一原生菜单汉化 (全面替换默认英文 File/Edit/View/Window)
function setupChineseApplicationMenu() {
  const template = [
    {
      label: '文件(&F)',
      submenu: [
        {
          label: '刷新策略列表(&R)',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('menu-refresh-projects');
            }
          }
        },
        {
          label: '智能扫描本地所有项目(&S)',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('menu-scan-projects');
            }
          }
        },
        {
          label: '一键与 Antigravity IDE 同步(&Y)',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('menu-sync-ide');
            }
          }
        },
        { type: 'separator' },
        {
          label: '打开策略存储目录(&O)',
          click: () => {
            shell.openPath(USER_DATA_DIR);
          }
        },
        {
          label: '连接并启动 Antigravity IDE(&I)',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            openInAntigravityIde(path.join(os.homedir(), 'Desktop', 'quant'));
          }
        },
        { type: 'separator' },
        {
          label: '退出系统(&X)',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑(&E)',
      submenu: [
        { label: '撤销(&U)', role: 'undo' },
        { label: '重做(&R)', role: 'redo' },
        { type: 'separator' },
        { label: '剪切(&T)', role: 'cut' },
        { label: '复制(&C)', role: 'copy' },
        { label: '粘贴(&P)', role: 'paste' },
        { label: '全选(&A)', role: 'selectAll' }
      ]
    },
    {
      label: '视图(&V)',
      submenu: [
        { label: '重新载入界面(&L)', role: 'reload' },
        { label: '强制重新载入(&F)', role: 'forceReload' },
        { label: '开发者工具(&D)', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '重置缩放', role: 'resetZoom' },
        { label: '放大视图', role: 'zoomIn' },
        { label: '缩小视图', role: 'zoomOut' },
        { type: 'separator' },
        { label: '切换全屏模式(&F11)', role: 'togglefullscreen' }
      ]
    },
    {
      label: '系统自愈(&H)',
      submenu: [
        {
          label: '运行环境全面自检(&D)',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('menu-run-doctor');
            }
          }
        },
        {
          label: '一键释放冲突与重建PM2管道(&C)',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('menu-run-heal');
            }
          }
        }
      ]
    },
    {
      label: '帮助与支持(&A)',
      submenu: [
        {
          label: '关于 Antigravity PM',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 Antigravity PM',
              message: 'Antigravity PM v3.0 旗舰版',
              detail: '全方位量化策略管理、进程自动守护、多视图流转、档案馆与 Antigravity IDE 联动平台。\n\n并发控制：最大并发数已严格锁死为 2。\n技术内核：Electron + React + PM2 + Vikunja 架构',
              buttons: ['确定']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  debugLog('createWindow called');
  try {
    mainWindow = new BrowserWindow({
      width: 1220,
      height: 820,
      minWidth: 960,
      minHeight: 640,
      show: true, // 确保初始即展现，不因 ready-to-show 丢失导致黑屏假死
      title: 'Antigravity PM - 量化策略与智能体工程管理平台',
      backgroundColor: '#0b0c10',
      autoHideMenuBar: true, // 自动隐藏原生白色菜单栏，消除顶部白边，按 Alt 键或界面快捷键仍可呼出
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    debugLog('BrowserWindow instance created successfully');
  } catch (err) {
    debugLog('Failed to create BrowserWindow: ' + err.stack);
    throw err;
  }

  try {
    setupChineseApplicationMenu();
    debugLog('setupChineseApplicationMenu succeeded');
  } catch (e) {
    debugLog('Failed to setup Chinese menu: ' + e.stack);
    console.error('Failed to setup Chinese menu:', e);
  }

    // 全局原生右键菜单：支持任意文字自由复制、粘贴、剪切与全选
  mainWindow.webContents.on('context-menu', (event, params) => {
    const { Menu, MenuItem } = require('electron');
    const menu = new Menu();

    // 1. 如果有选中文本，提供复制
    if (params.selectionText && params.selectionText.trim().length > 0) {
      menu.append(new MenuItem({
        label: '复制(&C)',
        role: 'copy',
        accelerator: 'CmdOrCtrl+C'
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    // 2. 如果在可编辑区域（输入框/文本域），提供剪切、粘贴、撤销与全选
    if (params.isEditable) {
      menu.append(new MenuItem({
        label: '剪切(&T)',
        role: 'cut',
        accelerator: 'CmdOrCtrl+X'
      }));
      menu.append(new MenuItem({
        label: '粘贴(&P)',
        role: 'paste',
        accelerator: 'CmdOrCtrl+V'
      }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: '撤销(&Z)',
        role: 'undo',
        accelerator: 'CmdOrCtrl+Z'
      }));
      menu.append(new MenuItem({
        label: '重做(&Y)',
        role: 'redo',
        accelerator: 'CmdOrCtrl+Y'
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    // 3. 通用全局全选
    menu.append(new MenuItem({
      label: '全选(&A)',
      role: 'selectAll',
      accelerator: 'CmdOrCtrl+A'
    }));

    // 若当前未选中文本且不在输入框中，也可快捷复制页面或刷新
    if (!params.isEditable && (!params.selectionText || params.selectionText.trim().length === 0)) {
      menu.append(new MenuItem({
        label: '复制选区(&C)',
        role: 'copy',
        accelerator: 'CmdOrCtrl+C'
      }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: '重新载入界面(&R)',
        role: 'reload',
        accelerator: 'CmdOrCtrl+R'
      }));
    }

    menu.popup({ window: mainWindow, x: params.x, y: params.y });
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    debugLog(`webContents did-fail-load: ${errorCode} ${errorDescription} URL: ${validatedURL}`);
  });
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    debugLog(`webContents render-process-gone: ${JSON.stringify(details)}`);
  });
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    debugLog(`Renderer console: ${message} (${sourceId}:${line})`);
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    debugLog('Loading URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    debugLog('Loading file: ' + indexPath + ' (exists: ' + fs.existsSync(indexPath) + ')');
    mainWindow.loadFile(indexPath).then(() => {
      debugLog('loadFile dist/index.html resolved');
    }).catch(err => {
      debugLog('Failed to load dist/index.html: ' + err.stack);
      console.error('Failed to load dist/index.html:', err);
    });
  }

  mainWindow.on('closed', () => {
    debugLog('mainWindow closed event');
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  debugLog('app.whenReady resolved! Calling createWindow...');
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(err => {
  debugLog('app.whenReady error: ' + err.stack);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- PM2 IPC Handlers ---
let pm2Connected = false;

function ensurePm2() {
  return new Promise((resolve, reject) => {
    if (pm2Connected) return resolve();
    pm2.connect((err) => {
      if (err) {
        pm2Connected = false;
        return reject(err);
      }
      pm2Connected = true;
      resolve();
    });
  });
}

ipcMain.handle('pm2-list', async () => {
  return new Promise(async (resolve) => {
    try {
      await ensurePm2();
      pm2.list((err, list) => {
        if (err) {
          pm2Connected = false;
          return resolve([]);
        }
        resolve(list || []);
      });
    } catch (e) {
      pm2Connected = false;
      resolve([]);
    }
  });
});

ipcMain.handle('pm2-action', async (event, { action, processName }) => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensurePm2();
      if (['start', 'restart', 'stop', 'delete'].includes(action)) {
        pm2[action](processName, (err, proc) => {
          if (err) reject(err);
          else resolve(proc);
        });
      } else {
        reject(new Error('非法 PM2 指令: ' + action));
      }
    } catch (err) {
      pm2Connected = false;
      reject(err);
    }
  });
});

// 原子写入文件，杜绝 0 字节损坏
function atomicWriteJsonSync(targetPath, data) {
  const content = JSON.stringify(data, null, 2);
  const tmpPath = `${targetPath}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tmpPath, content, 'utf-8');
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.renameSync(tmpPath, targetPath);
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch (e) {}
    }
    fs.writeFileSync(targetPath, content, 'utf-8');
  }
}

// 确保 projects.json 存在
try {
  if (!fs.existsSync(PROJECTS_PATH) && fs.existsSync(DEFAULT_PROJECTS_PATH)) {
    fs.copyFileSync(DEFAULT_PROJECTS_PATH, PROJECTS_PATH);
  }
} catch (e) {
  console.error('Failed to init projects.json in userData:', e);
}

// 获取策略列表（直连 Antigravity IDE 共享数据库主库，若不存在则回退本地）
ipcMain.handle('projects-get', async () => {
  return ideSync.readSharedProjects(USER_DATA_DIR, DEFAULT_PROJECTS_PATH);
});

// 保存策略列表（直连同步写入 IDE 共享库、Gemini 共享库、本地应用缓存及各项目 .antigravity.json）
ipcMain.handle('projects-save', async (event, projects) => {
  try {
    ideSync.saveSharedProjects(projects, USER_DATA_DIR);
    return { success: true };
  } catch (err) {
    console.error('Failed to save shared projects:', err);
    return { success: false, error: err.message };
  }
});

// 一键与 Antigravity IDE 数据库双向直连同步（自动提取新增工作区与最新 task.md 进度）
ipcMain.handle('projects-sync-ide', async () => {
  try {
    return ideSync.syncWithIde(USER_DATA_DIR, DEFAULT_PROJECTS_PATH);
  } catch (err) {
    console.error('Failed to sync with Antigravity IDE:', err);
    return { success: false, error: err.message };
  }
});

// 启动单策略进程
ipcMain.handle('pm2-start-project', async (event, project) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (project.cwd) {
        openInAntigravityIde(project.cwd);
      }

      await ensurePm2();

      const options = {
        name: project.name,
        script: project.script,
        cwd: project.cwd || process.cwd(),
        autorestart: project.autoRestart !== false,
        env: {
          ...process.env,
          ASSIGNED_AGENTS: (project.assignedAgents || []).join(','),
          ASSIGNED_SKILLS: (project.assignedSkills || []).join(','),
          ANTIGRAVITY_PROJECT_ID: project.id || '',
          ANTIGRAVITY_PROJECT_NAME: project.name || ''
        }
      };
      if (project.interpreter) options.interpreter = project.interpreter;
      if (project.args) options.args = project.args;

      pm2.start(options, (err, apps) => {
        if (err) reject(err);
        else resolve(apps);
      });
    } catch (err) {
      pm2Connected = false;
      reject(err);
    }
  });
});

// 批量启动原生实现 (最大并发数严格限制为 2)
ipcMain.handle('pm2-batch-start', async (event, { projects, concurrency = 2 }) => {
  const limit = Math.max(1, Math.min(2, concurrency || 2)); // 严格限制最大并发为 2
  const results = [];
  const queue = [...projects];
  let inFlight = 0;

  return new Promise((resolve) => {
    if (queue.length === 0) return resolve([]);

    function pump() {
      while (inFlight < limit && queue.length > 0) {
        const item = queue.shift();
        inFlight++;

        if (item.cwd) openInAntigravityIde(item.cwd);

        const options = {
          name: item.name,
          script: item.script,
          cwd: item.cwd || process.cwd(),
          autorestart: item.autoRestart !== false,
          env: {
            ...process.env,
            ASSIGNED_AGENTS: (item.assignedAgents || []).join(','),
            ASSIGNED_SKILLS: (item.assignedSkills || []).join(','),
            ANTIGRAVITY_PROJECT_ID: item.id || '',
            ANTIGRAVITY_PROJECT_NAME: item.name || ''
          }
        };
        if (item.interpreter) options.interpreter = item.interpreter;
        if (item.args) options.args = item.args;

        ensurePm2().then(() => {
          pm2.start(options, (err, apps) => {
            inFlight--;
            results.push({ name: item.name, success: !err, error: err ? err.message : null });
            if (queue.length === 0 && inFlight === 0) {
              resolve(results);
            } else {
              setTimeout(pump, 200);
            }
          });
        }).catch(err => {
          inFlight--;
          results.push({ name: item.name, success: false, error: err.message });
          if (queue.length === 0 && inFlight === 0) {
            resolve(results);
          } else {
            setTimeout(pump, 200);
          }
        });
      }
    }

    pump();
  });
});

// 手动在 IDE 中打开
// 导出全域专家团与技能清单至 IDE 并唤醒 IDE 询问修改
ipcMain.handle('export-skills-agents-to-ide', async (event, data) => {
  try {
    const { expertTeams = [], skills = [], targetDir } = data || {};
    const scratchDir = targetDir || path.join(os.homedir(), 'Desktop', 'quant', 'scratch');
    if (!fs.existsSync(scratchDir)) {
      try { fs.mkdirSync(scratchDir, { recursive: true }); } catch (e) {}
    }
    
    // 构建 Markdown 文档内容
    let md = `# 🤖 Antigravity 多智能体专家团与技能生态配置修改工坊\n\n`;
    md += `> 💡 **系统状态**：已为您提取当前系统的 **${expertTeams.length} 大垂直专家决策团** 与 **${skills.length} 项底层核心技能插件**。\n\n`;
    md += `## 💬 请告诉我您希望如何修改或升级？\n\n`;
    md += `您可以直接在此向我提出任何修改需求，例如：\n`;
    md += `1. **修改已有专家团**：调整角色分工、增加特定领域专家成员（如增加期权高频/套利专家）、增减挂载技能；\n`;
    md += `2. **创建全新专家团**：定义专属的业务专家决策组（如"海外市场宏观对冲专家团"）；\n`;
    md += `3. **修改技能插件**：修改中文名称、完善功能描述、调整 1-5 星领域评分；\n`;
    md += `4. **新增自定义技能**：对接新的数据源、编写新的量化回测或自动化工具 Skill。\n\n`;
    md += `收到您的回复后，我将立即为您全自动修改代码和配置，并实时热同步回 Antigravity-PM 客户端！\n\n`;
    md += `---\n\n`;
    md += `## 🏛️ 当前全域九大专家决策团全景清单 (${expertTeams.length} 组)\n\n`;
    
    expertTeams.forEach((team, idx) => {
      md += `### ${idx + 1}. ${team.name || team.id}\n`;
      md += `- **团队代号**: \`${team.id}\`\n`;
      md += `- **定位角色**: ${team.role || '专家组'} | **领域评级**: ${team.stars || '⭐⭐⭐⭐⭐'} (${team.domain || '全域'})\n`;
      md += `- **包含专家与项目分工**:\n`;
      if (team.memberList && team.memberList.length > 0) {
        team.memberList.forEach(m => {
          md += `  - ${m}\n`;
        });
      } else if (team.membersText) {
        md += `  - ${team.membersText}\n`;
      }
      md += `- **核心功能与工作流**: ${team.detailedDesc || team.desc || ''}\n`;
      md += `- **配属支撑技能**: ${(team.skills || []).join('、') || '无'}\n\n`;
    });
    
    md += `---\n\n`;
    md += `## ⚡ 当前全域核心底层技能插件全景清单 (${skills.length} 项)\n\n`;
    
    skills.forEach((s, idx) => {
      md += `### ${idx + 1}. ${s.name || s.id}\n`;
      md += `- **插件ID**: \`${s.id}\` | **类型**: ${s.type || '技能'} | **领域**: ${s.domain || '通用'} | **评分**: ${s.stars || '⭐⭐⭐⭐⭐'}\n`;
      md += `- **详细功能说明**: ${s.desc || ''}\n\n`;
    });
    
    md += `---\n\n`;
    md += `> 💡 **请在此对话框直接回复修改意见**，例如：\n`;
    md += `> - "帮我把星辰多空投研团的第四位专家改成波动率套利专家"\n`;
    md += `> - "新建一个港股高股息红利策略专家团，配属相应选股技能"\n`;

    const targetDocPath = path.join(scratchDir, 'ANTIGRAVITY_TEAM_EDITOR.md');
    fs.writeFileSync(targetDocPath, md, 'utf-8');

    // 同时写一份到用户全局配置根目录
    try {
      const globalConfigDir = path.join(os.homedir(), '.gemini', 'config');
      if (fs.existsSync(globalConfigDir)) {
        fs.writeFileSync(path.join(globalConfigDir, 'ANTIGRAVITY_TEAM_EDITOR.md'), md, 'utf-8');
      }
    } catch(e) {}

    // 更新任务描述
    try {
      const taskPath = path.join(scratchDir, 'ANTIGRAVITY_TASK.md');
      const taskMd = `# 🤖 Antigravity 任务面板：专家团与技能生态配置修改\n\n当前处于专家团与技能修改工坊模式。请查看 [ANTIGRAVITY_TEAM_EDITOR.md](./ANTIGRAVITY_TEAM_EDITOR.md) 中的全景清单并指导修改。\n`;
      fs.writeFileSync(taskPath, taskMd, 'utf-8');
    } catch (e) {}

    // 唤醒 IDE
    openInAntigravityIde(targetDocPath);
    return { success: true, message: '已列出全部专家团与技能，并已唤醒 IDE 等待您的修改指令！', path: targetDocPath };
  } catch (err) {
    console.error('export-skills-agents-to-ide error:', err);
    return { success: false, message: '导出失败: ' + err.message };
  }
});

ipcMain.handle('ide-open-project', async (event, targetPath) => {
  return openInAntigravityIde(targetPath);
});

// 扫描全生态项目（与 IDE 直连同步保持 100% 同构）
ipcMain.handle('projects-scan-all', async () => {
  try {
    const res = ideSync.syncWithIde(USER_DATA_DIR, DEFAULT_PROJECTS_PATH);
    return res.projects || [];
  } catch (err) {
    console.error('projects-scan-all failed:', err);
    return [];
  }
});

// 实时日志流
ipcMain.handle('pm2-logs', async (event, { processName, lines = 80 }) => {
  return new Promise(async (resolve) => {
    try {
      await ensurePm2();
      pm2.describe(processName, (err, list) => {
        if (err || !list || list.length === 0) {
          return resolve({
            success: false,
            logs: [{ type: 'sys', text: `[SYS ${new Date().toLocaleTimeString()}] 策略进程未在 PM2 中启动或尚未产生控制台日志` }]
          });
        }
        const proc = list[0];
        const outPath = proc.pm2_env?.pm_out_log_path;
        const errPath = proc.pm2_env?.pm_err_log_path;

        let outLines = [];
        let errLines = [];

        if (outPath && fs.existsSync(outPath)) {
          const raw = fs.readFileSync(outPath, 'utf-8');
          outLines = raw.split('\n').filter(Boolean).slice(-lines).map(l => ({ type: 'out', text: l }));
        }
        if (errPath && fs.existsSync(errPath)) {
          const raw = fs.readFileSync(errPath, 'utf-8');
          errLines = raw.split('\n').filter(Boolean).slice(-lines).map(l => ({ type: 'err', text: l }));
        }

        const combined = [...outLines, ...errLines].slice(-lines);
        if (combined.length === 0) {
          combined.push({ type: 'sys', text: `[SYS ${new Date().toLocaleTimeString()}] 策略平稳守护运行中，暂无最新输出` });
        }
        resolve({ success: true, logs: combined });
      });
    } catch (e) {
      resolve({
        success: false,
        logs: [{ type: 'err', text: `[ERR] 读取控制台日志失败: ${e.message}` }]
      });
    }
  });
});

// 读取 Antigravity IDE 对话历史记录
ipcMain.handle('ide-conversation-logs', async (event, projectName) => {
  return new Promise((resolve) => {
    try {
      const candidates = [
        path.join(__dirname, 'get_ide_logs.py'),
        path.join(process.cwd(), 'get_ide_logs.py'),
        path.join(__dirname, 'get_ide_logs.py'),
        path.join(__dirname, 'get_ide_logs.py')
      ];
      let scriptPath = candidates.find(p => fs.existsSync(p));
      debugLog(`[ide-conversation-logs] querying logs for ${projectName}, script: ${scriptPath}`);
      if (!fs.existsSync(scriptPath)) {
        debugLog(`[ide-conversation-logs] script not found!`);
        return resolve({ success: true, conversations: [] });
      }
      execFile('python', [scriptPath, projectName || ''], { encoding: 'utf-8', timeout: 5000 }, (err, stdout, stderr) => {
        if (err || !stdout) {
          debugLog(`[ide-conversation-logs] exec error: ${err?.message}, stderr: ${stderr}`);
          return resolve({ success: true, conversations: [] });
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          debugLog(`[ide-conversation-logs] parsed ${parsed.conversations?.length || 0} conversation entries`);
          resolve(parsed);
        } catch (pe) {
          debugLog(`[ide-conversation-logs] JSON parse error: ${pe.message}`);
          resolve({ success: true, conversations: [] });
        }
      });
    } catch (e) {
      debugLog(`[ide-conversation-logs] outer error: ${e.message}`);
      resolve({ success: false, error: e.message, conversations: [] });
    }
  });
});

// 环境大夫健康体检
ipcMain.handle('system-doctor', async () => {
  const result = {
    python: { ok: false, version: '未检测到 Python 环境' },
    git: { ok: false, version: '未检测到 Git', status: '正常' },
    pm2: { ok: false, latency: '0ms' },
    ide: { ok: fs.existsSync(ANTIGRAVITY_IDE_EXE), path: ANTIGRAVITY_IDE_EXE },
    system: {
      platform: `${os.platform()} (${os.arch()})`,
      freeMemMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
      cpuModel: os.cpus()[0]?.model || '通用处理器'
    }
  };

  try {
    const pyVer = execSync('python --version', { encoding: 'utf-8', timeout: 2000 }).trim();
    result.python = { ok: true, version: pyVer };
  } catch (e) {
    try {
      const pyVer = execSync('py -3 --version', { encoding: 'utf-8', timeout: 2000 }).trim();
      result.python = { ok: true, version: pyVer };
    } catch (e2) {}
  }

  try {
    const gitVer = execSync('git --version', { encoding: 'utf-8', timeout: 2000 }).trim();
    result.git.ok = true;
    result.git.version = gitVer;
  } catch (e) {}

  const startT = Date.now();
  try {
    await ensurePm2();
    result.pm2.ok = true;
    result.pm2.latency = `${Date.now() - startT}ms`;
  } catch (e) {
    result.pm2.ok = false;
    result.pm2.error = e.message;
  }

  return result;
});

// 一键故障自动自愈
ipcMain.handle('system-heal', async () => {
  const actions = [];
  try {
    const currentPid = process.pid;
    if (process.platform === 'win32') {
      try {
        execSync(`powershell -Command "Get-Process -Name 'Antigravity-PM' -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne ${currentPid} } | Stop-Process -Force"`, { timeout: 4000 });
        actions.push('已清理后台多余冲突实例');
      } catch (e) {}
    }

    try {
      pm2Connected = false;
      await ensurePm2();
      actions.push('已重置 PM2 守护通信管道');
    } catch (e) {
      actions.push(`PM2 状态: ${e.message}`);
    }

    return {
      success: true,
      message: `自愈修复成功！${actions.join('；')}`
    };
  } catch (err) {
    return {
      success: false,
      message: `自愈执行异常: ${err.message}`
    };
  }
});

// ================= 🧠 投研知识库与腾讯 ima 直连体系 =================
const KNOWLEDGE_VAULT_DIR = path.join(os.homedir(), 'Desktop', 'quant', 'knowledge_vault');

// 获取本地智库所有文件结构
ipcMain.handle('knowledge-get-files', async () => {
  try {
    if (!fs.existsSync(KNOWLEDGE_VAULT_DIR)) {
      fs.mkdirSync(KNOWLEDGE_VAULT_DIR, { recursive: true });
    }

    const categories = [];
    const entries = fs.readdirSync(KNOWLEDGE_VAULT_DIR, { withFileTypes: true });

    for (const ent of entries) {
      if (ent.isDirectory()) {
        const catDir = path.join(KNOWLEDGE_VAULT_DIR, ent.name);
        const files = [];
        const subEntries = fs.readdirSync(catDir, { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isFile() && sub.name.endsWith('.md')) {
            const filePath = path.join(catDir, sub.name);
            const stat = fs.statSync(filePath);
            let excerpt = '';
            try {
              const headContent = fs.readFileSync(filePath, 'utf-8').slice(0, 300);
              excerpt = headContent.replace(/^[#\s>-]+/gm, '').slice(0, 100).trim();
            } catch (e) {}

            files.push({
              name: sub.name,
              title: sub.name.replace(/\.md$/, ''),
              path: filePath,
              relativePath: path.join(ent.name, sub.name),
              size: stat.size,
              mtime: stat.mtimeMs,
              excerpt
            });
          }
        }
        categories.push({
          categoryName: ent.name,
          title: ent.name.replace(/^\d+_/, ''),
          files: files.sort((a, b) => b.mtime - a.mtime)
        });
      }
    }

    // 根目录下的 Markdown 文件（如 README.md）
    const rootFiles = entries
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => {
        const filePath = path.join(KNOWLEDGE_VAULT_DIR, e.name);
        const stat = fs.statSync(filePath);
        return {
          name: e.name,
          title: e.name.replace(/\.md$/, ''),
          path: filePath,
          relativePath: e.name,
          size: stat.size,
          mtime: stat.mtimeMs,
          excerpt: '知识库概览与双核协同指引'
        };
      });

    if (rootFiles.length > 0) {
      categories.unshift({
        categoryName: '00_智库全局索引',
        title: '智库全局总览',
        files: rootFiles
      });
    }

    return {
      success: true,
      vaultPath: KNOWLEDGE_VAULT_DIR,
      categories
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      categories: []
    };
  }
});

// 读取指定文档内容
ipcMain.handle('knowledge-read-file', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: '文件不存在' };
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 在 Antigravity IDE 中打开笔记
ipcMain.handle('knowledge-open-file', async (event, targetPath) => {
  try {
    const fileToOpen = targetPath || KNOWLEDGE_VAULT_DIR;
    if (fs.existsSync(ANTIGRAVITY_IDE_EXE)) {
      spawn(ANTIGRAVITY_IDE_EXE, [fileToOpen], { detached: true, stdio: 'ignore' }).unref();
      return { success: true, message: `已在 Antigravity IDE 中打开: ${path.basename(fileToOpen)}` };
    } else {
      shell.openPath(fileToOpen);
      return { success: true, message: `已打开文档: ${path.basename(fileToOpen)}` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 打开腾讯 ima.copilot 工作台
ipcMain.handle('knowledge-open-ima', async () => {
  try {
    const imaUrl = 'https://ima.qq.com/';
    shell.openExternal(imaUrl);
    return { success: true, message: '已为您唤醒腾讯 ima.copilot 投研工作台！' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 新建投研笔记
ipcMain.handle('knowledge-create-note', async (event, { categoryName, title, content }) => {
  try {
    const safeTitle = (title || '未命名研报笔记').replace(/[\\/:*?"<>|]/g, '_');
    const targetDir = path.join(KNOWLEDGE_VAULT_DIR, categoryName || '01_策略白皮书与逻辑库');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, `${safeTitle}.md`);
    const initialContent = content || `# 📑 ${safeTitle}\n\n> 记录时间：${new Date().toLocaleString()}\n> 关联模块：Antigravity PM & 投研专家团\n\n---\n\n## 1. 核心观点\n- \n\n## 2. 策略与因子构思\n- \n\n## 3. 风控要求\n- \n`;
    fs.writeFileSync(targetPath, initialContent, 'utf-8');
    return { success: true, path: targetPath, message: `成功创建笔记「${safeTitle}」` };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 获取腾讯 ima.copilot 真实云端知识库列表与剪藏条目
ipcMain.handle('knowledge-ima-get-items', async () => {
  const imaSkillPath = path.join(os.homedir(), '.gemini', 'config', 'skills', 'ima-skill', 'ima_api.cjs');
  if (!fs.existsSync(imaSkillPath)) {
    return { success: false, error: '未安装 ima-skill 模块' };
  }
  try {
    const { imaApi } = require(imaSkillPath);
    const kbRes = await imaApi('openapi/wiki/v1/search_knowledge_base', { query: '', cursor: '', limit: 10 });
    const kbData = JSON.parse(kbRes || '{}');
    const kbList = kbData?.data?.info_list || [];
    if (kbList.length === 0) {
      return { success: true, kbList: [], items: [] };
    }
    const targetKb = kbList[0];
    const itemsRes = await imaApi('openapi/wiki/v1/get_knowledge_list', {
      knowledge_base_id: targetKb.kb_id,
      cursor: '',
      limit: 25
    });
    const itemsData = JSON.parse(itemsRes || '{}');
    return {
      success: true,
      kbList,
      targetKb,
      items: itemsData?.data?.knowledge_list || []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 将腾讯 ima 剪藏条目一键导入到本地知识库
ipcMain.handle('knowledge-ima-import-note', async (event, { title, mediaId }) => {
  try {
    const safeTitle = (title || '腾讯ima研报剪藏').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50);
    const targetDir = path.join(KNOWLEDGE_VAULT_DIR, '02_券商与宏观研报复盘');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, `[ima剪藏]_${safeTitle}.md`);
    const content = `# 📑 ${title}\n\n> 来源通道：腾讯 ima.copilot 微信剪藏\n> 媒体标识 (Media ID)：\`${mediaId || 'N/A'}\`\n> 导入时间：${new Date().toLocaleString()}\n\n---\n\n## 1. 研报与推文核心论点\n- (已由腾讯 ima.copilot 智能提炼并在本地知识库存档)\n\n## 2. 量化专家团复盘与落地\n- \n\n## 3. 对应策略与因子\n- \n`;
    fs.writeFileSync(targetPath, content, 'utf-8');
    return { success: true, path: targetPath, message: `已成功将「${safeTitle}」导入本地智库！` };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 错误日志查看与一键清理残存锁 IPC
ipcMain.handle('open-error-log', async () => {
  const target = fs.existsSync(LOCAL_ERROR_LOG) ? LOCAL_ERROR_LOG : (fs.existsSync(LOCAL_RUN_LOG) ? LOCAL_RUN_LOG : ROAMING_ERROR_LOG);
  try {
    if (!fs.existsSync(target)) {
      writeLogFile(target, `[${new Date().toLocaleString('zh-CN', { hour12: false })}] 暂无严重错误，系统运行正常！\n`);
    }
    await shell.openPath(target);
    return { success: true, path: target };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle('clean-residual-locks', async () => {
  try {
    execSync('taskkill /F /IM Antigravity-PM.exe /FI "PID ne ' + process.pid + '"', { windowsHide: true });
    return { success: true, message: '已成功清理除当前窗口外的所有潜在残留进程！' };
  } catch (e) {
    return { success: true, message: '未发现冲突进程，环境正常。' };
  }
});
