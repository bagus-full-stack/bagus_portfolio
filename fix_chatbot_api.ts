import fs from 'fs'

const file = 'src/components/ChatbotWidget.tsx'
let data = fs.readFileSync(file, 'utf8')

const oldCode = `      if (!supabase) throw new Error("Supabase not configured");
      const { data, error: invokeError } = await supabase.functions.invoke('chat-resume', {
        body: { message: trimmedText, history: messages.slice(-10) },
        signal: abortControllerRef.current.signal
      } as any);
      
      if (invokeError) throw invokeError;`

const newCode = `      const res = await fetch('/api/chat-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedText, history: messages.slice(-10) }),
        signal: abortControllerRef.current.signal
      });
      
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();`

data = data.replace(oldCode, newCode)

fs.writeFileSync(file, data)
