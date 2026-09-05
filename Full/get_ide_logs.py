import sqlite3, glob, os, json, sys
sys.stdout.reconfigure(encoding='utf-8')

def extract_logs(proj_name, limit=50):
    conv_dir = r'C:\Users\Administrator\.gemini\antigravity-ide\conversations'
    if not os.path.exists(conv_dir):
        return {'success': True, 'conversations': []}
        
    db_files = glob.glob(os.path.join(conv_dir, '*.db'))
    if not db_files:
        return {'success': True, 'conversations': []}
        
    db_files.sort(key=os.path.getmtime, reverse=True)
    target_db = db_files[0]
    
    try:
        conn = sqlite3.connect(target_db)
        c = conn.cursor()
        c.execute("SELECT idx, step_type, step_payload FROM steps ORDER BY idx ASC")
        rows = c.fetchall()
        conn.close()
    except Exception as e:
        return {'success': False, 'error': str(e), 'conversations': []}
    
    conversations = []
    for idx, stype, payload in rows:
        if not payload:
            continue
            
        cur = bytearray()
        chunks = []
        for b in payload:
            if b < 0x20 and b not in (9, 10, 13):
                if len(cur) > 2:
                    try:
                        s = cur.decode('utf-8')
                        if any('\u4e00' <= ch <= '\u9fff' for ch in s) and len(s) > 2:
                            chunks.append(s.strip())
                    except:
                        pass
                cur = bytearray()
            else:
                cur.append(b)
        if cur and len(cur) > 2:
            try:
                s = cur.decode('utf-8')
                if any('\u4e00' <= ch <= '\u9fff' for ch in s) and len(s) > 2:
                    chunks.append(s.strip())
            except:
                pass
                
        if stype == 14: # User input
            for chunk in chunks:
                if not chunk.startswith('{"') and not chunk.startswith('http') and not chunk.startswith('file://'):
                    clean = chunk.rstrip('"').strip()
                    if len(clean) >= 2:
                        conversations.append({'role': 'user', 'text': clean, 'idx': idx})
                        break
        elif stype in (11, 12, 13, 15, 98): # Model response
            for chunk in chunks:
                if len(chunk) > 30 and not chunk.startswith('{"') and not chunk.startswith('http') and not chunk.startswith('file://'):
                    clean = chunk.strip()
                    conversations.append({'role': 'assistant', 'text': clean[:400] + ('...' if len(clean) > 400 else ''), 'idx': idx})
                    break
                    
    return {'success': True, 'conversations': conversations[-limit:]}

if __name__ == '__main__':
    try:
        raw_proj = sys.argv[1] if len(sys.argv) > 1 else ''
        # 清洗控制字符与 NUL 字节防御
        proj = ''.join(ch for ch in raw_proj if ord(ch) >= 32 or ch in ('\t', '\n', '\r'))
        res = extract_logs(proj)
        print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e), 'conversations': []}, ensure_ascii=False))
