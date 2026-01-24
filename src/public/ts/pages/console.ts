export function initConsolePage() {
  const btn = document.getElementById('ping-btn');
  const input = document.getElementById('ping-input') as HTMLInputElement;
  const output = document.getElementById('console-output')!;

  btn?.addEventListener('click', () => {
    const host = input.value.trim() || 'google.com';
    output.textContent = `Starting ping to ${host}...\n`;

    const eventSource = new EventSource(`/api/ping.php?host=${encodeURIComponent(host)}`);
    
    eventSource.onmessage = (e) => {
      output.textContent += e.data + '\n';
      output.scrollTop = output.scrollHeight;
    };

    eventSource.onerror = () => {
      eventSource.close();
      output.textContent += '\n[Connection closed]\n';
    };
  });
}