export default function template(ics_file)
{
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CUHK(SZ) Calendar ICS Generator</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f5f7fa;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .container {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    .container h1 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    .link-input-wrapper {
      display: flex;
      margin-top: 1rem;
    }
    .link-input-wrapper input {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.95rem;
      border: 1px solid #ccc;
      border-radius: 4px 0 0 4px;
      outline: none;
    }
    .link-input-wrapper button {
      padding: 0 1rem;
      background-color: #0073e6;
      border: none;
      color: #fff;
      font-size: 0.95rem;
      cursor: pointer;
      border-radius: 0 4px 4px 0;
      transition: background-color 0.2s;
    }
    .link-input-wrapper button:hover {
      background-color: #005bb5;
    }
    .copy-success {
      margin-top: 0.75rem;
      font-size: 0.9rem;
      color: #28a745;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .copy-success.show {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>CUHK(SZ) Calendar ICS Generator</h1>
    <p>Use following link to subscribe! Data source: WeCom (企业微信).</p>
    <div class="link-input-wrapper">
      <input type="text" id="icsLink" readonly value="${ics_file}" />
      <button id="copyBtn">Copy</button>
    </div>
    <div id="msg" class="copy-success">Success!</div>
  </div>

  <script>
    const copyBtn = document.getElementById('copyBtn');
    const icsLink = document.getElementById('icsLink');
    const msg = document.getElementById('msg');

    copyBtn.addEventListener('click', () => {
      icsLink.select();
      icsLink.setSelectionRange(0, 99999); // for mobile
      try {
        document.execCommand('copy');
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 2000);
      } catch (err) {
        alert('Failed, please copy manually.');
      }
    });
  </script>
</body>
</html>
`;
}