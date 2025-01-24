document.addEventListener('DOMContentLoaded', function() {
    const curlInput = document.getElementById('curlInput');
    const pythonOutput = document.getElementById('pythonOutput');
    const convertBtn = document.getElementById('convertBtn');
    const formatBtn = document.getElementById('formatBtn');
    const copyBtn = document.getElementById('copyBtn');
    const librarySelect = document.getElementById('librarySelect');
    const styleSelect = document.getElementById('styleSelect');

    // 转换CURL命令
    convertBtn.addEventListener('click', () => {
        const curl = curlInput.value.trim();
        if (!curl) {
            showTooltip(convertBtn, '请输入CURL命令');
            return;
        }

        try {
            const python = convertCurlToPython(curl);
            pythonOutput.textContent = python;
            hljs.highlightElement(pythonOutput);
        } catch (e) {
            showTooltip(convertBtn, '转换失败：' + e.message);
        }
    });

    // 格式化CURL命令
    formatBtn.addEventListener('click', () => {
        const curl = curlInput.value.trim();
        if (!curl) {
            showTooltip(formatBtn, '请输入CURL命令');
            return;
        }

        try {
            const formatted = formatCurl(curl);
            curlInput.value = formatted;
        } catch (e) {
            showTooltip(formatBtn, '格式化失败：' + e.message);
        }
    });

    // 复制Python代码
    copyBtn.addEventListener('click', () => {
        const code = pythonOutput.textContent;
        if (!code) {
            showTooltip(copyBtn, '没有可复制的内容');
            return;
        }

        navigator.clipboard.writeText(code)
            .then(() => showTooltip(copyBtn, '已复制'))
            .catch(() => showTooltip(copyBtn, '复制失败'));
    });

    // 转换CURL为Python代码
    function convertCurlToPython(curl) {
        // 解析CURL命令
        const {method, url, headers, data} = parseCurl(curl);
        const library = librarySelect.value;
        const style = styleSelect.value;

        // 根据选择的库生成代码
        switch (library) {
            case 'requests':
                return generateRequestsCode(method, url, headers, data, style);
            case 'urllib':
                return generateUrllibCode(method, url, headers, data, style);
            case 'http.client':
                return generateHttpClientCode(method, url, headers, data, style);
            default:
                throw new Error('不支持的HTTP库');
        }
    }

    // 解析CURL命令
    function parseCurl(curl) {
        const result = {
            method: 'GET',
            url: '',
            headers: {},
            data: null
        };

        // 移除开头的 'curl' 并分割命令
        const parts = curl.replace(/^\s*curl\s+/, '')
            .match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

        let i = 0;
        while (i < parts.length) {
            const part = parts[i];
            
            if (part === '-X' || part === '--request') {
                result.method = parts[++i];
            }
            else if (part === '-H' || part === '--header') {
                const header = parts[++i].replace(/^['"]|['"]$/g, '');
                const [key, ...value] = header.split(':');
                result.headers[key.trim()] = value.join(':').trim();
            }
            else if (part === '-d' || part === '--data' || part === '--data-raw') {
                result.data = parts[++i].replace(/^['"]|['"]$/g, '');
                if (!result.headers['Content-Type']) {
                    result.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            }
            else if (part === '--json') {
                result.data = parts[++i].replace(/^['"]|['"]$/g, '');
                result.headers['Content-Type'] = 'application/json';
            }
            else if (!part.startsWith('-')) {
                result.url = part.replace(/^['"]|['"]$/g, '');
            }
            i++;
        }

        return result;
    }

    // 生成requests库代码
    function generateRequestsCode(method, url, headers, data, style) {
        const lines = ['import requests\n'];
        
        if (style === 'detailed') {
            // 详细模式：分别定义变量
            lines.push(`url = '${url}'`);
            
            if (Object.keys(headers).length > 0) {
                lines.push('headers = {');
                Object.entries(headers).forEach(([key, value]) => {
                    lines.push(`    '${key}': '${value}',`);
                });
                lines.push('}');
            }

            if (data) {
                if (headers['Content-Type']?.includes('json')) {
                    lines.push('data = ' + formatJson(data));
                } else {
                    lines.push(`data = '${data}'`);
                }
            }

            lines.push('\ntry:');
            let requestLine = '    response = requests.';
            requestLine += method.toLowerCase() + '(url';
            if (Object.keys(headers).length > 0) requestLine += ', headers=headers';
            if (data) requestLine += ', data=data';
            requestLine += ')';
            lines.push(requestLine);
            
            lines.push('    response.raise_for_status()');
            lines.push('    print(response.text)');
            lines.push('except requests.exceptions.RequestException as e:');
            lines.push('    print(f"请求失败: {e}")');
        } else {
            // 简洁模式：直接调用
            let requestLine = 'response = requests.' + method.toLowerCase() + `('${url}'`;
            
            if (Object.keys(headers).length > 0) {
                requestLine += ', headers={';
                Object.entries(headers).forEach(([key, value], index, arr) => {
                    requestLine += `'${key}': '${value}'${index < arr.length - 1 ? ', ' : ''}`;
                });
                requestLine += '}';
            }

            if (data) {
                if (headers['Content-Type']?.includes('json')) {
                    requestLine += ', data=' + formatJson(data);
                } else {
                    requestLine += `, data='${data}'`;
                }
            }

            requestLine += ')';
            lines.push(requestLine);
            lines.push('print(response.text)');
        }

        return lines.join('\n');
    }

    // 生成urllib库代码
    function generateUrllibCode(method, url, headers, data, style) {
        const lines = [
            'from urllib import request, parse',
            'import json\n'
        ];

        if (style === 'detailed') {
            lines.push(`url = '${url}'`);
            
            if (Object.keys(headers).length > 0) {
                lines.push('headers = {');
                Object.entries(headers).forEach(([key, value]) => {
                    lines.push(`    '${key}': '${value}',`);
                });
                lines.push('}');
            }

            if (data) {
                if (headers['Content-Type']?.includes('json')) {
                    lines.push('data = json.dumps(' + formatJson(data) + ').encode()');
                } else {
                    lines.push(`data = '${data}'.encode()`);
                }
            }

            lines.push('\ntry:');
            lines.push('    req = request.Request(');
            lines.push(`        url,`);
            if (data) lines.push('        data=data,');
            if (Object.keys(headers).length > 0) lines.push('        headers=headers,');
            lines.push(`        method='${method}'`);
            lines.push('    )');
            lines.push('    with request.urlopen(req) as response:');
            lines.push('        print(response.read().decode())');
            lines.push('except Exception as e:');
            lines.push('    print(f"请求失败: {e}")');
        } else {
            let reqLine = 'req = request.Request(';
            reqLine += `'${url}'`;
            
            if (data) {
                if (headers['Content-Type']?.includes('json')) {
                    reqLine += ', data=json.dumps(' + formatJson(data) + ').encode()';
                } else {
                    reqLine += `, data='${data}'.encode()`;
                }
            }

            if (Object.keys(headers).length > 0) {
                reqLine += ', headers={';
                Object.entries(headers).forEach(([key, value], index, arr) => {
                    reqLine += `'${key}': '${value}'${index < arr.length - 1 ? ', ' : ''}`;
                });
                reqLine += '}';
            }

            reqLine += `, method='${method}')`;
            lines.push(reqLine);
            lines.push('response = request.urlopen(req)');
            lines.push('print(response.read().decode())');
        }

        return lines.join('\n');
    }

    // 生成http.client库代码
    function generateHttpClientCode(method, url, headers, data, style) {
        const lines = ['import http.client\n'];
        
        // 解析URL
        const urlObj = new URL(url);
        const path = urlObj.pathname + urlObj.search;

        if (style === 'detailed') {
            lines.push(`host = '${urlObj.host}'`);
            lines.push(`path = '${path}'`);
            
            if (Object.keys(headers).length > 0) {
                lines.push('headers = {');
                Object.entries(headers).forEach(([key, value]) => {
                    lines.push(`    '${key}': '${value}',`);
                });
                lines.push('}');
            }

            if (data) {
                if (headers['Content-Type']?.includes('json')) {
                    lines.push('data = ' + formatJson(data));
                } else {
                    lines.push(`data = '${data}'`);
                }
            }

            lines.push('\ntry:');
            lines.push('    conn = http.client.HTTPSConnection(host)');
            let requestLine = '    conn.request(';
            requestLine += `'${method}', path`;
            if (data) requestLine += ', data';
            if (Object.keys(headers).length > 0) requestLine += ', headers';
            requestLine += ')';
            lines.push(requestLine);
            
            lines.push('    response = conn.getresponse()');
            lines.push('    print(response.read().decode())');
            lines.push('except Exception as e:');
            lines.push('    print(f"请求失败: {e}")');
            lines.push('finally:');
            lines.push('    conn.close()');
        } else {
            lines.push(`conn = http.client.HTTPSConnection('${urlObj.host}')`);
            
            let requestLine = 'conn.request(';
            requestLine += `'${method}', '${path}'`;
            
            if (data) {
                if (headers['Content-Type']?.includes('json')) {
                    requestLine += ', ' + formatJson(data);
                } else {
                    requestLine += `, '${data}'`;
                }
            }

            if (Object.keys(headers).length > 0) {
                requestLine += ', {';
                Object.entries(headers).forEach(([key, value], index, arr) => {
                    requestLine += `'${key}': '${value}'${index < arr.length - 1 ? ', ' : ''}`;
                });
                requestLine += '}';
            }

            requestLine += ')';
            lines.push(requestLine);
            lines.push('response = conn.getresponse()');
            lines.push('print(response.read().decode())');
            lines.push('conn.close()');
        }

        return lines.join('\n');
    }

    // 格式化CURL命令
    function formatCurl(curl) {
        const {method, url, headers, data} = parseCurl(curl);
        const parts = ['curl'];

        if (method !== 'GET') {
            parts.push(`-X ${method}`);
        }

        parts.push(`'${url}'`);

        Object.entries(headers).forEach(([key, value]) => {
            parts.push(`-H '${key}: ${value}'`);
        });

        if (data) {
            if (headers['Content-Type']?.includes('json')) {
                parts.push(`--json '${formatJson(data)}'`);
            } else {
                parts.push(`-d '${data}'`);
            }
        }

        return parts.join(' \\\n    ');
    }

    // 格式化JSON字符串
    function formatJson(str) {
        try {
            return JSON.stringify(JSON.parse(str), null, 4);
        } catch {
            return str;
        }
    }

    // 显示提示
    function showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;

            setTimeout(() => {
            tooltip.remove();
            }, 2000);
    }
}); 