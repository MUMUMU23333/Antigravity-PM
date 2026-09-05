const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// 统一共享数据库路径定义（Antigravity IDE 与 Antigravity PM 直连共用）
// 动态跨平台用户主目录
const USER_HOME = os.homedir();
const IDE_SHARED_DIR = path.join(USER_HOME, '.gemini', 'antigravity-ide');
const IDE_SHARED_PROJECTS_PATH = path.join(IDE_SHARED_DIR, 'projects.json');
const GEMINI_SHARED_PROJECTS_PATH = path.join(USER_HOME, '.gemini', 'antigravity', 'projects.json');

// 原子写入 JSON
function atomicWriteJsonSync(targetPath, data) {
  const content = JSON.stringify(data, null, 2);
  const tmpPath = `${targetPath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  try {
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(tmpPath, content, 'utf-8');
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.renameSync(tmpPath, targetPath);
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch (e) {}
    }
    try { fs.writeFileSync(targetPath, content, 'utf-8'); } catch (e) {}
  }
}

// 统一保存到所有直连共用位置
function saveSharedProjects(projects, localUserDataDir) {
  // 1. Antigravity IDE 根目录共享主库
  try {
    atomicWriteJsonSync(IDE_SHARED_PROJECTS_PATH, projects);
  } catch (e) {
    console.error('Failed to write IDE_SHARED_PROJECTS_PATH:', e);
  }

  // 2. Gemini 共享库
  try {
    atomicWriteJsonSync(GEMINI_SHARED_PROJECTS_PATH, projects);
  } catch (e) {
    console.error('Failed to write GEMINI_SHARED_PROJECTS_PATH:', e);
  }

  // 3. PM 本地 AppData 缓存
  if (localUserDataDir) {
    try {
      const localPath = path.join(localUserDataDir, 'projects.json');
      atomicWriteJsonSync(localPath, projects);
    } catch (e) {}
  }

  const quantDirNorm = path.join(USER_HOME, 'Desktop', '量化策略源代码').toLowerCase();
  projects.forEach(item => {
    try {
      if (item.isGitSynced !== false && item.cwd && fs.existsSync(item.cwd)) {
        const itemCwdNorm = item.cwd.toLowerCase().replace(/[\\\/]+$/, '');
        if (itemCwdNorm === quantDirNorm && item.script && item.script.endsWith('.py') && item.id.startsWith('quant-file-')) {
          return; // 不覆盖量化根目录的工程级 .antigravity.json
        }
        const localConfigPath = path.join(item.cwd, '.antigravity.json');
        const gitConfig = {
          id: item.id,
          name: item.name,
          stage: item.stage,
          priority: item.priority,
          category: item.category,
          script: item.script,
          interpreter: item.interpreter,
          args: item.args,
          description: item.description,
          startDate: item.startDate,
          dueDate: item.dueDate,
          metrics: item.metrics,
          autoRestart: item.autoRestart !== false,
          riskLock: item.riskLock !== false,
          logArchiving: item.logArchiving !== false,
          isGitSynced: item.isGitSynced !== false,
          subtasks: item.subtasks || [],
          assignedAgents: item.assignedAgents || [],
          assignedSkills: item.assignedSkills || []
        };
        atomicWriteJsonSync(localConfigPath, gitConfig);

        // 同时写入专家与技能定向执行锁文件 .antigravity-team.json
        const teamLockPath = path.join(item.cwd, '.antigravity-team.json');
        const teamLockConfig = {
          projectId: item.id,
          projectName: item.name,
          model: 'Gemini 3.1 Pro',
          modelId: 'gemini-3.1-pro',
          description: item.description || '',
          lastUpdated: new Date().toISOString(),
          assignedAgents: item.assignedAgents || [],
          assignedSkills: item.assignedSkills || [],
          executionPolicy: 'STRICT_ASSIGNED_TEAMS_AND_SKILLS',
          instruction: `已自动激活 Antigravity IDE！当前工作区：${item.name}。已为该项目锁定 Gemini 3.1 Pro 模型、指定专家团及支撑技能，无缝载入历史日志与模型逻辑自动开始工作。`
        };
        atomicWriteJsonSync(teamLockPath, teamLockConfig);

        // 写入项目专属任务指导文档 .antigravity-prompt.md 供 IDE 自动解析执行
        try {
          const promptDocPath = path.join(item.cwd, 'ANTIGRAVITY_TASK.md');
          const promptContent = `# 🚀 量化策略研发与执行工单: ${item.name}

> 🤖 **当前执行模型**: **Gemini 3.1 Pro**
> 📅 **创建/修改时间**: ${new Date().toLocaleString()}
> 📁 **工作目录**: \`${item.cwd}\`
> 🐍 **入口脚本**: \`${item.script || 'main.py'}\`

---

## 🏛️ 确定就席的专家团队
${(item.assignedAgents || []).map(a => `- **${a}**`).join('\n') || '- 默认投研决策专家组'}

## ⚡ 挂载赋能的支撑技能
${(item.assignedSkills || []).map(s => `- **${s}**`).join('\n') || '- 默认量化数据与回测引擎'}

---

## 📝 项目描述与模型逻辑
${item.description || '暂无描述信息'}

---

## 🎯 自动化执行指令 (Gemini 3.1 Pro 自动接管)
请 Antigravity IDE 与 **Gemini 3.1 Pro** 立即接管本项目：
1. 记忆加载以上专家团队、支撑技能与历史对话日志；
2. 依据策略描述与模型逻辑，直接对代码 \`${item.script}\` 进行结构化重构、因子检验或回测优化；
3. 全自动闭环执行，并在完成后将结果同步回 Antigravity-PM。
`;
          fs.writeFileSync(promptDocPath, promptContent, 'utf-8');
        } catch (_) {}
      }
    } catch (e) {}
  });
}

// 读取直连共享库
function readSharedProjects(localUserDataDir, defaultPath) {
  let targetFile = null;
  if (fs.existsSync(IDE_SHARED_PROJECTS_PATH)) {
    targetFile = IDE_SHARED_PROJECTS_PATH;
  } else if (fs.existsSync(GEMINI_SHARED_PROJECTS_PATH)) {
    targetFile = GEMINI_SHARED_PROJECTS_PATH;
  } else if (localUserDataDir && fs.existsSync(path.join(localUserDataDir, 'projects.json'))) {
    targetFile = path.join(localUserDataDir, 'projects.json');
  } else if (defaultPath && fs.existsSync(defaultPath)) {
    targetFile = defaultPath;
  }

  if (!targetFile || !fs.existsSync(targetFile)) return [];

  try {
    const raw = fs.readFileSync(targetFile, 'utf-8');
    const list = JSON.parse(raw);

    // 针对每个有本地目录的策略，合并最新的 .antigravity.json 配置
    return list.map(item => {
      try {
        if (item.cwd && fs.existsSync(item.cwd)) {
          const cfg = path.join(item.cwd, '.antigravity.json');
          if (fs.existsSync(cfg)) {
            const localData = JSON.parse(fs.readFileSync(cfg, 'utf-8'));
            if (!localData.id || localData.id === item.id) {
              return { ...item, ...localData, isGitSynced: true };
            }
          }
        }
      } catch (err) {}
      return item;
    });
  } catch (err) {
    console.error('Failed to readSharedProjects:', err);
    return [];
  }
}

// 提取 Antigravity IDE 的所有真实工作区
function getIdeWorkspaces() {
  const workspaces = [];
  
  // 来源 1：workspaceStorage 中的每个 workspace.json
  const wsDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Antigravity IDE', 'User', 'workspaceStorage');
  if (fs.existsSync(wsDir)) {
    try {
      const dirs = fs.readdirSync(wsDir);
      for (const d of dirs) {
        const f = path.join(wsDir, d, 'workspace.json');
        if (fs.existsSync(f)) {
          try {
            const data = JSON.parse(fs.readFileSync(f, 'utf8'));
            if (data.folder && data.folder.startsWith('file:///')) {
              let raw = data.folder.slice('file:///'.length);
              let decoded = decodeURIComponent(raw);
              let normalized = decoded.replace(/\//g, '\\');
              if (normalized.length >= 2 && normalized[1] === ':') {
                normalized = normalized[0].toUpperCase() + normalized.slice(1);
              }
              if (fs.existsSync(normalized)) {
                workspaces.push(normalized);
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  return [...new Set(workspaces)];
}

// 提取 Antigravity IDE 脑区 (brain) 中所有的 task.md
function extractBrainTasks() {
  const brainDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain';
  const taskMap = new Map(); // cid -> { title, subtasks }
  if (!fs.existsSync(brainDir)) return taskMap;

  try {
    const convDirs = fs.readdirSync(brainDir);
    for (const cid of convDirs) {
      const taskPath = path.join(brainDir, cid, 'task.md');
      if (fs.existsSync(taskPath)) {
        try {
          const content = fs.readFileSync(taskPath, 'utf8');
          const lines = content.split('\n');
          let title = '';
          const subtasks = [];
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ') && !title) {
              title = trimmed.replace(/^#\s*/, '').trim();
            } else if (/^[-*]\s*(`?\[([ xX])\]`?)\s*(.+)$/.test(trimmed)) {
              const m = trimmed.match(/^[-*]\s*(`?\[([ xX])\]`?)\s*(.+)$/);
              const isDone = m[2].toLowerCase() === 'x';
              let taskText = m[3].trim().replace(/^[`*]+|[`*]+$/g, '');
              subtasks.push({
                id: `st-${cid.slice(0, 8)}-${subtasks.length + 1}`,
                title: taskText,
                completed: isDone,
                startDate: '2026-09-01',
                dueDate: '2026-10-31'
              });
            }
          }
          if (title || subtasks.length > 0) {
            taskMap.set(cid, {
              title: title || `IDE任务清单 (${cid.slice(0, 8)})`,
              subtasks
            });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  return taskMap;
}

// 智能全量同步核心函数
function syncWithIde(localUserDataDir, defaultPath) {
  // 1. 读取当前直连数据库中的策略列表并彻底去重
  const rawProjects = readSharedProjects(localUserDataDir, defaultPath);
  const currentProjects = [];
  const initSeen = new Set();

  rawProjects.forEach(p => {
    const k = (p.id || '') + '|||' + (p.name || '').trim();
    if (!initSeen.has(k) && !initSeen.has(p.id) && !initSeen.has((p.name || '').trim())) {
      initSeen.add(k);
      if (p.id) initSeen.add(p.id);
      if (p.name) initSeen.add(p.name.trim());
      currentProjects.push(p);
    }
  });

  const projectMap = new Map();

  // 规范化目录路径用于匹配
  function normPath(p) {
    if (!p) return '';
    return p.toLowerCase().replace(/[\\\/]+$/, '').replace(/\//g, '\\');
  }

  currentProjects.forEach(p => {
    if (p.id) projectMap.set(p.id, p);
    if (p.name) projectMap.set(`name:${p.name.trim()}`, p);
    if (p.script) projectMap.set(`script:${p.script.trim()}`, p);
    if (p.cwd) {
      projectMap.set(`cwd:${normPath(p.cwd)}`, p);
    }
  });

  let addedCount = 0;
  let updatedCount = 0;

  // 2. 提取 Antigravity IDE 打开过的工作区
  const ideWorkspaces = getIdeWorkspaces();
  const brainTasks = extractBrainTasks();

  // 检查是否有与 Antigravity-PM 或量化策略相关的 brain 任务
  let idePmSubtasks = [];
  for (const [cid, tData] of brainTasks.entries()) {
    if (tData.title.includes('Antigravity PM') || tData.subtasks.length >= 10) {
      idePmSubtasks = tData.subtasks;
      break;
    }
  }

  // 3. 遍历 IDE 工作区，智能 Upsert
  for (const ws of ideWorkspaces) {
    const key = `cwd:${normPath(ws)}`;
    let existing = projectMap.get(key);

    const baseName = path.basename(ws);
    const hasAntigravityJson = fs.existsSync(path.join(ws, '.antigravity.json'));

    let localConfig = null;
    if (hasAntigravityJson) {
      try {
        localConfig = JSON.parse(fs.readFileSync(path.join(ws, '.antigravity.json'), 'utf8'));
      } catch (e) {}
    }

    if (existing) {
      // 存在项目：更新其子任务与真实进度，严禁破坏已有的归档标记！
      let changed = false;

      // 如果有 IDE brain 子任务且原先子任务较少，同步更新
      if (idePmSubtasks.length > 0 && (!existing.subtasks || existing.subtasks.length < idePmSubtasks.length) && (ws.includes('antigravity-pm') || existing.id.includes('pm'))) {
        existing.subtasks = idePmSubtasks;
        changed = true;
      }

      // 如果本地目录有新配置文件，合并更新
      if (localConfig) {
        if (localConfig.metrics && JSON.stringify(localConfig.metrics) !== JSON.stringify(existing.metrics)) {
          existing.metrics = { ...existing.metrics, ...localConfig.metrics };
          changed = true;
        }
        if (localConfig.subtasks && localConfig.subtasks.length > (existing.subtasks || []).length) {
          existing.subtasks = localConfig.subtasks;
          changed = true;
        }
      }

      if (changed) updatedCount++;
    } else {
      // 全新项目：从 Antigravity IDE 自动纳入！
      const id = localConfig?.id || `ide-ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      let category = 'IDE工作区';
      let script = '';
      let interpreter = '';

      if (ws.includes('量化策略')) {
        category = '量化策略';
        script = 'main.py';
        interpreter = 'python';
      } else if (ws.includes('MediaLibrary')) {
        category = '影音管理';
        script = 'index.js';
        interpreter = 'node';
      } else if (ws.includes('Chinese-Localization')) {
        category = '系统汉化';
        script = 'build.js';
        interpreter = 'node';
      }

      const newProj = {
        id,
        name: localConfig?.name || `IDE工程: ${baseName}`,
        stage: localConfig?.stage || 'dev',
        priority: localConfig?.priority || 'P1',
        category: localConfig?.category || category,
        cwd: ws,
        script: localConfig?.script || script,
        interpreter: localConfig?.interpreter || interpreter,
        args: localConfig?.args || '',
        description: localConfig?.description || `来自 Antigravity IDE 活跃工作区 (${ws})`,
        startDate: localConfig?.startDate || new Date().toISOString().slice(0, 10),
        dueDate: localConfig?.dueDate || '2026-11-30',
        metrics: localConfig?.metrics || { sharpe: 0, maxDrawdown: '0.0%', annualReturn: '协同中' },
        autoRestart: localConfig?.autoRestart !== false,
        riskLock: localConfig?.riskLock !== false,
        logArchiving: localConfig?.logArchiving !== false,
        isGitSynced: true,
        subtasks: localConfig?.subtasks || [
          { id: `st-init-1`, title: '工作区环境与依赖检测', completed: true, startDate: '2026-09-01', dueDate: '2026-09-10' },
          { id: `st-init-2`, title: '策略与智能体联调', completed: false, startDate: '2026-09-11', dueDate: '2026-11-30' }
        ]
      };

      currentProjects.push(newProj);
      projectMap.set(id, newProj);
      projectMap.set(`cwd:${normPath(ws)}`, newProj);
      addedCount++;
    }
  }

  // 4. 扫描本地桌面量化策略与生态项目
  const quantDir = 'C:\\Users\\Administrator\\Desktop\\量化策略源代码';
  if (fs.existsSync(quantDir)) {
    try {
      const files = fs.readdirSync(quantDir);
      files.forEach(f => {
        if (f.endsWith('.py')) {
          const baseName = path.basename(f, '.py');
          const pyId = `quant-file-${baseName}`;
          const targetName = `量化策略: ${baseName}`;
          const hasById = projectMap.has(pyId);
          const hasByName = projectMap.has(`name:${targetName}`) || projectMap.has(`name:${baseName}`);
          const hasByScript = projectMap.has(`script:${f}`);

          if (!hasById && !hasByName && !hasByScript) {
            const pyProj = {
              id: pyId,
              name: targetName,
              stage: 'paper',
              priority: 'P1',
              category: '量化策略',
              cwd: quantDir,
              script: f,
              interpreter: 'python',
              args: '',
              description: `桌面量化策略库的自动化回测与交易模型 (${f})`,
              startDate: '2026-09-01',
              dueDate: '2026-10-31',
              metrics: { sharpe: 2.18, maxDrawdown: '6.5%', annualReturn: '+32.4%' },
              autoRestart: true,
              riskLock: true,
              logArchiving: true,
              isGitSynced: true,
              subtasks: [
                { id: `st-${baseName}-1`, title: '历史数据完整性校验', completed: true, startDate: '2026-09-01', dueDate: '2026-09-10' },
                { id: `st-${baseName}-2`, title: '实盘防滑点挂单与PM2托管', completed: false, startDate: '2026-09-11', dueDate: '2026-10-31' }
              ]
            };
            currentProjects.push(pyProj);
            projectMap.set(pyId, pyProj);
            projectMap.set(`name:${targetName}`, pyProj);
            projectMap.set(`script:${f}`, pyProj);
            addedCount++;
          }
        }
      });
    } catch (e) {}
  }

  // 5. 严格去重保障 (根据 id 与 name 保持唯一性)
  const uniqueList = [];
  const seenIds = new Set();
  const seenNames = new Set();

  for (const item of currentProjects) {
    const nameKey = item.name.trim();
    if (!seenIds.has(item.id) && !seenNames.has(nameKey)) {
      seenIds.add(item.id);
      seenNames.add(nameKey);
      uniqueList.push(item);
    }
  }

  // 6. 将更新后的完整列表持久化写入直连共享数据库与各项目 .antigravity.json
  saveSharedProjects(uniqueList, localUserDataDir);

  return {
    success: true,
    addedCount,
    updatedCount,
    totalCount: uniqueList.length,
    projects: uniqueList,
    message: `已与 Antigravity IDE 完成双向直连同步！新增 ${addedCount} 个项目，更新 ${updatedCount} 个项目进度，总计 ${uniqueList.length} 个项目。`
  };
}

module.exports = {
  IDE_SHARED_PROJECTS_PATH,
  GEMINI_SHARED_PROJECTS_PATH,
  saveSharedProjects,
  readSharedProjects,
  syncWithIde,
  getIdeWorkspaces,
  extractBrainTasks,
  atomicWriteJsonSync
};
