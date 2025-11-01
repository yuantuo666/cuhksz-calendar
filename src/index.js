/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/**
 * 将 "YYYY-MM-DD"（或 "YYYY-MM-DD HH:mm:ss"）格式的字符串转换为 ICS 需要的 "YYYYMMDD" 或 "YYYYMMDDT000000Z"
 */
function formatDate(dateStr, allDay = true) {
	const [datePart, timePart] = dateStr.split(' ');
	const [y, m, d] = datePart.split('-');
	if (allDay) {
		// 全日事件: 只要日期部分，DTEND 在 ICS 中按标准要写到结束日的下一天
		return `${y}${m}${d}`;
	} else {
		// 带时间的事件：假设 timePart 存在，否则默认为 00:00:00
		const [hh, mm, ss] = (timePart || '00:00:00').split(':');
		// 这里没有做时区转换，直接当做 UTC 时间输出
		return `${y}${m}${d}T${hh}${mm}${ss}Z`;
	}
}

/**
 * 生成 ICS 文件文本
 * @param {Object} json 后端返回的整个对象
 * @returns {string} ICS 文件内容
 */
function generateICS(json) {
	const { calendars } = json.data;
	const lines = [];

	// 头部
	lines.push('BEGIN:VCALENDAR');
	lines.push('VERSION:2.0');
	lines.push('PRODID:-//yuantuo666//School Calendar//ZH');
	lines.push('CALSCALE:GREGORIAN');

	calendars.forEach(item => {
		const uid = `cal-${item.id}@cuhk.edu.cn`;
		const summary = item.dateName;
		const description = item.note || '';
		const categories = item.code; // 可以依据需要映射颜色

		// 全日事件：DTSTART = startDate, DTEND = 结束日下一天
		const dtStart = formatDate(item.startDate, true);
		// 计算结束日下一天
		const end = new Date(item.endDate);
		end.setDate(end.getDate() + 1);
		const yyyy = end.getFullYear().toString().padStart(4, '0');
		const mm = (end.getMonth() + 1).toString().padStart(2, '0');
		const dd = end.getDate().toString().padStart(2, '0');
		const dtEnd = `${yyyy}${mm}${dd}`;

		lines.push('BEGIN:VEVENT');
		lines.push(`UID:${uid}`);
		lines.push(`SUMMARY:${description ?? summary}`);
		if (description) lines.push(`DESCRIPTION:${summary}`);
		lines.push(`CATEGORIES:${categories}`);
		lines.push(`DTSTAMP:${formatDate(new Date().toISOString(), false)}`);
		lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
		lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
		lines.push('END:VEVENT');
	});

	// 尾部
	lines.push('END:VCALENDAR');

	return lines.join('\r\n');
}

import template from './template.js';

const RETRY_COUNT = 5;

async function fetchCalendarData(url, options = {}, retries = RETRY_COUNT) {
	let lastError;
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				throw new Error(`Fetch failed with status: ${response.status}`);
			}
			const text = await response.text();
			try {
				return JSON.parse(text);
			} catch (parseError) {
				throw new Error(`Invalid JSON: ${text}`);
			}
		} catch (err) {
			lastError = err;
			console.warn(`Attempt ${attempt} failed: ${err.message}`);
			if (attempt < retries) {
				await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
			}
		}
	}
	throw lastError;
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const language = request.headers.get('Accept-Language') || request.headers.get('accept-language') || 'en';
		const language_code = language.toUpperCase().includes('ZH') ? 'ZH' : 'EN';
		switch (url.pathname) {
			case '/cal.ics':
				const apiUrl = `https://mobile.cuhk.edu.cn/api/work/sc/scCalendar/getAppCalendar?type=current&lang=${language_code}`;

				let data;
				try {
					data = await fetchCalendarData(apiUrl);
				} catch (err) {
					console.error('Failed after retries:', err.message);
					return new Response(`Error retrieving calendar data: ${err.message}`, { status: 502 });
				}

				return new Response(generateICS(data), {
					status: 200,
					headers: { 'Content-Type': 'text/calendar' },
				});
			case '/':
			default:
				const ics_path = `${url.origin}/cal.ics`;
				return new Response(template(ics_path), { status: 200, headers: { "Content-Type": "text/html; charset=UTF-8" } });
		}
	},
};
